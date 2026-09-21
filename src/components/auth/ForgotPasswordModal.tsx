import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Mail, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { resetPassword, getFriendlyAuthErrorMessage } from '../../services/authService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = ''
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleResetState = () => {
    setSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleResetState} title="Reset Password">
      {submitted ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <CheckCircle size={32} />
          </div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Reset Link Dispatched
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            We've sent a secure password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
          </p>
          <button
            onClick={handleResetState}
            className="btn btn-primary btn-full"
          >
            Return to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Enter your registered account email and we'll send you an encrypted link to securely reset your password.
          </p>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="reset-email">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon-left" size={18} />
              <input
                id="reset-email"
                type="email"
                className="form-input has-left-icon"
                placeholder="name@luxuryestates.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Sending Recovery Link...' : 'Send Reset Link'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      )}
    </Modal>
  );
};
