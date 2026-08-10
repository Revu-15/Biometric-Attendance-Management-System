from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from app.core.database import get_db
from app.core.security import get_current_user, require_super_admin
from app.models.plan import Plan
from app.models.client_plan import ClientPlan
from app.models.client import Client
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.schemas import PlanCreate, PlanOut, AssignPlanRequest, ClientPlanOut

router = APIRouter(prefix="/plans", tags=["Plans & Subscriptions"])

@router.get("", response_model=List[PlanOut])
def get_plans(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Plan).order_by(Plan.created_at.desc()).all()

@router.post("", response_model=PlanOut, status_code=status.HTTP_201_CREATED)
def create_plan(
    payload: PlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    plan = Plan(**payload.dict())
    db.add(plan)
    db.commit()
    db.refresh(plan)

    audit = AuditLog(
        user_email=current_user.email,
        action="PLAN_CREATED",
        target_entity="Plan",
        target_id=str(plan.id),
        details=f"Created plan {plan.name} @ ₹{plan.monthly_fee}"
    )
    db.add(audit)
    db.commit()

    return plan

@router.post("/assign", response_model=ClientPlanOut)
def assign_plan_to_client(
    payload: AssignPlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == payload.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    plan = db.query(Plan).filter(Plan.id == payload.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Deactivate existing active plans for this client
    db.query(ClientPlan).filter(
        ClientPlan.client_id == client.id,
        ClientPlan.status == "active"
    ).update({"status": "expired"})

    end_d = payload.start_date + timedelta(days=plan.validity_days)
    client_plan = ClientPlan(
        client_id=client.id,
        plan_id=plan.id,
        start_date=payload.start_date,
        end_date=end_d,
        amount=plan.monthly_fee,
        status="active"
    )
    db.add(client_plan)
    db.commit()
    db.refresh(client_plan)

    audit = AuditLog(
        user_email=current_user.email,
        action="PLAN_ASSIGNED",
        target_entity="ClientPlan",
        target_id=str(client_plan.id),
        details=f"Assigned plan '{plan.name}' to client {client.name} starting {payload.start_date}"
    )
    db.add(audit)
    db.commit()

    return ClientPlanOut(
        id=client_plan.id,
        plan_id=plan.id,
        plan_name=plan.name,
        start_date=client_plan.start_date,
        end_date=client_plan.end_date,
        amount=client_plan.amount,
        status=client_plan.status
    )
