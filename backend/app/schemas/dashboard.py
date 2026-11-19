from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.schemas.vehicle import VehicleOut
from app.schemas.battery import BatteryReadingOut
from app.schemas.charging import ChargingStationOut


class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    severity: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStatsResponse(BaseModel):
    vehicle: VehicleOut
    latest_battery: BatteryReadingOut
    estimated_range_km: float
    range_confidence: float
    health_score: int
    charging_status: str # "Disconnected", "Charging", "Fully Charged"
    estimated_charging_completion: Optional[str] = None
    vehicle_health_status: str # "Optimal", "Attention Needed", "Critical"
    upcoming_charging_recommendations: List[str]
    recent_energy_trend: List[Dict[str, Any]]
    recent_charging_sessions: List[Dict[str, Any]]
    nearby_stations_count: int
    notifications: List[NotificationOut]
    is_demo_mode: bool
