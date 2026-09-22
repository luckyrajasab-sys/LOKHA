import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  onRedirectToLogin: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole: _requiredRole,
  onRedirectToLogin
}) => {
  const { user, loading, loginAsDemoMember } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        color: 'var(--gold-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-medium)',
            borderTopColor: 'var(--gold-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Verifying security session...</p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        maxWidth: '480px',
        margin: '5rem auto',
        padding: '2.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)'
      }}>
        <ShieldAlert size={48} color="var(--gold-primary)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Authentication Required
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Please sign in or use 1-click Instant Demo to access your saved properties, dashboard, and verified inquiries.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => loginAsDemoMember()}
            className="btn btn-primary btn-full"
            style={{ fontWeight: 800, letterSpacing: '0.02em' }}
          >
            ⚡ Enter as Verified Member (Instant Demo)
          </button>
          <button
            type="button"
            onClick={onRedirectToLogin}
            className="btn btn-outline btn-full"
          >
            Sign In with Existing Account
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
