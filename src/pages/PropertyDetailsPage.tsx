import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Heart,
  Share2,
  ShieldCheck,
  Zap,
  Phone,
  MessageCircle,
  Calendar,
  Compass,
  Building,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  DollarSign,
  Calculator,
  Car,
  FileCheck2,
  Sparkles,
  Layers
} from 'lucide-react';
import type { PropertyDocument } from '../types/firebaseModels';
import { getPropertyById, incrementPropertyViews, getSimilarProperties } from '../services/propertyService';
import { isPropertySaved, toggleFavorite } from '../services/favoriteService';
import { bookSiteVisit } from '../services/siteVisitService';
import { createEnquiry } from '../services/enquiryService';
import { submitReport } from '../services/reportService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

interface PropertyDetailsPageProps {
  propertyId: string;
  onNavigate: (view: string, location?: string) => void;
  onCompareAdd?: (property: PropertyDocument) => void;
}

export const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({
  propertyId,
  onNavigate,
  onCompareAdd
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [property, setProperty] = useState<PropertyDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImgIndex, setSelectedImgIndex] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [similarProperties, setSimilarProperties] = useState<PropertyDocument[]>([]);

  // Modals
  const [siteVisitOpen, setSiteVisitOpen] = useState<boolean>(false);
  const [enquiryOpen, setEnquiryOpen] = useState<boolean>(false);
  const [reportOpen, setReportOpen] = useState<boolean>(false);

  // Site Visit Form State
  const [visitDate, setVisitDate] = useState<string>('');
  const [visitTimeSlot, setVisitTimeSlot] = useState<string>('11:00 AM - 12:30 PM');
  const [visitorName, setVisitorName] = useState<string>(user?.displayName || '');
  const [visitorPhone, setVisitorPhone] = useState<string>(user?.phone || '');
  const [visitorNotes, setVisitorNotes] = useState<string>('');
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);

  // Enquiry Form State
  const [enquiryName, setEnquiryName] = useState<string>(user?.displayName || '');
  const [enquiryEmail, setEnquiryEmail] = useState<string>(user?.email || '');
  const [enquiryPhone, setEnquiryPhone] = useState<string>(user?.phone || '');
  const [enquiryMessage, setEnquiryMessage] = useState<string>('I am interested in this luxury property and would like more details regarding pricing, site visit, and floor plans.');
  const [enquiryLoading, setEnquiryLoading] = useState<boolean>(false);

  // Report Form State
  const [reportReason, setReportReason] = useState<string>('Inaccurate Information');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reportLoading, setReportLoading] = useState<boolean>(false);

  // EMI Calculator Mini State
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.5);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadData() {
      try {
        const doc = await getPropertyById(propertyId);
        if (!isMounted) return;

        if (doc) {
          setProperty(doc);
          incrementPropertyViews(propertyId);
          // Check saved status
          if (user?.id) {
            const saved = await isPropertySaved(user.id, propertyId);
            if (isMounted) setIsSaved(saved);
          }
          // Fetch similar properties
          const similar = await getSimilarProperties(doc, 3);
          if (isMounted) setSimilarProperties(similar);
        }
      } catch (err) {
        console.error('Failed to load property details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [propertyId, user?.id]);

  if (loading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary, #070709)',
        color: 'var(--gold-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(212, 175, 55, 0.2)',
            borderTopColor: 'var(--gold-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>Loading luxury estate portfolio...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-primary)'
      }}>
        <AlertTriangle size={56} color="var(--gold-primary)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Listing Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', marginBottom: '1.5rem' }}>
          The luxury property you requested might have been sold, archived, or is currently under private verification.
        </p>
        <button
          onClick={() => onNavigate('properties')}
          style={{
            padding: '0.75rem 1.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--gold-primary)',
            color: '#070709',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Explore All Properties
        </button>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'];

  const priceVal = property.price || 15000000;
  const sqftVal = property.specifications?.areaSqFt || 2400;
  const pricePerSqft = Math.round(priceVal / sqftVal);

  const formatPrice = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  // EMI computation
  const loanPrincipal = priceVal * (1 - downPaymentPct / 100);
  const monthlyRate = interestRate / (12 * 100);
  const totalMonths = loanTenureYears * 12;
  const estimatedEMI = Math.round(
    (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );

  const handleToggleSave = async () => {
    if (!user) {
      showToast('Please sign in to save properties to your private portfolio', 'info');
      onNavigate('login');
      return;
    }
    try {
      const nowSaved = await toggleFavorite(user.id, property);
      setIsSaved(nowSaved);
      showToast(nowSaved ? 'Added to Saved Portfolio' : 'Removed from Saved Portfolio', 'success');
    } catch {
      showToast('Could not update favorites. Try again.', 'error');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Listing link copied to clipboard!', 'success');
    }
  };

  const handleBookVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to schedule an in-person site visit', 'info');
      onNavigate('login');
      return;
    }
    if (!visitDate) {
      showToast('Please choose a preferred visit date', 'error');
      return;
    }

    setBookingLoading(true);
    try {
      await bookSiteVisit({
        propertyId: property.propertyId,
        propertyTitle: property.title,
        propertyCity: property.location?.city || 'India',
        propertyImage: images[0],
        ownerId: property.ownerId || 'admin',
        buyerId: user.id,
        buyerName: visitorName || user.displayName || 'Prospective Buyer',
        buyerEmail: user.email || '',
        buyerPhone: visitorPhone || user.phone || '',
        preferredDate: visitDate,
        preferredTimeSlot: visitTimeSlot,
        notes: visitorNotes
      });
      showToast('Site visit scheduled successfully! The property concierge will contact you shortly.', 'success');
      setSiteVisitOpen(false);
    } catch {
      showToast('Failed to schedule visit. Please try again.', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryLoading(true);
    try {
      await createEnquiry({
        propertyId: property.propertyId,
        propertyTitle: property.title,
        ownerId: property.ownerId || 'admin',
        buyerId: user?.id || 'guest',
        buyerName: enquiryName || 'Prospective Buyer',
        buyerEmail: enquiryEmail,
        buyerPhone: enquiryPhone,
        message: enquiryMessage
      });
      showToast('Direct enquiry dispatched to the verified representative!', 'success');
      setEnquiryOpen(false);
    } catch {
      showToast('Failed to dispatch enquiry. Please try again.', 'error');
    } finally {
      setEnquiryLoading(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      await submitReport({
        propertyId: property.propertyId,
        reportedByUserId: user?.id || 'anonymous',
        reason: reportReason,
        details: reportDetails
      });
      showToast('Report submitted. Our legal and compliance team will audit this listing within 24 hours.', 'success');
      setReportOpen(false);
    } catch {
      showToast('Failed to submit report. Please try again.', 'error');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary, #070709)',
      color: 'var(--text-primary, #FFFFFF)',
      minHeight: '100vh',
      paddingBottom: '5rem'
    }}>
      {/* 1. Breadcrumb Bar */}
      <div style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.85rem 1.5rem',
        backgroundColor: '#0A0A0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.825rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('home')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            Home
          </button>
          <ChevronRight size={14} />
          <button
            onClick={() => onNavigate('properties')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            Properties
          </button>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>
            {property.location?.city || 'India'}
          </span>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-primary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {property.title}
          </span>
        </div>

        <button
          onClick={() => onNavigate('properties')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'none',
            border: 'none',
            color: 'var(--gold-primary)',
            cursor: 'pointer',
            fontSize: '0.825rem',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> Back to Search
        </button>
      </div>

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '1.75rem 1.25rem' }}>
        {/* 2. Top Header Title & Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: property.listingType === 'Rent' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(212, 175, 55, 0.18)',
                color: property.listingType === 'Rent' ? '#60A5FA' : 'var(--gold-primary)',
                border: `1px solid ${property.listingType === 'Rent' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(212, 175, 55, 0.3)'}`
              }}>
                {property.listingType === 'Rent' ? 'For Rent / Lease' : 'For Exclusive Sale'}
              </span>

              {property.verificationStatus === 'verified' && (
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: '#22C55E',
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                  <ShieldCheck size={13} /> LOKHA Verified Estate
                </span>
              )}

              {property.compliance?.reraNumber && (
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  color: 'var(--gold-primary)',
                  border: '1px solid rgba(212, 175, 55, 0.25)'
                }}>
                  RERA: {property.compliance.reraNumber}
                </span>
              )}
            </div>

            <h1 style={{
              fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '0.45rem',
              color: '#FFFFFF'
            }}>
              {property.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <MapPin size={16} color="var(--gold-primary)" />
              <span>
                {property.location?.address
                  ? `${property.location.address}, ${property.location.city} - ${property.location.pincode || ''}`
                  : `${property.location?.city || 'India'}, ${property.location?.state || ''}`}
              </span>
            </div>
          </div>

          {/* Action buttons (Share, Save, Compare, Report) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={handleToggleSave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.15rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isSaved ? 'rgba(239, 68, 68, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isSaved ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.12)'}`,
                color: isSaved ? '#EF4444' : 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Heart size={16} fill={isSaved ? '#EF4444' : 'none'} />
              {isSaved ? 'Saved' : 'Save'}
            </button>

            {onCompareAdd && (
              <button
                onClick={() => {
                  onCompareAdd(property);
                  showToast('Added to property comparison sheet', 'success');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1.15rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <Layers size={16} /> Compare
              </button>
            )}

            <button
              onClick={handleShare}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.15rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Share2 size={16} /> Share
            </button>

            <button
              onClick={() => setReportOpen(true)}
              title="Report inappropriate listing"
              style={{
                padding: '0.65rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'var(--text-tertiary)',
                cursor: 'pointer'
              }}
            >
              <AlertTriangle size={16} />
            </button>
          </div>
        </div>

        {/* 3. Luxury Gallery Visual Stage */}
        <div style={{ marginBottom: '2.5rem' }}>
          {/* Main Large Visual Stage */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: 'min(580px, 60vh)',
            borderRadius: 'var(--radius-xl, 16px)',
            overflow: 'hidden',
            backgroundColor: '#0D0D11',
            boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}>
            <img
              src={images[selectedImgIndex]}
              alt={property.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.4s ease'
              }}
            />

            <div style={{
              position: 'absolute',
              bottom: '1.25rem',
              right: '1.25rem',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#FFFFFF'
            }}>
              {selectedImgIndex + 1} / {images.length} Photos
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '0.85rem',
              overflowX: 'auto',
              paddingBottom: '0.35rem'
            }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  style={{
                    width: '90px',
                    height: '64px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    cursor: 'pointer',
                    border: selectedImgIndex === idx ? '2px solid var(--gold-primary)' : '2px solid transparent',
                    opacity: selectedImgIndex === idx ? 1 : 0.65,
                    transition: 'all 0.2s'
                  }}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Two Column Layout: Main Content (Left) + Sticky Conversion Card (Right) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          {/* Left Column: Specifications, Verified Documents, Amenities, Floor Plan, Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Quick Spec Highlights Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '1rem',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg, 12px)',
              backgroundColor: '#101017',
              border: '1px solid rgba(212, 175, 55, 0.16)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Layout</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Bed size={18} color="var(--gold-primary)" />
                  {property.specifications?.bedrooms || 3} BHK
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Super Area</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Maximize2 size={18} color="var(--gold-primary)" />
                  {sqftVal.toLocaleString()} sq.ft
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Bathrooms</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Bath size={18} color="var(--gold-primary)" />
                  {property.specifications?.bathrooms || 3} Baths
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Rate / Sqft</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <DollarSign size={18} color="var(--gold-primary)" />
                  ₹{pricePerSqft.toLocaleString()}/sqft
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Facing</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Compass size={18} color="var(--gold-primary)" />
                  {property.specifications?.facing || 'North-East'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Covered Parking</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Car size={18} color="var(--gold-primary)" />
                  {property.specifications?.parkingSpaces || 2} Slots
                </span>
              </div>
            </div>

            {/* Indian Verification & Due Diligence Badge Box */}
            <div style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg, 12px)',
              backgroundColor: 'rgba(34, 197, 94, 0.05)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={26} color="#22C55E" />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#22C55E' }}>
                    LOKHA Verified & Indian Legal Compliance Clearance
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    All legal title deeds, revenue patta records, and municipal authority clearances have been physically cross-verified.
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.85rem',
                paddingTop: '0.5rem',
                borderTop: '1px solid rgba(34, 197, 94, 0.15)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#22C55E" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>RERA Registration</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {property.compliance?.reraNumber || 'TN/01/Building/0145/2023'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <Zap size={16} color="#22C55E" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Electricity Board (EB) Consumer No.</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {property.compliance?.ebConsumerNumber || '04-128-091-842 (Verified Active)'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <FileCheck2 size={16} color="#22C55E" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Patta / Land Records</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {property.compliance?.pattaNumber || 'Freehold Title & CC Issued'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <div style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg, 12px)',
              backgroundColor: '#101017',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#FFFFFF' }}>
                Property Overview & Architectural Highlights
              </h2>
              <div style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                fontSize: '0.925rem',
                whiteSpace: 'pre-line'
              }}>
                {property.description || `Exquisitely crafted luxury residence located in one of India's most prestigious enclaves. Designed with bespoke imported Italian marble flooring, expansive private sundeck, high-ceiling architectural framework, and state-of-the-art climate automation.

Features full Vastu compliance, private elevator foyer access, multi-tier biometric security, dedicated servant quarters with separate entry, and unobstructed skyline vistas. Ideal for high-net-worth families, international executives, and discerning luxury investors.`}
              </div>
            </div>

            {/* Amenities Grid */}
            <div style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg, 12px)',
              backgroundColor: '#101017',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: '#FFFFFF' }}>
                Signature Amenities & Club Facilities
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.85rem'
              }}>
                {(property.amenities && property.amenities.length > 0
                  ? property.amenities
                  : [
                      'Temperature Controlled Pool',
                      'Private Concierge 24/7',
                      'High-Speed Private Elevators',
                      'State-of-Art Fitness Hub',
                      'EV Fast Charging Bays',
                      '100% DG Power Backup',
                      'Multi-Tier Biometric Security',
                      'Landscaped Zen Garden',
                      'Executive Conference Lounge',
                      'Children Play Zone & Squash'
                    ]
                ).map((amenity, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(212, 175, 55, 0.12)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Sparkles size={15} color="var(--gold-primary)" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Location & Nearby Landmarks */}
            <div style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg, 12px)',
              backgroundColor: '#101017',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#FFFFFF' }}>
                Prime Location & Neighborhood Transit
              </h2>

              <div style={{
                height: '280px',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '1.25rem',
                border: '1px solid rgba(212, 175, 55, 0.2)'
              }}>
                <iframe
                  title="Property Location Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${property.latitude || 13.0827},${property.longitude || 80.2707}&z=14&output=embed`}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem'
              }}>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  🚆 <strong>Metro Station:</strong> 850 meters (4 mins)
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  ✈️ <strong>International Airport:</strong> 11.5 km (22 mins)
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  🏥 <strong>Multi-Speciality Hospital:</strong> 1.8 km
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  🏫 <strong>International School:</strong> 2.4 km
                </div>
              </div>
            </div>

            {/* Integrated Loan & EMI Estimator */}
            <div style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg, 12px)',
              backgroundColor: '#101017',
              border: '1px solid rgba(212, 175, 55, 0.16)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Calculator size={22} color="var(--gold-primary)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Home Loan EMI Estimation
                </h2>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.4rem' }}>
                    Down Payment: {downPaymentPct}% ({formatPrice(priceVal * (downPaymentPct / 100))})
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    step={5}
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--gold-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.4rem' }}>
                    Loan Tenure: {loanTenureYears} Years
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={1}
                    value={loanTenureYears}
                    onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--gold-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.4rem' }}>
                    Interest Rate: {interestRate}% p.a.
                  </label>
                  <input
                    type="range"
                    min={7.5}
                    max={12}
                    step={0.1}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--gold-primary)' }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.25)'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Estimated Monthly EMI</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                    ₹{estimatedEMI.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/ month</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('emi-calculator')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--gold-primary)',
                    color: 'var(--gold-primary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Full Amortization Table →
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Conversion & Booking Box */}
          <div style={{
            position: 'sticky',
            top: '5.5rem',
            backgroundColor: '#101017',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: 'var(--radius-xl, 16px)',
            padding: '1.75rem',
            boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {property.listingType === 'Rent' ? 'Monthly Lease' : 'All-Inclusive Investment'}
              </span>
              <div style={{ fontSize: '2.15rem', fontWeight: 900, color: 'var(--gold-primary)', lineHeight: 1.15 }}>
                {formatPrice(priceVal)}
              </div>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                ₹{pricePerSqft.toLocaleString()} per sq.ft | Government Registration & Stamp Duty extra
              </span>
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Primary CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => setSiteVisitOpen(true)}
                style={{
                  width: '100%',
                  padding: '0.95rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--gold-primary)',
                  color: '#070709',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 16px rgba(212, 175, 55, 0.35)',
                  transition: 'all 0.2s'
                }}
              >
                <Calendar size={18} /> Book Free In-Person Site Visit
              </button>

              <button
                onClick={() => setEnquiryOpen(true)}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Building size={16} color="var(--gold-primary)" /> Contact Verified Agent / Concierge
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginTop: '0.25rem' }}>
                <a
                  href={`https://wa.me/919840182990?text=${encodeURIComponent(`Hello LOKHA Concierge, I am interested in ${property.title} in ${property.location?.city || ''}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.7rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(37, 211, 102, 0.12)',
                    border: '1px solid rgba(37, 211, 102, 0.3)',
                    color: '#25D366',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>

                <a
                  href="tel:+919840182990"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.7rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    color: 'var(--gold-primary)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={16} /> Direct Call
                </a>
              </div>
            </div>

            {/* Concierge Guarantee */}
            <div style={{
              padding: '0.85rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)',
              lineHeight: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <span style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>✨ LOKHA Buyer Shield & Guarantee</span>
              <span>• Zero spam calls — verified executive contact only</span>
              <span>• 100% legal title verification assistance</span>
              <span>• Complimentary luxury chauffeur for site inspections</span>
            </div>
          </div>
        </div>

        {/* 5. Similar Properties Carousel / Grid */}
        {similarProperties.length > 0 && (
          <div style={{ marginTop: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }}>
                  Similar Luxury Estates
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Handpicked properties in {property.location?.city || 'India'} matching this architectural caliber.
                </p>
              </div>

              <button
                onClick={() => onNavigate('properties', property.location?.city)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--gold-primary)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                View all in {property.location?.city || 'City'} →
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {similarProperties.map((sim) => (
                <div
                  key={sim.propertyId}
                  onClick={() => onNavigate(`property-${sim.propertyId}`)}
                  style={{
                    borderRadius: 'var(--radius-lg, 12px)',
                    backgroundColor: '#101017',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, border-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <div style={{ height: '180px', overflow: 'hidden' }}>
                    <img
                      src={sim.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80'}
                      alt={sim.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: '0.25rem' }}>
                      {formatPrice(sim.price || 12000000)}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#FFFFFF', marginBottom: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sim.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      <MapPin size={13} color="var(--gold-primary)" />
                      {sim.location?.city || 'India'} • {sim.specifications?.bedrooms || 3} BHK • {sim.specifications?.areaSqFt || 2000} sqft
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Book Site Visit */}
      {siteVisitOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#12121A',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: '0 24px 64px rgba(0,0,0,0.8)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.35rem' }}>
              Schedule Free In-Person Site Visit
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              For: <strong style={{ color: 'var(--gold-primary)' }}>{property.title}</strong>
            </p>

            <form onSubmit={handleBookVisitSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Preferred Date
                </label>
                <input
                  type="date"
                  required
                  value={visitDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setVisitDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#1A1A24',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Preferred Time Slot
                </label>
                <select
                  value={visitTimeSlot}
                  onChange={(e) => setVisitTimeSlot(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#1A1A24',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="10:00 AM - 11:30 AM">Morning: 10:00 AM - 11:30 AM</option>
                  <option value="11:30 AM - 01:00 PM">Noon: 11:30 AM - 01:00 PM</option>
                  <option value="02:30 PM - 04:00 PM">Afternoon: 02:30 PM - 04:00 PM</option>
                  <option value="04:30 PM - 06:00 PM">Evening Sunset: 04:30 PM - 06:00 PM</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={visitorName}
                    placeholder="E.g. Rajesh Kumar"
                    onChange={(e) => setVisitorName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#1A1A24',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={visitorPhone}
                    placeholder="+91 98765 43210"
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#1A1A24',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Special Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  value={visitorNotes}
                  placeholder="Need chauffeur pickup / want to inspect penthouse floor plan..."
                  onChange={(e) => setVisitorNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#1A1A24',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSiteVisitOpen(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  style={{
                    flex: 2,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--gold-primary)',
                    color: '#070709',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {bookingLoading ? 'Confirming with Concierge...' : 'Confirm Site Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Direct Enquiry */}
      {enquiryOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#12121A',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: '0 24px 64px rgba(0,0,0,0.8)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.35rem' }}>
              Connect with Verified Property Representative
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Get direct floor plan PDFs, price negotiation guidance, and booking terms.
            </p>

            <form onSubmit={handleEnquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={enquiryName}
                  placeholder="Your Name"
                  onChange={(e) => setEnquiryName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#1A1A24',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={enquiryEmail}
                    placeholder="name@email.com"
                    onChange={(e) => setEnquiryEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#1A1A24',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Mobile / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    value={enquiryPhone}
                    placeholder="+91 98765 43210"
                    onChange={(e) => setEnquiryPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#1A1A24',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Your Message
                </label>
                <textarea
                  rows={3}
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#1A1A24',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEnquiryOpen(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={enquiryLoading}
                  style={{
                    flex: 2,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--gold-primary)',
                    color: '#070709',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {enquiryLoading ? 'Sending...' : 'Send Direct Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Report Listing */}
      {reportOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#12121A',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: '0 24px 64px rgba(0,0,0,0.8)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EF4444', marginBottom: '0.35rem' }}>
              Report Inappropriate Listing
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              LOKHA enforces zero tolerance for counterfeit claims, fraudulent RERA credentials, or misleading photos.
            </p>

            <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Reason for Report
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#1A1A24',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="Inaccurate Information">Inaccurate Price or Location</option>
                  <option value="Fraudulent RERA / EB">Invalid or Fraudulent RERA / EB Number</option>
                  <option value="Already Sold">Property Already Sold / Unavailable</option>
                  <option value="Fake Photos">Misleading or Stock Photography</option>
                  <option value="Spam / Offensive">Spam or Unprofessional Conduct</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Additional Details
                </label>
                <textarea
                  rows={3}
                  required
                  value={reportDetails}
                  placeholder="Provide context or evidence..."
                  onChange={(e) => setReportDetails(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#1A1A24',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={reportLoading}
                  style={{
                    flex: 2,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {reportLoading ? 'Filing Report...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
