import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Bell,
  CheckCircle2,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  MapPin,
  Crosshair,
  Loader2
} from 'lucide-react';
import { subscribeToNotifications } from '../../firebase/realtime';
import { markNotificationAsRead } from '../../firebase/firestore';
import type { NotificationDocument } from '../../types/firebaseModels';
import { LokhaLogo } from './LokhaLogo';
import { detectCurrentLocation } from '../../utils/location';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onSearch?: (query: string, location?: string) => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onSearch,
  onToggleSidebar
}) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [isDetectingLoc, setIsDetectingLoc] = useState(false);

  // Real-time notification subscription
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const unsub = subscribeToNotifications(user.id, (liveNotifs) => {
      setNotifications(liveNotifs);
    });

    return () => unsub();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notif: NotificationDocument) => {
    if (user && !notif.isRead) {
      await markNotificationAsRead(user.id, notif.notificationId);
    }
    setNotifOpen(false);
    onNavigate('dashboard');
  };

  const handleDetectLocation = async () => {
    try {
      setIsDetectingLoc(true);
      const loc = await detectCurrentLocation();
      const place = loc.city ? (loc.state ? `${loc.city}, ${loc.state}` : loc.city) : loc.formattedAddress;
      setLocationQuery(place);
    } catch (err) {
      console.warn('Location detection failed:', err);
    } finally {
      setIsDetectingLoc(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery, locationQuery);
    }
    onNavigate('properties');
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    onNavigate('home');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'var(--bg-glass, rgba(7, 7, 9, 0.88))',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(212, 175, 55, 0.16)',
      transition: 'all var(--transition-base)',
      height: '4.75rem',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem'
      }}>
        {/* 1. App Logo & Sidebar Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                color: 'var(--gold-primary)',
                cursor: 'pointer'
              }}
              title="Toggle Sidebar Navigation"
              aria-label="Toggle Sidebar"
            >
              <Menu size={19} />
            </button>
          )}

          <div onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
            <LokhaLogo variant="full" size="md" />
          </div>
        </div>

        {/* 2. Central Luxury Global Search Bar with Location & Auto-detect */}
        <div style={{ flex: 1, maxWidth: '720px', minWidth: '200px' }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#0E0E14',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(212, 175, 55, 0.32)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
              transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
              overflow: 'hidden'
            }}>
              {/* Keyword Segment */}
              <div style={{ position: 'relative', flex: 1.3, display: 'flex', alignItems: 'center', minWidth: '130px' }}>
                <Search
                  size={16}
                  color="var(--gold-primary)"
                  style={{ position: 'absolute', left: '1rem', pointerEvents: 'none' }}
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Estates, villas, penthouses..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.6rem 0.65rem 2.7rem',
                    fontSize: '0.85rem',
                    color: '#FFFFFF',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    letterSpacing: '0.01em'
                  }}
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      color: 'var(--text-tertiary)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    aria-label="Clear Search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Middle Divider */}
              <div style={{
                width: '1px',
                height: '24px',
                backgroundColor: 'rgba(212, 175, 55, 0.25)',
                margin: '0 2px',
                flexShrink: 0
              }} />

              {/* Location & GPS Auto-detect Segment */}
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', minWidth: '120px' }}>
                <MapPin
                  size={15}
                  color="var(--gold-primary)"
                  style={{ position: 'absolute', left: '0.75rem', pointerEvents: 'none' }}
                />

                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Location or City..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.2rem 0.65rem 2.2rem',
                    fontSize: '0.825rem',
                    color: '#FFFFFF',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none'
                  }}
                />

                {/* GPS Auto-detect button */}
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLoc}
                  title="Auto-detect current GPS location"
                  aria-label="Auto-detect location"
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: isDetectingLoc ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: 'var(--gold-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isDetectingLoc ? 'wait' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {isDetectingLoc ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Crosshair size={13} />
                  )}
                </button>
              </div>

              {/* Submit Search Button */}
              <button
                type="submit"
                style={{
                  height: '34px',
                  margin: '3px 4px 3px 0',
                  padding: '0 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--gold-primary)',
                  color: '#070709',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  flexShrink: 0
                }}
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* 3. Notification Button & 4. Profile Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          {/* Notification Button */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setDropdownOpen(false);
                }}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: notifOpen ? 'rgba(212, 175, 55, 0.18)' : '#0F0F15',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  color: unreadCount > 0 ? 'var(--gold-primary)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all var(--transition-fast)'
                }}
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--gold-primary)',
                    color: '#070709',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    boxShadow: '0 0 10px rgba(212, 175, 55, 0.6)'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notifOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.65rem)',
                    right: 0,
                    width: '320px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    backgroundColor: '#0F0F15',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 16px 36px rgba(0, 0, 0, 0.8)',
                    padding: '0.75rem',
                    zIndex: 210,
                    animation: 'modalIn 150ms ease forwards'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF' }}>
                      Notifications
                    </div>
                    {unreadCount > 0 && (
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'rgba(212, 175, 55, 0.15)',
                        color: 'var(--gold-primary)',
                        fontWeight: 700
                      }}>
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                      No notifications yet
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {notifications.slice(0, 8).map(n => (
                        <div
                          key={n.notificationId}
                          onClick={() => handleNotificationClick(n)}
                          style={{
                            padding: '0.6rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: n.isRead ? 'transparent' : 'rgba(212, 175, 55, 0.08)',
                            border: n.isRead ? '1px solid transparent' : '1px solid rgba(212, 175, 55, 0.25)',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'flex-start'
                          }}
                        >
                          <div style={{ marginTop: '0.2rem' }}>
                            {n.isRead ? (
                              <CheckCircle2 size={14} color="var(--text-tertiary)" />
                            ) : (
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--gold-primary)' }} />
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: n.isRead ? 500 : 700, color: '#FFFFFF' }}>
                              {n.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.3 }}>
                              {n.message}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        onNavigate('dashboard');
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ width: '100%', fontSize: '0.75rem' }}
                    >
                      View All in Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Button */}
          {!user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                onClick={() => onNavigate('login')}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 1rem' }}
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="btn btn-primary btn-sm"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 1.1rem' }}
              >
                Join Lokha
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  setNotifOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.35rem 0.75rem 0.35rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#0E0E14',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                }}
                aria-label="User Profile Menu"
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--gold-gradient)',
                  color: '#070709',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem'
                }}>
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'L'}
                </div>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  maxWidth: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user.displayName || 'Member'}
                </span>
                <ChevronDown size={14} color="var(--gold-primary)" />
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.65rem)',
                    right: 0,
                    width: '240px',
                    backgroundColor: '#0F0F15',
                    border: '1px solid rgba(212, 175, 55, 0.28)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 16px 36px rgba(0, 0, 0, 0.8)',
                    padding: '0.5rem',
                    zIndex: 200,
                    animation: 'modalIn 150ms ease forwards'
                  }}
                  onClick={() => setDropdownOpen(false)}
                >
                  <div style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    marginBottom: '0.35rem'
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>
                      {user.displayName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {user.email}
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginTop: '0.45rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(212, 175, 55, 0.15)',
                      color: 'var(--gold-primary)',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      <ShieldCheck size={12} />
                      {user.roles.join(' • ').toUpperCase()}
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', gap: '0.6rem', padding: '0.6rem 0.75rem' }}
                  >
                    <User size={16} />
                    Overview Dashboard
                  </button>

                  <button
                    onClick={() => onNavigate('settings')}
                    className="btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', gap: '0.6rem', padding: '0.6rem 0.75rem' }}
                  >
                    <Settings size={16} />
                    Account Settings
                  </button>

                  <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)', margin: '0.35rem 0' }} />

                  <button
                    onClick={handleLogout}
                    className="btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', gap: '0.6rem', padding: '0.6rem 0.75rem', color: '#EF4444' }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
