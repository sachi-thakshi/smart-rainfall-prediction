from fastapi import APIRouter
from schemas.dto import SeasonPredictionInput
from services.ml_service import smart_recommendation_service
from services.live_predict import predict_live_system_service

router = APIRouter(tags=["Smart Farming"])

@router.post("/smart-recommendation")
def get_smart_recommendation(data: SeasonPredictionInput):
    return smart_recommendation_service(data.city, data.season)

@router.get("/predict-live")
def get_live_prediction_and_crop(city: str):
    return predict_live_system_service(city)