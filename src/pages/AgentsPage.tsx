import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Award,
  Search
} from 'lucide-react';
import type { AgentDocument, PropertyDocument } from '../types/firebaseModels';
import { getVerifiedAgents, getAgentById, getAgentListings } from '../services/agentService';
import { useToast } from '../components/common/Toast';

interface AgentsPageProps {
  selectedAgentId?: string;
  onNavigate: (view: string, location?: string) => void;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({ selectedAgentId, onNavigate }) => {
  const { showToast: _showToast } = useToast();

  const [agents, setAgents] = useState<AgentDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCity, setActiveCity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Single Agent View State (if selectedAgentId is provided)
  const [currentAgent, setCurrentAgent] = useState<AgentDocument | null>(null);
  const [agentProperties, setAgentProperties] = useState<PropertyDocument[]>([]);
  const [_agentLoading, setAgentLoading] = useState<boolean>(false);

  const cities = ['All', 'Chennai', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'Goa'];

  useEffect(() => {
    let isMounted = true;

    if (selectedAgentId) {
      setAgentLoading(true);
      async function loadSingle() {
        if (!selectedAgentId) return;
        const agent = await getAgentById(selectedAgentId);
        if (isMounted && agent) {
          setCurrentAgent(agent);
          const props = await getAgentListings(selectedAgentId);
          if (isMounted) setAgentProperties(props);
        }
        if (isMounted) setAgentLoading(false);
      }
      loadSingle();
    } else {
      async function loadAll() {
        setLoading(true);
        const list = await getVerifiedAgents(activeCity === 'All' ? undefined : activeCity);
        if (isMounted) {
          setAgents(list);
          setLoading(false);
        }
      }
      loadAll();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedAgentId, activeCity]);

  // If viewing single agent
  if (selectedAgentId && currentAgent) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        minHeight: '100vh',
        paddingBottom: '5rem'
      }}>
        {/* Breadcrumb */}
        <div style={{
          padding: '0.85rem 1.5rem',
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.825rem',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div>
            <button onClick={() => onNavigate('agents')} style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', cursor: 'pointer' }}>
              ← Back to All Certified Agents
            </button>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.25rem' }}>
          {/* Agent Profile Banner */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            alignItems: 'center',
            marginBottom: '3rem',
            boxShadow: 'var(--shadow-card)'
          }}>
            <img
              src={currentAgent.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'}
              alt={currentAgent.fullName}
              style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--gold-primary)' }}
            />

            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: '#16A34A'
                }}>
                  <ShieldCheck size={13} /> RERA Certified Partner
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  {currentAgent.experienceYears} Years Experience
                </span>
              </div>

              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                {currentAgent.fullName}
              </h1>

              <p style={{ color: 'var(--gold-primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                {currentAgent.agencyName || 'LOKHA Private Client Advisory'}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} color="var(--gold-primary)" /> {currentAgent.city}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#EAB308', fontWeight: 700 }}>
                  <Star size={14} fill="#EAB308" /> {currentAgent.rating || 4.9} ({currentAgent.reviewCount || 34} HNWI reviews)
                </span>
                <span style={{ color: 'var(--text-tertiary)' }}>
                  RERA: <strong>{currentAgent.reraLicenseNumber}</strong>
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <a
                href={`https://wa.me/${currentAgent.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.75rem 1.4rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(37, 211, 102, 0.1)',
                  border: '1px solid rgba(37, 211, 102, 0.3)',
                  color: '#25D366',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <MessageCircle size={16} /> WhatsApp Advisory
              </a>

              <a
                href={`tel:${currentAgent.phone}`}
                style={{
                  padding: '0.75rem 1.4rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--gold-primary)',
                  color: 'var(--gold-text)',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(198, 161, 91, 0.35)',
                  transition: 'background-color 250ms ease, transform 200ms ease'
                }}
              >
                <Phone size={16} /> Direct Call
              </a>
            </div>
          </div>

          {/* Agent Bio & Specialties */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '1.75rem',
            marginBottom: '3rem',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
              Professional Profile & Track Record
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.925rem', marginBottom: '1.25rem' }}>
              {currentAgent.bio || `Specializing in prime residential acquisitions, title verification, and discreet off-market transactions across ${currentAgent.city}. Over a decade representing family offices, institutional executives, and luxury buyers.`}
            </p>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                Areas of Expertise:
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(currentAgent.specialties || ['Ultra-Luxury Villas', 'Oceanfront Penthouses', 'Legal Title Due Diligence', 'NRI Investments']).map((s, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      color: 'var(--gold-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Active Portfolio Listings */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              Active Estates Represented by {currentAgent.fullName}
            </h2>

            {agentProperties.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Currently all private listings represented by this agent are under NDA or private mandate. Contact directly for private portfolio.
              </p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem'
              }}>
                {agentProperties.map(prop => (
                  <div
                    key={prop.propertyId}
                    onClick={() => onNavigate(`property-${prop.propertyId}`)}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      overflow: 'hidden',
                      cursor: 'pointer',
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
                    <img
                      src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80'}
                      alt={prop.title}
                      style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: '0.25rem' }}>
                        ₹{(prop.price ? prop.price / 10000000 : 1.5).toFixed(2)} Cr
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.925rem' }}>{prop.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {prop.location?.city} • {prop.specifications?.bedrooms || 3} BHK
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Directory View
  const filteredAgents = agents.filter(a => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (a.fullName || (a as any).name || '').toLowerCase().includes(q);
      const matchCity = (a.city || '').toLowerCase().includes(q);
      if (!matchName && !matchCity) return false;
    }
    return true;
  });

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
            <Award size={14} /> Certified RERA Broker Network
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '0.85rem',
            color: 'var(--text-primary)'
          }}>
            Verified Luxury Real Estate Advisors
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '640px',
            margin: '0 auto 2rem'
          }}>
            Connect with certified estate advisors who specialize in high-net-worth acquisitions, title verification, and private off-market mandates across India.
          </p>

          {/* Quick Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border)',
            padding: '0.4rem 0.6rem 0.4rem 1.25rem',
            maxWidth: '600px',
            margin: '0 auto',
            boxShadow: 'var(--shadow-card)'
          }}>
            <Search size={18} color="var(--gold-primary)" style={{ flexShrink: 0, marginRight: '0.65rem' }} />
            <input
              type="text"
              placeholder="Search by advisor name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
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
                backgroundColor: activeCity === c ? 'var(--gold-primary)' : 'var(--bg-card)',
                color: activeCity === c ? 'var(--gold-text)' : 'var(--text-secondary)',
                border: `1px solid ${activeCity === c ? 'var(--gold-primary)' : 'var(--border)'}`,
                transition: 'background-color 250ms ease, color 250ms ease, border-color 250ms ease'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Agents Grid */}
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
        ) : filteredAgents.length === 0 ? (
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <Users size={48} color="var(--gold-primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No Advisors Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Try clearing the search query or selecting &quot;All&quot; cities.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.75rem'
          }}>
            {filteredAgents.map(agent => (
              <div
                key={agent.agentId}
                onClick={() => onNavigate(`agent-${agent.agentId}`)}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  cursor: 'pointer',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={agent.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'}
                    alt={agent.fullName}
                    style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold-primary)' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {agent.fullName}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', fontWeight: 600 }}>
                      {agent.agencyName || 'LOKHA Private Advisor'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      <MapPin size={12} color="var(--gold-primary)" /> {agent.city}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#EAB308', fontWeight: 700 }}>
                    <Star size={14} fill="#EAB308" /> {agent.rating || 4.9}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <strong>{agent.experienceYears}+</strong> yrs experience
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <strong>{agent.activeListingsCount || 12}</strong> active estates
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  RERA License: <strong>{agent.reraLicenseNumber}</strong>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', marginTop: 'auto' }}>
                  <a
                    href={`https://wa.me/${agent.phone.replace(/[^0-9]/g, '')}`}
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(37, 211, 102, 0.1)',
                      border: '1px solid rgba(37, 211, 102, 0.3)',
                      color: '#25D366',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(`agent-${agent.agentId}`);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--gold-primary)',
                      color: 'var(--gold-text)',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(198, 161, 91, 0.35)',
                      transition: 'background-color 250ms ease, transform 200ms ease'
                    }}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
