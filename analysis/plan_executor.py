import pandas as pd

from analysis.filters import filter_dataframe

from analysis.query_engine import (
    total,
    average,
    median,
    count,
    group_count,
    minimum,
    maximum,
    distinct,
    group_sum,
    group_average,
    group_percentage,
    highest_by,
    lowest_by,
    top_n,
    bottom_n
)


# ============================================================
# EXECUTE ANALYSIS PLAN
# ============================================================

def execute_analysis_plan(
    plan: dict,
    dataframe: pd.DataFrame
):
    """
    Execute an LLM-generated analysis plan.

    The LLM decides WHAT operation is required.
    Python performs the actual calculation.
    """

    # ========================================================
    # Read plan
    # ========================================================

    operation = plan.get(
        "operation"
    )

    column = plan.get(
        "column"
    )

    group_by = plan.get(
        "group_by"
    )

    filters = plan.get(
        "filters",
        {}
    )

    # --------------------------------------------------------
    # N for top_n / bottom_n
    # --------------------------------------------------------

    n = plan.get(
        "n",
        5
    )

    # ========================================================
    # DEBUG
    # ========================================================

    print(
        "\n[DEBUG] Analysis Plan"
    )

    print(
        f"[DEBUG] operation = {operation}"
    )

    print(
        f"[DEBUG] column = {column}"
    )

    print(
        f"[DEBUG] group_by = {group_by}"
    )

    print(
        f"[DEBUG] n = {n}"
    )

    print(
        f"[DEBUG] filters = {filters}"
    )

    # ========================================================
    # Validate dataframe
    # ========================================================

    if dataframe is None:

        raise ValueError(
            "Dataframe cannot be None."
        )

    if dataframe.empty:

        raise ValueError(
            "Dataset is empty."
        )

    # ========================================================
    # Validate column
    # ========================================================

    if column is not None:

        if column not in dataframe.columns:

            raise ValueError(
                f"Column '{column}' "
                "does not exist in dataset."
            )

    # ========================================================
    # Validate group_by
    # ========================================================

    if group_by is not None:

        if group_by not in dataframe.columns:

            raise ValueError(
                f"Group column '{group_by}' "
                "does not exist in dataset."
            )

    # ========================================================
    # Validate N
    # ========================================================

    if operation in [
        "top_n",
        "bottom_n"
    ]:

        try:

            n = int(n)

        except (
            TypeError,
            ValueError
        ):

            raise ValueError(
                "N must be a valid integer."
            )

        if n < 1:

            raise ValueError(
                "N must be at least 1."
            )

        if n > 100:

            raise ValueError(
                "N cannot be greater than 100."
            )

    # ========================================================
    # Apply filters
    # ========================================================

    filtered_dataframe = dataframe

    for (
        filter_column,
        filter_value
    ) in filters.items():

        if filter_column not in dataframe.columns:

            raise ValueError(
                f"Filter column "
                f"'{filter_column}' "
                "does not exist."
            )

        print(
            "[DEBUG] Applying filter:"
        )

        print(
            f"[DEBUG] {filter_column} = "
            f"{filter_value}"
        )

        filtered_dataframe = (
            filter_dataframe(
                filtered_dataframe,
                filter_column,
                filter_value
            )
        )

    # ========================================================
    # Check filtered result
    # ========================================================

    if filtered_dataframe.empty:

        return {

            "success":
                False,

            "operation":
                operation,

            "column":
                column,

            "group_by":
                group_by,

            "n":
                n
                if operation in [
                    "top_n",
                    "bottom_n"
                ]
                else None,

            "filters":
                filters,

            "result":
                None,

            "message":
                (
                    "No records found for the "
                    "specified filters."
                )
        }

    # ========================================================
    # TOTAL
    # ========================================================

    if operation == "total":

        result = total(
            filtered_dataframe,
            column
        )

        return {

            "success":
                True,

            "operation":
                operation,

            "column":
                column,

            "group_by":
                group_by,

            "filters":
                filters,

            "result":
                result
        }

    # ========================================================
    # AVERAGE
    # ========================================================

    if operation == "average":

        result = average(
            filtered_dataframe,
            column
        )

        return {

            "success":
                True,

            "operation":
                operation,

            "column":
                column,

            "group_by":
                group_by,

            "filters":
                filters,

            "result":
                result
        }

    # ========================================================
    # MEDIAN
    # ========================================================

    if operation == "median":

        result = median(
            filtered_dataframe,
            column
        )

        return {

            "success":
                True,

            "operation":
                operation,

            "column":
                column,

            "group_by":
                group_by,

            "filters":
                filters,

            "result":
                result
        }

    # ========================================================
    # COUNT
    # ========================================================

    if operation == "count":

        result = count(
            filtered_dataframe
        )

        return {

            "success":
                True,

            "operation":
                operation,

            "column":
                column,

            "group_by":
                group_by,

            "filters":
                filters,

            "result":
                result
        }

    # ========================================================
    # GROUP COUNT
    # ========================================================

    if operation == "group_count":

        if group_by is None:

            raise ValueError(
                "group_count requires "
                "a group_by column."
            )

        result = group_count(
            filtered_dataframe,
            group_by
        )

        return {

            "success":
                True,

            "operation":
                operation,

            "column":
                column,

            "group_by":
                group_by,

            "filters":
                filters,

            "result":
                result
        }

    # ========================================================
    # DISTINCT
    # ========================================================

    if operation == "distinct":

        result = distinct(
            filtered_dataframe,
            column
        )

        return {

            "success":
                True,

            "operation":
                operation,

            "column":
                column,

            "group_by":
                group_by,

            "filters":
                filters,

            "result":
                result
        }

    # ========================================================
    # MINIMUM
    # ========================================================

    if operation == "minimum":

        result = minimum(
            filtered_dataframe,
            column
        )

        return {

            "success":
                True,

            "operation":
                operation,

            "column":
                column,

            "group_by":
                group_by,

            "filters":
                filters,

            "result":
                result
        }

    # ========================================================
    # MAXIMUM
    # ========================================================

    if operation == "maximum":

        result = maximum(
            filtered_dataframe,
            column
        )

        return {

            "success":
                True,

            "operation":
                operation,

            "column":
                column,

            "group_by":
                group_by,

            "filters":
                filters,

            "result":
                result
        }

    # ========================================================
    # HIGHEST
    # ========================================================

    if operation == "highest":

        if group_by is None:

            raise ValueError(
                "Highest operation requires "
                "a group_by column."
            )

        result = highest_by(
            filtered_dataframe,
            column,
            group_by
        )

        return {

            "success":
                True,

            "operation":
                operation,

            "column":
                column,

            "group_by":
                group_by,

            "filters":
                filters,

            "result":
                result
        }

    # ========================================================
    # LOWEST
    # ========================================================

    if operation == "lowest":

        if group_by is None:

            raise ValueError(
                "Lowest operation requires "
                "a group_by column."
            )

        result = lowest_by(
            filtered_dataframe,
            column,
            group_by
        )

        return {

            "success":
                True,

            "operation":
                operation,

            "column":
                column,

            "group_by":
                group_by,

            "filters":
                filters,

            "result":
                result
        }

    # ========================================================
    # GROUP SUM
    # ========================================================

    if operation == "group_sum":

        if group_by is None:

            raise ValueError(
                "group_sum requires "
                "a group_by column."
            )

        result = group_sum(
            filtered_dataframe,
            group_by,
            column
        )

        result = result.to_dict()

        return {

            "success":
                True,

            "operation":
                operation,

            "column":
                column,

            "group_by":
                group_by,

            "filters":
                filters,

            "result":
                result
        }

    # ========================================================
    # GROUP AVERAGE
    # ========================================================

    if operation == "group_average":

        if group_by is None:

            raise ValueError(
                "group_average requires "
                "a group_by column."
            )

        result = group_average(
            filtered_dataframe,
            group_by,
            column
        )

        result = result.to_dict()

        return {

            "success":
                True,

            "operation":
                operation,

            "column":
                column,

            "group_by":
                group_by,

            "filters":
                filters,

            "result":
                result
        }

    # ========================================================
    # GROUP PERCENTAGE
    # ========================================================

    if operation == "group_percentage":

        if group_by is None:

            raise ValueError(
                "group_percentage requires "
                "a group_by column."
            )

        result = group_percentage(
            filtered_dataframe,
            group_by,
            column
        )

        return {

            "success":
                True,

            "operation":
                operation,

            "column":
                column,

            "group_by":
                group_by,

            "filters":
                filters,

            "result":
                result
        }

    # ========================================================
    # TOP N
    # ========================================================

    if operation == "top_n":

        if group_by is None:

            raise ValueError(
                "top_n requires "
                "a group_by column."
            )

        result = top_n(
            filtered_dataframe,
            column,
            group_by,
            n
        )

        return {

            "success":
                True,

            "operation":
                operation,

            "column":
                column,

            "group_by":
                group_by,

            "n":
                n,

            "filters":
                filters,

            "result":
                result
        }

    # ========================================================
    # BOTTOM N
    # ========================================================

    if operation == "bottom_n":

        if group_by is None:

            raise ValueError(
                "bottom_n requires "
                "a group_by column."
            )

        result = bottom_n(
            filtered_dataframe,
            column,
            group_by,
            n
        )

        return {

            "success":
                True,

            "operation":
                operation,

            "column":
                column,

            "group_by":
                group_by,

            "n":
                n,

            "filters":
                filters,

            "result":
                result
        }

    # ========================================================
    # UNKNOWN OPERATION
    # ========================================================

    raise ValueError(
        f"Unsupported analysis operation: "
        f"{operation}"
    )