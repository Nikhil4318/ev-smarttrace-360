from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ChargingStationOut(BaseModel):
    id: int
    station_name: str
    address: str
    latitude: float
    longitude: float
    operator: str
    charging_power: float
    connector_type: str
    availability_status: str
    pricing_per_kwh: float
    distance_km: Optional[float] = None
    last_updated: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChargingSessionCreate(BaseModel):
    vehicle_id: int
    station_id: Optional[int] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    start_soc: float
    end_soc: float
    energy_kwh: float
    charging_power: float
    electricity_tariff: Optional[float] = 0.25
    session_status: Optional[str] = "completed"


class ChargingSessionOut(BaseModel):
    id: int
    vehicle_id: int
    station_id: Optional[int] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    start_soc: float
    end_soc: float
    energy_kwh: float
    charging_power: float
    electricity_tariff: float
    total_cost: float
    session_status: str
    efficiency_estimate: float

    class Config:
        from_attributes = True


class ChargingEstimateRequest(BaseModel):
    target_soc: float = 80.0
    charging_power_kw: Optional[float] = None # Uses vehicle max if None


class ChargingEstimateResponse(BaseModel):
    current_soc: float
    target_soc: float
    battery_capacity_kwh: float
    required_energy_kwh: float
    charging_power_kw: float
    estimated_duration_minutes: int
    estimated_duration_formatted: str
    estimated_cost_usd: float
    electricity_tariff: float
    charging_losses_kwh: float
    effective_power_kw: float
