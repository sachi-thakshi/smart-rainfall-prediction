import requests
import pandas as pd
import numpy as np
from fastapi import HTTPException

from core.config import get_location_details
from services.weather_service import weather_df
from services.ml_service import clf, reg, feature_columns

def predict_live_system_service(city: str):
    if clf is None or reg is None:
        raise HTTPException(status_code=500, detail="Models not loaded.")

    city_lower = city.strip().lower()

    # 1. Get Location Details 
    main_district, _ = get_location_details(city_lower)
    city_matches = weather_df[weather_df["city"].str.lower() == main_district]

    if city_matches.empty:
        raise HTTPException(status_code=404, detail="City not supported.")

    lat = city_matches.iloc[0]["latitude"]
    lon = city_matches.iloc[0]["longitude"]
    elev = city_matches.iloc[0]["elevation"]

    # 2. Fetch LIVE Data from Open-Meteo (Past 10 days + 2 Days Forecast)
    url = (f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&elevation={elev}"
           f"&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,"
           f"rain_sum,precipitation_hours,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant"
           f"&timezone=Asia%2FColombo&past_days=10&forecast_days=2")

    try:
        res = requests.get(url)
        data = res.json()["daily"]
        df_live = pd.DataFrame(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch live weather data from internet.")

    # 3. Live Feature Engineering
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
            "latitude": lat,
            "longitude": lon,
            "elevation": elev,
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

    # --- Smart Weather Alert System Logic ---
    def get_weather_status(pred_rain_mm, max_temp):
        if pred_rain_mm == 0:
            if max_temp > 32.0:
                return "High Sunlight / Hot Day", "🟢 Normal"
            else:
                return "Clear / Good Day", "🟢 Normal"
        elif pred_rain_mm <= 10:
            return "Light Rain / Cloudy", "🟡 Low Alert"
        elif pred_rain_mm <= 50:
            return "Heavy Rain", "🟠 Moderate Alert"
        else:
            return "Severe Rain & Possible Flood Risk", "🔴 High Alert / Flood Warning"

    # 2. Get the last 3 days of data
    yesterday_row = df_live.iloc[-3]
    today_row = df_live.iloc[-2]
    tomorrow_row = df_live.iloc[-1]

    # --- Today's Prediction ---
    input_today = build_model_input(yesterday_row)
    rain_pred_today = int(clf.predict(input_today)[0])
    rain_prob_today = float(clf.predict_proba(input_today)[0][1]) * 100
    daily_rain_today = max(0.0, float(reg.predict(input_today)[0]))
    condition_today, alert_today = get_weather_status(daily_rain_today, yesterday_row["temperature_2m_max"])

    # --- Tomorrow's Prediction ---
    input_tomorrow = build_model_input(today_row)
    rain_pred_tom = int(clf.predict(input_tomorrow)[0])
    rain_prob_tom = float(clf.predict_proba(input_tomorrow)[0][1]) * 100
    daily_rain_tom = max(0.0, float(reg.predict(input_tomorrow)[0]))
    condition_tom, alert_tom = get_weather_status(daily_rain_tom, today_row["temperature_2m_max"])

    return {
        "status": "Live ML Weather Prediction Active",
        "searched_area": city.capitalize(),
        "weather_station": main_district.capitalize(),
        "prediction_today": {
            "date": today_row["time"],
            "temperature_c": float(today_row["temperature_2m_mean"]), # <-- මෙතන තමයි අලුතින් එකතු කළේ
            "rain_expected": "YES" if rain_pred_today == 1 else "NO",
            "probability_percentage": round(rain_prob_today, 2),
            "expected_rainfall_mm": round(daily_rain_today, 2),
            "weather_condition": condition_today,
            "alert_status": alert_today
        },
        "prediction_tomorrow": {
            "date": tomorrow_row["time"],
            "temperature_c": float(tomorrow_row["temperature_2m_mean"]), # <-- මෙතන තමයි අලුතින් එකතු කළේ
            "rain_expected": "YES" if rain_pred_tom == 1 else "NO",
            "probability_percentage": round(rain_prob_tom, 2),
            "expected_rainfall_mm": round(daily_rain_tom, 2),
            "weather_condition": condition_tom,
            "alert_status": alert_tom
        }
    }