from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class EnergyConsumption(Base):
    __tablename__ = "energy_consumption"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    distance_km = Column(Float, nullable=False)
    energy_consumed_kwh = Column(Float, nullable=False)
    consumption_per_km = Column(Float, nullable=False) # kWh/km
    average_speed = Column(Float, default=55.0) # km/h
    ambient_temperature = Column(Float, default=26.0) # deg C
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    vehicle = relationship("Vehicle", back_populates="energy_records")

    __table_args__ = (
        Index("idx_energy_vehicle_time", "vehicle_id", "timestamp"),
    )
