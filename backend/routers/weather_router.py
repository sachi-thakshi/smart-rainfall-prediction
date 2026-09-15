from fastapi import APIRouter
from schemas.dto import PredictionInput
from services.weather_service import get_cities_service, get_dataset_info_service, get_history_service
from services.ml_service import predict_rainfall_service, predict_all_cities_service

router = APIRouter(tags=["Weather Predictions"])

@router.get("/cities")
def get_cities():
    return get_cities_service()

@router.get("/dataset-info")
def dataset_info():
    return get_dataset_info_service()

@router.post("/predict")
def predict_rainfall(data: PredictionInput):
    return predict_rainfall_service(data.city, data.date)

@router.get("/history")
def history(city: str, end_date: str, days: int = 7):
    return get_history_service(city, end_date, days)

@router.get("/predict-all")
def predict_all_cities(date: str):
    return predict_all_cities_service(date)