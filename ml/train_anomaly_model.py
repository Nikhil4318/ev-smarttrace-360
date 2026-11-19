"""
EV SmartTrace 360 - Isolation Forest Anomaly Detection Model
Trains an Isolation Forest to detect abnormal sensor readings, battery thermal spikes,
and unusual energy consumption patterns.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

DATA_DIR = os.path.join(os.path.dirname(__file__), "datasets")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)


def generate_sensor_telemetry_dataset(num_samples: int = 4000) -> pd.DataFrame:
    """
    Generate normal and anomalous sensor telemetry:
    - battery_temp_c: normal 20-38°C, anomalous > 45°C
    - motor_temp_c: normal 40-75°C, anomalous > 85°C
    - pack_voltage_v: normal 380-420V
    - cell_voltage_delta_mv: normal 2-15 mV, anomalous > 30 mV
    - consumption_kwh_km: normal 0.12 - 0.22, anomalous > 0.32
    - charging_efficiency_pct: normal 88 - 96%, anomalous < 80%
    """
    np.random.seed(101)
    
    # 95% normal operation
    n_normal = int(num_samples * 0.95)
    n_anomalous = num_samples - n_normal

    # Normal samples
    battery_temp_norm = np.random.normal(28.0, 4.0, n_normal)
    motor_temp_norm = np.random.normal(55.0, 7.0, n_normal)
    pack_voltage_norm = np.random.normal(400.0, 10.0, n_normal)
    cell_delta_norm = np.random.uniform(3.0, 14.0, n_normal)
    consumption_norm = np.random.normal(0.155, 0.02, n_normal)
    charging_eff_norm = np.random.uniform(90.0, 95.0, n_normal)

    # Anomalous samples (overheating, cell unbalance, excessive resistance)
    battery_temp_anom = np.random.uniform(46.0, 68.0, n_anomalous)
    motor_temp_anom = np.random.uniform(85.0, 115.0, n_anomalous)
    v_low = np.random.uniform(310.0, 340.0, n_anomalous // 2)
    v_high = np.random.uniform(435.0, 460.0, n_anomalous - (n_anomalous // 2))
    pack_voltage_anom = np.concatenate([v_low, v_high])
    cell_delta_anom = np.random.uniform(35.0, 90.0, n_anomalous)
    consumption_anom = np.random.uniform(0.32, 0.52, n_anomalous)
    charging_eff_anom = np.random.uniform(62.0, 78.0, n_anomalous)

    battery_temp = np.concatenate([battery_temp_norm, battery_temp_anom])
    motor_temp = np.concatenate([motor_temp_norm, motor_temp_anom])
    pack_voltage = np.concatenate([pack_voltage_norm, pack_voltage_anom])
    cell_delta = np.concatenate([cell_delta_norm, cell_delta_anom])
    consumption = np.concatenate([consumption_norm, consumption_anom])
    charging_eff = np.concatenate([charging_eff_norm, charging_eff_anom])

    df = pd.DataFrame({
        "battery_temp_c": np.round(battery_temp, 2),
        "motor_temp_c": np.round(motor_temp, 2),
        "pack_voltage_v": np.round(pack_voltage, 1),
        "cell_voltage_delta_mv": np.round(cell_delta, 1),
        "consumption_kwh_km": np.round(consumption, 4),
        "charging_efficiency_pct": np.round(charging_eff, 1)
    })
    
    return df


def train_anomaly_model():
    print("Generating telemetry dataset for Isolation Forest...")
    df = generate_sensor_telemetry_dataset()
    dataset_path = os.path.join(DATA_DIR, "sensor_telemetry.csv")
    df.to_csv(dataset_path, index=False)
    print(f"Saved dataset to {dataset_path}")

    features = [
        "battery_temp_c", 
        "motor_temp_c", 
        "pack_voltage_v", 
        "cell_voltage_delta_mv", 
        "consumption_kwh_km", 
        "charging_efficiency_pct"
    ]
    X = df[features]

    print("Training Isolation Forest Anomaly Detector...")
    iso = IsolationForest(
        n_estimators=100,
        contamination=0.06,
        random_state=42,
        n_jobs=-1
    )
    iso.fit(X)

    model_path = os.path.join(MODELS_DIR, "isolation_forest_model.joblib")
    joblib.dump(iso, model_path)
    print(f"Isolation Forest model saved to {model_path}")


if __name__ == "__main__":
    train_anomaly_model()
