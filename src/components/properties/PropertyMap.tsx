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
    prop.title.toLowerCase().includes('hotel')
  ) {
    return 'stay';
  }
  if (prop.listingType === 'Rent') return 'rent';
  if (prop.listingType === 'Lease') return 'lease';
  return 'sale';
}

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
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const searchCircleLayerRef = useRef<L.LayerGroup | null>(null);

  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(5);
  const [activeCenter, setActiveCenter] = useState<[number, number]>([12.9716, 77.5946]);

  // Helper to format luxury price on map markers based on purpose
  const formatMarkerPrice = (prop: PropertyDocument, cat: PropertyPurposeCategory) => {
    if (cat === 'stay') {
      const perNight = prop.rentAmount || 8500;
      return `₹${perNight.toLocaleString()}/nt`;
    }
    if (cat === 'rent') {
      const val = prop.rentAmount || prop.price;
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L/mo`;
      return `₹${val.toLocaleString()}/mo`;
    }
    if (cat === 'lease') {
      const val = prop.leaseAmount || prop.price;
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr Lse`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L Lse`;
      return `₹${val.toLocaleString()}`;
    }
    // Sale
    const val = prop.price;
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(0)} L`;
    return `₹${val.toLocaleString()}`;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initial center default
    const initialCenter: [number, number] = userCoordinates || [12.9716, 77.5946];
    setActiveCenter(initialCenter);

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 12,
      zoomControl: false
    });

    // CartoDB Dark Matter Luxury Basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO &copy; OpenStreetMap',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

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

  // Update user coordinates when passed
  useEffect(() => {
    if (userCoordinates && userCoordinates[0] && userCoordinates[1]) {
      setActiveCenter(userCoordinates);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(userCoordinates, 13, { duration: 1 });
      }
    }
  }, [userCoordinates]);

  // Update Searching Circle & Radar Pulse when radius or center changes
  useEffect(() => {
    const circleLayer = searchCircleLayerRef.current;
    if (!circleLayer) return;

    circleLayer.clearLayers();

    const [cLat, cLng] = activeCenter;
    const radiusMeters = searchRadiusKm * 1000;

    // 1. Outer Searching Radius Circle with luxury dashed gold stroke
    L.circle([cLat, cLng], {
      radius: radiusMeters,
      color: 'var(--gold-primary, #D4AF37)',
      weight: 2,
      dashArray: '6, 8',
      fillColor: '#D4AF37',
      fillOpacity: 0.07
    }).addTo(circleLayer);

    // 2. Secondary Inner Ripple for Radar depth
    L.circle([cLat, cLng], {
      radius: radiusMeters * 0.5,
      color: 'rgba(212, 175, 55, 0.4)',
      weight: 1,
      dashArray: '4, 6',
      fillColor: '#10B981',
      fillOpacity: 0.03
    }).addTo(circleLayer);

    // 3. Center Radar Ping Marker with Animated CSS Ripple
    const radarCenterIcon = L.divIcon({
      className: 'lokha-radar-center',
      html: `
        <div style="position: relative; width: 24px; height: 24px; transform: translate(-50%, -50%);">
          <div style="
            position: absolute;
            inset: -8px;
            border-radius: 50%;
            background: rgba(212, 175, 55, 0.25);
            animation: radarPulse 2s cubic-bezier(0.25, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: #D4AF37;
            border: 2px solid #FFFFFF;
            box-shadow: 0 0 14px rgba(212, 175, 55, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: #070709;"></div>
          </div>
        </div>
      `,
      iconSize: [0, 0]
    });

    L.marker([cLat, cLng], { icon: radarCenterIcon }).addTo(circleLayer);
  }, [searchRadiusKm, activeCenter]);

  // Update Markers with Distinct Colors for Rent, Lease, Stay, and Sale
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const validCoordinates: L.LatLngExpression[] = [];

    properties.forEach((prop, idx) => {
      let lat = prop.latitude;
      let lng = prop.longitude;

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        if (prop.city?.toLowerCase().includes('chennai')) { lat = 13.0827; lng = 80.2707; }
        else if (prop.city?.toLowerCase().includes('bangalore') || prop.city?.toLowerCase().includes('bengaluru')) { lat = 12.9716; lng = 77.5946; }
        else if (prop.city?.toLowerCase().includes('mumbai')) { lat = 19.0760; lng = 72.8777; }
        else if (prop.city?.toLowerCase().includes('delhi') || prop.city?.toLowerCase().includes('gurugram')) { lat = 28.4595; lng = 77.0266; }
        else if (prop.city?.toLowerCase().includes('hyderabad')) { lat = 17.3850; lng = 78.4867; }
        else if (prop.city?.toLowerCase().includes('goa')) { lat = 15.2993; lng = 74.1240; }
        else { lat = 12.9716; lng = 77.5946; }

        lat += ((idx * 7) % 20 - 10) * 0.0035;
        lng += ((idx * 11) % 20 - 10) * 0.0035;
      }

      validCoordinates.push([lat, lng]);

      const cat = getPropertyCategory(prop);
      const conf = PURPOSE_COLORS[cat];
      const isSelected = selectedProperty?.propertyId === prop.propertyId;
      const priceText = formatMarkerPrice(prop, cat);
      const coverImg = prop.images?.[0] || 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=600&q=80';

      // Custom Color-Coded Price Pill Marker
      const customIcon = L.divIcon({
        className: 'lokha-map-marker-container',
        html: `
          <div style="
            position: relative;
            transform: translate(-50%, -100%);
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 9px;
            background: ${isSelected ? '#FFFFFF' : '#0B0B0F'};
            border: 1.5px solid ${isSelected ? conf.color : conf.border};
            border-radius: 9999px;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.75), 0 0 12px ${conf.glow};
            color: ${isSelected ? '#070709' : '#FFFFFF'};
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            cursor: pointer;
            transition: transform 150ms ease, box-shadow 150ms ease;
          ">
            <span style="
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background: ${conf.color};
              box-shadow: 0 0 6px ${conf.color};
              display: inline-block;
            "></span>
            <span style="font-size: 10px; opacity: 0.9; color: ${isSelected ? '#070709' : conf.color}; font-weight: 800;">
              ${conf.label.toUpperCase()}
            </span>
            <span>${priceText}</span>
          </div>
        `,
        iconSize: [0, 0]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(markersLayer);

      // Color-Coded Interactive Popup
      const popupContent = document.createElement('div');
      popupContent.style.cssText = `
        background-color: #0E0E14;
        color: #FFFFFF;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid ${conf.border};
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.85);
        font-family: inherit;
        width: 250px;
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
            background: rgba(7, 7, 9, 0.88);
            border: 1px solid ${conf.border};
            color: ${conf.color};
            font-size: 10px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span style="width: 5px; height: 5px; border-radius: 50%; background: ${conf.color};"></span>
            ${conf.badge}
          </div>
        </div>
        <div style="padding: 12px;">
          <div style="font-size: 10px; color: #A0A0AD; margin-bottom: 2px;">
            ${prop.address ? `${prop.address}, ` : ''}${prop.city}
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #FFFFFF; line-height: 1.3; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${prop.title}
          </div>
          <div style="font-size: 15px; font-weight: 800; color: ${conf.color}; margin-bottom: 10px;">
            ${priceText}
          </div>
          <div style="display: flex; gap: 6px;">
            <button id="view-btn-${prop.propertyId}" style="
              flex: 1;
              padding: 7px;
              border-radius: 6px;
              background: #181822;
              color: #FFFFFF;
              border: 1px solid rgba(255,255,255,0.1);
              font-size: 11px;
              font-weight: 600;
              cursor: pointer;
            ">
              Inspect
            </button>
            <button id="inquire-btn-${prop.propertyId}" style="
              flex: 1;
              padding: 7px;
              border-radius: 6px;
              background: ${conf.color};
              color: #070709;
              border: none;
              font-size: 11px;
              font-weight: 800;
              cursor: pointer;
            ">
              Inquire
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'lokha-leaflet-popup',
        closeButton: true,
        maxWidth: 270
      });

      marker.on('click', () => {
        if (onSelectProperty) {
          onSelectProperty(prop);
        }
      });

      marker.on('popupopen', () => {
        const viewBtn = document.getElementById(`view-btn-${prop.propertyId}`);
        const inquireBtn = document.getElementById(`inquire-btn-${prop.propertyId}`);

        if (viewBtn && onSelectProperty) {
          viewBtn.onclick = () => onSelectProperty(prop);
        }
        if (inquireBtn && onInquireProperty) {
          inquireBtn.onclick = () => onInquireProperty(prop);
        }
      });
    });

    // Auto-fit bounds if we have valid coordinates and not centered on single selected
    if (validCoordinates.length > 0 && !selectedProperty) {
      const bounds = L.latLngBounds(validCoordinates);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });

      // Update center of search circle to match center of loaded properties if no explicit userCoordinates
      if (!userCoordinates) {
        const center = bounds.getCenter();
        setActiveCenter([center.lat, center.lng]);
      }
    }
  }, [properties, selectedProperty, onSelectProperty, onInquireProperty, userCoordinates]);

  // Center on selected property when selected from card list
  useEffect(() => {
    if (!selectedProperty || !mapInstanceRef.current) return;
    let lat = selectedProperty.latitude;
    let lng = selectedProperty.longitude;

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
      border: '1px solid rgba(212, 175, 55, 0.25)',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.75)'
    }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* 1. TOP-LEFT: Color Legend Overlay (Rent, Lease, Stay, Sale) */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
        padding: '0.5rem 0.85rem',
        borderRadius: 'var(--radius-lg, 12px)',
        backgroundColor: 'rgba(7, 7, 9, 0.90)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212, 175, 55, 0.28)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.65)'
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
          <span>Category Map Pins</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
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

      {/* 2. TOP-RIGHT: Searching Circle Radius Radar Controls */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.35rem 0.65rem',
        borderRadius: 'var(--radius-full, 9999px)',
        backgroundColor: 'rgba(7, 7, 9, 0.90)',
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
          <Radar size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
          <span>Radius:</span>
        </div>

        {[2, 5, 10, 20].map(km => (
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

      {/* 3. BOTTOM-LEFT: Searching Circle Status */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '1rem',
        zIndex: 10,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.35rem 0.8rem',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'rgba(7, 7, 9, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        color: 'var(--text-primary)',
        fontSize: '0.75rem',
        fontWeight: 600
      }}>
        <span style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: '#22C55E',
          boxShadow: '0 0 8px #22C55E'
        }}></span>
        <span>
          Radar Active: Searching {properties.length} estates within {searchRadiusKm} km circle
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
