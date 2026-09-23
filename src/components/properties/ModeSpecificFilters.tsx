import React from 'react';
import { Calendar, Building, ShieldCheck, Star, Users, Clock } from 'lucide-react';

export type BrowsingMode = 'real-estate' | 'projects' | 'stays';

interface ModeSpecificFiltersProps {
  mode: BrowsingMode;
  // Projects filters
  selectedBuilder?: string;
  onBuilderChange?: (builder: string) => void;
  selectedPossession?: string;
  onPossessionChange?: (possession: string) => void;
  reraApprovedOnly?: boolean;
  onReraToggle?: (checked: boolean) => void;

  // Stays filters
  checkInDate?: string;
  onCheckInChange?: (date: string) => void;
  checkOutDate?: string;
  onCheckOutChange?: (date: string) => void;
  maxNightlyPrice?: number;
  onNightlyPriceChange?: (price: number) => void;
  minHostRating?: number;
  onHostRatingChange?: (rating: number) => void;
  guestCount?: number;
  onGuestCountChange?: (guests: number) => void;

  // Real estate filters
  furnishedStatus?: string;
  onFurnishedChange?: (val: string) => void;
  facing?: string;
  onFacingChange?: (val: string) => void;
}

const TOP_BUILDERS = ['All Builders', 'DLF Luxury', 'Prestige Group', 'Lodha Luxury', 'Godrej Properties', 'Brigade Group', 'Sobha Developers', 'Oberoi Realty'];
const POSSESSION_TIMELINES = ['Any Timeline', 'Ready to Move', 'Under Construction', 'Possession by 2026', 'Possession 2027+'];

export const ModeSpecificFilters: React.FC<ModeSpecificFiltersProps> = ({
  mode,
  selectedBuilder = 'All Builders',
  onBuilderChange,
  selectedPossession = 'Any Timeline',
  onPossessionChange,
  reraApprovedOnly = false,
  onReraToggle,
  checkInDate = '',
  onCheckInChange,
  checkOutDate = '',
  onCheckOutChange,
  maxNightlyPrice = 75000,
  onNightlyPriceChange,
  minHostRating = 0,
  onHostRatingChange,
  guestCount = 2,
  onGuestCountChange,
  furnishedStatus = 'All',
  onFurnishedChange,
  facing = 'All',
  onFacingChange
}) => {
  if (mode === 'projects') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          padding: '0.85rem 1.25rem',
          backgroundColor: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: '10px',
          marginBottom: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8B5CF6', fontWeight: 700, fontSize: '0.85rem' }}>
          <Building size={16} />
          <span>PROJECTS SPECIFIC:</span>
        </div>

        {/* Builder Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <select
            value={selectedBuilder}
            onChange={(e) => onBuilderChange && onBuilderChange(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: '#1E1B2E',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            {TOP_BUILDERS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Possession Timeline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Clock size={14} color="#8B5CF6" />
          <select
            value={selectedPossession}
            onChange={(e) => onPossessionChange && onPossessionChange(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: '#1E1B2E',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            {POSSESSION_TIMELINES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* RERA Approved Checkbox */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.825rem',
            color: '#FFFFFF',
            cursor: 'pointer',
            backgroundColor: reraApprovedOnly ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
            padding: '0.35rem 0.65rem',
            borderRadius: '6px',
            border: reraApprovedOnly ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid transparent'
          }}
        >
          <input
            type="checkbox"
            checked={reraApprovedOnly}
            onChange={(e) => onReraToggle && onReraToggle(e.target.checked)}
          />
          <ShieldCheck size={14} color={reraApprovedOnly ? '#22C55E' : 'var(--text-tertiary)'} />
          <span>RERA Approved Projects Only</span>
        </label>
      </div>
    );
  }

  if (mode === 'stays') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap',
          padding: '0.85rem 1.25rem',
          backgroundColor: 'rgba(249, 115, 22, 0.08)',
          border: '1px solid rgba(249, 115, 22, 0.25)',
          borderRadius: '10px',
          marginBottom: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#F97316', fontWeight: 700, fontSize: '0.85rem' }}>
          <Calendar size={16} />
          <span>STAYS SPECIFIC:</span>
        </div>

        {/* Check-In / Check-Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Check-in:</span>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => onCheckInChange && onCheckInChange(e.target.value)}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: '#261C14',
              border: '1px solid rgba(249, 115, 22, 0.35)',
              color: '#FFFFFF',
              fontSize: '0.78rem'
            }}
          />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Check-out:</span>
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => onCheckOutChange && onCheckOutChange(e.target.value)}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: '#261C14',
              border: '1px solid rgba(249, 115, 22, 0.35)',
              color: '#FFFFFF',
              fontSize: '0.78rem'
            }}
          />
        </div>

        {/* Nightly Price Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Max Nightly: ₹{maxNightlyPrice.toLocaleString()}
          </span>
          <input
            type="range"
            min={5000}
            max={150000}
            step={2500}
            value={maxNightlyPrice}
            onChange={(e) => onNightlyPriceChange && onNightlyPriceChange(Number(e.target.value))}
            style={{ width: '100px', accentColor: '#F97316' }}
          />
        </div>

        {/* Host Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Star size={14} color="#F97316" fill="#F97316" />
          <select
            value={minHostRating}
            onChange={(e) => onHostRatingChange && onHostRatingChange(Number(e.target.value))}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: '#261C14',
              border: '1px solid rgba(249, 115, 22, 0.35)',
              color: '#FFFFFF',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <option value={0}>Any Rating</option>
            <option value={4.0}>4.0★ & above</option>
            <option value={4.5}>4.5★ & above (Superhost)</option>
            <option value={4.8}>4.8★ & above (Exceptional)</option>
          </select>
        </div>

        {/* Guests */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Users size={14} color="#F97316" />
          <select
            value={guestCount}
            onChange={(e) => onGuestCountChange && onGuestCountChange(Number(e.target.value))}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: '#261C14',
              border: '1px solid rgba(249, 115, 22, 0.35)',
              color: '#FFFFFF',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <option value={1}>1 Guest</option>
            <option value={2}>2 Guests</option>
            <option value={4}>4 Guests</option>
            <option value={6}>6+ Guests</option>
            <option value={8}>8+ Family/Group</option>
          </select>
        </div>
      </div>
    );
  }

  // Real estate mode
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
        padding: '0.65rem 1.25rem',
        backgroundColor: 'rgba(212, 175, 55, 0.05)',
        border: '1px solid rgba(212, 175, 55, 0.15)',
        borderRadius: '8px',
        marginBottom: '1rem',
        fontSize: '0.8rem'
      }}
    >
      <span style={{ color: 'var(--gold-primary, #D4AF37)', fontWeight: 700 }}>REAL ESTATE PREFERENCES:</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Furnishing:</span>
        <select
          value={furnishedStatus}
          onChange={(e) => onFurnishedChange && onFurnishedChange(e.target.value)}
          style={{
            padding: '0.3rem 0.6rem',
            borderRadius: '6px',
            backgroundColor: '#17171C',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            fontSize: '0.78rem'
          }}
        >
          <option value="All">All Statuses</option>
          <option value="Fully Furnished">Fully Furnished</option>
          <option value="Semi-Furnished">Semi-Furnished</option>
          <option value="Unfurnished">Unfurnished</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Facing:</span>
        <select
          value={facing}
          onChange={(e) => onFacingChange && onFacingChange(e.target.value)}
          style={{
            padding: '0.3rem 0.6rem',
            borderRadius: '6px',
            backgroundColor: '#17171C',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            fontSize: '0.78rem'
          }}
        >
          <option value="All">All Facings</option>
          <option value="North-East">North-East (Vastu Auspicious)</option>
          <option value="East">East</option>
          <option value="North">North</option>
          <option value="West">West</option>
          <option value="South">South</option>
        </select>
      </div>
    </div>
  );
};
