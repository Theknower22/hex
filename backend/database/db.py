import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base

# Determine database URL.
# Default to SQLite for easy local dev if POSTGRES_URL is not set,
# but user specifically wants PostgreSQL support, so we will use it if provided.

# Use absolute path for SQLite to prevent issues when running from different dirs
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
db_dir = os.path.join(BASE_DIR, 'database')
os.makedirs(db_dir, exist_ok=True)
default_sqlite_url = f"sqlite:///{os.path.join(db_dir, 'hexa.db')}"

DATABASE_URL = os.getenv("DATABASE_URL", default_sqlite_url)

# Connect args needed for SQLite, not for Postgres
is_sqlite = DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

# High-performance pooling for PostgreSQL
engine_args = {
    "connect_args": connect_args
}

if not is_sqlite:
    engine_args.update({
        "pool_size": 20,          # Increased for high-concurrency audits
        "max_overflow": 40,       # Allow burst of connections during heavy scanning
        "pool_timeout": 60,       # Wait longer for connection availability
        "pool_recycle": 1800,     # Recycle connections every 30 mins to avoid stale handles
        "pool_pre_ping": True     # Detect dropped connections early
    })

engine = create_engine(DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
