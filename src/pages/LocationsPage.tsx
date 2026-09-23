import React, { useState } from 'react';
import {
  ArrowRight,
  Compass
} from 'lucide-react';

interface LocationsPageProps {
  selectedCity?: string;
  onNavigate: (view: string, location?: string) => void;
}

export const LocationsPage: React.FC<LocationsPageProps> = ({ selectedCity, onNavigate }) => {
  const [activeCity, setActiveCity] = useState<string>(selectedCity || 'Chennai');

  const cityData: Record<string, {
    title: string;
    tagline: string;
    avgRate: string;
    yoyAppreciation: string;
    description: string;
    heroImage: string;
    microMarkets: { name: string; avgRate: string; highlight: string }[];
    infrastructure: string[];
  }> = {
    Chennai: {
      title: 'Chennai Luxury Real Estate',
      tagline: 'Old-Money Prestige Meets Modern Coastal Grandeur',
      avgRate: '₹14,500 – ₹32,000 / sq.ft',
      yoyAppreciation: '+9.2% YoY',
      description: 'From the generational tree-lined bungalows of Boat Club and Poes Garden to the sun-kissed oceanfront villas of East Coast Road (ECR), Chennai represents stable, high-trust luxury living with premier healthcare, educational institutions, and thriving industrial corridors.',
      heroImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
      microMarkets: [
        { name: 'Boat Club / RA Puram', avgRate: '₹28,000 – ₹42,000/sqft', highlight: 'Ultra-exclusive enclave home to captains of industry' },
        { name: 'Poes Garden', avgRate: '₹26,000 – ₹38,000/sqft', highlight: 'Political & cinematic aristocracy residences' },
        { name: 'East Coast Road (ECR)', avgRate: '₹12,000 – ₹24,000/sqft', highlight: 'Freehold beach villas & resort-style estates' },
        { name: 'Anna Nagar', avgRate: '₹15,000 – ₹22,000/sqft', highlight: 'Prime North-Central commercial & residential hub' }
      ],
      infrastructure: [
        'Chennai Metro Phase 2 connecting OMR & Boat Club corridors',
        'East Coast Road 4-lane expansion with cycling track',
        'New Green Field International Airport in Parandur',
        'Multi-Specialty Apollo & Fortis healthcare networks'
      ]
    },
    Bengaluru: {
      title: 'Bengaluru Luxury Real Estate',
      tagline: 'Silicon Valley Capital with Garden City Heritage',
      avgRate: '₹16,000 – ₹38,000 / sq.ft',
      yoyAppreciation: '+11.4% YoY',
      description: 'Bengaluru commands India’s strongest tech wealth creation, attracting international venture capital founders, CXOs, and global diaspora seeking sustainable luxury penthouses, smart automated residences, and sprawling gated villas.',
      heroImage: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
      microMarkets: [
        { name: 'Sadashivanagar', avgRate: '₹32,000 – ₹48,000/sqft', highlight: 'Billionaire enclave with heritage estates' },
        { name: 'Indiranagar', avgRate: '₹18,000 – ₹28,000/sqft', highlight: 'Vibrant cultural, culinary, and luxury boutique haven' },
        { name: 'Koramangala 3rd Block', avgRate: '₹24,000 – ₹35,000/sqft', highlight: 'India’s premier startup founder boulevard' },
        { name: 'Lavelle Road / UB City', avgRate: '₹30,000 – ₹45,000/sqft', highlight: 'Central Business District luxury sky residences' }
      ],
      infrastructure: [
        'Namma Metro Yellow & Blue Lines connecting Airport & IT hubs',
        'Satellite Town Ring Road (STRR) decongesting logistics',
        'Kempegowda International Airport Terminal 2 Global Expansion',
        'Dense ecosystem of International Baccalaureate schools'
      ]
    },
    Mumbai: {
      title: 'Mumbai Luxury Real Estate',
      tagline: 'The Maximum City of Skyline Penthouses & Ocean Vistas',
      avgRate: '₹45,000 – ₹1,20,000 / sq.ft',
      yoyAppreciation: '+8.5% YoY',
      description: 'India’s financial capital commands world-record property valuations with trophy residences overlooking the Arabian Sea, private helipads, and world-class architecture in South Mumbai and Bandra West.',
      heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
      microMarkets: [
        { name: 'Worli Sea Face', avgRate: '₹65,000 – ₹1,10,000/sqft', highlight: 'Trophy skyscraper penthouses with sea-link views' },
        { name: 'Bandra West (Pali Hill)', avgRate: '₹70,000 – ₹1,25,000/sqft', highlight: 'Entertainment icons & bohemian luxury leafy avenues' },
        { name: 'Juhu Beachfront', avgRate: '₹60,000 – ₹95,000/sqft', highlight: 'Exclusive ocean-facing bungalows and residences' },
        { name: 'Malabar Hill', avgRate: '₹80,000 – ₹1,40,000/sqft', highlight: 'Historical aristocratic wealth with panoramic harbor vistas' }
      ],
      infrastructure: [
        'Mumbai Coastal Road project dramatically cutting transit times',
        'Mumbai Trans Harbour Link (Atal Setu) opening Navi Mumbai',
        'Underground Metro Line 3 from Colaba to SEEPZ',
        'Navi Mumbai International Airport operational launch'
      ]
    },
    Hyderabad: {
      title: 'Hyderabad Luxury Real Estate',
      tagline: 'City of Pearls & Global Tech Hub Expansion',
      avgRate: '₹11,000 – ₹24,000 / sq.ft',
      yoyAppreciation: '+13.8% YoY',
      description: 'Leading India in capital growth, Hyderabad offers expansive 40,000 sq.ft villas in Jubilee Hills and futuristic smart high-rises in the Financial District with seamless 8-lane expressways.',
      heroImage: 'https://images.unsplash.com/photo-1605007493699-ce65834f8a00?auto=format&fit=crop&w=1200&q=80',
      microMarkets: [
        { name: 'Jubilee Hills', avgRate: '₹18,000 – ₹32,000/sqft', highlight: 'Elite hilltop residences and lavish private compounds' },
        { name: 'Banjara Hills', avgRate: '₹15,000 – ₹26,000/sqft', highlight: 'Prestigious royal heritage address with luxury retail' },
        { name: 'Financial District / Gachibowli', avgRate: '₹10,500 – ₹18,000/sqft', highlight: 'High-rise sky condominiums next to Microsoft & Google' }
      ],
      infrastructure: [
        'Outer Ring Road (ORR) 158 km seamless expressway ring',
        'Airport Express Metro corridor link',
        'Regional Ring Road (RRR) expansion for mega logistics',
        'Pharma City and AI City high-growth corridors'
      ]
    },
    Goa: {
      title: 'Goa Holiday Home & Villa Market',
      tagline: 'Tropical Luxury, Portuguese Heritage & High Rental Yields',
      avgRate: '₹18,000 – ₹38,000 / sq.ft',
      yoyAppreciation: '+14.5% YoY',
      description: 'The preferred playground for high-net-worth individuals and NRIs seeking Portuguese architectural heritage estates, private pool villas in Assagao, and buoyant 8-12% short-stay rental yields.',
      heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      microMarkets: [
        { name: 'Assagao Luxury Enclave', avgRate: '₹24,000 – ₹42,000/sqft', highlight: 'Culinary heart of Goa with restored heritage estates' },
        { name: 'Anjuna & Vagator Hilltop', avgRate: '₹20,000 – ₹35,000/sqft', highlight: 'Clifftop ocean view modern villas' },
        { name: 'Aldona & Moira', avgRate: '₹15,000 – ₹26,000/sqft', highlight: 'Serene backwater riverfront sanctuaries' }
      ],
      infrastructure: [
        'Manohar International Airport (MOPA) operational in North Goa',
        'New 8-lane Zuari Cable Stay Bridge',
        'High-speed coastal transit corridor improvements'
      ]
    }
  };

  const currentData = cityData[activeCity] || cityData['Chennai'];

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      paddingBottom: '5rem'
    }}>
      {/* City Switcher Bar */}
      <div style={{
        padding: '1rem 1.5rem',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        overflowX: 'auto'
      }}>
        {Object.keys(cityData).map(c => (
          <button
            key={c}
            onClick={() => setActiveCity(c)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: activeCity === c ? 'var(--gold-primary)' : 'var(--bg-secondary)',
              color: activeCity === c ? 'var(--gold-text)' : 'var(--text-secondary)',
              border: `1px solid ${activeCity === c ? 'var(--gold-primary)' : 'var(--border)'}`,
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background-color 250ms ease, color 250ms ease, border-color 250ms ease'
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Hero Visual Banner */}
      <div style={{
        position: 'relative',
        height: 'min(480px, 50vh)',
        overflow: 'hidden'
      }}>
        <img
          src={currentData.heroImage}
          alt={currentData.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(7,7,9,0.2) 0%, rgba(7,7,9,0.85) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '2.5rem 2rem'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: 'var(--gold-primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '0.75rem'
            }}>
              <Compass size={14} /> City Real Estate Market Hub
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 900, color: '#FFFFFF', marginBottom: '0.4rem' }}>
              {currentData.title}
            </h1>

            <p style={{ fontSize: '1.1rem', color: 'var(--gold-primary)', fontWeight: 600, marginBottom: '1.25rem' }}>
              {currentData.tagline}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', backgroundColor: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block' }}>Benchmark Capital Rate</span>
                <strong style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>{currentData.avgRate}</strong>
              </div>

              <div style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', backgroundColor: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block' }}>Capital Appreciation</span>
                <strong style={{ fontSize: '1.1rem', color: '#22C55E' }}>{currentData.yoyAppreciation}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.25rem' }}>
        {/* City Overview */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '2rem',
          marginBottom: '3rem',
          lineHeight: 1.8,
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-card)'
        }}>
          {currentData.description}
        </div>

        {/* Micro-markets Grid */}
        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          Top Micro-Markets in {activeCity}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3.5rem'
        }}>
          {currentData.microMarkets.map((m, i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                boxShadow: 'var(--shadow-card)',
                transition: 'background-color 250ms ease, border-color 250ms ease, box-shadow 250ms ease, transform 200ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--gold-primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</h3>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold-primary)' }}>{m.avgRate}</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{m.highlight}</p>

              <button
                onClick={() => onNavigate('properties', m.name.split('/')[0].trim())}
                style={{
                  marginTop: 'auto',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  transition: 'background-color 250ms ease, color 250ms ease, border-color 250ms ease'
                }}
              >
                Browse Listings <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Infrastructure Highlights */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '2rem',
          marginBottom: '3rem',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            Infrastructure & Growth Drivers
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {currentData.infrastructure.map((inf, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--gold-primary)', fontWeight: 800 }}>•</span>
                <span>{inf}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA to Explore City Properties */}
        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          borderRadius: '16px',
          background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Explore Verified Luxury Estates in {activeCity}
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Browse vetted villas, high-floor penthouses, and developer launches with certified title clearances.
          </p>
          <button
            onClick={() => onNavigate('properties', activeCity)}
            style={{
              padding: '0.85rem 2.25rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--gold-primary)',
              color: 'var(--gold-text)',
              fontWeight: 800,
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(198, 161, 91, 0.35)',
              transition: 'background-color 250ms ease, transform 200ms ease'
            }}
          >
            View {activeCity} Portfolio →
          </button>
        </div>
      </div>
    </div>
  );
};
