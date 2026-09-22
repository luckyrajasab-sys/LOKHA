import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft
} from 'lucide-react';
import type { PropertyDocument } from '../types/firebaseModels';
import { getProperties } from '../services/propertyService';

interface MapSearchPageProps {
  onNavigate: (view: string, location?: string) => void;
}

export const MapSearchPage: React.FC<MapSearchPageProps> = ({ onNavigate }) => {
  const [properties, setProperties] = useState<PropertyDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedProp, setSelectedProp] = useState<PropertyDocument | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const cities = ['All', 'Chennai', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'Goa'];

  // City center coordinates
  const cityCenters: Record<string, [number, number]> = {
    Chennai: [13.0827, 80.2707],
    Bengaluru: [12.9716, 77.5946],
    Mumbai: [19.0760, 72.8777],
    Hyderabad: [17.3850, 78.4867],
    Pune: [18.5204, 73.8567],
    Goa: [15.4989, 73.8278],
    All: [13.0827, 80.2707]
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const list = await getProperties({
        city: selectedCity === 'All' ? undefined : selectedCity
      });
      setProperties(list);
      if (list.length > 0) {
        setSelectedProp(list[0]);
      }
      setLoading(false);
    }
    loadData();
  }, [selectedCity]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isSubscribed = true;

    async function initMap() {
      const L = (await import('leaflet')).default;

      if (!isSubscribed) return;

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const center = cityCenters[selectedCity] || [13.0827, 80.2707];
        const map = L.map(mapContainerRef.current, {
          center: center,
          zoom: 12,
          zoomControl: false
        });

        // Add premium dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Update center if city changed
      const newCenter = cityCenters[selectedCity];
      if (newCenter) {
        map.setView(newCenter, selectedCity === 'All' ? 6 : 12);
      }

      // Clear existing markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Add markers for properties
      properties.forEach(prop => {
        const lat = prop.latitude || 13.0827;
        const lng = prop.longitude || 80.2707;

        const priceLabel = prop.price && prop.price >= 10000000
          ? `₹${(prop.price / 10000000).toFixed(1)} Cr`
          : `₹${((prop.price || 10000000) / 100000).toFixed(0)} L`;

        // Custom HTML pin with luxury gold styling
        const customIcon = L.divIcon({
          className: 'lokha-map-pin',
          html: `<div style="
            background-color: #070709;
            color: #D4AF37;
            border: 2px solid #D4AF37;
            padding: 3px 8px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            gap: 3px;
          ">
            <span>●</span> ${priceLabel}
          </div>`,
          iconSize: [60, 24],
          iconAnchor: [30, 12]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
          setSelectedProp(prop);
          map.panTo([lat, lng]);
        });

        markersRef.current.push(marker);
      });
    }

    initMap();

    return () => {
      isSubscribed = false;
    };
  }, [properties, selectedCity]);

  const handleCardClick = (prop: PropertyDocument) => {
    setSelectedProp(prop);
    if (mapInstanceRef.current && prop.latitude && prop.longitude) {
      mapInstanceRef.current.setView([prop.latitude, prop.longitude], 14, { animate: true });
    }
  };

  const formatPrice = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  return (
    <div style={{
      position: 'relative',
      height: 'calc(100vh - 4.75rem)',
      display: 'flex',
      backgroundColor: '#070709',
      color: '#FFFFFF',
      overflow: 'hidden'
    }}>
      {/* Left Sidebar: Filters & Property Cards */}
      <div style={{
        width: 'min(440px, 100vw)',
        height: '100%',
        backgroundColor: '#0D0D14',
        borderRight: '1px solid rgba(212, 175, 55, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        boxShadow: '8px 0 24px rgba(0,0,0,0.5)'
      }}>
        {/* Top Filter Bar */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              {properties.length} Estates Found
            </span>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.75rem' }}>
            Explore Estates on Map
          </h2>

          {/* City Chips */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {cities.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCity(c)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  backgroundColor: selectedCity === c ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedCity === c ? '#070709' : 'var(--text-secondary)',
                  border: `1px solid ${selectedCity === c ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.1)'}`
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Listings Column */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gold-primary)' }}>
              Loading map pins...
            </div>
          ) : (
            properties.map(prop => {
              const isSelected = selectedProp?.propertyId === prop.propertyId;
              const img = prop.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80';

              return (
                <div
                  key={prop.propertyId}
                  onClick={() => handleCardClick(prop)}
                  style={{
                    backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.08)' : '#14141E',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid var(--gold-primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '0.85rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <img
                    src={img}
                    alt={prop.title}
                    style={{ width: '90px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                      {formatPrice(prop.price || 12000000)}
                    </div>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: '#FFFFFF',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {prop.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0' }}>
                      {prop.location?.city} • {prop.specifications?.bedrooms || 3} BHK • {prop.specifications?.areaSqFt} sqft
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(`property-${prop.propertyId}`);
                      }}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--gold-primary)',
                        color: '#070709',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        marginTop: '0.2rem'
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Area: Leaflet Map Container */}
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Selected Property Overlay Floating Pill on bottom for mobile */}
        {selectedProp && (
          <div style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            backgroundColor: 'rgba(13, 13, 20, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '16px',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
            maxWidth: '90%'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{selectedProp.location?.city}</div>
              <div style={{ fontWeight: 800, color: 'var(--gold-primary)', fontSize: '1.05rem' }}>
                {formatPrice(selectedProp.price || 12000000)}
              </div>
            </div>

            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '0.85rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                color: '#070709',
                fontWeight: 800,
                fontSize: '0.8rem',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
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
