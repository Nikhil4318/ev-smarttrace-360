# EV SMARTTRACE 360
> **Tagline:** Drive Smart. Charge Smart. Travel Safe.

An enterprise-grade, full-stack, AI-powered Electric Vehicle Intelligence and Management Platform. EV SmartTrace 360 acts as a centralized intelligent automotive co-pilot that monitors battery health, analyzes energy economics, predicts driving range with Random Forest ML, diagnoses vehicle trouble codes with Isolation Forest, locates verified charging facilities, computes optimized travel corridors, and interacts with drivers via an intelligent voice assistant.

---

## ⚡ Key Highlights & Capabilities

- 🔋 **Module 1 – AI Battery Intelligence**: Real-time State of Charge (SOC), State of Health (SOH), pack voltage (400V), cell imbalance tracking, and Random Forest range predictions with 95% confidence intervals.
- ⚡ **Module 2 – Smart Charging & Energy Analytics**: Metered charging duration, CC-CV taper curve modeling, electricity tariff calculations, and Isolation Forest anomaly detection for abnormal consumption spikes.
- 🛡️ **Module 3 & 7 – AI Vehicle Diagnostics Scanner**: Interactive "SCAN MY EV" sweep monitoring traction motor stator temperatures, battery pack delta, inverter coolant flow (P0A93), and auxiliary 12V DC-DC health. Generates complete AI Health Reports.
- 📍 **Module 4 – Nearby EV Charging Station Finder**: Interactive dark-mode Leaflet map with verified station pins, connector filters (CCS2, Type 2, CHAdeMO, Supercharger), live speed metrics, and distance calculations.
- 🧭 **Module 5 – AI Smart Route Optimization**: Evaluates departure SOC and arrival safety buffers to compute 3 distinct itineraries:
  1. *Fastest Highway Route*
  2. *Lowest Energy Eco Route*
  3. *Recommended Balanced Route* (with automated fast charging stops inserted).
- 🎙️ **Module 6 – EV SmartVoice Cockpit Assistant**: Siri-like voice interface with animated audio waveforms, speech recognition (Web Speech API), speech synthesis (TTS), text chat fallback, and multilingual support for **English**, **Telugu (తెలుగు)**, and **Hindi (हिन्दी)**.
- 📊 **Reports & Exporting**: Audit statements, carbon emission savings, and one-click CSV & printable reports.
- 🎮 **Demo Mode**: Includes pre-seeded Tesla Model 3 Long Range (60 kWh, 70% SOC, 0.150 kWh/km) and toggleable simulated live telemetry.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Leaflet, Axios |
| **Backend** | Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy ORM, Alembic, WebSockets, JWT, Bcrypt |
| **Database** | MySQL 8.0+ / SQLite auto-fallback, normalized schema with indexing and cascading foreign keys |
| **AI / ML** | Scikit-learn (RandomForestRegressor, IsolationForest), Pandas, NumPy, Joblib |
| **Assistant** | Web Speech API, SpeechSynthesis, contextual natural language reasoning |
| **Deployment** | Frontend on Vercel, Backend on Render/Railway/Docker, Managed MySQL |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **Python** (3.11+ or 3.12+)
- **MySQL 8.0+** (optional; SQLite fallback runs automatically out-of-the-box)

### 2. Backend Setup
```bash
cd ev-smart/backend

# Install Python requirements
pip install -r requirements.txt

# Start the FastAPI server (auto-creates tables and seeds demo data)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Base URL: `http://localhost:8000/api`
- Interactive Swagger Docs: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd ev-smart/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
- Application Web UI: `http://localhost:5173`

---

## 🔑 Demo Account Credentials

| Parameter | Value |
|---|---|
| **Email** | `demo@evsmarttrace.com` |
| **Password** | `DemoPassword123!` |
| **Quick Action** | Click the **"Quick Demo Sign-In"** button on the Login page |

---

## 🧠 Machine Learning Architecture

1. **Random Forest Driving Range Regressor**:
   - Model: 120-tree ensemble trained on velocity, ambient thermal penalty, HVAC climate load, payload weight, and battery SOC.
   - Evaluated Performance: $R^2 = 0.9442$, Mean Squared Error $= 0.000053$.
   - Produces estimated range plus uncertainty bounds ($CI_{95\%}$).

2. **Isolation Forest Anomaly Detector**:
   - Model: 100-tree isolation ensemble detecting abnormal cell balance deltas ($>15\text{ mV}$), motor thermal spikes ($>85^\circ\text{C}$), and consumption surge anomalies ($+25\%$).

---

## 📁 Project Structure

```
ev-smart/
├── frontend/             # React + Vite + TypeScript dashboard
│   ├── src/
│   │   ├── components/   # Navbar, SmartVoice modal, Diagnostic scanner, Interactive map
│   │   ├── pages/        # Dashboard, Battery, Energy, Diagnostics, Stations, Navigation, Voice
│   │   ├── context/      # AuthContext & fleet state
│   │   ├── services/     # Axios API layer with offline mock resilience
│   │   └── types/        # TypeScript data models
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
├── backend/              # FastAPI Python backend
│   ├── app/
│   │   ├── main.py       # App entrypoint & auto-seeding
│   │   ├── config.py     # Environment configuration
│   │   ├── database.py   # SQLAlchemy engine with MySQL/SQLite fallback
│   │   ├── models/       # Relational models (users, vehicles, diagnostics, routes)
│   │   ├── routers/      # REST API router endpoints
│   │   ├── services/     # Telemetry simulation, route optimizer, SmartVoice
│   │   └── security/     # JWT authentication & password hashing
│   ├── requirements.txt
│   └── Dockerfile
├── database/
│   ├── schema.sql        # MySQL 8.0+ DDL table definitions
│   └── seed.sql          # Seed data for demo vehicle, stations, diagnostics
├── ml/
│   ├── train_range_model.py     # Random Forest range model trainer
│   ├── train_anomaly_model.py   # Isolation Forest anomaly model trainer
│   ├── prediction_service.py    # Real-time inference service
│   └── models/                  # Serialized .joblib models
└── docs/
    ├── API_DOCUMENTATION.md     # Full REST API endpoints reference
    └── DEPLOYMENT.md            # Vercel & Render production deployment guide
```

---

## 🛡️ License
Designed and developed for EV SmartTrace 360.
All vehicle diagnostic trouble codes comply with SAE J2012 / ISO 15031 OBD standards.
