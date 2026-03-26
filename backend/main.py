from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
import uvicorn
import os
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from api import admin, recon, scan, vuln, ai, reports, exploit
from authentication import auth
from database.db import get_db, init_db
from models import User

app = FastAPI(title="AI-Assisted Ethical Penetration Testing Platform", version="1.0.0")

# Initialize DB
@app.on_event("startup")
def on_startup():
    init_db()
    try:
        from database.seed import seed
        seed()
        print("[STARTUP] Database initialized and seeded successfully.")
    except Exception as e:
        print(f"[STARTUP ERROR] Failed to run seed on startup: {e}")

# CORS Configuration
# Allowed origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://localhost:5174", "http://localhost:3000", 
        "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:3000",
        "http://localhost:8000", "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def root():
    return {"message": "Cybersecurity Platform API is online", "status": "active"}

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth.create_access_token(
        data={"sub": user.username, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/register")
async def register(user_data: dict, db: Session = Depends(get_db)):
    hashed_pw = auth.get_password_hash(user_data.get("password"))

    new_user = User(
        username=user_data.get("username"),
        email=user_data.get("email"),
        hashed_password=hashed_pw,
        role="security_analyst"  # Hardcoded to prevent privilege escalation
    )

    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Username or email already exists")

    return {"message": "User registered successfully", "username": new_user.username}


# Router inclusions
app.include_router(admin.router)
app.include_router(recon.router)
app.include_router(scan.router)
app.include_router(vuln.router)
app.include_router(ai.router)
app.include_router(reports.router)
app.include_router(exploit.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
