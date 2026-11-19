from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class VehicleBase(BaseModel):
    vehicle_name: str = "My EV"
    manufacturer: str
    model: str
    vehicle_type: str = "Sedan"
    battery_capacity: float = 60.0 # kWh
    battery_chemistry: str = "Lithium-ion (NMC)"
    max_charging_power: float = 150.0 # kW
    connector_types: str = "CCS2, Type 2"
    vehicle_identifier: str
    current_battery_pct: float = 70.0
    efficiency_kwh_km: float = 0.150


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    vehicle_name: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    vehicle_type: Optional[str] = None
    battery_capacity: Optional[float] = None
    battery_chemistry: Optional[str] = None
    max_charging_power: Optional[float] = None
    connector_types: Optional[str] = None
    current_battery_pct: Optional[float] = None
    efficiency_kwh_km: Optional[float] = None


class VehicleOut(VehicleBase):
    id: int
    user_id: int
    is_demo: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
