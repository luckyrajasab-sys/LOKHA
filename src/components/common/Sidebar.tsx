import React, { useState, useRef, useEffect } from 'react';
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
  LogIn
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
  const { user, logout, role } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveringIconId, setHoveringIconId] = useState<string | null>(null);
  const [autoExpandedByHover, setAutoExpandedByHover] = useState<boolean>(false);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up any pending timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const mainNav = [
    { id: 'home', label: 'Explore Estates', icon: Compass },
    { id: 'properties', label: 'Buy & Rent', icon: Building, badge: 'Live' },
    { id: 'stays', label: 'Stays & Hospitality', icon: Bed },
    { id: 'projects', label: 'New Developments', icon: Layers },
  ];

  const userNav = [
    { id: 'saved', label: 'Saved Portfolio', icon: Heart },
    { id: 'messages', label: 'Real-Time Chat', icon: MessageSquare },
    { id: 'bookings', label: 'My Bookings', icon: CalendarCheck },
  ];

  // Mouse enters an icon: if collapsed, start 3-second expansion timer
  const handleIconMouseEnter = (itemId: string) => {
    setHoveredItem(itemId);

    if (!isExpanded) {
      setHoveringIconId(itemId);
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
      // If hover lasts > 3 seconds, expand sidebar
      hoverTimerRef.current = setTimeout(() => {
        setAutoExpandedByHover(true);
        onToggleExpanded(true);
        setHoveringIconId(null);
      }, 3000);
    }
  };

  // Mouse leaves an icon: cancel timer
  const handleIconMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveringIconId(null);
    setHoveredItem(null);
  };

  // Mouse leaves entire sidebar: collapse if it was auto-expanded by hover
  const handleSidebarMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveringIconId(null);
    setHoveredItem(null);

    if (autoExpandedByHover) {
      setAutoExpandedByHover(false);
      onToggleExpanded(false);
    }
  };

  const handleItemClick = (e: React.MouseEvent, viewId: string) => {
    e.stopPropagation();
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveringIconId(null);
    onNavigate(viewId);
  };

  const renderNavButton = (
    item: { id: string; label: string; icon: React.ComponentType<{ size?: number; color?: string; className?: string }>; badge?: string },
    isActive: boolean
  ) => {
    const Icon = item.icon;
    const isHovered = hoveredItem === item.id;
    const isHolding = !isExpanded && hoveringIconId === item.id;

    return (
      <div
        key={item.id}
        style={{ position: 'relative' }}
        onMouseEnter={() => handleIconMouseEnter(item.id)}
        onMouseLeave={handleIconMouseLeave}
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
          {/* Animated 3-Second Hold-to-Expand Radial Ring in Collapsed Mode */}
          {isHolding && (
            <svg
              style={{
                position: 'absolute',
                width: '36px',
                height: '36px',
                pointerEvents: 'none',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-90deg)'
              }}
              viewBox="0 0 36 36"
            >
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="rgba(212, 175, 55, 0.25)"
                strokeWidth="2.5"
              />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="var(--gold-primary, #D4AF37)"
                strokeWidth="2.5"
                strokeDasharray="94.2"
                strokeDashoffset="94.2"
                strokeLinecap="round"
                style={{
                  animation: 'lokhaHoldProgress 3s linear forwards'
                }}
              />
            </svg>
          )}

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

        {/* Tooltip in Collapsed Mode with 3s hold hint */}
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
            zIndex: 200,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            animation: 'fadeIn 120ms ease-out forwards'
          }}>
            <span>{item.label}</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--gold-primary)', fontWeight: 500, opacity: 0.9 }}>
              Hold 3s to expand
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes lokhaHoldProgress {
          0% { stroke-dashoffset: 94.2; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
      <aside
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
          transition: 'width 280ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          userSelect: 'none'
        }}
        aria-label="Main Sidebar Navigation"
      >

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
              {renderNavButton({ id: 'dashboard', label: `Dashboard (${role || 'Guest'})`, icon: LayoutDashboard }, currentView === 'dashboard')}
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
