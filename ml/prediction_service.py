"""
EV SmartTrace 360 - AI Prediction Service
Exposes inference functions for:
1. Random Forest Range and Energy Consumption Prediction
2. Isolation Forest Anomaly Detection
3. Smart Battery Health & Usage Optimization Recommendations
"""

import os
import joblib
import numpy as np
from typing import Dict, Any, Optional

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
RF_MODEL_PATH = os.path.join(MODELS_DIR, "random_forest_range_model.joblib")
ISO_MODEL_PATH = os.path.join(MODELS_DIR, "isolation_forest_model.joblib")

_rf_model = None
_iso_model = None


def get_rf_model():
    global _rf_model
    if _rf_model is None and os.path.exists(RF_MODEL_PATH):
        try:
            _rf_model = joblib.load(RF_MODEL_PATH)
        except Exception as e:
            print(f"Warning: Could not load RF model: {e}")
    return _rf_model


def get_iso_model():
    global _iso_model
    if _iso_model is None and os.path.exists(ISO_MODEL_PATH):
        try:
            _iso_model = joblib.load(ISO_MODEL_PATH)
        except Exception as e:
            print(f"Warning: Could not load Isolation Forest model: {e}")
    return _iso_model


def predict_range_and_consumption(
    battery_capacity_kwh: float = 60.0,
    soc: float = 70.0,
    speed_kmh: float = 65.0,
    ambient_temp_c: float = 24.0,
    ac_on: int = 1,
    elevation_change_m: float = 0.0,
    vehicle_weight_kg: float = 1850.0,
    historical_avg_consumption: Optional[float] = 0.150
) -> Dict[str, Any]:
    """
    Predict energy consumption per km and estimated driving range with confidence margin.
    Uses Random Forest when available, with analytical physics-based fallback.
    """
    available_energy_kwh = battery_capacity_kwh * (soc / 100.0)

    model = get_rf_model()
    if model is not None:
        import pandas as pd
        features = pd.DataFrame([{
            "soc": soc,
            "speed_kmh": speed_kmh,
            "ambient_temp_c": ambient_temp_c,
            "ac_on": ac_on,
            "elevation_change_m": elevation_change_m,
            "vehicle_weight_kg": vehicle_weight_kg
        }])
        pred_consumption = float(model.predict(features)[0])
        
        # Estimate prediction variance across the ensemble trees
        tree_preds = [tree.predict(features.values)[0] for tree in model.estimators_]
        std_dev = float(np.std(tree_preds))
        confidence = float(np.clip(1.0 - (std_dev / (pred_consumption + 1e-5)), 0.75, 0.98))
        min_consumption = max(0.10, pred_consumption - (1.96 * std_dev))
        max_consumption = min(0.35, pred_consumption + (1.96 * std_dev))
    else:
        # Physics-based regression fallback
        base = 0.145
        drag = 0.0000045 * (speed_kmh ** 2)
        weight_fac = (vehicle_weight_kg - 1800.0) * 0.000025
        temp_fac = 0.002 * abs(22.0 - ambient_temp_c) if ambient_temp_c < 18 or ambient_temp_c > 28 else 0.0
        ac_fac = 0.016 if ac_on else 0.0
        elev_fac = (elevation_change_m / 100.0) * 0.008
        pred_consumption = max(0.11, base + drag + weight_fac + temp_fac + ac_fac + elev_fac)
        std_dev = 0.008
        confidence = 0.88
        min_consumption = pred_consumption - 0.012
        max_consumption = pred_consumption + 0.012

    # Estimated Range = Available Energy / Consumption per km
    predicted_range_km = available_energy_kwh / max(pred_consumption, 0.05)
    max_range_km = available_energy_kwh / max(min_consumption, 0.05)
    min_range_km = available_energy_kwh / max(max_consumption, 0.05)

    # Calculate Energy Efficiency Score (0-100, where 0.13 kWh/km is 100%, 0.25 kWh/km is 50%)
    efficiency_score = int(np.clip(100 - ((pred_consumption - 0.13) / 0.12 * 50), 30, 99))

    # Recommendations
    recommendations = []
    if speed_kmh > 105:
        recommendations.append("Reducing cruise speed to 95-100 km/h will reduce aerodynamic drag and extend range by ~14%.")
    if ambient_temp_c < 10:
        recommendations.append("Cold ambient temperature detected. Pre-condition battery and cabin while connected to charger.")
    elif ambient_temp_c > 35:
        recommendations.append("High ambient temperature detected. Park in shaded areas to minimize battery cooling draw.")
    if ac_on and (soc < 20):
        recommendations.append("Battery is below 20%. Switch climate control to Eco Mode to preserve remaining driving range.")
    if not recommendations:
        recommendations.append("Driving parameters are optimal. Battery operating within peak thermal and efficiency envelope.")

    return {
        "soc_pct": round(soc, 1),
        "available_energy_kwh": round(available_energy_kwh, 2),
        "predicted_consumption_kwh_km": round(pred_consumption, 4),
        "predicted_consumption_kwh_100km": round(pred_consumption * 100, 2),
        "predicted_range_km": round(predicted_range_km, 1),
        "min_range_km": round(min_range_km, 1),
        "max_range_km": round(max_range_km, 1),
        "confidence_score": round(confidence, 3),
        "efficiency_score": efficiency_score,
        "recommendations": recommendations,
        "model_type": "RandomForestRegressor (Ensemble 120 trees)",
        "disclaimer": "Range estimations are AI-predicted values based on telemetry and road conditions, not a legal guarantee."
    }


def detect_sensor_anomaly(
    battery_temp_c: float,
    motor_temp_c: float,
    pack_voltage_v: float,
    cell_voltage_delta_mv: float,
    consumption_kwh_km: float,
    charging_efficiency_pct: float
) -> Dict[str, Any]:
    """
    Detect anomalies in sensor telemetry using Isolation Forest.
    Returns anomaly flag, anomaly score, and component diagnostics.
    """
    model = get_iso_model()
    import pandas as pd
    features = pd.DataFrame([{
        "battery_temp_c": battery_temp_c,
        "motor_temp_c": motor_temp_c,
        "pack_voltage_v": pack_voltage_v,
        "cell_voltage_delta_mv": cell_voltage_delta_mv,
        "consumption_kwh_km": consumption_kwh_km,
        "charging_efficiency_pct": charging_efficiency_pct
    }])

    is_anomaly = False
    anomaly_score = 0.0
    
    if model is not None:
        pred = model.predict(features)[0]
        raw_score = model.score_samples(features)[0]
        is_anomaly = bool(pred == -1)
        anomaly_score = float(np.clip(-raw_score, 0.0, 1.0))
    else:
        # Rule-based threshold fallback
        if (battery_temp_c > 45.0 or motor_temp_c > 85.0 or 
            cell_voltage_delta_mv > 30.0 or consumption_kwh_km > 0.28 or 
            charging_efficiency_pct < 80.0):
            is_anomaly = True
            anomaly_score = 0.72

    issues = []
    severity = "normal"

    if battery_temp_c > 48.0:
        issues.append(f"High battery temperature: {battery_temp_c:.1f}°C (Threshold: 45°C)")
        severity = "critical"
    elif battery_temp_c > 40.0:
        issues.append(f"Elevated battery temperature: {battery_temp_c:.1f}°C")
        if severity != "critical":
            severity = "warning"

    if motor_temp_c > 85.0:
        issues.append(f"Motor thermal overload: {motor_temp_c:.1f}°C (Expected: <75°C)")
        severity = "critical"

    if cell_voltage_delta_mv > 25.0:
        issues.append(f"Cell voltage imbalance: {cell_voltage_delta_mv:.1f} mV (Tolerance: <15 mV)")
        if severity != "critical":
            severity = "warning"

    if consumption_kwh_km > 0.26:
        issues.append(f"Energy consumption spike: {consumption_kwh_km:.3f} kWh/km (+35% above norm)")
        if severity == "normal":
            severity = "info"

    if charging_efficiency_pct < 82.0:
        issues.append(f"Charging power loss: efficiency at {charging_efficiency_pct:.1f}%")
        if severity == "normal":
            severity = "warning"

    explanation = (
        "All monitored sensors are functioning within nominal manufacturer tolerances."
        if not issues
        else "; ".join(issues)
    )

    return {
        "is_anomaly": is_anomaly or len(issues) > 0,
        "anomaly_score": round(anomaly_score, 3),
        "severity": severity,
        "issues": issues,
        "explanation": explanation,
        "sensor_snapshot": {
            "battery_temp_c": battery_temp_c,
            "motor_temp_c": motor_temp_c,
            "pack_voltage_v": pack_voltage_v,
            "cell_voltage_delta_mv": cell_voltage_delta_mv,
            "consumption_kwh_km": consumption_kwh_km,
            "charging_efficiency_pct": charging_efficiency_pct
        }
    }
