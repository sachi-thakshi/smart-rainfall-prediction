import os

# Base Directory & Folders
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")

# Dataset Path
DATASET_PATH = os.path.join(DATA_DIR, "SriLanka_Weather_Dataset.csv")

# Model Paths
CLASSIFIER_PATH = os.path.join(MODEL_DIR, "rain_classifier.pkl")
REGRESSOR_PATH = os.path.join(MODEL_DIR, "rain_regressor.pkl")
FEATURES_PATH = os.path.join(MODEL_DIR, "feature_columns.pkl")
CROP_CLF_PATH = os.path.join(MODEL_DIR, "crop_classifier.pkl")
CROP_SCALER_PATH = os.path.join(MODEL_DIR, "crop_scaler.pkl")
CROP_LE_PATH = os.path.join(MODEL_DIR, "crop_label_encoder.pkl")

# Advanced Nested Soil Profiles
SOIL_PROFILES_NESTED = {
    "matara": {
        "matara": {"N": 40, "P": 32, "K": 36, "ph": 6.1, "humidity": 81.0},
        "walgama": {"N": 40, "P": 32, "K": 36, "ph": 6.1, "humidity": 81.0},
        "nupe": {"N": 42, "P": 31, "K": 37, "ph": 6.0, "humidity": 82.0},
        "akuressa": {"N": 48, "P": 35, "K": 39, "ph": 6.2, "humidity": 79.0},
        "gandara": {"N": 39, "P": 30, "K": 35, "ph": 6.0, "humidity": 82.0},
        "dikwella": {"N": 42, "P": 32, "K": 37, "ph": 6.1, "humidity": 81.0},
        "hakmana": {"N": 46, "P": 34, "K": 38, "ph": 6.2, "humidity": 78.0},
        "kamburupitiya": {"N": 44, "P": 33, "K": 37, "ph": 6.1, "humidity": 80.0},
        "kirinda_puhulwella": {"N": 43, "P": 32, "K": 36, "ph": 6.1, "humidity": 81.0},
        "malimbada": {"N": 45, "P": 34, "K": 38, "ph": 6.1, "humidity": 81.0},
        "welihinda": {"N": 41, "P": 31, "K": 36, "ph": 6.0, "humidity": 82.0},
        "weligama": {"N": 41, "P": 31, "K": 36, "ph": 6.0, "humidity": 81.0}
    },
    "galle": {
        "galle": {"N": 42, "P": 30, "K": 38, "ph": 6.0, "humidity": 82.0},
        "pinnaduwa": {"N": 44, "P": 31, "K": 37, "ph": 6.1, "humidity": 81.0},
        "hikkaduwa": {"N": 40, "P": 29, "K": 35, "ph": 5.9, "humidity": 83.0},
        "ambalangoda": {"N": 41, "P": 30, "K": 36, "ph": 6.0, "humidity": 82.0},
        "elpitiya": {"N": 48, "P": 35, "K": 41, "ph": 5.8, "humidity": 80.0},
        "karandeniya": {"N": 46, "P": 33, "K": 39, "ph": 5.9, "humidity": 81.0},
        "baddegama": {"N": 47, "P": 34, "K": 40, "ph": 6.0, "humidity": 80.0},
        "bentota": {"N": 40, "P": 30, "K": 37, "ph": 6.0, "humidity": 81.0},
        "imaduwa": {"N": 45, "P": 32, "K": 38, "ph": 6.1, "humidity": 81.0},
        "nagoda": {"N": 46, "P": 33, "K": 39, "ph": 6.0, "humidity": 80.0},
        "bope_poddala": {"N": 43, "P": 31, "K": 37, "ph": 6.0, "humidity": 82.0}
    },
    "colombo": {
        "colombo": {"N": 40, "P": 30, "K": 40, "ph": 6.0, "humidity": 80.0},
        "dehiwala": {"N": 39, "P": 29, "K": 38, "ph": 6.0, "humidity": 81.0},
        "wellawatte": {"N": 38, "P": 28, "K": 37, "ph": 6.0, "humidity": 80.0},
        "bambalapitiya": {"N": 39, "P": 29, "K": 38, "ph": 6.1, "humidity": 80.0},
        "borella": {"N": 41, "P": 30, "K": 39, "ph": 6.1, "humidity": 79.0},
        "kotahena": {"N": 40, "P": 29, "K": 39, "ph": 6.0, "humidity": 80.0}
    },
    "kandy": {
        "kandy": {"N": 50, "P": 45, "K": 40, "ph": 6.5, "humidity": 78.0},
        "peradeniya": {"N": 52, "P": 44, "K": 42, "ph": 6.4, "humidity": 80.0},
        "katugastota": {"N": 49, "P": 43, "K": 40, "ph": 6.5, "humidity": 79.0},
        "kundasale": {"N": 51, "P": 46, "K": 41, "ph": 6.5, "humidity": 78.0},
        "ampitiya": {"N": 50, "P": 44, "K": 40, "ph": 6.4, "humidity": 79.0},
        "digana": {"N": 48, "P": 42, "K": 39, "ph": 6.3, "humidity": 80.0}
    },
    "gampaha": {
        "gampaha": {"N": 45, "P": 32, "K": 38, "ph": 6.2, "humidity": 78.0},
        "negombo": {"N": 45, "P": 30, "K": 35, "ph": 6.2, "humidity": 79.0},
        "minuwangoda": {"N": 46, "P": 33, "K": 37, "ph": 6.2, "humidity": 78.0},
        "ja_ela": {"N": 43, "P": 31, "K": 37, "ph": 6.1, "humidity": 80.0},
        "kadawatha": {"N": 44, "P": 32, "K": 38, "ph": 6.2, "humidity": 79.0},
        "wattala": {"N": 42, "P": 30, "K": 37, "ph": 6.1, "humidity": 80.0},
        "kelaniya": {"N": 43, "P": 31, "K": 38, "ph": 6.1, "humidity": 80.0}
    },
    "kalutara": {
        "kalutara": {"N": 38, "P": 28, "K": 35, "ph": 5.8, "humidity": 82.0},
        "panadura": {"N": 39, "P": 29, "K": 36, "ph": 5.9, "humidity": 81.0},
        "beruwala": {"N": 40, "P": 29, "K": 36, "ph": 5.9, "humidity": 82.0},
        "wadduwa": {"N": 38, "P": 28, "K": 35, "ph": 5.8, "humidity": 82.0},
        "horana": {"N": 44, "P": 33, "K": 39, "ph": 6.1, "humidity": 79.0},
        "matugama": {"N": 45, "P": 34, "K": 40, "ph": 6.0, "humidity": 80.0}
    },
    "hambantota": {
        "hambantota": {"N": 70, "P": 35, "K": 25, "ph": 7.0, "humidity": 65.0},
        "tangalle": {"N": 65, "P": 33, "K": 27, "ph": 6.8, "humidity": 68.0},
        "tissamaharama": {"N": 68, "P": 34, "K": 26, "ph": 6.9, "humidity": 67.0},
        "ambalantota": {"N": 69, "P": 35, "K": 25, "ph": 7.0, "humidity": 66.0},
        "beliatta": {"N": 62, "P": 32, "K": 28, "ph": 6.7, "humidity": 69.0},
        "walasmulla": {"N": 60, "P": 34, "K": 30, "ph": 6.6, "humidity": 70.0}
    },
    "badulla": {
        "badulla": {"N": 45, "P": 50, "K": 45, "ph": 6.3, "humidity": 74.0},
        "bandarawela": {"N": 42, "P": 52, "K": 48, "ph": 5.9, "humidity": 78.0},
        "haputale": {"N": 38, "P": 55, "K": 50, "ph": 5.6, "humidity": 82.0},
        "welimada": {"N": 47, "P": 48, "K": 44, "ph": 6.1, "humidity": 76.0},
        "mahiyanganaya": {"N": 55, "P": 43, "K": 35, "ph": 6.5, "humidity": 70.0}
    },
    "hatton": {
        "hatton": {"N": 25, "P": 110, "K": 75, "ph": 5.6, "humidity": 84.0},
        "nuwara_eliya": {"N": 28, "P": 105, "K": 78, "ph": 5.5, "humidity": 86.0},
        "maskeliya": {"N": 24, "P": 112, "K": 76, "ph": 5.4, "humidity": 87.0},
        "dikoya": {"N": 27, "P": 108, "K": 74, "ph": 5.5, "humidity": 85.0}
    },
    "kurunegala": {
        "kurunegala": {"N": 55, "P": 42, "K": 35, "ph": 6.6, "humidity": 72.0},
        "pothuhera": {"N": 55, "P": 42, "K": 35, "ph": 6.6, "humidity": 72.0},
        "kuliyapitiya": {"N": 53, "P": 40, "K": 36, "ph": 6.5, "humidity": 73.0},
        "narammala": {"N": 54, "P": 41, "K": 35, "ph": 6.6, "humidity": 72.0},
        "nikaweratiya": {"N": 58, "P": 43, "K": 32, "ph": 6.7, "humidity": 70.0},
        "wariyapola": {"N": 57, "P": 42, "K": 34, "ph": 6.7, "humidity": 71.0}
    },
    "jaffna": {
        "jaffna": {"N": 75, "P": 25, "K": 20, "ph": 7.5, "humidity": 70.0},
        "chavakachcheri": {"N": 73, "P": 26, "K": 21, "ph": 7.4, "humidity": 69.0},
        "point_pedro": {"N": 78, "P": 24, "K": 19, "ph": 7.6, "humidity": 68.0},
        "karainagar": {"N": 72, "P": 27, "K": 21, "ph": 7.4, "humidity": 70.0},
        "tellippalai": {"N": 74, "P": 25, "K": 20, "ph": 7.5, "humidity": 71.0}
    },
    "mannar": {
        "mannar": {"N": 70, "P": 28, "K": 22, "ph": 7.3, "humidity": 68.0},
        "madhu": {"N": 67, "P": 30, "K": 24, "ph": 7.1, "humidity": 70.0},
        "nanaddan": {"N": 69, "P": 29, "K": 23, "ph": 7.2, "humidity": 69.0}
    },
    "puttalam": {
        "puttalam": {"N": 68, "P": 30, "K": 26, "ph": 7.1, "humidity": 70.0},
        "chilaw": {"N": 63, "P": 31, "K": 28, "ph": 6.9, "humidity": 72.0},
        "kalpitiya": {"N": 66, "P": 29, "K": 25, "ph": 7.2, "humidity": 69.0},
        "anuradhapura_road": {"N": 65, "P": 31, "K": 27, "ph": 7.0, "humidity": 71.0}
    },
    "ratnapura": {
        "ratnapura": {"N": 48, "P": 38, "K": 42, "ph": 5.9, "humidity": 80.0},
        "pelmadulla": {"N": 50, "P": 40, "K": 43, "ph": 5.8, "humidity": 82.0},
        "balangoda": {"N": 46, "P": 39, "K": 41, "ph": 5.9, "humidity": 79.0},
        "embilipitiya": {"N": 55, "P": 36, "K": 35, "ph": 6.3, "humidity": 75.0},
        "kuruwita": {"N": 49, "P": 39, "K": 42, "ph": 5.8, "humidity": 81.0}
    },
    "matale": {
        "matale": {"N": 55, "P": 40, "K": 35, "ph": 6.4, "humidity": 75.0},
        "dambulla": {"N": 60, "P": 38, "K": 32, "ph": 6.7, "humidity": 72.0},
        "galewela": {"N": 57, "P": 39, "K": 34, "ph": 6.6, "humidity": 73.0},
        "rattota": {"N": 50, "P": 42, "K": 38, "ph": 6.2, "humidity": 77.0},
        "yatiwatta": {"N": 53, "P": 41, "K": 36, "ph": 6.3, "humidity": 76.0}
    },
    "trincomalee": {
        "trincomalee": {"N": 65, "P": 35, "K": 30, "ph": 6.8, "humidity": 76.0},
        "kantalai": {"N": 62, "P": 36, "K": 31, "ph": 6.7, "humidity": 75.0},
        "mutur": {"N": 64, "P": 34, "K": 29, "ph": 6.9, "humidity": 77.0},
        "kuchchaveli": {"N": 61, "P": 33, "K": 30, "ph": 6.8, "humidity": 76.0}
    },
    "kalmunai": {
        "kalmunai": {"N": 68, "P": 36, "K": 32, "ph": 6.7, "humidity": 77.0},
        "akkaraipattu": {"N": 65, "P": 35, "K": 31, "ph": 6.6, "humidity": 78.0},
        "sainthamaruthu": {"N": 67, "P": 34, "K": 30, "ph": 6.8, "humidity": 77.0},
        "sammanthurai": {"N": 63, "P": 37, "K": 33, "ph": 6.5, "humidity": 79.0}
    }
}

DEFAULT_SOIL = {"N": 50, "P": 50, "K": 50, "ph": 6.5, "humidity": 75.0}

# Helper Function to Map Area to Main District for Weather
def get_location_details(search_area):
    search_area = search_area.strip().lower()
    for district, areas in SOIL_PROFILES_NESTED.items():
        if search_area in areas:
            # Returns (Parent District for Weather, Specific Soil Profile)
            return district, areas[search_area]
            
    # Fallback if area is not found
    return search_area, DEFAULT_SOIL