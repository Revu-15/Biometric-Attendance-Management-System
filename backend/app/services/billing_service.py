from datetime import date
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.models.client import Client
from app.models.client_plan import ClientPlan
from app.models.plan import Plan
from app.models.attendance import Attendance
from app.models.payment import Payment

class BillingService:
    @staticmethod
    def calculate_monthly_statement(db: Session, client_id: int, month: int, year: int) -> Dict[str, Any]:
        """
        Calculate end-of-month billing statement:
        Plan Fee + Meal Consumption + Payments = Final Balance Due
        """
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise ValueError("Client not found")

        # 1. Fetch active/assigned plan for the target month
        client_plan = db.query(ClientPlan).filter(
            ClientPlan.client_id == client.id
        ).order_by(ClientPlan.created_at.desc()).first()

        plan_name = "No Plan"
        plan_fee = 0.0
        if client_plan:
            plan_obj = db.query(Plan).filter(Plan.id == client_plan.plan_id).first()
            plan_name = plan_obj.name if plan_obj else "Standard Plan"
            plan_fee = client_plan.amount

        # 2. Attendance & Meal breakdown
        attendances = db.query(Attendance).filter(
            Attendance.client_id == client.id,
            Attendance.attendance_date >= date(year, month, 1)
        ).all()

        # Filter by target month & year
        month_attendances = [a for a in attendances if a.attendance_date.month == month and a.attendance_date.year == year]
        
        present_days = len(set(a.attendance_date for a in month_attendances if a.status in ["PRESENT", "LATE"]))
        breakfast_count = len([a for a in month_attendances if a.punch_type == "BREAKFAST"])
        lunch_count = len([a for a in month_attendances if a.punch_type == "LUNCH"])
        dinner_count = len([a for a in month_attendances if a.punch_type == "DINNER"])
        general_checkins = len([a for a in month_attendances if a.punch_type in ["IN", "OUT"]])

        # 3. Payments Ledger
        payments = db.query(Payment).filter(
            Payment.client_id == client.id
        ).all()

        month_payments = [p for p in payments if p.payment_date.month == month and p.payment_date.year == year]
        total_paid = sum(p.amount for p in month_payments)
        balance_due = max(0.0, plan_fee - total_paid)

        return {
            "statement_period": f"{date(year, month, 1).strftime('%B %Y')}",
            "client": {
                "id": client.id,
                "client_code": client.client_code,
                "enrollment_id": client.enrollment_id,
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
                "start_date": str(client_plan.start_date) if client_plan else None,
                "end_date": str(client_plan.end_date) if client_plan else None
            },
            "attendance": {
                "total_logs": len(month_attendances),
                "present_days": present_days,
                "absent_days": max(0, 30 - present_days),
                "attendance_percentage": round((present_days / 26) * 100, 1) if present_days <= 26 else 100.0,
                "meals_used": {
                    "breakfast": breakfast_count,
                    "lunch": lunch_count,
                    "dinner": dinner_count,
                    "general_checkins": general_checkins
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
                    } for p in month_payments
                ]
            }
        }
