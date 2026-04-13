import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocateFixed, X, Star, Heart } from 'lucide-react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { useNearbyTrucks } from '../hooks/useNearbyTrucks';
import { useFavorites } from '../hooks/useFavorites';
import type { FoodTruck } from '../types';
import './MapPage.css';

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const overlayRef = useRef<google.maps.OverlayView | null>(null);

  const [selectedTruck, setSelectedTruck] = useState<FoodTruck | null>(null);
  const [cardPos, setCardPos] = useState<{ x: number; y: number } | null>(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMode, setLocationMode] = useState<'my-location' | 'search-area'>('my-location');
  const [areaQuery, setAreaQuery] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const { isLoaded, isError: mapsError } = useGoogleMaps();
  const { trucks, status, error, searchNearby } = useNearbyTrucks();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const navigate = useNavigate();

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || googleMapRef.current) return;
    googleMapRef.current = new google.maps.Map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
  }, [isLoaded]);

  // OverlayView lets us convert lat/lng → container pixel coordinates
  useEffect(() => {
    if (!isLoaded || !googleMapRef.current) return;
    const ov = new google.maps.OverlayView();
    ov.draw = () => {};
    ov.setMap(googleMapRef.current);
    overlayRef.current = ov;
    return () => { ov.setMap(null); overlayRef.current = null; };
  }, [isLoaded]);

  // Recalculate card position while panning; show card only after map is idle
  useEffect(() => {
    if (!selectedTruck?.location || !googleMapRef.current) {
      setCardPos(null);
      setCardVisible(false);
      return;
    }

    setCardVisible(false);

    const recalc = () => {
      const proj = overlayRef.current?.getProjection();
      if (!proj || !selectedTruck.location) return;
      const pt = proj.fromLatLngToContainerPixel(
        new google.maps.LatLng(selectedTruck.location.latitude, selectedTruck.location.longitude)
      );
      if (pt) setCardPos({ x: Math.round(pt.x), y: Math.round(pt.y) });
    };

    recalc();
    const boundsListener = googleMapRef.current.addListener('bounds_changed', recalc);
    const idleListener = googleMapRef.current.addListener('idle', () => {
      recalc();
      setCardVisible(true);
    });

    return () => {
      google.maps.event.removeListener(boundsListener);
      google.maps.event.removeListener(idleListener);
    };
  }, [selectedTruck]);

  // Geolocation search
  const locateAndSearch = useCallback(() => {
    if (!googleMapRef.current) return;
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setIsLocating(false);
        googleMapRef.current!.setCenter(loc);
        googleMapRef.current!.setZoom(14);
        searchNearby(loc);
      },
      () => {
        setIsLocating(false);
        setLocationError('Location access denied. Showing results near San Francisco.');
        searchNearby(DEFAULT_CENTER);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, [searchNearby]);

  useEffect(() => {
    if (isLoaded && googleMapRef.current) locateAndSearch();
  }, [isLoaded, locateAndSearch]);

  const searchByArea = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!areaQuery.trim() || !isLoaded) return;
    setIsGeocoding(true);
    setLocationError(null);
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: areaQuery.trim() }, (results, status) => {
      setIsGeocoding(false);
      if (status === 'OK' && results && results[0]) {
        const loc = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };
        googleMapRef.current!.setCenter(loc);
        googleMapRef.current!.setZoom(13);
        searchNearby(loc);
      } else {
        setLocationError('Could not find that location. Try a city or address.');
      }
    });
  }, [areaQuery, isLoaded, searchNearby]);

  // Preload images
  useEffect(() => {
    trucks.forEach((truck) => {
      if (truck.imageUrl) { const img = new Image(); img.src = truck.imageUrl; }
    });
  }, [trucks]);

  // Place markers
  useEffect(() => {
    if (!googleMapRef.current || trucks.length === 0) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    trucks.forEach((truck) => {
      if (!truck.location) return;
      const marker = new google.maps.Marker({
        position: { lat: truck.location.latitude, lng: truck.location.longitude },
        map: googleMapRef.current!,
        title: truck.businessName,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#ff6b00',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });
      marker.addListener('click', () => {
        setSelectedTruck(truck);
        if (truck.location) {
          googleMapRef.current!.panTo({
            lat: truck.location.latitude,
            lng: truck.location.longitude,
          });
        }
      });
      markersRef.current.push(marker);
    });
  }, [trucks]);

  // Card position: centred on the pin horizontally, 18px below it
  // Clamp so the card doesn't overflow the container edges
  function getCardStyle(): React.CSSProperties | undefined {
    if (!cardPos || !mapRef.current) return undefined;
    const CARD_W = 260;
    const containerW = mapRef.current.offsetWidth;
    const left = Math.max(8, Math.min(cardPos.x - CARD_W / 2, containerW - CARD_W - 8));
    return { top: cardPos.y + 18, left };
  }

  if (mapsError) {
    return <div className="map-error">Failed to load Google Maps. Check your API key.</div>;
  }

  return (
    <div className="map-page">
      <div className="map-sidebar">
        <div className="map-sidebar-header">
          <h2>Nearby Food Trucks</h2>
          <div className="location-toggle">
            <button
              className={`toggle-btn ${locationMode === 'my-location' ? 'active' : ''}`}
              onClick={() => { setLocationMode('my-location'); locateAndSearch(); }}
              disabled={!isLoaded}
            >
              <LocateFixed size={12} strokeWidth={2.5} />
              My Location
            </button>
            <button
              className={`toggle-btn ${locationMode === 'search-area' ? 'active' : ''}`}
              onClick={() => setLocationMode('search-area')}
              disabled={!isLoaded}
            >
              Search Area
            </button>
          </div>
        </div>

        {locationMode === 'search-area' && (
          <form className="area-search-form" onSubmit={searchByArea}>
            <input
              type="text"
              className="area-search-input"
              placeholder="City, neighborhood, or address..."
              value={areaQuery}
              onChange={(e) => setAreaQuery(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="area-search-btn" disabled={!isLoaded || !areaQuery.trim() || isGeocoding}>
              {isGeocoding ? '...' : 'Go'}
            </button>
          </form>
        )}

        {locationError && <p className="location-error">{locationError}</p>}
        {isLocating && <p className="map-loading">Getting your location...</p>}
        {!isLocating && !isGeocoding && status === 'loading' && <p className="map-loading">Searching for trucks...</p>}
        {isGeocoding && <p className="map-loading">Finding location...</p>}
        {error && <p className="map-error-text">{error}</p>}
        {status === 'success' && trucks.length === 0 && (
          <p className="map-empty">No food trucks found nearby.</p>
        )}

        <div className="map-truck-list">
          {trucks.map((truck) => (
            <div
              key={truck.placeId}
              className={`map-truck-item ${selectedTruck?.placeId === truck.placeId ? 'selected' : ''}`}
              onClick={() => {
                setSelectedTruck(truck);
                if (truck.location && googleMapRef.current) {
                  googleMapRef.current.panTo({
                    lat: truck.location.latitude,
                    lng: truck.location.longitude,
                  });
                }
              }}
            >
              <div className="map-truck-item-info">
                <strong>{truck.businessName}</strong>
                <span className="map-truck-address">{truck.location?.address}</span>
                {truck.rating != null && (
                  <span className="map-truck-rating">★ {truck.rating.toFixed(1)}</span>
                )}
              </div>
              {truck.isOpen != null && (
                <span className={`map-status-badge ${truck.isOpen ? 'open' : 'closed'}`}>
                  {truck.isOpen ? 'Open' : 'Closed'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="map-container">
        {!isLoaded && <div className="map-loading-overlay">Loading map...</div>}
        <div ref={mapRef} className="google-map" />

        {selectedTruck && cardPos && cardVisible && (
          <div className="map-info-card" style={getCardStyle()}>
            <button className="info-card-close" onClick={() => setSelectedTruck(null)} aria-label="Close">
              <X size={13} strokeWidth={2.5} />
            </button>

            <div className="info-card-body">
              <div className="info-card-top">
                {selectedTruck.imageUrl && (
                  <img
                    key={selectedTruck.placeId}
                    src={selectedTruck.imageUrl}
                    alt={selectedTruck.businessName}
                    className="info-card-thumb"
                  />
                )}
                <div className="info-card-text">
                  <h3>{selectedTruck.businessName}</h3>
                  {selectedTruck.location?.address && (
                    <p className="info-card-address">{selectedTruck.location.address}</p>
                  )}
                  <div className="info-card-meta">
                    {selectedTruck.rating != null && (
                      <span className="info-card-rating">
                        <Star size={12} fill="currentColor" strokeWidth={0} />
                        {selectedTruck.rating.toFixed(1)}
                      </span>
                    )}
                    {selectedTruck.isOpen != null && (
                      <span className={`info-card-status ${selectedTruck.isOpen ? 'open' : 'closed'}`}>
                        {selectedTruck.isOpen ? 'Open' : 'Closed'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="info-card-actions">
                <button className="info-btn primary" onClick={() => navigate(`/truck/${selectedTruck.placeId}`, { state: { truck: selectedTruck } })}>
                  View Details
                </button>
                <button
                  className={`info-btn ${isFavorite(selectedTruck.placeId) ? 'fav-active' : ''}`}
                  onClick={() =>
                    isFavorite(selectedTruck.placeId)
                      ? removeFavorite(selectedTruck.placeId)
                      : addFavorite(selectedTruck)
                  }
                >
                  <Heart size={13} strokeWidth={2} fill={isFavorite(selectedTruck.placeId) ? 'currentColor' : 'none'} />
                  {isFavorite(selectedTruck.placeId) ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
