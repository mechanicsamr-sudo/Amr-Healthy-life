"""Recommendation-only governance.

The platform may search, analyze, compare, calculate, recommend, draft and
report. It may NOT approve materials or submittals, modify approved project
specifications, send RFQs, commit to purchases, issue construction
instructions, or make binding engineering decisions.

This is enforced structurally: no endpoint, job or integration that performs a
forbidden action exists in the codebase. `tests/test_governance.py` scans the
source tree to keep it that way. Any future code path that touches a
forbidden action must call `assert_permitted` and will fail.
"""

from fastapi import HTTPException, status

PERMITTED_ACTIONS = frozenset(
    {"search", "analyze", "compare", "calculate", "recommend", "draft", "report"}
)

FORBIDDEN_ACTIONS = frozenset(
    {
        "approve_material",
        "approve_submittal",
        "modify_approved_specification",
        "send_rfq",
        "commit_purchase",
        "issue_construction_instruction",
        "binding_engineering_decision",
    }
)

DISCLAIMER_AR = (
    "هذه توصية فقط. القرار الهندسي والاعتماد النهائي مسؤولية المهندس المختص."
)


def assert_permitted(action: str) -> None:
    if action in FORBIDDEN_ACTIONS or action not in PERMITTED_ACTIONS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "action_not_permitted", "action": action},
        )
