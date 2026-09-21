export type AccommodationCategory =
  | 'Hotel'
  | 'Hostel'
  | 'PG'
  | 'Villa'
  | 'Homestay'
  | 'Serviced Apartment'
  | 'Resort'
  | 'Guest House'
  | 'Apartment Stay';

export interface RoomOption {
  roomId: string;
  hotelId: string;
  roomType: string;
  capacity: number;
  bedType: string;
  amenities: string[];
  pricePerNight: number;
  currency: string;
  availableRooms: number;
  images: string[];
}

export interface AccommodationListing {
  id: string;
  name: string;
  category: AccommodationCategory;
  description: string;
  location: string;
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  images: string[];
  amenities: string[];
  rating: number;
  reviewsCount: number;
  startingPrice: number;
  currency: string;
  checkInTime: string;
  checkOutTime: string;
  rooms?: RoomOption[];
  cancellationPolicy: string;
  houseRules: string[];
  host: {
    id: string;
    name: string;
    avatar?: string;
    isSuperHost: boolean;
  };
  verified: boolean;
}
