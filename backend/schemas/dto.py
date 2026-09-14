from pydantic import BaseModel, Field

class PredictionInput(BaseModel):
    city: str = Field(..., description="Sri Lankan city name, e.g. Colombo")
    date: str = Field(..., description="Historical date in YYYY-MM-DD format")

class SeasonPredictionInput(BaseModel):
    city: str = Field(..., description="Sri Lankan city name, e.g. Anuradhapura")
    season: str = Field(..., description="Season: Type 'maha' or 'yala'")