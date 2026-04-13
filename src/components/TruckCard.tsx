import { useNavigate } from 'react-router-dom';
import { Truck, Heart, Star } from 'lucide-react';
import type { FoodTruck, Favorite } from '../types';
import './TruckCard.css';

type TruckCardProps = {
  truck: FoodTruck | Favorite;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

function isFoodTruck(t: FoodTruck | Favorite): t is FoodTruck {
  return 'placeId' in t;
}

export default function TruckCard({ truck, isFavorite, onToggleFavorite }: TruckCardProps) {
  const navigate = useNavigate();
  const truckId = isFoodTruck(truck) ? truck.placeId : truck.truckId;

  return (
    <div className="truck-card" onClick={() => navigate(`/truck/${truckId}`, { state: { truck } })}>
      <div className="truck-card-image">
        {truck.imageUrl ? (
          <img
            src={truck.imageUrl}
            alt={truck.businessName}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`truck-card-placeholder ${truck.imageUrl ? 'hidden' : ''}`}>
          <Truck size={36} strokeWidth={1.5} />
        </div>
      </div>
      <div className="truck-card-body">
        <div className="truck-card-header">
          <h3 className="truck-card-name">{truck.businessName}</h3>
          {onToggleFavorite && (
            <button
              className={`fav-btn ${isFavorite ? 'fav-btn--active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                size={17}
                strokeWidth={2}
                fill={isFavorite ? 'currentColor' : 'none'}
              />
            </button>
          )}
        </div>
        {truck.cuisineType && <p className="truck-card-cuisine">{truck.cuisineType}</p>}
        <div className="truck-card-meta">
          {truck.rating != null && (
            <span className="truck-card-rating">
              <Star size={13} fill="currentColor" strokeWidth={0} />
              {truck.rating.toFixed(1)}
            </span>
          )}
          {truck.isOpen != null && (
            <span className={`truck-card-status ${truck.isOpen ? 'open' : 'closed'}`}>
              {truck.isOpen ? 'Open' : 'Closed'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
