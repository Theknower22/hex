import ipaddress
import socket
from sqlalchemy.orm import Session
from models import AuthorizedScope

class SecurityService:
    @staticmethod
    def is_in_scope(target: str, db: Session) -> bool:
        """
        Validates if the target IP/Domain is within the authorized lab scope.
        """
        try:
            # 1. Check against all active authorized scopes in the DB
            scopes = db.query(AuthorizedScope).filter(AuthorizedScope.is_active == 1).all()
            
            # Check literal domain match first
            for scope in scopes:
                if target.lower() == scope.target.lower():
                    return True

            # 2. Resolve domain to IP if necessary for CIDR checks
            target_ip = target
            try:
                # If target is already an IP, it will pass
                ipaddress.ip_address(target)
            except ValueError:
                # Target is likely a domain, try to resolve
                try:
                    target_ip = socket.gethostbyname(target)
                except socket.gaierror:
                    return False # Could not resolve domain and no literal match found

            target_obj = ipaddress.ip_address(target_ip)
            for scope in scopes:
                try:
                    network = ipaddress.ip_network(scope.target, strict=False)
                    if target_obj in network:
                        return True
                except ValueError:
                    continue # Literal match already checked
            
            return False
        except Exception:
            return False

    @staticmethod
    def get_authorized_targets(db: Session):
        return db.query(AuthorizedScope).filter(AuthorizedScope.is_active == 1).all()
