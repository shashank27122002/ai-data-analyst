from analysis.dataset_loader import load_dataset
from analysis.analysis_service import analyze_question


TABLE_NAME = "data_sales_test_data_ea718f80"


df = load_dataset(
    TABLE_NAME
)


questions = [

    "What is the total sales?",

    "What is the average profit?",

    "Which product has the highest sales?",

    "What are the sales by region?",

    "What is the average profit in South?",

    "What are the total sales for Electronics in South?",

    "What did we make from electronics in the south?"

]


for question in questions:

    print("\n")
    print("=" * 60)

    print(
        f"Question: {question}"
    )

    result = analyze_question(
        question=question,
        dataframe=df
    )

    print("\nPlan:")
    print(
        result["plan"]
    )

    print("\nExecution:")
    print(
        result["execution"]
    )

    print("\nFormatted Result:")
    print(
        result["formatted_result"]
    )