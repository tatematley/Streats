import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Globe, Star, Heart, Navigation, MessageSquare } from 'lucide-react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { useFavorites } from '../hooks/useFavorites';
import type { FoodTruck } from '../types';
import './TruckDetailPage.css';

function mapPlaceDetails(place: google.maps.places.Place): FoodTruck {
  return {
    placeId: place.id ?? '',
    truckId: place.id ?? '',
    businessName: place.displayName ?? 'Unknown',
    cuisineType: place.types?.find(
      (t) => t !== 'food' && t !== 'establishment' && t !== 'point_of_interest'
    ),
    rating: place.rating ?? undefined,
    reviewCount: place.userRatingCount ?? undefined,
    phoneNumber: place.nationalPhoneNumber ?? undefined,
    websiteUrl: place.websiteURI ?? undefined,
    isOpen: undefined,
    imageUrl: place.photos?.[0]?.getURI({ maxWidth: 800 }),
    location: place.location
      ? {
          latitude: place.location.lat(),
          longitude: place.location.lng(),
          address: place.formattedAddress ?? '',
        }
      : undefined,
  };
}

export default function TruckDetailPage() {
  const { placeId } = useParams<{ placeId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { isLoaded, isError } = useGoogleMaps();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  // Pre-populate with data passed from the search/map page so the page renders instantly
  const initialTruck = (state as { truck?: FoodTruck } | null)?.truck ?? null;
  const [truck, setTruck] = useState<FoodTruck | null>(initialTruck);
  const [loading, setLoading] = useState(!initialTruck);
  const [error, setError] = useState<string | null>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoaded || !placeId) return;

    const place = new google.maps.places.Place({ id: placeId });
    place.fetchFields({
      fields: [
        'id', 'displayName', 'rating', 'userRatingCount', 'nationalPhoneNumber',
        'websiteURI', 'photos', 'location', 'formattedAddress', 'types',
      ],
    })
      .then(() => {
        setTruck(mapPlaceDetails(place));
      })
      .catch(() => {
        // Only show error if we have no data to fall back on
        if (!initialTruck) setError('Could not load truck details.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isLoaded, placeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mini map
  useEffect(() => {
    if (!truck?.location || !miniMapRef.current || !isLoaded) return;

    const pos = { lat: truck.location.latitude, lng: truck.location.longitude };
    const map = new google.maps.Map(miniMapRef.current, {
      center: pos,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: false,
    });
    new google.maps.Marker({ position: pos, map });
  }, [truck, isLoaded]);

  function getDirectionsUrl(): string {
    if (!truck?.location) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${truck.location.latitude},${truck.location.longitude}`;
  }

  function getReviewsUrl(): string {
    return `https://search.google.com/local/reviews?placeid=${truck?.placeId ?? ''}`;
  }

  if (isError) return <div className="detail-error">Failed to load Google Maps.</div>;
  if (loading) return <div className="detail-loading">Loading truck details...</div>;
  if (error || !truck) return <div className="detail-error">{error ?? 'Truck not found.'}</div>;

  const favorited = isFavorite(truck.placeId);

  return (
    <div className="detail-page">
      <button className="detail-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} strokeWidth={2.5} />
        Back
      </button>

      {truck.imageUrl && (
        <div className="detail-hero">
          <img src={truck.imageUrl} alt={truck.businessName} />
        </div>
      )}

      <div className="detail-content">
        <div className="detail-main">
          <div className="detail-title-row">
            <h1>{truck.businessName}</h1>
            <button
              className={`detail-fav-btn ${favorited ? 'active' : ''}`}
              onClick={() => favorited ? removeFavorite(truck.placeId) : addFavorite(truck)}
            >
              <Heart size={15} strokeWidth={2} fill={favorited ? 'currentColor' : 'none'} />
              {favorited ? 'Saved' : 'Save'}
            </button>
          </div>

          {truck.cuisineType && (
            <p className="detail-cuisine">{truck.cuisineType.replace(/_/g, ' ')}</p>
          )}

          <div className="detail-badges">
            {truck.rating != null && (
              <span className="detail-rating">
                <Star size={15} fill="currentColor" strokeWidth={0} />
                {truck.rating.toFixed(1)}
                {truck.reviewCount != null && <span className="detail-review-count">({truck.reviewCount} reviews)</span>}
              </span>
            )}
            {truck.isOpen != null && (
              <span className={`detail-status ${truck.isOpen ? 'open' : 'closed'}`}>
                {truck.isOpen ? 'Open Now' : 'Closed'}
              </span>
            )}
          </div>

          {truck.description && <p className="detail-description">{truck.description}</p>}

          <div className="detail-info-list">
            {truck.location?.address && (
              <div className="detail-info-item">
                <MapPin size={16} strokeWidth={2} className="detail-info-icon" />
                <span>{truck.location.address}</span>
              </div>
            )}
            {truck.phoneNumber && (
              <div className="detail-info-item">
                <Phone size={16} strokeWidth={2} className="detail-info-icon" />
                <a href={`tel:${truck.phoneNumber}`}>{truck.phoneNumber}</a>
              </div>
            )}
            {truck.websiteUrl && (
              <div className="detail-info-item">
                <Globe size={16} strokeWidth={2} className="detail-info-icon" />
                <a href={truck.websiteUrl} target="_blank" rel="noopener noreferrer">
                  Visit Website
                </a>
              </div>
            )}
          </div>

          <div className="detail-actions">
            <a className="detail-action-btn primary" href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
              <Navigation size={15} strokeWidth={2} />
              Directions
            </a>
            <a className="detail-action-btn" href={getReviewsUrl()} target="_blank" rel="noopener noreferrer">
              <MessageSquare size={15} strokeWidth={2} />
              Google Reviews
            </a>
            {truck.websiteUrl && (
              <a className="detail-action-btn" href={truck.websiteUrl} target="_blank" rel="noopener noreferrer">
                <Globe size={15} strokeWidth={2} />
                Website
              </a>
            )}
          </div>
        </div>

        {truck.location && (
          <div className="detail-map-wrap">
            <div ref={miniMapRef} className="detail-mini-map" />
          </div>
        )}
      </div>
    </div>
  );
}
