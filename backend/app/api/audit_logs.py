from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import require_super_admin
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.schemas import AuditLogOut

router = APIRouter(prefix="/audit-logs", tags=["Audit & Security Logs"])

@router.get("", response_model=List[AuditLogOut])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(200).all()
