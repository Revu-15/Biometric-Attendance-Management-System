from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, time, datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str
    email: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

# Client Schemas
class ClientBase(BaseModel):
    client_code: str
    name: str
    mobile: str
    email: Optional[str] = None
    address: Optional[str] = None
    gender: Optional[str] = "Other"
    date_of_birth: Optional[date] = None
    photo_url: Optional[str] = None
    biometric_user_id: str
    client_type: str = "Student" # Student, Mess, Hotel, Staff, Other
    status: str = "active" # active, inactive

class ClientCreate(ClientBase):
    plan_id: Optional[int] = None
    plan_start_date: Optional[date] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gender: Optional[str] = None
    biometric_user_id: Optional[str] = None
    client_type: Optional[str] = None
    status: Optional[str] = None

class ClientPlanOut(BaseModel):
    id: int
    plan_id: int
    plan_name: Optional[str] = None
    start_date: date
    end_date: date
    amount: float
    status: str

    class Config:
        from_attributes = True

class ClientOut(ClientBase):
    id: int
    created_at: datetime
    updated_at: datetime
    active_plan: Optional[ClientPlanOut] = None

    class Config:
        from_attributes = True

# Plan Schemas
class PlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    monthly_fee: float
    meal_limit: int = 0
    validity_days: int = 30
    status: str = "active"

class PlanCreate(PlanBase):
    pass

class PlanOut(PlanBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Subscription Schema
class AssignPlanRequest(BaseModel):
    client_id: int
    plan_id: int
    start_date: date

# Attendance & Webhook Schemas
class WebhookPunchRequest(BaseModel):
    device_id: str
    biometric_user_id: str
    timestamp: Optional[str] = None # ISO format string or Unix TS
    punch_type: Optional[str] = "IN"

class ManualAttendanceRequest(BaseModel):
    client_id: int
    punch_type: str = "IN"
    attendance_date: Optional[date] = None
    notes: Optional[str] = None

class AttendanceOut(BaseModel):
    id: int
    client_id: Optional[int]
    biometric_user_id: str
    device_id: str
    attendance_date: date
    attendance_time: time
    punch_type: str
    source: str
    status: str
    validation_message: Optional[str]
    created_at: datetime
    client_name: Optional[str] = None
    client_code: Optional[str] = None

    class Config:
        from_attributes = True

# Payment Schemas
class PaymentCreate(BaseModel):
    client_id: int
    amount: float
    payment_date: date
    payment_method: str = "UPI"
    transaction_reference: Optional[str] = None
    notes: Optional[str] = None

class PaymentOut(PaymentCreate):
    id: int
    status: str
    recorded_by: Optional[str]
    created_at: datetime
    client_name: Optional[str] = None

    class Config:
        from_attributes = True

# Device Schemas
class DeviceCreate(BaseModel):
    device_id: str
    name: str
    location: Optional[str] = None
    adapter_type: str = "generic_http"
    api_key: Optional[str] = None

class DeviceOut(DeviceCreate):
    id: int
    status: str
    last_seen: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Audit Log Schema
class AuditLogOut(BaseModel):
    id: int
    user_email: str
    action: str
    target_entity: Optional[str]
    target_id: Optional[str]
    details: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
