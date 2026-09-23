import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Crosshair,
  MapPin,
  Compass,
  AlertCircle,
  X,
  Move
} from 'lucide-react';
import type { PropertyDocument } from '../types/firebaseModels';
import { getProperties } from '../services/propertyService';
import {
  haversineDistanceMeters,
  reverseGeocode,
  formatDistance
} from '../utils/location';
import 'leaflet/dist/leaflet.css';

interface MapSearchPageProps {
  onNavigate: (view: string, location?: string) => void;
}

interface PropertyWithDistance extends PropertyDocument {
  distanceMeters: number;
}

export const MapSearchPage: React.FC<MapSearchPageProps> = ({ onNavigate }) => {
  // All properties fetched from Firebase
  const [allProperties, setAllProperties] = useState<PropertyDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Separate State Architecture as requested:
  // userLocation ≠ selectedLocation ≠ mapCenter
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>([12.9716, 77.5946]); // Default Bengaluru
  const [searchRadius, setSearchRadius] = useState<number>(1000); // 1000m (1 km) default
  const [isDraggingCircle, setIsDraggingCircle] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Bengaluru, Karnataka');
  const [liveCoords, setLiveCoords] = useState<[number, number]>([12.9716, 77.5946]);

  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedProp, setSelectedProp] = useState<PropertyDocument | null>(null);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const searchCircleRef = useRef<any>(null);
  const innerCircleRef = useRef<any>(null);
  const handleMarkerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const propertyMarkersLayerRef = useRef<any>(null);

  const radiusOptions = [
    { label: '500 m', value: 500 },
    { label: '1 km', value: 1000 },
    { label: '2 km', value: 2000 },
    { label: '5 km', value: 5000 },
    { label: '10 km', value: 10000 }
  ];

  const cities = ['All', 'Bengaluru', 'Chennai', 'Mumbai', 'Hyderabad', 'Pune', 'Goa'];

  const cityCenters: Record<string, [number, number]> = {
    Bengaluru: [12.9716, 77.5946],
    Chennai: [13.0827, 80.2707],
    Mumbai: [19.0760, 72.8777],
    Hyderabad: [17.3850, 78.4867],
    Pune: [18.5204, 73.8567],
    Goa: [15.4989, 73.8278],
    All: [12.9716, 77.5946]
  };

  // 1. Fetch properties
  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      try {
        const list = await getProperties({});
        setAllProperties(list);
      } catch (err) {
        console.error('Failed to load properties for map:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  // 2. Initial Auto-detect User Location via browser Geolocation API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!navigator.geolocation) {
      setLocationError('Location access is unavailable. Move the search area manually.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords: [number, number] = [latitude, longitude];
        setUserLocation(coords);
        setSelectedLocation(coords);
        setLiveCoords(coords);

        // Center map on initial user location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(coords, 14);
        }

        reverseGeocode(latitude, longitude).then((res) => {
          setLocationName(res.displayName);
        });
      },
      () => {
        // Fallback gracefully without breaking map
        setLocationError('Location access is unavailable. Move the search area manually.');
        reverseGeocode(12.9716, 77.5946).then((res) => {
          setLocationName(res.displayName);
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  // 3. Filter properties within searchRadius of selectedLocation
  const filteredProperties: PropertyWithDistance[] = React.useMemo(() => {
    if (!allProperties.length) return [];

    const [selLat, selLng] = selectedLocation;

    return allProperties
      .map((prop, idx) => {
        // Assign realistic coordinates around city center if missing in dataset
        let lat = prop.latitude;
        let lng = prop.longitude;

        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
          const cityCoords = prop.location?.city ? cityCenters[prop.location.city] : null;
          const baseLat = cityCoords ? cityCoords[0] : selLat;
          const baseLng = cityCoords ? cityCoords[1] : selLng;
          const angle = (idx * 63.5) * (Math.PI / 180);
          const rFrac = 0.2 + ((idx % 6) * 0.14);
          const offsetMeters = 800 * rFrac;
          lat = baseLat + (offsetMeters / 111000) * Math.cos(angle);
          lng = baseLng + (offsetMeters / (111000 * Math.cos(baseLat * (Math.PI / 180)))) * Math.sin(angle);
        }

        const distMeters = haversineDistanceMeters(selLat, selLng, lat, lng);
        return {
          ...prop,
          latitude: lat,
          longitude: lng,
          distanceMeters: distMeters
        };
      })
      .filter((prop) => prop.distanceMeters <= searchRadius)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [allProperties, selectedLocation, searchRadius]);

  // Set default selected property when filtered list updates
  useEffect(() => {
    if (filteredProperties.length > 0) {
      if (!selectedProp || !filteredProperties.some(p => p.propertyId === selectedProp.propertyId)) {
        setSelectedProp(filteredProperties[0]);
      }
    } else {
      setSelectedProp(null);
    }
  }, [filteredProperties]);

  // 4. Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    let isSubscribed = true;

    async function initLeaflet() {
      const L = (await import('leaflet')).default;
      if (!isSubscribed) return;
      leafletRef.current = L;

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const initialCenter = selectedLocation;
        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 14,
          zoomControl: false,
          tapTolerance: 15
        });

        // Add premium tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Layer group for property markers
        propertyMarkersLayerRef.current = L.layerGroup().addTo(map);

        mapInstanceRef.current = map;
      }
    }

    initLeaflet();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // 5. Render "Your Location" Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'lokha-user-location-marker',
        html: `
          <div style="position: relative; width: 26px; height: 26px; transform: translate(-50%, -50%); cursor: default;">
            <div style="
              position: absolute;
              inset: -8px;
              border-radius: 50%;
              background: rgba(59, 130, 246, 0.28);
              animation: lokhaUserPulse 2s cubic-bezier(0.25, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              position: absolute;
              inset: 0;
              border-radius: 50%;
              background: #2563EB;
              border: 3px solid #FFFFFF;
              box-shadow: 0 0 14px rgba(37, 99, 235, 0.9);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="width: 6px; height: 6px; border-radius: 50%; background: #FFFFFF;"></div>
            </div>
            <div style="
              position: absolute;
              top: -24px;
              left: 50%;
              transform: translateX(-50%);
              background: #18181B;
              color: #FFFFFF;
              font-size: 10px;
              font-weight: 700;
              padding: 2px 7px;
              border-radius: 6px;
              white-space: nowrap;
              border: 1px solid rgba(255,255,255,0.2);
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              pointer-events: none;
            ">
              Your Location
            </div>
          </div>
        `,
        iconSize: [0, 0]
      });

      userMarkerRef.current = L.marker(userLocation, {
        icon: userIcon,
        zIndexOffset: 1500
      }).addTo(map);
    }
  }, [userLocation]);

  // 6. Render Draggable Search Circle & Center Drag Handle
  // CRITICAL REQUIREMENT:
  // MAP CAMERA REMAINS FIXED WHILE DRAGGING.
  // ONLY THE SEARCH CIRCLE MOVES ACROSS THE MAP.
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    // Clean up existing circle and drag handle
    if (searchCircleRef.current) {
      map.removeLayer(searchCircleRef.current);
      searchCircleRef.current = null;
    }
    if (innerCircleRef.current) {
      map.removeLayer(innerCircleRef.current);
      innerCircleRef.current = null;
    }
    if (handleMarkerRef.current) {
      map.removeLayer(handleMarkerRef.current);
      handleMarkerRef.current = null;
    }

    const [selLat, selLng] = selectedLocation;

    // 1. Primary Search Radius Circle
    const circle = L.circle([selLat, selLng], {
      radius: searchRadius,
      color: '#C6A15B',
      weight: 2.2,
      dashArray: '6, 6',
      fillColor: '#C6A15B',
      fillOpacity: 0.10
    }).addTo(map);
    searchCircleRef.current = circle;

    // 2. Secondary Inner Ripple Circle
    const innerCircle = L.circle([selLat, selLng], {
      radius: searchRadius * 0.45,
      color: 'rgba(198, 161, 91, 0.45)',
      weight: 1.2,
      dashArray: '4, 4',
      fillColor: '#10B981',
      fillOpacity: 0.04
    }).addTo(map);
    innerCircleRef.current = innerCircle;

    // 3. Clear Center Drag Handle Marker
    const dragHandleIcon = L.divIcon({
      className: 'lokha-center-drag-handle',
      html: `
        <div style="
          position: relative;
          width: 44px;
          height: 44px;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
          touch-action: none;
        ">
          <!-- Outer Pulsing Glow -->
          <div style="
            position: absolute;
            inset: -6px;
            border-radius: 50%;
            background: rgba(198, 161, 91, 0.25);
            animation: handlePulse 2s ease-in-out infinite;
          "></div>

          <!-- Main Luxury Handle Disc -->
          <div style="
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #18181B;
            border: 2px solid #C6A15B;
            box-shadow: 0 4px 16px rgba(0,0,0,0.5), 0 0 10px rgba(198, 161, 91, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #C6A15B;
            transition: transform 0.15s ease, background 0.15s ease;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="5 9 2 12 5 15"></polyline>
              <polyline points="9 5 12 2 15 5"></polyline>
              <polyline points="15 19 12 22 9 19"></polyline>
              <polyline points="19 9 22 12 19 15"></polyline>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <line x1="12" y1="2" x2="12" y2="22"></line>
            </svg>
          </div>

          <!-- Drag Badge Tooltip -->
          <div style="
            position: absolute;
            bottom: -22px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(24, 24, 27, 0.95);
            color: #C6A15B;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            padding: 2px 7px;
            border-radius: 6px;
            white-space: nowrap;
            border: 1px solid rgba(198, 161, 91, 0.4);
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            pointer-events: none;
          ">
            Drag Area
          </div>
        </div>
      `,
      iconSize: [0, 0]
    });

    const handleMarker = L.marker([selLat, selLng], {
      icon: dragHandleIcon,
      draggable: true,
      zIndexOffset: 3000
    }).addTo(map);
    handleMarkerRef.current = handleMarker;

    // DRAGGING LOGIC:
    // When dragging begins:
    // - Disable map panning temporarily.
    // - Keep map camera completely stationary.
    // - Move only the search circle.
    // - Update circle center coordinates continuously.
    handleMarker.on('dragstart', () => {
      setIsDraggingCircle(true);
      map.dragging.disable();
      map.touchZoom.disable();
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
    });

    handleMarker.on('drag', (e: any) => {
      const pos = e.target.getLatLng();
      circle.setLatLng(pos);
      innerCircle.setLatLng(pos);
      setLiveCoords([pos.lat, pos.lng]);
    });

    handleMarker.on('dragend', (e: any) => {
      setIsDraggingCircle(false);
      map.dragging.enable();
      map.touchZoom.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();

      const finalPos = e.target.getLatLng();
      const newCoords: [number, number] = [finalPos.lat, finalPos.lng];
      setSelectedLocation(newCoords);
      setLiveCoords(newCoords);

      // Reverse geocode new center after drag ends
      reverseGeocode(finalPos.lat, finalPos.lng).then((res) => {
        setLocationName(res.displayName);
      });
    });

  }, [selectedLocation, searchRadius]);

  // 7. Render Property Markers inside Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    const markersLayer = propertyMarkersLayerRef.current;
    if (!map || !L || !markersLayer) return;

    markersLayer.clearLayers();

    filteredProperties.forEach((prop) => {
      const lat = prop.latitude!;
      const lng = prop.longitude!;
      const isSelected = selectedProp?.propertyId === prop.propertyId;

      const priceLabel = prop.price && prop.price >= 10000000
        ? `₹${(prop.price / 10000000).toFixed(1)} Cr`
        : `₹${((prop.price || 10000000) / 100000).toFixed(0)} L`;

      const customIcon = L.divIcon({
        className: 'lokha-map-pin',
        html: `
          <div style="
            background-color: ${isSelected ? '#C6A15B' : '#18181B'};
            color: ${isSelected ? '#171717' : '#C6A15B'};
            border: 2px solid #C6A15B;
            padding: 4px 9px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
            box-shadow: 0 4px 14px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
            transition: all 0.2s ease;
          ">
            <span>●</span> ${priceLabel}
          </div>
        `,
        iconSize: [70, 26],
        iconAnchor: [35, 13]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(markersLayer);

      marker.on('click', () => {
        setSelectedProp(prop);
      });
    });
  }, [filteredProperties, selectedProp]);

  // Handle "Locate Me" Button
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Location access is unavailable. Move the search area manually.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords: [number, number] = [latitude, longitude];
        setUserLocation(coords);
        setSelectedLocation(coords);
        setLiveCoords(coords);
        setLocationError(null);

        // Move map camera to current location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(coords, 14, { duration: 1.2 });
        }

        reverseGeocode(latitude, longitude).then((res) => {
          setLocationName(res.displayName);
        });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setLocationError('Location access is unavailable. Move the search area manually.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Handle City Change (moves camera and circle to city center)
  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    const coords = cityCenters[cityName];
    if (coords && mapInstanceRef.current) {
      setSelectedLocation(coords);
      setLiveCoords(coords);
      mapInstanceRef.current.flyTo(coords, cityName === 'All' ? 12 : 14, { duration: 1.2 });
      reverseGeocode(coords[0], coords[1]).then((res) => {
        setLocationName(res.displayName);
      });
    }
  };

  const handleCardClick = (prop: PropertyDocument) => {
    setSelectedProp(prop);
    if (mapInstanceRef.current && prop.latitude && prop.longitude) {
      // Gentle pan to property without changing zoom
      mapInstanceRef.current.panTo([prop.latitude, prop.longitude], { animate: true });
    }
  };

  const formatPrice = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  // Distance from user to selected search circle
  const distanceFromUser = userLocation
    ? haversineDistanceMeters(userLocation[0], userLocation[1], liveCoords[0], liveCoords[1])
    : null;

  return (
    <div style={{
      position: 'relative',
      height: 'calc(100vh - 4.75rem)',
      display: 'flex',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes lokhaUserPulse {
          0% { transform: scale(0.9); opacity: 0.9; }
          70% { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes handlePulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }
      `}</style>

      {/* Left Sidebar: Filters & Property Cards inside Circle */}
      <div style={{
        width: 'min(440px, 100vw)',
        height: '100%',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* Top Filter Bar */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <button
              onClick={() => onNavigate('properties')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'none',
                border: 'none',
                color: 'var(--gold-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={14} /> Grid View
            </button>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--gold-primary)',
              backgroundColor: 'var(--gold-subtle)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-gold)'
            }}>
              {filteredProperties.length} inside {formatDistance(searchRadius)}
            </span>
          </div>

          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
            Discover by Location
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Drag the circle on the map to search nearby luxury estates
          </p>

          {/* Quick City Navigation */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
            {cities.map(c => (
              <button
                key={c}
                onClick={() => handleCitySelect(c)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  backgroundColor: selectedCity === c ? 'var(--gold-primary)' : 'var(--bg-card)',
                  color: selectedCity === c ? 'var(--gold-text)' : 'var(--text-secondary)',
                  border: `1px solid ${selectedCity === c ? 'var(--gold-primary)' : 'var(--border-subtle)'}`,
                  transition: 'all 0.2s ease'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Area Summary Header */}
        <div style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <MapPin size={16} color="var(--gold-primary)" style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {locationName}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                {liveCoords[0].toFixed(4)}° N, {liveCoords[1].toFixed(4)}° E
                {distanceFromUser !== null && ` • ${formatDistance(distanceFromUser)} from you`}
              </div>
            </div>
          </div>

          <div style={{
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}>
            Radius: <span style={{ color: 'var(--gold-primary)', fontWeight: 800 }}>{formatDistance(searchRadius)}</span>
          </div>
        </div>

        {/* Scrollable Listings Column */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gold-primary)' }}>
              Loading estates...
            </div>
          ) : filteredProperties.length === 0 ? (
            <div style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '16px',
              border: '1px dashed var(--border-subtle)'
            }}>
              <Move size={36} color="var(--gold-primary)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                No Estates Inside Selected Circle
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Drag the circle on the map or increase the search radius to uncover nearby properties.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setSearchRadius(prev => Math.min(prev * 2, 10000))}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--gold-primary)',
                    color: 'var(--gold-text)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Expand Search Radius
                </button>
              </div>
            </div>
          ) : (
            filteredProperties.map((prop) => {
              const isSelected = selectedProp?.propertyId === prop.propertyId;
              const img = prop.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80';

              return (
                <div
                  key={prop.propertyId}
                  onClick={() => handleCardClick(prop)}
                  style={{
                    backgroundColor: isSelected ? 'var(--gold-subtle)' : 'var(--bg-card)',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '0.85rem',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img
                    src={img}
                    alt={prop.title}
                    style={{ width: '90px', height: '82px', borderRadius: '8px', objectFit: 'cover' }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                        {formatPrice(prop.price || 12000000)}
                      </div>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: 'var(--text-tertiary)',
                        backgroundColor: 'var(--bg-secondary)',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        {formatDistance(prop.distanceMeters)} away
                      </span>
                    </div>

                    <div style={{
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: '0.15rem'
                    }}>
                      {prop.title}
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '0.2rem 0' }}>
                      {prop.location?.city} • {prop.specifications?.bedrooms || 3} BHK • {prop.specifications?.areaSqFt} sqft
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(`property-${prop.propertyId}`);
                        }}
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--gold-primary)',
                          color: 'var(--gold-text)',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Inspect Estate
                      </button>

                      <span style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', fontWeight: 600 }}>
                        Inside Area ✓
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Area: Leaflet Map Container & Floating Controls */}
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        {/* Non-intrusive Location Alert if Permission Denied */}
        {locationError && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            padding: '0.6rem 1rem',
            borderRadius: '12px',
            border: '1px solid var(--border-gold)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            maxWidth: '90%',
            fontSize: '0.8rem',
            backdropFilter: 'blur(12px)'
          }}>
            <AlertCircle size={16} color="var(--gold-primary)" />
            <span>{locationError}</span>
            <button
              onClick={() => setLocationError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Floating Top Map Controls Cluster: [ Locate Me ] & [ Radius Options ] */}
        <div style={{
          position: 'absolute',
          top: '1.25rem',
          left: '1.25rem',
          zIndex: 900,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.65rem',
          alignItems: 'center'
        }}>
          {/* "Locate Me" Button */}
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-gold)',
              boxShadow: 'var(--shadow-md)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: isLocating ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--gold-subtle)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-card)';
            }}
          >
            <Crosshair size={16} color="var(--gold-primary)" className={isLocating ? 'spin' : ''} />
            {isLocating ? 'Detecting...' : 'Locate Me'}
          </button>

          {/* Radius Selector Pills */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            padding: '0.25rem 0.35rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            gap: '0.25rem',
            backdropFilter: 'blur(12px)'
          }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '0.5rem',
              paddingRight: '0.25rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--text-tertiary)'
            }}>
              Radius:
            </span>
            {radiusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSearchRadius(opt.value)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: searchRadius === opt.value ? 'var(--gold-primary)' : 'transparent',
                  color: searchRadius === opt.value ? 'var(--gold-text)' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Dragging Indicator Badge */}
        {isDraggingCircle && (
          <div style={{
            position: 'absolute',
            top: '4.75rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999,
            backgroundColor: 'var(--gold-primary)',
            color: 'var(--gold-text)',
            padding: '0.4rem 1.1rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: 800,
            fontSize: '0.78rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            pointerEvents: 'none'
          }}>
            <Move size={14} /> Moving Search Circle (Map Camera Fixed)
          </div>
        )}

        {/* Floating Location Info Panel (Top-Right) */}
        <div style={{
          position: 'absolute',
          top: '1.25rem',
          right: '1.25rem',
          zIndex: 900,
          backgroundColor: 'var(--bg-glass)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-gold)',
          borderRadius: '16px',
          padding: '0.85rem 1.15rem',
          boxShadow: 'var(--shadow-lg)',
          maxWidth: '260px',
          fontSize: '0.78rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <Compass size={15} color="var(--gold-primary)" />
            <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
              Selected Search Area
            </span>
          </div>
          <div style={{ fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {locationName}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <div>Latitude: {liveCoords[0].toFixed(4)}° N</div>
            <div>Longitude: {liveCoords[1].toFixed(4)}° E</div>
            <div>Search Radius: {formatDistance(searchRadius)}</div>
            <div style={{ marginTop: '0.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Properties in Area: {filteredProperties.length}
            </div>
            {distanceFromUser !== null && (
              <div style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>
                {formatDistance(distanceFromUser)} from your location
              </div>
            )}
          </div>
        </div>

        {/* The Leaflet Map Element */}
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Selected Property Overlay Floating Pill on bottom */}
        {selectedProp && (
          <div style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 900,
            backgroundColor: 'var(--bg-glass)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-gold)',
            borderRadius: '16px',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: 'var(--shadow-lg)',
            maxWidth: '90%'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{selectedProp.location?.city}</div>
              <div style={{ fontWeight: 800, color: 'var(--gold-primary)', fontSize: '1.05rem' }}>
                {formatPrice(selectedProp.price || 12000000)}
              </div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '0.85rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedProp.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {selectedProp.specifications?.bedrooms || 3} BHK • {selectedProp.specifications?.areaSqFt} sqft
              </div>
            </div>

            <button
              onClick={() => onNavigate(`property-${selectedProp.propertyId}`)}
              style={{
                padding: '0.5rem 1.15rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--gold-primary)',
                color: 'var(--gold-text)',
                fontWeight: 800,
                fontSize: '0.8rem',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              Inspect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
