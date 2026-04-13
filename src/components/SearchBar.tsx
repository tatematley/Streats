import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Star } from 'lucide-react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import type { FoodTruck } from '../types';
import './SearchBar.css';

function mapPlaceToTruck(place: google.maps.places.Place): FoodTruck {
  return {
    placeId: place.id ?? '',
    truckId: place.id ?? '',
    businessName: place.displayName ?? 'Unknown',
    rating: place.rating ?? undefined,
    isOpen: undefined,
    imageUrl: place.photos?.[0]?.getURI({ maxWidth: 200 }),
    location: place.location
      ? {
          latitude: place.location.lat(),
          longitude: place.location.lng(),
          address: place.formattedAddress ?? '',
        }
      : undefined,
  };
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodTruck[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isLoaded } = useGoogleMaps();
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = useCallback(async (value: string) => {
    if (!isLoaded || !value.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const { places } = await google.maps.places.Place.searchByText({
        textQuery: `${value.trim()} food truck`,
        fields: ['id', 'displayName', 'rating', 'photos', 'location', 'formattedAddress'],
        maxResultCount: 8,
      });
      setResults(places.map(mapPlaceToTruck));
      setIsOpen(true);
    } catch {
      setResults([]);
      setIsOpen(value.trim().length > 0);
    } finally {
      setLoading(false);
    }
  }, [isLoaded]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => search(value), 500);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    search(query);
  }

  function handleSelect(truck: FoodTruck) {
    setIsOpen(false);
    setQuery('');
    navigate(`/truck/${truck.placeId}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div className="search-bar" ref={containerRef}>
      <form className="search-bar-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="search-bar-input"
          placeholder="Search food trucks..."
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          disabled={!isLoaded}
        />
        <button type="submit" className="search-bar-btn" aria-label="Search" disabled={!isLoaded}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="22" y2="22" />
          </svg>
        </button>
      </form>

      {isOpen && (
        <div className="search-bar-dropdown">
          {loading && <div className="search-bar-status">Searching...</div>}
          {!loading && results.length === 0 && (
            <div className="search-bar-status">No results found for "{query}"</div>
          )}
          {!loading && results.map((truck) => (
            <div
              key={truck.placeId}
              className="search-bar-result"
              onMouseDown={() => handleSelect(truck)}
            >
              <div className="search-bar-result-img">
                {truck.imageUrl
                  ? <img src={truck.imageUrl} alt={truck.businessName} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  : <Truck size={20} strokeWidth={1.5} />
                }
              </div>
              <div className="search-bar-result-info">
                <span className="search-bar-result-name">{truck.businessName}</span>
                {truck.location?.address && (
                  <span className="search-bar-result-address">{truck.location.address}</span>
                )}
              </div>
              <div className="search-bar-result-meta">
                {truck.rating != null && (
                  <span className="search-bar-result-rating">
                    <Star size={11} fill="currentColor" strokeWidth={0} />
                    {truck.rating.toFixed(1)}
                  </span>
                )}
                {truck.isOpen != null && (
                  <span className={`search-bar-result-status ${truck.isOpen ? 'open' : 'closed'}`}>
                    {truck.isOpen ? 'Open' : 'Closed'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
