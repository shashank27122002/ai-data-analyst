import pandas as pd


def create_dataset_chunks(
    dataframe: pd.DataFrame,
    dataset_name: str,
    table_name: str
) -> list[dict]:
    """
    Convert a structured dataset into text chunks
    that can later be embedded for RAG.
    """

    chunks = []

    # ========================================================
    # 1. DATASET SUMMARY
    # ========================================================

    summary = (
        f"Dataset name: {dataset_name}. "
        f"Database table: {table_name}. "
        f"The dataset contains {len(dataframe)} rows "
        f"and {len(dataframe.columns)} columns. "
        f"Columns: "
        f"{', '.join(map(str, dataframe.columns))}."
    )

    chunks.append(
        {
            "type": "dataset_summary",
            "content": summary
        }
    )

    # ========================================================
    # 2. SCHEMA INFORMATION
    # ========================================================

    schema_parts = []

    for column in dataframe.columns:

        schema_parts.append(
            f"{column} has datatype "
            f"{dataframe[column].dtype}"
        )

    schema = (
        f"Schema for dataset {dataset_name}. "
        + ". ".join(schema_parts)
        + "."
    )

    chunks.append(
        {
            "type": "schema",
            "content": schema
        }
    )

    # ========================================================
    # 3. ROW-LEVEL CHUNKS
    # ========================================================

    for index, row in dataframe.iterrows():

        values = []

        for column in dataframe.columns:

            value = row[column]

            values.append(
                f"{column}: {value}"
            )

        content = (
            f"Record {index + 1} from "
            f"{dataset_name}. "
            + ", ".join(values)
        )

        chunks.append(
            {
                "type": "row",
                "content": content
            }
        )

    return chunks