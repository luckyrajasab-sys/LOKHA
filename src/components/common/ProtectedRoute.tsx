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
  requiredRole,
  onRedirectToLogin
}) => {
  const { user, loading, hasRole } = useAuth();

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
          Please sign in to access your saved properties, dashboard, and verified inquiries.
        </p>
        <button
          onClick={onRedirectToLogin}
          className="btn btn-primary btn-full"
        >
          Sign In to Continue
        </button>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div style={{
        maxWidth: '520px',
        margin: '5rem auto',
        padding: '2.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)'
      }}>
        <ShieldAlert size={48} color="var(--warning)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Restricted Portal Access
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          This area is designated for verified <strong>{requiredRole}s</strong>. Your account status is currently standard member.
        </p>
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          marginBottom: '1.5rem'
        }}>
          To request developer or agent accreditation, submit your corporate license and tax ID in Account Settings.
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-secondary btn-full"
        >
          Return to Overview
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
