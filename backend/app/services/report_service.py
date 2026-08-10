from datetime import date, timedelta
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.models.client import Client
from app.models.client_plan import ClientPlan
from app.models.attendance import Attendance
from app.models.device import Device
from app.models.payment import Payment

class ReportService:
    @staticmethod
    def get_dashboard_analytics(db: Session) -> Dict[str, Any]:
        """Aggregate high-level business intelligence & KPI counters for Dashboard"""
        today = date.today()
        
        total_clients = db.query(Client).count()
        active_clients = db.query(Client).filter(Client.status == "active").count()
        
        active_plans = db.query(ClientPlan).filter(
            ClientPlan.status == "active",
            ClientPlan.start_date <= today,
            ClientPlan.end_date >= today
        ).count()
        
        todays_attendance = db.query(Attendance).filter(
            Attendance.attendance_date == today,
            Attendance.status.in_(["PRESENT", "LATE"])
        ).count()
        
        seven_days_later = today + timedelta(days=7)
        expiring_plans = db.query(ClientPlan).filter(
            ClientPlan.status == "active",
            ClientPlan.end_date >= today,
            ClientPlan.end_date <= seven_days_later
        ).count()

        # 7-Day Trend Chart Data
        weekly_trend = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            count = db.query(Attendance).filter(
                Attendance.attendance_date == d,
                Attendance.status.in_(["PRESENT", "LATE"])
            ).count()
            weekly_trend.append({"date": d.strftime("%a %d"), "count": count})

        # Recent punches
        recent_logs = db.query(Attendance).order_by(Attendance.created_at.desc()).limit(8).all()
        recent_punches = []
        for log in recent_logs:
            c_name = "Unknown"
            c_code = "—"
            if log.client_id:
                client = db.query(Client).filter(Client.id == log.client_id).first()
                if client:
                    c_name = client.name
                    c_code = client.client_code

            recent_punches.append({
                "id": log.id,
                "time": str(log.attendance_time)[:5],
                "client_name": c_name,
                "client_code": c_code,
                "status": log.status,
                "punch_type": log.punch_type,
                "device_id": log.device_id
            })

        return {
            "total_clients": total_clients,
            "active_clients": active_clients,
            "active_plans": active_plans,
            "todays_attendance": todays_attendance,
            "expiring_plans": expiring_plans,
            "weekly_trend": weekly_trend,
            "recent_punches": recent_punches
        }

    @staticmethod
    def get_system_notifications(db: Session) -> List[Dict[str, Any]]:
        """Fetch system alerts (expiring plans, offline devices, unknown punches)"""
        today = date.today()
        notifications = []

        # Offline devices
        offline_devs = db.query(Device).filter(Device.status == "OFFLINE").all()
        for d in offline_devs:
            notifications.append({
                "type": "danger",
                "title": f"Device Offline ({d.device_id})",
                "message": f"Biometric scanner '{d.name}' at {d.location} is OFFLINE. Last seen {d.last_seen}."
            })

        # Expiring plans
        expiring = db.query(ClientPlan).filter(
            ClientPlan.status == "active",
            ClientPlan.end_date >= today,
            ClientPlan.end_date <= today + timedelta(days=7)
        ).all()
        if expiring:
            notifications.append({
                "type": "warning",
                "title": "Plan Expirations Impending",
                "message": f"{len(expiring)} client plan(s) expire within the next 7 days. Renewals required."
            })

        return notifications
