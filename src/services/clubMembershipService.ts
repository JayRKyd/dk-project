import { supabase } from '../lib/supabase';

export type ClubTier = 'FREE' | 'PRO' | 'PRO-PLUS' | 'ULTRA';

/**
 * Batch fetch active membership tiers for a set of clubs.
 * Returns a map of club_id -> tier. Clubs without an active row are omitted.
 */
export async function getActiveTiersForClubs(clubIds: string[]): Promise<Record<string, ClubTier>> {
	if (!clubIds || clubIds.length === 0) return {} as Record<string, ClubTier>;

	// Active means status = 'active' and ends_at is null or in the future
	const nowIso = new Date().toISOString();
	const { data, error } = await supabase
		.from('club_memberships')
		.select('club_id, tier, status, ends_at')
		.in('club_id', clubIds)
		.eq('status', 'active');

	if (error) {
		console.warn('getActiveTiersForClubs error:', error);
		return {} as Record<string, ClubTier>;
	}

	const map: Record<string, ClubTier> = {} as Record<string, ClubTier>;
	(data || []).forEach((row: any) => {
		const isExpired = row.ends_at && new Date(row.ends_at).toISOString() < nowIso;
		if (!isExpired) {
			map[row.club_id] = row.tier as ClubTier;
		}
	});

	return map;
}

