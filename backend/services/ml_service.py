import joblib
import requests
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

def get_live_cities_overview_service():
    if clf is None or reg is None or weather_df is None:
        raise HTTPException(status_code=500, detail="Models/Dataset not loaded.")

    wet_zone = {
        "Colombo", "Galle", "Matara", "Kalutara", "Ratnapura", "Kandy", "Hatton",
        "Gampaha", "Maharagama", "Moratuwa", "Mount Lavinia", "Kesbewa", "Kolonnawa",
        "Sri Jayewardenepura Kotte", "Weligama", "Athurugiriya", "Mabole", "Oruwala"
    }
    dry_zone = {"Jaffna", "Mannar", "Trincomalee", "Kalmunai", "Hambantota", "Puttalam"}

    cities_info = []
    lats = []
    lons = []
    elevs = []

    # Get base details for all 30 cities
    grouped = weather_df.groupby("city")
    for city_name, group in grouped:
        first = group.iloc[0]
        lats.append(str(round(float(first["latitude"]), 4)))
        lons.append(str(round(float(first["longitude"]), 4)))
        elevs.append(str(round(float(first["elevation"]), 1)))
        
        zone = "Wet Zone" if city_name in wet_zone else ("Dry Zone" if city_name in dry_zone else "Intermediate Zone")
        cities_info.append({
            "city": city_name,
            "latitude": float(first["latitude"]),
            "longitude": float(first["longitude"]),
            "elevation": float(first["elevation"]),
            "zone": zone,
            "avg_daily_rainfall_mm": round(float(group["rain_sum"].mean()), 2),
            "avg_temp": round(float(group["temperature_2m_mean"].mean()), 1)
        })

    # Fetch live data for all 30 cities in ONE single API call (Super Fast!)
    lat_str = ",".join(lats)
    lon_str = ",".join(lons)
    elev_str = ",".join(elevs)

    url = (f"https://api.open-meteo.com/v1/forecast?latitude={lat_str}&longitude={lon_str}&elevation={elev_str}"
           f"&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,"
           f"rain_sum,precipitation_hours,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant"
           f"&timezone=Asia%2FColombo&past_days=10&forecast_days=2")

    try:
        res = requests.get(url, timeout=15)
        res_data = res.json()
        if not isinstance(res_data, list):
            res_data = [res_data]
        is_live = True
    except Exception as e:
        print("Failed to fetch live overview data:", e)
        res_data = []
        is_live = False

    # Helper to assign weather tokens for frontend icons
    def get_weather_token(pred_rain_mm, max_temp):
        if pred_rain_mm <= 0.1:
            return "hot" if max_temp > 32.0 else "clear"
        elif pred_rain_mm <= 35:
            return "rainy"
        else:
            return "severe"

    overview = []
    
    # Run ML Predictions for all 30 cities
    for idx, c_info in enumerate(cities_info):
        if is_live and idx < len(res_data) and "daily" in res_data[idx]:
            try:
                daily_data = res_data[idx]["daily"]
                df_live = pd.DataFrame(daily_data)

                df_live["temperature_2m_mean"] = (df_live["temperature_2m_max"] + df_live["temperature_2m_min"]) / 2
                df_live["apparent_temperature_mean"] = (df_live["apparent_temperature_max"] + df_live["apparent_temperature_min"]) / 2
                df_live["rolling_rainfall"] = df_live["rain_sum"].shift(1).rolling(window=7, min_periods=1).sum()
                df_live["rainfall_lag_1"] = df_live["rain_sum"].shift(1)
                df_live["temp_diff"] = df_live["temperature_2m_mean"].diff()
                df_live["wind_change"] = df_live["windspeed_10m_max"].diff()
                df_live["temp_apparent_temp_interaction"] = df_live["temperature_2m_mean"] * df_live["apparent_temperature_mean"]

                def build_model_input(row):
                    month = pd.to_datetime(row["time"]).month
                    season = 1 if month in [12, 1, 2] else (2 if month in [3, 4, 5] else (3 if month in [6, 7, 8, 9] else 4))
                    wind_speed = row["windspeed_10m_max"]
                    wind_cat = 0 if wind_speed <= 10 else (1 if wind_speed <= 20 else 2)
                    
                    features_dict = {
                        "temperature_2m_mean": row["temperature_2m_mean"],
                        "temperature_2m_max": row["temperature_2m_max"],
                        "temperature_2m_min": row["temperature_2m_min"],
                        "apparent_temperature_mean": row["apparent_temperature_mean"],
                        "windspeed_10m_max": wind_speed,
                        "windgusts_10m_max": row["windgusts_10m_max"],
                        "winddirection_10m_dominant": row["winddirection_10m_dominant"],
                        "precipitation_hours": row["precipitation_hours"],
                        "latitude": c_info["latitude"],
                        "longitude": c_info["longitude"],
                        "elevation": c_info["elevation"],
                        "month": month,
                        "season": season,
                        "rolling_rainfall": row["rolling_rainfall"],
                        "rainfall_lag_1": row["rainfall_lag_1"],
                        "temp_diff": row["temp_diff"],
                        "wind_change": row["wind_change"],
                        "temp_apparent_temp_interaction": row["temp_apparent_temp_interaction"],
                        "wind_category": wind_cat
                    }
                    return pd.DataFrame([features_dict])[feature_columns]

                yesterday_row = df_live.iloc[-3]
                today_row = df_live.iloc[-2]

                # Predict TODAY
                input_today = build_model_input(yesterday_row)
                rain_prob_today = float(clf.predict_proba(input_today)[0][1]) * 100
                rain_mm_today = max(0.0, float(reg.predict(input_today)[0]))
                cond_today = get_weather_token(rain_mm_today, yesterday_row["temperature_2m_max"])

                # Predict TOMORROW
                input_tom = build_model_input(today_row)
                rain_prob_tom = float(clf.predict_proba(input_tom)[0][1]) * 100
                rain_mm_tom = max(0.0, float(reg.predict(input_tom)[0]))
                cond_tom = get_weather_token(rain_mm_tom, today_row["temperature_2m_max"])

                c_info["today"] = {
                    "rain_mm": round(rain_mm_today, 2),
                    "probability": round(rain_prob_today, 1),
                    "condition": cond_today,
                    "temp": round(float(today_row["temperature_2m_mean"]), 1)
                }
                c_info["tomorrow"] = {
                    "rain_mm": round(rain_mm_tom, 2),
                    "probability": round(rain_prob_tom, 1),
                    "condition": cond_tom,
                    "temp": round(float(df_live.iloc[-1]["temperature_2m_mean"]), 1)
                }
            except Exception as e:
                c_info["today"] = {"rain_mm": 0, "probability": 0, "condition": "clear", "temp": c_info["avg_temp"]}
                c_info["tomorrow"] = {"rain_mm": 0, "probability": 0, "condition": "clear", "temp": c_info["avg_temp"]}
        else:
            c_info["today"] = {"rain_mm": 0, "probability": 0, "condition": "clear", "temp": c_info["avg_temp"]}
            c_info["tomorrow"] = {"rain_mm": 0, "probability": 0, "condition": "clear", "temp": c_info["avg_temp"]}
        
        overview.append(c_info)

    return {
        "count": len(overview),
        "status": "live_ml_predictions" if is_live else "historical_fallback",
        "cities": overview
    }