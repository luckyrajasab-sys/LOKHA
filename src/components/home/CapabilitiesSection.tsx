import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface CapabilitiesSectionProps {
  onNavigate: (view: string) => void;
}

export const CapabilitiesSection: React.FC<CapabilitiesSectionProps> = ({ onNavigate }) => {
  const capabilities = [
    { num: '01', title: 'Property Discovery', desc: 'Faceted search with radius GPS, micro-market circle rates, and legal compliance filters.', link: 'properties' },
    { num: '02', title: 'Buy & Rent Modules', desc: 'Distinct freehold acquisition and executive leasing workflows with customizable tenures.', link: 'buy' },
    { num: '03', title: 'Direct Property Listing', desc: 'High-speed listing wizard for owners with electricity consumer & patta document verification.', link: 'list-property' },
    { num: '04', title: 'Real-time Enquiries', desc: 'Instant dispatch to verified owners and developers with chat-style response channels.', link: 'inquire' },
    { num: '05', title: 'Site Visit Management', desc: 'Integrated calendar booking with time-slot verification and dedicated concierge follow-up.', link: 'site-visits' },
    { num: '06', title: 'Agent & Agency Directory', desc: 'Certified RERA real-estate advisors and Grade-A developer portfolios with track records.', link: 'agents' },
    { num: '07', title: 'Property Comparison', desc: 'Side-by-side spec, pricing per sq.ft, and regulatory compliance comparison for up to 4 estates.', link: 'compare' },
    { num: '08', title: 'Property Management', desc: 'Comprehensive seller dashboard to track views, active leads, price adjustments, and inspection requests.', link: 'dashboard' },
    { num: '09', title: 'Saved Private Portfolio', desc: 'Bookmarked estates synced across devices in real time with price drops and status notifications.', link: 'saved' },
    { num: '10', title: 'Smart Notification Radar', desc: 'Hyper-local rent radar alerts, institutional launches, and private developer discount drops.', link: 'notifications' },
    { num: '11', title: 'Market Valuation Engine', desc: 'Automated valuation model (AVM) calculating fair price bands based on city micro-market circle rates.', link: 'home-valuation' },
    { num: '12', title: 'Master Developer Projects', desc: 'Integrated township master plans, tower specifications, floor layouts, and construction timelines.', link: 'projects' }
  ];

  return (
    <section style={{
      padding: '7rem 1.5rem',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container">
        {/* Section Title */}
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            <Sparkles size={15} />
            <span>Platform Capabilities</span>
          </div>

          <h2 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}>
            One platform.<br />
            Many possibilities.
          </h2>

          <p className="editorial-sub" style={{ maxWidth: '640px', margin: '1rem auto 0' }}>
            Engineered from the ground up as a complete, unified real-estate operating system for discovery, transactions, and portfolio management.
          </p>
        </div>

        {/* 12 Capabilities Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {capabilities.map((cap) => (
            <div
              key={cap.num}
              onClick={() => onNavigate(cap.link)}
              className="capability-card"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
                padding: '2rem 1.75rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  color: 'var(--gold-primary)',
                  letterSpacing: '-0.02em',
                  marginBottom: '1rem'
                }}>
                  {cap.num}
                </div>

                <h3 style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '0.65rem'
                }}>
                  {cap.title}
                </h3>

                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6
                }}>
                  {cap.desc}
                </p>
              </div>

              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--gold-primary)',
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                <span>Open module</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
