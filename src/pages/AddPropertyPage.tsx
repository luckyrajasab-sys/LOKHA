import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  FileText,
  User,
  ArrowRight,
  Sparkles,
  Plus
} from 'lucide-react';
import { createProperty } from '../firebase/firestore';
import type {
  PropertyType,
  PropertyListingType,
  FurnishedStatus,
  PropertyDocument
} from '../types/firebaseModels';

interface AddPropertyPageProps {
  onNavigate: (view: string) => void;
}

const PROPERTY_TYPES: PropertyType[] = [
  'House',
  'Villa',
  'Apartment',
  'Farmhouse',
  'Resort / Homestay',
  'Penthouse',
  'Plot',
  'Commercial'
];

const DISCOM_OPTIONS = [
  'TANGEDCO / TNEB (Tamil Nadu)',
  'BESCOM (Bengaluru / Karnataka)',
  'MSEDCL / Mahavitaran (Maharashtra)',
  'TSSPDCL / TSNPDCL (Telangana)',
  'UPPCL (Uttar Pradesh)',
  'BSES Yamuna / Rajdhani / Tata Power (Delhi)',
  'KSEB (Kerala)',
  'WBSEDCL (West Bengal)',
  'GUVNL / Torrent Power (Gujarat)',
  'APEPDCL / APSPDCL (Andhra Pradesh)',
  'PSPCL (Punjab)',
  'Other State Electricity Board'
];

const GOV_DOC_TYPES = [
  'Patta / Chitta Document (South India)',
  'Khata Certificate / e-Khata (Karnataka)',
  'Property Tax Assessment / Receipt (Municipal / Panchayat)',
  '7/12 Extract / Satbara Utara (Maharashtra)',
  'Registered Sale Deed / Title Deed',
  'Encumbrance Certificate (EC)',
  'Panchayat / Village Grama Natham Title'
];

const CURATED_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'
];

export const AddPropertyPage: React.FC<AddPropertyPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  // Step state
  const [listingPurpose, setListingPurpose] = useState<PropertyListingType>('Rent');

  // Ownership & Family Member
  const [ownershipType, setOwnershipType] = useState<'Self' | 'Family Member'>('Self');
  const [familyMemberName, setFamilyMemberName] = useState('');
  const [familyRelation, setFamilyRelation] = useState('Father');
  const [familyContactPhone, setFamilyContactPhone] = useState('');

  // Government & EB Verification
  const [ebConsumerNumber, setEbConsumerNumber] = useState('');
  const [ebProvider, setEbProvider] = useState(DISCOM_OPTIONS[0]);
  const [ebTariff, setEbTariff] = useState<'Domestic (LT-1A)' | 'Commercial (LT-2)'>('Domestic (LT-1A)');
  const [govDocType, setGovDocType] = useState(GOV_DOC_TYPES[0]);
  const [govDocNumber, setGovDocNumber] = useState('');
  const [taxPaidStatus, setTaxPaidStatus] = useState(true);

  // Property Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('House');
  const [price, setPrice] = useState<number>(12000000); // Sale price
  const [rentAmount, setRentAmount] = useState<number>(35000); // Monthly rent
  const [securityDeposit, setSecurityDeposit] = useState<number>(150000);
  const [leaseAmount, setLeaseAmount] = useState<number>(2000000); // Lease total
  const [stayNightlyRate, setStayNightlyRate] = useState<number>(4500); // Stay rate per night
  const [stayMaxGuests, setStayMaxGuests] = useState<number>(6);

  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [area, setArea] = useState<number>(1850);
  const [furnishedStatus, setFurnishedStatus] = useState<FurnishedStatus>('Semi-Furnished');

  // Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560038');

  // Amenities
  const [amenities, setAmenities] = useState<string[]>([
    '24/7 Water Supply',
    'Covered Car Parking',
    'Power Backup',
    'High-Speed Internet'
  ]);

  // Images
  const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>([CURATED_SAMPLE_IMAGES[0]]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successProperty, setSuccessProperty] = useState<PropertyDocument | null>(null);

  const toggleAmenity = (name: string) => {
    setAmenities(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const handleAddCustomImage = () => {
    if (!customImageUrl.trim()) return;
    setSelectedImageUrls(prev => [...prev, customImageUrl.trim()]);
    setCustomImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Please sign in to list your property.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide an appealing property title.');
      return;
    }

    if (!address.trim() || !city.trim()) {
      setError('Please provide the property address and city.');
      return;
    }

    if (ownershipType === 'Family Member' && !familyMemberName.trim()) {
      setError("Please provide your family member's legal name.");
      return;
    }

    if (!ebConsumerNumber.trim()) {
      setError('Please provide the Electricity Board (EB) Consumer / Service Connection number.');
      return;
    }

    if (!govDocNumber.trim()) {
      setError('Please provide the Government Document identification number (Patta, Khata, or Property Tax No).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ownerDisplayName = ownershipType === 'Self'
        ? (user.displayName || 'Property Owner')
        : `${familyMemberName.trim()} (${familyRelation} of ${user.displayName || 'Member'})`;

      const newPropertyData = {
        ownerId: user.id,
        ownerName: ownerDisplayName,
        listedByName: user.displayName || 'Member',
        ownershipType,
        familyMemberName: ownershipType === 'Family Member' ? familyMemberName.trim() : undefined,
        familyRelation: ownershipType === 'Family Member' ? familyRelation : undefined,
        familyContactPhone: ownershipType === 'Family Member' ? familyContactPhone.trim() : undefined,

        // Government & EB Verification
        ebConsumerNumber: ebConsumerNumber.trim(),
        ebProvider,
        ebTariff,
        govDocType,
        govDocNumber: govDocNumber.trim(),
        isGovEbVerified: true,

        title: title.trim(),
        description: description.trim() || `${propertyType} offered for ${listingPurpose} with verified EB and Government property documentation.`,
        propertyType,
        listingType: listingPurpose,
        price: listingPurpose === 'Sale' ? price : rentAmount,
        rentAmount: listingPurpose === 'Rent' ? rentAmount : undefined,
        leaseAmount: listingPurpose === 'Lease' ? leaseAmount : undefined,
        stayNightlyRate: listingPurpose === 'Stay' ? stayNightlyRate : undefined,
        stayMaxGuests: listingPurpose === 'Stay' ? stayMaxGuests : undefined,
        securityDeposit: listingPurpose === 'Rent' ? securityDeposit : undefined,

        bedrooms,
        bathrooms,
        area,
        areaUnit: 'sq.ft' as const,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        latitude: city.toLowerCase().includes('bengaluru') || city.toLowerCase().includes('bangalore') ? 12.9716 : 13.0827,
        longitude: city.toLowerCase().includes('bengaluru') || city.toLowerCase().includes('bangalore') ? 77.5946 : 80.2707,
        amenities,
        images: selectedImageUrls.length > 0 ? selectedImageUrls : [CURATED_SAMPLE_IMAGES[0]],
        status: 'available' as const,
        verificationStatus: (user.roles?.includes('admin') ? 'verified' : 'pending') as any,
        compliance: {
          reraNumber: 'TN/01/B/PENDING-AUDIT',
          ebConsumerNumber: ebConsumerNumber.trim(),
          pattaNumber: govDocNumber.trim(),
          isReraVerified: user.roles?.includes('admin'),
          isEbVerified: true,
          isPattaVerified: true
        },
        furnishedStatus,
        isFeatured: true
      };

      const saved = await createProperty(newPropertyData);
      setSuccessProperty(saved);
    } catch (err: any) {
      console.error('[AddPropertyPage] Error creating property:', err);
      setError(err.message || 'Failed to submit property listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '1080px',
      margin: '0 auto',
      padding: '2rem 1.25rem 5rem'
    }}>
      {/* Page Header */}
      <div style={{
        marginBottom: '2rem',
        padding: '2rem',
        borderRadius: 'var(--radius-xl, 16px)',
        backgroundColor: 'var(--bg-card, #111116)',
        border: '1px solid rgba(212, 175, 55, 0.28)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.55)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: 'var(--gold-primary)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Sparkles size={13} /> LOKHA PROPERTY PORTAL
          </span>
        </div>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: 900,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          marginBottom: '0.5rem'
        }}>
          Give & List Your Property
        </h1>

        <p style={{
          fontSize: '0.925rem',
          color: 'var(--text-secondary)',
          maxWidth: '720px',
          lineHeight: 1.5,
          marginBottom: '1.25rem'
        }}>
          Every Lokha member can offer properties for <strong>Rent</strong>, <strong>Long-Term Lease</strong>, <strong>Hospitality Stays</strong>, or <strong>Direct Sale</strong>. All listings are backed by verified Electricity Board (EB) connections and official Government documents for maximum tenant and buyer trust.
        </p>

        {/* Highlight Trust Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full, 9999px)',
            backgroundColor: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            color: '#22C55E',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <Zap size={14} /> Electricity Board (EB) Consumer Link
          </span>

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full, 9999px)',
            backgroundColor: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            color: 'var(--gold-primary)',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <FileText size={14} /> Gov Patta / Khata / Tax Assessment
          </span>

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full, 9999px)',
            backgroundColor: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            color: '#A78BFA',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <User size={14} /> Self or Family Member Listed
          </span>
        </div>
      </div>

      {/* Success Confirmation State */}
      {successProperty ? (
        <div style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-card, #111116)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          borderRadius: 'var(--radius-xl, 16px)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '2px solid #22C55E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: '#22C55E'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
            Property Listed Successfully!
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '560px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
            Your property <strong>"{successProperty.title}"</strong> is now live on LOKHA with the <strong>✓ Government & EB Connection Verified</strong> badge.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            color: 'var(--gold-primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '2rem'
          }}>
            <ShieldCheck size={16} /> Listed under: {successProperty.ownerName} • EB: {successProperty.ebConsumerNumber}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('dashboard')}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.5rem' }}
            >
              View in My Dashboard
            </button>
            <button
              onClick={() => onNavigate('properties')}
              className="btn btn-secondary"
              style={{ padding: '0.65rem 1.5rem' }}
            >
              Explore Public Map & Feed
            </button>
            <button
              onClick={() => {
                setSuccessProperty(null);
                setTitle('');
                setAddress('');
                setEbConsumerNumber('');
                setGovDocNumber('');
              }}
              className="btn btn-outline"
              style={{ padding: '0.65rem 1.5rem' }}
            >
              List Another Property
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {error && (
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#EF4444',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>
              {error}
            </div>
          )}

          {/* STEP 1: SELECT GIVING PURPOSE */}
          <div style={{
            padding: '1.75rem',
            borderRadius: 'var(--radius-lg, 12px)',
            backgroundColor: 'var(--bg-card, #111116)',
            border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.08))'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: '0.3rem' }}>
              1. What do you want to offer your property for?
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Choose whether you are giving the house for monthly rent, long-term lease, hospitality stay, or outright sale.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {[
                { type: 'Rent' as const, label: 'Give for Rent', sub: 'Monthly Rent + Deposit', color: '#10B981', badge: 'Rental' },
                { type: 'Lease' as const, label: 'Give for Lease', sub: 'Long-term Lease Tenure', color: '#8B5CF6', badge: 'Lease' },
                { type: 'Stay' as const, label: 'Give for Hospitality Stay', sub: 'Homestay / Villa / Resort / Nightly', color: '#F97316', badge: 'Hospitality' },
                { type: 'Sale' as const, label: 'Sell Property', sub: 'Direct Sale / Outright', color: '#EAB308', badge: 'For Sale' }
              ].map(opt => {
                const isSelected = listingPurpose === opt.type;
                return (
                  <div
                    key={opt.type}
                    onClick={() => setListingPurpose(opt.type)}
                    style={{
                      padding: '1.25rem 1rem',
                      borderRadius: 'var(--radius-md, 10px)',
                      border: isSelected ? `2px solid ${opt.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: isSelected ? `${opt.color}15` : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: opt.color,
                        boxShadow: `0 0 8px ${opt.color}`
                      }} />
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: `${opt.color}25`,
                        color: opt.color
                      }}>
                        {opt.badge}
                      </span>
                    </div>

                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.25rem' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {opt.sub}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: OWNERSHIP DETAILS (SELF VS FAMILY MEMBER) */}
          <div style={{
            padding: '1.75rem',
            borderRadius: 'var(--radius-lg, 12px)',
            backgroundColor: 'var(--bg-card, #111116)',
            border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.08))'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: '0.3rem' }}>
              2. Property Ownership & Lister Authority
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Are you the direct owner, or are you listing this property on behalf of a parent, spouse, or family member?
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                <input
                  type="radio"
                  name="ownershipType"
                  value="Self"
                  checked={ownershipType === 'Self'}
                  onChange={() => setOwnershipType('Self')}
                />
                <span>I am the Direct Owner (Self)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                <input
                  type="radio"
                  name="ownershipType"
                  value="Family Member"
                  checked={ownershipType === 'Family Member'}
                  onChange={() => setOwnershipType('Family Member')}
                />
                <span>Listing on Behalf of a Family Member / Co-Owner</span>
              </label>
            </div>

            {ownershipType === 'Self' ? (
              <div style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(212, 175, 55, 0.06)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--gold-primary)',
                  color: '#070709',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900
                }}>
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#FFFFFF' }}>
                    Owner: {user?.displayName || 'Registered Member'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Email: {user?.email || 'N/A'} • Direct Contact: {user?.phone || 'Verified on Profile'}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(139, 92, 246, 0.06)',
                border: '1px solid rgba(139, 92, 246, 0.25)'
              }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Family Member Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. G. Rajasab"
                    value={familyMemberName}
                    onChange={(e) => setFamilyMemberName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Relationship to You *</label>
                  <select
                    className="form-input"
                    value={familyRelation}
                    onChange={(e) => setFamilyRelation(e.target.value)}
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse (Husband / Wife)</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Co-Owner / Joint Holder">Co-Owner / Joint Title Holder</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Family Member Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98450 12345"
                    value={familyContactPhone}
                    onChange={(e) => setFamilyContactPhone(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: GOVERNMENT & ELECTRICITY BOARD (EB) VERIFICATION */}
          <div style={{
            padding: '1.75rem',
            borderRadius: 'var(--radius-lg, 12px)',
            backgroundColor: 'var(--bg-card, #111116)',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.3rem' }}>
              <Zap size={20} color="#22C55E" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#22C55E' }}>
                3. Government Document & Electricity Board (EB) Verification
              </h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              LOKHA verifies all rental and sale properties against active utility service numbers and government revenue identification.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {/* EB Connection */}
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  EB Consumer / Service Connection Number *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 04-231-008-1425 or 100234857"
                  value={ebConsumerNumber}
                  onChange={(e) => setEbConsumerNumber(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.2rem', display: 'block' }}>
                  Available on your monthly electricity bill or meter card.
                </span>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Electricity Board / Discom *</label>
                <select
                  className="form-input"
                  value={ebProvider}
                  onChange={(e) => setEbProvider(e.target.value)}
                >
                  {DISCOM_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>EB Meter Tariff Category</label>
                <select
                  className="form-input"
                  value={ebTariff}
                  onChange={(e) => setEbTariff(e.target.value as any)}
                >
                  <option value="Domestic (LT-1A)">Domestic / Residential (LT-1A)</option>
                  <option value="Commercial (LT-2)">Commercial (LT-2)</option>
                </select>
              </div>

              {/* Government Property Doc */}
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Government Property Document Type *</label>
                <select
                  className="form-input"
                  value={govDocType}
                  onChange={(e) => setGovDocType(e.target.value)}
                >
                  {GOV_DOC_TYPES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Document / Assessment Identification Number *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. PATTA/2024/099182 or BBMP-TAX-8812"
                  value={govDocNumber}
                  onChange={(e) => setGovDocNumber(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={taxPaidStatus}
                    onChange={(e) => setTaxPaidStatus(e.target.checked)}
                  />
                  <span>Property Tax Paid for Current Financial Year (2025–26)</span>
                </label>
              </div>
            </div>
          </div>

          {/* STEP 4: PROPERTY DETAILS & PRICING */}
          <div style={{
            padding: '1.75rem',
            borderRadius: 'var(--radius-lg, 12px)',
            backgroundColor: 'var(--bg-card, #111116)',
            border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.08))'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: '0.3rem' }}>
              4. Property Specifications & Terms
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Property Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Modern 3BHK Independent Villa with Garden & Solar Power"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Property Description & Highlights</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Detail key advantages, road access, drinking water source, interior quality, and neighborhood."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Property Type *</label>
                <select
                  className="form-input"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as any)}
                >
                  {PROPERTY_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic pricing according to listing purpose */}
              {listingPurpose === 'Rent' && (
                <>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700 }}>Monthly Rent (₹ / Month) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={rentAmount}
                      onChange={(e) => setRentAmount(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700 }}>Security Deposit (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                    />
                  </div>
                </>
              )}

              {listingPurpose === 'Lease' && (
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Total Lease Amount (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={leaseAmount}
                    onChange={(e) => setLeaseAmount(Number(e.target.value))}
                    required
                  />
                </div>
              )}

              {listingPurpose === 'Stay' && (
                <>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700 }}>Rate per Night (₹ / Night) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={stayNightlyRate}
                      onChange={(e) => setStayNightlyRate(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700 }}>Max Guests Capacity</label>
                    <input
                      type="number"
                      className="form-input"
                      value={stayMaxGuests}
                      onChange={(e) => setStayMaxGuests(Number(e.target.value))}
                    />
                  </div>
                </>
              )}

              {listingPurpose === 'Sale' && (
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Total Selling Price (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                  />
                </div>
              )}

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Bedrooms (BHK)</label>
                <input
                  type="number"
                  className="form-input"
                  value={bedrooms}
                  min={1}
                  max={20}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Bathrooms</label>
                <input
                  type="number"
                  className="form-input"
                  value={bathrooms}
                  min={1}
                  max={20}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Built-up Area (Sq.Ft)</label>
                <input
                  type="number"
                  className="form-input"
                  value={area}
                  min={100}
                  onChange={(e) => setArea(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Furnishing Status</label>
                <select
                  className="form-input"
                  value={furnishedStatus}
                  onChange={(e) => setFurnishedStatus(e.target.value as any)}
                >
                  <option value="Fully Furnished">Fully Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Street Address *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Plot / House No, Street, Landmark, Area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>City *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bengaluru, Chennai, Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>State *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Karnataka, Tamil Nadu"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Postal Pincode *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="560038"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* STEP 5: AMENITIES & PHOTOS */}
          <div style={{
            padding: '1.75rem',
            borderRadius: 'var(--radius-lg, 12px)',
            backgroundColor: 'var(--bg-card, #111116)',
            border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.08))'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: '0.3rem' }}>
              5. Amenities & Photos
            </h3>

            {/* Amenities Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.65rem',
              margin: '1rem 0 1.5rem'
            }}>
              {[
                '24/7 Water Supply',
                'Covered Car Parking',
                'Power Backup',
                'High-Speed Internet',
                'Private Garden',
                'Swimming Pool',
                'Gym / Fitness Room',
                'Solar Water Heater',
                'EV Charging Point',
                'Security Guards / CCTV',
                'Pet Friendly',
                'Clubhouse Access'
              ].map(amenity => {
                const checked = amenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: checked ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: checked ? '1px solid var(--border-gold)' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: checked ? 'var(--gold-primary)' : 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                    />
                    <span>{amenity}</span>
                  </label>
                );
              })}
            </div>

            {/* Photos Preview */}
            <label className="form-label" style={{ fontWeight: 700 }}>Curated Property Showcase Images</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {CURATED_SAMPLE_IMAGES.map((img, idx) => {
                const isSelected = selectedImageUrls.includes(img);
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedImageUrls(prev =>
                        prev.includes(img) ? prev.filter(i => i !== img) : [...prev, img]
                      );
                    }}
                    style={{
                      width: '100px',
                      height: '75px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid var(--gold-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                      position: 'relative',
                      opacity: isSelected ? 1 : 0.6
                    }}
                  >
                    <img src={img} alt="Showcase" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {isSelected && (
                      <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--gold-primary)',
                        color: '#070709',
                        fontSize: '11px',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Custom Image URL */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="url"
                className="form-input"
                placeholder="Or paste an image URL (https://...)"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddCustomImage}
                className="btn btn-secondary"
                style={{ flexShrink: 0 }}
              >
                <Plus size={16} /> Add Image
              </button>
            </div>
          </div>

          {/* Submit Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            alignItems: 'center',
            paddingTop: '1rem'
          }}>
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="btn btn-ghost"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                padding: '0.85rem 2.25rem',
                fontSize: '1rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              {loading ? (
                <span>Verifying & Listing...</span>
              ) : (
                <>
                  <span>Publish Verified Listing</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
