from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from datetime import datetime, timezone
from app.core.database import Base

class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False) # e.g. "Monthly Student Plan", "Full Meal Subscription"
    description = Column(Text, nullable=True)
    monthly_fee = Column(Float, nullable=False, default=0.0)
    meal_limit = Column(Integer, default=0) # 0 for unlimited, or e.g. 90 meals per month
    validity_days = Column(Integer, default=30)
    status = Column(String(20), default="active") # active, inactive
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
