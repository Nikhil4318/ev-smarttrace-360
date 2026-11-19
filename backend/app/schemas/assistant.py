from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class AssistantChatRequest(BaseModel):
    vehicle_id: int
    message: str
    language: Optional[str] = "en" # 'en', 'te', 'hi'
    context_data: Optional[Dict[str, Any]] = None


class AssistantChatResponse(BaseModel):
    response_text: str
    audio_text: str
    intent: str
    language: str
    proactive_alert: Optional[Dict[str, Any]] = None
    suggested_actions: List[str] = []
    telemetry_snapshot: Optional[Dict[str, Any]] = None


class FaultExplanationRequest(BaseModel):
    vehicle_id: int
    fault_code: str
    language: Optional[str] = "en"


class FaultExplanationResponse(BaseModel):
    fault_code: str
    component: str
    plain_english_explanation: str
    severity: str
    immediate_driver_action: str
    safe_to_drive: bool
    recommended_service: str
