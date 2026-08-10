from fastapi import APIRouter, Depends, HTTPException, Query, Response, Body
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List, Optional
from datetime import date, datetime, timedelta
import csv
import io
import os
import shutil

from app.core.database import get_db
from app.core.security import get_current_user, require_super_admin
from app.models.client import Client
from app.models.attendance import Attendance
from app.models.payment import Payment
from app.models.plan import Plan
from app.models.client_plan import ClientPlan
from app.models.device import Device
from app.models.system_setting import SystemSetting
from app.models.failed_punch_log import FailedPunchLog
from app.models.monthly_lock import MonthlyLock
from app.models.user import User
from app.models.audit_log import AuditLog

from app.services.report_service import ReportService
from app.services.billing_service import BillingService

router = APIRouter(prefix="/reports", tags=["Reports, Rules & Administration"])

@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ReportService.get_dashboard_analytics(db)

@router.get("/notifications")
def get_system_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ReportService.get_system_notifications(db)

# Feature 9: Settings & Rules Engine
@router.get("/settings")
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings_list = db.query(SystemSetting).all()
    defaults = {
        "late_threshold_time": "09:00",
        "duplicate_cooldown_seconds": "300",
        "business_name": "BioSync Enterprise"
    }
    for s in settings_list:
        defaults[s.key] = s.value
    return defaults

@router.post("/settings")
def update_settings(
    payload: Dict[str, str] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    for key, val in payload.items():
        setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if setting:
            setting.value = str(val)
        else:
            setting = SystemSetting(key=key, value=str(val), description=f"Config setting for {key}")
            db.add(setting)
    db.commit()

    audit = AuditLog(
        user_email=current_user.email,
        action="SETTINGS_UPDATED",
        target_entity="SystemSetting",
        details=f"Updated settings: {payload}"
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": "System rules updated successfully"}

# Feature 21: Monthly Lock & Approval Engine
@router.get("/monthly-lock-status")
def get_monthly_lock_status(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2020, le=2030),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    locked = db.query(MonthlyLock).filter(
        MonthlyLock.year == year,
        MonthlyLock.month == month,
        MonthlyLock.status == "LOCKED"
    ).first()
    return {
        "year": year,
        "month": month,
        "is_locked": bool(locked),
        "locked_by": locked.locked_by if locked else None,
        "locked_at": locked.created_at if locked else None
    }

@router.post("/monthly-lock-toggle")
def toggle_monthly_lock(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    year = int(payload.get("year", date.today().year))
    month = int(payload.get("month", date.today().month))
    action = payload.get("action", "LOCK") # "LOCK" or "UNLOCK"

    existing = db.query(MonthlyLock).filter(
        MonthlyLock.year == year,
        MonthlyLock.month == month
    ).first()

    if action == "LOCK":
        if not existing:
            existing = MonthlyLock(year=year, month=month, status="LOCKED", locked_by=current_user.email)
            db.add(existing)
        else:
            existing.status = "LOCKED"
            existing.locked_by = current_user.email
        message = f"Attendance records for Month {month}/{year} APPROVED & LOCKED from unauthorized edits."
    else:
        if existing:
            existing.status = "UNLOCKED"
        message = f"Attendance records for Month {month}/{year} UNLOCKED for admin maintenance."

    db.commit()

    audit = AuditLog(
        user_email=current_user.email,
        action="MONTHLY_LOCK_TOGGLED",
        target_entity="MonthlyLock",
        details=message
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": message, "status": existing.status if existing else "UNLOCKED"}

# Feature 18: Sync Recovery & Failed Punch Reprocessing
@router.get("/failed-punches")
def get_failed_punches(db: Session = Depends(get_db), current_user: User = Depends(require_super_admin)):
    return db.query(FailedPunchLog).order_by(FailedPunchLog.created_at.desc()).limit(100).all()

# Feature 20: Database Backup Trigger
@router.get("/backup-db")
def download_database_backup(db: Session = Depends(get_db), current_user: User = Depends(require_super_admin)):
    db_file = "biometric_app.db"
    if not os.path.exists(db_file):
        raise HTTPException(status_code=404, detail="Database file not found")
        
    backup_filename = f"biometric_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
    shutil.copyfile(db_file, backup_filename)

    audit = AuditLog(
        user_email=current_user.email,
        action="DATABASE_BACKUP_DOWNLOADED",
        target_entity="Database",
        details="Super Admin downloaded database backup copy"
    )
    db.add(audit)
    db.commit()

    return FileResponse(
        path=backup_filename,
        filename=backup_filename,
        media_type="application/x-sqlite3"
    )

# Existing Statement & CSV endpoints
@router.get("/monthly-statement/{client_id}")
def get_monthly_statement(
    client_id: int,
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2020, le=2030),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return BillingService.calculate_monthly_statement(db, client_id, month, year)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/export/attendance-csv")
def export_attendance_csv(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Attendance)
    if start_date:
        q = q.filter(Attendance.attendance_date >= start_date)
    if end_date:
        q = q.filter(Attendance.attendance_date <= end_date)

    logs = q.order_by(Attendance.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Date", "Time", "Client Code", "Client Name",
        "Biometric User ID", "Device ID", "Punch Type", "Status", "Validation Message"
    ])

    for log in logs:
        writer.writerow([
            log.id,
            log.attendance_date,
            log.attendance_time,
            log.client.client_code if log.client else "N/A",
            log.client.name if log.client else "Unknown User",
            log.biometric_user_id,
            log.device_id,
            log.punch_type,
            log.status,
            log.validation_message or ""
        ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=attendance_report_{date.today()}.csv"}
    )
