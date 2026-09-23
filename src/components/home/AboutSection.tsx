import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AboutSectionProps {
  onNavigate: (view: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onNavigate }) => {
  const pillars = [
    { title: 'Discovery & Curation', desc: 'Browse verified freehold luxury estates, high-rise apartments, and commercial sanctuaries without noise.' },
    { title: 'Direct Institutional Enquiries', desc: 'Connect straight to registered developers and accredited owners without intermediary friction.' },
    { title: 'Site Inspection Scheduling', desc: 'Book private, assisted in-person or digital property inspections in under two minutes.' },
    { title: 'Digital Title & Legal Transparency', desc: 'Every listing undergoes RERA, municipal, and ownership verification before publication.' }
  ];

  return (
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
          {/* Left: Large Editorial Architectural Photography + Visual Indicator */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              height: '520px',
              backgroundColor: 'var(--border-subtle)'
            }}>
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80"
                alt="Contemporary Architectural Estate"
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Visual 01 / 04 Indicator */}
            <div style={{
              position: 'absolute',
              bottom: '-1.5rem',
              left: '2rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem 1.75rem',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold-primary)', letterSpacing: '-0.02em' }}>
                01 / 04
              </span>
              <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
                  Ecosystem Standard
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Connected real-estate matrix
                </div>
              </div>
            </div>
          </div>

          {/* Right: Editorial Narrative Content */}
          <div>
            <div className="section-eyebrow">
              <ShieldCheck size={15} />
              <span>What is LOKHA</span>
            </div>

            <h2 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: '1.25rem' }}>
              Real estate,<br />made simpler.
            </h2>

            <p className="editorial-sub" style={{ marginBottom: '2rem' }}>
              LOKHA brings property discovery, property owners, certified agents, master developers, and prospective buyers together into one seamless, digital ecosystem. We believe buying, renting, or leasing a high-value property should feel refined, transparent, and direct.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem'
            }}>
              {pillars.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ marginTop: '0.2rem', color: 'var(--gold-primary)', flexShrink: 0 }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {p.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('about')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.8rem 1.85rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background-color 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold-primary)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
            >
              <span>Explore The LOKHA Standard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
