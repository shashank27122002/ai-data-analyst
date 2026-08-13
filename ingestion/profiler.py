import pandas as pd


def profile_dataframe(df: pd.DataFrame) -> dict:
    """
    Generate basic profiling information
    for a Pandas DataFrame.
    """

    rows, columns = df.shape

    missing_values = (
        df.isnull()
        .sum()
        .to_dict()
    )

    missing_percentage = (
        df.isnull()
        .mean()
        .mul(100)
        .round(2)
        .to_dict()
    )

    data_types = {
        column: str(dtype)
        for column, dtype in df.dtypes.items()
    }

    unique_values = {
        column: int(df[column].nunique())
        for column in df.columns
    }

    numeric_columns = (
        df.select_dtypes(
            include="number"
        )
        .columns
        .tolist()
    )

    categorical_columns = (
        df.select_dtypes(
            include=["object", "category"]
        )
        .columns
        .tolist()
    )

    return {
        "rows": rows,
        "columns": columns,
        "column_names": df.columns.tolist(),
        "data_types": data_types,
        "missing_values": missing_values,
        "missing_percentage": missing_percentage,
        "unique_values": unique_values,
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns
    }