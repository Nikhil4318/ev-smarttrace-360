from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.battery import BatteryReading
from app.models.diagnostics import VehicleDiagnostic
from app.models.charging import ChargingStation
from app.models.assistant import VoiceConversation
from app.schemas.assistant import (
    AssistantChatRequest, 
    AssistantChatResponse, 
    FaultExplanationRequest, 
    FaultExplanationResponse
)
from app.security.auth import get_current_user
from app.services.assistant_service import process_smartvoice_query

router = APIRouter(prefix="/assistant", tags=["EV SmartVoice AI Assistant"])


@router.post("/chat", response_model=AssistantChatResponse)
def assistant_chat(
    chat_req: AssistantChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == chat_req.vehicle_id, 
        Vehicle.user_id == current_user.id
    ).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")

    latest_battery = db.query(BatteryReading).filter(
        BatteryReading.vehicle_id == vehicle.id
    ).order_by(BatteryReading.timestamp.desc()).first()

    diagnostics = db.query(VehicleDiagnostic).filter(
        VehicleDiagnostic.vehicle_id == vehicle.id
    ).all()

    stations = db.query(ChargingStation).limit(5).all()

    result = process_smartvoice_query(
        user_message=chat_req.message,
        vehicle=vehicle,
        latest_reading=latest_battery,
        active_diagnostics=diagnostics,
        nearby_stations=stations,
        language=chat_req.language or "en"
    )

    # Save to voice conversation history
    conv = VoiceConversation(
        user_id=current_user.id,
        vehicle_id=vehicle.id,
        user_message=chat_req.message,
        assistant_response=result["response_text"],
        language=chat_req.language or "en"
    )
    db.add(conv)
    db.commit()

    return AssistantChatResponse(**result)


@router.post("/explain-fault", response_model=FaultExplanationResponse)
def explain_fault(
    req: FaultExplanationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fault = db.query(VehicleDiagnostic).filter(
        VehicleDiagnostic.vehicle_id == req.vehicle_id,
        VehicleDiagnostic.fault_code == req.fault_code
    ).first()

    if not fault:
        return FaultExplanationResponse(
            fault_code=req.fault_code,
            component="General Electronic Control Unit",
            plain_english_explanation="No confirmed manufacturer trouble code active. This appears to be a transient communication check.",
            severity="info",
            immediate_driver_action="No emergency action required. Continue normal driving.",
            safe_to_drive=True,
            recommended_service="Inspect next scheduled service interval."
        )

    safe = fault.severity != "critical"
    action = (
        "Pull over safely when convenient and power cycle the vehicle." 
        if not safe 
        else "Continue driving normally. Schedule an inspection at your convenience."
    )

    return FaultExplanationResponse(
        fault_code=fault.fault_code,
        component=fault.component,
        plain_english_explanation=f"{fault.description} Sensor reading was {fault.sensor_value} against nominal range {fault.expected_range}.",
        severity=fault.severity,
        immediate_driver_action=action,
        safe_to_drive=safe,
        recommended_service=fault.recommendation or "Inspect cooling and electrical harness."
    )


@router.get("/history")
def get_conversation_history(
    vehicle_id: Optional[int] = Query(None),
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(VoiceConversation).filter(VoiceConversation.user_id == current_user.id)
    if vehicle_id:
        query = query.filter(VoiceConversation.vehicle_id == vehicle_id)
    return query.order_by(VoiceConversation.created_at.desc()).limit(limit).all()
