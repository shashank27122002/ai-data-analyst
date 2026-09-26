"""add user_id to datasets

Revision ID: 6dd3085de5f0
Revises: 56225a72104a
Create Date: 2026-09-26 16:09:20.103446

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6dd3085de5f0"
down_revision: Union[str, Sequence[str], None] = "56225a72104a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "datasets",
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=True
        )
    )

    op.create_index(
        op.f("ix_datasets_user_id"),
        "datasets",
        ["user_id"],
        unique=False
    )

    op.create_foreign_key(
        "fk_datasets_user_id_users",
        "datasets",
        "users",
        ["user_id"],
        ["id"]
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        "fk_datasets_user_id_users",
        "datasets",
        type_="foreignkey"
    )

    op.drop_index(
        op.f("ix_datasets_user_id"),
        table_name="datasets"
    )

    op.drop_column(
        "datasets",
        "user_id"
    )