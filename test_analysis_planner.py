from analysis.dataset_loader import load_dataset
from analysis.analysis_planner import create_analysis_plan


TABLE_NAME = "data_sales_test_data_ea718f80"


df = load_dataset(
    TABLE_NAME
)


# -----------------------------------------
# Build dataset information
# -----------------------------------------

columns = df.columns.tolist()

sample_values = {}

for column in df.columns:

    values = (
        df[column]
        .dropna()
        .astype(str)
        .unique()
        .tolist()
    )

    sample_values[column] = values


# -----------------------------------------
# Questions
# -----------------------------------------

questions = [

    "What is the total sales?",

    "What is the average profit?",

    "How many orders are there?",

    "Which product has the highest sales?",

    "Which product has the lowest sales?",

    "What are the sales by region?",

    "What is the average profit by region?",

    "What are the total sales in South?",

    "What is the average profit in South?",

    "What are the total sales for Electronics in South?",

    "What is the average profit for Electronics in South?",

    "What did we make from electronics in the south?"

]


# -----------------------------------------
# Test planner
# -----------------------------------------

for question in questions:

    print("\n" + "=" * 60)

    print(
        f"Question: {question}"
    )

    plan = create_analysis_plan(
        question=question,
        columns=columns,
        sample_values=sample_values
    )

    print("\nPlan:")

    print(plan)