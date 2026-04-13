import { useFavorites } from '../hooks/useFavorites';
import TruckCard from '../components/TruckCard';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import './FavoritesPage.css';

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();
  const navigate = useNavigate();

  return (
    <div className="favorites-page">
      <h1>My Favorites</h1>

      {favorites.length === 0 ? (
        <div className="favorites-empty">
          <div className="favorites-empty-icon">
            <Heart size={32} strokeWidth={1.5} />
          </div>
          <p>You haven't saved any food trucks yet.</p>
          <button className="favorites-explore-btn" onClick={() => navigate('/map')}>
            Explore the Map
          </button>
        </div>
      ) : (
        <>
          <p className="favorites-count">{favorites.length} saved truck{favorites.length !== 1 ? 's' : ''}</p>
          <div className="favorites-grid">
            {favorites.map((fav) => (
              <TruckCard
                key={fav.favoriteId}
                truck={fav}
                isFavorite={true}
                onToggleFavorite={() => removeFavorite(fav.truckId)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
