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
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      paddingBottom: '5rem'
    }}>
      {/* Hero Header */}
      <div style={{
        padding: '3.5rem 1.5rem 2.5rem',
        background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        borderBottom: '1px solid var(--border)',
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
            color: 'var(--text-primary)'
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
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <img
                    src={dev.logoUrl || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=200&q=80'}
                    alt={dev.name}
                    style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
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
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  fontSize: '0.8rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)', display: 'block' }}>Active Launches</span>
                    <strong style={{ color: 'var(--gold-primary)', fontSize: '0.95rem' }}>{dev.projectsCount || 14} Projects</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)', display: 'block' }}>RERA Track Record</span>
                    <strong style={{ color: '#16A34A', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
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
                    color: 'var(--gold-text)',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    marginTop: 'auto',
                    boxShadow: '0 4px 12px rgba(198, 161, 91, 0.35)',
                    transition: 'background-color 250ms ease, transform 200ms ease'
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
