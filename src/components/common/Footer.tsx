import React from 'react';
import { ShieldCheck, Globe2, Award, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: '4rem',
      paddingBottom: '5rem',
      marginTop: '5rem',
      transition: 'background-color var(--transition-base)'
    }}>
      <div className="container">
        {/* Trust Badges Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          paddingBottom: '3rem',
          marginBottom: '3rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--gold-subtle)',
              color: 'var(--gold-primary)'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                100% Verified Listings
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Direct ownership & title verified
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--gold-subtle)',
              color: 'var(--gold-primary)'
            }}>
              <Globe2 size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Global Portfolio
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Estates across 40+ premier cities
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--gold-subtle)',
              color: 'var(--gold-primary)'
            }}>
              <Award size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Certified Builders
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                RERA and municipal regulatory audits
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--gold-subtle)',
              color: 'var(--gold-primary)'
            }}>
              <Lock size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Institutional Security
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Firebase Auth & End-to-end encryption
              </div>
            </div>
          </div>
        </div>

        {/* Links Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{
                width: '1.8rem',
                height: '1.8rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--gold-primary)',
                color: 'var(--gold-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem'
              }}>
                L
              </div>
              <span style={{ fontWeight: 800, letterSpacing: '0.1em', fontSize: '1.15rem' }}>
                LOKHA
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The international destination for luxury real estate, developer projects, boutique villas, and stays.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Real Estate
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li><button onClick={() => onNavigate('properties')} className="btn-ghost" style={{ padding: 0 }}>Luxury Apartments</button></li>
              <li><button onClick={() => onNavigate('properties')} className="btn-ghost" style={{ padding: 0 }}>Villas & Penthouses</button></li>
              <li><button onClick={() => onNavigate('properties')} className="btn-ghost" style={{ padding: 0 }}>Plots & Land</button></li>
              <li><button onClick={() => onNavigate('properties')} className="btn-ghost" style={{ padding: 0 }}>Commercial Spaces</button></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Accommodation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li><button onClick={() => onNavigate('stays')} className="btn-ghost" style={{ padding: 0 }}>Luxury Hotels</button></li>
              <li><button onClick={() => onNavigate('stays')} className="btn-ghost" style={{ padding: 0 }}>Premium PGs & Co-Living</button></li>
              <li><button onClick={() => onNavigate('stays')} className="btn-ghost" style={{ padding: 0 }}>Hostels & Student Housing</button></li>
              <li><button onClick={() => onNavigate('stays')} className="btn-ghost" style={{ padding: 0 }}>Serviced Apartments</button></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Developers & Partners
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li><button onClick={() => onNavigate('projects')} className="btn-ghost" style={{ padding: 0 }}>New Project Launches</button></li>
              <li><button onClick={() => onNavigate('projects')} className="btn-ghost" style={{ padding: 0 }}>Builder Promotional Offers</button></li>
              <li><button onClick={() => onNavigate('signup')} className="btn-ghost" style={{ padding: 0 }}>Developer Portal</button></li>
              <li><button onClick={() => onNavigate('signup')} className="btn-ghost" style={{ padding: 0 }}>Agent Registration</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-tertiary)'
        }}>
          <div>
            © {new Date().getFullYear()} LOKHA Global Realty & Hospitality Inc. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
            <span>RERA Disclaimers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
