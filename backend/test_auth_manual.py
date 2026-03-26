import sys
import os

# Add backend directory to sys.path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

try:
    from authentication import auth
    print("Auth module imported successfully")
    
    # Test password hashing
    password = "admin123"
    hashed = auth.get_password_hash(password)
    print(f"Password hashed: {hashed[:10]}...")
    
    # Test password verification
    is_valid = auth.verify_password(password, hashed)
    print(f"Password verified: {is_valid}")
    
    # Test token creation
    token = auth.create_access_token(data={"sub": "admin", "role": "admin"})
    print(f"Token created: {token[:20]}...")
    
except Exception as e:
    print(f"Auth test failed: {e}")
    import traceback
    traceback.print_exc()
