import React, { useState } from 'react';
import {
  Compass,
  Building,
  Bed,
  Layers,
  Heart,
  MessageSquare,
  CalendarCheck,
  LayoutDashboard,
  Settings,
  Sun,
  Moon,
  LogOut,
  LogIn,
  X,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isExpanded: boolean;
  onToggleExpanded: (expanded?: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isExpanded,
  onToggleExpanded
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const mainNav = [
    { id: 'home', label: 'Explore Estates', icon: Compass },
    { id: 'properties', label: 'Buy & Rent', icon: Building, badge: 'Live' },
    { id: 'stays', label: 'Stays & Hospitality', icon: Bed },
    { id: 'projects', label: 'New Developments', icon: Layers },
    { id: 'list-property', label: 'Give / List Property', icon: PlusCircle, badge: 'Verified' },
  ];

  const userNav = [
    { id: 'saved', label: 'Saved Portfolio', icon: Heart },
    { id: 'messages', label: 'Real-Time Chat', icon: MessageSquare },
    { id: 'bookings', label: 'My Bookings', icon: CalendarCheck },
  ];

  // Desktop hover expansion: expands immediately when mouse pointer enters the sidebar!
  const handleSidebarMouseEnter = () => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      onToggleExpanded(true);
    }
  };

  // Collapses back smoothly when mouse leaves the sidebar on desktop
  const handleSidebarMouseLeave = () => {
    setHoveredItem(null);
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      onToggleExpanded(false);
    }
  };

  const handleItemClick = (e: React.MouseEvent, viewId: string) => {
    e.stopPropagation();
    onNavigate(viewId);
    // On mobile devices, close the sidebar drawer upon selection
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      onToggleExpanded(false);
    }
  };

  const renderNavButton = (
    item: { id: string; label: string; icon: React.ComponentType<{ size?: number; color?: string; className?: string }>; badge?: string },
    isActive: boolean
  ) => {
    const Icon = item.icon;
    const isHovered = hoveredItem === item.id;

    return (
      <div
        key={item.id}
        style={{ position: 'relative' }}
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <button
          onClick={(e) => handleItemClick(e, item.id)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
            padding: isExpanded ? '0.65rem 0.85rem' : '0.65rem 0',
            justifyContent: isExpanded ? 'flex-start' : 'center',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isActive
              ? 'var(--gold-subtle, rgba(212, 175, 55, 0.14))'
              : isHovered
              ? 'var(--bg-elevated, rgba(255, 255, 255, 0.05))'
              : 'transparent',
            color: isActive ? 'var(--gold-primary)' : isHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderLeft: isActive ? '3px solid var(--gold-primary)' : '3px solid transparent',
            transition: 'all var(--transition-fast)',
            cursor: 'pointer',
            position: 'relative'
          }}
          aria-label={item.label}
        >
          <Icon size={20} color={isActive ? 'var(--gold-primary)' : 'currentColor'} />

          {isExpanded && (
            <span style={{
              fontSize: '0.875rem',
              fontWeight: isActive ? 700 : 500,
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
              flex: 1,
              textAlign: 'left'
            }}>
              {item.label}
            </span>
          )}

          {isExpanded && item.badge && (
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#22C55E',
              lineHeight: 1
            }}>
              {item.badge}
            </span>
          )}
        </button>

        {/* Clean Tooltip in Collapsed Mode on desktop */}
        {!isExpanded && isHovered && (
          <div style={{
            position: 'absolute',
            left: 'calc(100% + 12px)',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'var(--bg-card, #16161D)',
            color: 'var(--text-primary, #FFFFFF)',
            padding: '0.45rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-gold, rgba(212, 175, 55, 0.3))',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65)',
            fontSize: '0.75rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            zIndex: 250,
            pointerEvents: 'none',
            animation: 'fadeIn 120ms ease-out forwards'
          }}>
            {item.label}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .lokha-sidebar {
            width: min(290px, 85vw) !important;
            z-index: 300 !important;
            box-shadow: 16px 0 40px rgba(0, 0, 0, 0.85) !important;
            transform: ${isExpanded ? 'translateX(0)' : 'translateX(-100%)'} !important;
            transition: transform 260ms cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .sidebar-mobile-header {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .lokha-sidebar {
            transform: translateX(0) !important;
          }
          .sidebar-mobile-header {
            display: none !important;
          }
        }
      `}</style>
      <aside
        className="lokha-sidebar"
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        style={{
          position: 'fixed',
          top: '4.75rem',
          left: 0,
          bottom: 0,
          width: isExpanded ? 'var(--sidebar-expanded-w, 260px)' : 'var(--sidebar-collapsed-w, 68px)',
          backgroundColor: 'var(--bg-secondary, #0D0D11)',
          borderRight: '1px solid var(--border-gold, rgba(212, 175, 55, 0.22))',
          boxShadow: isExpanded ? '12px 0 32px rgba(0, 0, 0, 0.55)' : '4px 0 16px rgba(0, 0, 0, 0.35)',
          zIndex: 150,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 240ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 240ms cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          userSelect: 'none'
        }}
        aria-label="Main Sidebar Navigation"
      >
        {/* Mobile Header with Close Button */}
        <div className="sidebar-mobile-header" style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem 0.75rem',
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))'
        }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: 'var(--gold-primary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            Navigation Menu
          </div>
          <button
            onClick={() => onToggleExpanded(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              color: 'var(--gold-primary)',
              cursor: 'pointer'
            }}
            title="Close Menu"
            aria-label="Close Menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Groups List */}
        <div style={{
          flex: 1,
          padding: isExpanded ? '1.25rem 0.85rem' : '1.25rem 0.45rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {/* Group 1: Main Exploration */}
          <div>
            {isExpanded && (
              <div style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                color: 'var(--text-tertiary)',
                padding: '0 0.65rem 0.5rem'
              }}>
                Discover
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {mainNav.map((item) => renderNavButton(item, currentView === item.id))}
            </div>
          </div>

          {/* Group 2: Account & Interactions */}
          {user && (
            <div>
              {isExpanded && (
                <div style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  color: 'var(--text-tertiary)',
                  padding: '0 0.65rem 0.5rem'
                }}>
                  Portfolio & Hub
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {userNav.map((item) => renderNavButton(item, currentView === item.id))}
              </div>
            </div>
          )}

          {/* Group 3: Role Management / Dashboard */}
          <div>
            {isExpanded && (
              <div style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                color: 'var(--text-tertiary)',
                padding: '0 0.65rem 0.5rem'
              }}>
                Management
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {renderNavButton({ id: 'dashboard', label: 'My Dashboard & Listings', icon: LayoutDashboard }, currentView === 'dashboard')}
              {renderNavButton({ id: 'settings', label: 'Account Settings', icon: Settings }, currentView === 'settings')}
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Theme Toggle & Sign In / Out */}
        <div style={{
          padding: isExpanded ? '1rem 1.25rem' : '1rem 0.5rem',
          borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-tertiary, #0B0B0F)'
        }}>
          {/* Theme Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.55rem',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-elevated, rgba(255, 255, 255, 0.05))',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} color="var(--gold-primary)" /> : <Moon size={18} color="var(--gold-primary)" />}
            {isExpanded && (
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
              </span>
            )}
          </button>

          {/* User Auth Action */}
          {user ? (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                await logout();
                onNavigate('home');
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.55rem',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                borderRadius: 'var(--radius-md)',
                color: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                cursor: 'pointer'
              }}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={18} />
              {isExpanded && <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Sign Out</span>}
            </button>
          ) : (
            <button
              onClick={(e) => handleItemClick(e, 'login')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.55rem',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                borderRadius: 'var(--radius-md)',
                color: 'var(--gold-primary)',
                backgroundColor: 'var(--gold-subtle, rgba(212, 175, 55, 0.12))',
                border: '1px solid var(--border-gold)',
                cursor: 'pointer'
              }}
              title="Sign In"
              aria-label="Sign In"
            >
              <LogIn size={18} />
              {isExpanded && <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Sign In</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
