import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Heart,
  Filter,
  Send,
  MessageSquare,
  Building,
  AlertCircle,
  Map as MapIcon,
  Grid,
  Columns,
  Crosshair,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { subscribeToProperties, subscribeToUserFavoriteIds } from '../firebase/realtime';
import { addFavorite, removeFavorite, getOrCreateConversation } from '../firebase/firestore';
import { InquiryModal } from '../components/properties/InquiryModal';
import { ChatDrawer } from '../components/chat/ChatDrawer';
import { PropertyMap } from '../components/properties/PropertyMap';
import { PropertyDetailModal } from '../components/properties/PropertyDetailModal';
import { PremiumModal } from '../components/common/PremiumModal';
import { detectCurrentLocation } from '../utils/location';
import { isVercelOnly, getAreaPropertiesAndStays, convertStaysToProperties, getCityCoordinates } from '../services/mockAreaService';
import type {
  PropertyDocument,
  PropertyType,
  PropertyListingType,
  FurnishedStatus
} from '../types/firebaseModels';

const PROPERTY_TYPES: PropertyType[] = ['Apartment', 'Villa', 'House', 'Plot', 'Commercial', 'Office', 'Shop'];
const COMMON_AMENITIES = ['Swimming Pool', 'Gym / Fitness Center', 'Sea View', 'Private Garden', 'Covered Parking', 'Clubhouse'];

interface PropertiesPageProps {
  initialSearchQuery?: string;
  initialLocationQuery?: string;
  initialViewType?: string;
  initialPropertyType?: string;
  initialListingType?: string;
  initialPurpose?: string;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({
  initialSearchQuery = '',
  initialLocationQuery = '',
  initialViewType = 'properties',
  initialPropertyType,
  initialListingType,
  initialPurpose
}) => {
  const { user, userDoc } = useAuth();
  const { showToast } = useToast();

  // Data & Real-time Listeners
  const [properties, setProperties] = useState<PropertyDocument[]>([]);
  const [areaMockProperties, setAreaMockProperties] = useState<PropertyDocument[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View Mode: Split (Map + List), Grid, or Map Only
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'map'>('split');
  const [selectedProperty, setSelectedProperty] = useState<PropertyDocument | null>(null);
  const [detailModalProperty, setDetailModalProperty] = useState<PropertyDocument | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [locationQuery, setLocationQuery] = useState(initialLocationQuery);
  const [userCoordinates, setUserCoordinates] = useState<[number, number] | undefined>(undefined);
  const [isDetectingLoc, setIsDetectingLoc] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedType, setSelectedType] = useState<PropertyType | 'All'>(
    (initialPropertyType as PropertyType) || 'All'
  );
  const [selectedListingType, setSelectedListingType] = useState<PropertyListingType | 'All'>(
    (initialListingType as PropertyListingType) || 'All'
  );
  const [selectedPurpose, setSelectedPurpose] = useState<'All' | 'Buy' | 'Rent' | 'Lease' | 'Stays' | 'Invest'>(
    (initialPurpose as any) || (initialViewType === 'stays' ? 'Stays' : 'All')
  );
  const [selectedFurnished, setSelectedFurnished] = useState<FurnishedStatus | 'All'>('All');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [minBedrooms, setMinBedrooms] = useState<number>(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Auto-populate abundant houses and stays for detected area (active on Firebase & Vercel)
  useEffect(() => {
    const city = initialLocationQuery || locationQuery || (selectedCity !== 'All' ? selectedCity : 'Bengaluru');
    const uLat = userCoordinates?.[0];
    const uLng = userCoordinates?.[1];
    const { properties: areaHouses, stays: areaStays } = getAreaPropertiesAndStays(city, uLat, uLng);
    const convertedStays = convertStaysToProperties(areaStays);
    setAreaMockProperties([...areaHouses, ...convertedStays]);
  }, [initialLocationQuery, locationQuery, selectedCity, userCoordinates]);

  // Sync map center coordinates to the queried city
  useEffect(() => {
    const targetCity = initialLocationQuery || locationQuery || (selectedCity !== 'All' ? selectedCity : '');
    if (targetCity) {
      const coords = getCityCoordinates(targetCity);
      if (coords) {
        setUserCoordinates(coords);
      }
    }
  }, [initialLocationQuery, locationQuery, selectedCity]);

  useEffect(() => {
    if (initialPropertyType !== undefined) {
      setSelectedType((initialPropertyType as PropertyType) || 'All');
    }
    if (initialListingType !== undefined) {
      setSelectedListingType((initialListingType as PropertyListingType) || 'All');
    }
    if (initialPurpose !== undefined) {
      setSelectedPurpose(initialPurpose as any);
    }
  }, [initialPropertyType, initialListingType, initialPurpose]);

  // Premium Modal State
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [premiumReason, setPremiumReason] = useState<string>('');

  // Modals & Chat Drawer
  const [inquiryTarget, setInquiryTarget] = useState<PropertyDocument | null>(null);
  const [activeChat, setActiveChat] = useState<{
    isOpen: boolean;
    conversationId: string | null;
    recipientId: string;
    recipientName: string;
    propertyTitle?: string;
  }>({
    isOpen: false,
    conversationId: null,
    recipientId: '',
    recipientName: '',
    propertyTitle: ''
  });

  // Synchronize initial queries from navbar
  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    if (initialLocationQuery !== undefined) {
      setLocationQuery(initialLocationQuery);
    }
  }, [initialLocationQuery]);

  // 1. Subscribe to Live Properties in Firestore
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToProperties(
      {
        city: selectedCity !== 'All' ? selectedCity : undefined,
        propertyType: selectedType,
        listingType: selectedListingType,
        status: 'available',
        minPrice,
        maxPrice,
        bedrooms: minBedrooms,
        furnishedStatus: selectedFurnished,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined
      },
      (liveProps) => {
        setProperties(liveProps);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [selectedCity, selectedType, selectedListingType, selectedFurnished, minPrice, maxPrice, minBedrooms, selectedAmenities]);

  // 2. Subscribe to user favorites in real time
  useEffect(() => {
    if (!user) {
      setFavoriteIds([]);
      return;
    }
    const unsub = subscribeToUserFavoriteIds(user.id, (ids) => {
      setFavoriteIds(ids);
    });
    return () => unsub();
  }, [user]);

  // Toggle Favorite
  const handleToggleFavorite = async (property: PropertyDocument) => {
    if (!user) {
      showToast('Please sign in to save this property to your portfolio.', 'info');
      return;
    }

    const isFav = favoriteIds.includes(property.propertyId);
    try {
      if (isFav) {
        await removeFavorite(user.id, property.propertyId);
        showToast(`Removed "${property.title}" from saved properties.`, 'info');
      } else {
        await addFavorite(user.id, property.propertyId);
        showToast(`Saved "${property.title}" to your portfolio!`, 'success');
      }
    } catch (err) {
      console.error('Favorite update failed:', err);
      showToast('Could not update favorite status.', 'error');
    }
  };

  // Detect Location via GPS
  const handleDetectLocation = async () => {
    try {
      setIsDetectingLoc(true);
      const loc = await detectCurrentLocation();
      const place = loc.city ? (loc.state ? `${loc.city}, ${loc.state}` : loc.city) : loc.formattedAddress;
      setLocationQuery(place);
      const cityName = loc.city || 'Bengaluru';
      setSelectedCity(cityName);
      setUserCoordinates([loc.latitude, loc.longitude]);

      // On Vercel link, immediately load abundant houses and stays for this auto-detected area
      if (isVercelOnly()) {
        const { properties: areaHouses, stays: areaStays } = getAreaPropertiesAndStays(cityName, loc.latitude, loc.longitude);
        const convertedStays = convertStaysToProperties(areaStays);
        setAreaMockProperties([...areaHouses, ...convertedStays]);
        showToast(`Loaded ${areaHouses.length} houses & ${areaStays.length} stays in ${cityName}!`, 'success');
      }
    } catch (err) {
      console.warn('Location detection failed:', err);
    } finally {
      setIsDetectingLoc(false);
    }
  };

  // Start Instant Live Chat with communication limit check
  const handleStartChat = async (property: PropertyDocument) => {
    if (!user) {
      showToast('Please sign in to message the property owner.', 'info');
      return;
    }

    const count = userDoc?.communicationCount || 0;
    if (!userDoc?.isPremium && count >= 3) {
      setPremiumReason('You have used your 3 free communications with property owners. Please choose a plan below.');
      setPremiumModalOpen(true);
      return;
    }

    const targetRecipientId = property.agentId || property.ownerId;
    if (targetRecipientId === user.id) {
      showToast('You are the owner/agent of this property.', 'info');
      return;
    }

    try {
      const convId = await getOrCreateConversation(user.id, targetRecipientId, property.propertyId, property.title);
      setActiveChat({
        isOpen: true,
        conversationId: convId,
        recipientId: targetRecipientId,
        recipientName: 'Property Concierge',
        propertyTitle: property.title
      });
    } catch (err) {
      console.error('Could not start conversation:', err);
      showToast('Failed to initialize messaging channel.', 'error');
    }
  };

  const [inquiryIntent, setInquiryIntent] = useState<'buy' | 'rent' | 'lease' | 'stay'>('buy');

  // Open Inquiry modal with communication limit check
  const handleOpenInquiry = (property: PropertyDocument, intent?: 'buy' | 'rent' | 'lease' | 'stay') => {
    if (intent) {
      setInquiryIntent(intent);
    }
    if (!user) {
      showToast('Please sign in to inquire on this property.', 'info');
      return;
    }

    const count = userDoc?.communicationCount || 0;
    if (!userDoc?.isPremium && count >= 3) {
      setPremiumReason('You have used your 3 free communications with property owners. Please choose a plan below.');
      setPremiumModalOpen(true);
      return;
    }

    setInquiryTarget(property);
  };

  // Seamlessly merge live properties from Firestore with auto-detected area houses and stays
  const effectiveProperties = [
    ...properties,
    ...areaMockProperties.filter(a => !properties.some(p => p.propertyId === a.propertyId))
  ];

  // Filter client-side by text query, location query, and purpose
  const filteredProperties = effectiveProperties.filter((p) => {
    // 1. Keyword search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchKeyword =
        p.title.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.address && p.address.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));
      if (!matchKeyword) return false;
    }

    // 2. Location search
    if (locationQuery.trim()) {
      const loc = locationQuery.toLowerCase();
      const matchLoc =
        p.city.toLowerCase().includes(loc) ||
        p.state.toLowerCase().includes(loc) ||
        (p.address && p.address.toLowerCase().includes(loc)) ||
        (p.pincode && p.pincode.toLowerCase().includes(loc));
      if (!matchLoc) return false;
    }

    // 3. Purpose filter
    if (selectedPurpose !== 'All') {
      const isStay = p.propertyId.includes('stay');
      if (selectedPurpose === 'Stays') return isStay;
      if (isStay) return false; // Stays only shown when All or Stays is chosen
      if (selectedPurpose === 'Buy' && p.listingType !== 'Sale') return false;
      if (selectedPurpose === 'Rent' && p.listingType !== 'Rent') return false;
      if (selectedPurpose === 'Lease' && p.listingType !== 'Lease') return false;
      if (selectedPurpose === 'Invest' && p.price < 5000000) return false;
    }

    return true;
  });

  const uniqueCities = Array.from(new Set(effectiveProperties.map(p => p.city).filter(Boolean)));

  const toggleAmenity = (name: string) => {
    setSelectedAmenities(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const renderPropertyCard = (prop: PropertyDocument) => {
    const isSaved = favoriteIds.includes(prop.propertyId);
    const isSelected = selectedProperty?.propertyId === prop.propertyId;
    const coverImage = prop.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';
    const isRent = prop.listingType === 'Rent';
    const isLease = prop.listingType === 'Lease';
    const isStay = prop.propertyId.includes('stay');
    const displayPrice = isStay
      ? (prop.rentAmount || 12000)
      : isRent
      ? (prop.rentAmount || prop.price)
      : isLease
      ? (prop.leaseAmount || prop.price)
      : prop.price;

    return (
      <div
        key={prop.propertyId}
        className="card"
        onClick={() => {
          setSelectedProperty(prop);
          setDetailModalProperty(prop);
        }}
        style={{
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: isSelected ? '1.5px solid var(--gold-primary)' : '1px solid var(--border-medium)',
          boxShadow: isSelected ? '0 8px 28px rgba(212, 175, 55, 0.25)' : undefined,
          cursor: 'pointer',
          transition: 'all var(--transition-base)'
        }}
      >
        {/* Photo & Badges */}
        <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
          <img
            src={coverImage}
            alt={prop.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          <div style={{
            position: 'absolute', top: '1rem', left: '1rem',
            padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(0, 0, 0, 0.78)', color: 'var(--gold-primary)',
            fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
            backdropFilter: 'blur(8px)'
          }}>
            {prop.listingType} • {prop.propertyType}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(prop);
            }}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              width: '38px', height: '38px', borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.65)', border: 'none',
              color: isSaved ? '#ef4444' : '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(8px)'
            }}
          >
            <Heart size={18} fill={isSaved ? '#ef4444' : 'none'} />
          </button>
        </div>

        {/* Details */}
        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-tertiary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
            <MapPin size={14} style={{ color: 'var(--gold-primary)' }} />
            {prop.address ? `${prop.address}, ` : ''}{prop.city}
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem', lineHeight: 1.3 }}>
            {prop.title}
          </h3>

          <p style={{
            fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5,
            marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {prop.description || prop.address}
          </p>

          {/* Specs */}
          <div style={{
            display: 'flex', gap: '1rem', padding: '0.65rem 0',
            borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)',
            fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem'
          }}>
            {prop.bedrooms > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Bed size={14} color="var(--gold-primary)" /> {prop.bedrooms} Beds
              </span>
            )}
            {prop.bathrooms > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Bath size={14} color="var(--gold-primary)" /> {prop.bathrooms} Baths
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Maximize2 size={14} color="var(--gold-primary)" /> {prop.area.toLocaleString()} {prop.areaUnit}
            </span>
          </div>

          {/* Price & Actions */}
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                {isStay ? 'Starting / Night' : isRent ? 'Rent / Month' : isLease ? 'Lease / Year' : 'Asking Price'}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                ₹ {displayPrice.toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartChat(prop);
                }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.45rem 0.65rem' }}
                title="Direct Chat"
              >
                <MessageSquare size={15} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenInquiry(prop);
                }}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
              >
                <Send size={13} />
                Inquire
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '2.5rem 1.5rem', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header & View Mode Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            Global Real Estate Feed
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Synchronized in real time with Cloud Firestore. Live coordinates & location intelligence.
          </p>
        </div>

        {/* Toolbar: Live stream pill & View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(34, 197, 94, 0.12)',
            color: '#22C55E',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: '1px solid rgba(34, 197, 94, 0.25)'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E', display: 'inline-block' }}></span>
            Real-Time onSnapshot
          </div>

          {/* View Mode Buttons */}
          <div style={{
            display: 'flex',
            backgroundColor: '#0E0E14',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            padding: '3px'
          }}>
            <button
              onClick={() => setViewMode('split')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: viewMode === 'split' ? 'var(--gold-primary)' : 'transparent',
                color: viewMode === 'split' ? '#070709' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              title="Split View (Map + List)"
            >
              <Columns size={14} />
              Split
            </button>

            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: viewMode === 'grid' ? 'var(--gold-primary)' : 'transparent',
                color: viewMode === 'grid' ? '#070709' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              title="Grid View Only"
            >
              <Grid size={14} />
              Grid
            </button>

            <button
              onClick={() => setViewMode('map')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: viewMode === 'map' ? 'var(--gold-primary)' : 'transparent',
                color: viewMode === 'map' ? '#070709' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              title="Map View Only"
            >
              <MapIcon size={14} />
              Map
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{
        padding: '1.25rem 1.5rem',
        backgroundColor: '#0E0E14',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(212, 175, 55, 0.22)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        marginBottom: '2rem'
      }}>
        {/* Row 1: Search, Location + GPS auto-detect, Purpose tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          {/* Keyword Search */}
          <div className="input-with-icon" style={{ minWidth: '220px', flex: 1.2 }}>
            <Search className="input-icon-left" size={17} color="var(--gold-primary)" />
            <input
              type="text"
              className="form-input has-left-icon"
              placeholder="Search by title, landmark, villa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Location with Auto-detect */}
          <div style={{ position: 'relative', minWidth: '200px', flex: 1, display: 'flex', alignItems: 'center' }}>
            <MapPin size={16} color="var(--gold-primary)" style={{ position: 'absolute', left: '0.85rem', pointerEvents: 'none' }} />
            <input
              type="text"
              className="form-input"
              placeholder="City or location..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem', paddingRight: '2.4rem' }}
            />
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLoc}
              title="Auto-detect current GPS location"
              style={{
                position: 'absolute',
                right: '0.5rem',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: isDetectingLoc ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: 'var(--gold-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isDetectingLoc ? 'wait' : 'pointer'
              }}
            >
              {isDetectingLoc ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Crosshair size={14} />
              )}
            </button>
          </div>

          {/* Account Purpose / Looking For Filter Pills */}
          <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#13131A', padding: '0.3rem', borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
            {(['All', 'Buy', 'Rent', 'Lease', 'Stays', 'Invest'] as const).map((purpose) => (
              <button
                key={purpose}
                type="button"
                onClick={() => setSelectedPurpose(purpose)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: selectedPurpose === purpose ? 'var(--gold-primary)' : 'transparent',
                  color: selectedPurpose === purpose ? '#070709' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {purpose === 'Buy'
                  ? 'Buy (Sale)'
                  : purpose === 'Invest'
                  ? 'Investment'
                  : purpose === 'Stays'
                  ? 'Stays & Hospitality'
                  : purpose}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Filter size={15} />
            Filters {selectedAmenities.length > 0 && `(${selectedAmenities.length})`}
          </button>
        </div>

        {/* Collapsible Advanced Filters */}
        {showAdvancedFilters && (
          <div style={{
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem'
          }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Property Category</label>
              <select
                className="form-input"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
              >
                <option value="All">All Categories</option>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>City / Location</label>
              <select
                className="form-input"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="All">All Cities</option>
                {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Min Bedrooms</label>
              <select
                className="form-input"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                value={minBedrooms}
                onChange={(e) => setMinBedrooms(Number(e.target.value))}
              >
                <option value={0}>Any Bedrooms</option>
                <option value={1}>1+ Beds</option>
                <option value={2}>2+ Beds</option>
                <option value={3}>3+ Beds</option>
                <option value={4}>4+ Beds</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Furnishing Status</label>
              <select
                className="form-input"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                value={selectedFurnished}
                onChange={(e) => setSelectedFurnished(e.target.value as any)}
              >
                <option value="All">Any Furnishing</option>
                <option value="Fully Furnished">Fully Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Min Price (₹)</label>
              <input
                type="number"
                className="form-input"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                placeholder="Any Min"
                value={minPrice ?? ''}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Max Price (₹)</label>
              <input
                type="number"
                className="form-input"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                placeholder="Any Max"
                value={maxPrice ?? ''}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            {/* Amenities */}
            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Filter by Amenities</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                {COMMON_AMENITIES.map(a => {
                  const selected = selectedAmenities.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: selected ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: selected ? 'var(--gold-primary)' : 'transparent',
                        color: selected ? '#070709' : 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
          <Building size={40} style={{ margin: '0 auto 1rem', opacity: 0.4, animation: 'pulse 1.5s infinite' }} />
          <p style={{ fontWeight: 600 }}>Streaming Real-Time Properties from Cloud Firestore...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--danger-bg)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem'
        }}>
          <AlertCircle size={24} />
          <div>
            <div style={{ fontWeight: 700 }}>Firestore Query Error</div>
            <div style={{ fontSize: '0.85rem' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProperties.length === 0 && (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Building size={54} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            No Matching Properties Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0.5rem auto 1.5rem' }}>
            No properties match your active filter criteria. Try expanding your search or selecting all categories.
          </p>
          <button
            onClick={() => {
              setSelectedType('All');
              setSelectedListingType('All');
              setSelectedCity('All');
              setSelectedFurnished('All');
              setSelectedAmenities([]);
              setSearchQuery('');
            }}
            className="btn btn-secondary btn-sm"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Main Content Area based on View Mode */}
      {!loading && filteredProperties.length > 0 && (
        <>
          {/* 1. Split View: Interactive Real-Time Map + Property Cards */}
          {viewMode === 'split' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.75rem',
              alignItems: 'flex-start'
            }}>
              {/* Map Left / Top */}
              <div style={{ position: 'sticky', top: '5.5rem' }}>
                <PropertyMap
                  properties={filteredProperties}
                  selectedProperty={selectedProperty}
                  userCoordinates={userCoordinates}
                  onSelectProperty={(p) => {
                    setSelectedProperty(p);
                    setDetailModalProperty(p); // Opens Big Card Modal
                  }}
                  onInquireProperty={(p) => setInquiryTarget(p)}
                  height="640px"
                />
              </div>

              {/* Property Cards List Right */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
                maxHeight: 'calc(100vh - 7rem)',
                overflowY: 'auto',
                paddingRight: '0.35rem'
              }}>
                {filteredProperties.map(renderPropertyCard)}
              </div>
            </div>
          )}

          {/* 2. Grid Only View */}
          {viewMode === 'grid' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem'
            }}>
              {filteredProperties.map(renderPropertyCard)}
            </div>
          )}

          {/* 3. Map Only View */}
          {viewMode === 'map' && (
            <div>
              <PropertyMap
                properties={filteredProperties}
                selectedProperty={selectedProperty}
                userCoordinates={userCoordinates}
                onSelectProperty={(p) => {
                  setSelectedProperty(p);
                  setDetailModalProperty(p); // Opens Big Card Modal
                }}
                onInquireProperty={(p) => setInquiryTarget(p)}
                height="740px"
              />
            </div>
          )}
        </>
      )}

      {/* Real-time Property Detail Modal (Big Card) */}
      <PropertyDetailModal
        isOpen={Boolean(detailModalProperty)}
        property={detailModalProperty}
        onClose={() => setDetailModalProperty(null)}
        onStartChat={(p) => handleStartChat(p)}
        onInquire={(p, intent) => handleOpenInquiry(p, intent)}
        isSaved={detailModalProperty ? favoriteIds.includes(detailModalProperty.propertyId) : false}
        onToggleSave={(p) => handleToggleFavorite(p)}
      />

      {/* Real-time Inquiry Modal */}
      <InquiryModal
        isOpen={Boolean(inquiryTarget)}
        onClose={() => setInquiryTarget(null)}
        property={inquiryTarget}
        initialIntent={inquiryIntent}
        onOpenPremium={() => {
          setPremiumReason('You have used your 3 free communications with property owners. Please choose a plan below to continue.');
          setPremiumModalOpen(true);
        }}
        onSuccess={() => {
          showToast('Inquiry submitted to the owner in real-time!', 'success');
        }}
      />

      {/* Real-time Chat Drawer */}
      <ChatDrawer
        isOpen={activeChat.isOpen}
        onClose={() => setActiveChat(prev => ({ ...prev, isOpen: false }))}
        conversationId={activeChat.conversationId}
        recipientId={activeChat.recipientId}
        recipientName={activeChat.recipientName}
        propertyTitle={activeChat.propertyTitle}
        onOpenPremium={() => {
          setPremiumReason('You have used your 3 free communications with property owners. Please choose a plan below to continue.');
          setPremiumModalOpen(true);
        }}
      />

      {/* Premium Membership Modal (₹350, ₹500, ₹750) */}
      <PremiumModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        reason={premiumReason}
      />
    </div>
  );
};
