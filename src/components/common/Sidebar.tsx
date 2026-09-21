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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LokhaLogo } from './LokhaLogo';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
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

  const handleItemClick = (e: React.MouseEvent, viewId: string) => {
    e.stopPropagation();
    onNavigate(viewId);
  };

  const handleSidebarClick = () => {
    // Whenever mouse clicks on the sidebar, expand it if collapsed
    if (!isExpanded) {
      onToggleExpanded();
    }
  };

  return (
    <aside
      onClick={handleSidebarClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: isExpanded ? 'var(--sidebar-expanded-w, 260px)' : 'var(--sidebar-collapsed-w, 68px)',
        backgroundColor: '#0A0A0E',
        borderRight: '1px solid rgba(212, 175, 55, 0.18)',
        boxShadow: isExpanded ? '12px 0 32px rgba(0, 0, 0, 0.65)' : '4px 0 16px rgba(0, 0, 0, 0.45)',
        zIndex: 150,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 280ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1)',
        overflowX: 'hidden',
        userSelect: 'none',
        cursor: isExpanded ? 'default' : 'pointer'
      }}
      aria-label="Main Sidebar Navigation"
    >
      {/* Sidebar Header: Logo & Toggle Button */}
      <div style={{
        height: '4.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isExpanded ? 'space-between' : 'center',
        padding: isExpanded ? '0 1.25rem' : '0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        position: 'relative'
      }}>
        {isExpanded ? (
          <div onClick={(e) => handleItemClick(e, 'home')} style={{ cursor: 'pointer' }}>
            <LokhaLogo variant="full" size="sm" />
          </div>
        ) : (
          <div onClick={(e) => handleItemClick(e, 'home')} title="Lokha Home" style={{ cursor: 'pointer' }}>
            <LokhaLogo variant="icon-only" size={32} />
          </div>
        )}

        {/* Expand / Collapse Button */}
        {isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded();
            }}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: 'var(--gold-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color var(--transition-fast)'
            }}
            title="Collapse Sidebar"
            aria-label="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
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
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
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
                        ? 'rgba(212, 175, 55, 0.14)'
                        : isHovered
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'transparent',
                      color: isActive ? 'var(--gold-primary)' : isHovered ? '#FFFFFF' : 'var(--text-secondary)',
                      borderLeft: isActive ? '3px solid var(--gold-primary)' : '3px solid transparent',
                      transition: 'all var(--transition-fast)',
                      cursor: 'pointer'
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

                  {/* Tooltip in Collapsed Mode */}
                  {!isExpanded && isHovered && (
                    <div style={{
                      position: 'absolute',
                      left: 'calc(100% + 12px)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: '#16161D',
                      color: '#FFFFFF',
                      padding: '0.45rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      zIndex: 200,
                      pointerEvents: 'none',
                      animation: 'modalIn 120ms ease forwards'
                    }}>
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
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
              {userNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
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
                          ? 'rgba(212, 175, 55, 0.14)'
                          : isHovered
                          ? 'rgba(255, 255, 255, 0.04)'
                          : 'transparent',
                        color: isActive ? 'var(--gold-primary)' : isHovered ? '#FFFFFF' : 'var(--text-secondary)',
                        borderLeft: isActive ? '3px solid var(--gold-primary)' : '3px solid transparent',
                        transition: 'all var(--transition-fast)',
                        cursor: 'pointer'
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
                    </button>

                    {!isExpanded && isHovered && (
                      <div style={{
                        position: 'absolute',
                        left: 'calc(100% + 12px)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: '#16161D',
                        color: '#FFFFFF',
                        padding: '0.45rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        zIndex: 200,
                        pointerEvents: 'none'
                      }}>
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
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
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setHoveredItem('dashboard')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button
                onClick={(e) => handleItemClick(e, 'dashboard')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem',
                  padding: isExpanded ? '0.65rem 0.85rem' : '0.65rem 0',
                  justifyContent: isExpanded ? 'flex-start' : 'center',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: currentView === 'dashboard'
                    ? 'rgba(212, 175, 55, 0.14)'
                    : hoveredItem === 'dashboard'
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'transparent',
                  color: currentView === 'dashboard' ? 'var(--gold-primary)' : hoveredItem === 'dashboard' ? '#FFFFFF' : 'var(--text-secondary)',
                  borderLeft: currentView === 'dashboard' ? '3px solid var(--gold-primary)' : '3px solid transparent',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer'
                }}
                aria-label="Role Dashboard"
              >
                <LayoutDashboard size={20} color={currentView === 'dashboard' ? 'var(--gold-primary)' : 'currentColor'} />

                {isExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: currentView === 'dashboard' ? 700 : 500 }}>
                      Dashboard
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {role || 'Guest'}
                    </span>
                  </div>
                )}
              </button>

              {!isExpanded && hoveredItem === 'dashboard' && (
                <div style={{
                  position: 'absolute',
                  left: 'calc(100% + 12px)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: '#16161D',
                  color: '#FFFFFF',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  zIndex: 200,
                  pointerEvents: 'none'
                }}>
                  Dashboard ({role})
                </div>
              )}
            </div>

            {/* Settings */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setHoveredItem('settings')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button
                onClick={(e) => handleItemClick(e, 'settings')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem',
                  padding: isExpanded ? '0.65rem 0.85rem' : '0.65rem 0',
                  justifyContent: isExpanded ? 'flex-start' : 'center',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: currentView === 'settings'
                    ? 'rgba(212, 175, 55, 0.14)'
                    : hoveredItem === 'settings'
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'transparent',
                  color: currentView === 'settings' ? 'var(--gold-primary)' : hoveredItem === 'settings' ? '#FFFFFF' : 'var(--text-secondary)',
                  borderLeft: currentView === 'settings' ? '3px solid var(--gold-primary)' : '3px solid transparent',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer'
                }}
                aria-label="Account Settings"
              >
                <Settings size={20} color={currentView === 'settings' ? 'var(--gold-primary)' : 'currentColor'} />

                {isExpanded && (
                  <span style={{ fontSize: '0.875rem', fontWeight: currentView === 'settings' ? 700 : 500 }}>
                    Settings
                  </span>
                )}
              </button>

              {!isExpanded && hoveredItem === 'settings' && (
                <div style={{
                  position: 'absolute',
                  left: 'calc(100% + 12px)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: '#16161D',
                  color: '#FFFFFF',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  zIndex: 200,
                  pointerEvents: 'none'
                }}>
                  Settings
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Footer: Theme Toggle & Sign In / Out */}
      <div style={{
        padding: isExpanded ? '1rem 1.25rem' : '1rem 0.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        backgroundColor: '#08080B'
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
            padding: '0.5rem',
            justifyContent: isExpanded ? 'flex-start' : 'center',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            backgroundColor: 'transparent',
            cursor: 'pointer'
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {isExpanded && (
            <span style={{ fontSize: '0.8125rem' }}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
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
              padding: '0.5rem',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              borderRadius: 'var(--radius-md)',
              color: '#EF4444',
              backgroundColor: 'transparent',
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
              padding: '0.5rem',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              borderRadius: 'var(--radius-md)',
              color: 'var(--gold-primary)',
              backgroundColor: 'rgba(212, 175, 55, 0.08)',
              cursor: 'pointer'
            }}
            title="Sign In"
            aria-label="Sign In"
          >
            <LogIn size={18} />
            {isExpanded && <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Sign In</span>}
          </button>
        )}

        {/* Compact Click Hint */}
        {!isExpanded && (
          <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
            <ChevronRight size={14} color="var(--text-tertiary)" style={{ opacity: 0.5 }} />
          </div>
        )}
      </div>
    </aside>
  );
};
