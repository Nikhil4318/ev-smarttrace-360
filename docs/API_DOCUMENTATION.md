# EV SmartTrace 360 - API Documentation

The EV SmartTrace 360 backend is built on **FastAPI**, **SQLAlchemy ORM**, **Pydantic v2**, and **Scikit-learn**.

- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **ReDoc UI**: `http://localhost:8000/redoc`

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
Creates a new driver account and auto-seeds their default demo vehicle.
- **Payload**:
```json
{
  "name": "Alex Rivers",
  "email": "driver@evsmarttrace.com",
  "password": "SecurePassword123!"
}
```
- **Response**: JWT Token object (`access_token`, `token_type`, `user_id`, `name`, `email`).

### `POST /api/auth/login`
Authenticates existing driver and returns JWT bearer token.
- **Payload**:
```json
{
  "email": "demo@evsmarttrace.com",
  "password": "DemoPassword123!"
}
```

### `GET /api/auth/me`
Retrieves currently authenticated user profile.
- **Header**: `Authorization: Bearer <token>`

---

## 2. Vehicle Management (`/api/vehicles`)

### `GET /api/vehicles`
Lists all vehicles owned by the authenticated driver.

### `POST /api/vehicles`
Registers a new electric vehicle to the fleet.
- **Fields**:
  - `vehicle_name`: string
  - `manufacturer`: string
  - `model`: string
  - `vehicle_type`: "Sedan" | "SUV" | "Hatchback" | "Truck"
  - `battery_capacity`: float (kWh)
  - `battery_chemistry`: string (e.g. "Lithium-ion NMC")
  - `max_charging_power`: float (kW)
  - `connector_types`: string
  - `vehicle_identifier`: unique VIN / license identifier
  - `current_battery_pct`: float (0 - 100)
  - `efficiency_kwh_km`: float (e.g. 0.150)

---

## 3. Battery Intelligence (`/api/battery`)

### `GET /api/battery/{vehicle_id}/latest`
Retrieves latest CAN-bus battery reading (SOC, SOH, pack voltage, thermal readings, available energy).

### `GET /api/battery/{vehicle_id}/range-prediction`
Infers real-time driving range and energy consumption using the trained **Random Forest Regressor**.
- **Query Parameters**:
  - `speed_kmh`: Average speed in km/h (e.g. 65)
  - `ambient_temp_c`: Ambient temperature in °C (e.g. 24)
  - `ac_on`: 1 for Climate Control ON, 0 for OFF
  - `elevation_change_m`: Net elevation delta in meters
  - `payload_weight_kg`: Cargo + passenger weight in kg
- **Response**:
```json
{
  "soc_pct": 70.0,
  "available_energy_kwh": 42.0,
  "predicted_consumption_kwh_km": 0.148,
  "predicted_consumption_kwh_100km": 14.8,
  "predicted_range_km": 283.8,
  "min_range_km": 261.2,
  "max_range_km": 306.4,
  "confidence_score": 0.972,
  "efficiency_score": 93,
  "recommendations": [
    "Driving parameters are optimal. Battery operating within peak thermal envelope."
  ],
  "model_type": "RandomForestRegressor (Ensemble 120 trees)",
  "disclaimer": "Range estimations are AI-predicted values based on telemetry and road conditions, not a legal guarantee."
}
```

---

## 4. Energy Analytics & Anomaly Detection (`/api/energy`)

### `GET /api/energy/{vehicle_id}/analytics`
Aggregates driving distance, metered consumption, peak demand periods, and runs **Isolation Forest Anomaly Detection**.

### `GET /api/energy/{vehicle_id}/monthly-report`
Generates comprehensive monthly performance statement with weekly breakdowns and carbon savings.

---

## 5. Charging Stations & Estimations (`/api/charging` & `/api/stations`)

### `GET /api/stations/nearby`
Returns verified charging locations sorted by distance from driver GPS coordinates. Supports filtering by connector and minimum kW.

### `GET /api/charging/{vehicle_id}/estimate`
Calculates charging time to target SOC using CC/CV taper curves and metered cost.
- **Parameters**: `target_soc` (default 80), `charging_power_kw` (e.g. 150), `tariff` (e.g. 0.25).

---

## 6. Vehicle Diagnostics Scanner (`/api/diagnostics`)

### `POST /api/diagnostics/scan`
Triggers full multi-system vehicle diagnostic sweep. Evaluates Battery Pack, Electric Drive Motor, Inverter Cooling System, 12V Auxiliary System, and Charging Inlets.

---

## 7. AI Smart Route Optimization (`/api/routes`)

### `POST /api/routes/optimize`
Evaluates travel corridor and returns 3 distinct itineraries:
1. **Fastest Highway Route**: Minimizes travel time.
2. **Lowest Energy Eco Route**: Maximizes regenerative braking and battery conservation.
3. **Recommended Balanced Route**: Optimal balance of travel time, safety buffer, and charging feasibility.

---

## 8. EV SmartVoice Assistant (`/api/assistant`)

### `POST /api/assistant/chat`
Cockpit conversational intelligence. Combines authenticated telemetry, active DTC diagnostic codes, and language settings (`en`, `te`, `hi`).

---

## 9. WebSockets Live Telemetry (`/ws/telemetry/{vehicle_id}`)
Real-time bi-directional streaming for live vehicle telemetry gauges, voltage fluctuations, and proactive safety alerts.
