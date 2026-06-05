from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()
DATABASE_CONNECTION_URL = os.getenv("DATABASE_URL", "sqlite:///./octofish.db")

if DATABASE_CONNECTION_URL.startswith("sqlite"):
    database_engine = create_engine(DATABASE_CONNECTION_URL, connect_args={"check_same_thread": False})
else:
    database_engine = create_engine(DATABASE_CONNECTION_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=database_engine)
Base = declarative_base()

def get_database_session():
    database_session = SessionLocal()
    try:
        yield database_session
    finally:
        database_session.close()
