from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import numpy as np
import os


# 1. CREATE FASTAPI APP
app = FastAPI(
    title="SmartRain - Rainfall Prediction API",
    description=(
        "API for predicting tomorrow's rainfall in Sri Lanka "
        "using historical weather data and trained ML models."
    ),
    version="2.0.0"
)


# 2. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. PATHS
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_DIR = os.path.join(BASE_DIR, "models")

CLASSIFIER_PATH = os.path.join(
    MODEL_DIR,
    "rain_classifier.pkl"
)

REGRESSOR_PATH = os.path.join(
    MODEL_DIR,
    "rain_regressor.pkl"
)

FEATURES_PATH = os.path.join(
    MODEL_DIR,
    "feature_columns.pkl"
)

DATASET_PATH = os.path.join(
    BASE_DIR,
    "SriLanka_Weather_Dataset.csv"
)


# 4. GLOBAL VARIABLES
clf = None
reg = None
feature_columns = None
weather_df = None


# 5. LOAD MODELS
try:

    clf = joblib.load(CLASSIFIER_PATH)
    reg = joblib.load(REGRESSOR_PATH)
    feature_columns = joblib.load(FEATURES_PATH)

    print("Models loaded successfully!")
    print("Classification model:", type(clf).__name__)
    print("Regression model:", type(reg).__name__)
    print("Number of features:", len(feature_columns))

except Exception as e:

    print("ERROR: Could not load model files.")
    print(e)


# 6. LOAD DATASET
try:

    weather_df = pd.read_csv(DATASET_PATH)

    # Convert date
    weather_df["time"] = pd.to_datetime(
        weather_df["time"],
        format="mixed",
        errors="coerce"
    )

    # Sort by city and date
    weather_df = (
        weather_df
        .sort_values(["city", "time"])
        .reset_index(drop=True)
    )

    print("Dataset loaded successfully!")
    print("Dataset shape:", weather_df.shape)
    print("Number of cities:", weather_df["city"].nunique())
    print(
        "Date range:",
        weather_df["time"].min(),
        "to",
        weather_df["time"].max()
    )

except Exception as e:

    print("ERROR: Could not load weather dataset.")
    print(e)


# 7. FEATURE ENGINEERING
def prepare_weather_features(df):
    """
    Recreates the feature engineering used during model training.
    """

    df = df.copy()

    # Month
    df["month"] = df["time"].dt.month


    # Season
    def get_season(month):

        if month in [12, 1, 2]:
            return 1

        elif month in [3, 4, 5]:
            return 2

        elif month in [6, 7, 8, 9]:
            return 3

        else:
            return 4

    df["season"] = df["month"].apply(get_season)


    # Previous 7 days rainfall
    # today's rainfall when creating this feature.
    df["rolling_rainfall"] = (
        df.groupby("city")["rain_sum"]
        .transform(
            lambda x:
            x.shift(1)
            .rolling(window=7, min_periods=1)
            .sum()
        )
    )


    # Previous day's rainfall
    df["rainfall_lag_1"] = (
        df.groupby("city")["rain_sum"]
        .shift(1)
    )

    # Temperature difference
    df["temp_diff"] = (
        df.groupby("city")["temperature_2m_mean"]
        .diff()
    )

    # Wind speed change
    df["wind_change"] = (
        df.groupby("city")["windspeed_10m_max"]
        .diff()
    )

    # Temperature × apparent temperature
    df["temp_apparent_temp_interaction"] = (
        df["temperature_2m_mean"]
        *
        df["apparent_temperature_mean"]
    )


    # --------------------------------------------------------
    # Wind category
    #
    # 0 = Low
    # 1 = Moderate
    # 2 = High
    # --------------------------------------------------------

    df["wind_category"] = pd.cut(
        df["windspeed_10m_max"],
        bins=[-1, 10, 20, 100],
        labels=[0, 1, 2]
    ).astype(int)


    # Fill first-day engineered values
    engineered_columns = [
        "rolling_rainfall",
        "rainfall_lag_1",
        "temp_diff",
        "wind_change"
    ]

    df[engineered_columns] = (
        df[engineered_columns]
        .fillna(0)
    )


    return df


# 8. PREPARE DATASET ON STARTUP
if weather_df is not None:

    try:

        weather_df = prepare_weather_features(weather_df)

        print("Feature engineering completed successfully!")

    except Exception as e:

        print("ERROR: Feature engineering failed.")
        print(e)


# 9. INPUT DATA MODEL
class PredictionInput(BaseModel):

    city: str = Field(
        ...,
        description="Sri Lankan city name, e.g. Colombo"
    )

    date: str = Field(
        ...,
        description="Historical date in YYYY-MM-DD format"
    )


# 10. HOME
@app.get("/")
def home():

    return {
        "message": "SmartRain Rainfall Prediction API is running!",
        "status": "online",
        "classification_model_loaded": clf is not None,
        "regression_model_loaded": reg is not None,
        "dataset_loaded": weather_df is not None
    }


# 11. HEALTH CHECK
@app.get("/health")
def health_check():

    if clf is None or reg is None:

        return {
            "status": "error",
            "message": "Model files are not loaded."
        }

    if weather_df is None:

        return {
            "status": "error",
            "message": "Weather dataset is not loaded."
        }

    return {

        "status": "healthy",

        "classification_model":
            type(clf).__name__,

        "regression_model":
            type(reg).__name__,

        "number_of_features":
            len(feature_columns),

        "dataset_rows":
            len(weather_df),

        "number_of_cities":
            weather_df["city"].nunique()
    }


# 12. GET AVAILABLE CITIES
@app.get("/cities")
def get_cities():

    if weather_df is None:

        raise HTTPException(
            status_code=500,
            detail="Weather dataset is not loaded."
        )

    cities = sorted(
        weather_df["city"]
        .dropna()
        .unique()
        .tolist()
    )

    return {
        "count": len(cities),
        "cities": cities
    }


# 13. GET DATASET DATE RANGE
@app.get("/dataset-info")
def dataset_info():

    if weather_df is None:

        raise HTTPException(
            status_code=500,
            detail="Weather dataset is not loaded."
        )

    return {

        "rows":
            len(weather_df),

        "cities":
            int(weather_df["city"].nunique()),

        "start_date":
            weather_df["time"].min().strftime("%Y-%m-%d"),

        "end_date":
            weather_df["time"].max().strftime("%Y-%m-%d")
    }


# 14. PREDICT RAINFALL
@app.post("/predict")
def predict_rainfall(data: PredictionInput):

    # Check models
    if clf is None or reg is None:

        raise HTTPException(
            status_code=500,
            detail="ML models are not loaded."
        )

    # Check dataset
    if weather_df is None:

        raise HTTPException(
            status_code=500,
            detail="Weather dataset is not loaded."
        )

    # Validate date
    try:

        requested_date = pd.to_datetime(
            data.date
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid date. Use YYYY-MM-DD format."
        )

    # Find city
    city_matches = weather_df[
        weather_df["city"].str.lower()
        == data.city.strip().lower()
    ]

    if city_matches.empty:

        raise HTTPException(
            status_code=404,
            detail=f"City '{data.city}' was not found in the dataset."
        )


    # Find requested city + date
    matching_rows = city_matches[
        city_matches["time"] == requested_date
    ]

    if matching_rows.empty:

        raise HTTPException(
            status_code=404,
            detail=(
                f"No weather record found for "
                f"{data.city} on {data.date}."
            )
        )


    # Get selected row
    selected_row = matching_rows.iloc[0]


    # --------------------------------------------------------
    # Make sure tomorrow exists
    #
    # The ML target was:
    # rainfall_amount_tomorrow
    # --------------------------------------------------------

    next_day = requested_date + pd.Timedelta(days=1)

    tomorrow_exists = not city_matches[
        city_matches["time"] == next_day
    ].empty

    if not tomorrow_exists:

        raise HTTPException(
            status_code=400,
            detail=(
                "There is no following-day record for this date. "
                "Please choose an earlier date."
            )
        )


    # Create input dataframe
    input_df = pd.DataFrame(
        [selected_row]
    )


    # Select exact model features
    try:

        input_df = input_df[
            feature_columns
        ]

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=f"Feature mismatch: {str(e)}"
        )


    # Classification
    try:

        rain_prediction = int(
            clf.predict(input_df)[0]
        )

        rain_probability = float(
            clf.predict_proba(input_df)[0][1]
        ) * 100

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Classification prediction failed: {str(e)}"
            )
        )

    # Regression
    try:

        rainfall_prediction = float(
            reg.predict(input_df)[0]
        )

        # Rainfall cannot be negative
        rainfall_prediction = max(
            0.0,
            rainfall_prediction
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Regression prediction failed: {str(e)}"
            )
        )


    # Final response
    return {

        "city":
            data.city,

        "date":
            data.date,

        "prediction_for":
            next_day.strftime("%Y-%m-%d"),

        "rain_tomorrow":
            "YES"
            if rain_prediction == 1
            else "NO",

        "probability":
            round(
                rain_probability,
                2
            ),

        "rainfall_mm":
            round(
                rainfall_prediction,
                2
            )
    }

# 15. GET CITY WEATHER HISTORY (For Frontend Charts)
@app.get("/history")
def get_city_history(city: str, end_date: str, days: int = 7):
    """
    Returns historical weather data for a city to plot charts in the frontend.
    """
    if weather_df is None:
        raise HTTPException(status_code=500, detail="Weather dataset is not loaded.")
        
    try:
        end_dt = pd.to_datetime(end_date)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

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
        
    return {
        "city": city,
        "days_returned": len(history_records),
        "history": history_records
    }


# 16. PREDICT FOR ALL CITIES (For Frontend Map View)
@app.get("/predict-all")
def predict_all_cities(date: str):
    """
    Returns rainfall predictions for all available cities on a specific date.
    Useful for displaying a weather map in the frontend.
    """
    if clf is None or weather_df is None:
        raise HTTPException(status_code=500, detail="Models or dataset not loaded.")
        
    try:
        requested_date = pd.to_datetime(date)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    day_data = weather_df[weather_df["time"] == requested_date]
    
    if day_data.empty:
        raise HTTPException(status_code=404, detail=f"No data available for {date}.")

    predictions = []
    for _, row in day_data.iterrows():
        input_df = pd.DataFrame([row])[feature_columns]
        
        try:
            rain_prediction = int(clf.predict(input_df)[0])
            predictions.append({
                "city": row["city"],
                "rain_tomorrow": "YES" if rain_prediction == 1 else "NO"
            })
        except Exception:
            continue
            
    return {
        "date": date,
        "prediction_for": (requested_date + pd.Timedelta(days=1)).strftime("%Y-%m-%d"),
        "total_cities": len(predictions),
        "predictions": predictions
    }