import pandas as pd


# ============================================================
# TOTAL
# ============================================================

def total(
    dataframe: pd.DataFrame,
    column: str
):
    return dataframe[column].sum()


# ============================================================
# AVERAGE
# ============================================================

def average(
    dataframe: pd.DataFrame,
    column: str
):
    return dataframe[column].mean()


# ============================================================
# MEDIAN
# ============================================================

def median(
    dataframe: pd.DataFrame,
    column: str
):
    """
    Return the median value of a column.
    """

    return dataframe[column].median()


# ============================================================
# COUNT
# ============================================================

def count(
    dataframe: pd.DataFrame
):
    return len(dataframe)


# ============================================================
# MINIMUM
# ============================================================

def minimum(
    dataframe: pd.DataFrame,
    column: str
):
    return dataframe[column].min()


# ============================================================
# MAXIMUM
# ============================================================

def maximum(
    dataframe: pd.DataFrame,
    column: str
):
    return dataframe[column].max()


# ============================================================
# GROUP SUM
# ============================================================

def group_sum(
    dataframe: pd.DataFrame,
    group_column: str,
    value_column: str
):
    return (
        dataframe
        .groupby(group_column)[value_column]
        .sum()
        .sort_values(
            ascending=False
        )
    )


# ============================================================
# GROUP AVERAGE
# ============================================================

def group_average(
    dataframe: pd.DataFrame,
    group_column: str,
    value_column: str
):
    return (
        dataframe
        .groupby(group_column)[value_column]
        .mean()
        .sort_values(
            ascending=False
        )
    )


# ============================================================
# HIGHEST
# ============================================================

def highest_by(
    dataframe: pd.DataFrame,
    value_column: str,
    group_column: str
):
    """
    Return the row containing the highest value.
    """

    if dataframe.empty:

        return None

    index = dataframe[
        value_column
    ].idxmax()

    return {

        group_column:
            dataframe.loc[
                index,
                group_column
            ],

        value_column:
            dataframe.loc[
                index,
                value_column
            ]
    }


# ============================================================
# LOWEST
# ============================================================

def lowest_by(
    dataframe: pd.DataFrame,
    value_column: str,
    group_column: str
):
    """
    Return the row containing the lowest value.
    """

    if dataframe.empty:

        return None

    index = dataframe[
        value_column
    ].idxmin()

    return {

        group_column:
            dataframe.loc[
                index,
                group_column
            ],

        value_column:
            dataframe.loc[
                index,
                value_column
            ]
    }


# ============================================================
# DISTINCT VALUES
# ============================================================

def distinct(
    dataframe: pd.DataFrame,
    column: str
):
    """
    Return unique non-null values from a column.
    """

    return (
        dataframe[column]
        .dropna()
        .drop_duplicates()
        .tolist()
    )


# ============================================================
# TOP N
# ============================================================

def top_n(
    dataframe: pd.DataFrame,
    value_column: str,
    group_column: str,
    n: int = 5
):
    """
    Return the top N groups based on the
    sum of the value column.

    Example:

        Top 3 products by sales
    """

    if dataframe.empty:

        return {}

    if n < 1:

        raise ValueError(
            "N must be at least 1."
        )

    result = (
        dataframe
        .groupby(group_column)[value_column]
        .sum()
        .sort_values(
            ascending=False
        )
        .head(n)
    )

    return result.to_dict()


# ============================================================
# BOTTOM N
# ============================================================

def bottom_n(
    dataframe: pd.DataFrame,
    value_column: str,
    group_column: str,
    n: int = 5
):
    """
    Return the bottom N groups based on the
    sum of the value column.

    Example:

        Bottom 3 products by sales
    """

    if dataframe.empty:

        return {}

    if n < 1:

        raise ValueError(
            "N must be at least 1."
        )

    result = (
        dataframe
        .groupby(group_column)[value_column]
        .sum()
        .sort_values(
            ascending=True
        )
        .head(n)
    )

    return result.to_dict()


# ============================================================
# PERCENTAGE
# ============================================================

def percentage(
    dataframe: pd.DataFrame,
    column: str
):
    """
    Calculate each row's percentage contribution
    to the total of the selected column.

    Example:

        Percentage contribution of each sales record.
    """

    if dataframe.empty:

        return []

    total_value = (
        dataframe[column].sum()
    )

    if total_value == 0:

        return [
            0
            for _ in range(
                len(dataframe)
            )
        ]

    return (
        dataframe[column]
        .div(total_value)
        .mul(100)
        .tolist()
    )
    # ============================================================
# GROUP PERCENTAGE
# ============================================================

def group_percentage(
    dataframe: pd.DataFrame,
    group_column: str,
    value_column: str
):
    """
    Calculate each group's percentage contribution
    to the total value.
    """

    if dataframe.empty:
        return {}

    grouped = (
        dataframe
        .groupby(group_column)[value_column]
        .sum()
    )

    total_value = grouped.sum()

    if total_value == 0:
        return {
            str(key): 0
            for key in grouped.index
        }

    result = (
        grouped
        .div(total_value)
        .mul(100)
        .sort_values(
            ascending=False
        )
    )

    return result.to_dict()