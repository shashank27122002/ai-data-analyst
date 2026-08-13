import pandas as pd

from analysis.analyzer import analyze_dataframe


data = {
    "Product": [
        "Laptop",
        "Mobile",
        "Laptop",
        "Tablet"
    ],
    "Region": [
        "South",
        "North",
        "South",
        "West"
    ],
    "Sales": [
        120000,
        150000,
        125000,
        75000
    ],
    "Profit": [
        18000,
        22000,
        19500,
        10000
    ]
}


df = pd.DataFrame(data)


result = analyze_dataframe(df)


print("\n========== ANALYSIS ==========\n")

print("Rows:")
print(result["rows"])

print("\nColumns:")
print(result["columns"])

print("\nColumn Names:")
print(result["column_names"])

print("\nNumeric Analysis:")

for column, values in result[
    "numeric_analysis"
].items():

    print(
        f"\n{column}:"
    )

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