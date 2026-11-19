from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.battery import BatteryReading
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleOut
from app.security.auth import get_current_user
from app.services.simulation_service import seed_demo_vehicle_if_empty

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.get("", response_model=List[VehicleOut])
def get_user_vehicles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicles = db.query(Vehicle).filter(Vehicle.user_id == current_user.id).all()
    if not vehicles:
        seed_demo_vehicle_if_empty(db, current_user.id)
        vehicles = db.query(Vehicle).filter(Vehicle.user_id == current_user.id).all()
    return vehicles


@router.post("", response_model=VehicleOut, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_in: VehicleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Vehicle).filter(Vehicle.vehicle_identifier == vehicle_in.vehicle_identifier).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A vehicle with this VIN / identifier is already registered."
        )

    vehicle = Vehicle(
        user_id=current_user.id,
        vehicle_name=vehicle_in.vehicle_name,
        manufacturer=vehicle_in.manufacturer,
        model=vehicle_in.model,
        vehicle_type=vehicle_in.vehicle_type,
        battery_capacity=vehicle_in.battery_capacity,
        battery_chemistry=vehicle_in.battery_chemistry,
        max_charging_power=vehicle_in.max_charging_power,
        connector_types=vehicle_in.connector_types,
        vehicle_identifier=vehicle_in.vehicle_identifier,
        current_battery_pct=vehicle_in.current_battery_pct,
        efficiency_kwh_km=vehicle_in.efficiency_kwh_km,
        is_demo=False
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)

    # Add initial battery reading
    init_reading = BatteryReading(
        vehicle_id=vehicle.id,
        soc=vehicle.current_battery_pct,
        soh=95.0,
        voltage=400.0,
        temperature=28.0,
        available_energy=vehicle.battery_capacity * (vehicle.current_battery_pct / 100.0),
        data_source="real"
    )
    db.add(init_reading)
    db.commit()

    return vehicle


@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(
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
    return vehicle


@router.put("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(
    vehicle_id: int,
    vehicle_in: VehicleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id, 
        Vehicle.user_id == current_user.id
    ).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")

    update_data = vehicle_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(vehicle, field, val)

    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
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

    db.delete(vehicle)
    db.commit()
    return None
