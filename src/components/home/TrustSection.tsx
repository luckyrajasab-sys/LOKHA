import React from 'react';
import { ShieldCheck, UserCheck, Award, Hotel, Sparkles } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const trustPillars = [
    {
      icon: ShieldCheck,
      title: 'Verified Properties',
      description: 'Physical site verification, encumbrance certificate inspection, and direct title deeds validation by legal counsel.'
    },
    {
      icon: Award,
      title: 'Verified Developers',
      description: 'Strict RERA regulatory compliance checks, escrow account audit, and construction milestone monitoring.'
    },
    {
      icon: UserCheck,
      title: 'Verified Agents & Brokers',
      description: 'Government certified credentials, background screening, and adherence to transparent fair-pricing standards.'
    },
    {
      icon: Hotel,
      title: 'Verified Stays & Hosts',
      description: 'Stringent sanitation and safety audits, verified amenities, and transparent guest cancellation guarantees.'
    }
  ];

  return (
    <section style={{
      padding: '5rem 0',
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--gold-primary)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '0.5rem'
          }}>
            <Sparkles size={14} />
            Institutional Integrity
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            The LOKHA Trust Standard
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Every listing and developer on LOKHA undergoes a multi-layer verification process before entering the public marketplace.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2rem'
        }}>
          {trustPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="card"
                style={{
                  padding: '2rem 1.5rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-xl)'
                }}
              >
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--gold-subtle)',
                  color: 'var(--gold-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {pillar.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
