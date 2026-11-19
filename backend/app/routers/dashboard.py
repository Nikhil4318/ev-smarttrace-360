import sys
import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.battery import BatteryReading
from app.models.charging import ChargingStation, ChargingSession
from app.models.energy import EnergyConsumption
from app.models.diagnostics import VehicleDiagnostic
from app.models.notifications import Notification
from app.schemas.dashboard import DashboardStatsResponse, NotificationOut
from app.schemas.vehicle import VehicleOut
from app.schemas.battery import BatteryReadingOut
from app.security.auth import get_current_user
from app.services.simulation_service import seed_demo_vehicle_if_empty

ML_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ml"))
if ML_DIR not in sys.path:
    sys.path.append(ML_DIR)

from prediction_service import predict_range_and_consumption

router = APIRouter(prefix="/dashboard", tags=["Main Dashboard"])


@router.get("/cockpit-themes")
def get_cockpit_themes():
    """Returns the backend theme definitions and telemetry color maps"""
    return [
        {
            "id": "monochrome",
            "name": "Monochrome Noir",
            "tagline": "Pure Black & White Minimalist Cockpit",
            "palette": {
                "primary": "#ffffff",
                "secondary": "#cbd5e1",
                "accent": "#94a3b8",
                "background": "#030303",
                "card": "rgba(10, 10, 10, 0.85)"
            },
            "telemetry_glow": "0 0 25px rgba(255, 255, 255, 0.35)",
            "acoustic_profile": "Precision Acoustic Monolith"
        },
        {
            "id": "ceramic",
            "name": "Ceramic Aero White",
            "tagline": "Lucid Minimalist Pearl & Pure Glacier EV",
            "palette": {
                "primary": "#0284c7",
                "secondary": "#059669",
                "accent": "#7c3aed",
                "background": "#f8fafc",
                "card": "rgba(255, 255, 255, 0.88)"
            },
            "telemetry_glow": "0 0 25px rgba(2, 132, 199, 0.25)",
            "acoustic_profile": "Aero Glider Acoustic Silence"
        },
        {
            "id": "aurora",
            "name": "Aurora Electric",
            "tagline": "Nordic Ionosphere & Lithium Flux",
            "palette": {
                "primary": "#00ff9d",
                "secondary": "#00f0ff",
                "accent": "#8b5cf6",
                "background": "#050814",
                "card": "rgba(8, 14, 32, 0.72)"
            },
            "telemetry_glow": "0 0 25px rgba(0, 255, 157, 0.4)",
            "acoustic_profile": "Nordic Ambient Whisper"
        },
        {
            "id": "cyber",
            "name": "Cyber Obsidian",
            "tagline": "Formula-E Night Racing & Stealth Carbon",
            "palette": {
                "primary": "#00ff87",
                "secondary": "#00e5ff",
                "accent": "#3b82f6",
                "background": "#07090e",
                "card": "rgba(15, 23, 42, 0.75)"
            },
            "telemetry_glow": "0 0 25px rgba(0, 255, 135, 0.4)",
            "acoustic_profile": "High-Frequency Pulse"
        },
        {
            "id": "solaris",
            "name": "Solaris Kinetic",
            "tagline": "Clean Solar Energy & Amber Pulse",
            "palette": {
                "primary": "#fbbf24",
                "secondary": "#f97316",
                "accent": "#38bdf8",
                "background": "#0a0a0f",
                "card": "rgba(22, 18, 12, 0.75)"
            },
            "telemetry_glow": "0 0 25px rgba(245, 158, 11, 0.4)",
            "acoustic_profile": "Warm Solar Harmonic"
        },
        {
            "id": "quantum",
            "name": "Quantum Nebula",
            "tagline": "Deep Autonomous AI & Plasma Flux",
            "palette": {
                "primary": "#c084fc",
                "secondary": "#60a5fa",
                "accent": "#f472b6",
                "background": "#080514",
                "card": "rgba(18, 11, 34, 0.75)"
            },
            "telemetry_glow": "0 0 25px rgba(192, 132, 252, 0.4)",
            "acoustic_profile": "Sub-atomic Resonance"
        }
    ]


@router.get("/{vehicle_id}", response_model=DashboardStatsResponse)
def get_dashboard_summary(
    vehicle_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id, 
        Vehicle.user_id == current_user.id
    ).first()

    if not vehicle:
        vehicle = seed_demo_vehicle_if_empty(db, current_user.id)

    # Latest battery reading
    latest_battery = db.query(BatteryReading).filter(
        BatteryReading.vehicle_id == vehicle.id
    ).order_by(BatteryReading.timestamp.desc()).first()

    if not latest_battery:
        avail = vehicle.battery_capacity * (vehicle.current_battery_pct / 100.0)
        latest_battery = BatteryReading(
            vehicle_id=vehicle.id,
            soc=vehicle.current_battery_pct,
            soh=95.2,
            voltage=401.5,
            temperature=27.8,
            available_energy=avail,
            data_source="simulated"
        )
        db.add(latest_battery)
        db.commit()
        db.refresh(latest_battery)

    # ML Range Prediction
    pred = predict_range_and_consumption(
        battery_capacity_kwh=vehicle.battery_capacity,
        soc=vehicle.current_battery_pct,
        speed_kmh=65.0,
        ambient_temp_c=24.0,
        ac_on=1,
        elevation_change_m=0.0,
        vehicle_weight_kg=1850.0,
        historical_avg_consumption=vehicle.efficiency_kwh_km
    )

    # Check vehicle diagnostics status
    diagnostics = db.query(VehicleDiagnostic).filter(
        VehicleDiagnostic.vehicle_id == vehicle.id
    ).all()
    criticals = [d for d in diagnostics if d.severity == "critical"]
    warnings = [d for d in diagnostics if d.severity == "warning"]

    if criticals:
        health_status = "Critical"
        health_score = 68
    elif warnings:
        health_status = "Attention Needed"
        health_score = 88
    else:
        health_status = "Optimal"
        health_score = 97

    # Charging state
    soc = float(vehicle.current_battery_pct)
    if soc >= 99.0:
        charging_status = "Fully Charged"
        charging_eta = "Complete"
    elif soc < 80.0:
        charging_status = "Disconnected"
        charging_eta = "32 mins to 80% on 150 kW DC Fast"
    else:
        charging_status = "Disconnected"
        charging_eta = "Recommended 80% daily charge achieved"

    # Energy trend data (last 7 records)
    energy_records = db.query(EnergyConsumption).filter(
        EnergyConsumption.vehicle_id == vehicle.id
    ).order_by(EnergyConsumption.timestamp.desc()).limit(7).all()
    energy_records.reverse()

    trend = []
    for r in energy_records:
        trend.append({
            "date": r.timestamp.strftime("%a"),
            "distance_km": r.distance_km,
            "consumption_kwh_km": r.consumption_per_km,
            "energy_kwh": r.energy_consumed_kwh
        })
    if not trend:
        trend = [
            {"date": "Mon", "distance_km": 42.0, "consumption_kwh_km": 0.150, "energy_kwh": 6.3},
            {"date": "Tue", "distance_km": 58.0, "consumption_kwh_km": 0.148, "energy_kwh": 8.58},
            {"date": "Wed", "distance_km": 35.0, "consumption_kwh_km": 0.152, "energy_kwh": 5.32},
            {"date": "Thu", "distance_km": 72.0, "consumption_kwh_km": 0.155, "energy_kwh": 11.16},
            {"date": "Fri", "distance_km": 50.0, "consumption_kwh_km": 0.147, "energy_kwh": 7.35},
            {"date": "Sat", "distance_km": 88.0, "consumption_kwh_km": 0.158, "energy_kwh": 13.90},
            {"date": "Sun", "distance_km": 64.0, "consumption_kwh_km": 0.149, "energy_kwh": 9.53},
        ]

    # Recent charging sessions
    sessions = db.query(ChargingSession).filter(
        ChargingSession.vehicle_id == vehicle.id
    ).order_by(ChargingSession.start_time.desc()).limit(3).all()

    sessions_data = []
    for s in sessions:
        sessions_data.append({
            "id": s.id,
            "date": s.start_time.strftime("%b %d"),
            "energy_kwh": s.energy_kwh,
            "cost_usd": s.total_cost,
            "power_kw": s.charging_power,
            "soc_gain": f"{int(s.start_soc)}% -> {int(s.end_soc)}%"
        })

    # Stations count
    station_count = db.query(ChargingStation).count()

    # User notifications
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(5).all()

    return DashboardStatsResponse(
        vehicle=VehicleOut.from_orm(vehicle),
        latest_battery=BatteryReadingOut.from_orm(latest_battery),
        estimated_range_km=pred["predicted_range_km"],
        range_confidence=pred["confidence_score"],
        health_score=health_score,
        charging_status=charging_status,
        estimated_charging_completion=charging_eta,
        vehicle_health_status=health_status,
        upcoming_charging_recommendations=pred["recommendations"],
        recent_energy_trend=trend,
        recent_charging_sessions=sessions_data,
        nearby_stations_count=station_count,
        notifications=[NotificationOut.from_orm(n) for n in notifs],
        is_demo_mode=bool(vehicle.is_demo)
    )
