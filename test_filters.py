from analysis.dataset_loader import load_dataset
from analysis.filters import filter_dataframe


TABLE_NAME = "data_sales_test_data_ea718f80"


df = load_dataset(
    TABLE_NAME
)


print("\n========== FILTER TEST ==========\n")


# -----------------------------------------
# South region
# -----------------------------------------

south = filter_dataframe(
    df,
    "Region",
    "South"
)

print("South region:")
print(south)

print(
    "\nSouth rows:",
    len(south)
)


# -----------------------------------------
# Electronics category
# -----------------------------------------

electronics = filter_dataframe(
    df,
    "Category",
    "Electronics"
)

print("\nElectronics:")
print(electronics)

print(
    "\nElectronics rows:",
    len(electronics)
)


# -----------------------------------------
# ABC customer
# -----------------------------------------

abc = filter_dataframe(
    df,
    "Customer",
    "ABC Ltd"
)

print("\nABC Ltd:")
print(abc)

print(
    "\nABC Ltd rows:",
    len(abc)
)