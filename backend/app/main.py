import os
import sys
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models import (
    User, Vehicle, BatteryReading, EnergyConsumption, 
    ChargingStation, ChargingSession, VehicleDiagnostic, 
    RouteHistory, RouteChargingStop, VoiceConversation, 
    Notification, AIPrediction
)
from app.security.auth import get_password_hash
from app.websocket.telemetry_ws import stream_telemetry
from app.routers import (
    auth, vehicles, battery, energy, charging, 
    diagnostics, routes, assistant, notifications, dashboard
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ev_smarttrace")


def seed_initial_data():
    """Auto-seed default user, vehicle, stations, and diagnostics on startup"""
    db = SessionLocal()
    try:
        # Create all tables if not exist
        Base.metadata.create_all(bind=engine)

        # Check if demo user exists
        demo_user = db.query(User).filter(User.email == "demo@evsmarttrace.com").first()
        if not demo_user:
            demo_user = User(
                name="Alex Rivers",
                email="demo@evsmarttrace.com",
                password_hash=get_password_hash("DemoPassword123!")
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            logger.info("Demo user created: demo@evsmarttrace.com (Password: DemoPassword123!)")

        # Check if demo vehicle exists
        demo_vehicle = db.query(Vehicle).filter(Vehicle.user_id == demo_user.id).first()
        if not demo_vehicle:
            demo_vehicle = Vehicle(
                user_id=demo_user.id,
                vehicle_name="CyberPulse GT (Demo)",
                manufacturer="Tesla",
                model="Model 3 Dual Motor",
                vehicle_type="Sedan",
                battery_capacity=60.0,
                battery_chemistry="Lithium Nickel Manganese Cobalt (NMC)",
                max_charging_power=170.0,
                connector_types="CCS2, Tesla Supercharger, Type 2",
                vehicle_identifier="EV-ST360-9842-DEMO",
                current_battery_pct=70.0,
                efficiency_kwh_km=0.150,
                is_demo=True
            )
            db.add(demo_vehicle)
            db.commit()
            db.refresh(demo_vehicle)

            # Battery Reading
            init_batt = BatteryReading(
                vehicle_id=demo_vehicle.id,
                soc=70.0,
                soh=95.2,
                voltage=401.5,
                temperature=27.8,
                available_energy=42.0,
                data_source="simulated"
            )
            db.add(init_batt)

            # Diagnostic
            diag = VehicleDiagnostic(
                vehicle_id=demo_vehicle.id,
                component="Cooling System",
                fault_code="P0A93-00",
                description="Inverter Cooling System Performance Degradation detected under high thermal load.",
                severity="warning",
                sensor_value=68.4,
                expected_range="35.0 - 60.0 °C",
                recommendation="Inspect coolant level and radiator fan assembly at next service.",
                detection_source="isolation_forest"
            )
            db.add(diag)
            db.commit()

        # Seed Charging Stations if empty
        if db.query(ChargingStation).count() == 0:
            stations = [
                ChargingStation(
                    station_name="Supercharge Hub - Silicon Metro",
                    address="101 Tech Blvd, Metro Central",
                    latitude=37.7749,
                    longitude=-122.4194,
                    operator="Tesla Supercharger",
                    charging_power=250.0,
                    connector_type="CCS2 / NACS",
                    availability_status="Available (8/12 Open)",
                    pricing_per_kwh=0.32
                ),
                ChargingStation(
                    station_name="Electrify Express - Harbor Bay",
                    address="450 Marina Way, Bayside",
                    latitude=37.7891,
                    longitude=-122.4014,
                    operator="Electrify America",
                    charging_power=150.0,
                    connector_type="CCS2 / CHAdeMO",
                    availability_status="Available (4/6 Open)",
                    pricing_per_kwh=0.35
                ),
                ChargingStation(
                    station_name="GreenGrid Fast Charge - Sunset Point",
                    address="820 Ocean Ave, West Coast",
                    latitude=37.7601,
                    longitude=-122.4822,
                    operator="EVgo",
                    charging_power=100.0,
                    connector_type="CCS2 / Type 2",
                    availability_status="Available (2/4 Open)",
                    pricing_per_kwh=0.28
                ),
                ChargingStation(
                    station_name="VoltPoint Urban Hub - Downtown",
                    address="12 Civic Center Plaza, Center City",
                    latitude=37.7793,
                    longitude=-122.4184,
                    operator="ChargePoint",
                    charging_power=50.0,
                    connector_type="Type 2 / AC Fast",
                    availability_status="Occupied (All in Use)",
                    pricing_per_kwh=0.22
                ),
                ChargingStation(
                    station_name="EcoCharge Highway Oasis - Exit 42",
                    address="Highway 101 Northbound Rest Area",
                    latitude=37.8205,
                    longitude=-122.3789,
                    operator="BP Pulse",
                    charging_power=180.0,
                    connector_type="CCS2",
                    availability_status="Available (5/8 Open)",
                    pricing_per_kwh=0.30
                )
            ]
            db.add_all(stations)
            db.commit()
            logger.info("Charging stations seeded.")

    except Exception as e:
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up EV SmartTrace 360 Backend...")
    seed_initial_data()
    yield
    logger.info("Shutting down EV SmartTrace 360 Backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Electric Vehicle Telemetry, Predictive Range, Diagnostics, and SmartVoice Assistant API",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket Endpoint for Live Telemetry
@app.websocket("/ws/telemetry/{vehicle_id}")
async def websocket_telemetry_endpoint(websocket: WebSocket, vehicle_id: int):
    await stream_telemetry(vehicle_id, websocket)


# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(vehicles.router, prefix=settings.API_V1_PREFIX)
app.include_router(battery.router, prefix=settings.API_V1_PREFIX)
app.include_router(energy.router, prefix=settings.API_V1_PREFIX)
app.include_router(charging.router, prefix=settings.API_V1_PREFIX)
app.include_router(diagnostics.router, prefix=settings.API_V1_PREFIX)
app.include_router(routes.router, prefix=settings.API_V1_PREFIX)
app.include_router(assistant.router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications.router, prefix=settings.API_V1_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": "Drive Smart. Charge Smart. Travel Safe.",
        "status": "online",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }
