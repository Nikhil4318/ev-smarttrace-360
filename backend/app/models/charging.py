from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class ChargingStation(Base):
    __tablename__ = "charging_stations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    station_name = Column(String(200), nullable=False)
    address = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    operator = Column(String(100), default="EV ChargeNet")
    charging_power = Column(Float, default=60.0) # kW
    connector_type = Column(String(100), default="CCS2")
    availability_status = Column(String(50), default="Available")
    pricing_per_kwh = Column(Float, default=0.25)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    sessions = relationship("ChargingSession", back_populates="station")
    route_stops = relationship("RouteChargingStop", back_populates="station")

    __table_args__ = (
        Index("idx_station_coords", "latitude", "longitude"),
    )


class ChargingSession(Base):
    __tablename__ = "charging_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    station_id = Column(Integer, ForeignKey("charging_stations.id", ondelete="SET NULL"), nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    start_soc = Column(Float, nullable=False)
    end_soc = Column(Float, nullable=False)
    energy_kwh = Column(Float, nullable=False)
    charging_power = Column(Float, nullable=False) # kW
    electricity_tariff = Column(Float, default=0.25) # $ per kWh
    total_cost = Column(Float, default=0.0)
    session_status = Column(String(50), default="completed") # 'active', 'completed', 'interrupted'
    efficiency_estimate = Column(Float, default=92.5) # %

    vehicle = relationship("Vehicle", back_populates="charging_sessions")
    station = relationship("ChargingStation", back_populates="sessions")

    __table_args__ = (
        Index("idx_charging_vehicle_time", "vehicle_id", "start_time"),
    )
