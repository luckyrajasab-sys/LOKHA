import { api } from './apiClient';
import type { Property } from '../../types/property';

export interface PropertySearchParams {
  search?: string;
  listingType?: string;
  propertyType?: string;
  city?: string;
  state?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  furnished?: string;
  amenities?: string[];
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'created_at_desc' | 'area_desc';
  page?: number;
  limit?: number;
}

export const propertyApi = {
  search: async (params: PropertySearchParams = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        if (Array.isArray(val)) {
          val.forEach((item) => query.append(key, item));
        } else {
          query.append(key, String(val));
        }
      }
    });
    const queryString = query.toString();
    return api.get<{ properties: Property[]; pagination: any }>(
      `/properties${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: async (id: string) => {
    return api.get<{ property: Property }>(`/properties/${id}`);
  },

  create: async (propertyData: Partial<Property>) => {
    return api.post<{ message: string; property: Property }>(
      '/properties',
      propertyData,
      { requiresAuth: true }
    );
  },

  update: async (id: string, propertyData: Partial<Property>) => {
    return api.put<{ message: string; property: Property }>(
      `/properties/${id}`,
      propertyData,
      { requiresAuth: true }
    );
  },

  delete: async (id: string) => {
    return api.delete<{ message: string }>(`/properties/${id}`, {
      requiresAuth: true,
    });
  },

  // Favorites
  getFavorites: async () => {
    return api.get<{ favorites: any[] }>('/favorites', { requiresAuth: true });
  },

  addFavorite: async (propertyId: string) => {
    return api.post<{ message: string; favorite: any }>(
      '/favorites',
      { propertyId },
      { requiresAuth: true }
    );
  },

  removeFavorite: async (propertyId: string) => {
    return api.delete<{ message: string }>(`/favorites/${propertyId}`, {
      requiresAuth: true,
    });
  },

  // Inquiries
  sendInquiry: async (propertyId: string, message: string) => {
    return api.post<{ message: string; inquiry: any }>(
      '/inquiries',
      { propertyId, message },
      { requiresAuth: true }
    );
  },

  // Viewings
  scheduleViewing: async (propertyId: string, scheduledAt: string, notes?: string) => {
    return api.post<{ message: string; viewing: any }>(
      '/viewings',
      { propertyId, scheduledAt, notes },
      { requiresAuth: true }
    );
  }
};
