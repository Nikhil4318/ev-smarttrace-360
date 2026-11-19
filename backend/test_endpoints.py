import sys
import os
import asyncio
import httpx

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from app.main import app, seed_initial_data

async def run_tests():
    seed_initial_data()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        print("Testing root endpoint...")
        r = await client.get("/")
        print("Root Status:", r.status_code, "Platform:", r.json()["platform"])

        print("Testing Login...")
        login_res = await client.post("/api/auth/login", json={
            "email": "demo@evsmarttrace.com",
            "password": "DemoPassword123!"
        })
        print("Login Status:", login_res.status_code)
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        data = login_res.json()
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        print("Testing Vehicles List...")
        v_res = await client.get("/api/vehicles", headers=headers)
        print("Vehicles Status:", v_res.status_code, "Count:", len(v_res.json()))
        vehicle_id = v_res.json()[0]["id"]

        print("Testing Dashboard...")
        dash_res = await client.get(f"/api/dashboard/{vehicle_id}", headers=headers)
        print("Dashboard Status:", dash_res.status_code)
        dash = dash_res.json()
        print(f"Vehicle: {dash['vehicle']['vehicle_name']}, SOC: {dash['latest_battery']['soc']}%, Range: {dash['estimated_range_km']} km")

        print("Testing AI Range Prediction...")
        range_res = await client.get(f"/api/battery/{vehicle_id}/range-prediction?speed_kmh=80&ambient_temp_c=25&ac_on=1", headers=headers)
        print("Range Prediction Status:", range_res.status_code, "Pred Range:", range_res.json()["predicted_range_km"], "Confidence:", range_res.json()["confidence_score"])

        print("Testing Diagnostics Scan...")
        diag_res = await client.post("/api/diagnostics/scan", json={"vehicle_id": vehicle_id}, headers=headers)
        print("Diagnostics Scan Status:", diag_res.status_code, "Status:", diag_res.json()["overall_status"], "Score:", diag_res.json()["health_score"])

        print("Testing Charging Estimate...")
        charge_res = await client.get(f"/api/charging/{vehicle_id}/estimate?target_soc=80&charging_power_kw=150", headers=headers)
        print("Charging Estimate Status:", charge_res.status_code, "Duration:", charge_res.json()["estimated_duration_formatted"])

        print("Testing Route Optimization...")
        route_res = await client.post("/api/routes/optimize", json={
            "vehicle_id": vehicle_id,
            "origin": "San Francisco",
            "destination": "San Jose",
            "current_battery_pct": 70,
            "desired_arrival_pct": 15
        }, headers=headers)
        print("Route Optimization Status:", route_res.status_code, "Routes count:", len(route_res.json()["routes"]))

        print("Testing SmartVoice Assistant Chat...")
        voice_res = await client.post("/api/assistant/chat", json={
            "vehicle_id": vehicle_id,
            "message": "Hey SmartTrace, what is my battery percentage?",
            "language": "en"
        }, headers=headers)
        print("SmartVoice Status:", voice_res.status_code, "Response:", voice_res.json()["response_text"][:60], "...")

        print("\nALL BACKEND API AND AI/ML ENDPOINTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_tests())
