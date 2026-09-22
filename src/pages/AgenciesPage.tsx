import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  MapPin,
  ArrowRight
} from 'lucide-react';
import type { AgencyDocument } from '../types/firebaseModels';
import { getVerifiedAgencies } from '../services/agencyService';

interface AgenciesPageProps {
  onNavigate: (view: string, location?: string) => void;
}

export const AgenciesPage: React.FC<AgenciesPageProps> = ({ onNavigate }) => {
  const [agencies, setAgencies] = useState<AgencyDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      const list = await getVerifiedAgencies();
      setAgencies(list);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary, #070709)',
      color: 'var(--text-primary, #FFFFFF)',
      minHeight: '100vh',
      paddingBottom: '5rem'
    }}>
      {/* Hero Header */}
      <div style={{
        padding: '3.5rem 1.5rem 2.5rem',
        background: 'linear-gradient(180deg, #101018 0%, #070709 100%)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.95rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            fontSize: '0.8rem',
            color: 'var(--gold-primary)',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            <Building2 size={14} /> Institutional Developer Directory
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '0.85rem',
            color: '#FFFFFF'
          }}>
            Premier Real Estate Developers & Conglomerates
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '640px',
            margin: '0 auto'
          }}>
            Explore India’s most trusted publicly listed and Grade-A infrastructure conglomerates, with zero delivery defaults and verified RERA track records.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '2.5rem 1.25rem' }}>
        {loading ? (
          <div style={{ minHeight: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid rgba(212, 175, 55, 0.2)',
              borderTopColor: 'var(--gold-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '2rem'
          }}>
            {agencies.map(dev => (
              <div
                key={dev.agencyId}
                style={{
                  backgroundColor: '#101018',
                  borderRadius: '16px',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <img
                    src={dev.logoUrl || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=200&q=80'}
                    alt={dev.name}
                    style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.2rem' }}>
                      {dev.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <MapPin size={13} color="var(--gold-primary)" /> {dev.city} (HQ)
                    </div>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  {dev.description}
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.8rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)', display: 'block' }}>Active Launches</span>
                    <strong style={{ color: 'var(--gold-primary)', fontSize: '0.95rem' }}>{dev.projectsCount || 14} Projects</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)', display: 'block' }}>RERA Track Record</span>
                    <strong style={{ color: '#22C55E', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <ShieldCheck size={14} /> 100% Compliant
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('projects')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--gold-primary)',
                    color: '#070709',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    marginTop: 'auto'
                  }}
                >
                  Explore Developer Projects <ArrowRight size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
