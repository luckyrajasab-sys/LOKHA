import React from 'react';
import { MapPin, ShieldCheck, Heart, ArrowRight, Bed, Maximize, Sparkles } from 'lucide-react';
import type { PropertyDocument } from '../../types/firebaseModels';
import { useAuth } from '../../context/AuthContext';
import { toggleFavorite } from '../../services/favoriteService';
import { useToast } from '../common/Toast';

interface FeaturedPropertiesSectionProps {
  properties: PropertyDocument[];
  loading: boolean;
  onNavigate: (view: string, location?: string) => void;
}

export const FeaturedPropertiesSection: React.FC<FeaturedPropertiesSectionProps> = ({
  properties,
  loading,
  onNavigate
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleToggleFavorite = async (e: React.MouseEvent, property: PropertyDocument) => {
    e.stopPropagation();
    if (!user) {
      showToast('Please sign in to save properties to your portfolio', 'info');
      onNavigate('login');
      return;
    }
    try {
      const isSaved = await toggleFavorite(user.id, property);
      showToast(isSaved ? 'Added to Saved Portfolio' : 'Removed from Saved Portfolio', 'success');
    } catch {
      showToast('Could not update saved properties', 'error');
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(price / 100000).toFixed(2)} Lakh`;
  };

  return (
    <section style={{
      padding: '6rem 1.5rem',
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container">
        {/* Section Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div>
            <div className="section-eyebrow">
              <Sparkles size={14} />
              <span>Curated Prime Residences</span>
            </div>
            <h2 className="editorial-title" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}>
              Places worth discovering.
            </h2>
            <p className="editorial-sub" style={{ marginTop: '0.5rem', maxWidth: '560px' }}>
              A selection of properties currently available through LOKHA, verified for clear legal title and architectural distinction.
            </p>
          </div>

          <button
            onClick={() => onNavigate('properties')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--gold-primary)',
              fontWeight: 700,
              fontSize: '0.95rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem 0',
              transition: 'gap 0.2s ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.gap = '0.75rem')}
            onMouseLeave={e => (e.currentTarget.style.gap = '0.5rem')}
          >
            <span>View All Properties</span>
            <ArrowRight size={17} />
          </button>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div
                key={n}
                style={{
                  height: '420px',
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  animation: 'pulse 1.5s infinite'
                }}
              />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {properties.map(property => {
              const image = property.images?.[0] ||
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
              const priceDisplay = property.price ? formatPrice(property.price) : 'Price on Request';
              const bhk = property.specifications?.bedrooms || 3;
              const area = property.specifications?.areaSqFt ? `${property.specifications.areaSqFt.toLocaleString()} sq.ft` : '2,400 sq.ft';
              const locationText = `${property.locality || 'Prime Enclave'}, ${property.city || 'India'}`;

              return (
                <div
                  key={property.propertyId}
                  onClick={() => onNavigate(`property-${property.propertyId}`)}
                  className="capability-card"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border-subtle)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Card Image Container */}
                  <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                    <img
                      src={image}
                      alt={property.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1.0)')}
                    />

                    {/* Top Badges */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'flex',
                      gap: '0.4rem'
                    }}>
                      <span style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'rgba(7, 7, 9, 0.75)',
                        backdropFilter: 'blur(8px)',
                        color: '#FFFFFF',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        {property.listingType || 'For Sale'}
                      </span>

                      {property.verificationStatus === 'verified' && (
                        <span style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'rgba(34, 197, 94, 0.9)',
                          color: '#FFFFFF',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <ShieldCheck size={12} />
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={e => handleToggleFavorite(e, property)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(8px)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#18181B',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1.0)')}
                      title="Save Property"
                      aria-label="Save Property"
                    >
                      <Heart size={17} />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '0.4rem' }}>
                      <MapPin size={14} color="var(--gold-primary)" />
                      <span>{locationText}</span>
                    </div>

                    <h3 style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      lineHeight: 1.3,
                      marginBottom: '0.75rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {property.title}
                    </h3>

                    {/* Specs Row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      color: 'var(--text-tertiary)',
                      fontSize: '0.825rem',
                      paddingBottom: '0.85rem',
                      marginBottom: '0.85rem',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Bed size={15} color="var(--text-secondary)" />
                        {bhk} BHK
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Maximize size={14} color="var(--text-secondary)" />
                        {area}
                      </span>
                    </div>

                    {/* Price & Action Row */}
                    <div style={{
                      marginTop: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Guide Price
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                          {priceDisplay}
                        </div>
                      </div>

                      <span style={{
                        padding: '0.45rem 0.95rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'all 0.2s'
                      }}>
                        View <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
