import pandas as pd


def load_excel(file_path: str) -> pd.DataFrame:
    """
    Read an Excel file and return a Pandas DataFrame.
    """

    try:
        dataframe = pd.read_excel(file_path)

        return dataframe

    except Exception as error:
        raise ValueError(
            f"Failed to read Excel file: {error}"
        )