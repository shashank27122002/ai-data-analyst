import pandas as pd


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Perform basic cleaning on the uploaded dataset.
    """

    # Create a copy so original dataframe is not modified
    df = df.copy()

    # Remove completely empty rows
    df.dropna(
        how="all",
        inplace=True
    )

    # Remove completely empty columns
    df.dropna(
        axis=1,
        how="all",
        inplace=True
    )

    # Remove duplicate rows
    df.drop_duplicates(
        inplace=True
    )

    # Remove extra spaces from column names
    df.columns = [
        str(column).strip()
        for column in df.columns
    ]

    # Remove extra spaces from text values
    for column in df.select_dtypes(
        include=["object"]
    ).columns:

        df[column] = df[column].apply(
            lambda value:
            value.strip()
            if isinstance(value, str)
            else value
        )

    # Reset index after cleaning
    df.reset_index(
        drop=True,
        inplace=True
    )

    return df