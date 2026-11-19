from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class VehicleDiagnostic(Base):
    __tablename__ = "vehicle_diagnostics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    component = Column(String(100), nullable=False) # 'Battery System', 'Motor System', 'Cooling System', etc.
    fault_code = Column(String(50), nullable=False) # e.g. 'P0A93-00'
    description = Column(Text, nullable=False)
    severity = Column(String(50), default="normal") # 'normal', 'info', 'warning', 'critical'
    sensor_value = Column(Float, nullable=True)
    expected_range = Column(String(100), nullable=True)
    recommendation = Column(Text, nullable=True)
    detection_source = Column(String(50), default="simulated") # 'rule_based', 'isolation_forest', 'obd2', 'simulated'
    detected_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    vehicle = relationship("Vehicle", back_populates="diagnostics")

    __table_args__ = (
        Index("idx_diag_vehicle_severity", "vehicle_id", "severity", "detected_at"),
    )
