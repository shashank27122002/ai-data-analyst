import pandas as pd


def load_csv(file_path: str) -> pd.DataFrame:
    """
    Read a CSV file and return a Pandas DataFrame.
    """

    try:
        dataframe = pd.read_csv(file_path)

        return dataframe

    except Exception as error:
        raise ValueError(
            f"Failed to read CSV file: {error}"
        )