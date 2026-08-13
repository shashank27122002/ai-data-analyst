import pandas as pd

from rag.chunker import create_dataset_chunks
from rag.embeddings import generate_embedding


# -----------------------------------------
# Test data
# -----------------------------------------

data = {
    "Product": [
        "Laptop",
        "Mobile",
        "Tablet"
    ],
    "Region": [
        "South",
        "North",
        "South"
    ],
    "Sales": [
        50000,
        30000,
        25000
    ]
}

df = pd.DataFrame(data)


# -----------------------------------------
# Test chunker
# -----------------------------------------

chunks = create_dataset_chunks(
    dataframe=df,
    dataset_name="test_dataset",
    table_name="data_test"
)

print("\n========== CHUNKS ==========\n")

print(
    "Total chunks:",
    len(chunks)
)

for chunk in chunks:

    print(
        f"\nType: {chunk['type']}"
    )

    print(
        f"Content: {chunk['content']}"
    )


# -----------------------------------------
# Test embedding
# -----------------------------------------

text = chunks[0]["content"]

embedding = generate_embedding(
    text
)

print("\n========== EMBEDDING ==========\n")

print(
    "Embedding generated successfully!"
)

print(
    "Dimensions:",
    len(embedding)
)

print(
    "First 10 values:",
    embedding[:10]
)