import json
import re

import pandas as pd
from sqlalchemy import text
from sqlalchemy.orm import Session

from database.models import Dataset
from database.postgres import engine


def generate_table_name(
    filename: str,
    unique_id: str
) -> str:
    """
    Generate a safe and unique PostgreSQL table name.
    """

    # Remove file extension
    name = filename.rsplit(".", 1)[0]

    # Replace special characters with underscore
    name = re.sub(
        r"[^a-zA-Z0-9_]",
        "_",
        name
    )

    # Lowercase
    name = name.lower()

    # PostgreSQL identifiers should not become excessively long
    name = name[:40]

    # Use first 8 characters from UUID
    short_id = unique_id.replace("-", "")[:8]

    return f"data_{name}_{short_id}"


def save_dataset(
    db: Session,
    dataframe: pd.DataFrame,
    original_filename: str,
    stored_filename: str,
    file_type: str,
    profile: dict,
    unique_id: str
) -> Dataset:
    """
    Store cleaned dataset as a PostgreSQL table
    and save its metadata in the datasets table.
    """

    table_name = generate_table_name(
        original_filename,
        unique_id
    )

    try:
        # -----------------------------------------
        # 1. Store actual cleaned dataset
        # -----------------------------------------

        dataframe.to_sql(
            name=table_name,
            con=engine,
            if_exists="fail",
            index=False
        )

        # -----------------------------------------
        # 2. Create metadata record
        # -----------------------------------------

        dataset = Dataset(
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_type=file_type,
            table_name=table_name,
            row_count=len(dataframe),
            column_count=len(dataframe.columns),
            profile=json.dumps(
                profile,
                default=str
            )
        )

        # -----------------------------------------
        # 3. Store metadata
        # -----------------------------------------

        db.add(dataset)
        db.commit()
        db.refresh(dataset)

        return dataset

    except Exception:
        db.rollback()

        # If metadata saving fails after the actual
        # table was created, remove that table.
        with engine.begin() as connection:
            connection.execute(
                text(
                    f'DROP TABLE IF EXISTS "{table_name}"'
                )
            )

        raise