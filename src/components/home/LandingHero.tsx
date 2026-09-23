import React, { useState, useEffect } from 'react';
import { Search, Sparkles, MapPin, Building, ChevronRight, ArrowRight } from 'lucide-react';
import type { PropertyDocument } from '../../types/firebaseModels';

interface LandingHeroProps {
  onNavigate: (view: string, location?: string) => void;
  onSearch: (query: string, location?: string) => void;
  featuredProperty?: PropertyDocument | null;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onNavigate,
  onSearch,
  featuredProperty
}) => {
  const [activeTab, setActiveTab] = useState<'Buy' | 'Rent' | 'Lease'>('Buy');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [scrollY, setScrollY] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(propertyType || activeTab, searchLocation);
    onNavigate('properties', searchLocation);
  };

  // Preview card defaults
  const previewTitle = featuredProperty?.title || 'The Grand Palm Villa';
  const previewLocation = featuredProperty?.city
    ? `${featuredProperty.locality || 'Poes Garden'}, ${featuredProperty.city}`
    : 'Poes Garden, Chennai';
  const previewPrice = featuredProperty?.price
    ? (featuredProperty.price >= 10000000
        ? `₹${(featuredProperty.price / 10000000).toFixed(2)} Cr`
        : `₹${(featuredProperty.price / 100000).toFixed(2)} Lakh`)
    : '₹1.85 Cr';
  const previewBhk = featuredProperty?.specifications?.bedrooms
    ? `${featuredProperty.specifications.bedrooms} BHK`
    : '4 BHK';
  const previewSqFt = featuredProperty?.specifications?.areaSqFt
    ? `${featuredProperty.specifications.areaSqFt.toLocaleString()} sq.ft`
    : '2,850 sq.ft';
  const previewImage = featuredProperty?.images?.[0] ||
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80';
  const previewId = featuredProperty?.propertyId || 'prop-chennai-villa-1';

  return (
    <section className="landing-hero">
      {/* Background Architectural Real-Estate Photograph with subtle parallax */}
      <img
        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
        alt="LOKHA Contemporary Luxury Architectural Residence"
        className="landing-hero-bg"
        style={{
          transform: `translateY(${scrollY * 0.15}px) scale(1.03)`
        }}
      />
      <div className="landing-hero-overlay" />

      {/* Floating Property Preview Card */}
      <div
        className="floating-preview-card"
        onClick={() => onNavigate(`property-${previewId}`)}
        style={{ cursor: 'pointer' }}
      >
        <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <img
            src={previewImage}
            alt={previewTitle}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(7, 7, 9, 0.75)',
            backdropFilter: 'blur(8px)',
            color: '#D4AF37',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.04em'
          }}>
            Featured Residence
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.2rem' }}>
            {previewTitle}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.45rem' }}>
            <MapPin size={13} color="var(--gold-primary)" />
            <span>{previewLocation}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.45rem' }}>
            <div>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                {previewPrice}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: '0.4rem' }}>
                {previewBhk} • {previewSqFt}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              View <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* Main Hero Typography & Search */}
      <div className="hero-content">
        <div style={{ maxWidth: '820px' }}>
          {/* Subtle Eyebrow Badge */}
          <div className="section-eyebrow">
            <Sparkles size={15} />
            <span>A smarter way to find where you belong</span>
          </div>

          {/* Large Editorial Headline */}
          <h1 className="editorial-title" style={{
            fontSize: 'clamp(2.6rem, 5.5vw, 4.4rem)',
            color: 'var(--text-primary)',
            marginBottom: '1.25rem',
            maxWidth: '780px'
          }}>
            Find a place<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--gold-primary) 0%, #A07408 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              that feels like yours.
            </span>
          </h1>

          <p className="editorial-sub" style={{ maxWidth: '640px', marginBottom: '2.5rem' }}>
            Discover homes, apartments, land and commercial spaces through a smarter real-estate experience built for the way people search today.
          </p>

          {/* Dual Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
            <button
              onClick={() => onNavigate('properties')}
              style={{
                padding: '0.85rem 2rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--gold-primary)',
                color: '#070709',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: 'var(--shadow-md)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>Explore Properties</span>
              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => onNavigate('list-property')}
              style={{
                padding: '0.85rem 1.85rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.95rem',
                border: '1px solid var(--border-medium)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s, border-color 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--gold-primary)';
                e.currentTarget.style.color = 'var(--gold-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-medium)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <span>List Your Property</span>
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        {/* Hero Search Component */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.25rem',
          maxWidth: '960px'
        }}>
          {/* Search Tabs: Buy | Rent | Lease */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.15rem' }}>
            {(['Buy', 'Rent', 'Lease'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.45rem 1.25rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === tab ? 700 : 500,
                  backgroundColor: activeTab === tab ? 'var(--gold-primary)' : 'transparent',
                  color: activeTab === tab ? '#070709' : 'var(--text-secondary)',
                  border: activeTab === tab ? 'none' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Form Inputs Grid */}
          <form onSubmit={handleSearchSubmit} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto',
            gap: '0.85rem',
            alignItems: 'center'
          }}>
            {/* Location Input */}
            <div style={{ position: 'relative' }}>
              <MapPin size={16} color="var(--gold-primary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchLocation}
                onChange={e => setSearchLocation(e.target.value)}
                placeholder="Search city, locality or project..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Property Type Dropdown */}
            <div style={{ position: 'relative' }}>
              <Building size={16} color="var(--gold-primary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <select
                value={propertyType}
                onChange={e => setPropertyType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Property Types</option>
                <option value="Apartment">Luxury Apartment</option>
                <option value="Villa">Independent Villa</option>
                <option value="Penthouse">Sky Penthouse</option>
                <option value="Plot">Gated Plot / Land</option>
                <option value="Commercial">Commercial & Office</option>
              </select>
            </div>

            {/* Budget Dropdown */}
            <div>
              <select
                value={budget}
                onChange={e => setBudget(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <option value="">Any Budget</option>
                <option value="under-1cr">Under ₹1 Cr</option>
                <option value="1cr-3cr">₹1 Cr - ₹3 Cr</option>
                <option value="3cr-7cr">₹3 Cr - ₹7 Cr</option>
                <option value="7cr-15cr">₹7 Cr - ₹15 Cr</option>
                <option value="15cr-plus">₹15 Cr+</option>
              </select>
            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              style={{
                height: '46px',
                padding: '0 1.6rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--gold-primary)',
                color: '#070709',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Search size={17} />
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
