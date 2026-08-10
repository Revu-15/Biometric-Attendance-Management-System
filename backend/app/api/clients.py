from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
from app.core.database import get_db
from app.core.security import get_current_user, require_super_admin
from app.models.client import Client
from app.models.client_plan import ClientPlan
from app.models.plan import Plan
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.schemas import ClientCreate, ClientUpdate, ClientOut, ClientPlanOut

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.get("", response_model=List[ClientOut])
def get_clients(
    query: Optional[str] = Query(None, description="Search by name, code, mobile or biometric ID"),
    client_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Client)
    if query:
        search_pattern = f"%{query}%"
        q = q.filter(
            (Client.name.ilike(search_pattern)) |
            (Client.client_code.ilike(search_pattern)) |
            (Client.enrollment_id.ilike(search_pattern)) |
            (Client.mobile.ilike(search_pattern)) |
            (Client.biometric_user_id.ilike(search_pattern))
        )
    if client_type:
        q = q.filter(Client.client_type == client_type)
    if status_filter:
        q = q.filter(Client.status == status_filter)

    clients = q.order_by(Client.created_at.desc()).all()
    
    # Format client result with current active plan
    today = date.today()
    results = []
    for c in clients:
        active_plan = db.query(ClientPlan).filter(
            ClientPlan.client_id == c.id,
            ClientPlan.status == "active",
            ClientPlan.start_date <= today,
            ClientPlan.end_date >= today
        ).first()
        
        plan_out = None
        if active_plan:
            plan_obj = db.query(Plan).filter(Plan.id == active_plan.plan_id).first()
            plan_out = ClientPlanOut(
                id=active_plan.id,
                plan_id=active_plan.plan_id,
                plan_name=plan_obj.name if plan_obj else "Plan",
                start_date=active_plan.start_date,
                end_date=active_plan.end_date,
                amount=active_plan.amount,
                status=active_plan.status
            )
            
        c_dict = ClientOut.from_orm(c)
        c_dict.active_plan = plan_out
        results.append(c_dict)

    return results

@router.post("", response_model=ClientOut, status_code=status.HTTP_201_CREATED)
def create_client(
    payload: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)  # ← Super Admin only
):
    # Check duplicate client code or biometric ID
    existing_code = db.query(Client).filter(Client.client_code == payload.client_code).first()
    if existing_code:
        raise HTTPException(status_code=400, detail="Client code already exists")
        
    existing_bio = db.query(Client).filter(Client.biometric_user_id == payload.biometric_user_id).first()
    if existing_bio:
        raise HTTPException(status_code=400, detail=f"Biometric ID '{payload.biometric_user_id}' is already assigned to {existing_bio.name}")

    client = Client(
        client_code=payload.client_code,
        enrollment_id=payload.enrollment_id,
        name=payload.name,
        mobile=payload.mobile,
        email=payload.email,
        address=payload.address,
        gender=payload.gender,
        date_of_birth=payload.date_of_birth,
        photo_url=payload.photo_url,
        biometric_user_id=payload.biometric_user_id,
        client_type=payload.client_type,
        status=payload.status
    )
    db.add(client)
    db.commit()
    db.refresh(client)

    # Optional plan auto-assignment
    plan_out = None
    if payload.plan_id:
        plan = db.query(Plan).filter(Plan.id == payload.plan_id).first()
        if plan:
            start_d = payload.plan_start_date or date.today()
            end_d = start_d + timedelta(days=plan.validity_days)
            c_plan = ClientPlan(
                client_id=client.id,
                plan_id=plan.id,
                start_date=start_d,
                end_date=end_d,
                amount=plan.monthly_fee,
                status="active"
            )
            db.add(c_plan)
            db.commit()
            db.refresh(c_plan)
            plan_out = ClientPlanOut(
                id=c_plan.id,
                plan_id=plan.id,
                plan_name=plan.name,
                start_date=start_d,
                end_date=end_d,
                amount=plan.monthly_fee,
                status="active"
            )

    # Audit log
    audit = AuditLog(
        user_email=current_user.email,
        action="CLIENT_CREATED",
        target_entity="Client",
        target_id=str(client.id),
        details=f"Created client {client.name} ({client.client_code}) with Biometric ID {client.biometric_user_id}"
    )
    db.add(audit)
    db.commit()

    res = ClientOut.from_orm(client)
    res.active_plan = plan_out
    return res

@router.get("/{client_id}", response_model=ClientOut)
def get_client_details(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    today = date.today()
    active_plan = db.query(ClientPlan).filter(
        ClientPlan.client_id == client.id,
        ClientPlan.status == "active",
        ClientPlan.start_date <= today,
        ClientPlan.end_date >= today
    ).first()
    
    plan_out = None
    if active_plan:
        plan_obj = db.query(Plan).filter(Plan.id == active_plan.plan_id).first()
        plan_out = ClientPlanOut(
            id=active_plan.id,
            plan_id=active_plan.plan_id,
            plan_name=plan_obj.name if plan_obj else "Plan",
            start_date=active_plan.start_date,
            end_date=active_plan.end_date,
            amount=active_plan.amount,
            status=active_plan.status
        )

    res = ClientOut.from_orm(client)
    res.active_plan = plan_out
    return res

@router.put("/{client_id}", response_model=ClientOut)
def update_client(
    client_id: int,
    payload: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)  # ← Super Admin only
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    update_data = payload.dict(exclude_unset=True)
    
    if "biometric_user_id" in update_data and update_data["biometric_user_id"] != client.biometric_user_id:
        existing = db.query(Client).filter(Client.biometric_user_id == update_data["biometric_user_id"]).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Biometric ID '{update_data['biometric_user_id']}' is already in use")

    for key, val in update_data.items():
        setattr(client, key, val)

    db.commit()
    db.refresh(client)

    audit = AuditLog(
        user_email=current_user.email,
        action="CLIENT_UPDATED",
        target_entity="Client",
        target_id=str(client.id),
        details=f"Updated details for client {client.name}"
    )
    db.add(audit)
    db.commit()

    return client

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    db.delete(client)
    db.commit()

    audit = AuditLog(
        user_email=current_user.email,
        action="CLIENT_DELETED",
        target_entity="Client",
        target_id=str(client_id),
        details=f"Deleted client {client.name} ({client.client_code})"
    )
    db.add(audit)
    db.commit()
