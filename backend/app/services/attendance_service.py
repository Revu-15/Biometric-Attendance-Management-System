from datetime import datetime, date, time as time_cls, timedelta, timezone
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app.models.client import Client
from app.models.client_plan import ClientPlan
from app.models.attendance import Attendance
from app.models.device import Device
from app.models.system_setting import SystemSetting
from app.models.monthly_lock import MonthlyLock
from app.integrations.biometric.base import BiometricPunchEvent
from app.core.config import settings

class AttendanceService:
    @staticmethod
    def process_webhook_punch(db: Session, event: BiometricPunchEvent) -> Dict[str, Any]:
        """
        Process biometric punch event matching the ATTENDIQ specification:
        Receive -> Authenticate Device -> Find Biometric ID -> Find Client
        -> Check Active Status -> Check Duplicate -> Create Attendance -> Return JSON
        """
        today_date = event.timestamp.date() if isinstance(event.timestamp, datetime) else date.today()
        punch_time = event.timestamp.time() if isinstance(event.timestamp, datetime) else datetime.now(timezone.utc).time()

        # 0. Monthly Lock Check
        locked = db.query(MonthlyLock).filter(
            MonthlyLock.year == today_date.year,
            MonthlyLock.month == today_date.month,
            MonthlyLock.status == "LOCKED"
        ).first()

        if locked:
            return {
                "success": False,
                "error": "MONTH_LOCKED",
                "message": f"Attendance records for {today_date.strftime('%B %Y')} are locked."
            }

        # 1. Authenticate / Update Device Status
        device = db.query(Device).filter(Device.device_id == event.device_id).first()
        if not device:
            device = Device(
                device_id=event.device_id,
                name=f"Device {event.device_id}",
                location="Main Access Gate",
                status="ONLINE",
                last_seen=datetime.now(timezone.utc)
            )
            db.add(device)
            db.commit()
        else:
            device.status = "ONLINE"
            device.last_seen = datetime.now(timezone.utc)
            db.commit()

        # 2. Find Client by Biometric ID
        client = db.query(Client).filter(Client.biometric_user_id == event.biometric_user_id).first()

        if not client:
            attendance = Attendance(
                client_id=None,
                biometric_user_id=event.biometric_user_id,
                device_id=event.device_id,
                attendance_date=today_date,
                attendance_time=punch_time,
                punch_type=event.punch_type,
                source="BIOMETRIC_WEBHOOK",
                status="UNKNOWN_USER",
                validation_message=f"No registered client found for Biometric ID {event.biometric_user_id}"
            )
            db.add(attendance)
            db.commit()
            return {
                "success": False,
                "error": "UNKNOWN_USER",
                "message": f"Biometric ID: {event.biometric_user_id}. No registered client found. Contact administrator."
            }

        # 3. Check Active Status
        if client.status != "active":
            attendance = Attendance(
                client_id=client.id,
                biometric_user_id=event.biometric_user_id,
                device_id=event.device_id,
                attendance_date=today_date,
                attendance_time=punch_time,
                punch_type=event.punch_type,
                source="BIOMETRIC_WEBHOOK",
                status="ACCOUNT_INACTIVE",
                validation_message=f"Client account is {client.status.upper()}"
            )
            db.add(attendance)
            db.commit()
            return {
                "success": False,
                "error": "ACCOUNT_INACTIVE",
                "client": {"id": client.client_code, "name": client.name},
                "message": f"Account status is {client.status} for client {client.name}."
            }

        # 4. Check Active Plan Validity
        active_plan = db.query(ClientPlan).filter(
            ClientPlan.client_id == client.id,
            ClientPlan.status == "active",
            ClientPlan.start_date <= today_date,
            ClientPlan.end_date >= today_date
        ).first()

        if not active_plan:
            attendance = Attendance(
                client_id=client.id,
                biometric_user_id=event.biometric_user_id,
                device_id=event.device_id,
                attendance_date=today_date,
                attendance_time=punch_time,
                punch_type=event.punch_type,
                source="BIOMETRIC_WEBHOOK",
                status="PLAN_EXPIRED",
                validation_message="No active valid plan subscription found for today"
            )
            db.add(attendance)
            db.commit()
            return {
                "success": False,
                "error": "PLAN_EXPIRED",
                "client": {"id": client.client_code, "name": client.name},
                "message": f"Plan expired or not found for {client.name}."
            }

        # 5. Check Duplicate Cooldown Protection
        cooldown_setting = db.query(SystemSetting).filter(SystemSetting.key == "duplicate_cooldown_seconds").first()
        cooldown_secs = int(cooldown_setting.value) if cooldown_setting else settings.DUPLICATE_PUNCH_COOLDOWN_SECONDS

        cutoff_time = datetime.now(timezone.utc) - timedelta(seconds=cooldown_secs)
        recent_attendance = db.query(Attendance).filter(
            Attendance.client_id == client.id,
            Attendance.status.in_(["PRESENT", "LATE"]),
            Attendance.created_at >= cutoff_time
        ).first()

        if recent_attendance:
            attendance = Attendance(
                client_id=client.id,
                biometric_user_id=event.biometric_user_id,
                device_id=event.device_id,
                attendance_date=today_date,
                attendance_time=punch_time,
                punch_type=event.punch_type,
                source="BIOMETRIC_WEBHOOK",
                status="DUPLICATE_REJECTED",
                validation_message=f"Duplicate punch rejected within {cooldown_secs}s window"
            )
            db.add(attendance)
            db.commit()
            return {
                "success": False,
                "error": "DUPLICATE_PUNCH",
                "client": {"id": client.client_code, "name": client.name},
                "message": f"Already marked. Attendance recorded recently at {recent_attendance.attendance_time}."
            }

        # 6. Evaluate Late Threshold Rule
        late_setting = db.query(SystemSetting).filter(SystemSetting.key == "late_threshold_time").first()
        late_time_str = late_setting.value if late_setting else "09:00"
        
        final_status = "PRESENT"
        try:
            late_h, late_m = map(int, late_time_str.split(":"))
            late_threshold = time_cls(late_h, late_m, 0)
            if punch_time > late_threshold:
                final_status = "LATE"
        except Exception:
            pass

        # Create Attendance Record
        attendance = Attendance(
            client_id=client.id,
            biometric_user_id=event.biometric_user_id,
            device_id=event.device_id,
            attendance_date=today_date,
            attendance_time=punch_time,
            punch_type=event.punch_type,
            source="BIOMETRIC_WEBHOOK",
            status=final_status,
            validation_message=f"Attendance validated ({final_status})"
        )
        db.add(attendance)
        db.commit()
        db.refresh(attendance)

        # Standard Specification Response Format
        return {
            "success": True,
            "client": {
                "id": client.client_code,
                "name": client.name
            },
            "attendance": {
                "date": today_date.strftime("%Y-%m-%d"),
                "time": punch_time.strftime("%H:%M:%S"),
                "status": final_status.lower()
            }
        }

    @staticmethod
    def record_manual_attendance(db: Session, client_id: int, punch_type: str = "IN", attendance_date: Optional[date] = None, notes: Optional[str] = None) -> Attendance:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise ValueError("Client not found")

        today_d = attendance_date or date.today()
        now_time = datetime.now(timezone.utc).time()

        attendance = Attendance(
            client_id=client.id,
            biometric_user_id=client.biometric_user_id,
            device_id="MANUAL_ENTRY",
            attendance_date=today_d,
            attendance_time=now_time,
            punch_type=punch_type,
            source="MANUAL_OPERATOR",
            status="PRESENT",
            validation_message=notes or "Manual operator entry"
        )
        db.add(attendance)
        db.commit()
        db.refresh(attendance)
        return attendance
