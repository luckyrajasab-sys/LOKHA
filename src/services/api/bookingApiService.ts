import { api } from './apiClient';

export interface BookingPayload {
  property_id?: string;
  hotel_id?: string;
  room_id?: string;
  pg_id?: string;
  hostel_id?: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  currency?: string;
}

export const bookingApi = {
  create: async (data: BookingPayload) => {
    return api.post<{ message: string; booking: any }>('/bookings', data, {
      requiresAuth: true,
    });
  },

  getMyBookings: async () => {
    return api.get<{ bookings: any[] }>('/bookings', { requiresAuth: true });
  },

  updateStatus: async (bookingId: string, status: 'Confirmed' | 'Cancelled') => {
    return api.patch<{ message: string; booking: any }>(
      `/bookings/${bookingId}/status`,
      { status },
      { requiresAuth: true }
    );
  }
};
