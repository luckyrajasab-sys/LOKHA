import React from 'react';
import { Award, ShieldCheck, ArrowRight, Building2, MapPin } from 'lucide-react';
import type { AgencyDocument } from '../../types/firebaseModels';

interface DeveloperShowcaseSectionProps {
  agencies: AgencyDocument[];
  onNavigate: (view: string) => void;
}

export const DeveloperShowcaseSection: React.FC<DeveloperShowcaseSectionProps> = ({ agencies, onNavigate }) => {
  return (
    <section style={{
      padding: '7rem 1.5rem',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container">
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
              <Award size={15} />
              <span>Institutional Partners</span>
            </div>

            <h2 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}>
              Master developers & agencies.
            </h2>

            <p className="editorial-sub" style={{ marginTop: '0.5rem', maxWidth: '580px' }}>
              Partnering with India’s most celebrated real-estate conglomerates and certified boutique developer studios.
            </p>
          </div>

          <button
            onClick={() => onNavigate('agencies')}
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
            <span>Explore Developer Directory</span>
            <ArrowRight size={17} />
          </button>
        </div>

        {/* Developer Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {agencies.map(agency => (
            <div
              key={agency.agencyId}
              onClick={() => onNavigate('projects')}
              className="capability-card"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
                padding: '2rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px'
                  }}>
                    <img
                      src={agency.logo}
                      alt={agency.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    color: '#22C55E',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    <ShieldCheck size={12} />
                    RERA Audited
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  {agency.name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-tertiary)', fontSize: '0.825rem', marginBottom: '1rem' }}>
                  <MapPin size={13} color="var(--gold-primary)" />
                  <span>{agency.location}</span>
                </div>

                <p style={{
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.55,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginBottom: '1.25rem'
                }}>
                  {agency.description}
                </p>
              </div>

              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.825rem'
              }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building2 size={15} color="var(--gold-primary)" />
                  <strong>{agency.activeProjectsCount || 4} Active Townships</strong>
                </span>

                <span style={{ color: 'var(--gold-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  View <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
