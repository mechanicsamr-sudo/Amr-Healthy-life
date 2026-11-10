"""Recommendation-only governance tests (no database needed)."""

import re
from decimal import Decimal
from pathlib import Path

import pytest
from fastapi import HTTPException

from app.cost import classify
from app.governance import FORBIDDEN_ACTIONS, assert_permitted

APP_DIR = Path(__file__).resolve().parents[1] / "app"


@pytest.mark.parametrize("action", sorted(FORBIDDEN_ACTIONS) + ["unknown_action"])
def test_forbidden_actions_blocked(action):
    with pytest.raises(HTTPException) as exc:
        assert_permitted(action)
    assert exc.value.status_code == 403


@pytest.mark.parametrize("action", ["search", "analyze", "compare", "calculate", "recommend", "draft", "report"])
def test_permitted_actions(action):
    assert_permitted(action)


def test_no_outbound_send_or_approve_capability():
    """The codebase must contain no email/messaging clients and no approve/send/purchase routes."""
    banned_imports = re.compile(r"^\s*(import|from)\s+(smtplib|email\.mime|twilio|sendgrid|mailgun)\b", re.M)
    banned_routes = re.compile(r"@router\.\w+\(\s*['\"][^'\"]*(approve|send|purchase|order|instruct)", re.I)
    for path in APP_DIR.rglob("*.py"):
        text = path.read_text(encoding="utf-8")
        assert not banned_imports.search(text), f"outbound messaging import in {path}"
        assert not banned_routes.search(text), f"forbidden route in {path}"


@pytest.mark.parametrize(
    ("spent", "limit", "expected"),
    [("0", "30", "ok"), ("23.99", "30", "ok"), ("24", "30", "alert"), ("30", "30", "limit_reached"),
     ("0", "0", "limit_reached"), ("1", "0", "limit_reached")],
)
def test_budget_classification(spent, limit, expected):
    assert classify(Decimal(spent), Decimal(limit), 80)[1] == expected
