from sqlalchemy import text
from database.postgres import engine


def store_embedding(
    dataset_id: int,
    chunk_type: str,
    content: str,
    embedding: list[float]
):
    """
    Store one chunk and its embedding in PostgreSQL + pgvector.
    """

    embedding_string = "[" + ",".join(map(str, embedding)) + "]"

    query = text("""
        INSERT INTO dataset_embeddings
        (
            dataset_id,
            chunk_type,
            content,
            embedding
        )
        VALUES
        (
            :dataset_id,
            :chunk_type,
            :content,
            CAST(:embedding AS vector)
        )
    """)

    with engine.begin() as connection:
        connection.execute(
            query,
            {
                "dataset_id": dataset_id,
                "chunk_type": chunk_type,
                "content": content,
                "embedding": embedding_string,
            }
        )


def store_embeddings(dataset_id: int, chunks: list):
    """
    Store multiple chunks and embeddings.
    
    Expected chunk format:
    {
        "type": "...",
        "content": "...",
        "embedding": [...]
    }
    """

    for chunk in chunks:
        store_embedding(
            dataset_id=dataset_id,
            chunk_type=chunk["type"],
            content=chunk["content"],
            embedding=chunk["embedding"],
        )