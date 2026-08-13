from rag.retriever import retrieve_similar_chunks


query = "What are the sales in the South region?"


results = retrieve_similar_chunks(
    query=query,
    dataset_id=2,
    top_k=5
)


print("\n========== RETRIEVED CHUNKS ==========\n")


for row in results:

    print("ID:", row.id)
    print("Dataset ID:", row.dataset_id)
    print("Type:", row.chunk_type)
    print("Content:", row.content)
    print("Distance:", row.distance)

    print("--------------------------------------")