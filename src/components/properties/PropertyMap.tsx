import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PropertyDocument } from '../../types/firebaseModels';

interface PropertyMapProps {
  properties: PropertyDocument[];
  selectedProperty?: PropertyDocument | null;
  onSelectProperty?: (property: PropertyDocument) => void;
  onInquireProperty?: (property: PropertyDocument) => void;
  height?: string | number;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  onInquireProperty,
  height = '500px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Helper to format luxury price on map markers
  const formatMarkerPrice = (prop: PropertyDocument) => {
    const isRent = prop.listingType === 'Rent';
    const val = isRent ? (prop.rentAmount || prop.price) : prop.price;
    if (isRent) return `₹ ${(val / 100000).toFixed(1)}L/mo`;
    if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹ ${(val / 100000).toFixed(0)} L`;
    return `₹ ${val.toLocaleString()}`;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center (India/Global overview)
    const map = L.map(mapContainerRef.current, {
      center: [19.0760, 72.8777], // Mumbai coordinates default
      zoom: 11,
      zoomControl: false
    });

    // CartoDB Dark Matter Luxury Basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Layer group for property markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers in Real Time when properties list changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const validCoordinates: L.LatLngExpression[] = [];

    properties.forEach((prop) => {
      // Fallback coordinate generation if property doesn't have exact lat/lng
      let lat = prop.latitude;
      let lng = prop.longitude;

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        // City coordinate heuristics
        if (prop.city?.toLowerCase().includes('chennai')) { lat = 13.0827; lng = 80.2707; }
        else if (prop.city?.toLowerCase().includes('bangalore') || prop.city?.toLowerCase().includes('bengaluru')) { lat = 12.9716; lng = 77.5946; }
        else if (prop.city?.toLowerCase().includes('delhi')) { lat = 28.6139; lng = 77.2090; }
        else if (prop.city?.toLowerCase().includes('hyderabad')) { lat = 17.3850; lng = 78.4867; }
        else if (prop.city?.toLowerCase().includes('goa')) { lat = 15.2993; lng = 74.1240; }
        else { lat = 19.0760; lng = 72.8777; }

        // Add subtle jitter so multiple properties in same city don't completely overlap
        const hash = prop.propertyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        lat += ((hash % 100) - 50) * 0.0012;
        lng += (((hash * 7) % 100) - 50) * 0.0012;
      }

      validCoordinates.push([lat, lng]);

      const isSelected = selectedProperty?.propertyId === prop.propertyId;
      const priceText = formatMarkerPrice(prop);
      const coverImg = prop.images?.[0] || 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=600&q=80';

      // Custom Golden Price Pill Marker
      const customIcon = L.divIcon({
        className: 'lokha-map-marker-container',
        html: `
          <div style="
            position: relative;
            transform: translate(-50%, -100%);
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            background: ${isSelected ? 'var(--gold-gradient, #D4AF37)' : '#0F0F14'};
            border: 1.5px solid ${isSelected ? '#FFFFFF' : 'rgba(212, 175, 55, 0.65)'};
            border-radius: 9999px;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.7), 0 0 10px rgba(212, 175, 55, ${isSelected ? '0.6' : '0.2'});
            color: ${isSelected ? '#070709' : '#FFFFFF'};
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            cursor: pointer;
            transition: transform 150ms ease;
          ">
            <span style="
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: ${isSelected ? '#070709' : 'var(--gold-primary, #D4AF37)'};
              display: inline-block;
            "></span>
            <span>${priceText}</span>
          </div>
        `,
        iconSize: [0, 0]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(markersLayer);

      // Interactive Popup
      const popupContent = document.createElement('div');
      popupContent.style.cssText = `
        background-color: #0E0E14;
        color: #FFFFFF;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid rgba(212, 175, 55, 0.35);
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.85);
        font-family: inherit;
        width: 240px;
      `;

      popupContent.innerHTML = `
        <div style="height: 120px; overflow: hidden; position: relative;">
          <img src="${coverImg}" alt="${prop.title}" style="width: 100%; height: 100%; object-fit: cover;" />
          <div style="position: absolute; top: 8px; left: 8px; padding: 2px 8px; border-radius: 9999px; background: rgba(0,0,0,0.75); color: #D4AF37; font-size: 10px; font-weight: 700;">
            ${prop.propertyType} • ${prop.listingType}
          </div>
        </div>
        <div style="padding: 12px;">
          <div style="font-size: 10px; color: #A0A0AD; margin-bottom: 2px;">${prop.address ? `${prop.address}, ` : ''}${prop.city}</div>
          <div style="font-size: 13px; font-weight: 700; color: #FFFFFF; line-height: 1.3; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${prop.title}
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #D4AF37; margin-bottom: 10px;">
            ${priceText}
          </div>
          <div style="display: flex; gap: 6px;">
            <button id="view-btn-${prop.propertyId}" style="
              flex: 1;
              padding: 6px;
              border-radius: 6px;
              background: #1C1C26;
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
              padding: 6px;
              border-radius: 6px;
              background: #D4AF37;
              color: #070709;
              border: none;
              font-size: 11px;
              font-weight: 700;
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
        maxWidth: 260
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

    // Auto-fit bounds to visible pins if we have at least 1 property
    if (validCoordinates.length > 0) {
      const bounds = L.latLngBounds(validCoordinates);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [properties, selectedProperty, onSelectProperty, onInquireProperty]);

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
      border: '1px solid rgba(212, 175, 55, 0.22)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.65)'
    }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* Floating Status Badge */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 10,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.4rem 0.85rem',
        borderRadius: 'var(--radius-full, 9999px)',
        backgroundColor: 'rgba(7, 7, 9, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        color: '#FFFFFF',
        fontSize: '0.75rem',
        fontWeight: 600,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)'
      }}>
        <span style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: '#22C55E',
          boxShadow: '0 0 8px #22C55E',
          display: 'inline-block'
        }}></span>
        <span>{properties.length} Estates Live on Map</span>
      </div>

      <style>{`
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
