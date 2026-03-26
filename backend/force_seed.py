
import os
import sys

# Add backend to sys.path
sys.path.append(os.path.abspath('.'))

from database.db import init_db
from database.seed import seed
from models import Base, engine

def force_reset():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Initializing database...")
    init_db()
    print("Seeding database...")
    seed()
    print("Database force-reset and seeded successfully.")

if __name__ == "__main__":
    force_reset()
