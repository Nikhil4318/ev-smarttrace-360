from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class BatteryReadingCreate(BaseModel):
    vehicle_id: int
    soc: float
    soh: Optional[float] = 95.0
    voltage: Optional[float] = 400.0
    temperature: Optional[float] = 28.5
    available_energy: Optional[float] = None
    data_source: Optional[str] = "simulated"


class BatteryReadingOut(BaseModel):
    id: int
    vehicle_id: int
    soc: float
    soh: float
    voltage: float
    temperature: float
    available_energy: float
    timestamp: datetime
    data_source: str

    class Config:
        from_attributes = True


class RangePredictionRequest(BaseModel):
    speed_kmh: Optional[float] = 65.0
    ambient_temp_c: Optional[float] = 24.0
    ac_on: Optional[int] = 1
    elevation_change_m: Optional[float] = 0.0
    payload_weight_kg: Optional[float] = 150.0


class RangePredictionResponse(BaseModel):
    soc_pct: float
    available_energy_kwh: float
    predicted_consumption_kwh_km: float
    predicted_consumption_kwh_100km: float
    predicted_range_km: float
    min_range_km: float
    max_range_km: float
    confidence_score: float
    efficiency_score: int
    recommendations: List[str]
    model_type: str
    disclaimer: str
