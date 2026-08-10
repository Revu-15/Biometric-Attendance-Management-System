from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.payment import Payment
from app.models.client import Client
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.schemas import PaymentCreate, PaymentOut

router = APIRouter(prefix="/payments", tags=["Payments & Billing"])

@router.get("", response_model=List[PaymentOut])
def get_payments(
    client_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Payment)
    if client_id:
        q = q.filter(Payment.client_id == client_id)
        
    payments = q.order_by(Payment.payment_date.desc()).all()
    results = []
    for p in payments:
        out = PaymentOut.from_orm(p)
        if p.client:
            out.client_name = p.client.name
        results.append(out)
    return results

@router.post("", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def record_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == payload.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    payment = Payment(
        client_id=payload.client_id,
        amount=payload.amount,
        payment_date=payload.payment_date,
        payment_method=payload.payment_method,
        transaction_reference=payload.transaction_reference,
        notes=payload.notes,
        status="PAID",
        recorded_by=current_user.email
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    audit = AuditLog(
        user_email=current_user.email,
        action="PAYMENT_RECORDED",
        target_entity="Payment",
        target_id=str(payment.id),
        details=f"Recorded payment of ₹{payment.amount} for {client.name} via {payment.payment_method}"
    )
    db.add(audit)
    db.commit()

    out = PaymentOut.from_orm(payment)
    out.client_name = client.name
    return out
