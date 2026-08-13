from sqlalchemy import text

from database.postgres import engine

from ingestion.chunker import create_dataset_chunks
from rag.embeddings import generate_embedding


def store_dataset_embeddings(
    dataframe,
    dataset_id: int,
    dataset_name: str,
    table_name: str
) -> int:
    """
    Create text chunks for a dataset, generate embeddings,
    and store them in PostgreSQL using pgvector.

    Returns the number of embeddings stored.
    """

    # --------------------------------------------------------
    # 1. Create chunks
    # --------------------------------------------------------

    chunks = create_dataset_chunks(
        dataframe=dataframe,
        dataset_name=dataset_name,
        table_name=table_name
    )

    if not chunks:
        return 0

    # --------------------------------------------------------
    # 2. Store embeddings
    # --------------------------------------------------------

    inserted_count = 0

    with engine.begin() as connection:

        for chunk in chunks:

            # ----------------------------------------------
            # Generate embedding
            # ----------------------------------------------

            embedding = generate_embedding(
                chunk["content"]
            )

            # ----------------------------------------------
            # Convert embedding to pgvector format
            # ----------------------------------------------

            embedding_string = (
                "["
                + ",".join(
                    map(str, embedding)
                )
                + "]"
            )

            # ----------------------------------------------
            # Insert embedding
            # ----------------------------------------------

            sql = text(
                """
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
                """
            )

            connection.execute(
                sql,
                {
                    "dataset_id": dataset_id,
                    "chunk_type": chunk["type"],
                    "content": chunk["content"],
                    "embedding": embedding_string
                }
            )

            inserted_count += 1

    return inserted_count