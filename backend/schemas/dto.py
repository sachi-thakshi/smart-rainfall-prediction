from pydantic import BaseModel, Field
from typing import List, Optional

class PredictionInput(BaseModel):
    city: str = Field(..., description="Sri Lankan city name, e.g. Colombo")
    date: str = Field(..., description="Historical date in YYYY-MM-DD format")

class SeasonPredictionInput(BaseModel):
    city: str = Field(..., description="Sri Lankan city name, e.g. Anuradhapura")
    season: str = Field(..., description="Season: Type 'maha' or 'yala'")

class CustomPredictionInput(BaseModel):
    city: str = Field(default="Colombo", description="Sri Lankan city")
    month: int = Field(default=5, ge=1, le=12, description="Month (1-12)")
    temperature_2m_mean: float = Field(default=28.0)
    temperature_2m_max: float = Field(default=31.5)
    temperature_2m_min: float = Field(default=25.0)
    apparent_temperature_mean: float = Field(default=32.0)
    windspeed_10m_max: float = Field(default=16.0)
    windgusts_10m_max: Optional[float] = Field(default=None)
    winddirection_10m_dominant: float = Field(default=210.0)
    precipitation_hours: float = Field(default=3.0)
    rolling_rainfall: float = Field(default=20.0)
    rainfall_lag_1: float = Field(default=5.0)
    temp_diff: float = Field(default=0.0)
    wind_change: float = Field(default=0.0)
    elevation: Optional[float] = Field(default=None)
    latitude: Optional[float] = Field(default=None)
    longitude: Optional[float] = Field(default=None)

class BatchPredictionInput(BaseModel):
    cities: List[str]
    date: str