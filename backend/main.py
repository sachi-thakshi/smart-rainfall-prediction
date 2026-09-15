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

class SeasonPredictionInput(BaseModel):

    city: str = Field(
        ..., 
        description="Sri Lankan city name, e.g. Anuradhapura"
    )

    season: str = Field(
        ...,
        description="Season: Type 'maha' or 'yala'"
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

# 15. RUN SERVER DIRECTLY

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000
    )


# --------------------------------------------------------
# CROP RECOMMENDATION SYSTEM INTEGRATION (SMART CHAINING)
# --------------------------------------------------------

# 1. DEFINE CROP MODEL PATHS
CROP_CLF_PATH = os.path.join(MODEL_DIR, "crop_classifier.pkl")
CROP_SCALER_PATH = os.path.join(MODEL_DIR, "crop_scaler.pkl")
CROP_LE_PATH = os.path.join(MODEL_DIR, "crop_label_encoder.pkl")

# 2. LOAD CROP MODELS
crop_clf = None
crop_scaler = None
crop_le = None

try:
    crop_clf = joblib.load(CROP_CLF_PATH)
    crop_scaler = joblib.load(CROP_SCALER_PATH)
    crop_le = joblib.load(CROP_LE_PATH)
    print("Crop Models loaded successfully!")
except Exception as e:
    print("ERROR: Could not load crop models.")
    print(e)

# 5. SOIL PROFILES DICTIONARY (Filtered for exact dataset cities)
SOIL_PROFILES = {
    "athurugiriya": {"N": 40, "P": 30, "K": 40, "ph": 6.0, "humidity": 80.0},
    "badulla": {"N": 45, "P": 50, "K": 45, "ph": 6.3, "humidity": 74.0},
    "bentota": {"N": 40, "P": 30, "K": 37, "ph": 6.0, "humidity": 81.0},
    "colombo": {"N": 40, "P": 30, "K": 40, "ph": 6.0, "humidity": 80.0},
    "galle": {"N": 42, "P": 30, "K": 38, "ph": 6.0, "humidity": 82.0},
    "gampaha": {"N": 45, "P": 32, "K": 38, "ph": 6.2, "humidity": 78.0},
    "hambantota": {"N": 70, "P": 35, "K": 25, "ph": 7.0, "humidity": 65.0},
    "hatton": {"N": 25, "P": 110, "K": 75, "ph": 5.6, "humidity": 84.0},
    "jaffna": {"N": 75, "P": 25, "K": 20, "ph": 7.5, "humidity": 70.0},
    "kalmunai": {"N": 68, "P": 36, "K": 32, "ph": 6.7, "humidity": 77.0},
    "kalutara": {"N": 38, "P": 28, "K": 35, "ph": 5.8, "humidity": 82.0},
    "kandy": {"N": 50, "P": 45, "K": 40, "ph": 6.5, "humidity": 78.0},
    "kesbewa": {"N": 40, "P": 30, "K": 40, "ph": 6.0, "humidity": 80.0},
    "kolonnawa": {"N": 40, "P": 30, "K": 40, "ph": 6.0, "humidity": 80.0},
    "kurunegala": {"N": 55, "P": 42, "K": 35, "ph": 6.6, "humidity": 72.0},
    "mabole": {"N": 40, "P": 30, "K": 40, "ph": 6.0, "humidity": 80.0},
    "maharagama": {"N": 40, "P": 30, "K": 40, "ph": 6.0, "humidity": 80.0},
    "mannar": {"N": 70, "P": 28, "K": 22, "ph": 7.3, "humidity": 68.0},
    "matale": {"N": 55, "P": 40, "K": 35, "ph": 6.4, "humidity": 75.0},
    "matara": {"N": 40, "P": 32, "K": 36, "ph": 6.1, "humidity": 81.0},
    "moratuwa": {"N": 40, "P": 30, "K": 40, "ph": 6.0, "humidity": 80.0},
    "mount lavinia": {"N": 40, "P": 30, "K": 40, "ph": 6.0, "humidity": 80.0},
    "negombo": {"N": 45, "P": 30, "K": 35, "ph": 6.2, "humidity": 79.0},
    "oruwala": {"N": 40, "P": 30, "K": 40, "ph": 6.0, "humidity": 80.0},
    "pothuhera": {"N": 55, "P": 42, "K": 35, "ph": 6.6, "humidity": 72.0},
    "puttalam": {"N": 68, "P": 30, "K": 26, "ph": 7.1, "humidity": 70.0},
    "ratnapura": {"N": 48, "P": 38, "K": 42, "ph": 5.9, "humidity": 80.0},
    "sri jayewardenepura kotte": {"N": 40, "P": 30, "K": 40, "ph": 6.0, "humidity": 80.0},
    "trincomalee": {"N": 65, "P": 35, "K": 30, "ph": 6.8, "humidity": 76.0},
    "weligama": {"N": 41, "P": 31, "K": 36, "ph": 6.0, "humidity": 81.0},
    "default": {"N": 50, "P": 50, "K": 50, "ph": 6.5, "humidity": 75.0}
}

# 16. SMART RECOMMENDATION ENDPOINT (SEASONAL APPROACH)

@app.post("/smart-recommendation")
def smart_recommendation(data: SeasonPredictionInput):
    if reg is None or crop_clf is None:
        raise HTTPException(status_code=500, detail="Models are not loaded.")
    if weather_df is None:
        raise HTTPException(status_code=500, detail="Weather dataset is not loaded.")

    city_lower = data.city.strip().lower()
    season_lower = data.season.strip().lower()

    if season_lower not in ["maha", "yala"]:
        raise HTTPException(status_code=400, detail="Season must be exactly 'maha' or 'yala'.")

    # 1. Find City
    city_matches = weather_df[weather_df["city"].str.lower() == city_lower]
    if city_matches.empty:
        raise HTTPException(status_code=404, detail=f"City '{data.city}' not found in dataset.")

    # 2. Filter by Season (Maha: Sep-Mar, Yala: May-Aug)
    if season_lower == "maha":
        season_months = [9, 10, 11, 12, 1, 2, 3]
    else:
        season_months = [5, 6, 7, 8]

    season_data = city_matches[city_matches["time"].dt.month.isin(season_months)]
    
    if season_data.empty:
        raise HTTPException(status_code=404, detail=f"No seasonal data found for {data.city}.")

    # 3. Create a Representative Profile for the Season 
    representative_row = season_data[feature_columns].mean().to_frame().T

    try:
        # Step 1: Predict Average Daily Rainfall and calculate Monthly Rainfall
        daily_rainfall_prediction = max(0.0, float(reg.predict(representative_row)[0]))
        monthly_rainfall = daily_rainfall_prediction * 30  # Crop model expects larger seasonal values
        
        temperature = float(season_data["temperature_2m_mean"].mean())

        # Step 2: Fetch Soil Profile
        soil_data = SOIL_PROFILES.get(city_lower, SOIL_PROFILES["default"])

        # Step 3: Crop Feature Engineering
        temp_humidity_index = temperature * soil_data["humidity"]
        total_npk = soil_data["N"] + soil_data["P"] + soil_data["K"]
        ph_category = 0 if soil_data["ph"] <= 5.5 else (1 if soil_data["ph"] <= 7.5 else 2)
        log_rainfall = np.log1p(monthly_rainfall)

        # Step 4: Prepare Data for Crop Model
        crop_features = np.array([[
            soil_data["N"], soil_data["P"], soil_data["K"], 
            temperature, soil_data["humidity"], soil_data["ph"], 
            monthly_rainfall, temp_humidity_index, total_npk, 
            ph_category, log_rainfall
        ]])

        # Step 5: Scale and Predict Best Crop
        scaled_features = crop_scaler.transform(crop_features)
        prediction_encoded = crop_clf.predict(scaled_features)
        recommended_crop = crop_le.inverse_transform(prediction_encoded)[0]

        return {
            "city": data.city.capitalize(),
            "season": "Maha (September to March)" if season_lower == "maha" else "Yala (May to August)",
            "weather_forecast": {
                "average_temperature_c": round(temperature, 2),
                "estimated_monthly_rainfall_mm": round(monthly_rainfall, 2)
            },
            "soil_profile_used": soil_data,
            "smart_recommendation": {
                "best_crop": recommended_crop.upper()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# 15. RUN SERVER DIRECTLY

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)