import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  Heart,
  Sparkles,
  Building,
  ArrowRight
} from 'lucide-react';
import type { PropertyDocument } from '../types/firebaseModels';
import { getProperties } from '../services/propertyService';
import { toggleFavorite } from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

interface BuyPageProps {
  onNavigate: (view: string, location?: string) => void;
  onSelectProperty?: (property: PropertyDocument) => void;
}

export const BuyPage: React.FC<BuyPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [properties, setProperties] = useState<PropertyDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedBhk, setSelectedBhk] = useState<string>('All');
  const [maxPrice, _setMaxPrice] = useState<number>(500000000); // Up to 50 Cr
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'area'>('featured');

  // Favorites tracking
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const cities = ['All', 'Chennai', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'Delhi NCR', 'Goa'];
  const propertyTypes = ['All', 'Villa', 'Apartment', 'Penthouse', 'Plot / Land', 'Duplex'];
  const bhkOptions = ['All', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchData() {
      try {
        const results = await getProperties({
          listingType: 'Sale',
          city: selectedCity === 'All' ? undefined : selectedCity,
          propertyType: selectedType === 'All' ? undefined : selectedType,
          verifiedOnly: verifiedOnly
        });

        if (isMounted) {
          setProperties(results);
        }
      } catch (err) {
        console.error('Error fetching buy properties:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedCity, selectedType, verifiedOnly]);

  const handleToggleFavorite = async (e: React.MouseEvent, property: PropertyDocument) => {
    e.stopPropagation();
    if (!user) {
      showToast('Sign in to save estates to your personal portfolio', 'info');
      onNavigate('login');
      return;
    }
    try {
      const nowSaved = await toggleFavorite(user.id, property);
      setSavedIds(prev => {
        const next = new Set(prev);
        if (nowSaved) next.add(property.propertyId);
        else next.delete(property.propertyId);
        return next;
      });
      showToast(nowSaved ? 'Added to private portfolio' : 'Removed from portfolio', 'success');
    } catch {
      showToast('Failed to update portfolio', 'error');
    }
  };

  const formatPrice = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  // Filter & Sort properties
  const filteredProperties = properties
    .filter(p => {
      // Free text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchCity = p.location?.city?.toLowerCase().includes(q);
        const matchAddr = p.location?.address?.toLowerCase().includes(q);
        if (!matchTitle && !matchCity && !matchAddr) return false;
      }
      // Price ceiling
      if (p.price && p.price > maxPrice) return false;
      // BHK filter
      if (selectedBhk !== 'All') {
        const bhkNum = parseInt(selectedBhk);
        if (selectedBhk === '5+ BHK') {
          if ((p.specifications?.bedrooms || 0) < 5) return false;
        } else if (p.specifications?.bedrooms !== bhkNum) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'area') return (b.specifications?.areaSqFt || 0) - (a.specifications?.areaSqFt || 0);
      return (b.viewsCount || 0) - (a.viewsCount || 0);
    });

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary, #070709)',
      color: 'var(--text-primary, #FFFFFF)',
      minHeight: '100vh',
      paddingBottom: '5rem'
    }}>
      {/* 1. Buy Hero Banner */}
      <div style={{
        position: 'relative',
        padding: '3.5rem 1.5rem 2.5rem',
        background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.95rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--gold-subtle)',
            border: '1px solid var(--border-gold)',
            fontSize: '0.8rem',
            color: 'var(--gold-primary)',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            <Sparkles size={14} /> Exclusive Freehold Real Estate Portfolio
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '0.85rem',
            color: 'var(--text-primary)'
          }}>
            Buy Verified Luxury Homes & Penthouses
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '640px',
            margin: '0 auto 2rem'
          }}>
            Explore freehold residences, sea-facing villas, and architectural penthouses across premium metropolises. Complete title clearance and RERA escrow compliance certified.
          </p>

          {/* Quick Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-medium)',
            padding: '0.4rem 0.6rem 0.4rem 1.25rem',
            maxWidth: '680px',
            margin: '0 auto',
            boxShadow: 'var(--shadow-md)'
          }}>
            <Search size={18} color="var(--gold-primary)" style={{ flexShrink: 0, marginRight: '0.65rem' }} />
            <input
              type="text"
              placeholder="Search by community, locality, landmark (e.g. Boat Club, Indiranagar, Worli)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.8rem'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '2rem 1.25rem' }}>
        {/* 2. Interactive Filter Bar */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl, 14px)',
          border: '1px solid var(--border-subtle)',
          padding: '1.25rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* City Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginRight: '0.25rem', whiteSpace: 'nowrap' }}>
              City:
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
                  backgroundColor: selectedCity === city ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedCity === city ? '#070709' : 'var(--text-secondary)',
                  border: `1px solid ${selectedCity === city ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                  transition: 'all 0.2s'
                }}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Secondary Controls Row */}
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
              {/* Property Type Dropdown */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#161622',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem'
                }}
              >
                {propertyTypes.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
              </select>

              {/* BHK Dropdown */}
              <select
                value={selectedBhk}
                onChange={(e) => setSelectedBhk(e.target.value)}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#161622',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem'
                }}
              >
                {bhkOptions.map(b => <option key={b} value={b}>{b === 'All' ? 'Any Bedrooms' : b}</option>)}
              </select>

              {/* Verified Filter Toggle */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.85rem',
                color: verifiedOnly ? '#22C55E' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600
              }}>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  style={{ accentColor: '#22C55E' }}
                />
                <ShieldCheck size={16} /> RERA & EB Verified Only
              </label>
            </div>

            {/* Sort By Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#161622',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: 'var(--gold-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                <option value="featured">Most Popular / Views</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="area">Area: Largest Sqft</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Results Count Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          <div>
            Showing <strong style={{ color: 'var(--gold-primary)' }}>{filteredProperties.length}</strong> exclusive freehold estates for purchase
            {selectedCity !== 'All' && ` in ${selectedCity}`}
          </div>

          <button
            onClick={() => onNavigate('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'none',
              border: 'none',
              color: 'var(--gold-primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <MapPin size={15} /> Switch to Map View →
          </button>
        </div>

        {/* 4. Properties Grid */}
        {loading ? (
          <div style={{
            minHeight: '40vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(212, 175, 55, 0.2)',
              borderTopColor: 'var(--gold-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: '#0F0F16',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <Building size={48} color="var(--gold-primary)" style={{ marginBottom: '1rem', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Listings Found</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
              We could not find properties matching your current filter criteria. Try expanding your search location or clearing filters.
            </p>
            <button
              onClick={() => {
                setSelectedCity('All');
                setSelectedType('All');
                setSelectedBhk('All');
                setSearchQuery('');
                setVerifiedOnly(false);
              }}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--gold-primary)',
                color: '#070709',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.75rem'
          }}>
            {filteredProperties.map((prop) => {
              const isSaved = savedIds.has(prop.propertyId);
              const img = prop.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';
              const price = prop.price || 12500000;
              const sqft = prop.specifications?.areaSqFt || 2200;

              return (
                <div
                  key={prop.propertyId}
                  onClick={() => onNavigate(`property-${prop.propertyId}`)}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl, 16px)',
                    border: '1px solid var(--border-subtle)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'var(--border-gold)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  {/* Card Visual Header */}
                  <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                    <img
                      src={img}
                      alt={prop.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Top Badges */}
                    <div style={{
                      position: 'absolute',
                      top: '0.85rem',
                      left: '0.85rem',
                      display: 'flex',
                      gap: '0.4rem',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'rgba(7, 7, 9, 0.85)',
                        backdropFilter: 'blur(4px)',
                        color: 'var(--gold-primary)',
                        border: '1px solid rgba(212, 175, 55, 0.3)'
                      }}>
                        {prop.propertyType || 'Villa'}
                      </span>

                      {prop.verificationStatus === 'verified' && (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'rgba(34, 197, 94, 0.85)',
                          backdropFilter: 'blur(4px)',
                          color: '#FFFFFF'
                        }}>
                          <ShieldCheck size={11} /> Verified
                        </span>
                      )}
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={(e) => handleToggleFavorite(e, prop)}
                      style={{
                        position: 'absolute',
                        top: '0.85rem',
                        right: '0.85rem',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(7, 7, 9, 0.75)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: isSaved ? '#EF4444' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                      }}
                      title="Save to private portfolio"
                    >
                      <Heart size={16} fill={isSaved ? '#EF4444' : 'none'} />
                    </button>

                    {/* Price Ribbon */}
                    <div style={{
                      position: 'absolute',
                      bottom: '0.85rem',
                      left: '0.85rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(7, 7, 9, 0.85)',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: 'var(--gold-primary)',
                      fontSize: '1.15rem',
                      fontWeight: 900
                    }}>
                      {formatPrice(price)}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      marginBottom: '0.4rem',
                      color: 'var(--text-primary)',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {prop.title}
                    </h3>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.825rem',
                      marginBottom: '1rem'
                    }}>
                      <MapPin size={14} color="var(--gold-primary)" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prop.location?.address ? `${prop.location.address}, ${prop.location.city}` : prop.location?.city || 'India'}
                      </span>
                    </div>

                    {/* Specs Row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      marginTop: 'auto',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Bed size={15} color="var(--gold-primary)" /> {prop.specifications?.bedrooms || 3} BHK
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Bath size={15} color="var(--gold-primary)" /> {prop.specifications?.bathrooms || 3} Baths
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Maximize2 size={15} color="var(--gold-primary)" /> {sqft.toLocaleString()} sqft
                      </span>
                    </div>

                    {/* Action button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        ₹{Math.round(price / sqft).toLocaleString()}/sqft
                      </span>

                      <span style={{
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        color: 'var(--gold-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        Explore Residence <ArrowRight size={14} />
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
