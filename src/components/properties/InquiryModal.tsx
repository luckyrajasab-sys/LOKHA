import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Send, Phone, CheckCircle, Building } from 'lucide-react';
import { createInquiry } from '../../firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import type { PropertyDocument } from '../../types/firebaseModels';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyDocument | null;
  onSuccess: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  property,
  onSuccess
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('Hello, I am interested in this property. Please contact me with more information regarding availability and viewings.');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!property) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to submit an inquiry.');
      return;
    }
    if (!message.trim()) {
      setError('Please provide an inquiry message.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createInquiry({
        propertyId: property.propertyId,
        propertyTitle: property.title,
        buyerId: user.id,
        buyerName: user.displayName || 'Interested Buyer',
        buyerEmail: user.email || '',
        ownerId: property.ownerId,
        agentId: property.agentId,
        message: message.trim(),
        phone: phone.trim()
      });
      setSubmitted(true);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Inquire on Property">
      {submitted ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <CheckCircle size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Inquiry Dispatched Directly
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Your inquiry for <strong>{property.title}</strong> has been transmitted in real time to the owner/agent dashboard.
          </p>
          <button onClick={handleClose} className="btn btn-primary btn-full">
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Building size={20} style={{ color: 'var(--gold-primary)' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {property.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {property.city}, {property.state} • {property.listingType}
              </div>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="inquiry-phone">Contact Phone Number</label>
            <div className="input-with-icon">
              <Phone className="input-icon-left" size={16} />
              <input
                id="inquiry-phone"
                type="tel"
                className="form-input has-left-icon"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="inquiry-message">Message for Owner / Agent</label>
            <textarea
              id="inquiry-message"
              className="form-input"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Transmitting Inquiry...' : 'Submit Real-time Inquiry'}
            {!loading && <Send size={16} />}
          </button>
        </form>
      )}
    </Modal>
  );
};
