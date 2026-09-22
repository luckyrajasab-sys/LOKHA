import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Heart,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import type { PropertyDocument } from '../types/firebaseModels';
import { getProperties } from '../services/propertyService';
import { toggleFavorite } from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

interface RentPageProps {
  onNavigate: (view: string, location?: string) => void;
}

export const RentPage: React.FC<RentPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [properties, setProperties] = useState<PropertyDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [furnishing, setFurnishing] = useState<string>('All');
  const [bhk, setBhk] = useState<string>('All');
  const [maxRent, setMaxRent] = useState<number>(500000); // 5L/month ceiling
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const cities = ['All', 'Bengaluru', 'Chennai', 'Mumbai', 'Hyderabad', 'Pune', 'Goa'];
  const furnishingOptions = ['All', 'Fully Furnished', 'Semi-Furnished', 'Unfurnished'];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchData() {
      try {
        const results = await getProperties({
          listingType: 'Rent',
          city: selectedCity === 'All' ? undefined : selectedCity
        });

        if (isMounted) {
          setProperties(results);
        }
      } catch (err) {
        console.error('Failed to fetch rental listings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  const handleToggleSave = async (e: React.MouseEvent, prop: PropertyDocument) => {
    e.stopPropagation();
    if (!user) {
      showToast('Sign in to bookmark rental properties', 'info');
      onNavigate('login');
      return;
    }
    try {
      const nowSaved = await toggleFavorite(user.id, prop);
      setSavedIds(prev => {
        const next = new Set(prev);
        if (nowSaved) next.add(prop.propertyId);
        else next.delete(prop.propertyId);
        return next;
      });
      showToast(nowSaved ? 'Saved to bookmarks' : 'Removed from bookmarks', 'success');
    } catch {
      showToast('Could not save property', 'error');
    }
  };

  const filteredListings = properties.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCity = p.location?.city?.toLowerCase().includes(q);
      const matchAddr = p.location?.address?.toLowerCase().includes(q);
      if (!matchTitle && !matchCity && !matchAddr) return false;
    }
    const rent = p.rentAmount || Math.round((p.price || 10000000) * 0.003);
    if (rent > maxRent) return false;

    if (furnishing !== 'All' && p.specifications?.furnishing !== furnishing) return false;

    if (bhk !== 'All') {
      const bNum = parseInt(bhk);
      if (p.specifications?.bedrooms !== bNum) return false;
    }

    return true;
  });

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary, #070709)',
      color: 'var(--text-primary, #FFFFFF)',
      minHeight: '100vh',
      paddingBottom: '5rem'
    }}>
      {/* Hero Banner */}
      <div style={{
        position: 'relative',
        padding: '3.5rem 1.5rem 2.5rem',
        background: 'linear-gradient(180deg, #0A1224 0%, #070709 100%)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.95rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            fontSize: '0.8rem',
            color: '#60A5FA',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            <KeyRound size={14} /> Luxury Leases & Executive Residences
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '0.85rem',
            color: '#FFFFFF'
          }}>
            Rent Premium Homes & Penthouse Suites
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '620px',
            margin: '0 auto 2rem'
          }}>
            Curated high-specification rentals in India’s prime residential addresses with transparent security deposits, verified title owners, and frictionless digital lease execution.
          </p>

          {/* Quick Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#101726',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            padding: '0.4rem 0.6rem 0.4rem 1.25rem',
            maxWidth: '680px',
            margin: '0 auto',
            boxShadow: '0 12px 36px rgba(0,0,0,0.5)'
          }}>
            <Search size={18} color="#60A5FA" style={{ flexShrink: 0, marginRight: '0.65rem' }} />
            <input
              type="text"
              placeholder="Search localities (e.g. Koramangala, ECR Chennai, Bandra West)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '2rem 1.25rem' }}>
        {/* Filter controls */}
        <div style={{
          backgroundColor: '#0F121C',
          borderRadius: 'var(--radius-xl, 14px)',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* City Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginRight: '0.25rem', whiteSpace: 'nowrap' }}>
              Metro Hub:
            </span>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  backgroundColor: selectedCity === city ? '#3B82F6' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedCity === city ? '#FFFFFF' : 'var(--text-secondary)',
                  border: `1px solid ${selectedCity === city ? '#3B82F6' : 'rgba(255, 255, 255, 0.1)'}`,
                  transition: 'all 0.2s'
                }}
              >
                {city}
              </button>
            ))}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#161B2E',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem'
                }}
              >
                {furnishingOptions.map(f => <option key={f} value={f}>{f === 'All' ? 'Any Furnishing' : f}</option>)}
              </select>

              <select
                value={bhk}
                onChange={(e) => setBhk(e.target.value)}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#161B2E',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem'
                }}
              >
                <option value="All">All Bedrooms</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4+ BHK</option>
              </select>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  Max Rent: ₹{(maxRent / 1000).toFixed(0)}k/mo
                </span>
                <input
                  type="range"
                  min={30000}
                  max={500000}
                  step={10000}
                  value={maxRent}
                  onChange={(e) => setMaxRent(Number(e.target.value))}
                  style={{ accentColor: '#3B82F6', width: '120px' }}
                />
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Showing <strong style={{ color: '#60A5FA' }}>{filteredListings.length}</strong> rental residences
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div style={{ minHeight: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid rgba(59, 130, 246, 0.2)',
              borderTopColor: '#3B82F6',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
        ) : filteredListings.length === 0 ? (
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: '#0F121C',
            border: '1px solid rgba(59, 130, 246, 0.15)'
          }}>
            <KeyRound size={48} color="#60A5FA" style={{ marginBottom: '1rem', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Rentals Match Your Filter</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
              Try adjusting your monthly rent ceiling or choosing All cities.
            </p>
            <button
              onClick={() => {
                setSelectedCity('All');
                setFurnishing('All');
                setBhk('All');
                setMaxRent(500000);
                setSearchQuery('');
              }}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.75rem'
          }}>
            {filteredListings.map((prop) => {
              const isSaved = savedIds.has(prop.propertyId);
              const img = prop.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';
              const rent = prop.rentAmount || Math.round((prop.price || 10000000) * 0.003);
              const deposit = prop.securityDeposit || Math.round(rent * 3);

              return (
                <div
                  key={prop.propertyId}
                  onClick={() => onNavigate(`property-${prop.propertyId}`)}
                  style={{
                    backgroundColor: '#101420',
                    borderRadius: 'var(--radius-xl, 16px)',
                    border: '1px solid rgba(59, 130, 246, 0.15)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.15)';
                  }}
                >
                  <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                    <img src={img} alt={prop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    <div style={{ position: 'absolute', top: '0.85rem', left: '0.85rem', display: 'flex', gap: '0.4rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'rgba(7, 7, 9, 0.85)',
                        color: '#60A5FA',
                        border: '1px solid rgba(59, 130, 246, 0.4)'
                      }}>
                        {prop.specifications?.furnishing || 'Furnished'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleToggleSave(e, prop)}
                      style={{
                        position: 'absolute',
                        top: '0.85rem',
                        right: '0.85rem',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(7, 7, 9, 0.75)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: isSaved ? '#EF4444' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Heart size={16} fill={isSaved ? '#EF4444' : 'none'} />
                    </button>

                    <div style={{
                      position: 'absolute',
                      bottom: '0.85rem',
                      left: '0.85rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(7, 7, 9, 0.88)',
                      color: '#60A5FA',
                      fontSize: '1.15rem',
                      fontWeight: 900
                    }}>
                      ₹{(rent / 1000).toFixed(0)}k <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/ month</span>
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      marginBottom: '0.4rem',
                      color: '#FFFFFF',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {prop.title}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '1rem' }}>
                      <MapPin size={14} color="#60A5FA" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prop.location?.address ? `${prop.location.address}, ${prop.location.city}` : prop.location?.city || 'India'}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      marginTop: 'auto',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Bed size={15} color="#60A5FA" /> {prop.specifications?.bedrooms || 3} BHK
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Bath size={15} color="#60A5FA" /> {prop.specifications?.bathrooms || 3} Baths
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Maximize2 size={15} color="#60A5FA" /> {prop.specifications?.areaSqFt || 1800} sqft
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        Security Deposit: ₹{(deposit / 1000).toFixed(0)}k
                      </span>

                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        View Lease Details <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
