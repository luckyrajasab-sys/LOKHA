import React, { useState } from 'react';
import {
  Share2,
  Bookmark,
  ChevronDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useToast } from '../common/Toast';
import type { PropertyType } from '../../types/firebaseModels';

export interface FilterState {
  minPrice?: number;
  maxPrice?: number;
  propertyTypes: string[];
  bedrooms: number;
  bathrooms: number;
  minArea?: number;
  maxArea?: number;
  areaUnit: 'sq.ft' | 'sq.m';
  amenities: string[];
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  onSaveSearch?: () => void;
  isLoggedIn?: boolean;
}

const ALL_PROPERTY_TYPES: PropertyType[] = [
  'Apartment',
  'Villa',
  'House',
  'Penthouse',
  'Plot',
  'Commercial',
  'Office'
];

const POPULAR_AMENITIES = [
  'Swimming Pool',
  'Sea View',
  'Gym / Fitness Center',
  'Private Garden',
  'Covered Parking',
  'Clubhouse',
  '24/7 Security',
  'EV Charging Bays'
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  onSaveSearch,
  isLoggedIn: _isLoggedIn = false
}) => {
  const { showToast } = useToast();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const formatPriceDisplay = (min?: number, max?: number) => {
    if (!min && !max) return 'Any Price';
    const fmt = (v: number) => (v >= 10000000 ? `₹${(v / 10000000).toFixed(1)}Cr` : `₹${(v / 100000).toFixed(0)}L`);
    if (min && !max) return `From ${fmt(min)}`;
    if (!min && max) return `Up to ${fmt(max)}`;
    return `${fmt(min!)} – ${fmt(max!)}`;
  };

  const handleCopyShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Filtered link copied to clipboard! Shareable & bookmarkable.', 'success');
    }
  };

  const togglePropertyType = (type: string) => {
    const exists = filters.propertyTypes.includes(type);
    const updated = exists
      ? filters.propertyTypes.filter((t) => t !== type)
      : [...filters.propertyTypes, type];
    onChange({ ...filters, propertyTypes: updated });
  };

  const toggleAmenity = (amenity: string) => {
    const exists = filters.amenities.includes(amenity);
    const updated = exists
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onChange({ ...filters, amenities: updated });
  };

  const toggleAreaUnit = () => {
    const newUnit = filters.areaUnit === 'sq.ft' ? 'sq.m' : 'sq.ft';
    onChange({ ...filters, areaUnit: newUnit });
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary, #121217)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        borderRadius: '12px',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.25rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 5
      }}
    >
      {/* Main Filter Horizontal Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* 1. Price Range Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: (filters.minPrice || filters.maxPrice) ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: (filters.minPrice || filters.maxPrice) ? '1px solid var(--gold-primary, #D4AF37)' : '1px solid rgba(255, 255, 255, 0.12)',
                color: (filters.minPrice || filters.maxPrice) ? 'var(--gold-primary, #D4AF37)' : 'var(--text-primary, #FFFFFF)',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span>{formatPriceDisplay(filters.minPrice, filters.maxPrice)}</span>
              <ChevronDown size={14} />
            </button>

            {openDropdown === 'price' && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  width: '280px',
                  backgroundColor: '#16161D',
                  borderRadius: '10px',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8)',
                  padding: '1.25rem',
                  zIndex: 100
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem', color: '#FFFFFF' }}>
                  Price Range
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Max Price: {filters.maxPrice ? (filters.maxPrice >= 10000000 ? `₹${(filters.maxPrice / 10000000).toFixed(1)} Cr` : `₹${(filters.maxPrice / 100000).toFixed(0)} Lakh`) : 'No Limit'}
                  </label>
                  <input
                    type="range"
                    min={2500000}
                    max={100000000}
                    step={2500000}
                    value={filters.maxPrice || 100000000}
                    onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--gold-primary, #D4AF37)' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => onChange({ ...filters, minPrice: undefined, maxPrice: 10000000 })}
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#FFF', cursor: 'pointer' }}
                  >
                    &lt; ₹1 Cr
                  </button>
                  <button
                    onClick={() => onChange({ ...filters, minPrice: 10000000, maxPrice: 30000000 })}
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#FFF', cursor: 'pointer' }}
                  >
                    ₹1 - 3 Cr
                  </button>
                  <button
                    onClick={() => onChange({ ...filters, minPrice: 30000000, maxPrice: undefined })}
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#FFF', cursor: 'pointer' }}
                  >
                    ₹3 Cr+
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Property Type Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: filters.propertyTypes.length > 0 ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: filters.propertyTypes.length > 0 ? '1px solid var(--gold-primary, #D4AF37)' : '1px solid rgba(255, 255, 255, 0.12)',
                color: filters.propertyTypes.length > 0 ? 'var(--gold-primary, #D4AF37)' : 'var(--text-primary, #FFFFFF)',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span>{filters.propertyTypes.length > 0 ? `${filters.propertyTypes.length} Types` : 'Property Type'}</span>
              <ChevronDown size={14} />
            </button>

            {openDropdown === 'type' && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  width: '240px',
                  backgroundColor: '#16161D',
                  borderRadius: '10px',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8)',
                  padding: '1rem',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                {ALL_PROPERTY_TYPES.map((t) => (
                  <label
                    key={t}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      color: filters.propertyTypes.includes(t) ? 'var(--gold-primary, #D4AF37)' : '#FFFFFF'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={filters.propertyTypes.includes(t)}
                      onChange={() => togglePropertyType(t)}
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 3. Bedrooms Selector */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '0.15rem' }}>
            {[0, 1, 2, 3, 4, 5].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => onChange({ ...filters, bedrooms: b })}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: filters.bedrooms === b ? 'var(--gold-primary, #D4AF37)' : 'transparent',
                  color: filters.bedrooms === b ? '#070709' : 'var(--text-secondary, #9CA3AF)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                {b === 0 ? 'Any Bed' : `${b}+`}
              </button>
            ))}
          </div>

          {/* 4. Area Range with Sqft / Sqm Toggle */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'area' ? null : 'area')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: (filters.minArea || filters.maxArea) ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: (filters.minArea || filters.maxArea) ? '1px solid var(--gold-primary, #D4AF37)' : '1px solid rgba(255, 255, 255, 0.12)',
                color: (filters.minArea || filters.maxArea) ? 'var(--gold-primary, #D4AF37)' : 'var(--text-primary, #FFFFFF)',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span>
                {filters.minArea ? `${filters.minArea} ${filters.areaUnit}+` : `Area (${filters.areaUnit})`}
              </span>
              <ChevronDown size={14} />
            </button>

            {openDropdown === 'area' && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  width: '280px',
                  backgroundColor: '#16161D',
                  borderRadius: '10px',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8)',
                  padding: '1.25rem',
                  zIndex: 100
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>Area Threshold</span>
                  <button
                    onClick={toggleAreaUnit}
                    style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(212, 175, 55, 0.2)',
                      border: '1px solid var(--gold-primary)',
                      color: 'var(--gold-primary)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Switch to {filters.areaUnit === 'sq.ft' ? 'Sq. M' : 'Sq. Ft'}
                  </button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Minimum: {filters.minArea ? `${filters.minArea.toLocaleString()} ${filters.areaUnit}` : 'Any Area'}
                  </label>
                  <input
                    type="range"
                    min={filters.areaUnit === 'sq.ft' ? 500 : 50}
                    max={filters.areaUnit === 'sq.ft' ? 10000 : 1000}
                    step={filters.areaUnit === 'sq.ft' ? 250 : 25}
                    value={filters.minArea || (filters.areaUnit === 'sq.ft' ? 500 : 50)}
                    onChange={(e) => onChange({ ...filters, minArea: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--gold-primary, #D4AF37)' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. Amenities Multi-Select Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'amenities' ? null : 'amenities')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: filters.amenities.length > 0 ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: filters.amenities.length > 0 ? '1px solid var(--gold-primary, #D4AF37)' : '1px solid rgba(255, 255, 255, 0.12)',
                color: filters.amenities.length > 0 ? 'var(--gold-primary, #D4AF37)' : 'var(--text-primary, #FFFFFF)',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={13} />
              <span>{filters.amenities.length > 0 ? `${filters.amenities.length} Amenities` : 'Amenities'}</span>
              <ChevronDown size={14} />
            </button>

            {openDropdown === 'amenities' && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  width: '260px',
                  backgroundColor: '#16161D',
                  borderRadius: '10px',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8)',
                  padding: '1rem',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                {POPULAR_AMENITIES.map((a) => (
                  <label
                    key={a}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      color: filters.amenities.includes(a) ? 'var(--gold-primary, #D4AF37)' : '#FFFFFF'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(a)}
                      onChange={() => toggleAmenity(a)}
                    />
                    <span>{a}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Save Search, Share Link, Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Save Search Button (Req 8) */}
          <button
            type="button"
            onClick={onSaveSearch}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: 'var(--gold-primary, #D4AF37)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Save this search to get alerted on new listings"
          >
            <Bookmark size={14} />
            <span>Save Search</span>
          </button>

          {/* Copy Shareable URL */}
          <button
            type="button"
            onClick={handleCopyShareLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'var(--text-primary, #FFFFFF)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Copy shareable link"
          >
            <Share2 size={14} />
            <span>Share</span>
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={onReset}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary, #6B7280)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Reset all filters"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
