export interface TruckLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export interface FoodTruck {
  truckId: string;
  businessName: string;
  cuisineType?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  phoneNumber?: string;
  websiteUrl?: string;
  imageUrl?: string;
  isOpen?: boolean;
  location?: TruckLocation;
  placeId: string;
}

export interface Favorite {
  favoriteId: string;
  truckId: string;
  businessName: string;
  rating?: number;
  imageUrl?: string;
  cuisineType?: string;
  isOpen?: boolean;
  dateSaved: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
