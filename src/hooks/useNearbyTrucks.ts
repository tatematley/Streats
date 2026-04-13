import { useState, useCallback } from 'react';
import type { FoodTruck, LoadingState } from '../types';

const SEARCH_FIELDS: string[] = [
  'id', 'displayName', 'rating', 'userRatingCount', 'photos',
  'location', 'formattedAddress', 'types',
];

function mapPlaceToTruck(place: google.maps.places.Place): FoodTruck {
  return {
    placeId: place.id ?? '',
    truckId: place.id ?? '',
    businessName: place.displayName ?? 'Unknown',
    cuisineType: place.types?.find(
      (t) => t !== 'food' && t !== 'establishment' && t !== 'point_of_interest'
    ),
    rating: place.rating ?? undefined,
    reviewCount: place.userRatingCount ?? undefined,
    isOpen: undefined, // new Places API isOpen() is async/beta-only; fetched on detail page
    imageUrl: place.photos?.[0]?.getURI({ maxWidth: 400 }),
    location: place.location
      ? {
          latitude: place.location.lat(),
          longitude: place.location.lng(),
          address: place.formattedAddress ?? '',
        }
      : undefined,
  };
}

export function useNearbyTrucks() {
  const [trucks, setTrucks] = useState<FoodTruck[]>([]);
  const [status, setStatus] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const searchNearby = useCallback(
    async (location: google.maps.LatLngLiteral, radiusMeters = 5000) => {
      setStatus('loading');
      setError(null);

      try {
        const { places } = await google.maps.places.Place.searchByText({
          textQuery: 'food truck',
          fields: SEARCH_FIELDS,
          locationBias: { center: location, radius: radiusMeters },
          maxResultCount: 20,
        });
        setTrucks(places.map(mapPlaceToTruck));
        setStatus('success');
      } catch {
        setError('Failed to load food trucks. Please try again.');
        setStatus('error');
      }
    },
    []
  );

  const searchByText = useCallback(async (query: string) => {
    setStatus('loading');
    setError(null);

    try {
      const { places } = await google.maps.places.Place.searchByText({
        textQuery: `${query} food truck`,
        fields: SEARCH_FIELDS,
        maxResultCount: 20,
      });
      setTrucks(places.map(mapPlaceToTruck));
      setStatus('success');
    } catch {
      setError('Search failed. Please try again.');
      setStatus('error');
    }
  }, []);

  return { trucks, status, error, searchNearby, searchByText };
}
