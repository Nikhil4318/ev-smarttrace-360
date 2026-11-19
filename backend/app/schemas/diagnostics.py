from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class DiagnosticScanRequest(BaseModel):
    vehicle_id: int
    deep_scan: Optional[bool] = False


class VehicleDiagnosticOut(BaseModel):
    id: int
    vehicle_id: int
    component: str
    fault_code: str
    description: str
    severity: str # 'normal', 'info', 'warning', 'critical'
    sensor_value: Optional[float] = None
    expected_range: Optional[str] = None
    recommendation: Optional[str] = None
    detection_source: str
    detected_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ComponentHealthCard(BaseModel):
    name: str # e.g. "Battery System", "Motor System"
    status: str # "normal", "warning", "critical"
    current_reading: str
    expected_range: str
    detected_problems: List[str]
    ai_explanation: str
    recommended_action: str
    sensor_key: str
    score: int # 0-100


class DiagnosticReportOut(BaseModel):
    vehicle_id: int
    scan_timestamp: datetime
    overall_status: str # "Healthy", "Attention Required", "Critical Warning"
    health_score: int # 0-100
    components: List[ComponentHealthCard]
    active_faults_count: int
    warnings_count: int
    critical_count: int
    ai_summary: str
    recommended_inspections: List[str]
    is_simulated: bool = True
