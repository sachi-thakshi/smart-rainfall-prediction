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

def get_history_service(city: str, end_date: str, days: int):
    if weather_df is None:
        raise HTTPException(status_code=500, detail="Weather dataset not loaded.")
    try:
        end_dt = pd.to_datetime(end_date)
    except:
        raise HTTPException(status_code=400, detail="Invalid date format.")
        
    city_matches = weather_df[weather_df["city"].str.lower() == city.strip().lower()]
    if city_matches.empty:
        raise HTTPException(status_code=404, detail=f"City '{city}' not found.")
        
    past_data = city_matches[city_matches["time"] <= end_dt].tail(days)
    if past_data.empty:
        raise HTTPException(status_code=404, detail="No historical data found.")
        
    history_records = []
    for _, row in past_data.iterrows():
        history_records.append({
            "date": row["time"].strftime("%Y-%m-%d"),
            "temperature": round(row["temperature_2m_mean"], 2),
            "rainfall_mm": round(row["rain_sum"], 2),
            "wind_speed": round(row["windspeed_10m_max"], 2)
        })
    return {"city": city, "days_returned": len(history_records), "history": history_records}