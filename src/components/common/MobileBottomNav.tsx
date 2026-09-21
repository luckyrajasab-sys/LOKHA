import React from 'react';
import { Home, Compass, Heart, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentView, onNavigate }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'properties', label: 'Explore', icon: Compass },
    { id: user ? 'saved' : 'login', label: 'Saved', icon: Heart },
    { id: user ? 'messages' : 'login', label: 'Messages', icon: MessageSquare },
    { id: user ? 'dashboard' : 'login', label: user ? 'Profile' : 'Sign In', icon: User }
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '4.25rem',
      backgroundColor: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 90,
      padding: '0 0.5rem'
    }} className="mobile-only-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.label}
            onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              color: isActive ? 'var(--gold-primary)' : 'var(--text-tertiary)',
              width: '20%',
              padding: '0.4rem 0',
              transition: 'color var(--transition-fast)'
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: '0.6875rem', fontWeight: isActive ? 600 : 500 }}>
              {item.label}
            </span>
          </button>
        );
      })}
      <style>{`
        @media (min-width: 900px) {
          .mobile-only-nav {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};
