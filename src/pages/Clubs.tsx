import React from 'react';
import { Link } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import SearchBar from '../components/SearchBar';
import { Profile } from '../types';
import { supabase } from '../lib/supabase';
import { getActiveTiersForClubs } from '../services/clubMembershipService';

function getAdvertisementRoute(profile: Profile) {
	return `/clubs/${profile.id}`;
}

export default function Clubs() {
	const [clubs, setClubs] = React.useState<Profile[]>([]);
	const [cityFilter, setCityFilter] = React.useState<string>('');
	const [query, setQuery] = React.useState<string>('');

	React.useEffect(() => {
		(async () => {
			const { data, error } = await supabase
				.from('clubs')
				.select('id, name, city, description, cover_photo_url');
			if (error) return;

			const ids = (data || []).map((c: any) => c.id);
			let profiles: any[] = [];
			if (ids.length > 0) {
				const { data: prof } = await supabase
					.from('profiles')
					.select('id, image_url, loves, rating')
					.in('id', ids);
				profiles = prof || [];
			}
			const map = new Map(profiles.map(p => [p.id, p]));

			const tiers = await getActiveTiersForClubs(ids);
			const rows: Profile[] = (data || []).map((c: any) => {
				const p = map.get(c.id) || {};
				return {
					id: c.id,
					name: c.name || 'Club',
					location: c.city || '',
					imageUrl: c.cover_photo_url || p.image_url || '',
					rating: Number(p.rating || 0),
					loves: Number(p.loves || 0),
					isVerified: true,
					isClub: true,
					description: c.description || '',
					membershipTier: (tiers[c.id] || 'FREE') as any
				};
			});
			setClubs(rows);
		})();
	}, []);

	const tierPriority: Record<string, number> = { 'ULTRA': 0, 'PRO-PLUS': 1, 'PRO': 2, 'FREE': 3 };
	const filtered = clubs
		.filter(c => (cityFilter ? c.location === cityFilter : true))
		.filter(c => (query ? (c.name || '').toLowerCase().includes(query.toLowerCase()) || (c.description || '').toLowerCase().includes(query.toLowerCase()) : true))
		.sort((a, b) => (tierPriority[a.membershipTier] ?? 3) - (tierPriority[b.membershipTier] ?? 3));

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<SearchBar onCityChange={(city) => setCityFilter(city || '')} onQueryChange={(q: string) => setQuery(q)} />
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
				{filtered.map((profile) => (
					<Link to={getAdvertisementRoute(profile)} className="block" key={profile.id}>
						<ProfileCard {...profile} />
					</Link>
				))}
				{filtered.length === 0 && (
					<div className="col-span-full text-center text-gray-500 py-16">No clubs found.</div>
				)}
			</div>
		</div>
	);
}