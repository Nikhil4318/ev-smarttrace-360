# EV SmartTrace 360 - Production Deployment Guide

This guide covers production deployment for:
1. **Frontend**: Vercel (React + Vite + Tailwind CSS)
2. **Backend**: Render, Railway, or AWS ECS (FastAPI + Uvicorn + Scikit-learn)
3. **Database**: Managed MySQL 8.0+ (AWS RDS, PlanetScale, Railway, or DigitalOcean)

---

## 1. Frontend Deployment (Vercel)

### Option A: Vercel CLI
```bash
cd ev-smart/frontend
npm install
npm run build
vercel --prod
```

### Option B: GitHub Integration via Vercel Dashboard
1. Connect your repository to Vercel.
2. Select root directory: `ev-smart/frontend`.
3. Framework Preset: `Vite`.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-api.onrender.com/api`
   - `VITE_WS_BASE_URL`: `wss://your-backend-api.onrender.com/ws/telemetry`

SPA rewrite is pre-configured in `ev-smart/frontend/vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 2. Backend Deployment (Render or Railway)

### Using Docker (Pre-configured `Dockerfile`):
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables:
- `DATABASE_URL`: `mysql+pymysql://<user>:<password>@<host>:3306/ev_smarttrace`
- `JWT_SECRET_KEY`: `<generate-a-strong-32-char-random-secret>`
- `GEMINI_API_KEY`: `<your-gemini-key>` (optional)
- `OPENAI_API_KEY`: `<your-openai-key>` (optional)

---

## 3. Database Migration & Initialization (MySQL 8.0+)

1. Run the database schema on your MySQL instance:
```bash
mysql -u root -p < database/schema.sql
```

2. Seed initial demo vehicle and charging stations:
```bash
mysql -u root -p < database/seed.sql
```

Alembic migrations are also supported:
```bash
cd ev-smart/backend
alembic upgrade head
```

---

## 4. Pre-training Machine Learning Models

The trained Random Forest and Isolation Forest joblib models are persisted in `ev-smart/ml/models/`.
To re-train with custom fleet data:
```bash
python ev-smart/ml/train_range_model.py
python ev-smart/ml/train_anomaly_model.py
```
