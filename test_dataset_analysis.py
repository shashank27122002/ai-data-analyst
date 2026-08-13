from analysis.dataset_loader import load_dataset
from analysis.analyzer import analyze_dataframe


TABLE_NAME = "data_sales_test_data_ea718f80"


dataframe = load_dataset(
    TABLE_NAME
)


result = analyze_dataframe(
    dataframe
)


print("\n========== DATASET ANALYSIS ==========\n")

print("Rows:", result["rows"])

print("Columns:", result["columns"])

print(
    "Column Names:",
    result["column_names"]
)


print("\nNumeric Analysis:")

for column, values in result[
    "numeric_analysis"
].items():

    print(f"\n{column}:")

    for key, value in values.items():

        print(
            f"  {key}: {value}"
        )


print("\nCategorical Analysis:")

for column, values in result[
    "categorical_analysis"
].items():

    print(
        f"\n{column}: {values}"
    )