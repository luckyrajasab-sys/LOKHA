import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Phone,
  Compass
} from 'lucide-react';
import type { SiteVisitDocument } from '../types/firebaseModels';
import { subscribeToBuyerSiteVisits, updateSiteVisitStatus } from '../services/siteVisitService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

interface SiteVisitsPageProps {
  onNavigate: (view: string, location?: string) => void;
}

export const SiteVisitsPage: React.FC<SiteVisitsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [visits, setVisits] = useState<SiteVisitDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'all'>('upcoming');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsub = subscribeToBuyerSiteVisits(user.id, (list) => {
      setVisits(list);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleCancel = async (visitId: string) => {
    if (!user) return;
    try {
      await updateSiteVisitStatus(visitId, 'cancelled', user.id);
      showToast('Site visit cancelled', 'info');
    } catch {
      showToast('Failed to cancel site visit', 'error');
    }
  };

  const filteredVisits = visits.filter(v => {
    if (activeTab === 'upcoming') return v.status === 'requested' || v.status === 'confirmed';
    if (activeTab === 'completed') return v.status === 'completed' || v.status === 'cancelled';
    return true;
  });

  const getStatusBadge = (status: SiteVisitDocument['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            color: '#22C55E',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <CheckCircle2 size={12} /> Confirmed by Concierge
          </span>
        );
      case 'requested':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(234, 179, 8, 0.15)',
            color: '#EAB308',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <Clock size={12} /> Pending Confirmation
          </span>
        );
      case 'completed':
        return (
          <span style={{
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            color: '#60A5FA',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <XCircle size={12} /> Cancelled
          </span>
        );
    }
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
        <Calendar size={56} color="var(--gold-primary)" style={{ marginBottom: '1rem', opacity: 0.7 }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          LOKHA Private Site Visits & Chauffeur
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Schedule private in-person walkthroughs with our senior estate managers, verified legal documentation review on-site, and complimentary luxury chauffeur pickup.
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
          Sign In to Track Scheduled Visits
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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.25rem' }}>
        {/* Top Header */}
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
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              My Scheduled Site Visits
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Track real-time appointments, concierge assignments, and chauffeur logistics.
            </p>
          </div>

          <button
            onClick={() => onNavigate('properties')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.75rem 1.4rem',
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
            <Compass size={16} /> Book New Visit
          </button>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
          {(['upcoming', 'completed', 'all'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1.2rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: activeTab === tab ? 'var(--gold-primary)' : 'var(--bg-card)',
                color: activeTab === tab ? 'var(--gold-text)' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === tab ? 'var(--gold-primary)' : 'var(--border)'}`,
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'background-color 250ms ease, color 250ms ease, border-color 250ms ease'
              }}
            >
              {tab} Visits
            </button>
          ))}
        </div>

        {/* Visits List */}
        {loading ? (
          <div style={{ minHeight: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid rgba(212, 175, 55, 0.2)',
              borderTopColor: 'var(--gold-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
        ) : filteredVisits.length === 0 ? (
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <Calendar size={48} color="var(--gold-primary)" style={{ opacity: 0.7, marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              No {activeTab} site visits scheduled
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
              Browse properties and click &quot;Book Free Site Visit&quot; to inspect villas and penthouses with personal concierge accompaniment.
            </p>
            <button
              onClick={() => onNavigate('properties')}
              style={{
                padding: '0.75rem 1.6rem',
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
              Discover Properties
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredVisits.map(visit => (
              <div
                key={visit.visitId}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'background-color 250ms ease, border-color 250ms ease, box-shadow 250ms ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  {visit.propertyImage && (
                    <img
                      src={visit.propertyImage}
                      alt={visit.propertyTitle}
                      style={{ width: '90px', height: '90px', borderRadius: '12px', objectFit: 'cover' }}
                    />
                  )}

                  <div>
                    <div style={{ marginBottom: '0.4rem' }}>
                      {getStatusBadge(visit.status)}
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                      {visit.propertyTitle}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={14} color="var(--gold-primary)" />
                        {visit.preferredDate}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={14} color="var(--gold-primary)" />
                        {visit.preferredTimeSlot}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={14} color="var(--gold-primary)" />
                        {visit.propertyCity}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => onNavigate(`property-${visit.propertyId}`)}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background-color 250ms ease, color 250ms ease, border-color 250ms ease'
                    }}
                  >
                    View Listing
                  </button>

                  {visit.status === 'requested' && (
                    <button
                      onClick={() => handleCancel(visit.visitId)}
                      style={{
                        padding: '0.65rem 1.25rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#EF4444',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel Visit
                    </button>
                  )}

                  <a
                    href="tel:+919840182990"
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--gold-primary)',
                      color: 'var(--gold-text)',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: '0 4px 12px rgba(198, 161, 91, 0.35)',
                      transition: 'background-color 250ms ease, transform 200ms ease'
                    }}
                  >
                    <Phone size={14} /> Concierge Hotline
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
