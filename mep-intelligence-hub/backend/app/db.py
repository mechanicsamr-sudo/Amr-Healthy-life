"""Database access.

User-facing queries run inside `user_tx`, which switches the transaction to the
Postgres `authenticated` role and sets the JWT claims. Row Level Security is
therefore the enforcement layer for tenant isolation — the API cannot read
another organization's rows even if a query forgets a WHERE clause.

`service_tx` runs with the connection's own (service) privileges and must only
be used for system writes such as usage_costs and audit_logs.
"""

import json
from collections.abc import Iterator
from contextlib import contextmanager

from fastapi import HTTPException, status
from psycopg import Connection
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from .auth import CurrentUser
from .config import get_settings

_pool: ConnectionPool | None = None


def get_pool() -> ConnectionPool:
    global _pool
    if _pool is None:
        settings = get_settings()
        if not settings.database_url:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"code": "database_not_configured"},
            )
        _pool = ConnectionPool(
            settings.database_url,
            min_size=0,
            max_size=settings.db_pool_max,
            kwargs={"row_factory": dict_row, "prepare_threshold": None},
            open=True,
        )
    return _pool


def close_pool() -> None:
    global _pool
    if _pool is not None:
        _pool.close()
        _pool = None


@contextmanager
def user_tx(user: CurrentUser) -> Iterator[Connection]:
    with get_pool().connection() as conn:
        with conn.transaction():
            conn.execute(
                "select set_config('request.jwt.claims', %s, true)",
                (json.dumps(user.claims),),
            )
            conn.execute("set local role authenticated")
            yield conn


@contextmanager
def service_tx() -> Iterator[Connection]:
    with get_pool().connection() as conn:
        with conn.transaction():
            yield conn
