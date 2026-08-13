import pandas as pd

from sqlalchemy import text

from database.postgres import engine


def load_dataset(
    table_name: str
) -> pd.DataFrame:
    """
    Load a dataset table from PostgreSQL
    into a Pandas DataFrame.
    """

    # Basic identifier validation
    if not table_name.replace("_", "").isalnum():
        raise ValueError(
            "Invalid table name."
        )

    query = text(
        f'SELECT * FROM "{table_name}"'
    )

    with engine.connect() as connection:

        dataframe = pd.read_sql(
            query,
            connection
        )

    return dataframe