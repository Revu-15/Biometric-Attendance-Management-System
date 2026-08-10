from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.models.device import Device
from app.models.attendance import Attendance
from app.integrations.biometric.base import BaseBiometricAdapter, BiometricPunchEvent
from app.integrations.biometric.generic import GenericHttpAdapter
from app.integrations.biometric.zkteco import ZKTecoAdapter

class BiometricService:
    @staticmethod
    def get_adapter(payload: Dict[str, Any]) -> BaseBiometricAdapter:
        """Auto-detect hardware device adapter based on payload signature"""
        if ZKTecoAdapter.can_handle(payload):
            return ZKTecoAdapter()
        return GenericHttpAdapter()

    @staticmethod
    def parse_punch(payload: Dict[str, Any]) -> BiometricPunchEvent:
        adapter = BiometricService.get_adapter(payload)
        return adapter.parse_webhook_payload(payload)

    @staticmethod
    def check_device_heartbeats(db: Session, offline_threshold_minutes: int = 15) -> List[Device]:
        """Check all registered devices and flag those that have stopped sending punches/heartbeats"""
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=offline_threshold_minutes)
        devices = db.query(Device).all()
        
        offline_devices = []
        for dev in devices:
            if dev.last_seen < cutoff:
                dev.status = "OFFLINE"
                offline_devices.append(dev)
            else:
                dev.status = "ONLINE"
        
        db.commit()
        return offline_devices

    @staticmethod
    def get_failed_punches(db: Session) -> List[Attendance]:
        """Retrieve unknown or failed punch attempts for retry / manual mapping"""
        return db.query(Attendance).filter(
            Attendance.status.in_(["UNKNOWN_USER", "ACCOUNT_INACTIVE", "PLAN_EXPIRED", "DUPLICATE_REJECTED"])
        ).order_by(Attendance.created_at.desc()).all()
