import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

logger = logging.getLogger("ev_smarttrace.database")

Base = declarative_base()

def get_engine():
    # If SQLite URL configured, directly use SQLite engine with thread safety
    if "sqlite" in settings.DATABASE_URL:
        return create_engine(
            settings.DATABASE_URL,
            connect_args={"check_same_thread": False}
        )

    # Attempt connecting to configured MySQL DATABASE_URL
    try:
        connect_args = {"connect_timeout": 1} if "mysql" in settings.DATABASE_URL else {}
        engine = create_engine(
            settings.DATABASE_URL,
            pool_recycle=3600,
            pool_pre_ping=True,
            connect_args=connect_args
        )
        with engine.connect() as conn:
            logger.info("Successfully connected to primary database (MySQL)")
            return engine
    except Exception as e:
        logger.warning(
            f"Primary database connection failed ({e}). Falling back to local SQLite engine: {settings.SQLITE_FALLBACK_URL}"
        )
        return create_engine(
            settings.SQLITE_FALLBACK_URL,
            connect_args={"check_same_thread": False}
        )

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
