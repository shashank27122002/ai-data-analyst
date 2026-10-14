
from functools import lru_cache
from fastembed import TextEmbedding

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIMENSION = 384


@lru_cache(maxsize=1)
def get_embedding_model():
    return TextEmbedding(model_name=MODEL_NAME)


def generate_embedding(text: str) -> list[float]:
    model = get_embedding_model()
    return list(next(model.embed([text])))


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    model = get_embedding_model()
    return [vector.tolist() for vector in model.embed(texts)]
