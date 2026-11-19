import random
from datetime import datetime, timezone
from typing import Dict, Any
from app.models.vehicle import Vehicle
from app.models.battery import BatteryReading


def simulate_live_vehicle_telemetry(vehicle: Vehicle) -> Dict[str, Any]:
    """
    Generate realistic, physically consistent EV telemetry readings.
    Simulates:
    - Pack voltage proportional to State of Charge (e.g. 350V at 10% to 415V at 100%)
    - Battery temperature with thermal inertia
    - Motor temperature and inverter performance
    - Dynamic energy consumption based on velocity
    """
    soc = float(vehicle.current_battery_pct)
    # Pack voltage curve: 350V + (SOC / 100) * 65V + minor sensor noise
    nominal_voltage = 350.0 + (soc / 100.0) * 65.0
    voltage = round(nominal_voltage + random.uniform(-0.8, 0.8), 1)

    # Battery temperature: typically 25 - 34°C in normal operations
    battery_temp = round(27.0 + (soc > 80) * 2.0 + random.uniform(-1.2, 1.5), 1)
    
    # Motor temperature: 50 - 68°C under normal drive load
    motor_temp = round(54.0 + random.uniform(-2.5, 3.8), 1)

    # Available energy in kWh
    capacity = float(vehicle.battery_capacity)
    available_energy = round(capacity * (soc / 100.0), 2)

    # Average efficiency
    base_eff = float(vehicle.efficiency_kwh_km)
    live_consumption = round(base_eff + random.uniform(-0.015, 0.020), 3)

    # Cell imbalance in mV
    cell_delta_mv = round(random.uniform(4.0, 9.5), 1)

    return {
        "vehicle_id": vehicle.id,
        "vehicle_name": vehicle.vehicle_name,
        "soc": soc,
        "soh": 95.2,
        "voltage": voltage,
        "temperature": battery_temp,
        "motor_temperature": motor_temp,
        "available_energy": available_energy,
        "battery_capacity": capacity,
        "live_consumption_kwh_km": live_consumption,
        "cell_delta_mv": cell_delta_mv,
        "auxiliary_12v_voltage": round(13.8 + random.uniform(-0.15, 0.2), 2),
        "tire_pressure_psi": {"fl": 39.2, "fr": 39.0, "rl": 40.1, "rr": 40.0},
        "data_source": "simulated",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


def seed_demo_vehicle_if_empty(db, user_id: int) -> Vehicle:
    """
    Ensure the user has at least one active vehicle. If empty, creates the standard Demo EV.
    """
    vehicle = db.query(Vehicle).filter(Vehicle.user_id == user_id).first()
    if not vehicle:
        vehicle = Vehicle(
            user_id=user_id,
            vehicle_name="CyberPulse GT (Demo)",
            manufacturer="Tesla",
            model="Model 3 Dual Motor",
            vehicle_type="Sedan",
            battery_capacity=60.0,
            battery_chemistry="Lithium Nickel Manganese Cobalt (NMC)",
            max_charging_power=170.0,
            connector_types="CCS2, Tesla Supercharger, Type 2",
            vehicle_identifier=f"EV-DEMO-{user_id}-360",
            current_battery_pct=70.0,
            efficiency_kwh_km=0.150,
            is_demo=True
        )
        db.add(vehicle)
        db.commit()
        db.refresh(vehicle)

        # Also create an initial battery reading
        initial_reading = BatteryReading(
            vehicle_id=vehicle.id,
            soc=70.0,
            soh=95.2,
            voltage=401.5,
            temperature=27.8,
            available_energy=42.0,
            data_source="simulated"
        )
        db.add(initial_reading)
        db.commit()

    return vehicle
