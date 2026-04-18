from sqlalchemy.orm import Session
from models import AuditLog
from typing import Optional

class AuditService:
    @staticmethod
    def log_action(
        db: Session, 
        user_id: int, 
        action: str, 
        target: Optional[str] = None, 
        status: str = "SUCCESS", 
        details: Optional[str] = None
    ):
        """Records a new audit log entry."""
        log = AuditLog(
            user_id=user_id,
            action=action,
            target=target,
            status=status,
            details=details
        )
        db.add(log)
        db.commit()
        return log
