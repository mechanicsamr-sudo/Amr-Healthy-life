"""Test fixtures.

API tests run against a real PostgreSQL server with the Supabase shim and the
real migrations applied, so RLS is exercised exactly as in production.

Set TEST_DATABASE_ADMIN_URL to a superuser connection (database `postgres`),
e.g. postgresql://postgres@127.0.0.1:54329/postgres. Tests that need the DB are
skipped when it is not set. Tokens are minted locally with a test-only HS256
secret; no real Supabase project or credentials are used.
"""

import os
import time
import uuid
from pathlib import Path

import jwt
import psycopg
import pytest

ROOT = Path(__file__).resolve().parents[2]
SHIM = ROOT / "supabase" / "tests" / "supabase_shim.sql"
MIGRATIONS = sorted((ROOT / "supabase" / "migrations").glob("*.sql"))
TEST_JWT_SECRET = "test-only-secret-not-used-anywhere-else-0123456789"
ADMIN_URL = os.environ.get("TEST_DATABASE_ADMIN_URL")


@pytest.fixture(scope="session")
def database_url():
    if not ADMIN_URL:
        pytest.skip("TEST_DATABASE_ADMIN_URL not set")
    name = f"mep_test_{uuid.uuid4().hex[:8]}"
    with psycopg.connect(ADMIN_URL, autocommit=True) as admin:
        admin.execute(f'create database "{name}"')
    url = ADMIN_URL.rsplit("/", 1)[0] + f"/{name}"
    with psycopg.connect(url, autocommit=True) as conn:
        conn.execute(SHIM.read_text())
        for m in MIGRATIONS:
            conn.execute(m.read_text())
    yield url
    from app.db import close_pool

    close_pool()
    with psycopg.connect(ADMIN_URL, autocommit=True) as admin:
        admin.execute(f'drop database "{name}" with (force)')


@pytest.fixture(scope="session")
def client(database_url):
    os.environ["DATABASE_URL"] = database_url
    os.environ["SUPABASE_JWT_SECRET"] = TEST_JWT_SECRET
    os.environ["SUPABASE_URL"] = ""
    from app.config import get_settings

    get_settings.cache_clear()
    from fastapi.testclient import TestClient

    from app.main import create_app

    with TestClient(create_app()) as c:
        yield c


@pytest.fixture
def make_user(database_url):
    """Create an auth user and return Authorization headers for them."""

    def _make(email: str | None = None) -> tuple[str, dict]:
        uid = str(uuid.uuid4())
        email = email or f"{uid[:8]}@test.local"
        with psycopg.connect(database_url, autocommit=True) as conn:
            conn.execute("insert into auth.users (id, email) values (%s, %s)", (uid, email))
        return uid, {"Authorization": f"Bearer {mint_token(uid, email)}"}

    return _make


def mint_token(uid: str, email: str, **overrides) -> str:
    now = int(time.time())
    claims = {
        "sub": uid,
        "email": email,
        "role": "authenticated",
        "aud": "authenticated",
        "iat": now,
        "exp": now + 3600,
        **overrides,
    }
    return jwt.encode(claims, TEST_JWT_SECRET, algorithm="HS256")
