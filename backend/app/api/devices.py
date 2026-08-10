from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user, require_super_admin
from app.models.device import Device
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.schemas import DeviceCreate, DeviceOut

router = APIRouter(prefix="/devices", tags=["Biometric Devices"])

@router.get("", response_model=List[DeviceOut])
def get_devices(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Device).order_by(Device.last_seen.desc()).all()

@router.post("", response_model=DeviceOut, status_code=status.HTTP_201_CREATED)
def create_device(
    payload: DeviceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    existing = db.query(Device).filter(Device.device_id == payload.device_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Device ID already registered")

    device = Device(**payload.dict())
    db.add(device)
    db.commit()
    db.refresh(device)

    audit = AuditLog(
        user_email=current_user.email,
        action="DEVICE_REGISTERED",
        target_entity="Device",
        target_id=str(device.id),
        details=f"Registered device {device.name} ({device.device_id})"
    )
    db.add(audit)
    db.commit()

    return device
