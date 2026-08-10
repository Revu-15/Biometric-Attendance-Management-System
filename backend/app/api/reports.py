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

router = APIRouter(prefix="/reports", tags=["Reports, Rules & Administration"])

@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()

    total_clients = db.query(Client).count()
    active_clients = db.query(Client).filter(Client.status == "active").count()

    active_plans_count = db.query(ClientPlan).filter(
        ClientPlan.status == "active",
        ClientPlan.start_date <= today,
        ClientPlan.end_date >= today
    ).count()

    todays_attendance_count = db.query(Attendance).filter(
        Attendance.attendance_date == today,
        Attendance.status.in_(["PRESENT", "LATE"])
    ).count()

    expiring_plans_count = db.query(ClientPlan).filter(
        ClientPlan.status == "active",
        ClientPlan.end_date >= today,
        ClientPlan.end_date <= today + timedelta(days=7)
    ).count()

    # Weekly trend
    weekly_trend = []
    for i in range(6, -1, -1):
        day_date = today - timedelta(days=i)
        cnt = db.query(Attendance).filter(
            Attendance.attendance_date == day_date,
            Attendance.status.in_(["PRESENT", "LATE"])
        ).count()
        weekly_trend.append({
            "date": day_date.strftime("%b %d"),
            "count": cnt
        })

    recent_punches = db.query(Attendance).order_by(Attendance.created_at.desc()).limit(10).all()
    punch_list = []
    for p in recent_punches:
        punch_list.append({
            "id": p.id,
            "time": p.attendance_time.strftime("%H:%M:%S") if p.attendance_time else "",
            "client_name": p.client.name if p.client else "Unknown",
            "client_code": p.client.client_code if p.client else "N/A",
            "status": p.status,
            "punch_type": p.punch_type,
            "device_id": p.device_id
        })

    return {
        "total_clients": total_clients,
        "active_clients": active_clients,
        "active_plans": active_plans_count,
        "todays_attendance": todays_attendance_count,
        "expiring_plans": expiring_plans_count,
        "weekly_trend": weekly_trend,
        "recent_punches": punch_list
    }

# Feature 16: Alerts & Notifications Feed
@router.get("/notifications")
def get_system_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()
    notifications = []

    # Device offline alerts
    cutoff_time = datetime.now() - timedelta(minutes=15)
    offline_devices = db.query(Device).filter(Device.last_seen < cutoff_time).all()
    for dev in offline_devices:
        notifications.append({
            "id": f"dev-{dev.id}",
            "type": "DEVICE_OFFLINE",
            "title": f"Device {dev.name} Offline",
            "message": f"Hardware scanner {dev.device_id} ({dev.location}) has not pinged since {dev.last_seen.strftime('%H:%M')}",
            "severity": "danger"
        })

    # Expiring subscriptions within 3 days
    expiring = db.query(ClientPlan).filter(
        ClientPlan.status == "active",
        ClientPlan.end_date >= today,
        ClientPlan.end_date <= today + timedelta(days=3)
    ).all()
    for ep in expiring:
        notifications.append({
            "id": f"plan-{ep.id}",
            "type": "PLAN_EXPIRING",
            "title": f"Subscription Expiring Soon",
            "message": f"Plan for {ep.client.name if ep.client else 'Client'} expires on {ep.end_date}",
            "severity": "warning"
        })

    # Failed punch alerts
    failed_cnt = db.query(FailedPunchLog).filter(FailedPunchLog.status == "PENDING").count()
    if failed_cnt > 0:
        notifications.append({
            "id": "failed-punches",
            "type": "FAILED_PUNCHES",
            "title": "Pending Failed Punches",
            "message": f"{failed_cnt} raw webhook punch event(s) require reprocessing in Sync Recovery",
            "severity": "warning"
        })

    return notifications

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
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = date(year, month + 1, 1) - timedelta(days=1)

    total_days = (end_date - start_date).days + 1

    attendances = db.query(Attendance).filter(
        Attendance.client_id == client.id,
        Attendance.attendance_date >= start_date,
        Attendance.attendance_date <= end_date,
        Attendance.status.in_(["PRESENT", "LATE"])
    ).all()

    present_days = len(set(a.attendance_date for a in attendances))
    absent_days = total_days - present_days
    attendance_pct = round((present_days / total_days) * 100, 2) if total_days > 0 else 0

    breakfast_cnt = sum(1 for a in attendances if a.punch_type == "BREAKFAST")
    lunch_cnt = sum(1 for a in attendances if a.punch_type == "LUNCH")
    dinner_cnt = sum(1 for a in attendances if a.punch_type == "DINNER")
    general_in_cnt = sum(1 for a in attendances if a.punch_type in ["IN", "PRESENT"])

    plan_record = db.query(ClientPlan).filter(
        ClientPlan.client_id == client.id,
        ClientPlan.start_date <= end_date,
        ClientPlan.end_date >= start_date
    ).order_by(ClientPlan.created_at.desc()).first()

    plan_name = "N/A"
    plan_fee = 0.0
    if plan_record:
        p = db.query(Plan).filter(Plan.id == plan_record.plan_id).first()
        if p:
            plan_name = p.name
            plan_fee = p.monthly_fee

    payments = db.query(Payment).filter(
        Payment.client_id == client.id,
        Payment.payment_date >= start_date,
        Payment.payment_date <= end_date
    ).all()

    total_paid = sum(p.amount for p in payments)
    balance_due = max(0.0, plan_fee - total_paid)

    return {
        "statement_period": f"{start_date.strftime('%B %Y')}",
        "client": {
            "id": client.id,
            "client_code": client.client_code,
            "name": client.name,
            "mobile": client.mobile,
            "email": client.email,
            "biometric_user_id": client.biometric_user_id,
            "client_type": client.client_type,
            "status": client.status
        },
        "plan": {
            "name": plan_name,
            "amount": plan_fee,
            "start_date": str(plan_record.start_date) if plan_record else None,
            "end_date": str(plan_record.end_date) if plan_record else None
        },
        "attendance": {
            "total_days": total_days,
            "present_days": present_days,
            "absent_days": absent_days,
            "attendance_percentage": attendance_pct,
            "meals_used": {
                "breakfast": breakfast_cnt,
                "lunch": lunch_cnt,
                "dinner": dinner_cnt,
                "general_checkins": general_in_cnt
            }
        },
        "financials": {
            "plan_fee": plan_fee,
            "total_paid": total_paid,
            "balance_due": balance_due,
            "payment_history": [
                {
                    "date": str(p.payment_date),
                    "amount": p.amount,
                    "method": p.payment_method,
                    "reference": p.transaction_reference
                } for p in payments
            ]
        }
    }

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
