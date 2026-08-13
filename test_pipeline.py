from pipeline import run_pipeline


questions = [

    "What is the total sales?",

    "What is the average profit?",

    "What columns are present in the dataset?"

]


for question in questions:

    print("\n" + "=" * 60)

    answer = run_pipeline(
        question
    )

    print(
        "\n========== ANSWER ==========\n"
    )

    print(answer)