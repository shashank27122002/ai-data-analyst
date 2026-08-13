from rag.embeddings import generate_embedding
from rag.vector_store import store_embedding


# Test data
content = "South region has Laptop sales of 50000."

# Generate 384-dimensional embedding
embedding = generate_embedding(content)

print("Embedding dimensions:", len(embedding))

# Store in PostgreSQL + pgvector
store_embedding(
    dataset_id=1,
    chunk_type="test",
    content=content,
    embedding=embedding
)

print("Embedding stored successfully!")