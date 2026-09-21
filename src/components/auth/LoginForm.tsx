import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone } from 'lucide-react';
import { loginWithEmail, loginWithGoogle, loginWithApple, getFriendlyAuthErrorMessage } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { PhoneOTPModal } from './PhoneOTPModal';

interface LoginFormProps {
  onSuccess: () => void;
  onNavigateToSignUp: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onNavigateToSignUp }) => {
  const { setUserDirectly } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profile = await loginWithEmail(email, password);
      setUserDirectly(profile);
      onSuccess();
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await loginWithGoogle();
      setUserDirectly(profile);
      onSuccess();
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await loginWithApple();
      setUserDirectly(profile);
      onSuccess();
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '440px',
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
          Welcome Back
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Sign in to your global estate and accommodation portfolio
        </p>
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

      {/* Email / Password Form */}
      <form onSubmit={handleEmailLogin}>
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email</label>
          <div className="input-with-icon">
            <Mail className="input-icon-left" size={18} />
            <input
              id="login-email"
              type="email"
              className="form-input has-left-icon"
              placeholder="alex@luxuryestates.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" htmlFor="login-password">Password</label>
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              style={{
                fontSize: '0.78rem',
                color: 'var(--gold-primary)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Forgot password?
            </button>
          </div>
          <div className="input-with-icon">
            <Lock className="input-icon-left" size={18} />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="form-input has-left-icon has-right-icon"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="input-icon-right"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-full"
          style={{ marginTop: '1.5rem' }}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      {/* Divider */}
      <div className="auth-divider">
        <span>OR CONTINUE WITH</span>
      </div>

      {/* Social & Alternative Logins */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn btn-secondary btn-full"
          style={{ justifyContent: 'center' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '0.25rem' }}>
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"/>
            <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          onClick={handleAppleLogin}
          disabled={loading}
          className="btn btn-secondary btn-full"
          style={{ justifyContent: 'center' }}
        >
          <svg width="18" height="18" viewBox="0 0 170 170" fill="currentColor" style={{ marginRight: '0.25rem' }}>
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.31-5.87-8.91-10.37-18.9-13.5-29.98-3.13-11.07-4.7-21.72-4.7-31.94 0-14.88 3.83-27.18 11.5-36.89 7.67-9.71 17.15-14.63 28.46-14.76 4.9 0 10.35 1.24 16.34 3.73 6 2.49 10.02 3.79 12.06 3.9 1.63 0 5.86-1.35 12.69-4.04 6.83-2.7 12.5-3.88 17.03-3.56 12.63.63 22.84 5.38 30.64 14.26-10.99 6.64-16.36 15.65-16.1 27.03.26 9.17 3.77 16.94 10.53 23.3 6.76 6.36 14.88 10.07 24.36 11.13-2.09 6.33-4.66 12.92-7.71 19.78zM119.22 33.64c0-7.39 2.65-14.25 7.95-20.58 5.3-6.33 11.83-10.39 19.59-12.18.66 1.76.99 3.52.99 5.28 0 7.39-2.77 14.37-8.32 20.95-5.55 6.58-12.3 10.53-20.25 11.85-.22-1.76-.33-3.52-.33-5.32z" />
          </svg>
          Continue with Apple
        </button>

        <button
          type="button"
          onClick={() => setIsPhoneModalOpen(true)}
          disabled={loading}
          className="btn btn-outline btn-full"
          style={{ justifyContent: 'center' }}
        >
          <Phone size={17} style={{ marginRight: '0.25rem' }} />
          Continue with Phone OTP
        </button>
      </div>

      {/* Switch to Sign Up */}
      <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onNavigateToSignUp}
          style={{ color: 'var(--gold-primary)', fontWeight: 700, cursor: 'pointer' }}
        >
          Create account
        </button>
      </div>

      {/* Sub-modals */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={email}
      />

      <PhoneOTPModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSuccess={onSuccess}
      />
    </div>
  );
};
