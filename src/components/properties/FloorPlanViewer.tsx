import React, { useState } from 'react';
import { Download, Compass } from 'lucide-react';
import type { PropertyDocument } from '../../types/firebaseModels';
import { useToast } from '../common/Toast';

interface FloorPlanViewerProps {
  property: PropertyDocument;
}

export const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({ property }) => {
  const { showToast } = useToast();
  const [activePlanType, setActivePlanType] = useState<'2d' | '3d'>('2d');
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

  const bedrooms = property.specifications?.bedrooms || property.bedrooms || 3;
  const areaSqFt = property.specifications?.areaSqFt || property.area || 2400;

  // Architectural rooms breakdown
  const rooms = property.architecturalSpecs?.rooms || [
    { name: 'Grand Living Salon & Foyer', dimensions: "24'6\" x 18'2\"", areaSqFt: Math.round(areaSqFt * 0.28) },
    { name: 'Master Presidential Suite', dimensions: "20'4\" x 16'8\"", areaSqFt: Math.round(areaSqFt * 0.22) },
    { name: 'Gourmet Kitchen & Scullery', dimensions: "15'2\" x 12'0\"", areaSqFt: Math.round(areaSqFt * 0.12) },
    { name: 'Executive Suite 2', dimensions: "16'0\" x 14'4\"", areaSqFt: Math.round(areaSqFt * 0.15) },
    { name: 'Guest Bedroom / Study', dimensions: "14'6\" x 12'8\"", areaSqFt: Math.round(areaSqFt * 0.11) },
    { name: 'Panoramic Sundeck & Terrace', dimensions: "22'0\" x 8'6\"", areaSqFt: Math.round(areaSqFt * 0.12) }
  ];

  const handleDownloadBrochure = () => {
    showToast('Architectural PDF Brochure & Spec Sheet download started', 'success');
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card, #121217)',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        padding: '1.75rem',
        color: 'var(--text-primary, #FFFFFF)'
      }}
    >
      {/* Header with Switcher & Download */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
            Architectural Floor Plans & Dimensions
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #9CA3AF)', margin: 0 }}>
            {bedrooms} BHK Configuration • {areaSqFt.toLocaleString()} sq.ft Super Built-up Area • Vastu Compliant
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* 2D / 3D Switch */}
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
              onClick={() => setActivePlanType('2d')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activePlanType === '2d' ? 'var(--gold-primary, #D4AF37)' : 'transparent',
                color: activePlanType === '2d' ? '#070709' : '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              2D Schematic
            </button>
            <button
              onClick={() => setActivePlanType('3d')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activePlanType === '3d' ? 'var(--gold-primary, #D4AF37)' : 'transparent',
                color: activePlanType === '3d' ? '#070709' : '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              3D Isometric
            </button>
          </div>

          <button
            onClick={handleDownloadBrochure}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: 'var(--gold-primary, #D4AF37)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Download size={15} /> PDF Blueprint
          </button>
        </div>
      </div>

      {/* Main Blueprint Stage & Room Breakdown Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem',
          alignItems: 'start'
        }}
      >
        {/* Architectural Blueprint Diagram Visual */}
        <div
          style={{
            height: '380px',
            borderRadius: '10px',
            backgroundColor: '#070B14',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            overflow: 'hidden'
          }}
        >
          {/* Blueprint Grid Lines */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Compass Rose */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'rgba(212, 175, 55, 0.8)',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            <Compass size={18} />
            <span>NORTH FACING</span>
          </div>

          {/* Blueprint Layout SVG Mockup */}
          <svg width="280" height="240" viewBox="0 0 280 240" style={{ zIndex: 2 }}>
            <rect x="10" y="10" width="260" height="220" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeDasharray="6 3" />
            {/* Living */}
            <rect x="20" y="20" width="140" height="110" fill={selectedRoom === 0 ? 'rgba(212, 175, 55, 0.25)' : 'rgba(59, 130, 246, 0.12)'} stroke="#3B82F6" strokeWidth="1.5" />
            <text x="30" y="75" fill="#FFFFFF" fontSize="11" fontWeight="bold">Living Salon</text>
            <text x="30" y="92" fill="#9CA3AF" fontSize="9">24'6" x 18'2"</text>

            {/* Master Bed */}
            <rect x="165" y="20" width="95" height="110" fill={selectedRoom === 1 ? 'rgba(212, 175, 55, 0.25)' : 'rgba(59, 130, 246, 0.12)'} stroke="#3B82F6" strokeWidth="1.5" />
            <text x="175" y="70" fill="#FFFFFF" fontSize="10" fontWeight="bold">Master Bed</text>
            <text x="175" y="85" fill="#9CA3AF" fontSize="8">Ensuite Bath</text>

            {/* Kitchen */}
            <rect x="20" y="135" width="85" height="85" fill={selectedRoom === 2 ? 'rgba(212, 175, 55, 0.25)' : 'rgba(59, 130, 246, 0.12)'} stroke="#3B82F6" strokeWidth="1.5" />
            <text x="30" y="180" fill="#FFFFFF" fontSize="10" fontWeight="bold">Kitchen</text>

            {/* Bedroom 2 */}
            <rect x="110" y="135" width="85" height="85" fill={selectedRoom === 3 ? 'rgba(212, 175, 55, 0.25)' : 'rgba(59, 130, 246, 0.12)'} stroke="#3B82F6" strokeWidth="1.5" />
            <text x="120" y="180" fill="#FFFFFF" fontSize="10" fontWeight="bold">Bedroom 2</text>

            {/* Balcony */}
            <rect x="200" y="135" width="60" height="85" fill={selectedRoom === 5 ? 'rgba(212, 175, 55, 0.25)' : 'rgba(16, 185, 129, 0.12)'} stroke="#10B981" strokeWidth="1.5" />
            <text x="205" y="180" fill="#10B981" fontSize="9" fontWeight="bold">Terrace</text>
          </svg>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary, #6B7280)', marginTop: '0.75rem', zIndex: 2 }}>
            Click room dimensions on right to highlight layout zones
          </span>
        </div>

        {/* Room Dimensions Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-primary, #D4AF37)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Room Measurement Schedule
          </span>

          {rooms.map((room, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedRoom(selectedRoom === idx ? null : idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                backgroundColor: selectedRoom === idx ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: selectedRoom === idx ? '1px solid var(--gold-primary, #D4AF37)' : '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.15rem 0' }}>{room.name}</h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #9CA3AF)' }}>{room.dimensions}</span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary, #FFFFFF)' }}>
                  {room.areaSqFt} sq.ft
                </span>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary, #6B7280)' }}>
                  {((room.areaSqFt / areaSqFt) * 100).toFixed(0)}% of plan
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
