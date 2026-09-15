import joblib
import pandas as pd
import numpy as np
from fastapi import HTTPException
from core.config import *
from services.weather_service import weather_df
from schemas.dto import CustomPredictionInput

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

def get_model_metrics_service():
    return {
        "classification_model": type(clf).__name__ if clf else "None",
        "regression_model": type(reg).__name__ if reg else "None",
        "features": feature_columns or [],
        "feature_count": len(feature_columns) if feature_columns else 0,
        "target_classification": "rain_tomorrow (0 = No Rain, 1 = Rain)",
        "target_regression": "rainfall_amount_tomorrow (mm)",
        "dataset_summary": {
            "total_rows": len(weather_df) if weather_df is not None else 0,
            "cities": int(weather_df["city"].nunique()) if weather_df is not None else 0,
            "start_date": weather_df["time"].min().strftime("%Y-%m-%d") if weather_df is not None else None,
            "end_date": weather_df["time"].max().strftime("%Y-%m-%d") if weather_df is not None else None
        }
    }

def predict_custom_service(data: CustomPredictionInput):
    if clf is None or reg is None:
        raise HTTPException(status_code=500, detail="ML models are not loaded.")

    season = 1 if data.month in [12, 1, 2] else (2 if data.month in [3, 4, 5] else (3 if data.month in [6, 7, 8, 9] else 4))
    
    lat, lon, elev = data.latitude, data.longitude, data.elevation
    if (lat is None or lon is None or elev is None) and weather_df is not None:
        city_rows = weather_df[weather_df["city"].str.lower() == data.city.strip().lower()]
        if not city_rows.empty:
            first_row = city_rows.iloc[0]
            lat = lat if lat is not None else float(first_row.get("latitude", 6.9))
            lon = lon if lon is not None else float(first_row.get("longitude", 79.9))
            elev = elev if elev is not None else float(first_row.get("elevation", 15.0))
        else:
            lat, lon, elev = lat or 6.9, lon or 79.9, elev or 15.0
    else:
        lat, lon, elev = lat or 6.9, lon or 79.9, elev or 15.0

    gusts = data.windgusts_10m_max if data.windgusts_10m_max is not None else data.windspeed_10m_max * 1.35
    temp_apparent_interaction = data.temperature_2m_mean * data.apparent_temperature_mean
    wind_cat = 0 if data.windspeed_10m_max <= 10 else (1 if data.windspeed_10m_max <= 20 else 2)

    features_dict = {
        "temperature_2m_mean": [data.temperature_2m_mean],
        "temperature_2m_max": [data.temperature_2m_max],
        "temperature_2m_min": [data.temperature_2m_min],
        "apparent_temperature_mean": [data.apparent_temperature_mean],
        "windspeed_10m_max": [data.windspeed_10m_max],
        "windgusts_10m_max": [gusts],
        "winddirection_10m_dominant": [data.winddirection_10m_dominant],
        "precipitation_hours": [data.precipitation_hours],
        "latitude": [lat],
        "longitude": [lon],
        "elevation": [elev],
        "month": [data.month],
        "season": [season],
        "rolling_rainfall": [data.rolling_rainfall],
        "rainfall_lag_1": [data.rainfall_lag_1],
        "temp_diff": [data.temp_diff],
        "wind_change": [data.wind_change],
        "temp_apparent_temp_interaction": [temp_apparent_interaction],
        "wind_category": [wind_cat]
    }

    input_df = pd.DataFrame(features_dict)[feature_columns]

    try:
        rain_pred = int(clf.predict(input_df)[0])
        rain_prob = float(clf.predict_proba(input_df)[0][1]) * 100
        rainfall_amount = max(0.0, float(reg.predict(input_df)[0]))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Custom prediction failed: {str(e)}")

    return {
        "city": data.city,
        "simulated": True,
        "rain_tomorrow": "YES" if rain_pred == 1 else "NO",
        "probability": round(rain_prob, 2),
        "rainfall_mm": round(rainfall_amount, 2),
        "season": season,
        "input_features": features_dict
    }

def predict_batch_service(cities: list, date: str):
    results = []
    for city in cities:
        try:
            # Re-use the existing predict_rainfall_service
            pred = predict_rainfall_service(city, date)
            results.append(pred)
        except HTTPException as he:
            results.append({"city": city, "date": date, "error": he.detail, "status": "error"})
        except Exception as e:
            results.append({"city": city, "date": date, "error": str(e), "status": "error"})
    
    return {
        "date": date,
        "count": len(results),
        "predictions": results
    }