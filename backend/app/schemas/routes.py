from typing import List, Optional
from pydantic import BaseModel
from app.schemas.charging import ChargingStationOut


class RouteOptimizeRequest(BaseModel):
    vehicle_id: int
    origin: str
    destination: str
    current_battery_pct: Optional[float] = None # Uses vehicle current if None
    desired_arrival_pct: Optional[float] = 15.0


class RouteChargingStopDetail(BaseModel):
    stop_order: int
    station: ChargingStationOut
    estimated_arrival_soc: float
    estimated_charging_duration_min: int
    target_soc: float
    added_range_km: float


class RouteOption(BaseModel):
    route_id: str
    title: str # "Fastest Route", "Lowest Energy Route", "Recommended Balanced Route"
    badge: str
    distance_km: float
    driving_time_minutes: int
    charging_time_minutes: int
    total_time_minutes: int
    estimated_energy_kwh: float
    arrival_battery_pct: float
    charging_stops_count: int
    charging_stops: List[RouteChargingStopDetail]
    co2_saved_kg: float
    summary: str
    waypoints: List[List[float]] # [lat, lng] pairs for map polyline rendering


class RouteOptimizeResponse(BaseModel):
    vehicle_id: int
    origin: str
    destination: str
    current_battery_pct: float
    estimated_available_energy_kwh: float
    routes: List[RouteOption]
    recommended_route_id: str
