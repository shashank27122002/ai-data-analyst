from database.postgres import Base, engine
from database.models import Dataset


def create_tables():
    Base.metadata.create_all(
        bind=engine
    )

    print(
        "Database tables created successfully!"
    )


if __name__ == "__main__":
    create_tables()