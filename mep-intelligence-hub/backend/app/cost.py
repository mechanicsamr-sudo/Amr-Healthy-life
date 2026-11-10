"""Monthly AI/API spend tracking against the organization budget.

All figures come from the usage_costs table (written by the AI gateway in
Phase 3). Nothing here is estimated or invented: with no usage rows, spend is 0.
"""

from datetime import UTC, datetime
from decimal import Decimal
from typing import Literal

from psycopg import Connection
from pydantic import BaseModel

BudgetStatus = Literal["ok", "alert", "limit_reached"]


class UsageSummary(BaseModel):
    org_id: str
    period_start: datetime
    actual_usd: Decimal
    estimated_usd: Decimal
    monthly_limit_usd: Decimal
    alert_threshold_pct: int
    hard_stop: bool
    used_pct: float
    status: BudgetStatus
    by_task: list[dict]


def month_start(now: datetime | None = None) -> datetime:
    now = now or datetime.now(UTC)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def classify(spent: Decimal, limit: Decimal, alert_pct: int) -> tuple[float, BudgetStatus]:
    if limit <= 0:
        return (100.0 if spent > 0 else 0.0), "limit_reached"
    pct = float(spent / limit * 100)
    if pct >= 100:
        return pct, "limit_reached"
    if pct >= alert_pct:
        return pct, "alert"
    return pct, "ok"


def usage_summary(conn: Connection, org_id: str) -> UsageSummary | None:
    budget = conn.execute(
        "select monthly_limit_usd, alert_threshold_pct, hard_stop from public.budgets where org_id = %s",
        (org_id,),
    ).fetchone()
    if budget is None:
        return None  # not a member (RLS) or no budget row

    start = month_start()
    totals = conn.execute(
        """
        select
          coalesce(sum(usd) filter (where not is_estimate), 0) as actual,
          coalesce(sum(usd) filter (where is_estimate), 0)     as estimated
        from public.usage_costs
        where org_id = %s and created_at >= %s
        """,
        (org_id, start),
    ).fetchone()
    by_task = conn.execute(
        """
        select task, model, count(*) as calls, sum(tokens_in) as tokens_in,
               sum(tokens_out) as tokens_out, sum(usd) as usd
        from public.usage_costs
        where org_id = %s and created_at >= %s
        group by task, model
        order by usd desc
        """,
        (org_id, start),
    ).fetchall()

    spent = Decimal(totals["actual"]) + Decimal(totals["estimated"])
    pct, state = classify(spent, Decimal(budget["monthly_limit_usd"]), budget["alert_threshold_pct"])
    return UsageSummary(
        org_id=org_id,
        period_start=start,
        actual_usd=totals["actual"],
        estimated_usd=totals["estimated"],
        monthly_limit_usd=budget["monthly_limit_usd"],
        alert_threshold_pct=budget["alert_threshold_pct"],
        hard_stop=budget["hard_stop"],
        used_pct=round(pct, 2),
        status=state,
        by_task=[{k: (float(v) if isinstance(v, Decimal) else v) for k, v in r.items()} for r in by_task],
    )
