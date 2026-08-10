from sqlalchemy import Column, Integer, String, DateTime, Text, Date
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    client_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. STU-2026-001
    enrollment_id = Column(String(50), nullable=True, index=True) # e.g. ENR-99882
    name = Column(String(120), nullable=False)
    mobile = Column(String(20), nullable=False)
    email = Column(String(120), nullable=True)
    address = Column(Text, nullable=True)
    gender = Column(String(10), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    photo_url = Column(String(255), nullable=True)
    biometric_user_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. "105"
    client_type = Column(String(50), default="Student", nullable=False) # Student, Mess, Hotel, Staff, Other
    status = Column(String(20), default="active", nullable=False) # active, inactive, suspended
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    client_plans = relationship("ClientPlan", back_populates="client", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="client", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="client", cascade="all, delete-orphan")
