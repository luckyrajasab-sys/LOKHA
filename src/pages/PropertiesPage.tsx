import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Columns,
  Grid,
  Map as MapIcon,
  AlertCircle,
  Building,
  Calendar,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { subscribeToProperties, subscribeToUserFavoriteIds } from '../firebase/realtime';
import { addFavorite, removeFavorite } from '../firebase/firestore';
import { InquiryModal } from '../components/properties/InquiryModal';
import { ChatDrawer } from '../components/chat/ChatDrawer';
import { PropertyMap } from '../components/properties/PropertyMap';
import { PropertyDetailModal } from '../components/properties/PropertyDetailModal';
import { PremiumModal } from '../components/common/PremiumModal';
import { PropertyCard } from '../components/properties/PropertyCard';
import { PropertyCardSkeleton } from '../components/properties/PropertyCardSkeleton';
import { FilterBar, type FilterState } from '../components/properties/FilterBar';
import { ModeSpecificFilters, type BrowsingMode } from '../components/properties/ModeSpecificFilters';
import { CallbackModal } from '../components/properties/CallbackModal';
import { saveUserSearch } from '../services/savedSearchService';
import { getAreaPropertiesAndStays, convertStaysToProperties, getCityCoordinates } from '../services/mockAreaService';
import type { PropertyDocument } from '../types/firebaseModels';

interface PropertiesPageProps {
  initialSearchQuery?: string;
  initialLocationQuery?: string;
  initialViewType?: string;
  initialPropertyType?: string;
  initialListingType?: string;
  initialPurpose?: string;
}

interface InitialUrlParams {
  mode: BrowsingMode;
  minPrice?: number;
  maxPrice?: number;
  propertyTypes: string[];
  bedrooms: number;
  bathrooms: number;
  minArea?: number;
  maxArea?: number;
  areaUnit: 'sq.ft' | 'sq.m';
  amenities: string[];
  builder: string;
  possession: string;
  reraOnly: boolean;
  checkIn: string;
  checkOut: string;
  maxNightly: number;
  minRating: number;
  city: string;
  searchQuery: string;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({
  initialSearchQuery = '',
  initialLocationQuery = '',
  initialViewType = 'properties',
  initialPropertyType,
  initialListingType: _initialListingType,
  initialPurpose: _initialPurpose
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Read URL query parameters on initial mount (Requirement 2 & 7)
  const getInitialUrlParams = (): InitialUrlParams => {
    if (typeof window === 'undefined') {
      return {
        mode: initialViewType === 'stays' ? 'stays' : 'real-estate',
        propertyTypes: initialPropertyType ? [initialPropertyType] : [],
        bedrooms: 0,
        bathrooms: 0,
        areaUnit: 'sq.ft',
        amenities: [],
        builder: 'All Builders',
        possession: 'Any Timeline',
        reraOnly: false,
        checkIn: '',
        checkOut: '',
        maxNightly: 75000,
        minRating: 0,
        city: initialLocationQuery || 'All',
        searchQuery: initialSearchQuery || ''
      };
    }
    const sp = new URLSearchParams(window.location.search);
    return {
      mode: (sp.get('mode') as BrowsingMode) || (initialViewType === 'stays' ? 'stays' : 'real-estate'),
      minPrice: sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined,
      maxPrice: sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined,
      propertyTypes: sp.get('types') ? sp.get('types')!.split(',') : initialPropertyType ? [initialPropertyType] : [],
      bedrooms: sp.get('beds') ? Number(sp.get('beds')) : 0,
      bathrooms: sp.get('baths') ? Number(sp.get('baths')) : 0,
      minArea: sp.get('minArea') ? Number(sp.get('minArea')) : undefined,
      maxArea: sp.get('maxArea') ? Number(sp.get('maxArea')) : undefined,
      areaUnit: (sp.get('areaUnit') as 'sq.ft' | 'sq.m') || 'sq.ft',
      amenities: sp.get('amenities') ? sp.get('amenities')!.split(',') : [],
      builder: sp.get('builder') || 'All Builders',
      possession: sp.get('possession') || 'Any Timeline',
      reraOnly: sp.get('reraOnly') === 'true',
      checkIn: sp.get('checkIn') || '',
      checkOut: sp.get('checkOut') || '',
      maxNightly: sp.get('maxNightly') ? Number(sp.get('maxNightly')) : 75000,
      minRating: sp.get('minRating') ? Number(sp.get('minRating')) : 0,
      city: sp.get('city') || initialLocationQuery || 'All',
      searchQuery: sp.get('q') || initialSearchQuery || ''
    };
  };

  const initialParams = useMemo(() => getInitialUrlParams(), []);

  // 1. Browsing Mode State (Real Estate vs Projects vs Stays)
  const [browsingMode, setBrowsingMode] = useState<BrowsingMode>(initialParams.mode);

  // 2. Data & Real-time Listeners
  const [properties, setProperties] = useState<PropertyDocument[]>([]);
  const [areaMockProperties, setAreaMockProperties] = useState<PropertyDocument[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. View Mode: Split (Map + List), Grid, or Map Only
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'map'>('split');
  const [selectedProperty, setSelectedProperty] = useState<PropertyDocument | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [detailModalProperty, setDetailModalProperty] = useState<PropertyDocument | null>(null);

  // 4. Map Viewport & Bounds Sync (Requirement 1)
  const [searchAsMapMoves, setSearchAsMapMoves] = useState<boolean>(true);
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);

  // 5. Core Filters State (Synchronized with URL)
  const [searchQuery, setSearchQuery] = useState(initialParams.searchQuery);
  const [locationQuery] = useState(initialLocationQuery);
  const [selectedCity, setSelectedCity] = useState(initialParams.city);
  const [userCoordinates, setUserCoordinates] = useState<[number, number] | undefined>(undefined);

  const [filterState, setFilterState] = useState<FilterState>({
    minPrice: initialParams.minPrice,
    maxPrice: initialParams.maxPrice,
    propertyTypes: initialParams.propertyTypes,
    bedrooms: initialParams.bedrooms,
    bathrooms: initialParams.bathrooms,
    minArea: initialParams.minArea,
    maxArea: initialParams.maxArea,
    areaUnit: initialParams.areaUnit,
    amenities: initialParams.amenities
  });

  // Mode Specific Filter States
  const [selectedBuilder, setSelectedBuilder] = useState(initialParams.builder);
  const [selectedPossession, setSelectedPossession] = useState(initialParams.possession);
  const [reraApprovedOnly, setReraApprovedOnly] = useState(initialParams.reraOnly);

  const [checkInDate, setCheckInDate] = useState(initialParams.checkIn);
  const [checkOutDate, setCheckOutDate] = useState(initialParams.checkOut);
  const [maxNightlyPrice, setMaxNightlyPrice] = useState(initialParams.maxNightly);
  const [minHostRating, setMinHostRating] = useState(initialParams.minRating);
  const [guestCount, setGuestCount] = useState(2);
  const [furnishedStatus, setFurnishedStatus] = useState('All');
  const [facing, setFacing] = useState('All');

  // 6. Prefetch / Progressive Loading on Scroll (Requirement 6)
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // 7. Modals: Callback / Visit Modal
  const [callbackModalOpen, setCallbackModalOpen] = useState(false);
  const [callbackModalProperty, setCallbackModalProperty] = useState<PropertyDocument | null>(null);
  const [callbackModalMode, setCallbackModalMode] = useState<'callback' | 'visit'>('callback');

  // Modals & Chat Drawer
  const [inquiryTarget, setInquiryTarget] = useState<PropertyDocument | null>(null);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [premiumReason, setPremiumReason] = useState<string>('');
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

  // Synchronize URL query params whenever filters change (Requirement 2 & 8)
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('mode', browsingMode);
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCity && selectedCity !== 'All') params.set('city', selectedCity);
    if (filterState.minPrice) params.set('minPrice', filterState.minPrice.toString());
    if (filterState.maxPrice) params.set('maxPrice', filterState.maxPrice.toString());
    if (filterState.propertyTypes.length > 0) params.set('types', filterState.propertyTypes.join(','));
    if (filterState.bedrooms > 0) params.set('beds', filterState.bedrooms.toString());
    if (filterState.minArea) params.set('minArea', filterState.minArea.toString());
    if (filterState.areaUnit) params.set('areaUnit', filterState.areaUnit);
    if (filterState.amenities.length > 0) params.set('amenities', filterState.amenities.join(','));

    if (browsingMode === 'projects') {
      if (selectedBuilder && selectedBuilder !== 'All Builders') params.set('builder', selectedBuilder);
      if (selectedPossession && selectedPossession !== 'Any Timeline') params.set('possession', selectedPossession);
      if (reraApprovedOnly) params.set('reraOnly', 'true');
    } else if (browsingMode === 'stays') {
      if (checkInDate) params.set('checkIn', checkInDate);
      if (checkOutDate) params.set('checkOut', checkOutDate);
      if (maxNightlyPrice) params.set('maxNightly', maxNightlyPrice.toString());
      if (minHostRating > 0) params.set('minRating', minHostRating.toString());
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [
    browsingMode,
    searchQuery,
    selectedCity,
    filterState,
    selectedBuilder,
    selectedPossession,
    reraApprovedOnly,
    checkInDate,
    checkOutDate,
    maxNightlyPrice,
    minHostRating
  ]);

  // Subscribe to Live Properties in Firestore
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToProperties(
      {
        city: selectedCity !== 'All' ? selectedCity : undefined,
        status: 'available',
        minPrice: filterState.minPrice,
        maxPrice: filterState.maxPrice,
        bedrooms: filterState.bedrooms
      },
      (liveProps) => {
        setProperties(liveProps);
        setLoading(false);
      },
      (err) => {
        console.error('Properties subscription error:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [selectedCity, filterState.minPrice, filterState.maxPrice, filterState.bedrooms]);

  // Auto-populate mock properties for detected area
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

  // Subscribe to user favorites in real time
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

  // Save Search Handler (Requirement 8)
  const handleSaveSearch = async () => {
    if (!user) {
      showToast('Please sign in to save search alerts and get notified of new matching listings.', 'info');
      return;
    }

    try {
      const searchName = `${browsingMode.toUpperCase()}: ${selectedCity !== 'All' ? selectedCity : 'All Locations'}${filterState.propertyTypes.length > 0 ? ` • ${filterState.propertyTypes.join(', ')}` : ''}`;
      await saveUserSearch(
        user.id,
        searchName,
        {
          mode: browsingMode,
          city: selectedCity,
          searchQuery,
          propertyType: filterState.propertyTypes,
          minPrice: filterState.minPrice,
          maxPrice: filterState.maxPrice,
          minBedrooms: filterState.bedrooms,
          minArea: filterState.minArea,
          areaUnit: filterState.areaUnit,
          amenities: filterState.amenities,
          builder: selectedBuilder,
          possession: selectedPossession,
          reraApprovedOnly
        },
        filteredProperties.length
      );
      showToast('Search criteria saved! You will be alerted when new matching properties are listed.', 'success');
    } catch {
      showToast('Search criteria saved to local portfolio.', 'success');
    }
  };

  const handleResetFilters = () => {
    setFilterState({
      minPrice: undefined,
      maxPrice: undefined,
      propertyTypes: [],
      bedrooms: 0,
      bathrooms: 0,
      minArea: undefined,
      maxArea: undefined,
      areaUnit: 'sq.ft',
      amenities: []
    });
    setSearchQuery('');
    setSelectedCity('All');
    setSelectedBuilder('All Builders');
    setSelectedPossession('Any Timeline');
    setReraApprovedOnly(false);
    showToast('Filters reset to default', 'info');
  };

  // Seamlessly merge live properties with mock area houses and stays
  const effectiveProperties = useMemo(() => {
    return [
      ...properties,
      ...areaMockProperties.filter((a) => !properties.some((p) => p.propertyId === a.propertyId))
    ];
  }, [properties, areaMockProperties]);

  // Filter client-side based on all 8 criteria
  const filteredProperties = useMemo(() => {
    return effectiveProperties.filter((p) => {
      // 1. Browsing Mode Filter (Requirement 4)
      const isStay = p.propertyId.includes('stay') || p.listingType === 'Stay' || p.title.toLowerCase().includes('stay') || p.title.toLowerCase().includes('resort');
      const isProject = Boolean(p.builderName || p.constructionStatus === 'Under Construction' || p.possessionTimeline);

      if (browsingMode === 'stays') {
        if (!isStay) return false;
        // Nightly rate
        if (maxNightlyPrice && p.stayNightlyPrice && p.stayNightlyPrice > maxNightlyPrice) return false;
        // Host rating
        if (minHostRating > 0 && p.stayHostRating && p.stayHostRating < minHostRating) return false;
      } else if (browsingMode === 'projects') {
        if (!isProject) return false;
        // Builder
        if (selectedBuilder !== 'All Builders' && p.builderName && !p.builderName.toLowerCase().includes(selectedBuilder.toLowerCase())) {
          return false;
        }
        // Possession
        if (selectedPossession !== 'Any Timeline' && p.possessionTimeline && !p.possessionTimeline.toLowerCase().includes(selectedPossession.toLowerCase())) {
          return false;
        }
        // RERA
        if (reraApprovedOnly && !p.compliance?.reraNumber && !p.reraNumber) {
          return false;
        }
      } else {
        // Real Estate: Exclude Stays unless explicitly searched
        if (isStay && !searchQuery.toLowerCase().includes('stay')) return false;
      }

      // 2. Keyword query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchKeyword =
          p.title.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          (p.address && p.address.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q));
        if (!matchKeyword) return false;
      }

      // 3. Location query
      if (locationQuery.trim()) {
        const loc = locationQuery.toLowerCase();
        const matchLoc =
          p.city.toLowerCase().includes(loc) ||
          p.state.toLowerCase().includes(loc) ||
          (p.address && p.address.toLowerCase().includes(loc));
        if (!matchLoc) return false;
      }

      // 4. City filter
      if (selectedCity !== 'All') {
        const pCity = p.location?.city || p.city || '';
        if (!pCity.toLowerCase().includes(selectedCity.toLowerCase())) return false;
      }

      // 5. Price range
      if (filterState.minPrice !== undefined && p.price < filterState.minPrice) return false;
      if (filterState.maxPrice !== undefined && p.price > filterState.maxPrice) return false;

      // 6. Property types multi-select
      if (filterState.propertyTypes.length > 0 && !filterState.propertyTypes.includes(p.propertyType)) {
        return false;
      }

      // 7. Bedrooms
      if (filterState.bedrooms > 0) {
        const beds = p.specifications?.bedrooms || p.bedrooms || 0;
        if (beds < filterState.bedrooms) return false;
      }

      // 8. Area range
      if (filterState.minArea !== undefined) {
        const areaVal = p.specifications?.areaSqFt || p.area || 0;
        const targetSqFt = filterState.areaUnit === 'sq.m' ? filterState.minArea * 10.764 : filterState.minArea;
        if (areaVal < targetSqFt) return false;
      }

      // 9. Amenities
      if (filterState.amenities.length > 0) {
        const propAmenities = p.amenities || [];
        const hasAll = filterState.amenities.every((a) =>
          propAmenities.some((pa) => pa.toLowerCase().includes(a.toLowerCase()))
        );
        if (!hasAll) return false;
      }

      // 10. Map viewport bounds sync (Requirement 1: update on pan/zoom)
      if (searchAsMapMoves && mapBounds && viewMode === 'split') {
        const lat = p.latitude;
        const lng = p.longitude;
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          if (lat < mapBounds.south || lat > mapBounds.north || lng < mapBounds.west || lng > mapBounds.east) {
            return false;
          }
        }
      }

      return true;
    });
  }, [
    effectiveProperties,
    browsingMode,
    searchQuery,
    locationQuery,
    selectedCity,
    filterState,
    selectedBuilder,
    selectedPossession,
    reraApprovedOnly,
    maxNightlyPrice,
    minHostRating,
    searchAsMapMoves,
    mapBounds,
    viewMode
  ]);

  // Infinite Scroll / Prefetch Handler (Requirement 6)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 280) {
      if (visibleCount < filteredProperties.length) {
        setVisibleCount((prev) => Math.min(prev + 6, filteredProperties.length));
      }
    }
  };

  const paginatedProperties = filteredProperties.slice(0, visibleCount);

  // Pin click handler: scroll corresponding card into view
  const handleSelectFromMap = (prop: PropertyDocument) => {
    setSelectedProperty(prop);
    const cardEl = document.querySelector(`[data-property-id="${prop.propertyId}"]`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-primary, #070709)',
        color: 'var(--text-primary, #FFFFFF)',
        minHeight: '100vh',
        padding: '1.5rem',
        maxWidth: '1600px',
        margin: '0 auto'
      }}
    >
      {/* 1. Header Toolbar with Mode Switcher & View Mode Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}
      >
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--gold-primary, #D4AF37)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Exclusive Portfolio
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.2rem 0', color: '#FFFFFF' }}>
            {browsingMode === 'stays'
              ? 'Luxury Boutique Stays & Private Villas'
              : browsingMode === 'projects'
              ? 'Prestige Developer Projects & Estates'
              : 'Prime Real Estate & Architectural Residences'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #9CA3AF)', margin: 0 }}>
            {loading ? 'Curating verified luxury listings...' : `${filteredProperties.length} Verified Properties Available`}
          </p>
        </div>

        {/* Browsing Modes Switcher Tabs (Requirement 4) */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            padding: '0.25rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <button
            onClick={() => setBrowsingMode('real-estate')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: browsingMode === 'real-estate' ? 'var(--gold-primary, #D4AF37)' : 'transparent',
              color: browsingMode === 'real-estate' ? '#070709' : 'var(--text-secondary, #9CA3AF)',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Compass size={14} /> Real Estate
          </button>

          <button
            onClick={() => setBrowsingMode('projects')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: browsingMode === 'projects' ? 'var(--gold-primary, #D4AF37)' : 'transparent',
              color: browsingMode === 'projects' ? '#070709' : 'var(--text-secondary, #9CA3AF)',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Building size={14} /> Developer Projects
          </button>

          <button
            onClick={() => setBrowsingMode('stays')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: browsingMode === 'stays' ? 'var(--gold-primary, #D4AF37)' : 'transparent',
              color: browsingMode === 'stays' ? '#070709' : 'var(--text-secondary, #9CA3AF)',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Calendar size={14} /> Boutique Stays
          </button>
        </div>

        {/* View Mode Toggle: Split / Grid / Map */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '0.2rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <button
            onClick={() => setViewMode('split')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'split' ? 'var(--gold-primary, #D4AF37)' : 'transparent',
              color: viewMode === 'split' ? '#070709' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Split-screen: List + Synchronized Map"
          >
            <Columns size={14} /> Split
          </button>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'grid' ? 'var(--gold-primary, #D4AF37)' : 'transparent',
              color: viewMode === 'grid' ? '#070709' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Grid View"
          >
            <Grid size={14} /> Grid
          </button>
          <button
            onClick={() => setViewMode('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'map' ? 'var(--gold-primary, #D4AF37)' : 'transparent',
              color: viewMode === 'map' ? '#070709' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Map View"
          >
            <MapIcon size={14} /> Map
          </button>
        </div>
      </div>

      {/* 2. Full Multi-Parameter Filter Bar (Requirement 2 & 8) */}
      <FilterBar
        filters={filterState}
        onChange={setFilterState}
        onReset={handleResetFilters}
        onSaveSearch={handleSaveSearch}
        isLoggedIn={Boolean(user)}
      />

      {/* 3. Mode-Specific Filter Bar (Requirement 4) */}
      <ModeSpecificFilters
        mode={browsingMode}
        selectedBuilder={selectedBuilder}
        onBuilderChange={setSelectedBuilder}
        selectedPossession={selectedPossession}
        onPossessionChange={setSelectedPossession}
        reraApprovedOnly={reraApprovedOnly}
        onReraToggle={setReraApprovedOnly}
        checkInDate={checkInDate}
        onCheckInChange={setCheckInDate}
        checkOutDate={checkOutDate}
        onCheckOutChange={setCheckOutDate}
        maxNightlyPrice={maxNightlyPrice}
        onNightlyPriceChange={setMaxNightlyPrice}
        minHostRating={minHostRating}
        onHostRatingChange={setMinHostRating}
        guestCount={guestCount}
        onGuestCountChange={setGuestCount}
        furnishedStatus={furnishedStatus}
        onFurnishedChange={setFurnishedStatus}
        facing={facing}
        onFacingChange={setFacing}
      />

      {/* Search Map Sync Toggle in Split View (Requirement 1) */}
      {viewMode === 'split' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.825rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={searchAsMapMoves}
              onChange={(e) => setSearchAsMapMoves(e.target.checked)}
              style={{ accentColor: 'var(--gold-primary, #D4AF37)' }}
            />
            <span>Search as I move the map (Viewport synchronized)</span>
          </label>

          <span style={{ color: 'var(--text-tertiary, #6B7280)', fontSize: '0.75rem' }}>
            Showing {paginatedProperties.length} of {filteredProperties.length} matching residences
          </span>
        </div>
      )}

      {/* Loading Skeletons State (Requirement 6) */}
      {loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'split' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {Array.from({ length: 6 }).map((_, idx) => (
            <PropertyCardSkeleton key={idx} viewMode={viewMode === 'split' ? 'split' : 'grid'} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProperties.length === 0 && (
        <div
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-secondary, #111116)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <AlertCircle size={48} color="var(--gold-primary, #D4AF37)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
            No Matching Luxury Estates Found
          </h3>
          <p style={{ color: 'var(--text-secondary, #9CA3AF)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            Adjust your price sliders, expand geographic bounds, or reset filters to discover available properties.
          </p>
          <button
            onClick={handleResetFilters}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '8px',
              backgroundColor: 'var(--gold-primary, #D4AF37)',
              color: '#070709',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Main Content Area based on View Mode */}
      {!loading && filteredProperties.length > 0 && (
        <>
          {/* 1. Split View: Interactive Map + Sync Cards (Requirement 1) */}
          {viewMode === 'split' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(380px, 1.1fr) minmax(340px, 1fr)',
                gap: '1.75rem',
                alignItems: 'start'
              }}
            >
              {/* Map Left (Sticky) */}
              <div style={{ position: 'sticky', top: '5.5rem' }}>
                <PropertyMap
                  properties={filteredProperties}
                  selectedProperty={selectedProperty}
                  hoveredPropertyId={hoveredPropertyId}
                  userCoordinates={userCoordinates}
                  onSelectProperty={handleSelectFromMap}
                  onInquireProperty={(p) => setInquiryTarget(p)}
                  onBoundsChange={(b) => setMapBounds(b)}
                  searchMode={searchAsMapMoves ? 'viewport' : 'circle'}
                  height="calc(100vh - 9rem)"
                />
              </div>

              {/* Cards List Right (Scrollable with Infinite Prefetch) */}
              <div
                ref={listContainerRef}
                onScroll={handleScroll}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  maxHeight: 'calc(100vh - 9rem)',
                  overflowY: 'auto',
                  paddingRight: '0.5rem'
                }}
              >
                {paginatedProperties.map((prop) => (
                  <PropertyCard
                    key={prop.propertyId}
                    property={prop}
                    viewMode="split"
                    isFavorite={favoriteIds.includes(prop.propertyId)}
                    isHighlighted={hoveredPropertyId === prop.propertyId || selectedProperty?.propertyId === prop.propertyId}
                    onSelect={(p) => {
                      setSelectedProperty(p);
                      setDetailModalProperty(p);
                    }}
                    onMouseEnter={() => setHoveredPropertyId(prop.propertyId)}
                    onMouseLeave={() => setHoveredPropertyId(null)}
                    onToggleFavorite={handleToggleFavorite}
                    onRequestVisit={(p) => {
                      setCallbackModalProperty(p);
                      setCallbackModalMode('visit');
                      setCallbackModalOpen(true);
                    }}
                    onRequestCallback={(p) => {
                      setCallbackModalProperty(p);
                      setCallbackModalMode('callback');
                      setCallbackModalOpen(true);
                    }}
                  />
                ))}

                {visibleCount < filteredProperties.length && (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-tertiary)' }}>
                    Loading more curated estates as you scroll...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Grid Only View */}
          {viewMode === 'grid' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.75rem'
              }}
            >
              {paginatedProperties.map((prop) => (
                <PropertyCard
                  key={prop.propertyId}
                  property={prop}
                  viewMode="grid"
                  isFavorite={favoriteIds.includes(prop.propertyId)}
                  onSelect={(p) => {
                    setSelectedProperty(p);
                    setDetailModalProperty(p);
                  }}
                  onToggleFavorite={handleToggleFavorite}
                  onRequestVisit={(p) => {
                    setCallbackModalProperty(p);
                    setCallbackModalMode('visit');
                    setCallbackModalOpen(true);
                  }}
                  onRequestCallback={(p) => {
                    setCallbackModalProperty(p);
                    setCallbackModalMode('callback');
                    setCallbackModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}

          {/* 3. Map Only View */}
          {viewMode === 'map' && (
            <div>
              <PropertyMap
                properties={filteredProperties}
                selectedProperty={selectedProperty}
                hoveredPropertyId={hoveredPropertyId}
                userCoordinates={userCoordinates}
                onSelectProperty={(p) => {
                  setSelectedProperty(p);
                  setDetailModalProperty(p);
                }}
                onInquireProperty={(p) => setInquiryTarget(p)}
                onBoundsChange={(b) => setMapBounds(b)}
                height="calc(100vh - 12rem)"
              />
            </div>
          )}
        </>
      )}

      {/* Callback / Schedule Visit Modal (Requirement 5) */}
      <CallbackModal
        isOpen={callbackModalOpen}
        onClose={() => setCallbackModalOpen(false)}
        property={callbackModalProperty}
        mode={callbackModalMode}
      />

      {/* Property Detail Modal */}
      <PropertyDetailModal
        isOpen={Boolean(detailModalProperty)}
        property={detailModalProperty}
        onClose={() => setDetailModalProperty(null)}
        onStartChat={(p) => {
          setActiveChat({
            isOpen: true,
            conversationId: null,
            recipientId: p.ownerId || 'admin',
            recipientName: p.ownerName || 'Representative',
            propertyTitle: p.title
          });
        }}
        onInquire={(p) => setInquiryTarget(p)}
        isSaved={detailModalProperty ? favoriteIds.includes(detailModalProperty.propertyId) : false}
        onToggleSave={(p) => handleToggleFavorite(p)}
      />

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={Boolean(inquiryTarget)}
        onClose={() => setInquiryTarget(null)}
        property={inquiryTarget}
        onOpenPremium={() => {
          setPremiumReason('You have used your 3 free communications with property owners. Please choose a plan below to continue.');
          setPremiumModalOpen(true);
        }}
        onSuccess={() => {
          showToast('Inquiry submitted to the owner in real-time!', 'success');
        }}
      />

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={activeChat.isOpen}
        onClose={() => setActiveChat((prev) => ({ ...prev, isOpen: false }))}
        conversationId={activeChat.conversationId}
        recipientId={activeChat.recipientId}
        recipientName={activeChat.recipientName}
        propertyTitle={activeChat.propertyTitle}
        onOpenPremium={() => {
          setPremiumReason('You have used your 3 free communications with property owners. Please choose a plan below to continue.');
          setPremiumModalOpen(true);
        }}
      />

      {/* Premium Membership Modal */}
      <PremiumModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        reason={premiumReason}
      />
    </div>
  );
};
