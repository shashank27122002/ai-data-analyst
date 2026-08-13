from analysis.dataset_loader import load_dataset

from analysis.query_engine import (
    total,
    average,
    count,
    minimum,
    maximum,
    group_sum,
    group_average,
    highest_by,
    lowest_by
)


TABLE_NAME = "data_sales_test_data_ea718f80"


df = load_dataset(
    TABLE_NAME
)


print("\n========== QUERY ENGINE TEST ==========\n")


# -----------------------------------------
# Total
# -----------------------------------------

print(
    "Total Sales:",
    total(df, "Sales")
)


# -----------------------------------------
# Average
# -----------------------------------------

print(
    "Average Profit:",
    average(df, "Profit")
)


# -----------------------------------------
# Count
# -----------------------------------------

print(
    "Number of Orders:",
    count(df)
)


# -----------------------------------------
# Minimum
# -----------------------------------------

print(
    "Minimum Sales:",
    minimum(df, "Sales")
)


# -----------------------------------------
# Maximum
# -----------------------------------------

print(
    "Maximum Sales:",
    maximum(df, "Sales")
)


# -----------------------------------------
# Group Sum
# -----------------------------------------

print(
    "\nSales by Region:"
)

print(
    group_sum(
        df,
        "Region",
        "Sales"
    )
)


# -----------------------------------------
# Group Average
# -----------------------------------------

print(
    "\nAverage Profit by Region:"
)

print(
    group_average(
        df,
        "Region",
        "Profit"
    )
)


# -----------------------------------------
# Highest
# -----------------------------------------

print(
    "\nHighest Sales Product:"
)

print(
    highest_by(
        df,
        "Sales",
        "Product"
    )
)


# -----------------------------------------
# Lowest
# -----------------------------------------

print(
    "\nLowest Sales Product:"
)

print(
    lowest_by(
        df,
        "Sales",
        "Product"
    )
)