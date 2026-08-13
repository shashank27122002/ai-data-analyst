from rag.retriever import retrieve_similar_chunks
from rag.generator import generate_answer


question = "What are the sales for the South region?"


# -----------------------------------------
# 1. Retrieve relevant chunks
# -----------------------------------------

results = retrieve_similar_chunks(
    query=question,
    dataset_id=2,
    top_k=5
)


# -----------------------------------------
# 2. Build context
# -----------------------------------------

context_parts = []

for row in results:

    context_parts.append(
        f"Type: {row.chunk_type}\n"
        f"Content: {row.content}"
    )


context = "\n\n".join(context_parts)


# -----------------------------------------
# 3. Generate answer
# -----------------------------------------

answer = generate_answer(
    question=question,
    context=context
)


print("\n========== RAG ANSWER ==========\n")

print(answer)