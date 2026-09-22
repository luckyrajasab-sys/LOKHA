import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
  MapPin,
  Tag,
  Sparkles,
  ExternalLink,
  Flame,
  Copy,
  Check,
  Zap
} from 'lucide-react';
import { subscribeToNotifications } from '../../firebase/realtime';
import { markNotificationAsRead } from '../../firebase/firestore';
import type { NotificationDocument } from '../../types/firebaseModels';
import { LokhaLogo } from './LokhaLogo';
import {
  SAMPLE_RENT_LEASE_NOTIFICATIONS,
  APP_OFFERS_NOTIFICATIONS,
  APP_UPDATES_NOTIFICATIONS,
  getRentLeaseNotificationsForArea,
  type RentLeaseNotification
} from '../../services/notificationData';
import { isVercelOnly } from '../../services/mockAreaService';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, location?: string) => void;
  onSearch?: (query: string, location?: string) => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView: _currentView,
  onNavigate,
  onToggleSidebar
}) => {
  const { user, logout, loginAsDemoMember } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState<'rent' | 'offers' | 'updates' | 'personal'>('rent');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [personalNotifications, setPersonalNotifications] = useState<NotificationDocument[]>([]);

  // Real-time personal notification subscription (if authenticated)
  useEffect(() => {
    if (!user) {
      setPersonalNotifications([]);
      return;
    }

    const unsub = subscribeToNotifications(user.id, (liveNotifs) => {
      setPersonalNotifications(liveNotifs);
    });

    return () => unsub();
  }, [user]);

  const unreadPersonalCount = personalNotifications.filter(n => !n.isRead).length;
  const rentLeaseItems = isVercelOnly()
    ? getRentLeaseNotificationsForArea('Bengaluru')
    : SAMPLE_RENT_LEASE_NOTIFICATIONS;

  // Rent/lease new badges + offers badge + personal unread
  const totalAlertsCount = rentLeaseItems.filter(r => r.isNew).length +
    APP_OFFERS_NOTIFICATIONS.length +
    unreadPersonalCount;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handlePersonalNotificationClick = async (notif: NotificationDocument) => {
    if (user && !notif.isRead) {
      await markNotificationAsRead(user.id, notif.notificationId);
    }
    setNotifOpen(false);
    onNavigate('dashboard');
  };

  const handleRentPropertyClick = (_property: RentLeaseNotification) => {
    setNotifOpen(false);
    onNavigate('properties', _property.city);
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
      width: '100%',
      zIndex: 200,
      backgroundColor: 'var(--bg-glass, rgba(7, 7, 9, 0.95))',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(212, 175, 55, 0.16)',
      transition: 'all var(--transition-base)',
      height: '4.75rem',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="navbar-container" style={{
        width: '100%',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem'
      }}>
        {/* 1. App Logo & Optional Sidebar Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
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
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              title="Toggle Sidebar Navigation"
              aria-label="Toggle Sidebar"
            >
              <Menu size={19} />
            </button>
          )}

          <div
            onClick={() => onNavigate('home')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <div className="navbar-logo-desktop">
              <LokhaLogo variant="full" size="md" />
            </div>
            <div className="navbar-logo-mobile">
              <LokhaLogo variant="compact" size="sm" />
            </div>
          </div>
        </div>

        {/* Center: Clean Luxury Brand Status Pill */}
        <div className="navbar-status-pill" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(212, 175, 55, 0.06)',
            border: '1px solid rgba(212, 175, 55, 0.18)',
            fontSize: '0.75rem',
            color: 'var(--gold-primary)',
            letterSpacing: '0.04em'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#22C55E',
              boxShadow: '0 0 8px #22C55E'
            }} />
            <span style={{ fontWeight: 600 }}>Prime Real Estate & Rental Radar</span>
          </div>
        </div>

        {/* Right: App Notification Center & Profile / Auth Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
          {/* App Notification Center Button (Always Visible) */}
          <div style={{ position: 'relative' }}>
            <button
              className="navbar-alerts-btn"
              onClick={() => {
                setNotifOpen(!notifOpen);
                setDropdownOpen(false);
              }}
              style={{
                height: '40px',
                padding: '0 0.85rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: notifOpen ? 'rgba(212, 175, 55, 0.18)' : '#0E0E14',
                border: '1px solid rgba(212, 175, 55, 0.32)',
                color: notifOpen ? 'var(--gold-primary)' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all var(--transition-fast)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.45)'
              }}
              title="App Notifications & Local Rent Radar"
              aria-label="App Notifications"
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Bell size={17} color="var(--gold-primary)" />
                {totalAlertsCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-7px',
                    right: '-7px',
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--gold-primary)',
                    color: '#070709',
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    boxShadow: '0 0 8px rgba(212, 175, 55, 0.8)'
                  }}>
                    {totalAlertsCount > 9 ? '9+' : totalAlertsCount}
                  </span>
                )}
              </div>
              <span className="navbar-alerts-label" style={{
                fontSize: '0.775rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: '#FFFFFF'
              }}>
                Alerts & Offers
              </span>
            </button>

            {/* Rich App Notification Popover Menu */}
            {notifOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.75rem)',
                  right: 0,
                  width: '420px',
                  maxWidth: '92vw',
                  maxHeight: '560px',
                  backgroundColor: '#0F0F15',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: 'var(--radius-xl, 14px)',
                  boxShadow: '0 20px 48px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 220,
                  animation: 'fadeIn 160ms ease-out forwards',
                  overflow: 'hidden'
                }}
              >
                {/* Popover Header */}
                <div style={{
                  padding: '1rem 1.15rem 0.75rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  backgroundColor: 'rgba(212, 175, 55, 0.04)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sparkles size={16} color="var(--gold-primary)" />
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#FFFFFF', letterSpacing: '0.02em' }}>
                        LOKHA Radar & Updates
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        onNavigate('notifications');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--gold-primary)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <span>Full Page</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>

                  {/* Tabs Navigation */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    padding: '0.25rem',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <button
                      onClick={() => setActiveNotifTab('rent')}
                      style={{
                        flex: 1,
                        padding: '0.4rem 0.25rem',
                        borderRadius: 'var(--radius-sm, 6px)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        backgroundColor: activeNotifTab === 'rent' ? 'var(--gold-primary)' : 'transparent',
                        color: activeNotifTab === 'rent' ? '#070709' : 'var(--text-secondary)'
                      }}
                    >
                      Rent / Lease
                    </button>
                    <button
                      onClick={() => setActiveNotifTab('offers')}
                      style={{
                        flex: 1,
                        padding: '0.4rem 0.25rem',
                        borderRadius: 'var(--radius-sm, 6px)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        backgroundColor: activeNotifTab === 'offers' ? 'var(--gold-primary)' : 'transparent',
                        color: activeNotifTab === 'offers' ? '#070709' : 'var(--text-secondary)'
                      }}
                    >
                      Offers & Deals
                    </button>
                    <button
                      onClick={() => setActiveNotifTab('updates')}
                      style={{
                        flex: 1,
                        padding: '0.4rem 0.25rem',
                        borderRadius: 'var(--radius-sm, 6px)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        backgroundColor: activeNotifTab === 'updates' ? 'var(--gold-primary)' : 'transparent',
                        color: activeNotifTab === 'updates' ? '#070709' : 'var(--text-secondary)'
                      }}
                    >
                      App News
                    </button>
                    {user && (
                      <button
                        onClick={() => setActiveNotifTab('personal')}
                        style={{
                          flex: 1,
                          padding: '0.4rem 0.25rem',
                          borderRadius: 'var(--radius-sm, 6px)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          backgroundColor: activeNotifTab === 'personal' ? 'var(--gold-primary)' : 'transparent',
                          color: activeNotifTab === 'personal' ? '#070709' : 'var(--text-secondary)',
                          position: 'relative'
                        }}
                      >
                        Personal
                        {unreadPersonalCount > 0 && (
                          <span style={{
                            marginLeft: '4px',
                            padding: '1px 4px',
                            borderRadius: '10px',
                            backgroundColor: '#EF4444',
                            color: '#FFF',
                            fontSize: '0.55rem'
                          }}>
                            {unreadPersonalCount}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Popover Content Body */}
                <div style={{
                  padding: '0.85rem',
                  overflowY: 'auto',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}>
                  {/* TAB 1: RENT & LEASE IN THE AREA */}
                  {activeNotifTab === 'rent' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: 'var(--text-tertiary)',
                        padding: '0 0.25rem'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} color="var(--gold-primary)" />
                          Live Rent & Lease Radar
                        </span>
                        <span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>Newly Listed</span>
                      </div>

                      {rentLeaseItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => handleRentPropertyClick(item)}
                          style={{
                            display: 'flex',
                            gap: '0.75rem',
                            padding: '0.7rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(212, 175, 55, 0.16)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative'
                          }}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            style={{
                              width: '74px',
                              height: '74px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              flexShrink: 0
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <span style={{
                                fontSize: '0.62rem',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(212, 175, 55, 0.18)',
                                color: 'var(--gold-primary)',
                                fontWeight: 700
                              }}>
                                {item.bhk}
                              </span>
                              <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>
                                {item.postedAt}
                              </span>
                            </div>

                            <div style={{
                              fontSize: '0.825rem',
                              fontWeight: 700,
                              color: '#FFFFFF',
                              marginTop: '0.2rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {item.title}
                            </div>

                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.15rem' }}>
                              <MapPin size={11} color="var(--gold-primary)" />
                              <span>{item.locality}, {item.city}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                                {item.rentAmount}
                              </span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                                Dep: {item.depositAmount}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 2: OFFERS & DEALS */}
                  {activeNotifTab === 'offers' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {APP_OFFERS_NOTIFICATIONS.map(offer => (
                        <div
                          key={offer.id}
                          style={{
                            padding: '0.85rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'rgba(212, 175, 55, 0.05)',
                            border: '1px solid rgba(212, 175, 55, 0.25)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.45rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(212, 175, 55, 0.2)',
                              color: 'var(--gold-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Flame size={12} />
                              {offer.badge}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                              {offer.validUntil}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                            {offer.title}
                          </div>

                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                            {offer.description}
                          </div>

                          {offer.code && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              backgroundColor: 'rgba(0, 0, 0, 0.4)',
                              padding: '0.35rem 0.6rem',
                              borderRadius: '6px',
                              marginTop: '0.2rem',
                              border: '1px dashed rgba(212, 175, 55, 0.35)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Tag size={13} color="var(--gold-primary)" />
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--gold-primary)' }}>
                                  {offer.code}
                                </span>
                              </div>
                              <button
                                onClick={() => handleCopyCode(offer.code!)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: copiedCode === offer.code ? '#22C55E' : 'var(--gold-primary)',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                {copiedCode === offer.code ? (
                                  <>
                                    <Check size={12} />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={12} />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 3: APP NEWS & PLATFORM UPDATES */}
                  {activeNotifTab === 'updates' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {APP_UPDATES_NOTIFICATIONS.map(up => (
                        <div
                          key={up.id}
                          style={{
                            padding: '0.8rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.07)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                color: 'var(--gold-primary)',
                                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                                padding: '1px 6px',
                                borderRadius: '4px'
                              }}>
                                {up.version}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{up.date}</span>
                            </div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--gold-primary)', fontWeight: 600 }}>
                              {up.tag}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>
                            {up.title}
                          </div>

                          <ul style={{
                            margin: '0.2rem 0 0',
                            paddingLeft: '1.1rem',
                            fontSize: '0.725rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.45
                          }}>
                            {up.highlights.map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 4: PERSONAL (ONLY IF SIGNED IN) */}
                  {activeNotifTab === 'personal' && user && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {personalNotifications.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                          No personal inquiries or account alerts yet
                        </div>
                      ) : (
                        personalNotifications.slice(0, 8).map(n => (
                          <div
                            key={n.notificationId}
                            onClick={() => handlePersonalNotificationClick(n)}
                            style={{
                              padding: '0.65rem 0.75rem',
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
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.3 }}>
                                {n.message}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Popover Footer */}
                <div style={{
                  padding: '0.65rem 0.85rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  backgroundColor: '#09090C'
                }}>
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      onNavigate('notifications');
                    }}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(212, 175, 55, 0.12)',
                      border: '1px solid var(--border-gold, rgba(212, 175, 55, 0.35))',
                      color: 'var(--gold-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>View All in Notification Center</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Button / Join Lokha */}
          {!user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => {
                  loginAsDemoMember();
                  onNavigate('dashboard');
                }}
                className="btn btn-sm navbar-demo-btn"
                style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.22), rgba(212, 175, 55, 0.08))',
                  border: '1.5px solid var(--gold-primary)',
                  color: 'var(--gold-primary)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  boxShadow: '0 0 14px rgba(212, 175, 55, 0.3)'
                }}
                title="1-Click Instant Demo Access as Verified Member"
              >
                <Zap size={14} fill="var(--gold-primary)" />
                <span>Instant Demo</span>
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="btn btn-outline btn-sm navbar-signin-btn"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 1rem', fontSize: '0.8rem' }}
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="btn btn-primary btn-sm navbar-join-btn"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 1.1rem', fontSize: '0.8rem' }}
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
                <span className="navbar-username" style={{
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
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF' }}>
                      {user.displayName || 'Lokha Client'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                      {user.email}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <button
                      onClick={() => onNavigate('dashboard')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.6rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.825rem',
                        textAlign: 'left'
                      }}
                    >
                      <User size={16} />
                      <span>My Portfolio</span>
                    </button>

                    <button
                      onClick={() => onNavigate('settings')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.6rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.825rem',
                        textAlign: 'left'
                      }}
                    >
                      <Settings size={16} />
                      <span>Account Settings</span>
                    </button>

                    <button
                      onClick={() => onNavigate('notifications')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.6rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--gold-primary)',
                        backgroundColor: 'rgba(212, 175, 55, 0.06)',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.825rem',
                        textAlign: 'left'
                      }}
                    >
                      <Bell size={16} />
                      <span>Notification Radar</span>
                    </button>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', margin: '0.35rem 0' }} />

                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.6rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        color: '#EF4444',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.825rem',
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) {
          .navbar-status-pill {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .navbar-container {
            padding: 0 0.75rem !important;
            gap: 0.5rem !important;
          }
          .navbar-logo-desktop {
            display: none !important;
          }
          .navbar-logo-mobile {
            display: flex !important;
          }
          .navbar-username {
            display: none !important;
          }
        }
        @media (min-width: 641px) {
          .navbar-logo-desktop {
            display: flex !important;
          }
          .navbar-logo-mobile {
            display: none !important;
          }
        }
        @media (max-width: 580px) {
          .navbar-alerts-label {
            display: none !important;
          }
          .navbar-alerts-btn {
            padding: 0 0.6rem !important;
            height: 36px !important;
          }
          .navbar-demo-btn {
            padding: 0.35rem 0.65rem !important;
            font-size: 0.72rem !important;
            height: 36px !important;
          }
          .navbar-join-btn {
            display: none !important;
          }
          .navbar-signin-btn {
            padding: 0.35rem 0.75rem !important;
            font-size: 0.75rem !important;
            height: 36px !important;
          }
        }
      `}</style>
    </header>
  );
};
