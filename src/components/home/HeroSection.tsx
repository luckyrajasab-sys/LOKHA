import React, { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, ShieldCheck, Sparkles } from 'lucide-react';
import { PROPERTY_CATEGORIES, ACCOMMODATION_CATEGORIES } from '../../config/constants';

interface HeroSectionProps {
  onSearch: (params: any) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [activeTab, setActiveTab] = useState<'Buy' | 'Rent' | 'Lease' | 'Stay'>('Buy');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('All Types');
  const [budgetMax, setBudgetMax] = useState('Any Budget');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced filters
  const [bedrooms, setBedrooms] = useState('Any');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const handleTriggerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      tab: activeTab,
      location,
      category: category === 'All Types' ? '' : category,
      budget: budgetMax,
      bedrooms,
      verifiedOnly
    });
  };

  const categoriesToDisplay = activeTab === 'Stay' ? ACCOMMODATION_CATEGORIES : PROPERTY_CATEGORIES;

  return (
    <section style={{
      position: 'relative',
      padding: '4rem 0 6rem',
      backgroundColor: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(ellipse at 50% 10%, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
      overflow: 'hidden'
    }}>
      <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Subtle pill badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.45rem 1rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--gold-subtle)',
          border: '1px solid var(--border-gold)',
          color: 'var(--gold-primary)',
          fontSize: '0.8125rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          marginBottom: '1.5rem',
          animation: 'fadeIn 0.5s ease'
        }}>
          <Sparkles size={15} />
          GLOBAL REAL ESTATE & HOSPITALITY MARKETPLACE
        </div>

        {/* Hero Title */}
        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          maxWidth: '850px',
          margin: '0 auto 1.25rem'
        }}>
          Find your place.{' '}
          <span style={{
            color: 'var(--gold-primary)',
            display: 'inline-block'
          }}>
            Buy. Rent. Lease. Stay.
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--text-secondary)',
          maxWidth: '640px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6
        }}>
          Discover luxury penthouses, verified developer projects, prime commercial estates, and boutique stays across the world's most coveted destinations.
        </p>

        {/* Search Experience Wrapper */}
        <div style={{
          maxWidth: '920px',
          margin: '0 auto',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.25rem',
          textAlign: 'left'
        }}>
          {/* Tabs: Buy, Rent, Lease, Stay */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '0.85rem',
            marginBottom: '1.25rem',
            overflowX: 'auto'
          }}>
            {(['Buy', 'Rent', 'Lease', 'Stay'] as const).map(tab => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setCategory('All Types');
                  }}
                  style={{
                    padding: '0.6rem 1.4rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    backgroundColor: isActive ? 'var(--gold-primary)' : 'transparent',
                    color: isActive ? 'var(--gold-text)' : 'var(--text-secondary)',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer'
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Primary Search Controls Grid */}
          <form onSubmit={handleTriggerSearch}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              alignItems: 'flex-end'
            }}>
              {/* Where input */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Where?</label>
                <div className="input-with-icon">
                  <MapPin className="input-icon-left" size={18} />
                  <input
                    type="text"
                    className="form-input has-left-icon"
                    placeholder="e.g. Chennai, Dubai, London"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* Category / Stay Type */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{activeTab === 'Stay' ? 'Stay Type' : 'Property Type'}</label>
                <select
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="All Types">All {activeTab === 'Stay' ? 'Accommodations' : 'Categories'}</option>
                  {categoriesToDisplay.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Budget Filter */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Budget Range</label>
                <select
                  className="form-input"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                >
                  <option value="Any Budget">Any Budget</option>
                  <option value="under_50l">Under ₹ 50 Lakhs</option>
                  <option value="50l_to_1cr">₹ 50 Lakhs - ₹ 1 Crore</option>
                  <option value="1cr_to_3cr">₹ 1 Crore - ₹ 3 Crores</option>
                  <option value="3cr_to_10cr">₹ 3 Crores - ₹ 10 Crores</option>
                  <option value="above_10cr">₹ 10 Crores+ Luxury</option>
                </select>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  style={{ height: '46px' }}
                >
                  <Search size={18} />
                  Search
                </button>
              </div>
            </div>

            {/* Progressive Disclosure Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.8125rem'
            }}>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="btn-ghost"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: 0,
                  color: 'var(--gold-primary)',
                  fontWeight: 600
                }}
              >
                <SlidersHorizontal size={14} />
                {showAdvanced ? 'Hide Advanced Filters' : 'More Filters (Bedrooms, Verified Only)'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-tertiary)' }}>
                <ShieldCheck size={14} color="var(--gold-primary)" />
                Over 12,000+ Verified Global Estates
              </div>
            </div>

            {/* Advanced Filters Drawer */}
            {showAdvanced && (
              <div style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                animation: 'modalIn 180ms ease forwards'
              }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Bedrooms</label>
                  <select
                    className="form-input"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                  >
                    <option value="Any">Any BHK</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4+">4+ BHK / Penthouses</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '1.4rem' }}>
                  <input
                    type="checkbox"
                    id="verifiedCheck"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    style={{ accentColor: 'var(--gold-primary)', width: '18px', height: '18px' }}
                  />
                  <label htmlFor="verifiedCheck" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Show Certified Verified Listings Only
                  </label>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};
