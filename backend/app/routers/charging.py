import math
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.charging import ChargingStation, ChargingSession
from app.schemas.charging import (
    ChargingSessionCreate, 
    ChargingSessionOut, 
    ChargingEstimateResponse, 
    ChargingStationOut
)
from app.security.auth import get_current_user

router = APIRouter(tags=["Charging & Stations"])


@router.get("/charging/{vehicle_id}/sessions", response_model=List[ChargingSessionOut])
def get_charging_sessions(
    vehicle_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id, 
        Vehicle.user_id == current_user.id
    ).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")

    sessions = db.query(ChargingSession).filter(
        ChargingSession.vehicle_id == vehicle_id
    ).order_by(ChargingSession.start_time.desc()).all()

    return sessions


@router.post("/charging/sessions", response_model=ChargingSessionOut, status_code=status.HTTP_201_CREATED)
def create_charging_session(
    session_in: ChargingSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == session_in.vehicle_id, 
        Vehicle.user_id == current_user.id
    ).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")

    tariff = session_in.electricity_tariff or 0.25
    cost = round(session_in.energy_kwh * tariff, 2)

    session = ChargingSession(
        vehicle_id=session_in.vehicle_id,
        station_id=session_in.station_id,
        start_time=session_in.start_time,
        end_time=session_in.end_time,
        start_soc=session_in.start_soc,
        end_soc=session_in.end_soc,
        energy_kwh=session_in.energy_kwh,
        charging_power=session_in.charging_power,
        electricity_tariff=tariff,
        total_cost=cost,
        session_status=session_in.session_status or "completed",
        efficiency_estimate=93.2
    )
    db.add(session)

    # Update vehicle's current battery
    vehicle.current_battery_pct = session_in.end_soc
    db.commit()
    db.refresh(session)

    return session


@router.get("/charging/{vehicle_id}/estimate", response_model=ChargingEstimateResponse)
def estimate_charging_time(
    vehicle_id: int,
    target_soc: float = Query(80.0, ge=10.0, le=100.0),
    charging_power_kw: Optional[float] = Query(None, ge=3.0, le=350.0),
    tariff: float = Query(0.25, ge=0.01, le=2.0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id, 
        Vehicle.user_id == current_user.id
    ).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")

    current_soc = float(vehicle.current_battery_pct)
    battery_capacity = float(vehicle.battery_capacity)

    # If target is less than current SOC
    if target_soc <= current_soc:
        return ChargingEstimateResponse(
            current_soc=current_soc,
            target_soc=target_soc,
            battery_capacity_kwh=battery_capacity,
            required_energy_kwh=0.0,
            charging_power_kw=charging_power_kw or vehicle.max_charging_power,
            estimated_duration_minutes=0,
            estimated_duration_formatted="0 mins (Already at target)",
            estimated_cost_usd=0.0,
            electricity_tariff=tariff,
            charging_losses_kwh=0.0,
            effective_power_kw=charging_power_kw or vehicle.max_charging_power
        )

    # Required Energy = Battery Capacity × (Target SOC - Current SOC) / 100
    delta_soc = target_soc - current_soc
    required_net_energy = battery_capacity * (delta_soc / 100.0)

    # Account for 8% charging thermal and AC/DC conversion loss
    charging_efficiency = 0.92
    metered_energy = required_net_energy / charging_efficiency
    charging_losses = metered_energy - required_net_energy

    # Max power limited by charger AND vehicle onboard inverter/BMS
    available_power = charging_power_kw if charging_power_kw is not None else float(vehicle.max_charging_power)
    effective_power = min(available_power, float(vehicle.max_charging_power))

    # Constant Current / Constant Voltage (CC-CV) taper taper factor above 80% SOC
    if target_soc > 80.0:
        # Power ramps down to preserve cell anode health in top 20%
        effective_power = effective_power * 0.72

    hours = metered_energy / max(effective_power, 1.0)
    minutes = int(math.ceil(hours * 60))

    hrs_part = minutes // 60
    mins_part = minutes % 60
    formatted = f"{hrs_part}h {mins_part}m" if hrs_part > 0 else f"{mins_part} mins"

    cost = round(metered_energy * tariff, 2)

    return ChargingEstimateResponse(
        current_soc=current_soc,
        target_soc=target_soc,
        battery_capacity_kwh=battery_capacity,
        required_energy_kwh=round(required_net_energy, 2),
        charging_power_kw=available_power,
        estimated_duration_minutes=minutes,
        estimated_duration_formatted=formatted,
        estimated_cost_usd=cost,
        electricity_tariff=tariff,
        charging_losses_kwh=round(charging_losses, 2),
        effective_power_kw=round(effective_power, 1)
    )


@router.get("/stations/nearby", response_model=List[ChargingStationOut])
def get_nearby_stations(
    lat: Optional[float] = Query(37.7749),
    lng: Optional[float] = Query(-122.4194),
    connector_type: Optional[str] = Query(None),
    min_power: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(ChargingStation)
    if connector_type and connector_type != "All":
        query = query.filter(ChargingStation.connector_type.ilike(f"%{connector_type}%"))
    if min_power:
        query = query.filter(ChargingStation.charging_power >= min_power)

    stations = query.all()

    # Calculate distance for each station
    results = []
    for s in stations:
        # Distance calculation
        dlat = math.radians(s.latitude - lat)
        dlon = math.radians(s.longitude - lng)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat)) * math.cos(math.radians(s.latitude)) * math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        dist_km = round(6371.0 * c, 1)

        station_dict = ChargingStationOut.from_orm(s)
        station_dict.distance_km = dist_km
        results.append(station_dict)

    # Sort by nearest
    results.sort(key=lambda x: x.distance_km or 999.0)
    return results
