<div align="center">

# 🌧️ SmartRain
### Intelligent Weather & Agricultural Analytics for Sri Lanka

*Turning raw atmospheric data into actionable farming decisions.*

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-Academic-lightgrey?style=flat-square)](#-license)

</div>

---

## 📑 Table of Contents

1. [Overview](#-overview)
2. [Core Application Modules](#-core-application-modules)
3. [System Architecture](#️-system-architecture)
4. [Tech Stack](#-tech-stack)
5. [Machine Learning Pipeline](#-machine-learning-pipeline)
6. [Project Structure](#-project-structure)
7. [Setup & Installation](#-setup--installation)
8. [API Reference](#-api-reference)
9. [Results & Model Performance](#-results--model-performance)
10. [Team & Contributions](#-team--contributions)
11. [Future Enhancements](#-future-enhancements)

---

## 📌 Overview

Agriculture in Sri Lanka lives and dies by the rain. Farmers plan planting, irrigation and harvesting around two monsoon-driven cultivation seasons — **Maha** and **Yala** — yet the weather information available to them is fragmented, generic and rarely translated into a decision they can act on.

**SmartRain** closes that gap. It is a full-stack machine learning platform that predicts rainfall across **30 meteorological stations** in Sri Lanka and then chains those predictions into **season-aware crop recommendations** ranked by model confidence.

The platform answers three questions in a single surface:

| Question | How SmartRain answers it |
|---|---|
| *Will it rain, and how much?* | A Gradient Boosting classifier predicts rain probability; a regression pipeline predicts accumulated rainfall in mm. |
| *What does the week look like?* | A 7-day extended outlook charts temperature, rainfall, wind and precipitation hours. |
| *So what should I plant?* | A Random Forest crop classifier fuses predicted weather with localized soil profiles (N-P-K, pH) to rank the best crops. |

Beyond the modelling, SmartRain was built with a deliberately **cinematic UI/UX layer** — scroll-reveal chapter transitions, dynamic sky backdrops that respond to live conditions, glassmorphism panels and a pan-and-zoom island radar — so that machine learning output reads like a product, not a notebook.

---

## ✨ Core Application Modules

The frontend is structured as five sequential "intelligence chapters", each with its own dedicated rail navigation anchor.

### `01 / Live Weather` — Real-time atmospheric analytics
The landing surface. Displays the currently selected station's live prediction: temperature, condition classification (e.g. *Heavy Rain — Light Rain / Cloudy*), expected rainfall in mm and an alert status badge. The `SkyBackdrop` component renders an animated sky whose cloud density, rain streaks and drift speed are driven by the actual predicted condition and wind speed. A Today / Tomorrow toggle and a station selector sit in a persistent floating header.

### `02 / Rain Intelligence` — Rainfall-focused analytics
An analytical view isolating the rainfall signal from the noise. Surfaces **predicted accumulated rainfall (mm)** and an **active weather risk classification** (Low / Moderate / Severe alert) via the `WeatherStatsStrip`, paired with a horizontally scrollable 7-day forecast carousel showing per-day rain volume and wind velocity.

### `03 / Island Radar` — Interactive station-level map
A full-island `react-leaflet` map with 30 live station markers, each labelled with its current temperature and condition icon. A companion sidebar provides:
- **Station search** by name
- **Climate-zone filters** — All / Wet Zone / Dry Zone / Intermediate Zone
- **Live aggregate counters** — stations currently classified as Rain, Severe, Hot and Clear
- **Per-station cards** showing temperature, predicted rainfall (mm) and rain probability (%) with an inline confidence bar

Selecting any station propagates that choice across every other module.

### `04 / Forecast Studio` — Seven-day extended outlook
A `recharts`-powered analytics workspace with three view modes — **Overview**, **Temperature** and **Rainfall**. Four headline KPI tiles summarise the week (total rainfall, peak temperature, maximum wind, total rainy hours), and a combined composite chart overlays the temperature curve on rainfall bars so the relationship between heat and precipitation is legible at a glance.

### `05 / Smart Farming` — AI crop matching
The module that converts weather into agronomy. The user selects a cultivation season — **Yala (May – Aug)** or **Maha (Sep – Mar)** — and SmartRain feeds the predicted rainfall, temperature and humidity for the selected station, together with that district's soil profile, into the crop classifier. Results are returned as a ranked list of crop matches with `predict_proba` confidence scores, match-strength labels and a highlighted top recommendation.

---

## 🏗️ System Architecture

SmartRain follows a decoupled, service-oriented architecture that mirrors the reference architecture in the assignment specification.

```
                          ┌─────────────────┐
                          │      USER       │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────────────────┐
                          │   FRONTEND APPLICATION      │
                          │   React 19 + Vite + Tailwind│
                          └────────┬────────────────────┘
                                   │  HTTP / JSON (Axios)
                          ┌────────▼────────────────────┐
                          │   BACKEND REST API          │
                          │   FastAPI + Pydantic        │
                          │   routers/ · schemas/       │
                          └────────┬────────────────────┘
                                   │
                          ┌────────▼────────────────────┐
                          │   ML PREDICTION SERVICE     │
                          │   services/ml_service.py    │
                          │   services/live_predict.py  │
                          └────────┬────────────────────┘
                                   │  joblib.load()
                          ┌────────▼────────────────────┐
                          │   TRAINED ML MODELS         │
                          │   rain_classifier.pkl       │
                          │   rain_regressor.pkl        │
                          │   crop_classifier.pkl       │
                          │   + scaler / encoder .pkl   │
                          └────────┬────────────────────┘
                                   │
                          ┌────────▼────────────────────┐
                          │   PREDICTION RESULT (JSON)  │
                          └────────┬────────────────────┘
                                   │
                          ┌────────▼────────────────────┐
                          │   FRONTEND VISUALISATION    │
                          │   Charts · Map · Cards      │
                          └─────────────────────────────┘
```

**Design rationale**

- **Separation of concerns** — routers handle HTTP, services handle inference, models are pure serialized artifacts. No model logic leaks into the API layer.
- **Models are loaded once at startup**, not per request, keeping inference latency low.
- **Pydantic schemas** validate every request and response, so malformed feature vectors never reach the estimators.
- **Stateless API** — the frontend owns UI state; the backend is horizontally scalable.

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | Component-based UI architecture |
| **Vite 8** | Dev server & optimized production bundling |
| **Tailwind CSS v4** | Utility-first styling, glassmorphism design system |
| **Recharts** | Composite charts for the Forecast Studio |
| **React-Leaflet / Leaflet** | Interactive Island Radar with OpenStreetMap tiles |
| **Lucide React** | Consistent iconography |
| **Custom hooks + GSAP-style transitions** | Scroll-reveal animations, chapter rail navigation |
| **Axios** | API communication layer |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance async REST API with auto-generated OpenAPI docs |
| **Uvicorn** | ASGI server |
| **Pydantic** | Request/response schema validation |
| **Joblib** | Model serialization & loading |

### Machine Learning & Data
| Technology | Purpose |
|---|---|
| **Scikit-learn** | Model training, pipelines, preprocessing, evaluation |
| **Pandas / NumPy** | Data wrangling and numerical computation |
| **Matplotlib / Seaborn** | Exploratory Data Analysis visualisations |
| **Jupyter Notebook** | EDA and model development workflow |

---

## 🧠 Machine Learning Pipeline

### 1. Datasets

#### 📊 Dataset A — Sri Lanka Weather Dataset
| Attribute | Detail |
|---|---|
| **Source** | Historical Sri Lankan meteorological records (public open weather data, aggregated) |
| **File** | `backend/data/SriLanka_Weather_Dataset.csv` |
| **Records** | 147,000+ |
| **Coverage** | 30 cities / meteorological stations across all climate zones |
| **Features** | `time`, `city`, `latitude`, `longitude`, `temperature_2m_max`, `temperature_2m_min`, `temperature_2m_mean`, `apparent_temperature_*`, `windspeed_10m_max`, `windgusts_10m_max`, `winddirection_10m_dominant`, `shortwave_radiation_sum`, `et0_fao_evapotranspiration`, `precipitation_sum`, `rain_sum`, `precipitation_hours` |
| **Target variables** | `rain_tomorrow` (binary — classification) · `rainfall_mm` (continuous — regression) |
| **Data types** | Numeric (float64/int64) for all meteorological measures; categorical for `city`; datetime for `time` |

#### 🌱 Dataset B — Crop Recommendation Dataset
| Attribute | Detail |
|---|---|
| **Source** | Kaggle — Crop Recommendation Dataset |
| **File** | `backend/data/Crop_recommendation.csv` |
| **Records** | 2,200 |
| **Features (7)** | `N` (Nitrogen), `P` (Phosphorous), `K` (Potassium), `temperature`, `humidity`, `ph`, `rainfall` |
| **Target variable** | `label` — 22 crop classes (rice, maize, papaya, jute, banana, mango, etc.) |
| **Class balance** | 100 samples per crop — perfectly balanced multi-class problem |

#### 🔍 Data Quality Assessment
| Issue | Finding | Treatment |
|---|---|---|
| **Missing values** | Present in a small number of wind and radiation columns in the weather dataset | Median imputation for numeric features; rows with a missing target dropped |
| **Duplicate records** | Duplicated station-date rows found in the weather dataset | Removed with `drop_duplicates()` on the `(city, time)` composite key |
| **Data type issues** | `time` read as string; several numerics read as object | Explicit casting; `pd.to_datetime()` on `time` |
| **Skewness** | `rainfall` / `precipitation_sum` heavily right-skewed with a large zero mass | `log1p` transformation |
| **Outliers** | Extreme wind-gust and rainfall spikes (genuine monsoon events) | IQR-based capping rather than deletion, to preserve real extremes |
| **Scale disparity** | Features spanning different magnitudes (pH ≈ 0–14 vs rainfall ≈ 0–300) | `StandardScaler` |

---

### 2. Feature Engineering (6 techniques — ✅ exceeds the mandatory 5–6)

| # | Technique | Implementation | Why it matters |
|:-:|---|---|---|
| **1** | **Feature Interaction** | `temp_humidity_index = temperature × humidity` | Captures the compound heat-moisture stress that governs crop viability far better than either variable alone. |
| **2** | **Aggregation** | `total_npk = N + P + K` and `rolling_rainfall` (7-day rolling sum per station) | `total_npk` summarises overall soil fertility; `rolling_rainfall` injects temporal memory so the model sees antecedent wetness, not just a single day. |
| **3** | **Binning** | Continuous `ph` discretised into agricultural categories (`acidic` / `slightly_acidic` / `neutral` / `alkaline`) via `pd.cut()` → `ph_category` | Crop suitability responds to pH *bands*, not linear pH, so binning encodes real agronomic thresholds. |
| **4** | **Log Transformation** | `np.log1p()` applied to rainfall features | Normalises a heavily skewed distribution with many zeros, stabilising variance for the regression model. |
| **5** | **Target / Label Encoding** | `LabelEncoder` on the 22-class crop `label`, persisted as `crop_label_encoder.pkl` | Converts crop names into model-consumable integers while allowing exact inverse-transform back to readable names at serving time. |
| **6** | **Standardization (Feature Scaling)** | `StandardScaler` fitted on training features, persisted as `crop_scaler.pkl` | Guarantees identical scaling at train and inference time, eliminating train/serve skew. |

> **Additional preprocessing applied:** removal of irrelevant/leaky columns, missing-value handling, outlier treatment, and date/time feature extraction (month → cultivation season mapping for Maha/Yala awareness).

---

### 3. Models Developed & Evaluated

Multiple candidate algorithms were trained per task and compared before selection.

#### 🌧️ Task 1 — Rain Occurrence (Binary Classification)
| Model | Accuracy | Notes |
|---|:-:|---|
| Logistic Regression | ~0.82 | Baseline; underfits nonlinear monsoon behaviour |
| Decision Tree | ~0.85 | High variance, overfits |
| **Gradient Boosting Classifier ✅** | **~0.91** | **Selected** — best bias/variance balance, well-calibrated probabilities for the rain-probability gauge |

#### 💧 Task 2 — Rainfall Volume (Regression)
| Model | R² | Notes |
|---|:-:|---|
| **Linear Regression Pipeline ✅** | **~0.78** | **Selected** — interpretable, stable on log-transformed target, low inference cost |
| Decision Tree Regressor | ~0.71 | Unstable on unseen extremes |

#### 🌱 Task 3 — Crop Recommendation (Multi-class Classification)
| Model | Accuracy | Notes |
|---|:-:|---|
| Decision Tree | ~0.98 | Strong but less robust |
| Naive Bayes | ~0.99 | Competitive, but weaker probability ranking |
| **Random Forest Classifier ✅** | **99.32%** | **Selected** — highest accuracy, robust to feature noise, and `predict_proba` gives the ranked confidence scores the Smart Farming UI needs |

#### Evaluation methodology
- Stratified **train/test split (80/20)** with a fixed `random_state` for reproducibility
- **5-fold cross-validation** to confirm results were not split-dependent
- **Classification:** Accuracy, Precision, Recall, F1-score, Confusion Matrix, Classification Report
- **Regression:** MAE, RMSE, R²
- **Feature importance analysis** on the Random Forest to verify the engineered features (`total_npk`, `temp_humidity_index`) genuinely contributed

### 4. Serialized Model Artifacts

| Artifact | Contents |
|---|---|
| `rain_classifier.pkl` | Gradient Boosting Classifier — rain probability |
| `rain_regressor.pkl` | Linear Regression pipeline — rainfall (mm) |
| `crop_classifier.pkl` | Random Forest Classifier — crop recommendation |
| `crop_scaler.pkl` | Fitted `StandardScaler` for crop features |
| `crop_label_encoder.pkl` | Fitted `LabelEncoder` for the 22 crop classes |
| `feature_columns.pkl` | Canonical feature order — guards against column-order drift at inference |
| `model_info.pkl` | Model metadata, versions and evaluation metrics |

---

## 📂 Project Structure

```
smart-rainfall-prediction/
│
├── backend/
│   ├── core/                          # Configuration, constants, station registry
│   ├── data/
│   │   ├── Crop_recommendation.csv
│   │   └── SriLanka_Weather_Dataset.csv
│   ├── models/                        # Serialized ML artifacts (.pkl)
│   │   ├── crop_classifier.pkl
│   │   ├── crop_label_encoder.pkl
│   │   ├── crop_scaler.pkl
│   │   ├── feature_columns.pkl
│   │   ├── model_info.pkl
│   │   ├── rain_classifier.pkl
│   │   └── rain_regressor.pkl
│   ├── notebooks/
│   │   ├── Crop_Recommendation_ML.ipynb    # Crop model development
│   │   └── SmartRain_EDA.ipynb             # EDA & weather model development
│   ├── routers/
│   │   ├── crop_router.py             # /crop endpoints
│   │   └── weather_router.py          # /weather endpoints
│   ├── schemas/                       # Pydantic request/response models
│   ├── services/
│   │   ├── live_predict.py            # Live prediction orchestration
│   │   ├── ml_service.py              # Model loading & inference
│   │   └── weather_service.py         # Weather data shaping & 7-day assembly
│   ├── main.py                        # FastAPI application entrypoint
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/                # SkyBackdrop, WeatherStatsStrip, charts, map, rail nav
│   │   ├── hooks/                     # Scroll-reveal & animation hooks
│   │   ├── pages/                     # The five intelligence chapters
│   │   ├── services/                  # API client layer
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites

| Requirement | Version |
|---|---|
| **Python** | 3.10 or higher |
| **Node.js** | 18 or higher |
| **npm** | 9 or higher |
| **Git** | Latest |

---

### 1️⃣ Clone the repository

```bash
git clone https://github.com/sachi-thakshi/smart-rainfall-prediction.git
cd smart-rainfall-prediction
```

---

### 2️⃣ Backend Setup (FastAPI + ML)

**Step 1 — Navigate to the backend directory**

```bash
cd backend
```

**Step 2 — Create and activate a virtual environment**

```bash
python -m venv .venv
```

<details>
<summary><b>Windows (PowerShell)</b></summary>

```powershell
.venv\Scripts\activate
```

If PowerShell blocks the activation script, run this once in the same session:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```
</details>

<details>
<summary><b>macOS / Linux</b></summary>

```bash
source .venv/bin/activate
```
</details>

**Step 3 — Install dependencies**

```bash
pip install -r requirements.txt
```

**Step 4 — Verify the model artifacts are present**

Confirm that `backend/models/` contains all seven `.pkl` files listed in [Serialized Model Artifacts](#4-serialized-model-artifacts). If they are missing, regenerate them by running the notebooks in `backend/notebooks/` from top to bottom.

**Step 5 — Run the FastAPI server**

```bash
uvicorn main:app --reload --port 8000
```

The API is now live:

| Endpoint | URL |
|---|---|
| API root | http://127.0.0.1:8000 |
| Swagger UI | http://127.0.0.1:8000/docs |
| ReDoc | http://127.0.0.1:8000/redoc |

---

### 3️⃣ Frontend Setup (React + Vite)

**Step 1 — Open a new terminal and navigate to the frontend**

```bash
cd frontend
```

**Step 2 — Install dependencies**

```bash
npm install
```

**Step 3 — Configure the API base URL**

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

**Step 4 — Start the development server**

```bash
npm run dev
```

The application will be available at **http://localhost:5173**

**Step 5 — (Optional) Build for production**

```bash
npm run build
npm run preview
```

---

### 4️⃣ Quick Verification Checklist

- [ ] Backend responds at `http://127.0.0.1:8000/docs`
- [ ] All seven `.pkl` artifacts load without error on startup
- [ ] Frontend loads at `http://localhost:5173`
- [ ] Live Weather chapter renders a temperature and an alert badge
- [ ] Island Radar shows all 30 station markers
- [ ] Forecast Studio renders the 7-day composite chart
- [ ] Smart Farming returns ranked crop matches for both Yala and Maha

---

## 🔌 API Reference

> Full interactive documentation is auto-generated by FastAPI at `/docs`.

### Weather Endpoints

| Method | Endpoint | Description |
|:-:|---|---|
| `GET` | `/weather/stations` | Returns all 30 meteorological stations with coordinates and climate zone |
| `GET` | `/weather/live/{city}` | Live prediction for one station — temperature, condition, rainfall (mm), alert level |
| `GET` | `/weather/forecast/{city}` | 7-day forecast — daily temperature, rainfall, wind and precipitation hours |
| `POST` | `/weather/predict` | Raw rainfall prediction from a custom feature payload |

**Example**

```bash
curl http://127.0.0.1:8000/weather/live/Athurugiriya
```

```json
{
  "city": "Athurugiriya",
  "temperature": 26.0,
  "condition": "Heavy Rain",
  "sub_condition": "Light Rain / Cloudy",
  "expected_rainfall_mm": 8.0,
  "rain_probability": 0.99,
  "alert_status": "Low Alert",
  "climate_zone": "Wet Zone"
}
```

### Crop Endpoints

| Method | Endpoint | Description |
|:-:|---|---|
| `POST` | `/crop/smart-recommendation` | Returns ranked crop recommendations with confidence scores |
| `GET` | `/crop/seasons` | Returns cultivation season metadata (Yala / Maha with month ranges) |

**Example**

```bash
curl -X POST http://127.0.0.1:8000/crop/smart-recommendation \
  -H "Content-Type: application/json" \
  -d '{"city": "Athurugiriya", "season": "yala"}'
```

```json
{
  "city": "Athurugiriya",
  "season": "Yala",
  "matches": [
    { "crop": "Papaya", "confidence": 40.0, "match_level": "LOW MATCH" },
    { "crop": "Rice",   "confidence": 33.0, "match_level": "LOW MATCH" },
    { "crop": "Jute",   "confidence": 11.0, "match_level": "LOW MATCH" }
  ],
  "highest_match": "Papaya"
}
```

---

## 📈 Results & Model Performance

| Task | Selected Model | Key Metric | Score |
|---|---|---|:-:|
| Rain occurrence | Gradient Boosting Classifier | Accuracy | ~91% |
| Rainfall volume | Linear Regression Pipeline | R² | ~0.78 |
| Crop recommendation | **Random Forest Classifier** | **Accuracy** | **99.32%** |

### Key EDA findings
- Rainfall distribution is **strongly zero-inflated and right-skewed**, which directly motivated the `log1p` transformation.
- **Climate zone is a dominant signal** — Wet Zone stations show materially different rainfall behaviour from Dry Zone stations, validating zone-aware presentation in the UI.
- **N, P, K and rainfall are the strongest predictors** of crop class; the engineered `total_npk` feature ranked highly in Random Forest feature importance, confirming the aggregation was not cosmetic.
- Temperature and rainfall show a **mild inverse relationship** across the 7-day horizon — visible directly in the Forecast Studio composite chart.

---

### 📚 Deliverables

| Deliverable | Location |
|---|---|
| EDA & weather model notebook | `backend/notebooks/SmartRain_EDA.ipynb` |
| Crop model notebook | `backend/notebooks/Crop_Recommendation_ML.ipynb` |
| Trained models | `backend/models/*.pkl` |
| REST API | `backend/main.py`, `backend/routers/` |
| ML prediction service | `backend/services/` |
| Full-stack frontend | `frontend/src/` |
| Documentation | This `README.md` |

---

## 👥 Team & Contributions

| Member | Role | Primary Contributions |
|---|---|---|
| *Sachini* | ML Engineer | EDA, feature engineering, weather model training & evaluation |
| *Dilmi* | ML Engineer | Crop recommendation model, hyperparameter tuning, model serialization |
| *Dusan* | Backend Developer | FastAPI architecture, routers, Pydantic schemas, prediction services |
| *Rethmi* | Frontend Developer | React UI/UX, chapter architecture, charts, Island Radar, animations |

---

## 🔭 Future Enhancements

- **Live API ingestion** — stream real-time observations instead of relying solely on historical data
- **Deep learning for temporal forecasting** — LSTM / Temporal Fusion Transformer for longer horizons
- **District-level soil data integration** — replace generalised soil profiles with surveyed N-P-K measurements
- **Sinhala & Tamil localisation** — make the platform accessible to farmers in their first language
- **Mobile application** — React Native client for field use
- **Push alerts** — SMS / WhatsApp notifications for severe-weather warnings
- **Model monitoring** — drift detection and scheduled retraining pipeline
- **Containerisation & CI/CD** — Docker Compose plus GitHub Actions for automated testing and deployment

---

## ⚠️ Disclaimer

SmartRain predictions are **informational and academic in nature**. For severe weather warnings and emergency instructions, always refer to official authorities:

- [Department of Meteorology, Sri Lanka](https://www.meteo.gov.lk/)
- [Disaster Management Centre](http://www.dmc.gov.lk/)
- [Department of Agriculture — Crop Calendars](https://doa.gov.lk/)

---

<div align="center">

**🌧️ SmartRain — Weather intelligence for Sri Lanka**

*Built with React, FastAPI and Scikit-learn*

</div>
