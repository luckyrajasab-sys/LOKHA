import React from 'react';
import { Activity, Bell, CalendarCheck, CheckCircle2, MessageSquare, RefreshCw, ShieldCheck } from 'lucide-react';

export const RealTimePlatformSection: React.FC = () => {
  return (
    <section style={{
      padding: '7rem 1.5rem',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            <Activity size={15} />
            <span>Reactive Architecture</span>
          </div>

          <h2 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}>
            Everything connected.<br />
            In real time.
          </h2>

          <p className="editorial-sub" style={{ maxWidth: '640px', margin: '1rem auto 0' }}>
            LOKHA is powered by a live Firestore reactive synchronization layer. Inquiries, site inspections, and listing updates propagate instantly across all active clients.
          </p>
        </div>

        {/* Real-time Pipeline Visualization */}
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {/* Flow Card 1: Enquiry to Visit Pipeline */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.85rem'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-primary)' }}>
                Client Pipeline
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#22C55E',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
                Real-Time Live
              </span>
            </div>

            {/* Step Nodes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)' }}>
                <MessageSquare size={18} color="var(--gold-primary)" />
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>New Direct Enquiry</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Prospect submits requirement</div>
                </div>
              </div>

              <div style={{ textAlign: 'center', color: 'var(--gold-primary)', fontSize: '0.85rem' }}>↓</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)' }}>
                <Bell size={18} color="#3B82F6" />
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Instant Owner Notification</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Push alert & radar badge updated</div>
                </div>
              </div>

              <div style={{ textAlign: 'center', color: 'var(--gold-primary)', fontSize: '0.85rem' }}>↓</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)' }}>
                <CalendarCheck size={18} color="#22C55E" />
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Site Visit Confirmed</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Both calendars locked instantly</div>
                </div>
              </div>
            </div>
          </div>

          {/* Flow Card 2: Catalog & Moderation Engine */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.85rem'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-primary)' }}>
                Data Distribution
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--gold-primary)',
                backgroundColor: 'var(--gold-subtle)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)'
              }}>
                <RefreshCw size={11} />
                Synced
              </span>
            </div>

            {/* Sync Nodes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)' }}>
                <ShieldCheck size={18} color="#22C55E" />
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Title & Patta Verified</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Approved listing goes live</div>
                </div>
              </div>

              <div style={{ textAlign: 'center', color: 'var(--gold-primary)', fontSize: '0.85rem' }}>↓</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)' }}>
                <Activity size={18} color="var(--gold-primary)" />
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Map GPS Radar Updated</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Visible on radius radius search</div>
                </div>
              </div>

              <div style={{ textAlign: 'center', color: 'var(--gold-primary)', fontSize: '0.85rem' }}>↓</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)' }}>
                <CheckCircle2 size={18} color="#22C55E" />
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Discoverable Across India</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Synced on mobile, tablet & web</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
