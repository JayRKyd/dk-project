## Club membership badges on cards (implementation guide)

### Goal
- Display tier-specific badges (FREE, PRO, PRO-PLUS, ULTRA) on `/clubs` cards using real membership state.

### Data model
- Preferred: a dedicated table `club_memberships` linking a `club_id` to an active membership (start/end, tier).
- Minimal fields:
  - `id uuid pk`
  - `club_id uuid references clubs(id)`
  - `tier text check (tier in ('FREE','PRO','PRO-PLUS','ULTRA')) default 'FREE'`
  - `starts_at timestamptz not null default now()`
  - `ends_at timestamptz` (nullable for ongoing)
  - `status text check (status in ('active','expired','canceled','pending')) default 'active'`
  - Index: `(club_id, status, ends_at)`

Example DDL:
```sql
create table if not exists public.club_memberships (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  tier text not null check (tier in ('FREE','PRO','PRO-PLUS','ULTRA')) default 'FREE',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  status text not null check (status in ('active','expired','canceled','pending')) default 'active'
);
create index if not exists club_memberships_active_idx on public.club_memberships(club_id, status, ends_at);
```

RLS (optional, minimal):
```sql
alter table public.club_memberships enable row level security;
-- clubs can read their own, admins read all
create policy club_memberships_select_own on public.club_memberships
  for select using (
    exists (select 1 from public.clubs c where c.id = club_id and c.user_id = auth.uid())
  );
create policy club_memberships_admin_all on public.club_memberships
  for all using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  ) with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );
```

### Service layer
- Add a helper to fetch the current tier for many clubs at once.

```ts
// src/services/clubMembershipService.ts
import { supabase } from '../lib/supabase';

export async function getActiveTiersForClubs(clubIds: string[]): Promise<Record<string, 'FREE'|'PRO'|'PRO-PLUS'|'ULTRA'>> {
  if (clubIds.length === 0) return {} as any;
  const { data } = await supabase
    .from('club_memberships')
    .select('club_id, tier, ends_at, status')
    .in('club_id', clubIds)
    .eq('status','active');
  const map: Record<string, any> = {};
  (data||[]).forEach(r => { map[r.club_id] = r.tier as any; });
  return map as any;
}
```

### UI integration (/clubs)
- In `src/pages/Clubs.tsx`, after fetching `clubs` and `profiles`, call `getActiveTiersForClubs(ids)` and set `membershipTier` per card.
- Keep fallback to `'FREE'` if no membership entry.

Snippet:
```ts
const ids = (data||[]).map((c:any)=>c.id);
const tiers = await getActiveTiersForClubs(ids);
const rows: Profile[] = (data||[]).map((c:any)=>({
  id: c.id,
  name: c.name,
  location: c.city || '',
  imageUrl: c.cover_photo_url || map.get(c.id)?.image_url || '',
  rating: Number(map.get(c.id)?.rating || 0),
  loves: Number(map.get(c.id)?.loves || 0),
  isVerified: true,
  isClub: true,
  description: c.description || '',
  membershipTier: (tiers[c.id] || 'FREE') as any
}));
```

### Badge styles
- Already handled by `ProfileCard` via `membershipTier` prop. Ensure it includes tiers: FREE, PRO, PRO-PLUS, ULTRA.

### Search/sort impact
- Keep tier-first sort using existing priority mapping. No changes required beyond supplying real tiers.

### Edge cases
- If multiple active rows exist (should not), pick the one with latest `starts_at`.
- If `status='pending'`, treat as current tier until payment confirmed (or map to FREE). Decide policy.
- Clubs with no membership row → FREE.

### Admin tooling (optional)
- Small admin UI to view/update a club’s membership (create row, cancel, set end date).

### Testing checklist
- Create a club with no membership → shows FREE badge.
- Insert active PRO and PRO-PLUS rows for clubs → badges reflect, sort order changes.
- Expire a membership (set `ends_at` in past or `status='expired'`) → card falls back to FREE.
- RLS: club owner can read own rows; admin sees all.

### Performance
- Batch fetch: `in('club_id', ids)` keeps requests minimal.
- Add index on `(club_id, status, ends_at)` for quick active lookups.

