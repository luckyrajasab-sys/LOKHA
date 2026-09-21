import { api } from './apiClient';

export const hospitalityApi = {
  getHotels: async (city?: string, country?: string) => {
    const q = new URLSearchParams();
    if (city) q.append('city', city);
    if (country) q.append('country', country);
    return api.get<{ hotels: any[] }>(`/hospitality/hotels?${q.toString()}`);
  },

  createHotel: async (data: any) => {
    return api.post<{ message: string; hotel: any }>('/hospitality/hotels', data, {
      requiresAuth: true,
    });
  },

  getPGs: async (city?: string, genderPolicy?: string) => {
    const q = new URLSearchParams();
    if (city) q.append('city', city);
    if (genderPolicy) q.append('genderPolicy', genderPolicy);
    return api.get<{ pgs: any[] }>(`/hospitality/pgs?${q.toString()}`);
  },

  getHostels: async (city?: string) => {
    const q = new URLSearchParams();
    if (city) q.append('city', city);
    return api.get<{ hostels: any[] }>(`/hospitality/hostels?${q.toString()}`);
  },

  getProjects: async (city?: string, status?: string) => {
    const q = new URLSearchParams();
    if (city) q.append('city', city);
    if (status) q.append('status', status);
    return api.get<{ projects: any[] }>(`/projects?${q.toString()}`);
  }
};
