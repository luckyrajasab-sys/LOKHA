import React, { useState, useEffect } from 'react';
import type { PropertyDocument } from '../../types/firebaseModels';
import type { AccommodationListing } from '../../types/accommodation';
import { Heart, MapPin, Bed, Bath, Maximize2, Star, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { subscribeToProperties, subscribeToUserFavoriteIds } from '../../firebase/realtime';
import { addFavorite, removeFavorite } from '../../firebase/firestore';

export const SAMPLE_STAYS: AccommodationListing[] = [
  {
    id: 'stay_1',
    name: 'The Heritage Palace & Spa',
    category: 'Hotel',
    description: 'Restored royal palace with traditional Rajasthani courtyards and private dining.',
    location: 'Udaipur, Rajasthan',
    city: 'Udaipur',
    country: 'India',
    coordinates: { latitude: 24.5854, longitude: 73.7125 },
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Spa', 'Infinity Pool', 'Fine Dining', 'Lake View'],
    rating: 4.95,
    reviewsCount: 348,
    startingPrice: 28000,
    currency: 'INR',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    cancellationPolicy: 'Free cancellation up to 48 hours prior',
    houseRules: ['No smoking indoors'],
    host: { id: 'h1', name: 'Royal Heritage Trust', isSuperHost: true },
    verified: true
  },
  {
    id: 'stay_2',
    name: 'Aura Luxury Co-Living & Executive Suites',
    category: 'PG',
    description: 'All-inclusive premium executive suites tailored for tech founders and professionals.',
    location: 'Indiranagar 100ft Road, Bangalore',
    city: 'Bangalore',
    country: 'India',
    coordinates: { latitude: 12.9784, longitude: 77.6408 },
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['High-Speed WiFi', 'Housekeeping', 'Chef Prepared Meals', 'Gym'],
    rating: 4.88,
    reviewsCount: 194,
    startingPrice: 32000, // Monthly
    currency: 'INR',
    checkInTime: '10:00',
    checkOutTime: '18:00',
    cancellationPolicy: 'Flexible monthly commitments',
    houseRules: ['Quiet hours after 10 PM'],
    host: { id: 'h2', name: 'Aura Living', isSuperHost: true },
    verified: true
  },
  {
    id: 'stay_3',
    name: 'Casa Sol Coastal Villa',
    category: 'Villa',
    description: 'Private 4-bedroom Portuguese villa nestled among palm groves with private chef.',
    location: 'Candolim, Goa',
    city: 'Goa',
    country: 'India',
    coordinates: { latitude: 15.5186, longitude: 73.7628 },
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Private Pool', 'Chef on Call', 'Beach Access 500m', 'BBQ Grill'],
    rating: 4.92,
    reviewsCount: 112,
    startingPrice: 36000,
    currency: 'INR',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    cancellationPolicy: 'Moderate cancellation policy',
    houseRules: ['Pet friendly'],
    host: { id: 'h3', name: 'Candolim Estates', isSuperHost: true },
    verified: true
  }
];

export const FeaturedSection: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [properties, setProperties] = useState<PropertyDocument[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time Firestore subscription to featured/available properties
  useEffect(() => {
    const unsubProperties = subscribeToProperties(
      { status: 'available' },
      (liveProps) => {
        // Show featured first, or top 3 available
        const featured = liveProps.filter(p => p.isFeatured);
        setProperties(featured.length > 0 ? featured.slice(0, 6) : liveProps.slice(0, 6));
        setLoading(false);
      },
      (err) => {
        console.warn('Realtime featured properties listener notice:', err);
        setLoading(false);
      }
    );

    return () => unsubProperties();
  }, []);

  // Real-time subscription to user's favorites from users/{uid}/favorites
  useEffect(() => {
    if (!user) {
      setSavedIds([]);
      return;
    }

    const unsubFavs = subscribeToUserFavoriteIds(user.id, (ids) => {
      setSavedIds(ids);
    });

    return () => unsubFavs();
  }, [user]);

  const toggleSave = async (id: string, title: string) => {
    if (!user) {
      showToast('Please sign in to save this property to your account.', 'info');
      return;
    }

    try {
      const isSaved = savedIds.includes(id);
      if (isSaved) {
        await removeFavorite(user.id, id);
        showToast(`Removed "${title}" from saved properties.`, 'info');
      } else {
        await addFavorite(user.id, id);
        showToast(`Saved "${title}" to your private portfolio!`, 'success');
      }
    } catch (err) {
      console.error('Failed to update favorite:', err);
      showToast('Failed to update saved property.', 'error');
    }
  };

  const formatPrice = (val: number, isRent?: boolean) => {
    if (isRent) return `₹ ${(val / 100000).toFixed(2)} Lakhs/mo`;
    if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹ ${(val / 100000).toFixed(0)} Lakhs`;
    return `₹ ${val.toLocaleString()}`;
  };

  return (
    <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Featured Properties Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{
              color: 'var(--gold-primary)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.4rem'
            }}>
              Curated Masterpieces
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Featured Real Estate
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Handpicked residences with verified titles and architectural distinction.
            </p>
          </div>

          <a href="/properties" className="btn btn-outline" style={{ textDecoration: 'none' }}>
            View All Properties
            <ArrowRight size={16} />
          </a>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 0', gap: '0.75rem', color: 'var(--text-tertiary)' }}>
            <div className="spinner" style={{ width: '24px', height: '24px' }} />
            <span>Loading live residences from Cloud Firestore...</span>
          </div>
        ) : properties.length === 0 ? (
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '5rem'
          }}>
            <Sparkles size={40} color="var(--gold-primary)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              No Featured Properties Yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
              New luxury properties added to Firestore will appear here in real time.
            </p>
            <a href="/properties" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Explore All Listings
            </a>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            marginBottom: '5rem'
          }}>
            {properties.map(prop => {
              const isSaved = savedIds.includes(prop.propertyId);
              const isRent = prop.listingType === 'Rent';
              const displayPrice = isRent ? (prop.rentAmount || prop.price) : prop.price;
              const coverImage = prop.images?.[0] || 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80';

              return (
                <div key={prop.propertyId} className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                    <img
                      src={coverImage}
                      alt={prop.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform var(--transition-slow)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />

                    {/* Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(0,0,0,0.75)',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--gold-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {prop.propertyType} • {prop.listingType}
                    </div>

                    {/* Save button */}
                    <button
                      onClick={() => toggleSave(prop.propertyId, prop.title)}
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        width: '2.25rem',
                        height: '2.25rem',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.65)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSaved ? 'var(--gold-primary)' : '#FFFFFF',
                        cursor: 'pointer',
                        border: 'none'
                      }}
                      aria-label="Save property"
                    >
                      <Heart size={16} fill={isSaved ? 'var(--gold-primary)' : 'none'} />
                    </button>
                  </div>

                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-tertiary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                      <MapPin size={14} color="var(--gold-primary)" />
                      {prop.address ? `${prop.address}, ` : ''}{prop.city}
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                      {prop.title}
                    </h3>

                    {/* Specs */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      padding: '0.75rem 0',
                      borderTop: '1px solid var(--border-subtle)',
                      borderBottom: '1px solid var(--border-subtle)',
                      margin: '0.75rem 0 1.25rem',
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {prop.bedrooms > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Bed size={15} color="var(--gold-primary)" />
                          {prop.bedrooms} Beds
                        </div>
                      )}
                      {prop.bathrooms > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Bath size={15} color="var(--gold-primary)" />
                          {prop.bathrooms} Baths
                        </div>
                      )}
                      {prop.area > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Maximize2 size={15} color="var(--gold-primary)" />
                          {prop.area} {prop.areaUnit}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                          Price
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                          {formatPrice(displayPrice, isRent)}
                        </div>
                      </div>

                      <a href="/properties" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                        Details
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Accommodation / Stays Heading */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{
              color: 'var(--gold-primary)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.4rem'
            }}>
              Global Hospitality
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Hotels, Villas & Co-Living
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Flexible stays from royal heritage suites to executive co-living spaces.
            </p>
          </div>

          <button className="btn btn-outline">
            Browse All Stays
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Stays Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          {SAMPLE_STAYS.map(stay => (
            <div key={stay.id} className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                <img
                  src={stay.images[0]}
                  alt={stay.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(0,0,0,0.75)',
                  backdropFilter: 'blur(8px)',
                  color: 'var(--gold-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {stay.category}
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  <Star size={13} fill="#F59E0B" color="#F59E0B" />
                  <span>{stay.rating}</span>
                  <span style={{ color: 'var(--text-tertiary)' }}>({stay.reviewsCount})</span>
                </div>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.35rem' }}>
                  {stay.location}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {stay.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {stay.description}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      {stay.category === 'PG' ? 'Monthly' : 'Per Night'}
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                      ₹ {stay.startingPrice.toLocaleString()}
                    </div>
                  </div>

                  <button className="btn btn-primary btn-sm">
                    Check Dates
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
