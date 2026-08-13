from analysis.dataset_loader import load_dataset
from analysis.question_processor import (
    process_analysis_question
)


TABLE_NAME = "data_sales_test_data_ea718f80"


df = load_dataset(
    TABLE_NAME
)


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

    "How many orders are from North?",

    "What are the total sales for Electronics?",

    "What is ABC Ltd's total sales?",
    
    "Which product has the lowest sales?",
    "What are the sales of Electronics products in South?",
    "What are the total sales for Electronics in South?",
    "What is the average profit for Electronics in South?",
    "How many orders are from South for Electronics?",
]
for question in questions:

    print("\n" + "=" * 60)

    print(
        f"Question: {question}"
    )

    answer = process_analysis_question(
        question,
        df
    )

    print(
        f"\nAnswer:\n{answer}"
    )