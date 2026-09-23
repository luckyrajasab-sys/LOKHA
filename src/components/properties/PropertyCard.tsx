import React, { useState } from 'react';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Heart,
  ShieldCheck,
  Calendar,
  Phone,
  Building
} from 'lucide-react';
import type { PropertyDocument } from '../../types/firebaseModels';

interface PropertyCardProps {
  property: PropertyDocument;
  isFavorite?: boolean;
  viewMode?: 'split' | 'grid' | 'map';
  isHighlighted?: boolean;
  onSelect?: (property: PropertyDocument) => void;
  onToggleFavorite?: (property: PropertyDocument) => void;
  onRequestVisit?: (property: PropertyDocument) => void;
  onRequestCallback?: (property: PropertyDocument) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavorite = false,
  viewMode = 'grid',
  isHighlighted = false,
  onSelect,
  onToggleFavorite,
  onRequestVisit,
  onRequestCallback,
  onMouseEnter,
  onMouseLeave
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isSplit = viewMode === 'split';

  const defaultImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';
  const displayImage = property.images?.[0] || defaultImage;

  const formatPrice = (amount: number) => {
    if (!amount) return 'Price on Request';
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  const isStay = property.listingType === 'Stay' ||
    property.propertyId.includes('stay') ||
    property.title.toLowerCase().includes('stay') ||
    property.title.toLowerCase().includes('resort');

  const isProject = Boolean(property.builderName || property.constructionStatus === 'Under Construction' || property.possessionTimeline);

  const reraNumber = property.compliance?.reraNumber || property.reraNumber;

  const bedrooms = property.specifications?.bedrooms || property.bedrooms || 3;
  const bathrooms = property.specifications?.bathrooms || property.bathrooms || 3;
  const areaSqFt = property.specifications?.areaSqFt || property.area || 2200;

  return (
    <div
      onClick={() => onSelect && onSelect(property)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-property-id={property.propertyId}
      className={`lokha-luxury-card ${isHighlighted ? 'highlighted-map-pin' : ''}`}
      style={{
        display: 'flex',
        flexDirection: isSplit ? 'row' : 'column',
        backgroundColor: 'var(--bg-card, #121217)',
        borderRadius: 'var(--radius-lg, 14px)',
        border: isHighlighted
          ? '2px solid var(--gold-primary, #D4AF37)'
          : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        boxShadow: isHighlighted
          ? '0 12px 30px rgba(212, 175, 55, 0.35)'
          : '0 8px 24px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
        position: 'relative'
      }}
    >
      {/* 1. Media Section */}
      <div
        style={{
          width: isSplit ? '240px' : '100%',
          height: isSplit ? 'auto' : '230px',
          minHeight: isSplit ? '180px' : '230px',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#0A0A0E'
        }}
      >
        <img
          src={displayImage}
          alt={property.title}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease, opacity 0.3s ease',
            opacity: imageLoaded ? 1 : 0.4
          }}
          className="card-media-img"
        />

        {/* Purpose / Mode Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            padding: '0.28rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            backgroundColor: isStay ? '#F97316' : property.listingType === 'Rent' ? '#10B981' : isProject ? '#8B5CF6' : 'var(--gold-primary, #D4AF37)',
            color: '#070709',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            zIndex: 2
          }}
        >
          {isStay ? 'Boutique Stay' : isProject ? 'Developer Project' : property.listingType === 'Rent' ? 'For Rent' : 'Exclusive Sale'}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleFavorite) onToggleFavorite(property);
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isFavorite ? '#EF4444' : '#FFFFFF',
            cursor: 'pointer',
            zIndex: 2,
            transition: 'transform 0.15s ease'
          }}
          aria-label="Save to favorites"
        >
          <Heart size={16} fill={isFavorite ? '#EF4444' : 'none'} />
        </button>

        {/* Verified Agent Ribbon / Chip */}
        {property.verificationStatus === 'verified' && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              padding: '0.25rem 0.55rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#22C55E',
              fontSize: '0.68rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              zIndex: 2
            }}
          >
            <ShieldCheck size={13} />
            <span>Verified Estate</span>
          </div>
        )}
      </div>

      {/* 2. Details Section */}
      <div
        style={{
          padding: '1.15rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
          minWidth: 0
        }}
      >
        <div>
          {/* Price & Rate */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-primary, #FFFFFF)',
                letterSpacing: '-0.02em'
              }}
            >
              {isStay && property.stayNightlyPrice ? `₹${property.stayNightlyPrice.toLocaleString()} / night` : formatPrice(property.price)}
            </span>

            {/* RERA Badge Pill on Indian Listings */}
            {reraNumber && (
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.45rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(212, 175, 55, 0.12)',
                  color: 'var(--gold-primary, #D4AF37)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  letterSpacing: '0.04em'
                }}
                title={`RERA Approved: ${reraNumber}`}
              >
                RERA ✓
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '0.975rem',
              fontWeight: 700,
              color: 'var(--text-primary, #FFFFFF)',
              margin: '0 0 0.35rem 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {property.title}
          </h3>

          {/* Location */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--text-secondary, #9CA3AF)',
              fontSize: '0.8rem',
              marginBottom: '0.75rem'
            }}
          >
            <MapPin size={13} color="var(--gold-primary, #D4AF37)" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {property.location?.city || property.city || 'India'}, {property.location?.state || property.state || ''}
            </span>
          </div>

          {/* Builder or Verified Agent Micro-Bar */}
          {property.builderName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#8B5CF6', marginBottom: '0.65rem', fontWeight: 600 }}>
              <Building size={12} />
              <span>By {property.builderName} • {property.possessionTimeline || 'Ready to Move'}</span>
            </div>
          ) : property.verifiedAgent ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', color: 'var(--text-secondary, #9CA3AF)', marginBottom: '0.65rem' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--gold-primary, #D4AF37)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800 }}>
                {property.verifiedAgent.name.charAt(0)}
              </div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary, #FFFFFF)' }}>{property.verifiedAgent.name}</span>
              <span style={{ fontSize: '0.7rem', color: '#10B981' }}>★ {property.verifiedAgent.rating}</span>
            </div>
          ) : null}

          {/* Key Specs Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              paddingTop: '0.55rem',
              borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
              color: 'var(--text-secondary, #9CA3AF)',
              fontSize: '0.78rem'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Bed size={14} color="var(--gold-primary, #D4AF37)" />
              {bedrooms} Beds
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Bath size={14} color="var(--gold-primary, #D4AF37)" />
              {bathrooms} Baths
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Maximize2 size={14} color="var(--gold-primary, #D4AF37)" />
              {areaSqFt.toLocaleString()} sq.ft
            </span>
          </div>
        </div>

        {/* 3. Persistent Action CTAs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.85rem'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onRequestVisit) onRequestVisit(property);
            }}
            style={{
              flex: 1,
              padding: '0.55rem 0.65rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: 'var(--gold-primary, #D4AF37)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
            className="card-cta-btn"
          >
            <Calendar size={13} />
            <span>Schedule Visit</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onRequestCallback) onRequestCallback(property);
            }}
            style={{
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'var(--text-primary, #FFFFFF)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
            className="card-cta-btn"
          >
            <Phone size={13} />
            <span>Callback</span>
          </button>
        </div>
      </div>

      <style>{`
        .lokha-luxury-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6) !important;
          border-color: rgba(212, 175, 55, 0.45) !important;
        }
        .lokha-luxury-card:hover .card-media-img {
          transform: scale(1.04);
        }
        .card-cta-btn:hover {
          filter: brightness(1.15);
        }
      `}</style>
    </div>
  );
};
