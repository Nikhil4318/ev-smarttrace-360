from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.battery import BatteryReading
from app.models.energy import EnergyConsumption
from app.models.charging import ChargingStation, ChargingSession
from app.models.diagnostics import VehicleDiagnostic
from app.models.routes import RouteHistory, RouteChargingStop
from app.models.assistant import VoiceConversation
from app.models.notifications import Notification
from app.models.predictions import AIPrediction

__all__ = [
    "User",
    "Vehicle",
    "BatteryReading",
    "EnergyConsumption",
    "ChargingStation",
    "ChargingSession",
    "VehicleDiagnostic",
    "RouteHistory",
    "RouteChargingStop",
    "VoiceConversation",
    "Notification",
    "AIPrediction",
]
