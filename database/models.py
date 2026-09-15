from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from database.postgres import Base


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    original_filename = Column(
        String(255),
        nullable=False
    )

    stored_filename = Column(
        String(255),
        nullable=False
    )

    file_type = Column(
        String(20),
        nullable=False
    )

    table_name = Column(
        String(255),
        nullable=False,
        unique=True
    )

    row_count = Column(
        Integer,
        nullable=False
    )

    column_count = Column(
        Integer,
        nullable=False
    )

    profile = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ============================================================
# USER MODEL
# ============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String(320),
        nullable=False,
        unique=True,
        index=True
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(50),
        nullable=False,
        default="user"
    )

    is_active = Column(
        Integer,
        nullable=False,
        default=1
    )

    is_verified = Column(
        Integer,
        nullable=False,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    last_login_at = Column(
        DateTime,
        nullable=True
    )