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
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

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
    // Clicking anywhere on collapsed sidebar expands it
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
        backgroundColor: 'var(--bg-secondary, #0D0D11)',
        borderRight: '1px solid var(--border-gold, rgba(212, 175, 55, 0.22))',
        boxShadow: isExpanded ? '12px 0 32px rgba(0, 0, 0, 0.55)' : '4px 0 16px rgba(0, 0, 0, 0.35)',
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
      {/* Sidebar Header: Expanding / Collapsing Button */}
      <div style={{
        height: '4.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isExpanded ? 'space-between' : 'center',
        padding: isExpanded ? '0 1.25rem' : '0',
        borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
        position: 'relative'
      }}>
        {isExpanded ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--gold-primary)'
            }}>
              Navigation Menu
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpanded();
              }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary, #131319)',
                border: '1px solid var(--border-gold, rgba(212, 175, 55, 0.25))',
                color: 'var(--gold-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded();
            }}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary, #131319)',
              border: '1px solid var(--border-gold, rgba(212, 175, 55, 0.35))',
              color: 'var(--gold-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
            title="Expand Sidebar (Click to Expand)"
            aria-label="Expand Sidebar"
          >
            <PanelLeftOpen size={20} />
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
                        ? 'var(--gold-subtle, rgba(212, 175, 55, 0.14))'
                        : isHovered
                        ? 'var(--bg-elevated, rgba(255, 255, 255, 0.05))'
                        : 'transparent',
                      color: isActive ? 'var(--gold-primary)' : isHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
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
                      backgroundColor: 'var(--bg-card, #16161D)',
                      color: 'var(--text-primary, #FFFFFF)',
                      padding: '0.45rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-gold, rgba(212, 175, 55, 0.3))',
                      boxShadow: 'var(--shadow-md)',
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
                          ? 'var(--gold-subtle, rgba(212, 175, 55, 0.14))'
                          : isHovered
                          ? 'var(--bg-elevated, rgba(255, 255, 255, 0.05))'
                          : 'transparent',
                        color: isActive ? 'var(--gold-primary)' : isHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
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
                        backgroundColor: 'var(--bg-card, #16161D)',
                        color: 'var(--text-primary, #FFFFFF)',
                        padding: '0.45rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-gold, rgba(212, 175, 55, 0.3))',
                        boxShadow: 'var(--shadow-md)',
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
                    ? 'var(--gold-subtle, rgba(212, 175, 55, 0.14))'
                    : hoveredItem === 'dashboard'
                    ? 'var(--bg-elevated, rgba(255, 255, 255, 0.05))'
                    : 'transparent',
                  color: currentView === 'dashboard' ? 'var(--gold-primary)' : hoveredItem === 'dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
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
                  backgroundColor: 'var(--bg-card, #16161D)',
                  color: 'var(--text-primary, #FFFFFF)',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-gold, rgba(212, 175, 55, 0.3))',
                  boxShadow: 'var(--shadow-md)',
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
                    ? 'var(--gold-subtle, rgba(212, 175, 55, 0.14))'
                    : hoveredItem === 'settings'
                    ? 'var(--bg-elevated, rgba(255, 255, 255, 0.05))'
                    : 'transparent',
                  color: currentView === 'settings' ? 'var(--gold-primary)' : hoveredItem === 'settings' ? 'var(--text-primary)' : 'var(--text-secondary)',
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
                  backgroundColor: 'var(--bg-card, #16161D)',
                  color: 'var(--text-primary, #FFFFFF)',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-gold, rgba(212, 175, 55, 0.3))',
                  boxShadow: 'var(--shadow-md)',
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

        {/* Compact Click Hint */}
        {!isExpanded && (
          <div style={{ textAlign: 'center', marginTop: '0.2rem' }}>
            <ChevronRight size={13} color="var(--text-tertiary)" style={{ opacity: 0.6 }} />
          </div>
        )}
      </div>
    </aside>
  );
};
