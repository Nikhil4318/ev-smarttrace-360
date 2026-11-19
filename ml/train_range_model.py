"""
EV SmartTrace 360 - Random Forest Range & Consumption Prediction Model
Trains a Random Forest Regressor using synthetic and historical EV drive cycles
incorporating temperature, velocity, climate control (AC), payload, and battery SOC.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

DATA_DIR = os.path.join(os.path.dirname(__file__), "datasets")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)


def generate_synthetic_ev_dataset(num_samples: int = 5000) -> pd.DataFrame:
    """
    Generate realistic EV drive cycle data.
    Features:
    - soc: State of Charge (10% - 100%)
    - speed_kmh: Average speed (15 - 130 km/h)
    - ambient_temp_c: Ambient temperature (-10 to 45 deg C)
    - ac_on: Air conditioning / heating active (0 or 1)
    - elevation_change_m: Net elevation gain/loss per trip (-500 to +500 m)
    - vehicle_weight_kg: Vehicle curb + payload (1600 - 2300 kg)
    - battery_capacity_kwh: Standard 60.0 kWh (nominal)
    Target:
    - consumption_kwh_per_km: Actual kWh consumed per km (nominal 0.13 - 0.25 kWh/km)
    """
    np.random.seed(42)
    soc = np.random.uniform(10.0, 100.0, num_samples)
    speed = np.random.uniform(20.0, 125.0, num_samples)
    temp = np.random.uniform(-5.0, 42.0, num_samples)
    ac = np.random.choice([0, 1], size=num_samples, p=[0.35, 0.65])
    elevation = np.random.uniform(-300.0, 300.0, num_samples)
    weight = np.random.uniform(1700.0, 2200.0, num_samples)
    
    # Base consumption of 60 kWh class EV (~0.145 kWh/km at 50 km/h, 22 deg C)
    base_consumption = 0.145
    
    # Aerodynamic drag factor: proportional to speed squared
    aero_drag = 0.0000045 * (speed ** 2)
    
    # Rolling resistance and weight factor
    weight_factor = (weight - 1800.0) * 0.000025
    
    # Temperature impact: NMC battery and cabin heating/cooling (HVAC penalty)
    temp_penalty = np.where(
        temp < 15.0,
        (15.0 - temp) * 0.0022,  # cold battery & heating resistance
        np.where(temp > 30.0, (temp - 30.0) * 0.0018, 0.0) # active cooling & AC
    )
    
    # AC usage
    ac_penalty = ac * 0.018
    
    # Potential energy delta from elevation
    elevation_penalty = (elevation / 100.0) * 0.008
    
    # Noise/random traffic variability
    noise = np.random.normal(0, 0.006, num_samples)
    
    consumption = (
        base_consumption 
        + aero_drag 
        + weight_factor 
        + temp_penalty 
        + ac_penalty 
        + elevation_penalty 
        + noise
    )
    # Clip to physically realistic EV consumption range [0.10, 0.35] kWh/km
    consumption = np.clip(consumption, 0.10, 0.35)
    
    df = pd.DataFrame({
        "soc": np.round(soc, 1),
        "speed_kmh": np.round(speed, 1),
        "ambient_temp_c": np.round(temp, 1),
        "ac_on": ac,
        "elevation_change_m": np.round(elevation, 1),
        "vehicle_weight_kg": np.round(weight, 1),
        "consumption_kwh_per_km": np.round(consumption, 4)
    })
    
    return df


def train_model():
    print("Generating synthetic EV telemetry dataset...")
    df = generate_synthetic_ev_dataset(6000)
    dataset_path = os.path.join(DATA_DIR, "ev_drive_cycles.csv")
    df.to_csv(dataset_path, index=False)
    print(f"Saved dataset to {dataset_path}")

    features = ["soc", "speed_kmh", "ambient_temp_c", "ac_on", "elevation_change_m", "vehicle_weight_kg"]
    X = df[features]
    y = df["consumption_kwh_per_km"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training Random Forest Regressor for EV range and consumption...")
    rf = RandomForestRegressor(
        n_estimators=120,
        max_depth=12,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"Model Evaluation -> MSE: {mse:.6f}, R2 Score: {r2:.4f}")

    model_path = os.path.join(MODELS_DIR, "random_forest_range_model.joblib")
    joblib.dump(rf, model_path)
    print(f"Model saved successfully to {model_path}")


if __name__ == "__main__":
    train_model()
