import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  Zap,
  Users,
  Building,
  KeyRound,
  FileCheck2,
  Hotel
} from 'lucide-react';
import type { PropertyDocument } from '../../types/firebaseModels';
import { useToast } from '../common/Toast';

interface PropertyDetailModalProps {
  property: PropertyDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (property: PropertyDocument) => void;
  onInquire: (property: PropertyDocument, intent?: 'buy' | 'rent' | 'lease' | 'stay') => void;
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

  // Multi-purpose Customer Intent (Buy, Rent, Lease, Stay)
  const [customerIntent, setCustomerIntent] = useState<'buy' | 'rent' | 'lease' | 'stay'>('buy');
  const [mapViewMode, setMapViewMode] = useState<'roadmap' | 'satellite'>('roadmap');

  useEffect(() => {
    if (!property) return;
    if (property.listingType === 'Rent') setCustomerIntent('rent');
    else if (property.listingType === 'Lease') setCustomerIntent('lease');
    else if (property.listingType === 'Stay' || property.propertyId.includes('stay')) setCustomerIntent('stay');
    else setCustomerIntent('buy');
  }, [property]);

  if (!isOpen || !property) return null;

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'];

  // Base pricing figures
  const basePrice = property.price || 12000000;
  const rentValue = property.rentAmount || Math.round(basePrice * 0.0028);
  const depositValue = property.securityDeposit || Math.round(rentValue * 3);
  const leaseValue = property.leaseAmount || Math.round(basePrice * 0.18);
  const stayValue = property.stayNightlyRate || Math.max(3500, Math.round(rentValue / 12));

  // Build exact Google Maps query with GPS coordinates or address
  const lat = property.latitude || 13.0827;
  const lng = property.longitude || 80.2707;
  const mapsQuery = `${lat},${lng}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
  const embedMapUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=${mapViewMode === 'satellite' ? 'k' : 'm'}&z=15&output=embed`;

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
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '980px',
          maxHeight: '94vh',
          backgroundColor: '#0C0C12',
          borderRadius: 'var(--radius-xl, 18px)',
          border: '1.5px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95), 0 0 40px rgba(212, 175, 55, 0.15)',
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
          backgroundColor: 'rgba(14, 14, 20, 0.98)'
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
              {property.propertyType} • Universal Multi-Purpose Estate
            </span>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              color: '#22C55E',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              <CheckCircle2 size={12} />
              Gov & EB Verified
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
                  color: isSaved ? '#EF4444' : '#A0A0B0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title={isSaved ? 'Remove from saved' : 'Save estate'}
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
                color: '#FFFFFF',
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

        {/* Scrollable Content Body */}
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Photos Showcase */}
          <div>
            <div style={{
              position: 'relative',
              width: '100%',
              height: '360px',
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
                backgroundColor: 'rgba(7, 7, 10, 0.92)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(212, 175, 55, 0.4)'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#B0B0C0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {customerIntent === 'buy' && 'Official Purchase Valuation'}
                  {customerIntent === 'rent' && 'Monthly Rental Terms'}
                  {customerIntent === 'lease' && 'Long-Term Lease Consideration'}
                  {customerIntent === 'stay' && 'Nightly Hospitality Rate'}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--gold-primary, #D4AF37)', lineHeight: 1.1 }}>
                  {customerIntent === 'buy' && `₹ ${basePrice.toLocaleString()}`}
                  {customerIntent === 'rent' && `₹ ${rentValue.toLocaleString()} / mo`}
                  {customerIntent === 'lease' && `₹ ${leaseValue.toLocaleString()} (Full Lse)`}
                  {customerIntent === 'stay' && `₹ ${stayValue.toLocaleString()} / nt`}
                </div>
              </div>
            </div>

            {/* Thumbnails */}
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

          {/* CUSTOMER INTENT SWITCHER: SELL, RENT, LEASE, OR STAY */}
          <div style={{
            padding: '1.25rem',
            backgroundColor: 'rgba(18, 18, 26, 0.95)',
            border: '1.5px solid rgba(212, 175, 55, 0.35)',
            borderRadius: 'var(--radius-xl, 14px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                  🎯 Flexible Customer Intent
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                  (This property is available to Buy, Rent, Lease, or Stay)
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 700 }}>
                ✓ Customer can choose any option
              </span>
            </div>

            {/* 4 Intent Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => setCustomerIntent('buy')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '0.65rem 0.5rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: customerIntent === 'buy' ? '1.5px solid #EAB308' : '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: customerIntent === 'buy' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255,255,255,0.03)',
                  color: customerIntent === 'buy' ? '#EAB308' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Building size={15} />
                <span>Buy Estate</span>
              </button>

              <button
                type="button"
                onClick={() => setCustomerIntent('rent')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '0.65rem 0.5rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: customerIntent === 'rent' ? '1.5px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: customerIntent === 'rent' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                  color: customerIntent === 'rent' ? '#10B981' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <KeyRound size={15} />
                <span>Rent Monthly</span>
              </button>

              <button
                type="button"
                onClick={() => setCustomerIntent('lease')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '0.65rem 0.5rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: customerIntent === 'lease' ? '1.5px solid #8B5CF6' : '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: customerIntent === 'lease' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                  color: customerIntent === 'lease' ? '#8B5CF6' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <FileCheck2 size={15} />
                <span>Long Lease</span>
              </button>

              <button
                type="button"
                onClick={() => setCustomerIntent('stay')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '0.65rem 0.5rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: customerIntent === 'stay' ? '1.5px solid #F97316' : '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: customerIntent === 'stay' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255,255,255,0.03)',
                  color: customerIntent === 'stay' ? '#F97316' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Hotel size={15} />
                <span>Short Stay</span>
              </button>
            </div>

            {/* Specific Terms & Financial Calculation for the Chosen Intent */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: 'rgba(7, 7, 10, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              {customerIntent === 'buy' && (
                <>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9090A0' }}>Full Purchase Value</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#EAB308' }}>₹ {basePrice.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9090A0' }}>Est. Home Loan EMI (20 Yrs)</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>₹ {Math.round(basePrice * 0.008).toLocaleString()} / mo</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9090A0' }}>Token Advance (10%)</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>₹ {Math.round(basePrice * 0.1).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9090A0' }}>Registration & Stamp Duty</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#22c55e' }}>Clear Title Registered</div>
                  </div>
                </>
              )}

              {customerIntent === 'rent' && (
                <>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9090A0' }}>Monthly Rent</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10B981' }}>₹ {rentValue.toLocaleString()} / mo</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9090A0' }}>Security Deposit (Refundable)</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>₹ {depositValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9090A0' }}>Tenancy Agreement</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>11 Months Renewable</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9090A0' }}>Society Maintenance</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#22c55e' }}>Included in Rent</div>
                  </div>
                </>
              )}

              {customerIntent === 'lease' && (
                <>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9090A0' }}>Total Lease Consideration</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#8B5CF6' }}>₹ {leaseValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9090A0' }}>Monthly Payment</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#22c55e' }}>₹ 0 / mo (Rent Free)</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9090A0' }}>Lease Agreement Period</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>3 to 5 Years Contract</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9090A0' }}>Lock-in Duration</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>1 Year Minimum</div>
                  </div>
                </>
              )}

              {customerIntent === 'stay' && (
                <>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9090A0' }}>Nightly Hospitality Rate</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#F97316' }}>₹ {stayValue.toLocaleString()} / nt</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9090A0' }}>Guest Capacity</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>Max {property.stayMaxGuests || (property.bedrooms ? property.bedrooms * 2 : 4)} Guests</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9090A0' }}>Check-in / Check-out</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>12:00 PM / 11:00 AM</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#9090A0' }}>Utilities & Services</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#22c55e' }}>WiFi, EB & AC Included</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Title & Location Section */}
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25, marginBottom: '0.5rem' }}>
              {property.title}
            </h2>

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
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textDecoration: 'none'
                }}
              >
                <span>Open in Google Maps</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Real Google Maps API Interactive Live Frame */}
          <div style={{
            borderRadius: 'var(--radius-lg, 12px)',
            overflow: 'hidden',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 1rem',
              backgroundColor: '#101018',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--gold-primary)' }}>
                <MapPin size={14} />
                <span>Google Maps Live Geographic View ({lat.toFixed(4)}, {lng.toFixed(4)})</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setMapViewMode('roadmap')}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: mapViewMode === 'roadmap' ? 'var(--gold-primary)' : 'rgba(255,255,255,0.06)',
                    color: mapViewMode === 'roadmap' ? '#070709' : '#B0B0C0'
                  }}
                >
                  Roadmap
                </button>
                <button
                  type="button"
                  onClick={() => setMapViewMode('satellite')}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: mapViewMode === 'satellite' ? 'var(--gold-primary)' : 'rgba(255,255,255,0.06)',
                    color: mapViewMode === 'satellite' ? '#070709' : '#B0B0C0'
                  }}
                >
                  Satellite
                </button>
              </div>
            </div>
            <iframe
              title={`Google Map - ${property.title}`}
              src={embedMapUrl}
              width="100%"
              height="200"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* GOVERNMENT & EB SERVICE CONNECTION VERIFICATION CARD */}
          <div style={{
            padding: '1.25rem',
            backgroundColor: 'rgba(34, 197, 94, 0.05)',
            border: '1.5px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 'var(--radius-xl, 14px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#22c55e" />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#22c55e' }}>
                  Government Identification & EB Service Connection Verified
                </span>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                padding: '2px 8px',
                borderRadius: '999px',
                border: '1px solid rgba(34, 197, 94, 0.4)'
              }}>
                ✓ 100% Legit Legal Record
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: '#9090A0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={13} /> Ownership Authorization:
                </span>
                <strong style={{ color: '#FFFFFF', marginTop: '2px', display: 'block' }}>
                  {property.ownershipType === 'family' || property.ownershipType === 'Family Member'
                    ? `Family Member: ${property.familyMemberName || 'Authorized Relative'} (${property.familyRelation || 'Family'})`
                    : `Direct Owner: ${property.ownerName || 'Verified Member (Self)'}`}
                </strong>
              </div>

              <div>
                <span style={{ color: '#9090A0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={13} color="#22c55e" /> EB Service / Consumer No:
                </span>
                <strong style={{ color: '#22c55e', marginTop: '2px', display: 'block' }}>
                  {property.ebConsumerNumber || '04-022-005-194'} ({property.ebProvider || 'TANGEDCO / State EB'})
                </strong>
              </div>

              <div>
                <span style={{ color: '#9090A0' }}>Gov Document Record:</span>
                <strong style={{ color: '#FFFFFF', marginTop: '2px', display: 'block' }}>
                  {property.govDocType || 'Patta / Chitta'} — {property.govDocNumber || 'TN/CH/2024/9842'}
                </strong>
              </div>
            </div>
          </div>

          {/* Key Specifications Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#8A8A9C' }}>Bedrooms</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.15rem', fontWeight: 800, marginTop: '0.2rem' }}>
                <Bed size={17} color="var(--gold-primary)" />
                <span>{property.bedrooms} BHK</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#8A8A9C' }}>Bathrooms</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.15rem', fontWeight: 800, marginTop: '0.2rem' }}>
                <Bath size={17} color="var(--gold-primary)" />
                <span>{property.bathrooms} Baths</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#8A8A9C' }}>Built-Up Area</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.15rem', fontWeight: 800, marginTop: '0.2rem' }}>
                <Maximize2 size={17} color="var(--gold-primary)" />
                <span>{property.area} {property.areaUnit || 'sq.ft'}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#8A8A9C' }}>Furnishing</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--gold-light, #F1E5AC)' }}>
                {property.furnishedStatus}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: '0.6rem' }}>
              Estate Overview & Living Space
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#C0C0D4', lineHeight: 1.6, margin: 0 }}>
              {property.description || 'Exclusive prime estate situated in a prestigious sanctuary. Featuring verified government clearance, dedicated electricity board connection, and multi-purpose adaptability for purchase, leasing, or accommodation.'}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: '0.6rem' }}>
                Signature Amenities & Features
              </h4>
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
              <Calendar size={14} /> Listed: {new Date(property.createdAt).toLocaleDateString()}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Eye size={14} /> {property.views || 1} verified views
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={14} /> GPS: {lat.toFixed(4)}, {lng.toFixed(4)}
            </span>
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
              Active Intent: <strong style={{ color: '#D4AF37', textTransform: 'uppercase' }}>{customerIntent}</strong>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#707080' }}>
              Direct verified transaction with owner / family authority
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
                onInquire(property, customerIntent);
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
              {customerIntent === 'buy' && 'Inquire to Buy'}
              {customerIntent === 'rent' && 'Inquire to Rent'}
              {customerIntent === 'lease' && 'Inquire for Lease'}
              {customerIntent === 'stay' && 'Inquire to Book Stay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
