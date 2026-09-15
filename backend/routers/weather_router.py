from fastapi import APIRouter
from typing import Optional
from schemas.dto import PredictionInput, CustomPredictionInput, BatchPredictionInput
from services.weather_service import (
    get_7day_forecast_service,
    get_cities_service, 
)
from services.ml_service import (
    get_live_cities_overview_service
)

router = APIRouter(tags=["Weather Predictions"])

@router.get("/cities")
def get_cities():
    return get_cities_service()

@router.get("/cities-overview")
def get_cities_overview():
    return get_live_cities_overview_service()

@router.get("/forecast-7day")
def get_7day_forecast(city: str):
    return get_7day_forecast_service(city)