from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ..auth import CurrentUser, get_current_user
from ..cost import UsageSummary, usage_summary
from ..db import service_tx, user_tx

router = APIRouter(prefix="/api/v1/orgs", tags=["organizations"])


def _not_found() -> HTTPException:
    # Same response for "does not exist" and "not a member" — no existence leak.
    return HTTPException(status_code=404, detail={"code": "organization_not_found"})


@router.get("")
def list_orgs(user: CurrentUser = Depends(get_current_user)) -> list[dict]:
    with user_tx(user) as conn:
        return conn.execute(
            """select o.id, o.name, o.created_at, public.org_role(o.id) as role
               from public.organizations o order by o.created_at"""
        ).fetchall()


class OrgCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)


@router.post("", status_code=201)
def create_org(body: OrgCreate, user: CurrentUser = Depends(get_current_user)) -> dict:
    with user_tx(user) as conn:
        org_id = conn.execute(
            "select public.create_organization(%s) as id", (body.name,)
        ).fetchone()["id"]
        return conn.execute(
            "select id, name, created_at, 'owner' as role from public.organizations where id = %s",
            (org_id,),
        ).fetchone()


@router.get("/{org_id}/usage/summary", response_model=UsageSummary)
def get_usage(org_id: UUID, user: CurrentUser = Depends(get_current_user)) -> UsageSummary:
    with user_tx(user) as conn:
        summary = usage_summary(conn, str(org_id))
    if summary is None:
        raise _not_found()
    return summary


@router.get("/{org_id}/budget")
def get_budget(org_id: UUID, user: CurrentUser = Depends(get_current_user)) -> dict:
    with user_tx(user) as conn:
        row = conn.execute(
            """select org_id, monthly_limit_usd, alert_threshold_pct, hard_stop, updated_at
               from public.budgets where org_id = %s""",
            (str(org_id),),
        ).fetchone()
    if row is None:
        raise _not_found()
    return row


class BudgetUpdate(BaseModel):
    monthly_limit_usd: Decimal = Field(ge=0, le=100000, max_digits=10, decimal_places=2)
    alert_threshold_pct: int = Field(default=80, ge=1, le=100)
    hard_stop: bool = True


@router.put("/{org_id}/budget")
def put_budget(
    org_id: UUID, body: BudgetUpdate, user: CurrentUser = Depends(get_current_user)
) -> dict:
    with user_tx(user) as conn:
        role = conn.execute("select public.org_role(%s) as r", (str(org_id),)).fetchone()["r"]
        if role is None:
            raise _not_found()
        if role not in ("owner", "admin"):
            raise HTTPException(status_code=403, detail={"code": "admin_required"})
        row = conn.execute(
            """update public.budgets
               set monthly_limit_usd = %s, alert_threshold_pct = %s, hard_stop = %s,
                   updated_at = now(), updated_by = %s
               where org_id = %s
               returning org_id, monthly_limit_usd, alert_threshold_pct, hard_stop, updated_at""",
            (body.monthly_limit_usd, body.alert_threshold_pct, body.hard_stop, user.id, str(org_id)),
        ).fetchone()
    # Audit with service privileges (clients cannot write audit_logs directly).
    with service_tx() as conn:
        conn.execute(
            """insert into public.audit_logs (org_id, actor_id, action, entity, entity_id, details)
               values (%s, %s, 'update', 'budget', %s, %s::jsonb)""",
            (
                str(org_id),
                user.id,
                str(org_id),
                body.model_dump_json(),
            ),
        )
    return row
