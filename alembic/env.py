from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

from config import settings
from database.postgres import Base
from database.models import Dataset, User


# Alembic Config object
config = context.config


# Logging configuration
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# SQLAlchemy metadata
target_metadata = Base.metadata


# ---------------------------------------------------------
# Include only the users table during autogeneration
# ---------------------------------------------------------
def include_object(
    object,
    name,
    type_,
    reflected,
    compare_to
):
    """
    Prevent Alembic from detecting existing RAG/data tables
    as removed tables.

    We only want Alembic to manage the new 'users' table.
    """

    if type_ == "table" and reflected:
        return name == "users"

    return True


# ---------------------------------------------------------
# Offline migrations
# ---------------------------------------------------------
def run_migrations_offline() -> None:

    url = settings.DATABASE_URL

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={
            "paramstyle": "named"
        },
        include_object=include_object,
    )

    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------
# Online migrations
# ---------------------------------------------------------
def run_migrations_online() -> None:

    # Get database URL from .env / config.py
    config.set_main_option(
        "sqlalchemy.url",
        settings.DATABASE_URL.replace(
            "%",
            "%%"
        )
    )

    connectable = engine_from_config(
        config.get_section(
            config.config_ini_section,
            {}
        ),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_object=include_object,
        )

        with context.begin_transaction():
            context.run_migrations()


# ---------------------------------------------------------
# Run migration
# ---------------------------------------------------------
if context.is_offline_mode():

    run_migrations_offline()

else:

    run_migrations_online()