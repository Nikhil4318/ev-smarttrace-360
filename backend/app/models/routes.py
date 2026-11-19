from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class RouteHistory(Base):
    __tablename__ = "route_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    origin = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    total_distance = Column(Float, nullable=False) # km
    estimated_energy = Column(Float, nullable=False) # kWh
    estimated_duration = Column(Integer, nullable=False) # minutes
    selected_route = Column(String(100), default="Recommended Balanced Route")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vehicle = relationship("Vehicle", back_populates="routes")
    charging_stops = relationship("RouteChargingStop", back_populates="route", cascade="all, delete-orphan")


class RouteChargingStop(Base):
    __tablename__ = "route_charging_stops"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    route_id = Column(Integer, ForeignKey("route_history.id", ondelete="CASCADE"), nullable=False, index=True)
    station_id = Column(Integer, ForeignKey("charging_stations.id", ondelete="CASCADE"), nullable=False)
    stop_order = Column(Integer, nullable=False)
    estimated_arrival_soc = Column(Float, nullable=False)
    estimated_charging_duration = Column(Integer, nullable=False) # minutes
    target_soc = Column(Float, default=80.0)

    route = relationship("RouteHistory", back_populates="charging_stops")
    station = relationship("ChargingStation", back_populates="route_stops")
