import sys
import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.battery import BatteryReading
from app.schemas.battery import (
    BatteryReadingCreate, 
    BatteryReadingOut, 
    RangePredictionResponse
)
from app.security.auth import get_current_user

# Add ml folder to sys.path to enable clean prediction service calls
ML_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ml"))
if ML_DIR not in sys.path:
    sys.path.append(ML_DIR)

from prediction_service import predict_range_and_consumption

router = APIRouter(prefix="/battery", tags=["Battery Intelligence"])


@router.get("/{vehicle_id}/latest", response_model=BatteryReadingOut)
def get_latest_battery_reading(
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

    latest = db.query(BatteryReading).filter(
        BatteryReading.vehicle_id == vehicle_id
    ).order_by(BatteryReading.timestamp.desc()).first()

    if not latest:
        # Create fresh reading
        avail = vehicle.battery_capacity * (vehicle.current_battery_pct / 100.0)
        latest = BatteryReading(
            vehicle_id=vehicle_id,
            soc=vehicle.current_battery_pct,
            soh=95.2,
            voltage=401.5,
            temperature=28.0,
            available_energy=avail,
            data_source="simulated"
        )
        db.add(latest)
        db.commit()
        db.refresh(latest)

    return latest


@router.get("/{vehicle_id}/history", response_model=List[BatteryReadingOut])
def get_battery_history(
    vehicle_id: int,
    limit: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id, 
        Vehicle.user_id == current_user.id
    ).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")

    readings = db.query(BatteryReading).filter(
        BatteryReading.vehicle_id == vehicle_id
    ).order_by(BatteryReading.timestamp.asc()).limit(limit).all()

    return readings


@router.post("/readings", response_model=BatteryReadingOut, status_code=status.HTTP_201_CREATED)
def create_battery_reading(
    reading_in: BatteryReadingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == reading_in.vehicle_id, 
        Vehicle.user_id == current_user.id
    ).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")

    avail = reading_in.available_energy
    if avail is None:
        avail = vehicle.battery_capacity * (reading_in.soc / 100.0)

    reading = BatteryReading(
        vehicle_id=reading_in.vehicle_id,
        soc=reading_in.soc,
        soh=reading_in.soh or 95.0,
        voltage=reading_in.voltage or 400.0,
        temperature=reading_in.temperature or 28.5,
        available_energy=avail,
        data_source=reading_in.data_source or "simulated"
    )
    db.add(reading)

    # Update vehicle's live battery percentage
    vehicle.current_battery_pct = reading_in.soc
    db.commit()
    db.refresh(reading)

    return reading


@router.get("/{vehicle_id}/range-prediction", response_model=RangePredictionResponse)
def get_range_prediction(
    vehicle_id: int,
    speed_kmh: float = Query(65.0, ge=10.0, le=160.0),
    ambient_temp_c: float = Query(24.0, ge=-25.0, le=55.0),
    ac_on: int = Query(1, ge=0, le=1),
    elevation_change_m: float = Query(0.0, ge=-1000.0, le=1000.0),
    payload_weight_kg: float = Query(150.0, ge=0.0, le=600.0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id, 
        Vehicle.user_id == current_user.id
    ).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")

    soc = float(vehicle.current_battery_pct)
    capacity = float(vehicle.battery_capacity)
    total_weight = 1750.0 + payload_weight_kg

    pred = predict_range_and_consumption(
        battery_capacity_kwh=capacity,
        soc=soc,
        speed_kmh=speed_kmh,
        ambient_temp_c=ambient_temp_c,
        ac_on=ac_on,
        elevation_change_m=elevation_change_m,
        vehicle_weight_kg=total_weight,
        historical_avg_consumption=vehicle.efficiency_kwh_km
    )

    return RangePredictionResponse(**pred)
