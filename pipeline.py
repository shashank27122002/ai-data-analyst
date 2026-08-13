import json

from sqlalchemy import select

from router.query_router import route_question

from analysis.dataset_loader import load_dataset
from analysis.analysis_service import analyze_question

from rag.retriever import retrieve_similar_chunks
from rag.generator import generate_answer

from database.postgres import SessionLocal
from database.models import Dataset


# ============================================================
# GET DATASET
# ============================================================

def get_dataset(
    dataset_id: int
) -> Dataset:
    """
    Get dataset metadata from PostgreSQL.
    """

    print("[DEBUG] get_dataset() called")
    print(f"[DEBUG] dataset_id = {dataset_id}")

    db = SessionLocal()

    try:

        dataset = db.execute(
            select(Dataset).where(
                Dataset.id == dataset_id
            )
        ).scalar_one_or_none()

        if dataset is None:

            print("[DEBUG] Dataset NOT FOUND")

            raise ValueError(
                f"Dataset with ID {dataset_id} "
                "does not exist."
            )

        print("[DEBUG] Dataset FOUND")

        print(
            f"[DEBUG] table_name = "
            f"{dataset.table_name}"
        )

        return dataset

    finally:

        db.close()


# ============================================================
# BUILD METADATA CONTEXT
# ============================================================

def build_metadata_context(
    dataset: Dataset
) -> str:
    """
    Build exact dataset metadata context
    from the profile stored in PostgreSQL.
    """

    print(
        "[DEBUG] Building metadata context"
    )

    # ========================================================
    # CHECK PROFILE
    # ========================================================

    if not dataset.profile:

        print(
            "[DEBUG] Dataset profile is empty"
        )

        return (
            "No dataset profile is available."
        )

    # ========================================================
    # PARSE PROFILE
    # ========================================================

    try:

        profile = json.loads(
            dataset.profile
        )

    except Exception as error:

        print(
            "[DEBUG] Failed to parse dataset profile:"
        )

        print(
            error
        )

        return (
            "The dataset profile could not "
            "be parsed."
        )

    lines = []

    # ========================================================
    # BASIC DATASET INFORMATION
    # ========================================================

    lines.append(
        f"Rows: {profile.get('rows')}"
    )

    lines.append(
        f"Columns: {profile.get('columns')}"
    )

    # ========================================================
    # COLUMN NAMES
    # ========================================================

    column_names = profile.get(
        "column_names",
        []
    )

    lines.append("")

    lines.append(
        "Column Names:"
    )

    for column in column_names:

        lines.append(
            f"- {column}"
        )

    # ========================================================
    # DATA TYPES
    # ========================================================

    data_types = profile.get(
        "data_types",
        {}
    )

    lines.append("")

    lines.append(
        "Data Types:"
    )

    for column, data_type in data_types.items():

        lines.append(
            f"- {column}: {data_type}"
        )

    # ========================================================
    # MISSING VALUES
    # ========================================================

    missing_values = profile.get(
        "missing_values",
        {}
    )

    lines.append("")

    lines.append(
        "Missing Values:"
    )

    for column, value in missing_values.items():

        lines.append(
            f"- {column}: {value}"
        )

    # ========================================================
    # MISSING PERCENTAGE
    # ========================================================

    missing_percentage = profile.get(
        "missing_percentage",
        {}
    )

    lines.append("")

    lines.append(
        "Missing Percentage:"
    )

    for column, percentage in (
        missing_percentage.items()
    ):

        lines.append(
            f"- {column}: {percentage}%"
        )

    # ========================================================
    # NUMERIC COLUMNS
    # ========================================================

    numeric_columns = profile.get(
        "numeric_columns",
        []
    )

    lines.append("")

    lines.append(
        "Numeric Columns:"
    )

    for column in numeric_columns:

        lines.append(
            f"- {column}"
        )

    # ========================================================
    # CATEGORICAL COLUMNS
    # ========================================================

    categorical_columns = profile.get(
        "categorical_columns",
        []
    )

    lines.append("")

    lines.append(
        "Categorical Columns:"
    )

    for column in categorical_columns:

        lines.append(
            f"- {column}"
        )

    # ========================================================
    # FINAL CONTEXT
    # ========================================================

    context = "\n".join(
        lines
    )

    return context


# ============================================================
# RUN PIPELINE
# ============================================================

def run_pipeline(
    question: str,
    dataset_id: int,
    return_details: bool = False
):
    """
    Run the complete AI Data Analyst pipeline.

    Routes:

        Analysis:
            Question
                ↓
            Router
                ↓
            Analysis Planner
                ↓
            Plan Executor
                ↓
            Exact Result
                ↓
            Groq

        Metadata:
            Question
                ↓
            Router
                ↓
            Dataset Profile
                ↓
            Groq

        RAG:
            Question
                ↓
            Router
                ↓
            pgvector Retriever
                ↓
            Groq
    """

    # ========================================================
    # 1. VALIDATE QUESTION
    # ========================================================

    print(
        "[DEBUG] Step 1: Validate question"
    )

    if not question.strip():

        raise ValueError(
            "Question cannot be empty."
        )

    print(
        f"[DEBUG] question = {question}"
    )

    # ========================================================
    # 2. GET DATASET
    # ========================================================

    print(
        "[DEBUG] Step 2: Get dataset"
    )

    dataset = get_dataset(
        dataset_id
    )

    table_name = dataset.table_name

    print(
        f"[DEBUG] dataset_id = {dataset_id}"
    )

    print(
        f"[DEBUG] table_name = {table_name}"
    )

    # ========================================================
    # 3. ROUTE QUESTION
    # ========================================================

    print(
        "[DEBUG] Step 3: Route question"
    )

    route = route_question(
        question
    )

    print(
        f"[DEBUG] ROUTE = {route}"
    )

    print(
        f"[DEBUG] Question = {question}"
    )

    # ========================================================
    # 4. ANALYSIS ROUTE
    # ========================================================

    if route == "analysis":

        print(
            "[DEBUG] Step 4A: Loading dataset"
        )

        dataframe = load_dataset(
            table_name
        )

        print(
            f"[DEBUG] Rows = {len(dataframe)}"
        )

        print(
            "[DEBUG] Columns = "
            f"{dataframe.columns.tolist()}"
        )

        # ----------------------------------------------------
        # Analyze question
        # ----------------------------------------------------

        print(
            "[DEBUG] Step 4B: Analyzing question"
        )

        analysis_result = analyze_question(
            question=question,
            dataframe=dataframe
        )

        # ----------------------------------------------------
        # Analysis plan
        # ----------------------------------------------------

        print(
            "[DEBUG] Analysis Plan:"
        )

        print(
            analysis_result["plan"]
        )

        # ----------------------------------------------------
        # Analysis execution
        # ----------------------------------------------------

        print(
            "[DEBUG] Analysis Execution:"
        )

        print(
            analysis_result["execution"]
        )

        # ----------------------------------------------------
        # Formatted result
        # ----------------------------------------------------

        print(
            "[DEBUG] Formatted Analysis Result:"
        )

        print(
            analysis_result["formatted_result"]
        )

        # ----------------------------------------------------
        # Generate final answer
        # ----------------------------------------------------

        print(
            "[DEBUG] Generating final analysis answer"
        )

        answer = generate_answer(
            question=question,
            context=analysis_result[
                "formatted_result"
            ]
        )

        print(
            "[DEBUG] Analysis Final Answer:"
        )

        print(
            answer
        )

        # ====================================================
        # RETURN DETAILED ANALYSIS RESULT
        # ====================================================

        if return_details:

            execution = (
                analysis_result["execution"]
            )

            return {

                "route":
                    "analysis",

                "analysis": {

                    "operation":
                        execution.get(
                            "operation"
                        ),

                    "column":
                        execution.get(
                            "column"
                        ),

                    "group_by":
                        execution.get(
                            "group_by"
                        ),

                    "filters":
                        execution.get(
                            "filters",
                            {}
                        ),

                    "result":
                        execution.get(
                            "result"
                        )
                },

                "answer":
                    answer
            }

        # ====================================================
        # BACKWARD COMPATIBILITY
        # ====================================================

        return answer

    # ========================================================
    # 5. METADATA ROUTE
    # ========================================================

    if route == "metadata":

        print(
            "[DEBUG] Step 5A: Metadata route selected"
        )

        # ----------------------------------------------------
        # Build metadata context
        # ----------------------------------------------------

        metadata_context = (
            build_metadata_context(
                dataset
            )
        )

        print(
            "[DEBUG] Metadata Context:"
        )

        print(
            metadata_context
        )

        # ----------------------------------------------------
        # Generate metadata answer
        # ----------------------------------------------------

        print(
            "[DEBUG] Generating metadata answer"
        )

        answer = generate_answer(
            question=question,
            context=metadata_context
        )

        print(
            "[DEBUG] Metadata Final Answer:"
        )

        print(
            answer
        )

        # ====================================================
        # RETURN DETAILED METADATA RESULT
        # ====================================================

        if return_details:

            return {

                "route":
                    "metadata",

                "metadata": {

                    "source":
                        "dataset_profile"
                },

                "answer":
                    answer
            }

        return answer

    # ========================================================
    # 6. RAG ROUTE
    # ========================================================

    print(
        "[DEBUG] Step 6A: Retrieving RAG chunks"
    )

    chunks = retrieve_similar_chunks(
        query=question,
        dataset_id=dataset_id,
        top_k=5
    )

    print(
        "[DEBUG] Number of chunks retrieved = "
        f"{len(chunks)}"
    )

    # ========================================================
    # 7. CHECK RETRIEVED CHUNKS
    # ========================================================

    if not chunks:

        print(
            "[DEBUG] No RAG chunks found"
        )

        no_result_answer = (
            "I could not find relevant "
            "information in the selected dataset."
        )

        if return_details:

            return {

                "route":
                    "rag",

                "rag": {

                    "chunk_count":
                        0
                },

                "answer":
                    no_result_answer
            }

        return no_result_answer

    # ========================================================
    # 8. BUILD RAG CONTEXT
    # ========================================================

    print(
        "[DEBUG] Step 8: Building RAG context"
    )

    context_parts = []

    for index, chunk in enumerate(
        chunks,
        start=1
    ):

        print(
            f"[DEBUG] RAG Chunk {index}:"
        )

        print(
            chunk.content
        )

        context_parts.append(
            chunk.content
        )

    context = "\n\n".join(
        context_parts
    )

    print(
        "[DEBUG] Complete RAG Context:"
    )

    print(
        context
    )

    # ========================================================
    # 9. GENERATE RAG ANSWER
    # ========================================================

    print(
        "[DEBUG] Generating RAG answer"
    )

    answer = generate_answer(
        question=question,
        context=context
    )

    print(
        "[DEBUG] RAG Final Answer:"
    )

    print(
        answer
    )

    # ========================================================
    # 10. RETURN RAG DETAILS
    # ========================================================

    if return_details:

        return {

            "route":
                "rag",

            "rag": {

                "chunk_count":
                    len(chunks)
            },

            "answer":
                answer
        }

    return answer