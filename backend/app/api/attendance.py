from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timezone
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.attendance import Attendance
from app.models.client import Client
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.schemas import AttendanceOut, WebhookPunchRequest, ManualAttendanceRequest
from app.integrations.biometric.generic import GenericHttpAdapter
from app.integrations.biometric.zkteco import ZKTecoAdapter
from app.services.validation_service import validate_and_record_punch

router = APIRouter(prefix="/attendance", tags=["Attendance & Validation Engine"])

# Import active websocket broadcasting helper from main
def broadcast_punch_event(data: Dict[str, Any]):
    from app.main import manager
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(manager.broadcast(data))
    except Exception:
        pass

@router.post("/webhook")
def biometric_webhook(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    """
    Biometric Integration Webhook Endpoint.
    Accepts push data from Biometric machines (ZKTeco, eSSL, or Generic HTTP adapter).
    """
    # Detect adapter type from payload structure
    if "PIN" in payload or "SN" in payload:
        adapter = ZKTecoAdapter()
    else:
        adapter = GenericHttpAdapter()

    event = adapter.parse_webhook_payload(payload)
    if not event.biometric_user_id:
        raise HTTPException(status_code=400, detail="Missing biometric_user_id in payload")

    result = validate_and_record_punch(db, event)

    # Format response for device
    response_data = {
        "success": result.is_valid,
        "status": result.status,
        "message": result.message,
        "client": {
            "id": result.client.client_code if result.client else None,
            "name": result.client.name if result.client else "Unknown",
            "biometric_user_id": event.biometric_user_id
        } if result.client else None,
        "attendance": {
            "date": str(result.attendance.attendance_date),
            "time": str(result.attendance.attendance_time),
            "status": result.attendance.status,
            "punch_type": result.attendance.punch_type
        } if result.attendance else None
    }

    # Broadcast live event via WebSocket to Admin Panel
    broadcast_punch_event({
        "event": "NEW_PUNCH",
        "data": response_data
    })

    return response_data

@router.post("/simulate")
def simulate_biometric_punch(
    biometric_user_id: str = Query(..., description="Biometric User ID e.g. 105"),
    device_id: str = Query("DEVICE-01", description="Device ID"),
    punch_type: str = Query("IN", description="IN, OUT, BREAKFAST, LUNCH, DINNER"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Simulator tool endpoint to emulate live biometric hardware punches directly from the web admin panel.
    """
    payload = {
        "device_id": device_id,
        "biometric_user_id": biometric_user_id,
        "punch_type": punch_type,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    return biometric_webhook(payload=payload, db=db)

@router.post("/manual", response_model=AttendanceOut)
def manual_attendance_entry(
    payload: ManualAttendanceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == payload.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    target_date = payload.attendance_date or date.today()
    now_time = datetime.now(timezone.utc).time()

    attendance = Attendance(
        client_id=client.id,
        biometric_user_id=client.biometric_user_id,
        device_id="MANUAL_OVERRIDE",
        attendance_date=target_date,
        attendance_time=now_time,
        punch_type=payload.punch_type,
        source="MANUAL_ENTRY",
        status="PRESENT",
        validation_message=f"Manually recorded by {current_user.email}. Notes: {payload.notes or 'N/A'}"
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    audit = AuditLog(
        user_email=current_user.email,
        action="MANUAL_ATTENDANCE_RECORDED",
        target_entity="Attendance",
        target_id=str(attendance.id),
        details=f"Manually marked attendance for {client.name} on {target_date}"
    )
    db.add(audit)
    db.commit()

    res = AttendanceOut.from_orm(attendance)
    res.client_name = client.name
    res.client_code = client.client_code
    return res

@router.get("/today", response_model=List[AttendanceOut])
def get_todays_attendance(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    q = db.query(Attendance).filter(Attendance.attendance_date == today)
    if status_filter:
        q = q.filter(Attendance.status == status_filter)

    logs = q.order_by(Attendance.created_at.desc()).all()
    results = []
    for log in logs:
        out = AttendanceOut.from_orm(log)
        if log.client:
            out.client_name = log.client.name
            out.client_code = log.client.client_code
        results.append(out)
    return results

@router.get("/client/{client_id}", response_model=List[AttendanceOut])
def get_client_attendance_history(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    logs = db.query(Attendance).filter(Attendance.client_id == client.id).order_by(Attendance.created_at.desc()).all()
    results = []
    for log in logs:
        out = AttendanceOut.from_orm(log)
        out.client_name = client.name
        out.client_code = client.client_code
        results.append(out)
    return results

@router.get("/logs", response_model=List[AttendanceOut])
def get_all_attendance_logs(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Attendance)
    if start_date:
        q = q.filter(Attendance.attendance_date >= start_date)
    if end_date:
        q = q.filter(Attendance.attendance_date <= end_date)
    if status_filter:
        q = q.filter(Attendance.status == status_filter)

    logs = q.order_by(Attendance.created_at.desc()).limit(300).all()
    results = []
    for log in logs:
        out = AttendanceOut.from_orm(log)
        if log.client:
            out.client_name = log.client.name
            out.client_code = log.client.client_code
        results.append(out)
    return results
