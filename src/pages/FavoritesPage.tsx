import React, { useState, useEffect } from 'react';
import {
  Heart,
  MapPin,
  Trash2,
  Layers,
  Compass
} from 'lucide-react';
import type { PropertyDocument } from '../types/firebaseModels';
import { subscribeToFavorites, removeFavorite } from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

interface FavoritesPageProps {
  onNavigate: (view: string, location?: string) => void;
  onCompareAdd?: (property: PropertyDocument) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onNavigate, onCompareAdd }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [savedProperties, setSavedProperties] = useState<PropertyDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsub = subscribeToFavorites(user.id, (properties) => {
      setSavedProperties(properties);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleRemove = async (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await removeFavorite(user.id, propertyId);
      showToast('Removed from saved portfolio', 'info');
    } catch {
      showToast('Failed to remove item', 'error');
    }
  };

  const formatPrice = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  if (!user) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-primary)'
      }}>
        <Heart size={56} color="var(--gold-primary)" style={{ marginBottom: '1rem', opacity: 0.7 }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Private Saved Portfolio
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Sign in to your private LOKHA account to save, monitor price adjustments, and compare luxury properties across India.
        </p>
        <button
          onClick={() => onNavigate('login')}
          style={{
            padding: '0.85rem 2rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--gold-primary)',
            color: 'var(--gold-text)',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(198, 161, 91, 0.35)',
            transition: 'background-color 250ms ease, transform 200ms ease'
          }}
        >
          Sign In to Access Portfolio
        </button>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      paddingBottom: '5rem'
    }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '2.5rem 1.25rem' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border)'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Saved Luxury Portfolio
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              You have <strong style={{ color: 'var(--gold-primary)' }}>{savedProperties.length}</strong> estates saved for private review and site inspections.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => onNavigate('compare')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--gold-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'background-color 250ms ease, color 250ms ease, border-color 250ms ease'
              }}
            >
              <Layers size={16} /> Compare Matrix
            </button>

            <button
              onClick={() => onNavigate('properties')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--gold-primary)',
                color: 'var(--gold-text)',
                fontWeight: 800,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(198, 161, 91, 0.35)',
                transition: 'background-color 250ms ease, transform 200ms ease'
              }}
            >
              <Compass size={16} /> Discover More
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ minHeight: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(212, 175, 55, 0.2)',
              borderTopColor: 'var(--gold-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
        ) : savedProperties.length === 0 ? (
          <div style={{
            padding: '5rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <Heart size={48} color="var(--gold-primary)" style={{ marginBottom: '1rem', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Your Portfolio is Empty
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
              While browsing properties, click the heart icon on any villa or penthouse to save it here.
            </p>
            <button
              onClick={() => onNavigate('properties')}
              style={{
                padding: '0.75rem 1.75rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--gold-primary)',
                color: 'var(--gold-text)',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(198, 161, 91, 0.35)',
                transition: 'background-color 250ms ease, transform 200ms ease'
              }}
            >
              Explore Available Estates
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.75rem'
          }}>
            {savedProperties.map((prop) => {
              const img = prop.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';
              const price = prop.price || 12000000;
              const sqft = prop.specifications?.areaSqFt || 2200;

              return (
                <div
                  key={prop.propertyId}
                  onClick={() => onNavigate(`property-${prop.propertyId}`)}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl, 16px)',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-card)',
                    transition: 'background-color 250ms ease, border-color 250ms ease, box-shadow 250ms ease, transform 200ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'var(--gold-primary)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  }}
                >
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <img src={img} alt={prop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    <button
                      onClick={(e) => handleRemove(e, prop.propertyId)}
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.85)',
                        border: 'none',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Remove from portfolio"
                    >
                      <Trash2 size={15} />
                    </button>

                    <div style={{
                      position: 'absolute',
                      bottom: '0.75rem',
                      left: '0.75rem',
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(7, 7, 9, 0.85)',
                      color: 'var(--gold-primary)',
                      fontSize: '1.15rem',
                      fontWeight: 900
                    }}>
                      {formatPrice(price)}
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                      {prop.title}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '0.85rem' }}>
                      <MapPin size={14} color="var(--gold-primary)" />
                      <span>{prop.location?.city || 'India'}</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '1rem'
                    }}>
                      <span>{prop.specifications?.bedrooms || 3} BHK</span>
                      <span>{prop.specifications?.bathrooms || 3} Baths</span>
                      <span>{sqft.toLocaleString()} sqft</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                      {onCompareAdd && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCompareAdd(prop);
                            showToast('Added to compare matrix', 'success');
                          }}
                          style={{
                            flex: 1,
                            padding: '0.65rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem',
                            transition: 'background-color 250ms ease, color 250ms ease, border-color 250ms ease'
                          }}
                        >
                          <Layers size={14} /> Compare
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(`property-${prop.propertyId}`);
                        }}
                        style={{
                          flex: 1,
                          padding: '0.65rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--gold-primary)',
                          color: 'var(--gold-text)',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(198, 161, 91, 0.35)',
                          transition: 'background-color 250ms ease, transform 200ms ease'
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
