from typing import Dict, Any
from datetime import datetime, timezone
from app.integrations.biometric.base import BaseBiometricAdapter, BiometricPunchEvent

class GenericHttpAdapter(BaseBiometricAdapter):
    def parse_webhook_payload(self, data: Dict[str, Any]) -> BiometricPunchEvent:
        device_id = str(data.get("device_id") or data.get("deviceId") or "DEVICE-GENERIC")
        biometric_user_id = str(data.get("biometric_user_id") or data.get("device_user_id") or data.get("userId") or "")
        punch_type = str(data.get("punch_type") or data.get("punchType") or "IN")
        
        ts_str = data.get("timestamp") or data.get("punch_time")
        parsed_ts = datetime.now(timezone.utc)
        if ts_str:
            try:
                # Try ISO format
                parsed_ts = datetime.fromisoformat(str(ts_str).replace("Z", "+00:00"))
            except Exception:
                pass
                
        return BiometricPunchEvent(
            device_id=device_id,
            biometric_user_id=biometric_user_id,
            timestamp=parsed_ts,
            punch_type=punch_type,
            raw_payload=data
        )
