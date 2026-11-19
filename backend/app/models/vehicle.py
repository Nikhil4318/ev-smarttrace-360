from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    vehicle_name = Column(String(100), nullable=False, default="My EV")
    manufacturer = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    vehicle_type = Column(String(50), default="Sedan")
    battery_capacity = Column(Float, nullable=False, default=60.0) # kWh
    battery_chemistry = Column(String(50), default="Lithium-ion (NMC)")
    max_charging_power = Column(Float, nullable=False, default=150.0) # kW
    connector_types = Column(String(150), default="CCS2, Type 2")
    vehicle_identifier = Column(String(100), unique=True, nullable=False)
    current_battery_pct = Column(Float, default=70.0)
    efficiency_kwh_km = Column(Float, default=0.150)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="vehicles")
    battery_readings = relationship("BatteryReading", back_populates="vehicle", cascade="all, delete-orphan")
    energy_records = relationship("EnergyConsumption", back_populates="vehicle", cascade="all, delete-orphan")
    charging_sessions = relationship("ChargingSession", back_populates="vehicle", cascade="all, delete-orphan")
    diagnostics = relationship("VehicleDiagnostic", back_populates="vehicle", cascade="all, delete-orphan")
    routes = relationship("RouteHistory", back_populates="vehicle", cascade="all, delete-orphan")
    predictions = relationship("AIPrediction", back_populates="vehicle", cascade="all, delete-orphan")
