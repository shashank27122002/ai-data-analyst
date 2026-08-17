from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import numpy as np

from router.query_router import route_question
from pipeline import run_pipeline


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/query",
    tags=["Query"]
)


# ============================================================
# REQUEST MODEL
# ============================================================

class QueryRequest(BaseModel):

    dataset_id: int

    question: str


# ============================================================
# JSON SAFE CONVERSION
# ============================================================

def make_json_safe(value):
    """
    Recursively convert NumPy values into normal Python
    values so FastAPI can safely serialize the response.
    """

    # NumPy scalar values
    if isinstance(value, np.generic):

        return value.item()

    # NumPy arrays
    if isinstance(value, np.ndarray):

        return value.tolist()

    # Dictionaries
    if isinstance(value, dict):

        return {
            key: make_json_safe(val)
            for key, val in value.items()
        }

    # Lists
    if isinstance(value, list):

        return [
            make_json_safe(item)
            for item in value
        ]

    # Tuples
    if isinstance(value, tuple):

        return [
            make_json_safe(item)
            for item in value
        ]

    # Normal Python values
    return value


# ============================================================
# QUERY ENDPOINT
# ============================================================

@router.post("/")
def query_dataset(
    request: QueryRequest
):
    """
    Ask a natural-language question about
    a selected dataset.

    The question is routed to either:

        Analysis
            OR
        RAG

    and the final answer is returned.
    """

    # ========================================================
    # 1. VALIDATE DATASET ID
    # ========================================================

    if request.dataset_id <= 0:

        raise HTTPException(
            status_code=400,
            detail=(
                "Dataset ID must be "
                "a positive integer."
            )
        )

    # ========================================================
    # 2. VALIDATE QUESTION
    # ========================================================

    if not request.question:

        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    question = request.question.strip()

    if not question:

        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    try:

        # ====================================================
        # 3. DETERMINE ROUTE
        # ====================================================

        route = route_question(
            question
        )

        print(
            "\n[QUERY API] ========================="
        )

        print(
            "[QUERY API] Question:"
        )

        print(
            question
        )

        print(
            "[QUERY API] Dataset ID:"
        )

        print(
            request.dataset_id
        )

        print(
            "[QUERY API] Route:"
        )

        print(
            route
        )

        # ====================================================
        # 4. RUN PIPELINE
        # ====================================================

        result = run_pipeline(
            question=question,
            dataset_id=request.dataset_id,
            return_details=True
        )

        # ====================================================
        # 5. BUILD BASE RESPONSE
        # ====================================================

        response = {

            "dataset_id":
                request.dataset_id,

            "question":
                question,

            "route":
                result.get(
                    "route",
                    route
                ),

            "answer":
                result.get(
                    "answer"
                )
        }

        # ====================================================
        # 6. ADD ANALYSIS DETAILS
        # ====================================================

        if result.get(
            "route"
        ) == "analysis":

            response["analysis"] = (
                result.get(
                    "analysis"
                )
            )

        # ====================================================
        # 7. ADD RAG DETAILS
        # ====================================================

        elif result.get(
            "route"
        ) == "rag":

            response["rag"] = (
                result.get(
                    "rag"
                )
            )

        # ====================================================
        # 8. DEBUG RESPONSE
        # ====================================================

        print(
            "[QUERY API] Final Response:"
        )

        print(
            response
        )

        print(
            "[QUERY API] =========================\n"
        )

        # ====================================================
        # 9. RETURN JSON-SAFE RESPONSE
        # ====================================================

        return make_json_safe(
            response
        )

    # ========================================================
    # VALUE ERROR
    # ========================================================

    except ValueError as error:

        print(
            "[QUERY API] ValueError:"
        )

        print(
            str(error)
        )

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    # ========================================================
    # UNEXPECTED ERROR
    # ========================================================

    except Exception as error:

        print(
            "[QUERY API] Unexpected error:"
        )

        print(
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Query failed: {error}"
            )
        )