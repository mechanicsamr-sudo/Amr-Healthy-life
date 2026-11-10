from datetime import time
from typing import Literal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from ..auth import CurrentUser, get_current_user
from ..db import user_tx

router = APIRouter(prefix="/api/v1/me", tags=["me"])

NotificationCategory = Literal[
    "critical_opportunity",
    "high_value_product",
    "cost_saving",
    "energy_efficiency",
    "market_change",
    "standards_update",
    "new_supplier",
]
Market = Literal["EG", "GCC", "GLOBAL"]


@router.get("")
def get_me(user: CurrentUser = Depends(get_current_user)) -> dict:
    with user_tx(user) as conn:
        profile = conn.execute(
            "select id, display_name, created_at from public.profiles where id = %s", (user.id,)
        ).fetchone()
        prefs = conn.execute(
            """select locale, timezone, quiet_hours_start, quiet_hours_end,
                      notification_categories, markets
               from public.user_preferences where user_id = %s""",
            (user.id,),
        ).fetchone()
        orgs = conn.execute(
            """select o.id, o.name, m.role
               from public.memberships m join public.organizations o on o.id = m.org_id
               where m.user_id = %s order by o.created_at""",
            (user.id,),
        ).fetchall()
    return {
        "id": user.id,
        "email": user.email,
        "profile": profile,
        "preferences": prefs,
        "organizations": orgs,
    }


class PreferencesUpdate(BaseModel):
    locale: Literal["ar", "en"] | None = None
    timezone: str | None = Field(default=None, max_length=64)
    quiet_hours_start: time | None = None
    quiet_hours_end: time | None = None
    notification_categories: list[NotificationCategory] | None = Field(default=None, max_length=7)
    markets: list[Market] | None = Field(default=None, min_length=1, max_length=3)

    @field_validator("timezone")
    @classmethod
    def _valid_tz(cls, v: str | None) -> str | None:
        if v is None:
            return v
        try:
            ZoneInfo(v)
        except (ZoneInfoNotFoundError, ValueError) as exc:
            raise ValueError("unknown timezone") from exc
        return v


@router.patch("/preferences")
def update_preferences(
    body: PreferencesUpdate, user: CurrentUser = Depends(get_current_user)
) -> dict:
    changes = body.model_dump(exclude_unset=True)
    for key in ("notification_categories", "markets"):
        if key in changes and changes[key] is not None:
            changes[key] = sorted(set(changes[key]))
    if not changes:
        raise HTTPException(status_code=422, detail={"code": "no_changes"})
    allowed = set(PreferencesUpdate.model_fields)
    cols = [c for c in changes if c in allowed]
    assignments = ", ".join(f"{c} = %({c})s" for c in cols)
    with user_tx(user) as conn:
        row = conn.execute(
            f"""update public.user_preferences set {assignments}, updated_at = now()
                where user_id = %(uid)s
                returning locale, timezone, quiet_hours_start, quiet_hours_end,
                          notification_categories, markets""",
            {**changes, "uid": user.id},
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail={"code": "preferences_not_found"})
    return row
