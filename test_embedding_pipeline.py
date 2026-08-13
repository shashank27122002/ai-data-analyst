from analysis.dataset_loader import load_dataset

from ingestion.embedding_pipeline import (
    store_dataset_embeddings
)


# ============================================================
# DATASET
# ============================================================

TABLE_NAME = "data_sales_test_data_ea718f80"

DATASET_ID = 2


# ============================================================
# LOAD DATASET
# ============================================================

df = load_dataset(
    TABLE_NAME
)


# ============================================================
# CREATE EMBEDDINGS
# ============================================================

count = store_dataset_embeddings(
    dataframe=df,
    dataset_id=DATASET_ID,
    dataset_name="sales_test_data",
    table_name=TABLE_NAME
)


print(
    f"\nEmbeddings stored: {count}"
)