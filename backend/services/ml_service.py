import joblib
import pandas as pd
import numpy as np
from fastapi import HTTPException
from core.config import *
from services.weather_service import weather_df

clf, reg, feature_columns = None, None, None
crop_clf, crop_scaler, crop_le = None, None, None

# Load Models on Startup
try:
    clf = joblib.load(CLASSIFIER_PATH)
    reg = joblib.load(REGRESSOR_PATH)
    feature_columns = joblib.load(FEATURES_PATH)
    crop_clf = joblib.load(CROP_CLF_PATH)
    crop_scaler = joblib.load(CROP_SCALER_PATH)
    crop_le = joblib.load(CROP_LE_PATH)
    print("All ML Models loaded successfully in ML Service!")
except Exception as e:
    print("ERROR: Could not load models.", e)

def predict_rainfall_service(city: str, date: str):
    if clf is None or reg is None or weather_df is None:
        raise HTTPException(status_code=500, detail="System not ready.")
    try:
        req_date = pd.to_datetime(date)
    except:
        raise HTTPException(status_code=400, detail="Invalid date.")
        
    city_matches = weather_df[weather_df["city"].str.lower() == city.strip().lower()]
    if city_matches.empty:
        raise HTTPException(status_code=404, detail="City not found.")
        
    matching_rows = city_matches[city_matches["time"] == req_date]
    if matching_rows.empty:
        raise HTTPException(status_code=404, detail="No weather record found.")
        
    selected_row = matching_rows.iloc[0]
    next_day = req_date + pd.Timedelta(days=1)
    
    if city_matches[city_matches["time"] == next_day].empty:
        raise HTTPException(status_code=400, detail="No following-day record available.")
        
    input_df = pd.DataFrame([selected_row])[feature_columns]
    
    try:
        rain_pred = int(clf.predict(input_df)[0])
        rain_prob = float(clf.predict_proba(input_df)[0][1]) * 100
        rain_mm = max(0.0, float(reg.predict(input_df)[0]))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return {
        "city": city, "date": date, "prediction_for": next_day.strftime("%Y-%m-%d"),
        "rain_tomorrow": "YES" if rain_pred == 1 else "NO",
        "probability": round(rain_prob, 2), "rainfall_mm": round(rain_mm, 2)
    }

def predict_all_cities_service(date: str):
    if clf is None or weather_df is None:
        raise HTTPException(status_code=500, detail="System not ready.")
    try:
        req_date = pd.to_datetime(date)
    except:
        raise HTTPException(status_code=400, detail="Invalid date.")
        
    day_data = weather_df[weather_df["time"] == req_date]
    if day_data.empty:
        raise HTTPException(status_code=404, detail="No data available.")
        
    predictions = []
    for _, row in day_data.iterrows():
        try:
            input_df = pd.DataFrame([row])[feature_columns]
            rain_pred = int(clf.predict(input_df)[0])
            predictions.append({"city": row["city"], "rain_tomorrow": "YES" if rain_pred == 1 else "NO"})
        except:
            continue
            
    return {
        "date": date,
        "prediction_for": (req_date + pd.Timedelta(days=1)).strftime("%Y-%m-%d"),
        "total_cities": len(predictions),
        "predictions": predictions
    }

def smart_recommendation_service(city: str, season: str):
    if reg is None or crop_clf is None or weather_df is None:
        raise HTTPException(status_code=500, detail="Models/Dataset not loaded.")
    
    city_lower = city.strip().lower()
    season_lower = season.strip().lower()
    
    if season_lower not in ["maha", "yala"]:
        raise HTTPException(status_code=400, detail="Season must be 'maha' or 'yala'.")
        
    # Get the parent district for weather, and the exact local soil profile
    main_district, soil_data = get_location_details(city_lower)
        
    # Find weather for the parent district
    city_matches = weather_df[weather_df["city"].str.lower() == main_district]
    if city_matches.empty:
        raise HTTPException(status_code=404, detail=f"Weather data for parent district '{main_district.capitalize()}' not found.")
        
    season_months = [9, 10, 11, 12, 1, 2, 3] if season_lower == "maha" else [5, 6, 7, 8]
    season_data = city_matches[city_matches["time"].dt.month.isin(season_months)]
    
    if season_data.empty:
        raise HTTPException(status_code=404, detail="No seasonal data found.")
        
    rep_row = season_data[feature_columns].mean().to_frame().T
    
    try:
        # Predict Weather
        daily_rain = max(0.0, float(reg.predict(rep_row)[0]))
        monthly_rain = daily_rain * 30
        temp = float(season_data["temperature_2m_mean"].mean())
        
        # Calculate Crop Features
        thi = temp * soil_data["humidity"]
        total_npk = soil_data["N"] + soil_data["P"] + soil_data["K"]
        ph_cat = 0 if soil_data["ph"] <= 5.5 else (1 if soil_data["ph"] <= 7.5 else 2)
        log_rain = np.log1p(monthly_rain)
        
        crop_feats = np.array([[soil_data["N"], soil_data["P"], soil_data["K"], temp, soil_data["humidity"], soil_data["ph"], monthly_rain, thi, total_npk, ph_cat, log_rain]])
        scaled_feats = crop_scaler.transform(crop_feats)
        
        # --- Get Top 3 Recommendations ---
        probabilities = crop_clf.predict_proba(scaled_feats)[0]
        # Sort indices by probability in descending order and get top 3
        top_3_indices = np.argsort(probabilities)[-3:][::-1]
        
        recommended_crops = []
        for idx in top_3_indices:
            crop_name = crop_le.inverse_transform([idx])[0].upper()
            confidence = round(probabilities[idx] * 100, 2)
            if confidence > 0:
                recommended_crops.append({
                    "crop": crop_name,
                    "confidence_percentage": confidence
                })
        
        return {
            "searched_area": city.capitalize(),
            "weather_source": main_district.capitalize(),
            "season": "Maha" if season_lower == "maha" else "Yala",
            "weather_forecast": {
                "avg_temp_c": round(temp, 2), 
                "est_monthly_rain_mm": round(monthly_rain, 2)
            },
            "soil_profile": soil_data,
            "smart_recommendations": recommended_crops
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))