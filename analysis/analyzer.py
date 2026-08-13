import pandas as pd


def analyze_dataframe(
    dataframe: pd.DataFrame
) -> dict:
    """
    Generate basic statistical analysis
    for a dataset.
    """

    analysis = {}

    # -----------------------------------------
    # Basic information
    # -----------------------------------------

    analysis["rows"] = len(dataframe)

    analysis["columns"] = len(
        dataframe.columns
    )

    analysis["column_names"] = [
        str(column)
        for column in dataframe.columns
    ]

    # -----------------------------------------
    # Data types
    # -----------------------------------------

    analysis["data_types"] = {
        str(column): str(dataframe[column].dtype)
        for column in dataframe.columns
    }

    # -----------------------------------------
    # Missing values
    # -----------------------------------------

    missing_values = (
        dataframe.isnull()
        .sum()
        .to_dict()
    )

    analysis["missing_values"] = {
        str(column): int(value)
        for column, value
        in missing_values.items()
    }

    # -----------------------------------------
    # Numeric analysis
    # -----------------------------------------

    numeric_columns = (
        dataframe
        .select_dtypes(
            include="number"
        )
        .columns
    )

    numeric_analysis = {}

    for column in numeric_columns:

        series = dataframe[column]

        numeric_analysis[str(column)] = {

            "sum": float(
                series.sum()
            ),

            "average": float(
                series.mean()
            ),

            "minimum": float(
                series.min()
            ),

            "maximum": float(
                series.max()
            ),

            "count": int(
                series.count()
            )
        }

    analysis["numeric_analysis"] = (
        numeric_analysis
    )

    # -----------------------------------------
    # Categorical analysis
    # -----------------------------------------

    categorical_columns = (
        dataframe
        .select_dtypes(
            include=["object", "category"]
        )
        .columns
    )

    categorical_analysis = {}

    for column in categorical_columns:

        value_counts = (
            dataframe[column]
            .value_counts()
            .head(10)
            .to_dict()
        )

        categorical_analysis[str(column)] = {
            str(key): int(value)
            for key, value
            in value_counts.items()
        }

    analysis["categorical_analysis"] = (
        categorical_analysis
    )

    return analysis