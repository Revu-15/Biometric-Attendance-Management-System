from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from datetime import date, timedelta
import asyncio

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash

from app.api import auth, clients, plans, attendance, payments, reports, devices, audit_logs
from app.models import User, Client, Plan, ClientPlan, Device

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket Connection Manager for Real-Time Ticker
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

@app.websocket("/ws/attendance")
async def websocket_attendance_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text() # Keepalive ping
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(clients.router, prefix=settings.API_V1_STR)
app.include_router(plans.router, prefix=settings.API_V1_STR)
app.include_router(attendance.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(devices.router, prefix=settings.API_V1_STR)
app.include_router(audit_logs.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "online",
        "api_docs": "/docs",
        "websocket": "/ws/attendance"
    }

# Seed default database records on startup
@app.on_event("startup")
def seed_initial_data():
    db = SessionLocal()
    try:
        # Seed Super Admin & Staff Users if missing
        admin = db.query(User).filter(User.email == "admin@system.com").first()
        if not admin:
            admin = User(
                name="Super Administrator",
                email="admin@system.com",
                password_hash=get_password_hash("admin123"),
                role="super_admin",
                status="active"
            )
            db.add(admin)

        staff = db.query(User).filter(User.email == "staff@system.com").first()
        if not staff:
            staff = User(
                name="Operator Staff",
                email="staff@system.com",
                password_hash=get_password_hash("staff123"),
                role="staff",
                status="active"
            )
            db.add(staff)

        # Seed Default Plans if missing
        plan_monthly = db.query(Plan).filter(Plan.name == "Monthly Meal Plan").first()
        if not plan_monthly:
            plan_monthly = Plan(
                name="Monthly Meal Plan",
                description="Includes 3 meals per day for 30 days",
                monthly_fee=3500.0,
                meal_limit=90,
                validity_days=30,
                status="active"
            )
            db.add(plan_monthly)

        plan_basic = db.query(Plan).filter(Plan.name == "Basic Student Attendance").first()
        if not plan_basic:
            plan_basic = Plan(
                name="Basic Student Attendance",
                description="Standard daily entry authorization plan",
                monthly_fee=1500.0,
                meal_limit=0,
                validity_days=30,
                status="active"
            )
            db.add(plan_basic)
            
        db.commit()

        # Seed Sample Biometric Machine if missing
        dev = db.query(Device).filter(Device.device_id == "DEVICE-01").first()
        if not dev:
            dev = Device(
                device_id="DEVICE-01",
                name="Main Gate Scanner",
                location="Entrance Lobby",
                adapter_type="generic_http",
                status="ONLINE"
            )
            db.add(dev)
            db.commit()

        # Seed Sample Clients if missing
        c1 = db.query(Client).filter(Client.client_code == "STU-2026-001").first()
        if not c1:
            c1 = Client(
                client_code="STU-2026-001",
                name="Rahul Patil",
                mobile="9876543210",
                email="rahul.patil@example.com",
                biometric_user_id="105",
                client_type="Student",
                status="active"
            )
            db.add(c1)
            db.commit()

            # Assign active plan
            cp1 = ClientPlan(
                client_id=c1.id,
                plan_id=plan_monthly.id,
                start_date=date.today() - timedelta(days=10),
                end_date=date.today() + timedelta(days=20),
                amount=3500.0,
                status="active"
            )
            db.add(cp1)
            db.commit()

        c2 = db.query(Client).filter(Client.client_code == "STU-2026-002").first()
        if not c2:
            c2 = Client(
                client_code="STU-2026-002",
                name="Amit Sharma",
                mobile="9812345678",
                email="amit.sharma@example.com",
                biometric_user_id="106",
                client_type="Monthly Mess Customer",
                status="active"
            )
            db.add(c2)
            db.commit()

            cp2 = ClientPlan(
                client_id=c2.id,
                plan_id=plan_monthly.id,
                start_date=date.today() - timedelta(days=5),
                end_date=date.today() + timedelta(days=25),
                amount=3500.0,
                status="active"
            )
            db.add(cp2)
            db.commit()

        c3 = db.query(Client).filter(Client.client_code == "STU-2026-003").first()
        if not c3:
            c3 = Client(
                client_code="STU-2026-003",
                name="Sneha Patil",
                mobile="9988776655",
                email="sneha.patil@example.com",
                biometric_user_id="107",
                client_type="Student",
                status="active"
            )
            db.add(c3)
            db.commit()

            # Expired plan test client
            cp3 = ClientPlan(
                client_id=c3.id,
                plan_id=plan_basic.id,
                start_date=date.today() - timedelta(days=40),
                end_date=date.today() - timedelta(days=10),
                amount=1500.0,
                status="expired"
            )
            db.add(cp3)
            db.commit()

    finally:
        db.close()
