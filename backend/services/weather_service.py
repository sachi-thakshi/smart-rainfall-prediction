import requests
import pandas as pd
from fastapi import HTTPException
from core.config import DATASET_PATH

weather_df = None

def prepare_weather_features(df):
    df = df.copy()
    df["month"] = df["time"].dt.month
    
    def get_season(month):
        if month in [12, 1, 2]: return 1
        elif month in [3, 4, 5]: return 2
        elif month in [6, 7, 8, 9]: return 3
        else: return 4
        
    df["season"] = df["month"].apply(get_season)
    df["rolling_rainfall"] = df.groupby("city")["rain_sum"].transform(lambda x: x.shift(1).rolling(window=7, min_periods=1).sum())
    df["rainfall_lag_1"] = df.groupby("city")["rain_sum"].shift(1)
    df["temp_diff"] = df.groupby("city")["temperature_2m_mean"].diff()
    df["wind_change"] = df.groupby("city")["windspeed_10m_max"].diff()
    df["temp_apparent_temp_interaction"] = df["temperature_2m_mean"] * df["apparent_temperature_mean"]
    df["wind_category"] = pd.cut(df["windspeed_10m_max"], bins=[-1, 10, 20, 100], labels=[0, 1, 2]).astype(int)
    
    engineered_columns = ["rolling_rainfall", "rainfall_lag_1", "temp_diff", "wind_change"]
    df[engineered_columns] = df[engineered_columns].fillna(0)
    return df

# Load Dataset on Startup
try:
    weather_df = pd.read_csv(DATASET_PATH)
    weather_df["time"] = pd.to_datetime(weather_df["time"], format="mixed", errors="coerce")
    weather_df = weather_df.sort_values(["city", "time"]).reset_index(drop=True)
    weather_df = prepare_weather_features(weather_df)
    print("Dataset & Features loaded successfully in Weather Service!")
except Exception as e:
    print("ERROR: Could not load weather dataset.", e)


def get_cities_service():
    if weather_df is None:
        raise HTTPException(status_code=500, detail="Weather dataset not loaded.")
    cities = sorted(weather_df["city"].dropna().unique().tolist())
    return {"count": len(cities), "cities": cities}

def get_dataset_info_service():
    if weather_df is None:
        raise HTTPException(status_code=500, detail="Weather dataset not loaded.")
    return {
        "rows": len(weather_df),
        "cities": int(weather_df["city"].nunique()),
        "start_date": weather_df["time"].min().strftime("%Y-%m-%d"),
        "end_date": weather_df["time"].max().strftime("%Y-%m-%d")
    }

def get_cities_overview_service():
    if weather_df is None:
        raise HTTPException(status_code=500, detail="Weather dataset is not loaded.")
    
    wet_zone = {
        "Colombo", "Galle", "Matara", "Kalutara", "Ratnapura", "Kandy", "Hatton",
        "Gampaha", "Maharagama", "Moratuwa", "Mount Lavinia", "Kesbewa", "Kolonnawa",
        "Sri Jayewardenepura Kotte", "Weligama", "Athurugiriya", "Mabole", "Oruwala"
    }
    dry_zone = {"Jaffna", "Mannar", "Trincomalee", "Kalmunai", "Hambantota", "Puttalam"}

    overview = []
    grouped = weather_df.groupby("city")

    for city_name, group in grouped:
        first = group.iloc[0]
        zone = "Wet Zone" if city_name in wet_zone else ("Dry Zone" if city_name in dry_zone else "Intermediate Zone")
        avg_rain = float(group["rain_sum"].mean())
        rainy_days_count = int((group["rain_sum"] > 0.1).sum())
        total_days = len(group)

        overview.append({
            "city": city_name,
            "latitude": round(float(first["latitude"]), 4),
            "longitude": round(float(first["longitude"]), 4),
            "elevation": round(float(first["elevation"]), 1),
            "zone": zone,
            "avg_daily_rainfall_mm": round(avg_rain, 2),
            "rainy_days_percentage": round((rainy_days_count / max(1, total_days)) * 100, 1),
            "avg_temp": round(float(group["temperature_2m_mean"].mean()), 1),
            "total_records": total_days
        })

    return {
        "count": len(overview),
        "cities": sorted(overview, key=lambda x: x["city"])
    }

def get_city_history_service(city: str, date: str, days: int):
    if weather_df is None:
        raise HTTPException(status_code=500, detail="Weather dataset is not loaded.")

    city_matches = weather_df[weather_df["city"].str.lower() == city.strip().lower()]
    if city_matches.empty:
        raise HTTPException(status_code=404, detail=f"City '{city}' not found.")

    if date:
        try:
            target_dt = pd.to_datetime(date)
            subset = city_matches[city_matches["time"] <= target_dt].tail(days)
        except Exception:
            subset = city_matches.tail(days)
    else:
        subset = city_matches.tail(days)

    records = []
    for _, row in subset.iterrows():
        records.append({
            "date": row["time"].strftime("%Y-%m-%d"),
            "temp_mean": round(float(row.get("temperature_2m_mean", 0)), 1),
            "temp_max": round(float(row.get("temperature_2m_max", 0)), 1),
            "temp_min": round(float(row.get("temperature_2m_min", 0)), 1),
            "rain_sum": round(float(row.get("rain_sum", 0)), 1),
            "windspeed": round(float(row.get("windspeed_10m_max", 0)), 1),
            "precipitation_hours": round(float(row.get("precipitation_hours", 0)), 1),
            "rolling_rainfall": round(float(row.get("rolling_rainfall", 0)), 1)
        })

    return {
        "city": city,
        "count": len(records),
        "records": records
    }

def get_7day_forecast_service(city: str):
    if weather_df is None:
        raise HTTPException(status_code=500, detail="Weather dataset is not loaded.")

    city_matches = weather_df[weather_df["city"].str.lower() == city.strip().lower()]
    if city_matches.empty:
        raise HTTPException(status_code=404, detail=f"City '{city}' not found.")

    lat = city_matches.iloc[0]["latitude"]
    lon = city_matches.iloc[0]["longitude"]
    elev = city_matches.iloc[0]["elevation"]

    url = (f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&elevation={elev}"
           f"&daily=temperature_2m_max,temperature_2m_min,rain_sum,windspeed_10m_max,"
           f"apparent_temperature_max,precipitation_hours,uv_index_max"
           f"&timezone=Asia%2FColombo&forecast_days=7")

    try:
        res = requests.get(url, timeout=10)
        data = res.json().get("daily", {})
        
        if not data:
            raise ValueError("No daily data in response")

        forecast_data = []
        for i in range(len(data.get("time", []))):
            rain = data["rain_sum"][i]
            temp_max = data["temperature_2m_max"][i]
            
            condition = "clear"
            if rain > 35:
                condition = "severe"
            elif rain > 0.1:
                condition = "rainy"
            elif temp_max > 32.0:
                condition = "hot"

            forecast_data.append({
                "date": data["time"][i],
                "temp_max": temp_max,
                "temp_min": data["temperature_2m_min"][i],
                "feels_like": data["apparent_temperature_max"][i],
                "rain_sum": rain,
                "windspeed_10m_max": data["windspeed_10m_max"][i],
                "precip_hours": data["precipitation_hours"][i],
                "uv_index": data["uv_index_max"][i],
                "weather_condition": condition
            })
            
        return {
            "city": city,
            "forecast": forecast_data
        }
    except Exception as e:
        print("Forecast Fetch Error:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch 7-day forecast from Open-Meteo.")