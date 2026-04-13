import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Heart, ArrowRight } from 'lucide-react';
import { loadGoogleMapsScript } from '../hooks/useGoogleMaps';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  function handleFindTrucks() {
    loadGoogleMapsScript();
    navigate('/map');
  }

  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="landing-hero-bg" aria-hidden="true" />
        <div className="landing-hero-content">
          <img src="/StreatsLogo.png" alt="Streats" className="landing-logo" />
          <p className="landing-subtitle">Find food trucks near you — fast.</p>
          <p className="landing-description">
            Discover local food trucks, check ratings, get directions, and save your favorites.
          </p>
          <button className="landing-btn" onClick={handleFindTrucks}>
            Find My Truck
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="landing-features">
        <div className="feature-card">
          <div className="feature-icon-wrap">
            <MapPin size={22} strokeWidth={2} />
          </div>
          <h3>Live Locations</h3>
          <p>See food trucks on a real-time map near your current location.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-wrap">
            <Star size={22} strokeWidth={2} />
          </div>
          <h3>Ratings & Reviews</h3>
          <p>Browse ratings and reviews to pick the best truck for you.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-wrap">
            <Heart size={22} strokeWidth={2} />
          </div>
          <h3>Save Favorites</h3>
          <p>Bookmark your favorite trucks so you can find them again quickly.</p>
        </div>
      </div>
    </div>
  );
}
