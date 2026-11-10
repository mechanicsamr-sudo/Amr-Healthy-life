import time
import uuid

import psycopg

from .conftest import mint_token


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "database": True}


def test_auth_required(client):
    assert client.get("/api/v1/me").status_code == 401
    r = client.get("/api/v1/me", headers={"Authorization": "Bearer not-a-jwt"})
    assert r.status_code == 401
    assert r.json()["detail"]["code"] == "invalid_token"


def test_expired_and_wrong_audience_rejected(client):
    uid = str(uuid.uuid4())
    expired = mint_token(uid, "x@test.local", exp=int(time.time()) - 10)
    r = client.get("/api/v1/me", headers={"Authorization": f"Bearer {expired}"})
    assert r.json()["detail"]["code"] == "token_expired"
    wrong_aud = mint_token(uid, "x@test.local", aud="something-else")
    assert client.get("/api/v1/me", headers={"Authorization": f"Bearer {wrong_aud}"}).status_code == 401
    anon = mint_token(uid, "x@test.local", role="anon")
    assert client.get("/api/v1/me", headers={"Authorization": f"Bearer {anon}"}).status_code == 401


def test_me_defaults_to_arabic(client, make_user):
    uid, h = make_user()
    r = client.get("/api/v1/me", headers=h)
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == uid
    assert body["preferences"]["locale"] == "ar"
    assert body["preferences"]["timezone"] == "Africa/Cairo"
    assert body["organizations"] == []


def test_update_preferences_validation(client, make_user):
    _, h = make_user()
    r = client.patch("/api/v1/me/preferences", headers=h, json={"timezone": "Asia/Riyadh", "markets": ["EG", "GCC", "EG"]})
    assert r.status_code == 200
    assert r.json()["timezone"] == "Asia/Riyadh"
    assert r.json()["markets"] == ["EG", "GCC"]
    assert client.patch("/api/v1/me/preferences", headers=h, json={"timezone": "Mars/Base"}).status_code == 422
    assert client.patch("/api/v1/me/preferences", headers=h, json={"markets": ["MOON"]}).status_code == 422
    assert client.patch("/api/v1/me/preferences", headers=h, json={}).status_code == 422


def test_org_create_and_isolation(client, make_user):
    _, ha = make_user()
    _, hb = make_user()
    r = client.post("/api/v1/orgs", headers=ha, json={"name": "شركة أ للمقاولات"})
    assert r.status_code == 201
    org_a = r.json()["id"]
    assert r.json()["role"] == "owner"

    client.post("/api/v1/orgs", headers=hb, json={"name": "Org B"})

    # A sees only A; B sees only B
    assert [o["id"] for o in client.get("/api/v1/orgs", headers=ha).json()] == [org_a]
    assert org_a not in [o["id"] for o in client.get("/api/v1/orgs", headers=hb).json()]

    # B cannot read or change A's budget or usage — 404, not 403 (no existence leak)
    assert client.get(f"/api/v1/orgs/{org_a}/budget", headers=hb).status_code == 404
    assert client.get(f"/api/v1/orgs/{org_a}/usage/summary", headers=hb).status_code == 404
    r = client.put(f"/api/v1/orgs/{org_a}/budget", headers=hb, json={"monthly_limit_usd": "999"})
    assert r.status_code == 404
    assert client.get(f"/api/v1/orgs/{org_a}/budget", headers=ha).json()["monthly_limit_usd"] == "30.00"


def test_budget_and_usage_summary(client, make_user, database_url):
    uid, h = make_user()
    org = client.post("/api/v1/orgs", headers=h, json={"name": "Cost Org"}).json()["id"]

    s = client.get(f"/api/v1/orgs/{org}/usage/summary", headers=h).json()
    assert s["actual_usd"] == "0" and s["status"] == "ok" and s["by_task"] == []

    r = client.put(f"/api/v1/orgs/{org}/budget", headers=h,
                   json={"monthly_limit_usd": "10.00", "alert_threshold_pct": 80, "hard_stop": True})
    assert r.status_code == 200 and r.json()["monthly_limit_usd"] == "10.00"

    # Simulate gateway-recorded usage (service role write).
    with psycopg.connect(database_url, autocommit=True) as conn:
        conn.execute(
            """insert into public.usage_costs (org_id, user_id, provider, model, task, tokens_in, tokens_out, usd)
               values (%s, %s, 'anthropic', 'claude-haiku-5-5', 'triage', 1000, 200, 8.5)""",
            (org, uid),
        )
        audit = conn.execute(
            "select count(*) from public.audit_logs where org_id = %s and entity = 'budget'", (org,)
        ).fetchone()[0]
    assert audit == 1

    s = client.get(f"/api/v1/orgs/{org}/usage/summary", headers=h).json()
    assert s["status"] == "alert"
    assert s["used_pct"] == 85.0
    assert s["by_task"][0]["task"] == "triage"

    bad = client.put(f"/api/v1/orgs/{org}/budget", headers=h, json={"monthly_limit_usd": "-1"})
    assert bad.status_code == 422


def test_viewer_cannot_change_budget(client, make_user, database_url):
    owner_id, ho = make_user()
    viewer_id, hv = make_user()
    org = client.post("/api/v1/orgs", headers=ho, json={"name": "Roles Org"}).json()["id"]
    with psycopg.connect(database_url, autocommit=True) as conn:
        conn.execute("insert into public.memberships (org_id, user_id, role) values (%s, %s, 'viewer')", (org, viewer_id))
    assert client.get(f"/api/v1/orgs/{org}/budget", headers=hv).status_code == 200
    r = client.put(f"/api/v1/orgs/{org}/budget", headers=hv, json={"monthly_limit_usd": "1"})
    assert r.status_code == 403
    assert r.json()["detail"]["code"] == "admin_required"
