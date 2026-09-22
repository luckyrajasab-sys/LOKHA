export interface RentLeaseNotification {
  id: string;
  title: string;
  propertyType: 'Apartment' | 'Villa' | 'Penthouse' | 'Row House';
  locality: string;
  city: string;
  rentAmount: string;
  depositAmount: string;
  bhk: string;
  areaSqFt: number;
  furnished: 'Fully Furnished' | 'Semi-Furnished';
  isNew: boolean;
  postedAt: string;
  tag: string;
  imageUrl: string;
}

export interface AppOfferNotification {
  id: string;
  title: string;
  badge: string;
  discount: string;
  code?: string;
  description: string;
  validUntil: string;
  category: 'Rent' | 'Lease' | 'Security' | 'Clubhouse';
}

export interface AppUpdateNotification {
  id: string;
  version: string;
  title: string;
  date: string;
  tag: 'Feature' | 'Performance' | 'Security' | 'Policy';
  highlights: string[];
}

export const SAMPLE_RENT_LEASE_NOTIFICATIONS: RentLeaseNotification[] = [
  {
    id: 'rent-01',
    title: 'Prestige Lakeside Habitat Villa',
    propertyType: 'Villa',
    locality: 'Whitefield',
    city: 'Bengaluru',
    rentAmount: '₹85,000 / mo',
    depositAmount: '₹2.5 Lakhs',
    bhk: '4 BHK Luxury',
    areaSqFt: 3100,
    furnished: 'Fully Furnished',
    isNew: true,
    postedAt: '12 mins ago',
    tag: 'Verified Owner',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'rent-02',
    title: 'The Sky Penthouse - Sea View',
    propertyType: 'Penthouse',
    locality: 'Bandra West',
    city: 'Mumbai',
    rentAmount: '₹2,40,000 / mo',
    depositAmount: '₹6 Lakhs',
    bhk: '3 BHK Panoramic',
    areaSqFt: 2450,
    furnished: 'Fully Furnished',
    isNew: true,
    postedAt: '45 mins ago',
    tag: 'Direct Lease',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'rent-03',
    title: 'DLF Magnolias Golf View Suite',
    propertyType: 'Apartment',
    locality: 'Golf Course Road',
    city: 'Gurugram',
    rentAmount: '₹1,95,000 / mo',
    depositAmount: '₹5 Lakhs',
    bhk: '4 BHK Suite',
    areaSqFt: 3800,
    furnished: 'Semi-Furnished',
    isNew: false,
    postedAt: '2 hours ago',
    tag: 'Club Access',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'rent-04',
    title: 'Sobha Rain Forest Sanctuary',
    propertyType: 'Row House',
    locality: 'Jubilee Hills',
    city: 'Hyderabad',
    rentAmount: '₹1,15,000 / mo',
    depositAmount: '₹3 Lakhs',
    bhk: '3.5 BHK Garden',
    areaSqFt: 2800,
    furnished: 'Fully Furnished',
    isNew: false,
    postedAt: '4 hours ago',
    tag: 'Pet Friendly',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
  }
];

export const APP_OFFERS_NOTIFICATIONS: AppOfferNotification[] = [
  {
    id: 'offer-01',
    title: 'Zero Brokerage Spring Festival',
    badge: 'Exclusive',
    discount: '100% Brokerage Free',
    code: 'ZEROFEE2026',
    description: 'Rent or lease any verified home without paying standard agent commission.',
    validUntil: 'Valid till 31 Mar',
    category: 'Rent'
  },
  {
    id: 'offer-02',
    title: 'Escrow Security Deposit Discount',
    badge: 'Instant Cashback',
    discount: 'Flat ₹15,000 Off',
    code: 'ESCROW15K',
    description: 'Pay rental security deposits through Lokha Escrow and claim direct instant cashback into your bank.',
    validUntil: 'Valid for next 7 days',
    category: 'Security'
  },
  {
    id: 'offer-03',
    title: 'Long-term Lease Rent Holiday',
    badge: 'Limited Slot',
    discount: '1 Month Rent Free',
    code: 'LEASEFREE1M',
    description: 'Sign a 24-month or longer lease on select premium estates and receive the 12th month rent-free.',
    validUntil: 'Valid this week',
    category: 'Lease'
  }
];

export const APP_UPDATES_NOTIFICATIONS: AppUpdateNotification[] = [
  {
    id: 'update-01',
    version: 'v2.4.0',
    title: 'Real-Time Neighborhood GPS Alerts & Lease Agreements',
    date: 'Just Released',
    tag: 'Feature',
    highlights: [
      'Instant push notifications when a house matching your rent budget is listed within 3 km',
      'One-click digital e-stamping and biometrically verified rental agreements',
      'High-definition 3D virtual walkthrough for all verified penthouses and villas'
    ]
  },
  {
    id: 'update-02',
    version: 'v2.3.8',
    title: 'Verified Landlord Guarantee & 24/7 Concierge',
    date: '3 days ago',
    tag: 'Security',
    highlights: [
      'Every rental property undergoes strict municipal title and ownership validation',
      'Free tenant background check and emergency relocation protection'
    ]
  }
];

export function getRentLeaseNotificationsForArea(cityName: string = 'Bengaluru'): RentLeaseNotification[] {
  const city = cityName.trim() || 'Bengaluru';
  const localities = [
    'Central Palm Enclave',
    'Greenfield Boulevard',
    'Lake View Promenade',
    'Hills Signature Enclave',
    'Cybertech Corridor',
    'Old Heritage Quarter',
    'Golf Links Residence',
    'Riverside Sanctuary'
  ];

  const types: ('Apartment' | 'Villa' | 'Penthouse' | 'Row House')[] = ['Villa', 'Apartment', 'Penthouse', 'Row House'];
  const images = [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'
  ];

  const generated: RentLeaseNotification[] = localities.map((loc, idx) => {
    const isVilla = idx % 2 === 0;
    const rent = 55000 + (idx * 22000);
    const deposit = Math.round((rent * 3) / 10000) / 10;

    return {
      id: `rent-auto-${idx + 1}`,
      title: `${isVilla ? 'The Sovereign Villa' : 'Skyline Luxury Residence'} ${idx + 1}`,
      propertyType: types[idx % types.length],
      locality: `${loc}`,
      city: city,
      rentAmount: `₹${rent.toLocaleString('en-IN')} / mo`,
      depositAmount: `₹${deposit} Lakhs`,
      bhk: `${(idx % 3) + 3} BHK Luxury`,
      areaSqFt: 2200 + (idx * 350),
      furnished: idx % 3 === 0 ? 'Semi-Furnished' : 'Fully Furnished',
      isNew: idx < 4,
      postedAt: `${(idx + 1) * 15} mins ago`,
      tag: idx % 2 === 0 ? 'Verified Owner' : 'Direct Lease',
      imageUrl: images[idx % images.length]
    };
  });

  return [...SAMPLE_RENT_LEASE_NOTIFICATIONS.filter(s => s.city.toLowerCase() === city.toLowerCase()), ...generated];
}

