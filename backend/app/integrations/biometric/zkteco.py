from typing import Dict, Any
from datetime import datetime, timezone
from app.integrations.biometric.base import BaseBiometricAdapter, BiometricPunchEvent

class ZKTecoAdapter(BaseBiometricAdapter):
    """
    Parses ZKTeco ADMS push protocol webhooks.
    Example payload: {"SN": "ZK12345", "PIN": "105", "time": "2026-08-10 08:32:14", "type": "0"}
    """
    def parse_webhook_payload(self, data: Dict[str, Any]) -> BiometricPunchEvent:
        device_id = str(data.get("SN") or data.get("device_id") or "ZK-DEVICE")
        biometric_user_id = str(data.get("PIN") or data.get("user_id") or "")
        
        type_code = str(data.get("type", "0"))
        punch_type_map = {"0": "IN", "1": "OUT", "2": "BREAKFAST", "3": "LUNCH", "4": "DINNER"}
        punch_type = punch_type_map.get(type_code, "IN")
        
        time_str = data.get("time") or data.get("timestamp")
        parsed_ts = datetime.now(timezone.utc)
        if time_str:
            try:
                parsed_ts = datetime.strptime(str(time_str), "%Y-%m-%d %H:%M:%S")
            except Exception:
                pass
                
        return BiometricPunchEvent(
            device_id=device_id,
            biometric_user_id=biometric_user_id,
            timestamp=parsed_ts,
            punch_type=punch_type,
            raw_payload=data
        )
