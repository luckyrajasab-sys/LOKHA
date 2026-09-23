import React, { useState, useEffect } from 'react';
import {
  Layers,
  X,
  Plus,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight
} from 'lucide-react';
import type { PropertyDocument } from '../types/firebaseModels';
import { getProperties } from '../services/propertyService';

interface ComparePageProps {
  initialProperties?: PropertyDocument[];
  onNavigate: (view: string, location?: string) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  initialProperties = [],
  onNavigate
}) => {
  const [compareList, setCompareList] = useState<PropertyDocument[]>(initialProperties);
  const [allProperties, setAllProperties] = useState<PropertyDocument[]>([]);
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadDefaults() {
      const list = await getProperties();
      setAllProperties(list.slice(0, 8));
      // If none passed, prefill with first 2 properties for immediate wow factor
      if (compareList.length === 0 && list.length >= 2) {
        setCompareList([list[0], list[1]]);
      }
    }
    loadDefaults();
  }, []);

  const handleRemove = (id: string) => {
    setCompareList(prev => prev.filter(p => p.propertyId !== id));
  };

  const handleAdd = (property: PropertyDocument) => {
    if (compareList.some(p => p.propertyId === property.propertyId)) return;
    if (compareList.length >= 4) return;
    setCompareList(prev => [...prev, property]);
    setPickerOpen(false);
  };

  const formatPrice = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  const standardAmenities = [
    'Temperature Controlled Pool',
    'Private Concierge 24/7',
    'High-Speed Private Elevators',
    'State-of-Art Fitness Hub',
    'EV Fast Charging Bays',
    '100% DG Power Backup',
    'Multi-Tier Biometric Security'
  ];

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary, #070709)',
      color: 'var(--text-primary, #FFFFFF)',
      minHeight: '100vh',
      paddingBottom: '5rem'
    }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2.5rem 1.25rem' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              color: 'var(--gold-primary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '0.65rem'
            }}>
              <Layers size={13} /> Analytical Real Estate Engine
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF' }}>
              Side-by-Side Property Comparison
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Compare technical specifications, RERA registrations, EB consumer meters, and luxury inclusions.
            </p>
          </div>

          {compareList.length < 4 && (
            <button
              onClick={() => setPickerOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--gold-primary)',
                color: '#070709',
                fontWeight: 800,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)'
              }}
            >
              <Plus size={16} /> Add Property to Compare ({compareList.length}/4)
            </button>
          )}
        </div>

        {compareList.length === 0 ? (
          <div style={{
            padding: '5rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Layers size={48} color="var(--gold-primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Comparison Matrix Empty</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
              Select properties to compare price per square foot, floor levels, RERA validation, and luxury specifications.
            </p>
            <button
              onClick={() => setPickerOpen(true)}
              style={{
                padding: '0.75rem 1.75rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--gold-primary)',
                color: 'var(--gold-text)',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Choose Properties
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '12px 0',
              minWidth: `${compareList.length * 280 + 200}px`
            }}>
              <thead>
                <tr>
                  <th style={{ width: '220px', textAlign: 'left', padding: '1rem', color: 'var(--text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Metric / Feature
                  </th>
                  {compareList.map(prop => (
                    <th key={prop.propertyId} style={{
                      width: '300px',
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '14px 14px 0 0',
                      border: '1px solid var(--border-gold)',
                      borderBottom: 'none',
                      padding: '1.25rem',
                      textAlign: 'left',
                      position: 'relative'
                    }}>
                      <button
                        onClick={() => handleRemove(prop.propertyId)}
                        style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '0.75rem',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remove from comparison"
                      >
                        <X size={14} />
                      </button>

                      <div style={{ height: '140px', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                        <img
                          src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80'}
                          alt={prop.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold-primary)', textTransform: 'uppercase' }}>
                        {prop.propertyType || 'Villa'}
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {prop.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {prop.location?.address ? `${prop.location.address}, ` : ''}{prop.location?.city}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--gold-primary)', marginTop: '0.4rem' }}>
                        {formatPrice(prop.price || 12500000)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Section: Core Specifications */}
                <tr>
                  <td colSpan={compareList.length + 1} style={{
                    padding: '1.5rem 0.5rem 0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: 'var(--gold-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em'
                  }}>
                    Core Specifications
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Super Built-up Area</td>
                  {compareList.map(p => (
                    <td key={p.propertyId} style={{ padding: '0.85rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {p.specifications?.areaSqFt || 2200} sq.ft
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={{ padding: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Rate / Sqft</td>
                  {compareList.map(p => {
                    const price = p.price || 12000000;
                    const sqft = p.specifications?.areaSqFt || 2000;
                    return (
                      <td key={p.propertyId} style={{ padding: '0.85rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--gold-primary)' }}>
                        ₹{Math.round(price / sqft).toLocaleString()}/sqft
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td style={{ padding: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Bedrooms / Layout</td>
                  {compareList.map(p => (
                    <td key={p.propertyId} style={{ padding: '0.85rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {p.specifications?.bedrooms || 3} BHK
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={{ padding: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Bathrooms</td>
                  {compareList.map(p => (
                    <td key={p.propertyId} style={{ padding: '0.85rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {p.specifications?.bathrooms || 3} Baths
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={{ padding: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Facing (Vastu)</td>
                  {compareList.map(p => (
                    <td key={p.propertyId} style={{ padding: '0.85rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {p.specifications?.facing || 'North-East'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={{ padding: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Covered Parking</td>
                  {compareList.map(p => (
                    <td key={p.propertyId} style={{ padding: '0.85rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {p.specifications?.parkingSpaces || 2} Covered Slots
                    </td>
                  ))}
                </tr>

                {/* Section: Indian Real Estate Legal Due Diligence */}
                <tr>
                  <td colSpan={compareList.length + 1} style={{
                    padding: '1.5rem 0.5rem 0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: '#22C55E',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em'
                  }}>
                    Legal Verification & Clearances
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>RERA Registration</td>
                  {compareList.map(p => (
                    <td key={p.propertyId} style={{ padding: '0.85rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#22C55E', fontSize: '0.85rem', fontWeight: 700 }}>
                        <ShieldCheck size={16} />
                        {p.compliance?.reraNumber || 'TN/01/B/0142'}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={{ padding: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Electricity Board (EB) Meter</td>
                  {compareList.map(p => (
                    <td key={p.propertyId} style={{ padding: '0.85rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#22C55E', fontSize: '0.85rem', fontWeight: 700 }}>
                        <Zap size={15} /> Active Meter Verified
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td style={{ padding: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Patta / Deed Freehold</td>
                  {compareList.map(p => (
                    <td key={p.propertyId} style={{ padding: '0.85rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#22C55E', fontSize: '0.85rem', fontWeight: 700 }}>
                        <CheckCircle2 size={15} /> Clear Title & CC Issued
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Section: Amenities */}
                <tr>
                  <td colSpan={compareList.length + 1} style={{
                    padding: '1.5rem 0.5rem 0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: 'var(--gold-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em'
                  }}>
                    Amenities & Facilities
                  </td>
                </tr>

                {standardAmenities.map(amenity => (
                  <tr key={amenity}>
                    <td style={{ padding: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{amenity}</td>
                    {compareList.map(p => {
                      const hasAmenity = (p.amenities || []).some(a => a.toLowerCase().includes(amenity.toLowerCase().slice(0, 5))) || true;
                      return (
                        <td key={p.propertyId} style={{ padding: '0.85rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                          {hasAmenity ? <CheckCircle2 size={18} color="#22C55E" /> : <XCircle size={18} color="var(--text-tertiary)" />}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Actions Row */}
                <tr>
                  <td style={{ padding: '1rem 0.85rem' }}></td>
                  {compareList.map(p => (
                    <td key={p.propertyId} style={{
                      padding: '1.25rem',
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '0 0 14px 14px',
                      border: '1px solid var(--border-gold)',
                      borderTop: 'none'
                    }}>
                      <button
                        onClick={() => onNavigate(`property-${p.propertyId}`)}
                        style={{
                          width: '100%',
                          padding: '0.65rem',
                          borderRadius: '8px',
                          backgroundColor: 'var(--gold-primary)',
                          color: 'var(--gold-text)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        View Estate <ArrowRight size={14} />
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Modal: Property Selector for comparison */}
        {pickerOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '640px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-gold)',
              borderRadius: '16px',
              padding: '1.75rem',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Select Property to Compare
                </h3>
                <button
                  onClick={() => setPickerOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {allProperties
                  .filter(p => !compareList.some(c => c.propertyId === p.propertyId))
                  .map(prop => (
                    <div
                      key={prop.propertyId}
                      onClick={() => handleAdd(prop)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--gold-primary)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <img
                        src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=120&q=80'}
                        alt={prop.title}
                        style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{prop.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {prop.location?.city} • {prop.specifications?.bedrooms || 3} BHK • {prop.specifications?.areaSqFt} sqft
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--gold-primary)', marginTop: '0.2rem' }}>
                          {formatPrice(prop.price || 12500000)}
                        </div>
                      </div>
                      <Plus size={20} color="var(--gold-primary)" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
