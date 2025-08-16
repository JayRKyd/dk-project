-- Add visibility flags for PRO/ULTRA settings
alter table public.profiles
  add column if not exists hide_listing_card boolean default false,
  add column if not exists hide_fan_posts boolean default false,
  add column if not exists hide_reviews boolean default false;

