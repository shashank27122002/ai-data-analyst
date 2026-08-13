Excel / CSV / SQL / PostgreSQL
               │
               ▼
        File Upload API
               │
               ▼
        File Validation
               │
               ▼
        Data Ingestion
               │
               ▼
      Convert to DataFrame
               │
               ▼
        Data Cleaning
               │
               ▼
        Data Profiling
               │
               ▼
      Generate Metadata
               │
      ┌────────┴────────┐
      ▼                 ▼
Store in         Chunk Dataset
PostgreSQL             │
                        ▼
               Generate Embeddings
                        │
                        ▼
                Store in pgvector
                        │
                        ▼
              Dataset Ready for AI