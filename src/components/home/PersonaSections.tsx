import React from 'react';
import { ArrowRight, CheckCircle2, Building, User, Users, Building2 } from 'lucide-react';

interface PersonaSectionsProps {
  onNavigate: (view: string) => void;
}

export const PersonaSections: React.FC<PersonaSectionsProps> = ({ onNavigate }) => {
  return (
    <>
      {/* 1. FOR BUYERS & TENANTS */}
      <section style={{
        padding: '7rem 1.5rem',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '4rem',
            alignItems: 'center'
          }}>
            <div>
              <div className="section-eyebrow">
                <User size={15} />
                <span>For Buyers & Tenants</span>
              </div>

              <h2 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: '1.25rem' }}>
                Looking for a place<br />to call home?
              </h2>

              <p className="editorial-sub" style={{ marginBottom: '2rem' }}>
                Experience a tailored discovery workflow designed to eliminate clutter, protect your personal contact information, and bring you only verified, freehold residences.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                {[
                  'Smart Multi-Facet Search',
                  'Saved Private Portfolio',
                  'Side-by-Side Comparison',
                  'Direct Owner Enquiries',
                  'Scheduled Site Inspections',
                  'Price Drop Notifications'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="var(--gold-primary)" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigate('properties')}
                style={{
                  padding: '0.85rem 2rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--gold-primary)',
                  color: '#070709',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <span>Start Exploring</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              height: '480px',
              backgroundColor: 'var(--border-subtle)'
            }}>
              <img
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80"
                alt="Contemporary Luxury Residence Living Room"
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOR OWNERS & SELLERS */}
      <section style={{
        padding: '7rem 1.5rem',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '4rem',
            alignItems: 'center'
          }}>
            <div style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              height: '480px',
              backgroundColor: 'var(--border-subtle)',
              order: 2
            }}>
              <img
                src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80"
                alt="Modern Villa Architecture Exterior"
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ order: 1 }}>
              <div className="section-eyebrow">
                <Building size={15} />
                <span>For Property Owners</span>
              </div>

              <h2 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: '1.25rem' }}>
                Have a property<br />to list?
              </h2>

              <p className="editorial-sub" style={{ marginBottom: '2rem' }}>
                Showcase your estate directly to qualified institutional buyers, corporate executives, and verified families. Enjoy complete control over your listing status and privacy.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                {[
                  'Instant Listing Setup',
                  'High-Res Photo Gallery',
                  'Direct Inbound Leads',
                  'Site Visit Coordination',
                  'Real-Time Visitor Stats',
                  'Verified Owner Badge'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="var(--gold-primary)" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigate('list-property')}
                style={{
                  padding: '0.85rem 2rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--gold-primary)',
                  color: '#070709',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <span>List Your Property</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOR REAL-ESTATE AGENTS & ADVISORS */}
      <section style={{
        padding: '7rem 1.5rem',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '4rem',
            alignItems: 'center'
          }}>
            <div>
              <div className="section-eyebrow">
                <Users size={15} />
                <span>For Real Estate Professionals</span>
              </div>

              <h2 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: '1.25rem' }}>
                Built for certified<br />RERA professionals.
              </h2>

              <p className="editorial-sub" style={{ marginBottom: '2rem' }}>
                LOKHA elevates certified real-estate advisors with verified credential badges, dedicated listing portfolios, and real-time client inquiry management.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                {[
                  'Verified Advisory Profile',
                  'Dedicated Listing Showcase',
                  'Direct Inquiries Routing',
                  'Lead CRM & Follow-ups',
                  'RERA License Endorsement',
                  'Transaction Credibility'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="var(--gold-primary)" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigate('agents')}
                style={{
                  padding: '0.85rem 2rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-medium)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>Join as an Agent</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              height: '480px',
              backgroundColor: 'var(--border-subtle)'
            }}>
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80"
                alt="Executive Consultation & Client Advisory"
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOR DEVELOPERS & BUILDERS */}
      <section style={{
        padding: '7rem 1.5rem',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '4rem',
            alignItems: 'center'
          }}>
            <div style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              height: '480px',
              backgroundColor: 'var(--border-subtle)',
              order: 2
            }}>
              <img
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80"
                alt="Architectural Master Township Development"
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ order: 1 }}>
              <div className="section-eyebrow">
                <Building2 size={15} />
                <span>For Developers & Master Builders</span>
              </div>

              <h2 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: '1.25rem' }}>
                Give your projects<br />a digital home.
              </h2>

              <p className="editorial-sub" style={{ marginBottom: '2rem' }}>
                Deploy flagship residential townships, high-rise commercial corridors, and pre-launch developments directly to India’s most affluent property seekers.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                {[
                  'Township Master Displays',
                  'Floor Plan Showcases',
                  'RERA Compliance Stamps',
                  'Institutional Lead Capture',
                  'Construction Milestones',
                  'Exclusive Launch Radars'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="var(--gold-primary)" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigate('projects')}
                style={{
                  padding: '0.85rem 2rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--gold-primary)',
                  color: '#070709',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <span>Explore Projects</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
