import React from 'react';
import { Compass, AlertCircle, CheckCircle2 } from 'lucide-react';

export const PurposeSection: React.FC = () => {
  const frictionPoints = [
    'Thousands of outdated, duplicate, and unverified broker listings across scattered portals',
    'Unclear circle rates, hidden maintenance escalations, and ambiguous carpet vs super-built-up area figures',
    'Opaque legal clearance, missing RERA registration numbers, and unverified encumbrance certificates',
    'Painfully slow manual communication with intermediaries who do not represent actual owners'
  ];

  const solutions = [
    'Single source of truth with GPS micro-market radar and strict direct-listing governance',
    'Transparent breakdown of base price, registration stamp duty, and automated loan EMI models',
    'Pre-screened title deeds, clear freehold verification, and certified developer affiliations',
    'Direct-to-owner and assigned RERA advisor communication with instant scheduled site visits'
  ];

  return (
    <section style={{
      padding: '7rem 1.5rem',
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            <Compass size={15} />
            <span>Our Foundation</span>
          </div>

          <h2 className="editorial-title" style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
            marginBottom: '1.25rem'
          }}>
            Why LOKHA exists.
          </h2>

          <p style={{
            fontSize: 'clamp(1.15rem, 1.8vw, 1.35rem)',
            fontWeight: 500,
            color: 'var(--text-primary)',
            maxWidth: '680px',
            margin: '0 auto 1.5rem',
            lineHeight: 1.5
          }}>
            "Finding property should not feel complicated."
          </p>

          <p className="editorial-sub" style={{ maxWidth: '720px', margin: '0 auto' }}>
            The traditional property journey has been plagued by fragmentation, opaque broker networks, and mismatched expectations. LOKHA exists to replace uncertainty with institutional-grade transparency.
          </p>
        </div>

        {/* Comparison Grid: The Friction vs The LOKHA Way */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          marginBottom: '4.5rem'
        }}>
          {/* Friction Column */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            padding: '2.5rem'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#EF4444',
              fontSize: '0.85rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '1.5rem'
            }}>
              <AlertCircle size={17} />
              <span>The Industry Friction</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {frictionPoints.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  <span style={{ color: '#EF4444', fontWeight: 800 }}>✕</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LOKHA Solution Column */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-gold)',
            boxShadow: 'var(--shadow-gold)',
            padding: '2.5rem'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--gold-primary)',
              fontSize: '0.85rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '1.5rem'
            }}>
              <CheckCircle2 size={17} />
              <span>The LOKHA Standard</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {solutions.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                  <span style={{ color: 'var(--gold-primary)', fontWeight: 800 }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Manifesto Banner */}
        <div style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-xl)',
          padding: '3rem 2rem',
          textAlign: 'center',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-primary)', marginBottom: '0.75rem' }}>
            Our Purpose
          </div>
          <p style={{
            fontSize: 'clamp(1.2rem, 2.2vw, 1.6rem)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            maxWidth: '780px',
            margin: '0 auto',
            lineHeight: 1.45
          }}>
            "To create a connected property ecosystem where people can discover, evaluate and connect with confidence."
          </p>
        </div>
      </div>
    </section>
  );
};
