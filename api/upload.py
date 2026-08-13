from pathlib import Path
import shutil
import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile
)

from sqlalchemy.orm import Session

from database.dataset_store import save_dataset
from database.postgres import get_db

from ingestion.cleaner import clean_dataframe
from ingestion.csv_loader import load_csv
from ingestion.excel_loader import load_excel
from ingestion.profiler import profile_dataframe

from ingestion.embedding_pipeline import (
    store_dataset_embeddings
)


router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

UPLOAD_DIR = Path("uploads")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# ALLOWED FILE TYPES
# ============================================================

ALLOWED_EXTENSIONS = {
    ".csv",
    ".xlsx"
}


# ============================================================
# UPLOAD ENDPOINT
# ============================================================

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload, clean, profile, store and embed
    an Excel or CSV dataset.
    """

    # ========================================================
    # 1. VALIDATE FILE NAME
    # ========================================================

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="File name is missing."
        )

    extension = Path(
        file.filename
    ).suffix.lower()

    # ========================================================
    # 2. VALIDATE EXTENSION
    # ========================================================

    if extension not in ALLOWED_EXTENSIONS:

        raise HTTPException(
            status_code=400,
            detail=(
                "Only CSV and Excel (.xlsx) "
                "files are supported."
            )
        )

    # ========================================================
    # 3. GENERATE UNIQUE FILE ID
    # ========================================================

    file_id = str(
        uuid.uuid4()
    )

    unique_filename = (
        f"{file_id}{extension}"
    )

    file_path = (
        UPLOAD_DIR /
        unique_filename
    )

    try:

        # ====================================================
        # 4. SAVE UPLOADED FILE
        # ====================================================

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        # ====================================================
        # 5. LOAD DATASET
        # ====================================================

        if extension == ".csv":

            dataframe = load_csv(
                str(file_path)
            )

        elif extension == ".xlsx":

            dataframe = load_excel(
                str(file_path)
            )

        else:

            raise HTTPException(
                status_code=400,
                detail="Unsupported file type."
            )

        # ====================================================
        # 6. EMPTY DATASET CHECK
        # ====================================================

        if dataframe.empty:

            raise ValueError(
                "The uploaded dataset is empty."
            )

        # ====================================================
        # 7. ORIGINAL DATASET INFORMATION
        # ====================================================

        original_rows = len(
            dataframe
        )

        original_columns = len(
            dataframe.columns
        )

        # ====================================================
        # 8. CLEAN DATASET
        # ====================================================

        cleaned_dataframe = (
            clean_dataframe(
                dataframe
            )
        )

        if cleaned_dataframe.empty:

            raise ValueError(
                "Dataset contains no usable "
                "data after cleaning."
            )

        # ====================================================
        # 9. PROFILE DATASET
        # ====================================================

        profile = (
            profile_dataframe(
                cleaned_dataframe
            )
        )

        # ====================================================
        # 10. CLEANING STATISTICS
        # ====================================================

        cleaned_rows = len(
            cleaned_dataframe
        )

        cleaned_columns = len(
            cleaned_dataframe.columns
        )

        rows_removed = (
            original_rows -
            cleaned_rows
        )

        columns_removed = (
            original_columns -
            cleaned_columns
        )

        # ====================================================
        # 11. SAVE DATASET TO POSTGRESQL
        # ====================================================

        dataset = save_dataset(
            db=db,
            dataframe=cleaned_dataframe,
            original_filename=file.filename,
            stored_filename=unique_filename,
            file_type=extension,
            profile=profile,
            unique_id=file_id
        )

        # ====================================================
        # 12. CREATE EMBEDDINGS
        # ====================================================

        embedding_count = (
            store_dataset_embeddings(
                dataframe=cleaned_dataframe,
                dataset_id=dataset.id,
                dataset_name=file.filename,
                table_name=dataset.table_name
            )
        )

        # ====================================================
        # 13. RETURN RESPONSE
        # ====================================================

        return {

            "message": (
                "File uploaded, analyzed, "
                "stored and indexed successfully."
            ),

            "database": {

                "dataset_id":
                    dataset.id,

                "table_name":
                    dataset.table_name,

                "stored":
                    True
            },

            "file": {

                "original_filename":
                    file.filename,

                "stored_filename":
                    unique_filename,

                "file_type":
                    extension
            },

            "cleaning": {

                "original_rows":
                    original_rows,

                "cleaned_rows":
                    cleaned_rows,

                "rows_removed":
                    rows_removed,

                "original_columns":
                    original_columns,

                "cleaned_columns":
                    cleaned_columns,

                "columns_removed":
                    columns_removed
            },

            "embedding": {

                "stored":
                    True,

                "chunk_count":
                    embedding_count
            },

            "profile":
                profile
        }

    except ValueError as error:

        file_path.unlink(
            missing_ok=True
        )

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except HTTPException:

        file_path.unlink(
            missing_ok=True
        )

        raise

    except Exception as error:

        file_path.unlink(
            missing_ok=True
        )

        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {error}"
        )

    finally:

        await file.close()