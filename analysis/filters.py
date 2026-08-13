import pandas as pd


def filter_dataframe(
    dataframe: pd.DataFrame,
    column: str,
    value: str
) -> pd.DataFrame:
    """
    Filter a dataframe using an exact,
    case-insensitive match.
    """

    if column not in dataframe.columns:
        raise ValueError(
            f"Column '{column}' does not exist."
        )

    filtered = dataframe[
        dataframe[column]
        .astype(str)
        .str.strip()
        .str.lower()
        == value.strip().lower()
    ]

    return filtered.copy()