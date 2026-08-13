def _convert_value(value):
    """
    Convert NumPy values into normal Python values.
    """

    if hasattr(value, "item"):

        try:
            return value.item()

        except Exception:
            pass

    return value


def _format_filter_phrase(filters: dict) -> str:
    """
    Convert filters into natural language.
    """

    if not filters:

        return ""

    parts = []

    for key, value in filters.items():

        key_lower = key.lower()

        if key_lower == "region":

            parts.append(
                f"in {value}"
            )

        elif key_lower == "category":

            parts.append(
                f"in the {value} category"
            )

        elif key_lower == "customer":

            parts.append(
                f"for {value}"
            )

        elif key_lower == "product":

            parts.append(
                f"for {value}"
            )

        else:

            parts.append(
                f"where {key} is {value}"
            )

    return (
        " "
        + " and ".join(parts)
    )


def _join_values(values: list) -> str:
    """
    Convert a list into natural language.
    """

    values = [
        str(_convert_value(value))
        for value in values
    ]

    if not values:

        return ""

    if len(values) == 1:

        return values[0]

    if len(values) == 2:

        return (
            f"{values[0]} and "
            f"{values[1]}"
        )

    return (
        ", ".join(values[:-1])
        + ", and "
        + values[-1]
    )


def _format_number(value):
    """
    Format numeric values cleanly.

    Examples:

        686000      -> 686,000
        68600.0     -> 68,600
        10740       -> 10,740
        58000.5     -> 58,000.5
    """

    value = _convert_value(value)

    if isinstance(
        value,
        float
    ):

        if value.is_integer():

            return f"{int(value):,}"

        return f"{value:,.2f}".rstrip(
            "0"
        ).rstrip(".")

    if isinstance(
        value,
        int
    ):

        return f"{value:,}"

    return str(value)


def format_analysis_result(
    execution: dict
) -> str:
    """
    Convert exact Python analysis results into
    a deterministic user-facing answer.
    """

    if not execution:

        return (
            "No analysis result was produced."
        )

    if not execution.get(
        "success",
        False
    ):

        return execution.get(
            "message",
            "The analysis could not be completed."
        )

    operation = execution.get(
        "operation"
    )

    column = execution.get(
        "column"
    )

    group_by = execution.get(
        "group_by"
    )

    filters = execution.get(
        "filters",
        {}
    )

    result = execution.get(
        "result"
    )

    result = _convert_value(
        result
    )

    filter_phrase = (
        _format_filter_phrase(
            filters
        )
    )

    # ========================================================
    # TOTAL
    # ========================================================

    if operation == "total":

        column_name = column.lower()

        return (
            f"The total {column_name}"
            f"{filter_phrase} is "
            f"{_format_number(result)}."
        )

    # ========================================================
    # AVERAGE
    # ========================================================

    if operation == "average":

        column_name = column.lower()

        return (
            f"The average {column_name}"
            f"{filter_phrase} is "
            f"{_format_number(result)}."
        )

    # ========================================================
    # MEDIAN
    # ========================================================

    if operation == "median":

        column_name = column.lower()

        return (
            f"The median {column_name}"
            f"{filter_phrase} is "
            f"{_format_number(result)}."
        )

    # ========================================================
    # COUNT
    # ========================================================

    if operation == "count":

        return (
            f"There are "
            f"{_format_number(result)} records"
            f"{filter_phrase}."
        )

    # ========================================================
    # MINIMUM
    # ========================================================

    if operation == "minimum":

        return (
            f"The minimum "
            f"{column.lower()}"
            f"{filter_phrase} is "
            f"{_format_number(result)}."
        )

    # ========================================================
    # MAXIMUM
    # ========================================================

    if operation == "maximum":

        return (
            f"The maximum "
            f"{column.lower()}"
            f"{filter_phrase} is "
            f"{_format_number(result)}."
        )

    # ========================================================
    # HIGHEST
    # ========================================================

    if operation == "highest":

        if isinstance(
            result,
            dict
        ):

            group_value = _convert_value(
                result.get(group_by)
            )

            value = _convert_value(
                result.get(column)
            )

            return (
                f"{group_value} has the highest "
                f"{column.lower()}"
                f"{filter_phrase}, at "
                f"{_format_number(value)}."
            )

    # ========================================================
    # LOWEST
    # ========================================================

    if operation == "lowest":

        if isinstance(
            result,
            dict
        ):

            group_value = _convert_value(
                result.get(group_by)
            )

            value = _convert_value(
                result.get(column)
            )

            return (
                f"{group_value} has the lowest "
                f"{column.lower()}"
                f"{filter_phrase}, at "
                f"{_format_number(value)}."
            )

    # ========================================================
    # DISTINCT
    # ========================================================

    if operation == "distinct":

        if not isinstance(
            result,
            list
        ):

            result = [result]

        values = [
            _convert_value(value)
            for value in result
        ]

        value_text = _join_values(
            values
        )

        if not value_text:

            return (
                f"No {column.lower()} values "
                f"were found"
                f"{filter_phrase}."
            )

        # ----------------------------------------------------
        # Products
        # ----------------------------------------------------

        if column == "Product":

            return (
                f"The products sold"
                f"{filter_phrase} are "
                f"{value_text}."
            )

        # ----------------------------------------------------
        # Customers
        # ----------------------------------------------------

        if column == "Customer":

            return (
                f"The customers"
                f"{filter_phrase} are "
                f"{value_text}."
            )

        # ----------------------------------------------------
        # Categories
        # ----------------------------------------------------

        if column == "Category":

            return (
                f"The categories"
                f"{filter_phrase} are "
                f"{value_text}."
            )

        # ----------------------------------------------------
        # Regions
        # ----------------------------------------------------

        if column == "Region":

            return (
                f"The regions"
                f"{filter_phrase} are "
                f"{value_text}."
            )

        return (
            f"The distinct "
            f"{column.lower()} values"
            f"{filter_phrase} are "
            f"{value_text}."
        )

    # ========================================================
    # GROUP SUM
    # ========================================================

    if operation == "group_sum":

        if not isinstance(
            result,
            dict
        ):

            return str(result)

        lines = []

        for key, value in result.items():

            value = _convert_value(
                value
            )

            lines.append(
                f"{key}: "
                f"{_format_number(value)}"
            )

        return (
            f"Total {column.lower()} by "
            f"{group_by}:\n"
            + "\n".join(lines)
        )

    # ========================================================
    # GROUP AVERAGE
    # ========================================================

    if operation == "group_average":

        if not isinstance(
            result,
            dict
        ):

            return str(result)

        lines = []

        for key, value in result.items():

            value = _convert_value(
                value
            )

            lines.append(
                f"{key}: "
                f"{_format_number(value)}"
            )

        return (
            f"Average {column.lower()} by "
            f"{group_by}:\n"
            + "\n".join(lines)
        )

    # ========================================================
    # TOP N
    # ========================================================

    if operation == "top_n":

        if not isinstance(
            result,
            dict
        ):

            return str(result)

        n = execution.get(
            "n",
            len(result)
        )

        lines = []

        for key, value in result.items():

            value = _convert_value(
                value
            )

            lines.append(
                f"{key}: "
                f"{_format_number(value)}"
            )

        if not lines:

            return (
                f"No results found"
                f"{filter_phrase}."
            )

        return (
            f"Top {n} {group_by.lower()}s "
            f"by {column.lower()}"
            f"{filter_phrase}:\n"
            + "\n".join(lines)
        )

    # ========================================================
    # BOTTOM N
    # ========================================================

    if operation == "bottom_n":

        if not isinstance(
            result,
            dict
        ):

            return str(result)

        n = execution.get(
            "n",
            len(result)
        )

        lines = []

        for key, value in result.items():

            value = _convert_value(
                value
            )

            lines.append(
                f"{key}: "
                f"{_format_number(value)}"
            )

        if not lines:

            return (
                f"No results found"
                f"{filter_phrase}."
            )

        return (
            f"Bottom {n} "
            f"{group_by.lower()}s "
            f"by {column.lower()}"
            f"{filter_phrase}:\n"
            + "\n".join(lines)
        )

    # ========================================================
    # FALLBACK
    # ========================================================

    return (
        f"The result is: "
        f"{result}"
    )