from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    prediction_type = Column(String(100), nullable=False) # 'range_km', 'anomaly_score', 'soh_degradation'
    predicted_value = Column(Float, nullable=False)
    confidence_or_uncertainty = Column(Float, default=0.95)
    model_version = Column(String(50), default="v1.0-rf")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    vehicle = relationship("Vehicle", back_populates="predictions")

    __table_args__ = (
        Index("idx_ai_pred_vehicle", "vehicle_id", "prediction_type", "created_at"),
    )
