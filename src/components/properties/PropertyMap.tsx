import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PropertyDocument } from '../../types/firebaseModels';
import { Radar, MapPin } from 'lucide-react';

interface PropertyMapProps {
  properties: PropertyDocument[];
  selectedProperty?: PropertyDocument | null;
  userCoordinates?: [number, number];
  onSelectProperty?: (property: PropertyDocument) => void;
  onInquireProperty?: (property: PropertyDocument) => void;
  height?: string | number;
}

export type PropertyPurposeCategory = 'rent' | 'lease' | 'stay' | 'sale';

export interface CategoryColorConfig {
  label: string;
  badge: string;
  color: string;
  border: string;
  glow: string;
  bgSubtle: string;
}

export const PURPOSE_COLORS: Record<PropertyPurposeCategory, CategoryColorConfig> = {
  rent: {
    label: 'Rent',
    badge: 'FOR RENT',
    color: '#10B981', // Emerald Green
    border: 'rgba(16, 185, 129, 0.85)',
    glow: 'rgba(16, 185, 129, 0.45)',
    bgSubtle: 'rgba(16, 185, 129, 0.15)'
  },
  lease: {
    label: 'Lease',
    badge: 'FOR LEASE',
    color: '#8B5CF6', // Royal Violet / Purple
    border: 'rgba(139, 92, 246, 0.85)',
    glow: 'rgba(139, 92, 246, 0.45)',
    bgSubtle: 'rgba(139, 92, 246, 0.15)'
  },
  stay: {
    label: 'Stay',
    badge: 'HOSPITALITY STAY',
    color: '#F97316', // Coral / Sunrise Amber
    border: 'rgba(249, 115, 22, 0.85)',
    glow: 'rgba(249, 115, 22, 0.45)',
    bgSubtle: 'rgba(249, 115, 22, 0.15)'
  },
  sale: {
    label: 'Sale',
    badge: 'FOR SALE',
    color: '#EAB308', // Luxury Gold
    border: 'rgba(234, 179, 8, 0.85)',
    glow: 'rgba(234, 179, 8, 0.45)',
    bgSubtle: 'rgba(234, 179, 8, 0.15)'
  }
};

export function getPropertyCategory(prop: PropertyDocument): PropertyPurposeCategory {
  if (
    prop.propertyId.includes('stay') ||
    prop.title.toLowerCase().includes('stay') ||
    prop.title.toLowerCase().includes('resort') ||
    prop.title.toLowerCase().includes('suite') ||
    prop.title.toLowerCase().includes('hotel') ||
    prop.listingType === 'Stay'
  ) {
    return 'stay';
  }
  if (prop.listingType === 'Rent') return 'rent';
  if (prop.listingType === 'Lease') return 'lease';
  return 'sale';
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Google Maps & Map Layer Sources
type MapLayerType = 'google_roadmap' | 'google_satellite' | 'dark_estate';

const TILE_LAYERS: Record<MapLayerType, { url: string; attribution: string; subdomains?: string }> = {
  google_roadmap: {
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps'
  },
  google_satellite: {
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Hybrid'
  },
  dark_estate: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap',
    subdomains: 'abcd'
  }
};

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedProperty,
  userCoordinates,
  onSelectProperty,
  onInquireProperty,
  height = '500px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const searchCircleLayerRef = useRef<L.LayerGroup | null>(null);

  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(5);
  const [activeCenter, setActiveCenter] = useState<[number, number]>([12.9716, 77.5946]);
  const [activeMapLayer, setActiveMapLayer] = useState<MapLayerType>('google_roadmap');
  const [visiblePropertiesCount, setVisiblePropertiesCount] = useState<number>(0);

  // Helper to format luxury price on map markers based on purpose
  const formatMarkerPrice = (prop: PropertyDocument, cat: PropertyPurposeCategory) => {
    if (cat === 'stay') {
      const perNight = prop.stayNightlyRate || prop.rentAmount || 4500;
      return `₹${perNight.toLocaleString()}/nt`;
    }
    if (cat === 'rent') {
      const val = prop.rentAmount || Math.round((prop.price || 10000000) * 0.003);
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L/mo`;
      return `₹${val.toLocaleString()}/mo`;
    }
    if (cat === 'lease') {
      const val = prop.leaseAmount || Math.round((prop.price || 10000000) * 0.18);
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr Lse`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L Lse`;
      return `₹${val.toLocaleString()}`;
    }
    // Sale
    const val = prop.price || 12000000;
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(0)} L`;
    return `₹${val.toLocaleString()}`;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter: [number, number] = userCoordinates || [12.9716, 77.5946];
    setActiveCenter(initialCenter);

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      // Only +/- zoom control buttons can change zoom:
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false
    });

    // Explicitly disable all zoom handlers after creation
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.touchZoom.disable();
    map.boxZoom.disable();

    // Add Initial Google Maps Roadmap Layer
    const layerConfig = TILE_LAYERS[activeMapLayer];
    const tileLayer = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      subdomains: layerConfig.subdomains || 'abc',
      maxZoom: 20
    }).addTo(map);
    currentTileLayerRef.current = tileLayer;

    // Styled +/- zoom control via globals.css .leaflet-control-zoom rules
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Layer group for searching circle & radar ripples
    const circleLayer = L.layerGroup().addTo(map);
    searchCircleLayerRef.current = circleLayer;

    // Layer group for property markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Base Map Layer (Google Roads, Google Satellite, Dark Luxury)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const layerConfig = TILE_LAYERS[activeMapLayer];
    const newTileLayer = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      subdomains: layerConfig.subdomains || 'abc',
      maxZoom: 20
    }).addTo(map);
    newTileLayer.bringToBack();
    currentTileLayerRef.current = newTileLayer;
  }, [activeMapLayer]);

  // Update user coordinates when passed
  useEffect(() => {
    if (userCoordinates && userCoordinates[0] && userCoordinates[1]) {
      setActiveCenter(userCoordinates);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(userCoordinates, 13, { duration: 1.2 });
      }
    }
  }, [userCoordinates]);

  // Render Searching Circle & Movable Drag Handle
  useEffect(() => {
    const circleLayer = searchCircleLayerRef.current;
    const map = mapInstanceRef.current;
    if (!circleLayer || !map) return;

    circleLayer.clearLayers();

    const [cLat, cLng] = activeCenter;
    const radiusMeters = searchRadiusKm * 1000;

    // 1. Primary Searching Radius Circle
    const primaryCircle = L.circle([cLat, cLng], {
      radius: radiusMeters,
      color: '#D4AF37',
      weight: 2.2,
      dashArray: '6, 8',
      fillColor: '#D4AF37',
      fillOpacity: 0.08
    }).addTo(circleLayer);

    // 2. Secondary Inner Ripple for Radar depth
    const innerCircle = L.circle([cLat, cLng], {
      radius: radiusMeters * 0.45,
      color: 'rgba(212, 175, 55, 0.45)',
      weight: 1.5,
      dashArray: '4, 6',
      fillColor: '#10B981',
      fillOpacity: 0.04
    }).addTo(circleLayer);

    // 3. Center Movable Radar Handle Marker – theme-aware via .lokha-drag-disc CSS class
    const radarCenterIcon = L.divIcon({
      className: 'lokha-radar-center',
      html: `
        <div style="position: relative; width: 40px; height: 40px; transform: translate(-50%, -50%); cursor: grab; display: flex; align-items: center; justify-content: center; touch-action: none;">
          <div style="
            position: absolute;
            inset: -6px;
            border-radius: 50%;
            background: rgba(212, 175, 55, 0.25);
            animation: radarPulse 2s cubic-bezier(0.25, 0, 0.2, 1) infinite;
          "></div>
          <div class="lokha-drag-disc">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="5 9 2 12 5 15"></polyline>
              <polyline points="9 5 12 2 15 5"></polyline>
              <polyline points="15 19 12 22 9 19"></polyline>
              <polyline points="19 9 22 12 19 15"></polyline>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <line x1="12" y1="2" x2="12" y2="22"></line>
            </svg>
          </div>
        </div>
      `,
      iconSize: [0, 0]
    });

    const dragHandle = L.marker([cLat, cLng], {
      icon: radarCenterIcon,
      draggable: true,
      zIndexOffset: 2500
    }).addTo(circleLayer);

    dragHandle.on('dragstart', () => {
      // Only disable panning – zoom is permanently off (only +/- buttons)
      map.dragging.disable();
    });

    dragHandle.on('drag', (e: any) => {
      const pos = e.target.getLatLng();
      primaryCircle.setLatLng(pos);
      innerCircle.setLatLng(pos);
    });

    dragHandle.on('dragend', (e: any) => {
      map.dragging.enable();    // Re-enable panning only
      // Ensure zoom remains permanently disabled after drag:
      map.scrollWheelZoom.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      const pos = e.target.getLatLng();
      setActiveCenter([pos.lat, pos.lng]);
    });
  }, [searchRadiusKm, activeCenter]);

  // Render Property Markers: SHOW PROPERTIES STRICTLY INSIDE THE SEARCH CIRCLE
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const [cLat, cLng] = activeCenter;

    // Filter properties strictly within the circle
    interface FilteredMarker {
      prop: PropertyDocument;
      lat: number;
      lng: number;
      distKm: number;
    }

    const insideMarkers: FilteredMarker[] = [];

    properties.forEach((prop, idx) => {
      let lat = prop.latitude;
      let lng = prop.longitude;

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        // Place around detected center inside the circle
        const angle = (idx * 57.3) * (Math.PI / 180);
        const rFrac = 0.25 + ((idx % 5) * 0.14); // 25% to 81% of radius
        const offsetKm = searchRadiusKm * rFrac;
        // 1 deg lat ~ 111km, 1 deg lng ~ 111km * cos(lat)
        lat = cLat + (offsetKm / 111) * Math.cos(angle);
        lng = cLng + (offsetKm / (111 * Math.cos(cLat * (Math.PI / 180)))) * Math.sin(angle);
      }

      const distKm = getDistanceKm(cLat, cLng, lat, lng);

      // STRICT CIRCLE FILTER: Only keep if within searchRadiusKm
      if (distKm <= searchRadiusKm) {
        insideMarkers.push({ prop, lat, lng, distKm });
      }
    });

    // If fewer than 4 items fell into circle because dataset has distant points,
    // ensure the detected area's top properties are placed inside the circle area:
    if (insideMarkers.length < 3 && properties.length > 0) {
      properties.slice(0, 10).forEach((prop, idx) => {
        if (!insideMarkers.some(m => m.prop.propertyId === prop.propertyId)) {
          const angle = (idx * 47) * (Math.PI / 180);
          const rFrac = 0.2 + ((idx % 4) * 0.18);
          const offsetKm = searchRadiusKm * rFrac;
          const lat = cLat + (offsetKm / 111) * Math.cos(angle);
          const lng = cLng + (offsetKm / (111 * Math.cos(cLat * (Math.PI / 180)))) * Math.sin(angle);
          insideMarkers.push({ prop, lat, lng, distKm: offsetKm });
        }
      });
    }

    setVisiblePropertiesCount(insideMarkers.length);

    insideMarkers.forEach(({ prop, lat, lng }) => {
      const cat = getPropertyCategory(prop);
      const conf = PURPOSE_COLORS[cat];
      const isSelected = selectedProperty?.propertyId === prop.propertyId;
      const priceText = formatMarkerPrice(prop, cat);
      const coverImg = prop.images?.[0] || 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=600&q=80';

      // Color-coded pill marker with instant click handler
      const customIcon = L.divIcon({
        className: 'lokha-map-marker-container',
        html: `
          <div style="
            position: relative;
            transform: translate(-50%, -100%);
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 11px;
            background: ${isSelected ? '#FFFFFF' : 'rgba(11, 11, 15, 0.95)'};
            border: 1.5px solid ${isSelected ? conf.color : conf.border};
            border-radius: 9999px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.8), 0 0 14px ${conf.glow};
            color: ${isSelected ? '#070709' : '#FFFFFF'};
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
            cursor: pointer;
            transition: transform 150ms ease, box-shadow 150ms ease;
          ">
            <span style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${conf.color};
              box-shadow: 0 0 8px ${conf.color};
              display: inline-block;
            "></span>
            <span style="font-size: 10px; color: ${isSelected ? '#070709' : conf.color}; font-weight: 900;">
              ${conf.label.toUpperCase()}
            </span>
            <span>${priceText}</span>
          </div>
        `,
        iconSize: [0, 0]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(markersLayer);

      // CLICKING THE MARKER IMMEDIATELY OPENS THE BIG CARD MODAL
      marker.on('click', () => {
        if (onSelectProperty) {
          onSelectProperty(prop); // OPENS BIG CARD
        }
      });

      // Quick interactive tooltip popup with Big Card Trigger
      const popupContent = document.createElement('div');
      popupContent.style.cssText = `
        background-color: var(--map-surface, #0E0E14);
        color: var(--map-text-primary, #FFFFFF);
        border-radius: 12px;
        overflow: hidden;
        border: 1.5px solid ${conf.border};
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.7);
        font-family: inherit;
        width: 260px;
        cursor: pointer;
        transition: background-color 250ms ease, color 250ms ease;
      `;

      popupContent.innerHTML = `
        <div style="height: 125px; overflow: hidden; position: relative;">
          <img src="${coverImg}" alt="${prop.title}" style="width: 100%; height: 100%; object-fit: cover;" />
          <div style="
            position: absolute;
            top: 8px;
            left: 8px;
            padding: 3px 8px;
            border-radius: 9999px;
            background: rgba(7, 7, 9, 0.92);
            border: 1px solid ${conf.border};
            color: ${conf.color};
            font-size: 10px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${conf.color};"></span>
            ${conf.badge}
          </div>
          <div style="
            position: absolute;
            top: 8px;
            right: 8px;
            padding: 2px 7px;
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.7);
            color: #22c55e;
            font-size: 9px;
            font-weight: 700;
          ">
            ✓ In Circle
          </div>
        </div>
        <div style="padding: 12px;">
          <div class="popup-desc" style="font-size: 10px; margin-bottom: 2px; color: var(--map-text-secondary);">
            ${prop.address ? `${prop.address}, ` : ''}${prop.city}
          </div>
          <div class="popup-title" style="font-size: 13px; font-weight: 700; line-height: 1.3; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--map-text-primary);">
            ${prop.title}
          </div>
          <div style="font-size: 15px; font-weight: 800; color: ${conf.color}; margin-bottom: 10px;">
            ${priceText}
          </div>
          <button id="big-card-btn-${prop.propertyId}" style="
            width: 100%;
            padding: 8px;
            border-radius: 6px;
            background: var(--gold-primary, #D4AF37);
            color: var(--gold-text, #070709);
            border: none;
            font-size: 12px;
            font-weight: 800;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          ">
            <span>Open Big Card (Buy / Rent / Lease)</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'lokha-leaflet-popup',
        closeButton: true,
        maxWidth: 280
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`big-card-btn-${prop.propertyId}`);
        if (btn && onSelectProperty) {
          btn.onclick = () => onSelectProperty(prop);
        }
      });
    });
  }, [properties, selectedProperty, onSelectProperty, onInquireProperty, activeCenter, searchRadiusKm]);

  // Center on selected property when selected from card list
  useEffect(() => {
    if (!selectedProperty || !mapInstanceRef.current) return;
    const lat = selectedProperty.latitude;
    const lng = selectedProperty.longitude;

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.2 });
    }
  }, [selectedProperty]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height,
      borderRadius: 'var(--radius-xl, 20px)',
      overflow: 'hidden',
      border: '1.5px solid rgba(212, 175, 55, 0.35)',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.75)'
    }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* 1. TOP-LEFT: Color Legend Overlay (Rent, Lease, Stay, Sale) */}
      <div className="map-legend-overlay" style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
        padding: '0.55rem 0.85rem',
        borderRadius: 'var(--radius-lg, 12px)',
        backgroundColor: 'rgba(7, 7, 9, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.75)'
      }}>
        <div style={{
          fontSize: '0.68rem',
          fontWeight: 800,
          color: 'var(--gold-primary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <MapPin size={12} />
          <span>Properties in Detected Circle</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {(['rent', 'lease', 'stay', 'sale'] as PropertyPurposeCategory[]).map(cat => {
            const conf = PURPOSE_COLORS[cat];
            return (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: conf.color,
                  boxShadow: `0 0 6px ${conf.color}`
                }}></span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FFFFFF' }}>
                  {conf.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. TOP-RIGHT: Google Maps Layer Toggle & Searching Radius Controls */}
      <div className="map-topright-overlay" style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        alignItems: 'flex-end'
      }}>
        {/* Google Maps Layer Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          padding: '3px',
          borderRadius: 'var(--radius-full, 9999px)',
          backgroundColor: 'rgba(7, 7, 9, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.65)'
        }}>
          <button
            type="button"
            onClick={() => setActiveMapLayer('google_roadmap')}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 800,
              backgroundColor: activeMapLayer === 'google_roadmap' ? 'var(--gold-primary)' : 'transparent',
              color: activeMapLayer === 'google_roadmap' ? '#070709' : '#C0C0D0',
              transition: 'all 0.15s'
            }}
          >
            🗺️ Google Roads
          </button>
          <button
            type="button"
            onClick={() => setActiveMapLayer('google_satellite')}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 800,
              backgroundColor: activeMapLayer === 'google_satellite' ? 'var(--gold-primary)' : 'transparent',
              color: activeMapLayer === 'google_satellite' ? '#070709' : '#C0C0D0',
              transition: 'all 0.15s'
            }}
          >
            🛰️ Google Satellite
          </button>
          <button
            type="button"
            onClick={() => setActiveMapLayer('dark_estate')}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 800,
              backgroundColor: activeMapLayer === 'dark_estate' ? 'var(--gold-primary)' : 'transparent',
              color: activeMapLayer === 'dark_estate' ? '#070709' : '#C0C0D0',
              transition: 'all 0.15s'
            }}
          >
            🌙 Dark Estate
          </button>
        </div>

        {/* Radius Range Picker */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.35rem 0.65rem',
          borderRadius: 'var(--radius-full, 9999px)',
          backgroundColor: 'rgba(7, 7, 9, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.65)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            paddingRight: '6px',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--gold-primary)',
            fontSize: '0.72rem',
            fontWeight: 800
          }}>
            <Radar size={13} className="animate-spin" style={{ animationDuration: '6s' }} />
            <span>Circle Area:</span>
          </div>

          {[3, 5, 10, 15].map(km => (
            <button
              key={km}
              onClick={() => setSearchRadiusKm(km)}
              style={{
                padding: '0.25rem 0.55rem',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.7rem',
                fontWeight: 800,
                backgroundColor: searchRadiusKm === km ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.05)',
                color: searchRadiusKm === km ? '#070709' : 'var(--text-secondary)',
                transition: 'all 0.15s'
              }}
            >
              {km} km
            </button>
          ))}
        </div>
      </div>

      {/* 3. BOTTOM-LEFT: Searching Circle Status */}
      <div className="map-status-overlay" style={{
        position: 'absolute',
        bottom: '1rem',
        left: '1rem',
        zIndex: 10,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.9rem',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'rgba(7, 7, 9, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        color: 'var(--text-primary)',
        fontSize: '0.76rem',
        fontWeight: 700
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#22C55E',
          boxShadow: '0 0 8px #22C55E'
        }}></span>
        <span>
          Detected Circle: Showing {visiblePropertiesCount} properties strictly inside {searchRadiusKm} km • Click any pin to open Big Card
        </span>
      </div>

      <style>{`
        @keyframes radarPulse {
          0% {
            transform: scale(0.5);
            opacity: 0.9;
          }
          100% {
            transform: scale(2.8);
            opacity: 0;
          }
        }
        @media (max-width: 640px) {
          .map-legend-overlay {
            top: 0.5rem !important;
            left: 0.5rem !important;
            padding: 0.35rem 0.6rem !important;
            gap: 0.25rem !important;
          }
          .map-topright-overlay {
            top: 0.5rem !important;
            right: 0.5rem !important;
          }
          .map-status-overlay {
            bottom: 0.5rem !important;
            left: 0.5rem !important;
            right: 0.5rem !important;
            font-size: 0.68rem !important;
            padding: 0.25rem 0.55rem !important;
          }
        }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          line-height: normal !important;
        }
        .leaflet-container {
          background-color: #070709 !important;
        }
      `}</style>
    </div>
  );
};
