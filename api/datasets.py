from pathlib import Path
import json

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy import select, text
from sqlalchemy.orm import Session

from database.models import Dataset
from database.postgres import get_db, engine


router = APIRouter(
    prefix="/datasets",
    tags=["Datasets"]
)


UPLOAD_DIR = Path("uploads")


# ============================================================
# LIST DATASETS
# ============================================================

@router.get("/")
def list_datasets(
    db: Session = Depends(get_db)
):
    """
    Return all uploaded datasets.
    """

    datasets = db.execute(
        select(Dataset)
        .order_by(
            Dataset.created_at.desc()
        )
    ).scalars().all()

    return {

        "count":
            len(datasets),

        "datasets": [

            {
                "dataset_id":
                    dataset.id,

                "original_filename":
                    dataset.original_filename,

                "stored_filename":
                    dataset.stored_filename,

                "file_type":
                    dataset.file_type,

                "table_name":
                    dataset.table_name,

                "row_count":
                    dataset.row_count,

                "column_count":
                    dataset.column_count,

                "created_at":
                    dataset.created_at
            }

            for dataset in datasets
        ]
    }


# ============================================================
# DATASET PREVIEW
# ============================================================

@router.get("/{dataset_id}/preview")
def preview_dataset(
    dataset_id: int,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Return a preview of the uploaded dataset.

    Default:
        10 rows

    Maximum:
        100 rows
    """

    print(
        "[DEBUG] Dataset preview requested"
    )

    print(
        f"[DEBUG] dataset_id = {dataset_id}"
    )

    print(
        f"[DEBUG] limit = {limit}"
    )

    # ========================================================
    # 1. VALIDATE LIMIT
    # ========================================================

    if limit < 1:

        raise HTTPException(
            status_code=400,
            detail="Limit must be at least 1."
        )

    if limit > 100:

        raise HTTPException(
            status_code=400,
            detail="Limit cannot be greater than 100."
        )

    # ========================================================
    # 2. FIND DATASET
    # ========================================================

    dataset = db.execute(
        select(Dataset).where(
            Dataset.id == dataset_id
        )
    ).scalar_one_or_none()

    if dataset is None:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Dataset with ID {dataset_id} "
                "does not exist."
            )
        )

    table_name = dataset.table_name

    print(
        f"[DEBUG] table_name = {table_name}"
    )

    # ========================================================
    # 3. READ DATASET TABLE
    # ========================================================

    try:

        with engine.connect() as connection:

            query = text(
                f'''
                SELECT *
                FROM "{table_name}"
                LIMIT :limit
                '''
            )

            result = connection.execute(
                query,
                {
                    "limit": limit
                }
            )

            columns = list(
                result.keys()
            )

            rows = []

            for row in result:

                row_dict = {}

                for column, value in zip(
                    columns,
                    row
                ):

                    if value is None:

                        row_dict[column] = None

                    elif hasattr(
                        value,
                        "item"
                    ):

                        try:

                            row_dict[column] = (
                                value.item()
                            )

                        except Exception:

                            row_dict[column] = (
                                str(value)
                            )

                    else:

                        row_dict[column] = value

                rows.append(
                    row_dict
                )

        print(
            "[DEBUG] Preview rows returned = "
            f"{len(rows)}"
        )

        print(
            "[DEBUG] Preview columns = "
            f"{columns}"
        )

        return {

            "dataset_id":
                dataset.id,

            "original_filename":
                dataset.original_filename,

            "table_name":
                dataset.table_name,

            "total_rows":
                dataset.row_count,

            "preview_rows":
                len(rows),

            "columns":
                columns,

            "data":
                rows
        }

    except Exception as error:

        print(
            "[DEBUG] Preview error:"
        )

        print(
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to load dataset "
                f"preview: {error}"
            )
        )


# ============================================================
# DATASET STATISTICS
# ============================================================

@router.get("/{dataset_id}/statistics")
def dataset_statistics(
    dataset_id: int,
    db: Session = Depends(get_db)
):
    """
    Return statistical summary for numeric
    columns in a dataset.

    Statistics:

        count
        sum
        average
        minimum
        maximum
    """

    print(
        "[DEBUG] Dataset statistics requested"
    )

    print(
        f"[DEBUG] dataset_id = {dataset_id}"
    )

    # ========================================================
    # 1. FIND DATASET
    # ========================================================

    dataset = db.execute(
        select(Dataset).where(
            Dataset.id == dataset_id
        )
    ).scalar_one_or_none()

    if dataset is None:

        print(
            "[DEBUG] Dataset NOT FOUND"
        )

        raise HTTPException(
            status_code=404,
            detail=(
                f"Dataset with ID {dataset_id} "
                "does not exist."
            )
        )

    table_name = dataset.table_name

    print(
        f"[DEBUG] table_name = {table_name}"
    )

    try:

        # ====================================================
        # 2. CHECK PROFILE
        # ====================================================

        if not dataset.profile:

            raise ValueError(
                "Dataset profile is not available."
            )

        # ====================================================
        # 3. LOAD PROFILE
        # ====================================================

        profile = json.loads(
            dataset.profile
        )

        # ====================================================
        # 4. GET NUMERIC COLUMNS
        # ====================================================

        numeric_columns = profile.get(
            "numeric_columns",
            []
        )

        print(
            "[DEBUG] Numeric columns:"
        )

        print(
            numeric_columns
        )

        # ====================================================
        # 5. NO NUMERIC COLUMNS
        # ====================================================

        if not numeric_columns:

            return {

                "dataset_id":
                    dataset.id,

                "table_name":
                    table_name,

                "rows":
                    dataset.row_count,

                "columns":
                    dataset.column_count,

                "numeric_columns":
                    [],

                "numeric_statistics":
                    {}
            }

        # ====================================================
        # 6. BUILD STATISTICS EXPRESSIONS
        # ====================================================

        column_expressions = []

        for column in numeric_columns:

            # ------------------------------------------------
            # Safely quote PostgreSQL identifier
            # ------------------------------------------------

            quoted_column = (
                '"'
                + column.replace(
                    '"',
                    '""'
                )
                + '"'
            )

            column_expression = f"""
                '{column}',
                json_build_object(
                    'count',
                    COUNT({quoted_column}),

                    'sum',
                    COALESCE(
                        SUM({quoted_column}),
                        0
                    ),

                    'average',
                    COALESCE(
                        AVG({quoted_column}),
                        0
                    ),

                    'minimum',
                    MIN({quoted_column}),

                    'maximum',
                    MAX({quoted_column})
                )
            """

            column_expressions.append(
                column_expression
            )

        # ====================================================
        # 7. BUILD FINAL SQL
        # ====================================================

        statistics_sql = f"""
            SELECT json_build_object(
                {",".join(column_expressions)}
            ) AS statistics
            FROM "{table_name}"
        """

        print(
            "[DEBUG] Executing statistics query"
        )

        # ====================================================
        # 8. EXECUTE SQL
        # ====================================================

        with engine.connect() as connection:

            result = connection.execute(
                text(statistics_sql)
            )

            row = result.fetchone()

        # ====================================================
        # 9. VALIDATE RESULT
        # ====================================================

        if row is None:

            raise ValueError(
                "Could not calculate dataset statistics."
            )

        statistics = row.statistics

        print(
            "[DEBUG] Statistics result:"
        )

        print(
            statistics
        )

        # ====================================================
        # 10. RETURN RESULT
        # ====================================================

        return {

            "dataset_id":
                dataset.id,

            "table_name":
                table_name,

            "rows":
                dataset.row_count,

            "columns":
                dataset.column_count,

            "numeric_columns":
                numeric_columns,

            "numeric_statistics":
                statistics
        }

    except ValueError as error:

        print(
            "[DEBUG] Statistics ValueError:"
        )

        print(
            str(error)
        )

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:

        print(
            "[DEBUG] Statistics error:"
        )

        print(
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to calculate dataset "
                f"statistics: {error}"
            )
        )


# ============================================================
# GET DATASET DETAILS
# ============================================================

@router.get("/{dataset_id}")
def get_dataset(
    dataset_id: int,
    db: Session = Depends(get_db)
):
    """
    Return details of a specific dataset.
    """

    dataset = db.execute(
        select(Dataset).where(
            Dataset.id == dataset_id
        )
    ).scalar_one_or_none()

    if dataset is None:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Dataset with ID {dataset_id} "
                "does not exist."
            )
        )

    return {

        "dataset_id":
            dataset.id,

        "original_filename":
            dataset.original_filename,

        "stored_filename":
            dataset.stored_filename,

        "file_type":
            dataset.file_type,

        "table_name":
            dataset.table_name,

        "row_count":
            dataset.row_count,

        "column_count":
            dataset.column_count,

        "profile":
            dataset.profile,

        "created_at":
            dataset.created_at
    }


# ============================================================
# DELETE DATASET
# ============================================================

@router.delete("/{dataset_id}")
def delete_dataset(
    dataset_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a dataset and all associated resources.

    Deletes:

        1. Dataset metadata
        2. PostgreSQL dataset table
        3. Dataset embeddings
        4. Uploaded physical file
    """

    # ========================================================
    # 1. FIND DATASET
    # ========================================================

    dataset = db.execute(
        select(Dataset).where(
            Dataset.id == dataset_id
        )
    ).scalar_one_or_none()

    if dataset is None:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Dataset with ID {dataset_id} "
                "does not exist."
            )
        )

    table_name = dataset.table_name

    stored_filename = (
        dataset.stored_filename
    )

    try:

        # ====================================================
        # 2. DELETE EMBEDDINGS
        # ====================================================

        with engine.begin() as connection:

            connection.execute(
                text(
                    """
                    DELETE FROM dataset_embeddings
                    WHERE dataset_id = :dataset_id
                    """
                ),
                {
                    "dataset_id":
                        dataset_id
                }
            )

            # =================================================
            # 3. DELETE DATASET TABLE
            # =================================================

            connection.execute(
                text(
                    f'DROP TABLE IF EXISTS '
                    f'"{table_name}"'
                )
            )

        # ====================================================
        # 4. DELETE DATASET METADATA
        # ====================================================

        db.delete(
            dataset
        )

        db.commit()

        # ====================================================
        # 5. DELETE UPLOADED FILE
        # ====================================================

        file_path = (
            UPLOAD_DIR /
            stored_filename
        )

        file_deleted = False

        if file_path.exists():

            file_path.unlink()

            file_deleted = True

        # ====================================================
        # 6. RETURN RESULT
        # ====================================================

        return {

            "message":
                "Dataset deleted successfully.",

            "dataset_id":
                dataset_id,

            "table_name":
                table_name,

            "metadata_deleted":
                True,

            "embeddings_deleted":
                True,

            "table_deleted":
                True,

            "file_deleted":
                file_deleted
        }

    except Exception as error:

        db.rollback()

        print(
            "[DEBUG] Delete dataset error:"
        )

        print(
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to delete dataset: "
                f"{error}"
            )
        )