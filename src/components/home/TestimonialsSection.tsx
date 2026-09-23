import React from 'react';
import { Star, MessageCircle, Quote } from 'lucide-react';
import type { CommunityReview } from '../../hooks/useLandingData';

interface TestimonialsSectionProps {
  reviews: CommunityReview[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ reviews }) => {
  return (
    <section style={{
      padding: '7rem 1.5rem',
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            <MessageCircle size={15} />
            <span>Community Experiences</span>
          </div>

          <h2 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}>
            Stories from the LOKHA community.
          </h2>

          <p className="editorial-sub" style={{ maxWidth: '580px', margin: '0.75rem auto 0' }}>
            Authentic reflections from homeowners, institutional buyers, and corporate lessees across our network.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem'
        }}>
          {reviews.map(rev => (
            <div
              key={rev.reviewId}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
                padding: '2.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--gold-subtle)' }}>
                <Quote size={38} />
              </div>

              <div>
                {/* Rating Stars */}
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="var(--gold-primary)" color="var(--gold-primary)" />
                  ))}
                </div>

                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                  marginBottom: '2rem'
                }}>
                  "{rev.comment}"
                </p>
              </div>

              {/* Author Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1.25rem'
              }}>
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-full)',
                    objectFit: 'cover',
                    border: '1px solid var(--border-gold)'
                  }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {rev.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                    {rev.role} • {rev.location}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', fontWeight: 600, marginTop: '0.15rem' }}>
                    {rev.propertyType}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
