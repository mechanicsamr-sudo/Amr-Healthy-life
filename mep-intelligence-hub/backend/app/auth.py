"""Supabase JWT verification.

The backend never issues tokens; it only verifies tokens issued by Supabase Auth.
Two modes:
  * SUPABASE_JWT_SECRET set  -> HS256 with the legacy shared secret.
  * otherwise                -> asymmetric keys from the project's JWKS endpoint.
"""

from dataclasses import dataclass
from functools import lru_cache
from typing import Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import Settings, get_settings

_bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class CurrentUser:
    id: str
    email: str | None
    claims: dict[str, Any]


@lru_cache
def _jwks_client(url: str) -> jwt.PyJWKClient:
    return jwt.PyJWKClient(url, cache_keys=True, lifespan=3600)


def _unauthorized(code: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"code": code},
        headers={"WWW-Authenticate": "Bearer"},
    )


def verify_token(token: str, settings: Settings) -> dict[str, Any]:
    options = {"require": ["exp", "sub", "aud"]}
    try:
        if settings.supabase_jwt_secret:
            return jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                audience=settings.jwt_audience,
                options=options,
            )
        if not settings.supabase_url:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"code": "auth_not_configured"},
            )
        jwks_url = settings.supabase_url.rstrip("/") + "/auth/v1/.well-known/jwks.json"
        key = _jwks_client(jwks_url).get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            key.key,
            algorithms=["ES256", "RS256"],
            audience=settings.jwt_audience,
            options=options,
        )
    except jwt.ExpiredSignatureError as exc:
        raise _unauthorized("token_expired") from exc
    except jwt.PyJWTError as exc:
        raise _unauthorized("invalid_token") from exc


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    settings: Settings = Depends(get_settings),
) -> CurrentUser:
    if creds is None or creds.scheme.lower() != "bearer":
        raise _unauthorized("missing_token")
    claims = verify_token(creds.credentials, settings)
    if claims.get("role") != "authenticated":
        raise _unauthorized("invalid_role")
    return CurrentUser(id=str(claims["sub"]), email=claims.get("email"), claims=claims)
