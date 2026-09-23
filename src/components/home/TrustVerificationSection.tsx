import React from 'react';
import { ShieldCheck, FileCheck, Lock, AlertTriangle, UserCheck, Eye } from 'lucide-react';

export const TrustVerificationSection: React.FC = () => {
  const pillars = [
    {
      icon: FileCheck,
      title: 'Patta & Title Deed Audits',
      desc: 'Listings undergo document screening including revenue records, land patta numbers, and Encumbrance Certificates (EC).'
    },
    {
      icon: ShieldCheck,
      title: 'RERA Compliance Standard',
      desc: 'Developer township units and off-plan projects are verified against active state Real Estate Regulatory Authority license registers.'
    },
    {
      icon: UserCheck,
      title: 'Accredited Ownership & Agents',
      desc: 'Every seller account is authenticated with government-linked electricity consumer metrics or certified RERA advisor licenses.'
    },
    {
      icon: Lock,
      title: 'End-to-End Authentication',
      desc: 'Institutional data encryption backed by Firebase Auth and role-based security rules protecting your personal contact details.'
    },
    {
      icon: Eye,
      title: 'Zero Duplicate Governance',
      desc: 'Algorithmic de-duplication prevents the same physical apartment or villa from cluttering results under multiple intermediary listings.'
    },
    {
      icon: AlertTriangle,
      title: 'Direct Community Reporting',
      desc: 'One-click listing reporting triggers immediate legal review and catalog suspension within 24 hours if discrepancies emerge.'
    }
  ];

  return (
    <section style={{
      padding: '7rem 1.5rem',
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            <ShieldCheck size={15} />
            <span>Governance & Integrity</span>
          </div>

          <h2 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}>
            Built around trust.
          </h2>

          <p className="editorial-sub" style={{ maxWidth: '640px', margin: '0.75rem auto 0' }}>
            High-value real estate requires uncompromising verification. We govern our catalog through multi-layer regulatory checks.
          </p>
        </div>

        {/* 6 Security Pillars Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {pillars.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-subtle)',
                  padding: '2.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--gold-subtle)',
                  color: 'var(--gold-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconComponent size={22} />
                </div>

                <h3 style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)'
                }}>
                  {item.title}
                </h3>

                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6
                }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
