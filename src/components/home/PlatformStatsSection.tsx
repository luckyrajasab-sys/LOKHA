import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Award, Building, MapPin, Users, ShieldCheck } from 'lucide-react';
import type { PlatformStats } from '../../hooks/useLandingData';

interface PlatformStatsSectionProps {
  stats: PlatformStats;
}

export const PlatformStatsSection: React.FC<PlatformStatsSectionProps> = ({ stats }) => {
  const [counts, setCounts] = useState({
    properties: 0,
    verified: 0,
    cities: 0,
    agencies: 0,
    advisors: 0
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const duration = 1600;
          const steps = 32;
          const interval = duration / steps;
          let currentStep = 0;

          const targetProps = stats.propertiesCount || 12;
          const targetVerified = stats.verifiedCount || 10;
          const targetCities = stats.citiesCount || 8;
          const targetAgencies = stats.agenciesCount || 6;
          const targetAdvisors = stats.advisorsCount || 4;

          const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            setCounts({
              properties: Math.round(targetProps * progress),
              verified: Math.round(targetVerified * progress),
              cities: Math.round(targetCities * progress),
              agencies: Math.round(targetAgencies * progress),
              advisors: Math.round(targetAdvisors * progress)
            });

            if (currentStep >= steps) {
              clearInterval(timer);
              setCounts({
                properties: targetProps,
                verified: targetVerified,
                cities: targetCities,
                agencies: targetAgencies,
                advisors: targetAdvisors
              });
            }
          }, interval);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [stats, hasAnimated]);

  const metrics = [
    { label: 'Active Catalog', value: counts.properties, suffix: '+', icon: Building, desc: 'Verified luxury listings' },
    { label: 'Verified Title Deeds', value: counts.verified, suffix: '+', icon: ShieldCheck, desc: 'RERA & ownership vetted' },
    { label: 'Prime Metro Hubs', value: counts.cities, suffix: '', icon: MapPin, desc: 'Tier-1 & tier-2 capitals' },
    { label: 'Master Developers', value: counts.agencies, suffix: '', icon: Award, desc: 'Grade-A institutional partners' },
    { label: 'Certified Advisors', value: counts.advisors, suffix: '', icon: Users, desc: 'Accredited RERA agents' }
  ];

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '6rem 1.5rem',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            <TrendingUp size={15} />
            <span>Platform Momentum</span>
          </div>

          <h2 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}>
            Real metrics. True scale.
          </h2>

          <p className="editorial-sub" style={{ maxWidth: '580px', margin: '0.75rem auto 0' }}>
            Direct data synchronized with active Firestore records without fabricated numbers or inflation.
          </p>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem'
        }}>
          {metrics.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-subtle)',
                  padding: '2.25rem 1.5rem',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--gold-subtle)',
                  color: 'var(--gold-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem'
                }}>
                  <IconComponent size={20} />
                </div>

                <div className="stat-counter" style={{
                  fontSize: 'clamp(2.4rem, 4vw, 3rem)',
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                  marginBottom: '0.5rem'
                }}>
                  {item.value}{item.suffix}
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: '0.25rem' }}>
                  {item.label}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                  {item.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
