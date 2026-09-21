import React from 'react';
import type { BuilderProject } from '../../types/project';
import { ShieldCheck, Tag, Calendar, Building, ArrowRight, ExternalLink } from 'lucide-react';

interface BuilderOffersProps {
  onSelectProject?: (project: BuilderProject) => void;
}

export const SAMPLE_PROJECTS: BuilderProject[] = [
  {
    id: 'proj_1',
    developerId: 'dev_1',
    developerName: 'Sovereign Developers',
    projectName: 'The Grand Aurelia Waterfront',
    tagline: 'Ultra-Luxury 3 & 4 BHK Sky Residences with Private Decks',
    location: 'Boat Club Road, Chennai',
    city: 'Chennai',
    country: 'India',
    latitude: 13.0189,
    longitude: 80.2447,
    description: 'A masterpiece by Sovereign Developers boasting panoramic views, Olympic infinity pool, and concierge services.',
    projectStatus: 'New Launch',
    startingPrice: 38500000, // 3.85 Cr
    maxPrice: 85000000,
    currency: 'INR',
    unitTypes: ['3 BHK', '4 BHK', 'Penthouse'],
    availableUnits: 14,
    totalUnits: 48,
    amenities: ['Helipad Access', 'Infinity Pool', 'Private Elevator', 'Spa', 'Valet Parking'],
    projectImages: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    ],
    reraId: 'TN/01/Building/0248/2024',
    possessionDate: 'Dec 2026',
    verified: true,
    featured: true,
    createdAt: new Date().toISOString(),
    offers: [
      {
        id: 'off_1',
        projectId: 'proj_1',
        developerId: 'dev_1',
        offerTitle: 'Zero Stamp Duty + Italian Marble Upgrade',
        description: 'Complete stamp duty waiver plus imported marble flooring package on bookings this month.',
        validFrom: '2026-09-01',
        validUntil: '2026-10-31',
        terms: 'Valid on first 10 confirmed registrations',
        status: 'active',
        discountValue: 'Savings up to ₹ 28 Lakhs'
      }
    ]
  },
  {
    id: 'proj_2',
    developerId: 'dev_2',
    developerName: 'Prestige Global Living',
    projectName: 'Prestige Kingfisher Boulevard',
    tagline: 'High-Rise Architectural Landmark in the Central Business District',
    location: 'Whitefield, Bangalore',
    city: 'Bangalore',
    country: 'India',
    latitude: 12.9698,
    longitude: 77.7499,
    description: 'Designed by international architects with sustainable IGBC Platinum certification and smart home automation.',
    projectStatus: 'Under Construction',
    startingPrice: 24500000, // 2.45 Cr
    maxPrice: 52000000,
    currency: 'INR',
    unitTypes: ['2.5 BHK', '3 BHK', '4 BHK Duplex'],
    availableUnits: 22,
    totalUnits: 120,
    amenities: ['Clubhouse 40,000 sqft', 'Tennis Courts', 'EV Charging Bays', 'Co-Working Lounge'],
    projectImages: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
    ],
    reraId: 'PRM/KA/RERA/1251/446/PR/2023',
    possessionDate: 'June 2025',
    verified: true,
    featured: true,
    createdAt: new Date().toISOString(),
    offers: [
      {
        id: 'off_2',
        projectId: 'proj_2',
        developerId: 'dev_2',
        offerTitle: 'Flexible 10:90 Payment Plan',
        description: 'Pay 10% now and nothing until possession. No pre-EMI burden.',
        validFrom: '2026-09-15',
        validUntil: '2026-11-15',
        terms: 'Subject to bank loan qualification',
        status: 'active',
        discountValue: 'Zero Pre-EMI'
      }
    ]
  },
  {
    id: 'proj_3',
    developerId: 'dev_3',
    developerName: 'Emaar Signature Properties',
    projectName: 'The Palm Horizon Villas',
    tagline: 'Private Waterfront Villas with Private Berths',
    location: 'Palm Jumeirah, Dubai',
    city: 'Dubai',
    country: 'United Arab Emirates',
    latitude: 25.1124,
    longitude: 55.1390,
    description: 'Direct private beach access, custom infinity pools, and bespoke Italian design kitchens.',
    projectStatus: 'Ready to Move',
    startingPrice: 85000000, // Approx AED 3.8M converted
    maxPrice: 210000000,
    currency: 'INR',
    unitTypes: ['4 BHK Villa', '5 BHK Mansion'],
    availableUnits: 5,
    totalUnits: 18,
    amenities: ['Private Beach', 'Yacht Berth', 'Private Cinema', '24/7 Butler Service'],
    projectImages: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    reraId: 'DLD/RERA/PALM/8892',
    possessionDate: 'Immediate Possession',
    verified: true,
    featured: true,
    createdAt: new Date().toISOString(),
    offers: [
      {
        id: 'off_3',
        projectId: 'proj_3',
        developerId: 'dev_3',
        offerTitle: 'Free 10-Year UAE Golden Visa Assistance + Full Furnishing',
        description: 'Complimentary government visa processing and European interior styling package.',
        validFrom: '2026-09-01',
        validUntil: '2026-12-31',
        terms: 'Direct developer registration',
        status: 'active',
        discountValue: 'Golden Visa Included'
      }
    ]
  }
];

export const BuilderOffersSection: React.FC<BuilderOffersProps> = ({ onSelectProject }) => {
  const formatPrice = (val: number) => {
    if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹ ${(val / 100000).toFixed(0)} Lakhs`;
    return `₹ ${val.toLocaleString()}`;
  };

  return (
    <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        {/* Section Heading */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--gold-primary)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.4rem'
            }}>
              <Tag size={15} />
              Exclusive Developer Ecosystem
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              New Projects & Builder Offers
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Direct launches with verified RERA documentation and limited-period price reductions.
            </p>
          </div>

          <button
            className="btn btn-outline"
            style={{ borderColor: 'var(--border-gold)', color: 'var(--gold-primary)' }}
          >
            Explore All Projects
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Projects Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          {SAMPLE_PROJECTS.map(proj => {
            const activeOffer = proj.offers?.[0];

            return (
              <div
                key={proj.id}
                className="card"
                style={{ padding: 0, display: 'flex', flexDirection: 'column' }}
                onClick={() => onSelectProject && onSelectProject(proj)}
              >
                {/* Image & Badges */}
                <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                  <img
                    src={proj.projectImages[0]}
                    alt={proj.projectName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform var(--transition-slow)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />

                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {proj.projectStatus}
                  </div>

                  {/* Verified Badge */}
                  {proj.verified && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--success)',
                      color: '#FFFFFF',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      <ShieldCheck size={14} />
                      Verified
                    </div>
                  )}

                  {/* Promotional Offer Ribbon */}
                  {activeOffer && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '0.5rem 1rem',
                      backgroundColor: 'rgba(18, 18, 21, 0.92)',
                      borderTop: '1px solid var(--border-gold)',
                      color: 'var(--gold-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Tag size={13} />
                      <span>{activeOffer.offerTitle}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {proj.developerName}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0 0.4rem' }}>
                    {proj.projectName}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    {proj.location}
                  </div>

                  {/* Metadata line */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderTop: '1px solid var(--border-subtle)',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '1.25rem',
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Building size={15} color="var(--gold-primary)" />
                      {proj.unitTypes.join(' • ')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={15} color="var(--gold-primary)" />
                      {proj.possessionDate}
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                        Starting from
                      </div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                        {formatPrice(proj.startingPrice)}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ padding: '0.55rem 1.1rem' }}
                    >
                      View Project
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
