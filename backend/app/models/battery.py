from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class BatteryReading(Base):
    __tablename__ = "battery_readings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    soc = Column(Float, nullable=False) # State of Charge %
    soh = Column(Float, default=95.0)   # State of Health %
    voltage = Column(Float, default=400.0) # Pack voltage in Volts
    temperature = Column(Float, default=28.5) # Battery temp in Celsius
    available_energy = Column(Float, nullable=False) # kWh
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    data_source = Column(String(50), default="simulated") # 'real', 'simulated', 'predicted'

    vehicle = relationship("Vehicle", back_populates="battery_readings")

    __table_args__ = (
        Index("idx_battery_vehicle_time", "vehicle_id", "timestamp"),
    )
