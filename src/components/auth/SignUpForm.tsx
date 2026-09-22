import React, { useState } from 'react';
import { User, Mail, Lock, Phone, Globe, Eye, EyeOff, ArrowRight, MapPin, Navigation, Loader2 } from 'lucide-react';
import { registerWithEmail, loginWithGoogle, loginWithApple, getFriendlyAuthErrorMessage } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { COUNTRIES } from '../../config/constants';
import { PhoneOTPModal } from './PhoneOTPModal';
import { detectCurrentLocation } from '../../utils/location';

interface SignUpFormProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onNavigateToLogin }) => {
  const { setUserDirectly } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('India');
  const [location, setLocation] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    setError(null);
    try {
      const loc = await detectCurrentLocation();
      setLocation(`${loc.city}${loc.state ? `, ${loc.state}` : ''}`);
      if (loc.country) setCountry(loc.country);
    } catch (err: any) {
      setError(err.message || 'Could not auto-detect location. Please enter manually.');
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleInstantMemberAccess = () => {
    setUserDirectly({
      id: 'member_' + Math.random().toString(36).substring(2, 9),
      displayName: fullName.trim() || 'Alexander Wright',
      email: email.trim() || 'alexander.wright@lokha.com',
      phone: phoneNumber.trim() || '+91 98765 43210',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      country: country || 'India',
      preferredLanguage: 'en',
      preferredCurrency: 'INR',
      roles: ['member'],
      accountType: 'Verified Member',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      emailVerified: true,
      phoneVerified: true,
      profileCompleted: true,
      status: 'active'
    });
    onSuccess();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms || !agreePrivacy) {
      setError('Please acknowledge both the Terms of Service and Privacy Policy to create an account.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profile = await registerWithEmail(
        fullName,
        email,
        phoneNumber,
        password,
        country,
        'Verified Member'
      );
      setUserDirectly(profile);
      onSuccess();
    } catch (err: any) {
      const msg = err.code ? getFriendlyAuthErrorMessage(err.code) : (err.message || 'Registration failed. Please try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await loginWithGoogle();
      setUserDirectly(profile);
      onSuccess();
    } catch (err: any) {
      const msg = err.code ? getFriendlyAuthErrorMessage(err.code) : (err.message || 'Google sign-up failed.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await loginWithApple();
      setUserDirectly(profile);
      onSuccess();
    } catch (err: any) {
      const msg = err.code ? getFriendlyAuthErrorMessage(err.code) : (err.message || 'Apple sign-up failed.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '540px',
      margin: '0 auto',
      padding: '2.5rem',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-lg)'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          marginBottom: '0.4rem'
        }}>
          Create Your Portfolio Account
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Join high-net-worth buyers, investors, and certified developers globally
        </p>
      </div>

      {/* 1-Click Instant Member Access for Vercel/Testing */}
      <div style={{
        marginBottom: '1.5rem',
        padding: '0.875rem 1rem',
        background: 'linear-gradient(135deg, rgba(201, 162, 77, 0.15), rgba(201, 162, 77, 0.05))',
        border: '1px dashed var(--gold-primary)',
        borderRadius: 'var(--radius-lg)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-light)', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
          ⚡ 1-CLICK INSTANT MEMBER ACCESS
        </div>
        <button
          type="button"
          onClick={handleInstantMemberAccess}
          className="btn btn-primary btn-sm btn-full"
          style={{ justifyContent: 'center', fontWeight: 700, letterSpacing: '0.01em' }}
        >
          Enter as Verified Member (Instant)
        </button>
      </div>

      {error && (
        <div style={{
          padding: '0.8rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--danger-bg)',
          color: 'var(--danger)',
          fontSize: '0.85rem',
          marginBottom: '1.25rem',
          lineHeight: 1.4
        }}>
          {error}
        </div>
      )}

      {/* Social Logins Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ justifyContent: 'center' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginRight: '0.35rem' }}>
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"/>
            <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
          </svg>
          Google
        </button>

        <button
          type="button"
          onClick={handleAppleSignup}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ justifyContent: 'center' }}
        >
          <svg width="16" height="16" viewBox="0 0 170 170" fill="currentColor" style={{ marginRight: '0.35rem' }}>
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.31-5.87-8.91-10.37-18.9-13.5-29.98-3.13-11.07-4.7-21.72-4.7-31.94 0-14.88 3.83-27.18 11.5-36.89 7.67-9.71 17.15-14.63 28.46-14.76 4.9 0 10.35 1.24 16.34 3.73 6 2.49 10.02 3.79 12.06 3.9 1.63 0 5.86-1.35 12.69-4.04 6.83-2.7 12.5-3.88 17.03-3.56 12.63.63 22.84 5.38 30.64 14.26-10.99 6.64-16.36 15.65-16.1 27.03.26 9.17 3.77 16.94 10.53 23.3 6.76 6.36 14.88 10.07 24.36 11.13-2.09 6.33-4.66 12.92-7.71 19.78zM119.22 33.64c0-7.39 2.65-14.25 7.95-20.58 5.3-6.33 11.83-10.39 19.59-12.18.66 1.76.99 3.52.99 5.28 0 7.39-2.77 14.37-8.32 20.95-5.55 6.58-12.3 10.53-20.25 11.85-.22-1.76-.33-3.52-.33-5.32z" />
          </svg>
          Apple
        </button>
      </div>

      <button
        type="button"
        onClick={() => setIsPhoneModalOpen(true)}
        disabled={loading}
        className="btn btn-outline btn-sm btn-full"
        style={{ marginBottom: '1.5rem', justifyContent: 'center' }}
      >
        <Phone size={15} style={{ marginRight: '0.35rem' }} />
        Quick Sign Up with Phone Number
      </button>

      <div className="auth-divider">
        <span>OR REGISTER WITH EMAIL</span>
      </div>

      <form onSubmit={handleRegister}>
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="signup-name">Full Name</label>
          <div className="input-with-icon">
            <User className="input-icon-left" size={18} />
            <input
              id="signup-name"
              type="text"
              className="form-input has-left-icon"
              placeholder="Alexander Wright"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="signup-email">Email Address</label>
          <div className="input-with-icon">
            <Mail className="input-icon-left" size={18} />
            <input
              id="signup-email"
              type="email"
              className="form-input has-left-icon"
              placeholder="alex@luxuryestates.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="form-label" htmlFor="signup-phone">Phone Number</label>
          <div className="input-with-icon">
            <Phone className="input-icon-left" size={18} />
            <input
              id="signup-phone"
              type="tel"
              className="form-input has-left-icon"
              placeholder="+91 98765 43210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Country & Account Purpose */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Country</label>
            <div className="input-with-icon">
              <Globe className="input-icon-left" size={18} />
              <select
                className="form-input has-left-icon"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>City / Location</label>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--gold-primary)',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  border: 'none'
                }}
              >
                {detectingLocation ? (
                  <Loader2 size={12} className="spinner" />
                ) : (
                  <Navigation size={12} />
                )}
                {detectingLocation ? 'Detecting...' : 'Auto-detect Location'}
              </button>
            </div>
            <div className="input-with-icon">
              <MapPin className="input-icon-left" size={18} />
              <input
                type="text"
                className="form-input has-left-icon"
                placeholder="e.g. Mumbai, Maharashtra"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-pass">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon-left" size={18} />
              <input
                id="signup-pass"
                type={showPassword ? 'text' : 'password'}
                className="form-input has-left-icon has-right-icon"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-confirm-pass">Confirm Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon-left" size={18} />
              <input
                id="signup-confirm-pass"
                type={showPassword ? 'text' : 'password'}
                className="form-input has-left-icon"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div style={{ marginTop: '0.5rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              style={{ marginTop: '0.2rem', accentColor: 'var(--gold-primary)', width: '16px', height: '16px' }}
            />
            <span>I accept the <strong style={{ color: 'var(--text-primary)' }}>Terms & Conditions</strong> governing the marketplace and verified transactions.</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              style={{ marginTop: '0.2rem', accentColor: 'var(--gold-primary)', width: '16px', height: '16px' }}
            />
            <span>I acknowledge the <strong style={{ color: 'var(--text-primary)' }}>Privacy Policy</strong> and data protection protocols.</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-full"
        >
          {loading ? 'Registering Account...' : 'Create Account'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      {/* Switch to Login */}
      <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={onNavigateToLogin}
          style={{ color: 'var(--gold-primary)', fontWeight: 700, cursor: 'pointer' }}
        >
          Sign In
        </button>
      </div>

      <PhoneOTPModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSuccess={onSuccess}
      />
    </div>
  );
};
