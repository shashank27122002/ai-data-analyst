from sqlalchemy import text

from database.postgres import engine
from rag.embeddings import generate_embedding


def retrieve_similar_chunks(
    query: str,
    dataset_id: int,
    top_k: int = 5
):
    """
    Retrieve the most relevant chunks from PostgreSQL
    using pgvector cosine similarity.
    """

    # 1. Convert user question into embedding
    query_embedding = generate_embedding(query)

    # 2. Convert Python list to pgvector format
    embedding_string = "[" + ",".join(
        map(str, query_embedding)
    ) + "]"

    # 3. Similarity search
    sql = text("""
        SELECT
            id,
            dataset_id,
            chunk_type,
            content,
            embedding <=> CAST(:embedding AS vector) AS distance
        FROM dataset_embeddings
        WHERE dataset_id = :dataset_id
        ORDER BY embedding <=> CAST(:embedding AS vector)
        LIMIT :top_k
    """)

    # 4. Execute query
    with engine.connect() as connection:

        result = connection.execute(
            sql,
            {
                "embedding": embedding_string,
                "dataset_id": dataset_id,
                "top_k": top_k
            }
        )

        rows = result.fetchall()

    return rows