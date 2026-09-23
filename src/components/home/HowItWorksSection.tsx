import React from 'react';
import { Compass, Search, Eye, Layers, MessageSquare, CalendarCheck, CheckCircle2 } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Search',
      subtitle: 'Tell LOKHA what you\'re looking for.',
      desc: 'Set micro-market radius, budget thresholds, specific architectural styles, and possession timelines.',
      icon: Search
    },
    {
      num: '02',
      title: 'Discover',
      subtitle: 'Explore properties that match your needs.',
      desc: 'Browse verified freehold estates with high-resolution drone sweeps, floor plans, and RERA disclosures.',
      icon: Eye
    },
    {
      num: '03',
      title: 'Compare',
      subtitle: 'Review the details that matter.',
      desc: 'Contrast square-footage rates, construction stages, legal title clarity, and estimated loan EMIs.',
      icon: Layers
    },
    {
      num: '04',
      title: 'Connect',
      subtitle: 'Talk directly with owners and agents.',
      desc: 'No broker walls or spam calls. Engage through audited institutional communication channels.',
      icon: MessageSquare
    },
    {
      num: '05',
      title: 'Visit',
      subtitle: 'Schedule a site visit.',
      desc: 'Select preferred calendar date and time-slot for an assisted physical tour with certified property concierges.',
      icon: CalendarCheck
    },
    {
      num: '06',
      title: 'Move Forward',
      subtitle: 'Make your property journey simpler.',
      desc: 'Transition smoothly into final lease drafting or title transfer backed by verified platform data.',
      icon: CheckCircle2
    }
  ];

  return (
    <section style={{
      padding: '7rem 1.5rem',
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            <Compass size={15} />
            <span>Structured Journey</span>
          </div>

          <h2 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}>
            How LOKHA works.
          </h2>

          <p className="editorial-sub" style={{ maxWidth: '600px', margin: '0.75rem auto 0' }}>
            A six-step guided path engineered to remove ambiguity and deliver complete certainty from search to keys.
          </p>
        </div>

        {/* Steps Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {steps.map(step => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.num}
                className="capability-card"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-subtle)',
                  padding: '2.25rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--gold-subtle)',
                    color: 'var(--gold-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComponent size={20} />
                  </div>

                  <span style={{
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    color: 'var(--gold-primary)',
                    letterSpacing: '-0.03em'
                  }}>
                    {step.num}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '0.35rem'
                }}>
                  {step.title}
                </h3>

                <div style={{
                  fontSize: '0.925rem',
                  fontWeight: 600,
                  color: 'var(--gold-primary)',
                  marginBottom: '0.75rem'
                }}>
                  "{step.subtitle}"
                </div>

                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6
                }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
