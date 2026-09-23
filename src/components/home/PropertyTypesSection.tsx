import React from 'react';
import { ArrowRight, Layers } from 'lucide-react';

interface PropertyTypesSectionProps {
  onNavigate: (view: string, category?: string) => void;
}

export const PropertyTypesSection: React.FC<PropertyTypesSectionProps> = ({ onNavigate }) => {
  const types = [
    {
      name: 'Luxury Apartments',
      type: 'Apartment',
      desc: 'Skyline penthouses, high-floor duplexes, and serviced high-rise suites.',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Independent Villas',
      type: 'Villa',
      desc: 'Private gated villas with landscaped courtyards, private pools, and gardens.',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Independent Houses',
      type: 'House',
      desc: 'Standalone family residences and heritage townhouses with private land rights.',
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Gated Plots',
      type: 'Plot',
      desc: 'Clear-title residential plots in certified luxury communities ready for construction.',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Agricultural & Land',
      type: 'Land',
      desc: 'Expansive farm land, agricultural holdings, and retreat parcels.',
      image: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Commercial Estates',
      type: 'Commercial',
      desc: 'Grade-A tech parks, flagship institutional developments, and warehousing.',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Corporate Offices',
      type: 'Office',
      desc: 'Plug-and-play executive suites and enterprise workspaces in prime CBDs.',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Retail & Showrooms',
      type: 'Shop',
      desc: 'High-visibility storefronts, luxury boutiques, and high-street shopping fronts.',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <section style={{
      padding: '7rem 1.5rem',
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            <Layers size={15} />
            <span>Classification</span>
          </div>

          <h2 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}>
            Find the right kind of place.
          </h2>

          <p className="editorial-sub" style={{ maxWidth: '600px', margin: '0.75rem auto 0' }}>
            Explore properties tailored specifically to your residential lifestyle, business expansion, or land banking goals.
          </p>
        </div>

        {/* 8 Category Visual Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.75rem'
        }}>
          {types.map(item => (
            <div
              key={item.type}
              onClick={() => onNavigate('properties', item.type)}
              className="capability-card"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ position: 'relative', height: '190px', overflow: 'hidden' }}>
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1.0)')}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)'
                }} />
                <span style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '14px',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  letterSpacing: '-0.01em'
                }}>
                  {item.name}
                </span>
              </div>

              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {item.desc}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'var(--gold-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.75rem'
                }}>
                  <span>Explore listings</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
