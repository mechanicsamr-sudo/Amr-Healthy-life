-- RLS isolation tests. Run against a database prepared with
-- supabase_shim.sql + all migrations. Fails (raises) on the first violation.
-- Everything runs inside a transaction that is rolled back.

begin;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.local'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.local');

-- helper: act as a user
create or replace function pg_temp.act_as(p uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p, 'role', 'authenticated')::text, true);
  set local role authenticated;
end $$;

do $$
declare
  org_a uuid;
  org_b uuid;
  n int;
begin
  -- user A creates org A
  perform pg_temp.act_as('00000000-0000-0000-0000-00000000000a');
  org_a := public.create_organization('Org A');
  reset role;

  -- user B creates org B
  perform pg_temp.act_as('00000000-0000-0000-0000-00000000000b');
  org_b := public.create_organization('Org B');

  -- B sees only org B
  select count(*) into n from public.organizations;
  if n <> 1 then raise exception 'B should see 1 org, saw %', n; end if;
  select count(*) into n from public.organizations where id = org_a;
  if n <> 0 then raise exception 'B can see org A'; end if;
  select count(*) into n from public.budgets where org_id = org_a;
  if n <> 0 then raise exception 'B can see org A budget'; end if;
  select count(*) into n from public.memberships where org_id = org_a;
  if n <> 0 then raise exception 'B can see org A memberships'; end if;

  -- B cannot add itself to org A
  begin
    insert into public.memberships (org_id, user_id, role)
    values (org_a, '00000000-0000-0000-0000-00000000000b', 'owner');
    raise exception 'B joined org A';
  exception when insufficient_privilege then null;
  end;

  -- B cannot update org A budget (0 rows affected, not an error)
  update public.budgets set monthly_limit_usd = 9999 where org_id = org_a;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'B updated org A budget'; end if;

  -- clients cannot write usage_costs or audit_logs directly
  begin
    insert into public.usage_costs (org_id, provider, task) values (org_b, 'x', 'x');
    raise exception 'client inserted usage_costs';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.audit_logs (org_id, action, entity) values (org_b, 'x', 'x');
    raise exception 'client inserted audit_logs';
  exception when insufficient_privilege then null;
  end;

  -- B cannot remove its own last owner membership
  begin
    delete from public.memberships where org_id = org_b;
    raise exception 'last owner removed';
  exception when check_violation then null;
  end;

  -- preferences default to Arabic and are private
  select count(*) into n from public.user_preferences;
  if n <> 1 then raise exception 'B should see only own preferences, saw %', n; end if;
  select count(*) into n from public.user_preferences where locale = 'ar';
  if n <> 1 then raise exception 'default locale is not ar'; end if;

  reset role;

  -- audit log is append-only even for the superuser/service role
  begin
    update public.audit_logs set action = 'tampered';
    raise exception 'audit log updated';
  exception when insufficient_privilege then null;
  end;

  -- anonymous role sees nothing
  perform set_config('request.jwt.claims', '', true);
  set local role anon;
  begin
    select count(*) into n from public.organizations;
    raise exception 'anon could read organizations';
  exception when insufficient_privilege then null;
  end;
  reset role;

  -- deleting a whole organization cascades despite the last-owner guard
  delete from public.organizations where id = org_a;
  select count(*) into n from public.memberships where org_id = org_a;
  if n <> 0 then raise exception 'cascade delete failed'; end if;

  raise notice 'RLS ISOLATION TESTS PASSED';
end
$$;

rollback;
