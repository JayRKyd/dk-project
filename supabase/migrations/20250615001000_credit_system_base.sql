-- Credit System Base Tables
create table public.credit_packages (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    credits_amount integer not null,
    price decimal(10,2) not null,
    is_featured boolean default false,
    is_active boolean default true,
    created_at timestamp with time zone default now()
);

create table public.user_credits (
    user_id uuid references auth.users(id) primary key,
    balance integer not null default 0,
    total_purchased integer not null default 0,
    total_spent integer not null default 0,
    last_purchase_at timestamp with time zone,
    updated_at timestamp with time zone default now()
);

create table public.credit_transactions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    transaction_type text not null check (transaction_type in ('purchase', 'spend', 'refund', 'admin_adjustment')),
    amount integer not null,
    package_id uuid references public.credit_packages(id),
    payment_reference text, -- Will store external payment reference when payment integration is added
    status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
    metadata jsonb,
    created_at timestamp with time zone default now()
);

-- RLS Policies
alter table public.credit_packages enable row level security;
alter table public.user_credits enable row level security;
alter table public.credit_transactions enable row level security;

-- Credit Packages Policies
create policy "Credit packages are viewable by all authenticated users"
    on public.credit_packages for select
    to authenticated
    using (true);

create policy "Only admins can modify credit packages"
    on public.credit_packages for all
    to authenticated
    using (auth.jwt() ->> 'role' = 'admin');

-- User Credits Policies
create policy "Users can view their own credit balance"
    on public.user_credits for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Only system can modify user credits"
    on public.user_credits for all
    to authenticated
    using (auth.jwt() ->> 'role' = 'admin');

-- Credit Transactions Policies
create policy "Users can view their own transactions"
    on public.credit_transactions for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Only system can create transactions"
    on public.credit_transactions for insert
    to authenticated
    using (auth.jwt() ->> 'role' = 'admin');

create policy "Only system can modify transactions"
    on public.credit_transactions for update
    to authenticated
    using (auth.jwt() ->> 'role' = 'admin');

-- Functions
create or replace function public.get_user_credits(p_user_id uuid)
returns table (
    balance integer,
    total_purchased integer,
    total_spent integer,
    last_purchase_at timestamp with time zone
)
security definer
set search_path = public
language plpgsql
as $$
begin
    return query
    select uc.balance, uc.total_purchased, uc.total_spent, uc.last_purchase_at
    from public.user_credits uc
    where uc.user_id = p_user_id;
end;
$$;

-- Function to update user credits atomically
create or replace function public.update_user_credits(
    p_user_id uuid,
    p_amount integer,
    p_is_purchase boolean
)
returns void
security definer
set search_path = public
language plpgsql
as $$
begin
    insert into public.user_credits (
        user_id,
        balance,
        total_purchased,
        total_spent,
        last_purchase_at,
        updated_at
    )
    values (
        p_user_id,
        p_amount,
        case when p_is_purchase then p_amount else 0 end,
        case when not p_is_purchase then abs(p_amount) else 0 end,
        case when p_is_purchase then now() else null end,
        now()
    )
    on conflict (user_id) do update
    set
        balance = user_credits.balance + p_amount,
        total_purchased = user_credits.total_purchased + (case when p_is_purchase then p_amount else 0 end),
        total_spent = user_credits.total_spent + (case when not p_is_purchase then abs(p_amount) else 0 end),
        last_purchase_at = case when p_is_purchase then now() else user_credits.last_purchase_at end,
        updated_at = now();
end;
$$; 