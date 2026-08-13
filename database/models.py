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