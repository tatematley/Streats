import { useState, useCallback } from 'react';
import type { Favorite, FoodTruck } from '../types';

const STORAGE_KEY = 'streats_favorites';

function loadFavorites(): Favorite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Favorite[]) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: Favorite[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(loadFavorites);

  const addFavorite = useCallback((truck: FoodTruck) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.truckId === truck.placeId)) return prev;
      const newFav: Favorite = {
        favoriteId: `fav_${Date.now()}`,
        truckId: truck.placeId,
        businessName: truck.businessName,
        rating: truck.rating,
        imageUrl: truck.imageUrl,
        cuisineType: truck.cuisineType,
        isOpen: truck.isOpen,
        dateSaved: new Date().toISOString(),
      };
      const updated = [...prev, newFav];
      saveFavorites(updated);
      return updated;
    });
  }, []);

  const removeFavorite = useCallback((truckId: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.truckId !== truckId);
      saveFavorites(updated);
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (truckId: string) => favorites.some((f) => f.truckId === truckId),
    [favorites]
  );

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
