# MEP Intelligence Hub — Phase 1 (Foundation)

An engineering intelligence platform for MEP (HVAC, plumbing, fire protection, electrical).
**Interface language: Arabic only, RTL.** All UI strings live in `mobile/src/i18n/ar.ts`,
so English can be added later without changing screens.

> Recommendation-only system. The platform searches, analyzes, compares, calculates,
> recommends and drafts. It never approves materials or submittals, sends RFQs,
> commits to purchases or issues instructions.

## Phase 1 status

| Item | Status | How it was verified |
|---|---|---|
| Database schema: organizations, memberships, profiles, preferences, budgets, usage_costs, audit_logs | Done | Migration applied on PostgreSQL 16 |
| Row Level Security and tenant isolation | Done | `supabase/tests/rls_isolation_test.sql` (cross-org read/write, anon access, append-only audit log, last-owner guard) |
| FastAPI backend: auth (Supabase JWT), `/me`, preferences, organizations, budget, usage summary | Done | 30 pytest tests against real Postgres with RLS active |
| Governance guard (no approve/send/purchase capability) | Done | Static source scan test |
| Android app: Arabic RTL, email OTP login, Home, Feed, Library, Settings and cost control | Done (code) | `tsc` clean, Android Hermes bundle builds, RTL rendering checked in a web preview (`docs/screenshots/login-ar.png`) |
| CI (GitHub Actions) | Done | `.github/workflows/mep-hub-ci.yml` |
| **Login against a real Supabase project** | **Not tested** | Needs your Supabase credentials |
| **APK on a real Android device** | **Not tested** | Needs an EAS build or Android SDK, plus a device |

The Feed, Library and dashboard sections show **empty states**. No demo or fake data is
displayed. Source collection starts in Phase 2.

## Structure

```
mep-intelligence-hub/
  supabase/migrations/   SQL migrations (apply with Supabase CLI)
  supabase/tests/        Local test shim + RLS isolation tests (never apply the shim to Supabase)
  backend/               FastAPI modular monolith (Python 3.12+)
  mobile/                Expo SDK 58 / React Native 0.88 / TypeScript (Android first)
  docs/screenshots/      UI previews
```

## Setup

### 1. Supabase
1. Create a project at supabase.com. Region: closest to Egypt/GCC (e.g. Frankfurt).
2. Authentication → Providers → enable **Email**. In Authentication → Email Templates → "Magic Link",
   include `{{ .Token }}` so users receive a **6-digit code** (the app uses OTP codes, not links).
3. Apply the migration:
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```

### 2. Backend
```bash
cd backend
python -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env      # fill DATABASE_URL and SUPABASE_URL
uvicorn app.main:app --reload
```
JWTs are verified with the project's signing keys (JWKS). Set `SUPABASE_JWT_SECRET` only if
the project still uses the legacy shared secret.

### 3. Mobile (Android)
```bash
cd mobile
npm ci
cp .env.example .env      # Supabase URL, publishable/anon key, backend URL
npx expo start            # development
npx eas-cli build -p android --profile preview   # installable APK (requires an Expo account)
```
The app ships only **public** values. The Claude API key and the Supabase service-role key
must never be placed in `mobile/.env`.

## Tests
```bash
# Database + API (needs a local PostgreSQL 15+ superuser connection)
cd backend
TEST_DATABASE_ADMIN_URL=postgresql://postgres@127.0.0.1:5432/postgres pytest -q

# SQL RLS tests only
psql -d <empty_db> -f supabase/tests/supabase_shim.sql \
  -f supabase/migrations/20261110000000_phase1_foundation.sql \
  -f supabase/tests/rls_isolation_test.sql

# Mobile
cd mobile && npx tsc --noEmit
```

## Security notes
- Tenant isolation is enforced by Postgres RLS. API queries run as the `authenticated` role with
  the caller's JWT claims, so a missing `WHERE` clause cannot leak another organization's data.
- Clients cannot create organizations directly (`create_organization()` RPC only). They also
  cannot write `usage_costs` or `audit_logs`.
- `audit_logs` is append-only, even for the service role.
- Unauthorized access to another organization returns `404`, not `403`, so the API does not
  reveal whether that organization exists.

## Credentials needed from the owner
| Service | Needed for |
|---|---|
| Supabase project (URL, publishable key, DB connection string) | Auth, database |
| Hosting account (Fly.io / Render / Railway / VPS) | Backend |
| Expo account | Android builds and push notifications (Phase 4) |
| Firebase project | FCM push (Phase 4) |
| Anthropic API key, with a spend limit set in the Console | AI analysis (Phase 3) |

## Next: Phase 2
Source registry, RSS and YouTube-RSS collectors, deduplication, keyword pre-filter, and a
`pg_cron` scheduler.
