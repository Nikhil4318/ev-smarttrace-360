import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

logger = logging.getLogger("ev_smarttrace.database")

Base = declarative_base()

def get_engine():
<<<<<<< HEAD
    # 1️⃣ If a SQLite URL is configured, use it directly (thread‑safe)
    if "sqlite" in settings.DATABASE_URL:
        return create_engine(
            settings.DATABASE_URL,
            connect_args={"check_same_thread": False},
        )

    # 2️⃣ Convert legacy postgres:// URLs to postgresql:// for SQLAlchemy compatibility
    if settings.DATABASE_URL.startswith("postgres://"):
        settings.DATABASE_URL = settings.DATABASE_URL.replace(
            "postgres://", "postgresql://", 1
        )

    # 3️⃣ Attempt to connect to the primary DB (PostgreSQL or MySQL)
=======
    # If SQLite URL configured, directly use SQLite engine with thread safety
    if "sqlite" in settings.DATABASE_URL:
        return create_engine(
            settings.DATABASE_URL,
            connect_args={"check_same_thread": False}
        )

    # Attempt connecting to configured MySQL DATABASE_URL
>>>>>>> 8e5f7472ecce640abeea7adc7958e2521e11d583
    try:
        connect_args = {"connect_timeout": 1} if "mysql" in settings.DATABASE_URL else {}
        engine = create_engine(
            settings.DATABASE_URL,
            pool_recycle=3600,
            pool_pre_ping=True,
<<<<<<< HEAD
            connect_args=connect_args,
        )
        # Test connection
        with engine.connect() as conn:
            logger.info("Successfully connected to primary database")
        return engine
    except Exception as e:
        logger.warning(
            f"Primary database connection failed ({e}). Falling back to SQLite ({settings.SQLITE_FALLBACK_URL})"
        )
        return create_engine(
            settings.SQLITE_FALLBACK_URL,
            connect_args={"check_same_thread": False},
=======
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
>>>>>>> 8e5f7472ecce640abeea7adc7958e2521e11d583
        )

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
