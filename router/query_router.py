def route_question(
    question: str
) -> str:
    """
    Decide whether a question requires:

        analysis
        metadata
        rag

    Analysis:
        Aggregations
        Filtering
        Counting
        Comparisons
        Distinct values
        Entity questions

    Metadata:
        Dataset schema
        Column names
        Data types
        Row/column counts
        Missing values
        Dataset profile

    RAG:
        General descriptive/context questions
        that require semantic retrieval.
    """

    # ========================================================
    # EMPTY QUESTION
    # ========================================================

    if not question or not question.strip():

        return "rag"

    question_lower = (
        question
        .lower()
        .strip()
    )

    # ========================================================
    # METADATA QUESTIONS
    # ========================================================

    metadata_patterns = [

        # ----------------------------------------------------
        # Columns
        # ----------------------------------------------------

        "what columns",
        "which columns",
        "columns present",
        "columns available",
        "column names",
        "list columns",
        "list the columns",

        # ----------------------------------------------------
        # Schema
        # ----------------------------------------------------

        "what is the schema",
        "what's the schema",
        "dataset schema",
        "data schema",
        "show schema",

        # ----------------------------------------------------
        # Data types
        # ----------------------------------------------------

        "data types",
        "datatype",
        "data type",
        "types of columns",
        "column types",

        # ----------------------------------------------------
        # Dataset size
        # ----------------------------------------------------

        "how many rows",
        "number of rows",
        "row count",
        "how many records",
        "number of records",
        "record count",

        "how many columns",
        "number of columns",
        "column count",

        # ----------------------------------------------------
        # Missing values
        # ----------------------------------------------------

        "missing values",
        "missing data",
        "null values",
        "nulls",
        "empty values",

        # ----------------------------------------------------
        # Dataset information
        # ----------------------------------------------------

        "dataset information",
        "dataset info",
        "dataset details",
        "dataset profile",
        "profile of the dataset",
        "information about the dataset"
    ]

    for pattern in metadata_patterns:

        if pattern in question_lower:

            return "metadata"

    # ========================================================
    # ANALYTICAL KEYWORDS
    # ========================================================

    analytical_keywords = [

        # ----------------------------------------------------
        # Aggregations
        # ----------------------------------------------------

        "total",
        "sum",
        "average",
        "mean",

        # ----------------------------------------------------
        # Min / Max
        # ----------------------------------------------------

        "minimum",
        "maximum",
        "max",
        "min",

        # ----------------------------------------------------
        # Counting
        # ----------------------------------------------------

        "count",
        "how many",
        "number of",

        # ----------------------------------------------------
        # Ranking / comparison
        # ----------------------------------------------------

        "highest",
        "lowest",
        "top",
        "bottom",
        "best",
        "worst",

        "compare",
        "comparison",

        # ----------------------------------------------------
        # Statistical / analytical
        # ----------------------------------------------------

        "percentage",
        "percent",
        "growth",
        "trend",

        # ----------------------------------------------------
        # Numeric dataset columns
        # ----------------------------------------------------

        "sales",
        "profit",
        "quantity",

        # ----------------------------------------------------
        # Analytical time expressions
        # ----------------------------------------------------

        "per month",
        "per year",
        "per day",

        "by month",
        "by year",
        "by day",

        "by region",
        "by category",
        "by product",
        "by customer"
    ]

    for keyword in analytical_keywords:

        if keyword in question_lower:

            return "analysis"

    # ========================================================
    # DISTINCT / ENTITY QUESTIONS
    # ========================================================

    distinct_patterns = [

        # ----------------------------------------------------
        # Products
        # ----------------------------------------------------

        "which products",
        "what products",
        "products sold",
        "products purchased",
        "products were sold",
        "product sold",

        # ----------------------------------------------------
        # Customers
        # ----------------------------------------------------

        "which customers",
        "what customers",
        "customers purchased",
        "customers who purchased",
        "customers bought",
        "who purchased",
        "who bought",

        # ----------------------------------------------------
        # Categories
        # ----------------------------------------------------

        "which categories",
        "what categories",
        "categories available",
        "categories sold",

        # ----------------------------------------------------
        # Regions
        # ----------------------------------------------------

        "which regions",
        "what regions",
        "regions available",

        # ----------------------------------------------------
        # Distinct / unique
        # ----------------------------------------------------

        "distinct",
        "unique values",
        "unique",
        "list all",
        "list the"
    ]

    for pattern in distinct_patterns:

        if pattern in question_lower:

            return "analysis"

    # ========================================================
    # ENTITY + FILTER QUESTIONS
    # ========================================================
    #
    # Examples:
    #
    # Which products were sold in South?
    # Which customers purchased Electronics?
    # What products are in Electronics?
    #
    # These require the actual dataframe.
    # ========================================================

    entity_keywords = [

        "product",
        "products",

        "customer",
        "customers",

        "category",
        "categories",

        "region",
        "regions"
    ]

    filter_keywords = [

        "in",
        "for",
        "from",
        "with",
        "within",
        "under"
    ]

    has_entity = any(
        keyword in question_lower
        for keyword in entity_keywords
    )

    has_filter = any(
        f" {keyword} " in
        f" {question_lower} "
        for keyword in filter_keywords
    )

    if has_entity and has_filter:

        return "analysis"

    # ========================================================
    # DEFAULT → RAG
    # ========================================================

    return "rag"