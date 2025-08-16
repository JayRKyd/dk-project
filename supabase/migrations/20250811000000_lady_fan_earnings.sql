-- Lady Fan Earnings RPC
-- Returns unlock transactions for a lady's fan posts with client profile info

create or replace function public.get_lady_fan_earnings(
  p_lady_id uuid,
  p_limit integer default 200
)
returns table (
  id uuid,
  client_id uuid,
  client_name text,
  client_image_url text,
  fan_post_id uuid,
  fan_post_title text,
  credits_spent integer,
  created_at timestamptz
)
security definer
set search_path = public
language sql
as $$
  select
    u.id,
    u.client_id,
    coalesce(p.name, 'Anonymous') as client_name,
    p.image_url as client_image_url,
    u.fan_post_id,
    fp.title as fan_post_title,
    u.credits_spent,
    u.created_at
  from fan_post_unlocks u
  join fan_posts fp on fp.id = u.fan_post_id
  left join profiles p on p.user_id = u.client_id
  where fp.lady_id = p_lady_id
  order by u.created_at desc
  limit p_limit;
$$;

grant execute on function public.get_lady_fan_earnings(uuid, integer) to authenticated;

