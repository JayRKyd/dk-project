-- Payouts flow: earnings summary + request and admin actions (provider-agnostic)
-- Safe to run repeatedly (idempotent guards where feasible)

-- Add helper columns if missing
do $$ begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'payouts' and column_name = 'credits_amount'
  ) then
    alter table public.payouts add column credits_amount integer default 0;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'payouts' and column_name = 'payment_id'
  ) then
    alter table public.payouts add column payment_id text;
  end if;
end $$;

-- Create or replace earnings summary RPC (credits-based)
create or replace function public.get_earnings_summary(p_user_id uuid)
returns table (
  credits_from_gifts integer,
  credits_from_fanposts integer,
  credits_payouts integer,
  credits_available integer,
  last_payout_at timestamptz
) language sql stable as $$
  with gifts_sum as (
    select coalesce(sum(credits_cost), 0) as s
    from public.gifts
    where recipient_id = p_user_id
      and (status is null or status = 'collected')
  ),
  fanposts_sum as (
    select coalesce(sum(fpu.credits_spent), 0) as s
    from public.fan_post_unlocks fpu
    join public.fan_posts fp on fp.id = fpu.fan_post_id
    where fp.author_id = p_user_id
  ),
  payouts_sum as (
    select coalesce(sum(credits_amount), 0) as s,
           max(processed_at) as last_at
    from public.payouts
    where user_id = p_user_id
      and status in ('processing','completed')
  )
  select 
    (select s from gifts_sum)::int as credits_from_gifts,
    (select s from fanposts_sum)::int as credits_from_fanposts,
    (select s from payouts_sum)::int as credits_payouts,
    ((select s from gifts_sum) + (select s from fanposts_sum) - (select s from payouts_sum))::int as credits_available,
    (select last_at from payouts_sum) as last_payout_at;
$$;

-- Helper: check admin
create or replace function public.is_current_user_admin()
returns boolean language sql stable as $$
  select exists(
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'admin'
  );
$$;

-- Request payout (in credits); converts to fiat using platform_settings.rate if present
create or replace function public.request_payout(
  p_user_id uuid,
  p_amount_credits integer,
  p_method text,
  p_details jsonb default '{}'::jsonb
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_summary record;
  v_rate numeric := 0.20; -- fallback rate
  v_amount_eur numeric;
  v_payout_id uuid;
begin
  -- require self or admin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if auth.uid() <> p_user_id and not public.is_current_user_admin() then
    raise exception 'forbidden';
  end if;

  -- load conversion rate if set
  begin
    select (settings->>'credit_eur_rate')::numeric into v_rate
    from public.platform_settings
    where key = 'credits';
  exception when others then
    -- keep fallback
  end;

  -- compute available credits
  select * into v_summary from public.get_earnings_summary(p_user_id);
  if v_summary.credits_available is null or v_summary.credits_available < p_amount_credits then
    raise exception 'insufficient available credits for payout';
  end if;
  if p_amount_credits <= 0 then
    raise exception 'invalid amount';
  end if;

  v_amount_eur := p_amount_credits * v_rate;

  insert into public.payouts (user_id, amount, status, payout_method, payout_details, credits_amount, created_at)
  values (p_user_id, v_amount_eur, 'pending', coalesce(p_method,'manual'), coalesce(p_details,'{}'::jsonb), p_amount_credits, now())
  returning id into v_payout_id;

  return v_payout_id;
end $$;

-- Admin approvals and completion
create or replace function public.admin_approve_payout(p_payout_id uuid)
returns boolean language plpgsql security definer as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'forbidden';
  end if;
  update public.payouts set status='processing' where id = p_payout_id;
  return true;
end $$;

create or replace function public.admin_mark_payout_completed(p_payout_id uuid, p_payment_id text default null)
returns boolean language plpgsql security definer as $$
declare
  v_user uuid;
  v_amount numeric;
begin
  if not public.is_current_user_admin() then
    raise exception 'forbidden';
  end if;
  update public.payouts
  set status='completed', processed_at = now(), payment_id = p_payment_id
  where id = p_payout_id
  returning user_id, amount into v_user, v_amount;

  -- record transaction for admin financials
  insert into public.transactions (user_id, transaction_type, amount, credits_amount, status, payment_provider, payment_id, created_at)
  values (v_user, 'payout', v_amount, 0, 'completed', 'manual', p_payment_id, now());
  return true;
end $$;

create or replace function public.admin_mark_payout_failed(p_payout_id uuid, p_reason text)
returns boolean language plpgsql security definer as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'forbidden';
  end if;
  update public.payouts
  set status='failed', payout_details = coalesce(payout_details,'{}'::jsonb) || jsonb_build_object('failure_reason', p_reason)
  where id = p_payout_id;
  return true;
end $$;

-- RLS: allow users to read/insert own payouts; only admin updates
alter table public.payouts enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='payouts' and policyname='payouts_select_own_or_admin') then
    create policy payouts_select_own_or_admin on public.payouts
      for select
      using (user_id = auth.uid() or public.is_current_user_admin());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='payouts' and policyname='payouts_insert_own') then
    create policy payouts_insert_own on public.payouts
      for insert
      with check (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='payouts' and policyname='payouts_update_admin_only') then
    create policy payouts_update_admin_only on public.payouts
      for update
      using (public.is_current_user_admin())
      with check (public.is_current_user_admin());
  end if;
end $$;

