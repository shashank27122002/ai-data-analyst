from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from api.upload import router as upload_router
from api.datasets import router as datasets_router
from api.query import router as query_router

from config import settings
from database.postgres import engine


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description=(
        "AI Data Analyst using "
        "RAG, LLM and PostgreSQL"
    )
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(
    upload_router
)

app.include_router(
    datasets_router
)

app.include_router(
    query_router
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message":
            "AI Data Analyst API is running"
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status":
            "healthy"
    }


# ============================================================
# DATABASE HEALTH
# ============================================================

@app.get("/db-health")
def database_health():

    try:

        with engine.connect() as connection:

            connection.execute(
                text("SELECT 1")
            )

        return {
            "database":
                "connected",

            "status":
                "healthy"
        }

    except Exception as error:

        return {

            "database":
                "disconnected",

            "status":
                "unhealthy",

            "error":
                str(error)
        }