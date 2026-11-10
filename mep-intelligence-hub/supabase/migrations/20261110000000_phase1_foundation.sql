-- MEP Intelligence Hub — Phase 1 foundation schema
-- Tenancy (organizations / memberships), profiles, preferences,
-- cost control (budgets / usage_costs) and append-only audit log.
-- Row Level Security is enabled on every table. Clients never get direct
-- INSERT on organizations, usage_costs or audit_logs; those go through
-- SECURITY DEFINER functions or the backend service role.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(btrim(name)) between 2 and 120),
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text check (display_name is null or char_length(display_name) <= 120),
  created_at    timestamptz not null default now()
);

create table public.memberships (
  org_id      uuid not null references public.organizations (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        text not null check (role in ('owner', 'admin', 'engineer', 'viewer')),
  created_at  timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index memberships_user_idx on public.memberships (user_id);

create table public.user_preferences (
  user_id                  uuid primary key references auth.users (id) on delete cascade,
  locale                   text not null default 'ar' check (locale in ('ar', 'en')),
  timezone                 text not null default 'Africa/Cairo',
  quiet_hours_start        time,
  quiet_hours_end          time,
  notification_categories  text[] not null default array[
    'critical_opportunity', 'high_value_product', 'cost_saving',
    'energy_efficiency', 'market_change', 'standards_update', 'new_supplier'
  ],
  markets                  text[] not null default array['EG', 'GCC', 'GLOBAL'],
  updated_at               timestamptz not null default now()
);

create table public.budgets (
  org_id               uuid primary key references public.organizations (id) on delete cascade,
  monthly_limit_usd    numeric(10, 2) not null default 30.00 check (monthly_limit_usd >= 0),
  alert_threshold_pct  integer not null default 80 check (alert_threshold_pct between 1 and 100),
  hard_stop            boolean not null default true,
  updated_at           timestamptz not null default now(),
  updated_by           uuid references auth.users (id) on delete set null
);

create table public.usage_costs (
  id             bigint generated always as identity primary key,
  org_id         uuid references public.organizations (id) on delete cascade, -- null = shared pipeline cost
  user_id        uuid references auth.users (id) on delete set null,
  provider       text not null,
  model          text,
  task           text not null,
  tokens_in      integer not null default 0 check (tokens_in >= 0),
  tokens_out     integer not null default 0 check (tokens_out >= 0),
  cached_tokens  integer not null default 0 check (cached_tokens >= 0),
  usd            numeric(12, 6) not null default 0 check (usd >= 0),
  is_estimate    boolean not null default false,
  created_at     timestamptz not null default now()
);
create index usage_costs_org_created_idx on public.usage_costs (org_id, created_at desc);

create table public.audit_logs (
  id          bigint generated always as identity primary key,
  -- No foreign keys on purpose: the log is append-only and must keep
  -- historical IDs after an organization or user is deleted.
  org_id      uuid,
  actor_id    uuid,
  action      text not null,
  entity      text not null,
  entity_id   text,
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index audit_logs_org_created_idx on public.audit_logs (org_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER so policies don't recurse on memberships)
-- ---------------------------------------------------------------------------

create or replace function public.org_role(p_org uuid)
returns text
language sql stable security definer set search_path = public
as $$
  select role from public.memberships
  where org_id = p_org and user_id = auth.uid();
$$;

create or replace function public.is_org_member(p_org uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.org_role(p_org) is not null;
$$;

create or replace function public.is_org_admin(p_org uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(public.org_role(p_org) in ('owner', 'admin'), false);
$$;

create or replace function public.shares_org_with(p_user uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.memberships a
    join public.memberships b on a.org_id = b.org_id
    where a.user_id = auth.uid() and b.user_id = p_user
  );
$$;

-- Create an organization: caller becomes owner, a default budget is created,
-- and the action is audited. This is the only way clients create orgs.
create or replace function public.create_organization(p_name text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_org uuid;
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  insert into public.organizations (name, created_by)
  values (btrim(p_name), v_uid)
  returning id into v_org;

  insert into public.memberships (org_id, user_id, role) values (v_org, v_uid, 'owner');
  insert into public.budgets (org_id, updated_by) values (v_org, v_uid);
  insert into public.audit_logs (org_id, actor_id, action, entity, entity_id)
  values (v_org, v_uid, 'create', 'organization', v_org::text);

  return v_org;
end;
$$;

-- New auth user -> profile + preferences (Arabic by default).
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  insert into public.user_preferences (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- An organization must always keep at least one owner.
create or replace function public.protect_last_owner()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  -- Cascading delete of the whole organization is allowed.
  if not exists (select 1 from public.organizations where id = old.org_id) then
    return coalesce(new, old);
  end if;
  if old.role = 'owner'
     and (tg_op = 'DELETE' or new.role <> 'owner')
     and not exists (
       select 1 from public.memberships
       where org_id = old.org_id and role = 'owner' and user_id <> old.user_id
     )
  then
    raise exception 'organization must keep at least one owner' using errcode = '23514';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger memberships_protect_last_owner
  before update or delete on public.memberships
  for each row execute function public.protect_last_owner();

-- Audit log is append-only for everyone, including the service role.
create or replace function public.audit_logs_immutable()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs is append-only' using errcode = '42501';
end;
$$;

create trigger audit_logs_no_update
  before update or delete on public.audit_logs
  for each row execute function public.audit_logs_immutable();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.organizations    enable row level security;
alter table public.profiles         enable row level security;
alter table public.memberships      enable row level security;
alter table public.user_preferences enable row level security;
alter table public.budgets          enable row level security;
alter table public.usage_costs      enable row level security;
alter table public.audit_logs       enable row level security;

-- organizations
create policy org_select on public.organizations
  for select to authenticated using (public.is_org_member(id));
create policy org_update on public.organizations
  for update to authenticated using (public.is_org_admin(id)) with check (public.is_org_admin(id));

-- profiles
create policy profiles_select on public.profiles
  for select to authenticated using (id = auth.uid() or public.shares_org_with(id));
create policy profiles_update on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- memberships
create policy memberships_select on public.memberships
  for select to authenticated using (public.is_org_member(org_id));
create policy memberships_insert on public.memberships
  for insert to authenticated
  with check (public.is_org_admin(org_id) and (role <> 'owner' or public.org_role(org_id) = 'owner'));
create policy memberships_update on public.memberships
  for update to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id) and (role <> 'owner' or public.org_role(org_id) = 'owner'));
create policy memberships_delete on public.memberships
  for delete to authenticated using (public.is_org_admin(org_id) or user_id = auth.uid());

-- user_preferences
create policy prefs_all on public.user_preferences
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- budgets
create policy budgets_select on public.budgets
  for select to authenticated using (public.is_org_member(org_id));
create policy budgets_update on public.budgets
  for update to authenticated using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));

-- usage_costs: read-only for members; written by the backend service role only.
create policy usage_select on public.usage_costs
  for select to authenticated using (org_id is not null and public.is_org_member(org_id));

-- audit_logs: readable by org owners/admins; written by definer functions / service role.
create policy audit_select on public.audit_logs
  for select to authenticated using (org_id is not null and public.is_org_admin(org_id));

-- ---------------------------------------------------------------------------
-- Grants (explicit; anon gets nothing)
-- ---------------------------------------------------------------------------

revoke all on public.organizations, public.profiles, public.memberships,
  public.user_preferences, public.budgets, public.usage_costs, public.audit_logs
  from anon, authenticated;

grant select, update                 on public.organizations    to authenticated;
grant select, update                 on public.profiles         to authenticated;
grant select, insert, update, delete on public.memberships      to authenticated;
grant select, insert, update         on public.user_preferences to authenticated;
grant select, update                 on public.budgets          to authenticated;
grant select                         on public.usage_costs      to authenticated;
grant select                         on public.audit_logs       to authenticated;

revoke execute on function public.create_organization(text) from public, anon;
grant  execute on function public.create_organization(text) to authenticated;
grant  execute on function public.org_role(uuid), public.is_org_member(uuid),
  public.is_org_admin(uuid), public.shares_org_with(uuid) to authenticated;
