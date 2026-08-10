from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from app.core.database import Base

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. "DEVICE-01"
    name = Column(String(100), nullable=False) # e.g. "Main Entrance Scanner"
    location = Column(String(100), nullable=True) # e.g. "Mess Hall Gate A"
    adapter_type = Column(String(50), default="generic_http") # generic_http, zkteco, essl
    status = Column(String(20), default="ONLINE") # ONLINE, OFFLINE, MAINTENANCE
    api_key = Column(String(100), nullable=True)
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
