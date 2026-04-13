import { useRef, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { useNearbyTrucks } from '../hooks/useNearbyTrucks';
import { useFavorites } from '../hooks/useFavorites';
import TruckCard from '../components/TruckCard';
import './SearchPage.css';


export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isLoaded, isError } = useGoogleMaps();
  const { trucks, status, error, searchByText } = useNearbyTrucks();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !isLoaded) return;
    setSubmitted(true);
    searchByText(query.trim());
  }

  if (isError) {
    return <div className="search-error">Failed to load Google Maps. Check your API key.</div>;
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search Food Trucks</h1>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search by name, cuisine, or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="search-btn" disabled={!isLoaded || !query.trim()}>
            Search
          </button>
        </form>
      </div>

      <div className="search-results">
        {!submitted && (
          <div className="search-prompt">
            <div className="search-prompt-icon">
              <Search size={28} strokeWidth={1.5} />
            </div>
            <p>Search for food trucks by name, type of food, or city.</p>
          </div>
        )}

        {status === 'loading' && <p className="search-status">Searching...</p>}
        {error && <p className="search-status error">{error}</p>}

        {status === 'success' && submitted && trucks.length === 0 && (
          <p className="search-status">No food trucks found for "{query}". Try a different search.</p>
        )}

        {trucks.length > 0 && (
          <>
            <p className="search-count">{trucks.length} result{trucks.length !== 1 ? 's' : ''} found</p>
            <div className="search-grid">
              {trucks.map((truck) => (
                <TruckCard
                  key={truck.placeId}
                  truck={truck}
                  isFavorite={isFavorite(truck.placeId)}
                  onToggleFavorite={() =>
                    isFavorite(truck.placeId) ? removeFavorite(truck.placeId) : addFavorite(truck)
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
