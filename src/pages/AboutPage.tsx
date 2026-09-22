import React from 'react';
import {
  ShieldCheck,
  Zap,
  Award,
  Sparkles,
  Users
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (view: string, location?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-primary, #070709)',
      color: 'var(--text-primary, #FFFFFF)',
      minHeight: '100vh',
      paddingBottom: '5rem'
    }}>
      {/* Hero Header */}
      <div style={{
        padding: '4.5rem 1.5rem 3rem',
        background: 'linear-gradient(180deg, #101018 0%, #070709 100%)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
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
            <Sparkles size={14} /> The Sovereign Realm of Luxury Living
          </div>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 4vw, 3.25rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: '1rem',
            color: '#FFFFFF'
          }}>
            Pioneering Trust in Indian Luxury Real Estate
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            maxWidth: '680px',
            margin: '0 auto'
          }}>
            Derived from the Sanskrit <em style={{ color: 'var(--gold-primary)' }}>Loka</em> — meaning world or celestial realm — LOKHA was established to eliminate fraudulent claims and bring institutional rigor, aesthetic brilliance, and total legal verification to luxury property transactions in India.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '3.5rem 1.25rem' }}>
        {/* Core Pillars Grid */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', color: '#FFFFFF', marginBottom: '0.5rem' }}>
            The Four Pillars of the LOKHA Buyer Shield
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 2.5rem', fontSize: '0.925rem' }}>
            Every estate on LOKHA undergoes a stringent 14-day legal, physical, and revenue audit before being admitted to our private portfolio.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '1.75rem'
          }}>
            <div style={{
              backgroundColor: '#101018',
              borderRadius: '16px',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <ShieldCheck size={36} color="#22C55E" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>30-Year Title Search</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Full verification of chain title link deeds, encumbrance certificates (EC), and nil-mortgage clearances conducted by High Court advocates.
              </p>
            </div>

            <div style={{
              backgroundColor: '#101018',
              borderRadius: '16px',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <Zap size={36} color="var(--gold-primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>EB Meter Cross-Verification</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Direct physical inspection and verification of the active Electricity Board consumer number to ensure ownership continuity and zero utility dues.
              </p>
            </div>

            <div style={{
              backgroundColor: '#101018',
              borderRadius: '16px',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <Award size={36} color="#3B82F6" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>RERA Escrow Compliance</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Full audit of statutory RERA registration numbers, quarterly progress reports, and designated construction bank escrow accounts.
              </p>
            </div>

            <div style={{
              backgroundColor: '#101018',
              borderRadius: '16px',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <Users size={36} color="#A855F7" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>Zero-Spam Privacy Protocol</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Your personal phone number and financial records are never sold or broadcasted to third-party telemarketers. Only senior private advisors contact you.
              </p>
            </div>
          </div>
        </div>

        {/* Corporate Offices */}
        <div style={{
          backgroundColor: '#101018',
          borderRadius: '16px',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          padding: '2.5rem',
          marginBottom: '4rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
            Private Client Lounges & Regional Headquarters
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Visit our private client lounges for confidential property negotiations and physical title deed examinations.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{ padding: '1.25rem', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '0.35rem' }}>Chennai HQ</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                No. 14, Boat Club Road, Raja Annamalaipuram<br />
                Chennai, Tamil Nadu - 600028<br />
                Phone: +91 98401 82990
              </p>
            </div>

            <div style={{ padding: '1.25rem', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '0.35rem' }}>Bengaluru Private Lounge</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                UB City Concorde Towers, Level 11, Vittal Mallya Road<br />
                Bengaluru, Karnataka - 560001<br />
                Phone: +91 80 4910 8200
              </p>
            </div>

            <div style={{ padding: '1.25rem', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '0.35rem' }}>Mumbai Advisory Suite</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                One World Center, Tower 2, Senapati Bapat Marg, Lower Parel<br />
                Mumbai, Maharashtra - 400013<br />
                Phone: +91 22 6120 4400
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          borderRadius: '16px',
          background: 'linear-gradient(180deg, #14141E 0%, #0C0C12 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)'
        }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
            Experience the LOKHA Standard
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Schedule an appointment with our senior estate management team or explore current verified listings.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('properties')}
              style={{
                padding: '0.85rem 2rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--gold-primary)',
                color: '#070709',
                fontWeight: 800,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Explore Properties
            </button>
            <button
              onClick={() => onNavigate('contact')}
              style={{
                padding: '0.85rem 2rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'transparent',
                border: '1px solid var(--gold-primary)',
                color: 'var(--gold-primary)',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Contact Concierge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
