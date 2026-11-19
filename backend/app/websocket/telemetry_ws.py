import asyncio
import json
import logging
from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect
from app.services.simulation_service import simulate_live_vehicle_telemetry
from app.database import SessionLocal
from app.models.vehicle import Vehicle

logger = logging.getLogger("ev_smarttrace.websocket")


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, vehicle_id: int, websocket: WebSocket):
        await websocket.accept()
        if vehicle_id not in self.active_connections:
            self.active_connections[vehicle_id] = set()
        self.active_connections[vehicle_id].add(websocket)
        logger.info(f"WebSocket client connected for vehicle {vehicle_id}")

    def disconnect(self, vehicle_id: int, websocket: WebSocket):
        if vehicle_id in self.active_connections:
            self.active_connections[vehicle_id].discard(websocket)
            if not self.active_connections[vehicle_id]:
                del self.active_connections[vehicle_id]
        logger.info(f"WebSocket client disconnected for vehicle {vehicle_id}")

    async def broadcast_vehicle(self, vehicle_id: int, data: dict):
        if vehicle_id in self.active_connections:
            dead_connections = set()
            for ws in self.active_connections[vehicle_id]:
                try:
                    await ws.send_text(json.dumps(data))
                except Exception:
                    dead_connections.add(ws)
            for dead in dead_connections:
                self.disconnect(vehicle_id, dead)


manager = ConnectionManager()


async def stream_telemetry(vehicle_id: int, websocket: WebSocket):
    await manager.connect(vehicle_id, websocket)
    try:
        while True:
            # Check if vehicle exists in database
            db = SessionLocal()
            try:
                vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
                if vehicle:
                    telemetry = simulate_live_vehicle_telemetry(vehicle)
                    await websocket.send_text(json.dumps({
                        "type": "TELEMETRY_UPDATE",
                        "data": telemetry
                    }))
            finally:
                db.close()
            # Push live update every 3 seconds
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        manager.disconnect(vehicle_id, websocket)
    except Exception as e:
        logger.error(f"WebSocket stream error: {e}")
        manager.disconnect(vehicle_id, websocket)
