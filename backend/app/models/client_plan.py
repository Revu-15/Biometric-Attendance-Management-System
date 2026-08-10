from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class ClientPlan(Base):
    __tablename__ = "client_plans"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(20), default="active") # active, expired, cancelled

    client = relationship("Client", back_populates="client_plans")
    plan = relationship("Plan")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
