import React, { useState } from 'react';
import {
  X,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Heart,
  MessageSquare,
  Send,
  ExternalLink,
  Calendar,
  Eye,
  CheckCircle2,
  Share2,
  Compass
} from 'lucide-react';
import type { PropertyDocument } from '../../types/firebaseModels';
import { useToast } from '../common/Toast';

interface PropertyDetailModalProps {
  property: PropertyDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (property: PropertyDocument) => void;
  onInquire: (property: PropertyDocument) => void;
  isSaved?: boolean;
  onToggleSave?: (property: PropertyDocument) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  isOpen,
  onClose,
  onStartChat,
  onInquire,
  isSaved = false,
  onToggleSave
}) => {
  const { showToast } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!isOpen || !property) return null;

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'];

  const isRent = property.listingType === 'Rent';
  const displayPrice = isRent ? (property.rentAmount || property.price) : property.price;

  // Build exact Google Maps query with GPS coordinates or address
  const mapsQuery = (property.latitude && property.longitude)
    ? `${property.latitude},${property.longitude}`
    : `${property.address || ''}, ${property.city || ''}, ${property.state || ''} ${property.pincode || ''}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery.trim())}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Property link copied to clipboard!', 'success');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '92vh',
          backgroundColor: '#0C0C12',
          borderRadius: 'var(--radius-xl, 16px)',
          border: '1.5px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(212, 175, 55, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          color: '#FFFFFF'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(14, 14, 20, 0.95)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: 'var(--gold-primary, #D4AF37)',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase'
            }}>
              {property.listingType} • {property.propertyType}
            </span>
            <span style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              backgroundColor: property.status === 'available' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: property.status === 'available' ? '#22C55E' : '#EF4444',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'capitalize'
            }}>
              {property.status}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#A0A0B0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Share listing"
            >
              <Share2 size={16} />
            </button>

            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(property)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: isSaved ? '#EF4444' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title={isSaved ? 'Saved' : 'Save Property'}
              >
                <Heart size={16} fill={isSaved ? '#EF4444' : 'none'} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#A0A0B0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem 1.75rem' }}>
          {/* Main Photo Gallery */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              height: '380px',
              borderRadius: 'var(--radius-lg, 12px)',
              overflow: 'hidden',
              backgroundColor: '#08080C',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
            }}>
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={property.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Price Tag Overlay */}
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'rgba(7, 7, 10, 0.88)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(212, 175, 55, 0.4)'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#B0B0C0', textTransform: 'uppercase' }}>
                  {isRent ? 'Monthly Rental' : 'Official Asking Price'}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--gold-primary, #D4AF37)', lineHeight: 1.1 }}>
                  ₹ {displayPrice.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Thumbnails if multiple */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    style={{
                      width: '72px',
                      height: '52px',
                      borderRadius: 'var(--radius-sm, 6px)',
                      overflow: 'hidden',
                      padding: 0,
                      border: selectedImageIndex === idx ? '2px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                      opacity: selectedImageIndex === idx ? 1 : 0.6,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title and Address Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.25,
              marginBottom: '0.5rem'
            }}>
              {property.title}
            </h2>

            {/* Address with Google Maps link button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
              backgroundColor: 'rgba(212, 175, 55, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.22)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '0.85rem 1.2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D0D0E0', fontSize: '0.9rem' }}>
                <MapPin size={18} color="var(--gold-primary, #D4AF37)" style={{ flexShrink: 0 }} />
                <span>{property.address ? `${property.address}, ` : ''}{property.city}, {property.state} {property.pincode}</span>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.95rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: 'var(--gold-primary, #D4AF37)',
                  color: '#070709',
                  fontWeight: 800,
                  fontSize: '0.825rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)',
                  transition: 'transform 0.2s',
                  flexShrink: 0
                }}
              >
                <Compass size={15} />
                Open in Google Maps
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Specs Highlights */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.85rem',
            marginBottom: '1.75rem'
          }}>
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: '#111119',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#A0A0B0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <Bed size={14} color="#D4AF37" /> Bedrooms
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                {property.bedrooms > 0 ? `${property.bedrooms} BHK` : 'Studio'}
              </div>
            </div>

            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: '#111119',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#A0A0B0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <Bath size={14} color="#D4AF37" /> Bathrooms
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                {property.bathrooms} Baths
              </div>
            </div>

            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: '#111119',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#A0A0B0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <Maximize2 size={14} color="#D4AF37" /> Super Area
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                {property.area.toLocaleString()} {property.areaUnit}
              </div>
            </div>

            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: '#111119',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#A0A0B0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <CheckCircle2 size={14} color="#D4AF37" /> Furnishing
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                {property.furnishedStatus}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.65rem' }}>
              Property Overview & Description
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#C0C0D0', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {property.description || 'Exclusive luxury real estate property available through Lokha. Direct owner communication and verification details available upon inquiry.'}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem' }}>
                Luxury Amenities & Features
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {property.amenities.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#E0E0EE',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    <CheckCircle2 size={13} color="var(--gold-primary, #D4AF37)" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: '0.78rem',
            color: '#8A8A9C'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} /> Listed on {new Date(property.createdAt).toLocaleDateString()}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Eye size={14} /> {property.views || 1} verified views
            </span>
            {property.latitude && property.longitude && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={14} /> GPS: {property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1.1rem 1.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(14, 14, 20, 0.98)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#9090A0' }}>
              Free direct communication: <strong style={{ color: '#D4AF37' }}>3 attempts included</strong>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#707080' }}>
              Subsequent inquiries require Lokha Premium (₹350, ₹500, ₹750)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartChat(property);
              }}
              className="btn btn-secondary btn-md"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.15rem',
                fontSize: '0.85rem'
              }}
            >
              <MessageSquare size={16} />
              Chat with Owner
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onInquire(property);
              }}
              className="btn btn-primary btn-md"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.35rem',
                fontSize: '0.85rem',
                fontWeight: 800
              }}
            >
              <Send size={15} />
              Submit Official Inquiry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
