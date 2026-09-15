from fastapi import APIRouter
from typing import Optional
from schemas.dto import PredictionInput, CustomPredictionInput, BatchPredictionInput
from services.weather_service import (
    get_cities_service, 
    get_dataset_info_service, 
    get_cities_overview_service, 
    get_city_history_service
)
from services.ml_service import (
    predict_rainfall_service, 
    predict_custom_service, 
    predict_batch_service, 
    get_model_metrics_service,
    predict_all_cities_service
)

router = APIRouter(tags=["Weather Predictions"])

@router.get("/cities")
def get_cities():
    return get_cities_service()

@router.get("/dataset-info")
def dataset_info():
    return get_dataset_info_service()

@router.get("/cities-overview")
def get_cities_overview():
    return get_cities_overview_service()

@router.get("/city-history")
def get_city_history(city: str, date: Optional[str] = None, days: int = 14):
    return get_city_history_service(city, date, days)

@router.get("/model-metrics")
def get_model_metrics():
    return get_model_metrics_service()

@router.post("/predict")
def predict_rainfall(data: PredictionInput):
    return predict_rainfall_service(data.city, data.date)

@router.post("/predict-custom")
def predict_custom(data: CustomPredictionInput):
    return predict_custom_service(data)

@router.post("/predict-batch")
def predict_batch(data: BatchPredictionInput):
    return predict_batch_service(data.cities, data.date)

@router.get("/predict-all")
def predict_all_cities(date: str):
    return predict_all_cities_service(date)