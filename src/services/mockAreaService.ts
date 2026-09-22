import type { PropertyDocument, PropertyType, PropertyListingType, FurnishedStatus } from '../types/firebaseModels';
import type { AccommodationListing, AccommodationCategory } from '../types/accommodation';

export function isVercelOnly(): boolean {
  // Enabled across all live links including Firebase (web.app/firebaseapp.com) and Vercel
  return true;
}

interface CityNeighborhood {
  name: string;
  pincode: string;
  latOffset: number;
  lngOffset: number;
}

const CITY_DATABASE: Record<string, { state: string; lat: number; lng: number; neighborhoods: CityNeighborhood[] }> = {
  chennai: {
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    neighborhoods: [
      { name: 'Boat Club Road RA Puram', pincode: '600028', latOffset: -0.05, lngOffset: -0.02 },
      { name: 'Poes Garden Estate', pincode: '600086', latOffset: -0.04, lngOffset: -0.01 },
      { name: 'Besant Nagar Beach Promenade', pincode: '600090', latOffset: -0.08, lngOffset: 0.00 },
      { name: 'Nungambakkam High Road', pincode: '600034', latOffset: -0.02, lngOffset: -0.03 },
      { name: 'ECR Sea Cliff Enclave', pincode: '600041', latOffset: -0.11, lngOffset: 0.01 },
      { name: 'Anna Nagar West Extension', pincode: '600101', latOffset: 0.01, lngOffset: -0.06 }
    ]
  },
  delhi: {
    state: 'Delhi NCR',
    lat: 28.6139,
    lng: 77.2090,
    neighborhoods: [
      { name: 'Lutyens Bungalow Zone', pincode: '110003', latOffset: -0.02, lngOffset: 0.01 },
      { name: 'Shanti Niketan Diplomatic', pincode: '110021', latOffset: -0.04, lngOffset: -0.04 },
      { name: 'Jor Bagh Estate Walk', pincode: '110003', latOffset: -0.03, lngOffset: 0.01 },
      { name: 'Panchsheel Park North', pincode: '110017', latOffset: -0.07, lngOffset: 0.01 }
    ]
  },
  pune: {
    state: 'Maharashtra',
    lat: 18.5204,
    lng: 73.8567,
    neighborhoods: [
      { name: 'Koregaon Park Lane 1', pincode: '411001', latOffset: 0.02, lngOffset: 0.04 },
      { name: 'Kalyani Nagar Waterfront', pincode: '411006', latOffset: 0.03, lngOffset: 0.05 },
      { name: 'Baner Hills Promenade', pincode: '411045', latOffset: 0.04, lngOffset: -0.07 }
    ]
  },
  bengaluru: {
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    neighborhoods: [
      { name: 'Koramangala 4th Block', pincode: '560034', latOffset: -0.04, lngOffset: 0.02 },
      { name: 'Indiranagar 100ft Road', pincode: '560038', latOffset: 0.01, lngOffset: 0.05 },
      { name: 'Whitefield Prestige Palms', pincode: '560066', latOffset: 0.01, lngOffset: 0.15 },
      { name: 'Sadashivanagar Embassy Enclave', pincode: '560080', latOffset: 0.04, lngOffset: -0.01 },
      { name: 'HSR Layout Sector 3', pincode: '560102', latOffset: -0.06, lngOffset: 0.04 },
      { name: 'Lavelle Road Promenade', pincode: '560001', latOffset: 0.005, lngOffset: 0.005 },
      { name: 'Hebbal Lake Promenade', pincode: '560024', latOffset: 0.07, lngOffset: -0.01 },
      { name: 'JP Nagar 7th Phase', pincode: '560078', latOffset: -0.08, lngOffset: -0.01 }
    ]
  },
  bangalore: {
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    neighborhoods: [
      { name: 'Koramangala 4th Block', pincode: '560034', latOffset: -0.04, lngOffset: 0.02 },
      { name: 'Indiranagar 100ft Road', pincode: '560038', latOffset: 0.01, lngOffset: 0.05 },
      { name: 'Whitefield Prestige Palms', pincode: '560066', latOffset: 0.01, lngOffset: 0.15 },
      { name: 'Sadashivanagar Embassy Enclave', pincode: '560080', latOffset: 0.04, lngOffset: -0.01 },
      { name: 'HSR Layout Sector 3', pincode: '560102', latOffset: -0.06, lngOffset: 0.04 },
      { name: 'Lavelle Road Promenade', pincode: '560001', latOffset: 0.005, lngOffset: 0.005 }
    ]
  },
  mumbai: {
    state: 'Maharashtra',
    lat: 19.0760,
    lng: 72.8777,
    neighborhoods: [
      { name: 'Bandra West Pali Hill', pincode: '400050', latOffset: -0.02, lngOffset: -0.05 },
      { name: 'Juhu Tara Road Sea Promenade', pincode: '400049', latOffset: 0.03, lngOffset: -0.05 },
      { name: 'Worli Sea Face Boulevard', pincode: '400018', latOffset: -0.07, lngOffset: -0.06 },
      { name: 'Hiranandani Gardens Powai', pincode: '400076', latOffset: 0.04, lngOffset: 0.03 },
      { name: 'Malabar Hill Grandview', pincode: '400006', latOffset: -0.12, lngOffset: -0.07 }
    ]
  },
  gurugram: {
    state: 'Haryana',
    lat: 28.4595,
    lng: 77.0266,
    neighborhoods: [
      { name: 'DLF Golf Course Road', pincode: '122002', latOffset: 0.01, lngOffset: 0.06 },
      { name: 'DLF Phase 5 The Camellias', pincode: '122011', latOffset: 0.00, lngOffset: 0.07 },
      { name: 'Sohna Road Greens', pincode: '122018', latOffset: -0.05, lngOffset: 0.02 },
      { name: 'Ambience Island Lagoon', pincode: '122002', latOffset: 0.05, lngOffset: 0.07 }
    ]
  },
  hyderabad: {
    state: 'Telangana',
    lat: 17.3850,
    lng: 78.4867,
    neighborhoods: [
      { name: 'Jubilee Hills Road No. 36', pincode: '500033', latOffset: 0.05, lngOffset: -0.08 },
      { name: 'Banjara Hills Canyon Heights', pincode: '500034', latOffset: 0.03, lngOffset: -0.06 },
      { name: 'Financial District Nanakramguda', pincode: '500032', latOffset: 0.03, lngOffset: -0.14 },
      { name: 'Gachibowli Green Enclave', pincode: '500075', latOffset: 0.05, lngOffset: -0.12 }
    ]
  },
  goa: {
    state: 'Goa',
    lat: 15.2993,
    lng: 74.1240,
    neighborhoods: [
      { name: 'Candolim Sunset Palm Groves', pincode: '403515', latOffset: 0.21, lngOffset: -0.35 },
      { name: 'Assagao Valley Heritage', pincode: '403507', latOffset: 0.28, lngOffset: -0.34 },
      { name: 'Anjuna Clifftop Vista', pincode: '403509', latOffset: 0.28, lngOffset: -0.38 },
      { name: 'Benaulim White Sands', pincode: '403716', latOffset: -0.06, lngOffset: -0.17 }
    ]
  }
};

const LUXURY_HOUSE_IMAGES = [
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80'
];

const LUXURY_STAY_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80'
];

/**
 * Generate abundant realistic houses and stays for the auto-detected area
 */
export function getAreaPropertiesAndStays(detectedCityName: string = 'Bengaluru', userLat?: number, userLng?: number): {
  properties: PropertyDocument[];
  stays: AccommodationListing[];
} {
  const cityKey = detectedCityName.trim().toLowerCase();
  const cityProfile = CITY_DATABASE[cityKey] || {
    state: 'Prime Region',
    lat: userLat || 12.9716,
    lng: userLng || 77.5946,
    neighborhoods: [
      { name: `${detectedCityName} Central Enclave`, pincode: '500001', latOffset: 0.01, lngOffset: 0.01 },
      { name: `${detectedCityName} Green Promenade`, pincode: '500002', latOffset: -0.02, lngOffset: 0.03 },
      { name: `${detectedCityName} Heights Boulevard`, pincode: '500003', latOffset: 0.03, lngOffset: -0.02 },
      { name: `${detectedCityName} Waterfront Sanctuary`, pincode: '500004', latOffset: -0.04, lngOffset: -0.01 }
    ]
  };

  const centerLat = userLat || cityProfile.lat;
  const centerLng = userLng || cityProfile.lng;

  // 1. GENERATE ABUNDANT HOUSES (Villas, Independent Houses, Penthouses for Rent, Lease & Sale)
  const houseTemplates = [
    {
      title: `The Imperial Palm Villa`,
      type: 'Villa' as PropertyType,
      listingType: 'Rent' as PropertyListingType,
      rent: 145000,
      deposit: 450000,
      price: 145000,
      bhk: 4,
      baths: 5,
      area: 4200,
      furnished: 'Fully Furnished' as FurnishedStatus,
      amenities: ['Swimming Pool', 'Private Garden', 'Clubhouse', 'Covered Parking', '24/7 Concierge']
    },
    {
      title: `Skyline Horizon Duplex Penthouse`,
      type: 'Apartment' as PropertyType,
      listingType: 'Rent' as PropertyListingType,
      rent: 98000,
      deposit: 300000,
      price: 98000,
      bhk: 3,
      baths: 4,
      area: 2850,
      furnished: 'Fully Furnished' as FurnishedStatus,
      amenities: ['Gym / Fitness Center', 'Sea View', 'Covered Parking', 'Clubhouse']
    },
    {
      title: `Royal Tuscan Courtyard House`,
      type: 'House' as PropertyType,
      listingType: 'Lease' as PropertyListingType,
      leaseAmount: 4500000,
      deposit: 500000,
      price: 4500000,
      bhk: 5,
      baths: 6,
      area: 5100,
      furnished: 'Fully Furnished' as FurnishedStatus,
      amenities: ['Private Garden', 'Swimming Pool', 'Covered Parking', 'Home Theatre']
    },
    {
      title: `Serenade Eco-Smart Residence`,
      type: 'House' as PropertyType,
      listingType: 'Rent' as PropertyListingType,
      rent: 68000,
      deposit: 200000,
      price: 68000,
      bhk: 3,
      baths: 3,
      area: 2200,
      furnished: 'Semi-Furnished' as FurnishedStatus,
      amenities: ['Covered Parking', 'Gym / Fitness Center', 'Clubhouse']
    },
    {
      title: `The Grand Monolith Glass Villa`,
      type: 'Villa' as PropertyType,
      listingType: 'Sale' as PropertyListingType,
      price: 48000000,
      bhk: 5,
      baths: 6,
      area: 6400,
      furnished: 'Fully Furnished' as FurnishedStatus,
      amenities: ['Swimming Pool', 'Private Garden', 'Sea View', 'Clubhouse', 'Valet Parking']
    },
    {
      title: `Azure Lakefront Designer Residence`,
      type: 'Villa' as PropertyType,
      listingType: 'Rent' as PropertyListingType,
      rent: 185000,
      deposit: 550000,
      price: 185000,
      bhk: 4,
      baths: 5,
      area: 4600,
      furnished: 'Fully Furnished' as FurnishedStatus,
      amenities: ['Swimming Pool', 'Sea View', 'Covered Parking', 'Private Garden']
    },
    {
      title: `Cedar Crest Executive Suite`,
      type: 'Apartment' as PropertyType,
      listingType: 'Rent' as PropertyListingType,
      rent: 55000,
      deposit: 160000,
      price: 55000,
      bhk: 2,
      baths: 2,
      area: 1450,
      furnished: 'Fully Furnished' as FurnishedStatus,
      amenities: ['Gym / Fitness Center', 'Covered Parking', 'Clubhouse']
    },
    {
      title: `Ambience Gardenia Independent House`,
      type: 'House' as PropertyType,
      listingType: 'Lease' as PropertyListingType,
      leaseAmount: 3200000,
      deposit: 350000,
      price: 3200000,
      bhk: 4,
      baths: 4,
      area: 3400,
      furnished: 'Semi-Furnished' as FurnishedStatus,
      amenities: ['Private Garden', 'Covered Parking', 'Clubhouse']
    },
    {
      title: `Mirador High-Rise Presidential Suite`,
      type: 'Apartment' as PropertyType,
      listingType: 'Rent' as PropertyListingType,
      rent: 220000,
      deposit: 700000,
      price: 220000,
      bhk: 4,
      baths: 5,
      area: 4100,
      furnished: 'Fully Furnished' as FurnishedStatus,
      amenities: ['Gym / Fitness Center', 'Sea View', 'Swimming Pool', 'Covered Parking']
    },
    {
      title: `Fairmont Green Acres Colonial Villa`,
      type: 'Villa' as PropertyType,
      listingType: 'Rent' as PropertyListingType,
      rent: 125000,
      deposit: 380000,
      price: 125000,
      bhk: 4,
      baths: 4,
      area: 3900,
      furnished: 'Fully Furnished' as FurnishedStatus,
      amenities: ['Private Garden', 'Swimming Pool', 'Covered Parking']
    },
    {
      title: `Zenith Signature Row House`,
      type: 'House' as PropertyType,
      listingType: 'Rent' as PropertyListingType,
      rent: 78000,
      deposit: 240000,
      price: 78000,
      bhk: 3,
      baths: 3,
      area: 2600,
      furnished: 'Fully Furnished' as FurnishedStatus,
      amenities: ['Covered Parking', 'Gym / Fitness Center', 'Private Garden']
    },
    {
      title: `Pavilion Ultra-Luxury Masterpiece`,
      type: 'Villa' as PropertyType,
      listingType: 'Sale' as PropertyListingType,
      price: 65000000,
      bhk: 6,
      baths: 7,
      area: 7800,
      furnished: 'Fully Furnished' as FurnishedStatus,
      amenities: ['Swimming Pool', 'Private Garden', 'Sea View', 'Clubhouse']
    }
  ];

  const generatedProperties: PropertyDocument[] = houseTemplates.map((item, idx) => {
    const neighborhood = cityProfile.neighborhoods[idx % cityProfile.neighborhoods.length];
    const imageIdx = idx % LUXURY_HOUSE_IMAGES.length;
    const secondImageIdx = (idx + 1) % LUXURY_HOUSE_IMAGES.length;

    return {
      propertyId: `auto_prop_${cityKey}_${idx + 1}`,
      ownerId: `owner_${(idx % 4) + 1}`,
      agentId: `agent_${(idx % 3) + 1}`,
      title: `${item.title} - ${neighborhood.name}`,
      description: `Spectacular residence offering peerless luxury in ${neighborhood.name}, ${detectedCityName}. Engineered with grand ceiling heights, Italian marble floors, bespoke imported cabinetry, and serene green outlooks.`,
      propertyType: item.type,
      listingType: item.listingType,
      price: item.price,
      rentAmount: item.rent,
      leaseAmount: item.leaseAmount,
      securityDeposit: item.deposit,
      bedrooms: item.bhk,
      bathrooms: item.baths,
      area: item.area,
      areaUnit: 'sq.ft',
      address: `${10 + idx * 4}, Boulevard Heights, ${neighborhood.name}`,
      city: detectedCityName,
      state: cityProfile.state,
      pincode: neighborhood.pincode,
      latitude: centerLat + neighborhood.latOffset + (idx * 0.002),
      longitude: centerLng + neighborhood.lngOffset + (idx * 0.002),
      amenities: item.amenities,
      images: [
        LUXURY_HOUSE_IMAGES[imageIdx],
        LUXURY_HOUSE_IMAGES[secondImageIdx]
      ],
      status: 'available',
      furnishedStatus: item.furnished,
      createdAt: new Date(Date.now() - idx * 3600000 * 5).toISOString(),
      updatedAt: new Date().toISOString(),
      views: 120 + idx * 34,
      isFeatured: idx < 4
    };
  });

  // 2. GENERATE ABUNDANT STAYS & HOSPITALITY IN THE AUTO-DETECTED AREA
  const stayTemplates = [
    {
      name: `The Royal Sanctuary Heritage Stay`,
      category: 'Villa' as AccommodationCategory,
      desc: `Exclusive private sanctuary featuring secluded courtyards, heated infinity pool, and personal 24/7 butler.`,
      pricePerNight: 16500,
      rating: 4.96,
      reviews: 218,
      amenities: ['Private Pool', 'Chef On Call', 'Spa Suite', 'WiFi 1Gbps', 'Valet']
    },
    {
      name: `Aura Executive Co-Living & Luxury Suites`,
      category: 'Serviced Apartment' as AccommodationCategory,
      desc: `Modern designer suites with bespoke ergonomic workstations, barista coffee lounge, and daily housekeeping.`,
      pricePerNight: 4800,
      rating: 4.89,
      reviews: 412,
      amenities: ['High-Speed WiFi', 'Co-Working Lounge', 'Gym', 'Breakfast Included']
    },
    {
      name: `Casa Serenade Garden Retreat`,
      category: 'Homestay' as AccommodationCategory,
      desc: `Charming landscaped retreat surrounded by exotic flora, organic orchard dining, and yoga pavilion.`,
      pricePerNight: 8500,
      rating: 4.92,
      reviews: 165,
      amenities: ['Private Garden', 'Organic Breakfast', 'Yoga Deck', 'Pet Friendly']
    },
    {
      name: `Oasis Clifftop Boutique Resort`,
      category: 'Resort' as AccommodationCategory,
      desc: `Boutique luxury resort perched high with panoramic horizon vistas, sunset cocktail deck, and wellness spa.`,
      pricePerNight: 24000,
      rating: 4.98,
      reviews: 320,
      amenities: ['Infinity Pool', 'Spa', 'Fine Dining', 'Airport Limousine']
    },
    {
      name: `The Loft Sky Residences`,
      category: 'Apartment Stay' as AccommodationCategory,
      desc: `Ultra-chic downtown loft with 20ft ceilings, floor-to-ceiling city views, and designer cocktail bar.`,
      pricePerNight: 7200,
      rating: 4.87,
      reviews: 188,
      amenities: ['Panoramic Views', 'Smart Home Controls', 'Fitness Center']
    },
    {
      name: `Palm Grove Colonial Heritage Manor`,
      category: 'Villa' as AccommodationCategory,
      desc: `Restored 19th-century colonial estate with antique teak four-poster beds and starlit courtyard dining.`,
      pricePerNight: 19500,
      rating: 4.95,
      reviews: 142,
      amenities: ['Private Chef', 'Heritage Library', 'Bespoke Wine Cellar']
    }
  ];

  const generatedStays: AccommodationListing[] = stayTemplates.map((s, idx) => {
    const neighborhood = cityProfile.neighborhoods[idx % cityProfile.neighborhoods.length];
    const imageIdx = idx % LUXURY_STAY_IMAGES.length;

    return {
      id: `auto_stay_${cityKey}_${idx + 1}`,
      name: `${s.name} - ${neighborhood.name}`,
      category: s.category,
      description: s.desc,
      location: `${neighborhood.name}, ${detectedCityName}`,
      city: detectedCityName,
      country: 'India',
      coordinates: {
        latitude: centerLat + neighborhood.latOffset + (idx * 0.003),
        longitude: centerLng + neighborhood.lngOffset + (idx * 0.003)
      },
      images: [LUXURY_STAY_IMAGES[imageIdx]],
      amenities: s.amenities,
      rating: s.rating,
      reviewsCount: s.reviews,
      startingPrice: s.pricePerNight,
      currency: 'INR',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
      houseRules: ['No loud parties after 10 PM', 'Smoking allowed on outdoor decks only'],
      host: {
        id: `host_${idx + 1}`,
        name: `Lokha Signature Host (${neighborhood.name})`,
        isSuperHost: true
      },
      verified: true
    };
  });

  return {
    properties: generatedProperties,
    stays: generatedStays
  };
}

/**
 * Convert stays to PropertyDocument format so they can seamlessly render on map and list views
 */
export function convertStaysToProperties(stays: AccommodationListing[]): PropertyDocument[] {
  return stays.map(s => ({
    propertyId: s.id,
    ownerId: s.host.id,
    title: s.name,
    description: s.description,
    propertyType: 'Villa' as PropertyType,
    listingType: 'Rent' as PropertyListingType,
    price: s.startingPrice * 30, // Approximate monthly scale
    rentAmount: s.startingPrice, // Nightly rate display
    bedrooms: 3,
    bathrooms: 3,
    area: 2200,
    areaUnit: 'sq.ft',
    address: s.location,
    city: s.city,
    state: 'Prime Region',
    pincode: '560001',
    latitude: s.coordinates.latitude,
    longitude: s.coordinates.longitude,
    amenities: s.amenities,
    images: s.images,
    status: 'available',
    furnishedStatus: 'Fully Furnished',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: s.reviewsCount * 4,
    isFeatured: true
  }));
}

export function getCityCoordinates(cityName: string): [number, number] | null {
  if (!cityName) return null;
  const key = cityName.toLowerCase().trim();
  for (const [k, v] of Object.entries(CITY_DATABASE)) {
    if (key.includes(k) || k.includes(key)) {
      return [v.lat, v.lng];
    }
  }
  return null;
}

