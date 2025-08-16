import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import { searchProfiles, type SearchFilters, type SearchResult } from '../services/searchService';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function SearchResults() {
  const query = useQuery();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const filters: SearchFilters = {
        location: query.get('location') || undefined,
        category: (query.get('category') as any) || 'all',
        radiusKm: query.get('radiusKm') ? Number(query.get('radiusKm')) : undefined,
        requireVerified: query.get('requireVerified') === 'true',
        requireFanPosts: query.get('requireFanPosts') === 'true',
      } as any;
      try {
        const r = await searchProfiles(filters);
        setResults(r);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Search Results</h1>
        <Link to="/search" className="text-pink-500 hover:underline">Edit search</Link>
      </div>
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">Loading...</div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">No results</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {results.map(r => (
            <ProfileCard
              key={r.id}
              name={r.name}
              location={r.location}
              imageUrl={r.image_url || 'https://via.placeholder.com/400x400?text=No+Image'}
              rating={r.rating || 0}
              loves={r.loves || 0}
              isVerified={true}
              isClub={r.is_club}
              description={r.description || ''}
              price={r.price || undefined}
              membershipTier={'FREE'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

