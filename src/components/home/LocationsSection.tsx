import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import type { LocationStat } from '../../hooks/useLandingData';

interface LocationsSectionProps {
  locations: LocationStat[];
  onNavigate: (view: string, location?: string) => void;
}

export const LocationsSection: React.FC<LocationsSectionProps> = ({ locations, onNavigate }) => {
  return (
    <section style={{
      padding: '7rem 1.5rem',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container">
        {/* Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '3.5rem'
        }}>
          <div>
            <div className="section-eyebrow">
              <MapPin size={15} />
              <span>Metropolitan Hubs</span>
            </div>
            <h2 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}>
              Explore places.
            </h2>
            <p className="editorial-sub" style={{ marginTop: '0.5rem', maxWidth: '540px' }}>
              Discover coveted micro-markets, prime waterfront stretches, and golf course residences across India's premier metropolitan regions.
            </p>
          </div>

          <button
            onClick={() => onNavigate('locations')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--gold-primary)',
              fontWeight: 700,
              fontSize: '0.95rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <span>All City Circle Rates</span>
            <ArrowRight size={17} />
          </button>
        </div>

        {/* 10 Cities Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.75rem'
        }}>
          {locations.map(loc => (
            <div
              key={loc.city}
              onClick={() => onNavigate('properties', loc.city)}
              className="capability-card"
              style={{
                position: 'relative',
                height: '320px',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                cursor: 'pointer',
                backgroundColor: 'var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <img
                src={loc.image}
                alt={`${loc.city} Real Estate`}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1.0)')}
              />

              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.85) 100%)'
              }} />

              {/* Top Count Pill */}
              <div style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(7, 7, 9, 0.75)',
                backdropFilter: 'blur(8px)',
                color: 'var(--gold-primary)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {loc.count > 0 ? `${loc.count} Verified Estates` : 'Active Hub'}
              </div>

              {/* Bottom Content */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '1.5rem',
                color: '#FFFFFF'
              }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)', marginBottom: '0.2rem' }}>
                  {loc.state}
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem', color: '#FFFFFF' }}>
                  {loc.city}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, marginBottom: '0.85rem' }}>
                  {loc.description}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--gold-primary)'
                }}>
                  <span>Discover residences</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
