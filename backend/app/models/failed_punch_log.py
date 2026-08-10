from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime, timezone
from app.core.database import Base

class FailedPunchLog(Base):
    __tablename__ = "failed_punch_logs"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), nullable=True)
    raw_payload = Column(Text, nullable=False)
    error_reason = Column(Text, nullable=False)
    status = Column(String(20), default="PENDING") # PENDING, REPROCESSED, DISCARDED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    reprocessed_at = Column(DateTime, nullable=True)
