from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import weather_router, crop_router
from services.ml_service import clf, reg
from services.weather_service import weather_df

app = FastAPI(title="SmartRain API Enterprise", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect MVC Routers
app.include_router(weather_router.router)
app.include_router(crop_router.router)

@app.get("/")
def home():
    return {"message": "SmartRain API is Running on Layered MVC Architecture"}

@app.get("/health")
def health_check():
    if clf is None or reg is None or weather_df is None:
        return {"status": "error", "message": "System not fully loaded."}
    return {
        "status": "healthy",
        "dataset_rows": len(weather_df),
        "number_of_cities": weather_df["city"].nunique()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)