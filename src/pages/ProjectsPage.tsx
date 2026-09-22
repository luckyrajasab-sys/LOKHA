import React, { useState, useEffect } from 'react';
import {
  Layers,
  MapPin,
  ShieldCheck,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import type { ProjectDocument } from '../types/firebaseModels';
import { getProjects, getProjectById } from '../services/projectService';
import { useToast } from '../components/common/Toast';

interface ProjectsPageProps {
  selectedProjectId?: string;
  onNavigate: (view: string, location?: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ selectedProjectId, onNavigate }) => {
  const { showToast } = useToast();

  const [projects, setProjects] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCity, setActiveCity] = useState<string>('All');

  // Single Project View
  const [currentProject, setCurrentProject] = useState<ProjectDocument | null>(null);

  const cities = ['All', 'Chennai', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'Goa'];

  useEffect(() => {
    let isMounted = true;
    if (selectedProjectId) {
      setLoading(true);
      async function loadSingle() {
        if (!selectedProjectId) return;
        const proj = await getProjectById(selectedProjectId);
        if (isMounted && proj) {
          setCurrentProject(proj);
          setLoading(false);
        }
      }
      loadSingle();
    } else {
      setLoading(true);
      async function loadAll() {
        const list = await getProjects(activeCity === 'All' ? undefined : activeCity);
        if (isMounted) {
          setProjects(list);
          setLoading(false);
        }
      }
      loadAll();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedProjectId, activeCity]);

  const formatPrice = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  // Single Project View
  if (selectedProjectId && currentProject) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-primary, #070709)',
        color: 'var(--text-primary, #FFFFFF)',
        minHeight: '100vh',
        paddingBottom: '5rem'
      }}>
        {/* Top Back bar */}
        <div style={{ padding: '0.85rem 1.5rem', backgroundColor: '#0A0A0F', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={() => onNavigate('projects')}
            style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ← Back to All Developer Launches
          </button>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.25rem' }}>
          {/* Hero Banner */}
          <div style={{
            position: 'relative',
            height: 'min(480px, 50vh)',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '2rem',
            border: '1px solid rgba(212, 175, 55, 0.25)'
          }}>
            <img
              src={currentProject.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'}
              alt={currentProject.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(7,7,9,0.92) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '2rem'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  color: 'var(--gold-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 800
                }}>
                  {currentProject.developerName}
                </span>

                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  color: '#22C55E',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  <ShieldCheck size={14} /> RERA: {currentProject.reraNumber}
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.35rem' }}>
                {currentProject.title}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <MapPin size={15} color="var(--gold-primary)" />
                {currentProject.address || currentProject.locality}, {currentProject.city}
              </div>
            </div>
          </div>

          {/* Project Highlights Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1.5rem',
            borderRadius: '12px',
            backgroundColor: '#101018',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            marginBottom: '2.5rem'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Starting Price</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--gold-primary)' }}>
                {formatPrice(currentProject.startingPrice || 35000000)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Possession Date</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
                {currentProject.possessionDate || 'Ready to Move / Dec 2026'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Configurations</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
                {currentProject.configurations?.join(', ') || '3, 4 BHK & Penthouses'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Site Inspection</span>
              <button
                onClick={() => {
                  showToast('Site visit concierge alert dispatched! Our representative will call you.', 'success');
                }}
                style={{
                  marginTop: '0.25rem',
                  padding: '0.4rem 0.95rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--gold-primary)',
                  color: '#070709',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Book VIP Preview
              </button>
            </div>
          </div>

          {/* Detailed Overview */}
          <div style={{
            backgroundColor: '#101018',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
              Project Master Plan & Specifications
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {currentProject.description || `A landmark architectural enclave developed by ${currentProject.developerName}, offering world-class club amenities, multi-tier security, sustainable green building certification, and private elevator lobbies.`}
            </p>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '0.75rem' }}>
              Master Amenities
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {(currentProject.amenities || ['50,000 sq.ft Clubhouse', 'Olympic Swimming Pool', 'Squash & Tennis Courts', 'EV Car Charging Infrastructure', 'Private Cinema Lounge', '24/7 Concierge Desk']).map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} color="#22C55E" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Directory of all projects
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
            <Layers size={14} /> New Launch & Under-Construction Gated Communities
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '0.85rem',
            color: '#FFFFFF'
          }}>
            Exclusive New Residential Developments
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '640px',
            margin: '0 auto'
          }}>
            Direct developer allocations, institutional launch pricing, and zero brokerage on India’s most prestigious master-planned townships.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '2.5rem 1.25rem' }}>
        {/* City Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', marginBottom: '2rem', paddingBottom: '0.35rem' }}>
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCity(c)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.825rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                backgroundColor: activeCity === c ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.04)',
                color: activeCity === c ? '#070709' : 'var(--text-secondary)',
                border: `1px solid ${activeCity === c ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                transition: 'all 0.2s'
              }}
            >
              {c}
            </button>
          ))}
        </div>

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
            {projects.map(proj => (
              <div
                key={proj.projectId}
                onClick={() => onNavigate(`project-${proj.projectId}`)}
                style={{
                  backgroundColor: '#101018',
                  borderRadius: '16px',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
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
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                  <img
                    src={proj.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'}
                    alt={proj.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '0.85rem',
                    left: '0.85rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(7, 7, 9, 0.85)',
                    color: 'var(--gold-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    border: '1px solid rgba(212, 175, 55, 0.3)'
                  }}>
                    {proj.developerName}
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '0.85rem',
                    left: '0.85rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(7, 7, 9, 0.88)',
                    color: 'var(--gold-primary)',
                    fontSize: '1.15rem',
                    fontWeight: 900
                  }}>
                    Starting {formatPrice(proj.startingPrice || 32000000)}
                  </div>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.35rem' }}>
                    {proj.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '0.85rem' }}>
                    <MapPin size={14} color="var(--gold-primary)" />
                    {proj.city} • {proj.address || proj.locality}
                  </div>

                  <div style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Possession: <strong>{proj.possessionDate || 'Dec 2026'}</strong></span>
                    <span style={{ color: '#22C55E', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ShieldCheck size={13} /> RERA Approved
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      {(proj.configurations || ['3 & 4 BHK']).join(', ')}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      Explore Township <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
