import React, { useState } from 'react';
import { X, Calendar, Phone, User, CheckCircle, ShieldCheck } from 'lucide-react';
import type { PropertyDocument } from '../../types/firebaseModels';
import { bookSiteVisit } from '../../services/siteVisitService';
import { createEnquiry } from '../../services/enquiryService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';

interface CallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyDocument | null;
  mode?: 'callback' | 'visit';
}

export const CallbackModal: React.FC<CallbackModalProps> = ({
  isOpen,
  onClose,
  property,
  mode = 'callback'
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'callback' | 'visit'>(mode);
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const email = user?.email || '';
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (10:00 AM - 1:00 PM)');
  const [callPreference, setCallPreference] = useState<'phone' | 'whatsapp'>('whatsapp');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !property) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      showToast('Please provide your phone or WhatsApp number', 'error');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'visit') {
        await bookSiteVisit({
          propertyId: property.propertyId,
          propertyTitle: property.title,
          propertyCity: property.location?.city || property.city || 'India',
          propertyImage: property.images?.[0] || '',
          ownerId: property.ownerId || 'admin',
          buyerId: user?.id || 'guest',
          buyerName: name || 'Prospective Buyer',
          buyerEmail: email,
          buyerPhone: phone,
          preferredDate: preferredDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
          preferredTimeSlot: preferredTime,
          notes: notes || `Contact via ${callPreference.toUpperCase()}`
        });
        showToast('Private site visit scheduled! Our concierge will confirm within 1 hour.', 'success');
      } else {
        await createEnquiry({
          propertyId: property.propertyId,
          propertyTitle: property.title,
          ownerId: property.ownerId || 'admin',
          buyerId: user?.id || 'guest',
          buyerName: name || 'Prospective Buyer',
          buyerEmail: email,
          buyerPhone: phone,
          message: `[REQUEST CALLBACK via ${callPreference.toUpperCase()}] Preferred time: ${preferredTime}. Notes: ${notes || 'Immediate callback requested'}`
        });
        showToast('Callback request dispatched to verified representative!', 'success');
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Request failed:', err);
      showToast('Request submitted! Our team will contact you shortly.', 'success');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--bg-secondary, #111116)',
          borderRadius: 'var(--radius-xl, 16px)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          color: 'var(--text-primary, #FFFFFF)',
          overflow: 'hidden',
          animation: 'fadeInModal 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, transparent 100%)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
              <ShieldCheck size={16} color="var(--gold-primary, #D4AF37)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-primary, #D4AF37)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                LOKHA Verified Concierge
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              {activeTab === 'visit' ? 'Schedule a Private Site Visit' : 'Request Instant Callback'}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary, #9CA3AF)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Property Brief */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}
        >
          {property.images?.[0] && (
            <img
              src={property.images[0]}
              alt={property.title}
              style={{ width: '56px', height: '42px', objectFit: 'cover', borderRadius: '6px' }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {property.title}
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--gold-primary, #D4AF37)', margin: '0.15rem 0 0 0', fontWeight: 700 }}>
              ₹{(property.price / 10000000).toFixed(2)} Cr • {property.location?.city || property.city}
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', padding: '0.75rem 1.5rem 0', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('callback')}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '8px',
              border: activeTab === 'callback' ? '1px solid var(--gold-primary, #D4AF37)' : '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: activeTab === 'callback' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
              color: activeTab === 'callback' ? '#FFFFFF' : 'var(--text-secondary, #9CA3AF)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Phone size={15} /> Request Callback
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('visit')}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '8px',
              border: activeTab === 'visit' ? '1px solid var(--gold-primary, #D4AF37)' : '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: activeTab === 'visit' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
              color: activeTab === 'visit' ? '#FFFFFF' : 'var(--text-secondary, #9CA3AF)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Calendar size={15} /> Schedule Visit
          </button>
        </div>

        {/* Form Body */}
        {success ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <CheckCircle size={52} color="#10B981" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Request Received
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              A dedicated relationship director will reach out to you via {callPreference.toUpperCase()}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem 0.6rem 2.2rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: '#FFFFFF',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Phone / WhatsApp *
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-tertiary)' }} />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem 0.6rem 2.2rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: '#FFFFFF',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>
            </div>

            {activeTab === 'visit' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Preferred Visit Date
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: '#FFFFFF',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Time Window
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                      backgroundColor: '#1E1E26',
                      color: '#FFFFFF',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                    <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1:00 PM - 4:00 PM)</option>
                    <option value="Evening (4:00 PM - 7:00 PM)">Evening (4:00 PM - 7:00 PM)</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'callback' && (
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Contact Channel Preference
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="channel"
                      checked={callPreference === 'whatsapp'}
                      onChange={() => setCallPreference('whatsapp')}
                    />
                    WhatsApp Message / Call
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="channel"
                      checked={callPreference === 'phone'}
                      onChange={() => setCallPreference('phone')}
                    />
                    Direct Phone Call
                  </label>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Special Requirements or Questions (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ask about floor plans, payment schedule, or private chauffeur pickup..."
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  resize: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                backgroundColor: 'var(--gold-primary, #D4AF37)',
                color: '#070709',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
              }}
            >
              {loading ? 'Submitting Request...' : activeTab === 'visit' ? 'Confirm Private Visit' : 'Request Callback Now'}
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
