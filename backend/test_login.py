from authentication.auth import verify_password, get_password_hash
from database.db import SessionLocal
from models import User

def test_login():
    db = SessionLocal()
    user = db.query(User).filter(User.username == "admin").first()
    if not user:
        print("User admin not found")
        return

    password = "admin123"
    if verify_password(password, user.hashed_password):
        print("LOGIN SUCCESS: Admin credentials verified")
    else:
        print("LOGIN FAILURE: Password verification failed")
        print(f"Stored hash: {user.hashed_password}")
        print(f"Generated hash for 'admin123': {get_password_hash(password)}")

if __name__ == "__main__":
    test_login()
