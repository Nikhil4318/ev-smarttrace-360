from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.charging import ChargingStation
from app.models.routes import RouteHistory, RouteChargingStop
from app.schemas.routes import RouteOptimizeRequest, RouteOptimizeResponse
from app.security.auth import get_current_user
from app.services.route_service import optimize_ev_routes

router = APIRouter(prefix="/routes", tags=["AI Smart Route Optimization"])


@router.post("/optimize", response_model=RouteOptimizeResponse)
def optimize_routes(
    req: RouteOptimizeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == req.vehicle_id, 
        Vehicle.user_id == current_user.id
    ).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")

    current_soc = req.current_battery_pct if req.current_battery_pct is not None else float(vehicle.current_battery_pct)
    desired_arrival = req.desired_arrival_pct if req.desired_arrival_pct is not None else 15.0

    stations = db.query(ChargingStation).all()
    if not stations:
        # Seed charging stations if empty
        s1 = ChargingStation(
            station_name="Supercharge Hub - Silicon Metro",
            address="101 Tech Blvd, Metro Central",
            latitude=37.7749,
            longitude=-122.4194,
            operator="Tesla Supercharger",
            charging_power=250.0,
            connector_type="CCS2 / NACS",
            availability_status="Available (8/12 Open)",
            pricing_per_kwh=0.32
        )
        s2 = ChargingStation(
            station_name="Electrify Express - Harbor Bay",
            address="450 Marina Way, Bayside",
            latitude=37.7891,
            longitude=-122.4014,
            operator="Electrify America",
            charging_power=150.0,
            connector_type="CCS2 / CHAdeMO",
            availability_status="Available (4/6 Open)",
            pricing_per_kwh=0.35
        )
        s3 = ChargingStation(
            station_name="GreenGrid Fast Charge - Sunset Point",
            address="820 Ocean Ave, West Coast",
            latitude=37.7601,
            longitude=-122.4822,
            operator="EVgo",
            charging_power=100.0,
            connector_type="CCS2 / Type 2",
            availability_status="Available (2/4 Open)",
            pricing_per_kwh=0.28
        )
        db.add_all([s1, s2, s3])
        db.commit()
        stations = db.query(ChargingStation).all()

    result = optimize_ev_routes(
        vehicle=vehicle,
        origin=req.origin,
        destination=req.destination,
        current_battery_pct=current_soc,
        desired_arrival_pct=desired_arrival,
        available_stations=stations
    )

    # Save to route history
    rec_route = next((r for r in result.routes if r.route_id == result.recommended_route_id), result.routes[0])
    history_entry = RouteHistory(
        vehicle_id=vehicle.id,
        origin=req.origin,
        destination=req.destination,
        total_distance=rec_route.distance_km,
        estimated_energy=rec_route.estimated_energy_kwh,
        estimated_duration=rec_route.total_time_minutes,
        selected_route=rec_route.title
    )
    db.add(history_entry)
    db.commit()
    db.refresh(history_entry)

    # Save stops if any
    for stop in rec_route.charging_stops:
        db_stop = RouteChargingStop(
            route_id=history_entry.id,
            station_id=stop.station.id,
            stop_order=stop.stop_order,
            estimated_arrival_soc=stop.estimated_arrival_soc,
            estimated_charging_duration=stop.estimated_charging_duration_min,
            target_soc=stop.target_soc
        )
        db.add(db_stop)
    db.commit()

    return result


@router.get("/history")
def get_routes_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    routes = (
        db.query(RouteHistory)
        .join(Vehicle, RouteHistory.vehicle_id == Vehicle.id)
        .filter(Vehicle.user_id == current_user.id)
        .order_by(RouteHistory.created_at.desc())
        .limit(15)
        .all()
    )
    return routes
