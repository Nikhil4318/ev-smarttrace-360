from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class EnergyConsumptionCreate(BaseModel):
    vehicle_id: int
    distance_km: float
    energy_consumed_kwh: float
    average_speed: Optional[float] = 55.0
    ambient_temperature: Optional[float] = 26.0


class EnergyConsumptionOut(BaseModel):
    id: int
    vehicle_id: int
    distance_km: float
    energy_consumed_kwh: float
    consumption_per_km: float
    average_speed: float
    ambient_temperature: float
    timestamp: datetime

    class Config:
        from_attributes = True


class EnergyAnalyticsResponse(BaseModel):
    vehicle_id: int
    total_distance_km: float
    total_energy_kwh: float
    average_consumption_kwh_km: float
    average_speed_kmh: float
    recent_history: List[EnergyConsumptionOut]
    anomaly_detection: Dict[str, Any]
    peak_consumption_periods: List[Dict[str, Any]]
    efficiency_trend: str


class MonthlyReportResponse(BaseModel):
    vehicle_id: int
    month: str
    total_trips: int
    total_distance_km: float
    total_energy_kwh: float
    total_cost_usd: float
    avg_efficiency_kwh_km: float
    co2_saved_kg: float
    weekly_breakdown: List[Dict[str, Any]]
