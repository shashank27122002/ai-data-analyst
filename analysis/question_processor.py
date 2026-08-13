import re

import pandas as pd

from analysis.filters import filter_dataframe

from analysis.query_engine import (
    total,
    average,
    count,
    minimum,
    maximum,
    distinct,
    group_sum,
    group_average,
    highest_by,
    lowest_by
)


def _contains_value(
    question: str,
    value: str
) -> bool:
    """
    Check whether a dataset value appears as a
    complete word/phrase in the question.

    Prevents problems such as:
        west matching lowest
    """

    pattern = (
        r"(?<![a-zA-Z0-9])"
        + re.escape(value.lower())
        + r"(?![a-zA-Z0-9])"
    )

    return re.search(
        pattern,
        question.lower()
    ) is not None


def process_analysis_question(
    question: str,
    dataframe: pd.DataFrame
) -> str:
    """
    Convert a natural-language analytical question
    into an exact dataframe calculation.

    Supports:

    Filters:
        Region
        Category
        Customer
        Product

    Operations:
        Total
        Average
        Count
        Minimum
        Maximum
        Highest
        Lowest
        Distinct
        Group by
    """

    q = question.lower().strip()

    # ========================================================
    # Detect filters
    # ========================================================

    filtered_dataframe = dataframe

    applied_filters = []

    filter_columns = [
        "Region",
        "Category",
        "Customer",
        "Product"
    ]

    for column in filter_columns:

        if column not in dataframe.columns:
            continue

        values = (
            dataframe[column]
            .dropna()
            .astype(str)
            .unique()
        )

        # Longest values first
        values = sorted(
            values,
            key=lambda value: len(str(value)),
            reverse=True
        )

        for value in values:

            value_text = str(value).strip()

            if _contains_value(
                q,
                value_text
            ):

                filtered_dataframe = filter_dataframe(
                    filtered_dataframe,
                    column,
                    value_text
                )

                applied_filters.append(
                    f"{column} = {value_text}"
                )

                break

    filter_description = ""

    if applied_filters:

        filter_description = (
            " for "
            + " and ".join(applied_filters)
        )

    # ========================================================
    # Empty result protection
    # ========================================================

    if (
        applied_filters
        and filtered_dataframe.empty
    ):

        return (
            "No records found for "
            + " and ".join(applied_filters)
        )

    # ========================================================
    # DISTINCT / WHICH / WHAT VALUES
    # ========================================================

    # Customer questions
    if (
        (
            "which customer" in q
            or "which customers" in q
            or "what customer" in q
            or "what customers" in q
        )
    ):

        result = distinct(
            filtered_dataframe,
            "Customer"
        )

        if not result:

            return (
                "No customers found"
                f"{filter_description}."
            )

        return (
            "Customers"
            f"{filter_description}: "
            + ", ".join(
                map(str, result)
            )
        )

    # Product questions
    if (
        "which product" in q
        or "which products" in q
        or "what product" in q
        or "what products" in q
    ):

        result = distinct(
            filtered_dataframe,
            "Product"
        )

        if not result:

            return (
                "No products found"
                f"{filter_description}."
            )

        return (
            "Products"
            f"{filter_description}: "
            + ", ".join(
                map(str, result)
            )
        )

    # Category questions
    if (
        "which category" in q
        or "which categories" in q
        or "what category" in q
        or "what categories" in q
    ):

        result = distinct(
            filtered_dataframe,
            "Category"
        )

        if not result:

            return (
                "No categories found"
                f"{filter_description}."
            )

        return (
            "Categories"
            f"{filter_description}: "
            + ", ".join(
                map(str, result)
            )
        )

    # Region questions
    if (
        "which region" in q
        or "which regions" in q
        or "what region" in q
        or "what regions" in q
    ):

        result = distinct(
            filtered_dataframe,
            "Region"
        )

        if not result:

            return (
                "No regions found"
                f"{filter_description}."
            )

        return (
            "Regions"
            f"{filter_description}: "
            + ", ".join(
                map(str, result)
            )
        )

    # ========================================================
    # Average profit by region
    # ========================================================

    if (
        "average profit by region" in q
        or "average profit for each region" in q
        or "average profit per region" in q
    ):

        result = group_average(
            filtered_dataframe,
            "Region",
            "Profit"
        )

        lines = [
            f"{region}: {value}"
            for region, value in result.items()
        ]

        return (
            "Average profit by region:\n"
            + "\n".join(lines)
        )

    # ========================================================
    # Sales by region
    # ========================================================

    if (
        "sales by region" in q
        or "sales for each region" in q
        or "sales per region" in q
    ):

        result = group_sum(
            filtered_dataframe,
            "Region",
            "Sales"
        )

        lines = [
            f"{region}: {value}"
            for region, value in result.items()
        ]

        return (
            "Sales by region:\n"
            + "\n".join(lines)
        )

    # ========================================================
    # Highest sales product
    # ========================================================

    if (
        "highest sales" in q
        or "highest selling product" in q
        or "product has the highest" in q
        or "product with the highest sales" in q
    ):

        result = highest_by(
            filtered_dataframe,
            "Sales",
            "Product"
        )

        return (
            f"Highest sales product: "
            f"{result['Product']} "
            f"with sales of "
            f"{result['Sales']}"
            f"{filter_description}"
        )

    # ========================================================
    # Lowest sales product
    # ========================================================

    if (
        "lowest sales" in q
        or "lowest selling product" in q
        or "product has the lowest" in q
        or "product with the lowest sales" in q
    ):

        result = lowest_by(
            filtered_dataframe,
            "Sales",
            "Product"
        )

        return (
            f"Lowest sales product: "
            f"{result['Product']} "
            f"with sales of "
            f"{result['Sales']}"
            f"{filter_description}"
        )

    # ========================================================
    # Total sales
    # ========================================================

    if "total sales" in q:

        result = total(
            filtered_dataframe,
            "Sales"
        )

        return (
            f"Total sales"
            f"{filter_description}: "
            f"{result}"
        )

    # ========================================================
    # Sales
    # ========================================================

    if (
        "sales" in q
        and not (
            "sales by region" in q
            or "sales for each region" in q
            or "sales per region" in q
        )
    ):

        result = total(
            filtered_dataframe,
            "Sales"
        )

        return (
            f"Sales"
            f"{filter_description}: "
            f"{result}"
        )

    # ========================================================
    # Average sales
    # ========================================================

    if (
        "average sales" in q
        or "mean sales" in q
    ):

        result = average(
            filtered_dataframe,
            "Sales"
        )

        return (
            f"Average sales"
            f"{filter_description}: "
            f"{result}"
        )

    # ========================================================
    # Total profit
    # ========================================================

    if "total profit" in q:

        result = total(
            filtered_dataframe,
            "Profit"
        )

        return (
            f"Total profit"
            f"{filter_description}: "
            f"{result}"
        )

    # ========================================================
    # Average profit
    # ========================================================

    if (
        "average profit" in q
        or "mean profit" in q
    ):

        result = average(
            filtered_dataframe,
            "Profit"
        )

        return (
            f"Average profit"
            f"{filter_description}: "
            f"{result}"
        )

    # ========================================================
    # Number of orders
    # ========================================================

    if (
        "how many orders" in q
        or "number of orders" in q
        or "count of orders" in q
    ):

        result = count(
            filtered_dataframe
        )

        return (
            f"Number of orders"
            f"{filter_description}: "
            f"{result}"
        )

    # ========================================================
    # Maximum sales
    # ========================================================

    if (
        "maximum sales" in q
        or "max sales" in q
    ):

        result = maximum(
            filtered_dataframe,
            "Sales"
        )

        return (
            f"Maximum sales"
            f"{filter_description}: "
            f"{result}"
        )

    # ========================================================
    # Minimum sales
    # ========================================================

    if (
        "minimum sales" in q
        or "min sales" in q
    ):

        result = minimum(
            filtered_dataframe,
            "Sales"
        )

        return (
            f"Minimum sales"
            f"{filter_description}: "
            f"{result}"
        )

    # ========================================================
    # Unsupported question
    # ========================================================

    return (
        "I could not identify the exact analytical "
        "operation required for this question."
    )