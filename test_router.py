from router.query_router import route_question


questions = [

    "What is the total sales?",

    "What is the average profit?",

    "Which product has the highest sales?",

    "How many orders are there?",

    "What columns are present in the dataset?",

    "What is the schema of the dataset?"

]


for question in questions:

    route = route_question(question)

    print(
        f"\nQuestion: {question}"
    )

    print(
        f"Route: {route}"
    )