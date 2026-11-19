import random
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.diagnostics import VehicleDiagnostic
from app.schemas.diagnostics import (
    DiagnosticScanRequest, 
    DiagnosticReportOut, 
    VehicleDiagnosticOut, 
    ComponentHealthCard
)
from app.security.auth import get_current_user

router = APIRouter(prefix="/diagnostics", tags=["AI Vehicle Health & Diagnostics"])


@router.post("/scan", response_model=DiagnosticReportOut)
def scan_vehicle_diagnostics(
    scan_req: DiagnosticScanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == scan_req.vehicle_id, 
        Vehicle.user_id == current_user.id
    ).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")

    # Simulated real-time sensor measurements
    battery_temp = round(28.5 + random.uniform(-1.0, 1.5), 1)
    pack_voltage = round(401.5 + random.uniform(-1.0, 1.0), 1)
    motor_temp = round(56.2 + random.uniform(-2.0, 3.0), 1)
    coolant_temp = round(42.0 + random.uniform(-1.5, 2.5), 1)
    aux_voltage = round(13.8 + random.uniform(-0.1, 0.2), 2)
    cell_delta = round(6.5 + random.uniform(-1.0, 2.0), 1)

    # Component health evaluations
    components = [
        ComponentHealthCard(
            name="Battery Pack System",
            status="normal",
            current_reading=f"{pack_voltage}V | {battery_temp}°C | Cell Delta {cell_delta}mV",
            expected_range="350V - 420V | 20°C - 38°C | < 15mV Delta",
            detected_problems=[],
            ai_explanation="High voltage battery cells are balanced within nominal threshold (<15mV). Thermal management active and stable.",
            recommended_action="Maintain 20%-80% state of charge for daily commuting to preserve cathode longevity.",
            sensor_key="battery",
            score=98
        ),
        ComponentHealthCard(
            name="Electric Drive & Traction Motor",
            status="normal",
            current_reading=f"{motor_temp}°C | Permanent Magnet Synchronous",
            expected_range="40°C - 75°C under continuous load",
            detected_problems=[],
            ai_explanation="Stator windings and rotor bearing temperatures are well within thermal safety margins. Inverter gate drive PWM signals stable.",
            recommended_action="No maintenance required. Check drive unit lubricant at 80,000 km.",
            sensor_key="motor",
            score=96
        ),
        ComponentHealthCard(
            name="Cooling & Thermal Management",
            status="warning",
            current_reading=f"{coolant_temp}°C | Loop Pressure 1.4 Bar",
            expected_range="30°C - 55°C | Inverter loop max 60°C",
            detected_problems=["P0A93-00: Inverter Cooling Loop Flow Restriction Notice"],
            ai_explanation="Slight thermal delta observed in secondary heat exchanger circuit during high-current DC fast charging.",
            recommended_action="Inspect coolant reservoir fluid level and ensure front active grille shutters are unobstructed.",
            sensor_key="cooling",
            score=82
        ),
        ComponentHealthCard(
            name="Charging System & Onboard Inverter",
            status="normal",
            current_reading="CCS2 Port Ready | Inverter Efficiency 93.4%",
            expected_range="AC 240V 32A / DC Fast up to 170 kW",
            detected_problems=[],
            ai_explanation="CP/PP communication handshake validated with high signal fidelity. Thermal sensors on charge inlet show zero resistance hotspots.",
            recommended_action="Ensure charging port pins are clean of debris or moisture.",
            sensor_key="charging",
            score=95
        ),
        ComponentHealthCard(
            name="12V Auxiliary Electrical System",
            status="normal",
            current_reading=f"{aux_voltage}V (DC-DC Converter Active)",
            expected_range="13.2V - 14.5V",
            detected_problems=[],
            ai_explanation="High-voltage to low-voltage DC-DC buck converter maintaining stable float voltage for safety ECUs and infotainment.",
            recommended_action="12V battery health optimal. Normal automated top-off active.",
            sensor_key="electrical",
            score=94
        )
    ]

    warnings = [c for c in components if c.status == "warning"]
    criticals = [c for c in components if c.status == "critical"]

    overall_status = "Optimal"
    if criticals:
        overall_status = "Critical Warning"
    elif warnings:
        overall_status = "Attention Needed"

    health_score = int(sum(c.score for c in components) / len(components))

    ai_summary = (
        f"Diagnostic sweep completed for {vehicle.vehicle_name}. 4 of 5 subsystems operating in peak condition. "
        "1 advisory detected in Cooling Loop (P0A93-00). Overall vehicle condition remains roadworthy and safe for long-distance travel."
    )

    recommended_inspections = [
        "Verify inverter coolant reservoir level at your convenience.",
        "Perform recommended tire rotation every 10,000 km.",
        "Keep cabin air filter clean for maximum HVAC heat-pump efficiency."
    ]

    return DiagnosticReportOut(
        vehicle_id=vehicle.id,
        scan_timestamp=datetime.now(timezone.utc),
        overall_status=overall_status,
        health_score=health_score,
        components=components,
        active_faults_count=len(warnings) + len(criticals),
        warnings_count=len(warnings),
        critical_count=len(criticals),
        ai_summary=ai_summary,
        recommended_inspections=recommended_inspections,
        is_simulated=True
    )


@router.get("/{vehicle_id}", response_model=List[VehicleDiagnosticOut])
def get_vehicle_diagnostics(
    vehicle_id: int,
    severity: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id, 
        Vehicle.user_id == current_user.id
    ).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")

    query = db.query(VehicleDiagnostic).filter(VehicleDiagnostic.vehicle_id == vehicle_id)
    if severity:
        query = query.filter(VehicleDiagnostic.severity == severity)

    records = query.order_by(VehicleDiagnostic.detected_at.desc()).all()
    if not records:
        # Seed initial diagnostic code if empty
        d1 = VehicleDiagnostic(
            vehicle_id=vehicle_id,
            component="Cooling System",
            fault_code="P0A93-00",
            description="Inverter Cooling System Performance Degradation detected under high thermal load.",
            severity="warning",
            sensor_value=68.4,
            expected_range="35.0 - 60.0 °C",
            recommendation="Inspect coolant level and radiator fan assembly at next service.",
            detection_source="isolation_forest"
        )
        d2 = VehicleDiagnostic(
            vehicle_id=vehicle_id,
            component="Electrical System",
            fault_code="B1630-14",
            description="Minor auxiliary 12V DC-DC ripple voltage fluctuation observed.",
            severity="info",
            sensor_value=13.2,
            expected_range="13.5 - 14.8 V",
            recommendation="Monitor 12V auxiliary battery health.",
            detection_source="rule_based"
        )
        db.add_all([d1, d2])
        db.commit()
        records = query.order_by(VehicleDiagnostic.detected_at.desc()).all()

    return records


@router.get("/{vehicle_id}/history", response_model=List[VehicleDiagnosticOut])
def get_diagnostics_history(
    vehicle_id: int,
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id, 
        Vehicle.user_id == current_user.id
    ).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")

    return db.query(VehicleDiagnostic).filter(
        VehicleDiagnostic.vehicle_id == vehicle_id
    ).order_by(VehicleDiagnostic.detected_at.desc()).limit(limit).all()
