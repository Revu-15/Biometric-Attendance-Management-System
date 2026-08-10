import time
from datetime import datetime, timezone
from app.core.database import SessionLocal
from app.services.biometric_service import BiometricService

def run_attendance_sync_worker(poll_interval_seconds: int = 60):
    """
    Background worker process that periodically checks device heartbeats,
    flags offline machines, and attempts recovery sync.
    """
    print(f"[{datetime.now(timezone.utc)}] Starting ATTENDIQ Attendance Sync Worker (Interval: {poll_interval_seconds}s)...")
    while True:
        db = SessionLocal()
        try:
            offline_devices = BiometricService.check_device_heartbeats(db)
            if offline_devices:
                print(f"[{datetime.now(timezone.utc)}] ⚠️ Alert: {len(offline_devices)} device(s) offline!")
            else:
                print(f"[{datetime.now(timezone.utc)}] ✅ Device sync check OK — all machines active.")
        except Exception as e:
            print(f"Error in sync worker: {e}")
        finally:
            db.close()
        
        time.sleep(poll_interval_seconds)

if __name__ == "__main__":
    run_attendance_sync_worker()
