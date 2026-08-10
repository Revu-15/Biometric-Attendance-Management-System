from abc import ABC, abstractmethod
from typing import Dict, Any
from datetime import datetime

class BiometricPunchEvent:
    def __init__(self, device_id: str, biometric_user_id: str, timestamp: datetime, punch_type: str = "IN", raw_payload: Dict[str, Any] = None):
        self.device_id = device_id
        self.biometric_user_id = str(biometric_user_id).strip()
        self.timestamp = timestamp
        self.punch_type = punch_type
        self.raw_payload = raw_payload or {}

class BaseBiometricAdapter(ABC):
    @abstractmethod
    def parse_webhook_payload(self, data: Dict[str, Any]) -> BiometricPunchEvent:
        """Parse raw device payload into standardized BiometricPunchEvent"""
        pass
