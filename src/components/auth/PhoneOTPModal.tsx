import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Phone, KeyRound, AlertCircle, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { initRecaptcha, requestPhoneOTP, confirmPhoneOTP, getFriendlyAuthErrorMessage } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { COUNTRIES } from '../../config/constants';

interface PhoneOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PhoneOTPModal: React.FC<PhoneOTPModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { setUserDirectly } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmation, setConfirmation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const recaptchaVerifierRef = useRef<any>(null);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 8) {
      setError('Please enter a valid mobile number.');
      return;
    }

    setLoading(true);
    setError(null);

    const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;

    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = initRecaptcha('recaptcha-container');
      }

      const confirmResult = await requestPhoneOTP(fullPhone, recaptchaVerifierRef.current);
      setConfirmation(confirmResult);
      setStep('otp');
      setTimer(60);
      setCanResend(false);
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;

    try {
      const profile = await confirmPhoneOTP(confirmation, otpCode, fullPhone);
      setUserDirectly(profile);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err.code || 'auth/invalid-verification-code'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    setLoading(true);
    setError(null);
    const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
    try {
      const confirmResult = await requestPhoneOTP(fullPhone, recaptchaVerifierRef.current);
      setConfirmation(confirmResult);
      setTimer(60);
      setCanResend(false);
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep('phone');
    setOtpCode('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title={step === 'phone' ? 'Phone Verification' : 'Enter One-Time Password'}>
      <div id="recaptcha-container"></div>

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

      {step === 'phone' ? (
        <form onSubmit={handleSendOTP}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            We'll dispatch a 6-digit security code via SMS to verify your mobile number.
          </p>

          <div className="form-group">
            <label className="form-label">Country & Mobile Number</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                style={{
                  width: '110px',
                  padding: '0.8rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem'
                }}
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.phoneCode}>
                    {c.code} ({c.phoneCode})
                  </option>
                ))}
              </select>

              <div className="input-with-icon" style={{ flex: 1 }}>
                <Phone className="input-icon-left" size={18} />
                <input
                  type="tel"
                  className="form-input has-left-icon"
                  placeholder="98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
            style={{ marginTop: '1.25rem' }}
          >
            {loading ? 'Requesting OTP...' : 'Send Security OTP'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Enter the 6-digit OTP dispatched to <strong>{countryCode} {phoneNumber}</strong>
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="otp-input">6-Digit Code</label>
            <div className="input-with-icon">
              <KeyRound className="input-icon-left" size={18} />
              <input
                id="otp-input"
                type="text"
                maxLength={6}
                className="form-input has-left-icon"
                placeholder="123456"
                style={{ letterSpacing: '0.3em', fontSize: '1.25rem', fontWeight: 700, textAlign: 'center' }}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
              />
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8125rem',
            margin: '1rem 0'
          }}>
            <span style={{ color: 'var(--text-tertiary)' }}>
              {timer > 0 ? `Code expires in ${timer}s` : 'Code expired'}
            </span>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={!canResend || loading}
              style={{
                color: canResend ? 'var(--gold-primary)' : 'var(--text-tertiary)',
                cursor: canResend ? 'pointer' : 'not-allowed',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              Resend OTP
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length < 6}
            className="btn btn-primary btn-full"
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Verifying Code...' : 'Verify & Continue'}
            {!loading && <CheckCircle2 size={16} />}
          </button>

          <button
            type="button"
            onClick={() => setStep('phone')}
            className="btn-ghost btn-full"
            style={{ marginTop: '0.75rem', fontSize: '0.8125rem' }}
          >
            Change Phone Number
          </button>
        </form>
      )}
    </Modal>
  );
};
