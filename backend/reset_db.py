
import os
import sys

# Add backend to sys.path
sys.path.append(os.path.abspath('.'))

from database.db import init_db, SessionLocal, engine
from database.seed import seed
from models import Base

def reset():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Initializing database...")
    init_db()
    print("Seeding database...")
    seed()
    print("Database reset and seeded successfully.")

if __name__ == "__main__":
    confirm = input("This will DELETE ALL DATA in hexa.db. Are you sure? (y/n): ")
    if confirm.lower() == 'y':
        reset()
    else:
        print("Reset cancelled.")
