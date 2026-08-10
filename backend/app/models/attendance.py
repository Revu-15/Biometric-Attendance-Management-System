from sqlalchemy import Column, Integer, String, Date, Time, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True, index=True) # None if unknown user
    biometric_user_id = Column(String(50), nullable=False, index=True)
    device_id = Column(String(50), nullable=False)
    attendance_date = Column(Date, nullable=False, index=True)
    attendance_time = Column(Time, nullable=False)
    punch_type = Column(String(20), default="IN") # IN, OUT, BREAKFAST, LUNCH, DINNER
    source = Column(String(50), default="BIOMETRIC_WEBHOOK") # BIOMETRIC_WEBHOOK, MANUAL, API
    status = Column(String(50), default="PRESENT") # PRESENT, DUPLICATE_REJECTED, UNKNOWN_USER, PLAN_EXPIRED, ACCOUNT_INACTIVE
    validation_message = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    client = relationship("Client", back_populates="attendances")
