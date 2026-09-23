import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Heart,
  Settings,
  LogOut,
  X,
  Menu,
  Sparkles,
  ExternalLink,
  Flame,
  Tag,
  Copy,
  Check,
  Building,
  Building2,
  Home,
  MapPin,
  CalendarCheck,
  TrendingUp,
  Calculator,
  Compass,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Layers,
  Briefcase,
  Hotel
} from 'lucide-react';
import { subscribeToNotifications } from '../../firebase/realtime';
import { markNotificationAsRead } from '../../firebase/firestore';
import type { NotificationDocument } from '../../types/firebaseModels';
import { LokhaLogo } from './LokhaLogo';
import {
  SAMPLE_RENT_LEASE_NOTIFICATIONS,
  APP_OFFERS_NOTIFICATIONS,
  APP_UPDATES_NOTIFICATIONS,
  getRentLeaseNotificationsForArea
} from '../../services/notificationData';
import { isVercelOnly } from '../../services/mockAreaService';

export interface NavFilterOptions {
  type?: string;
  listingType?: string;
  purpose?: string;
}

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, location?: string, filters?: NavFilterOptions) => void;
  onSearch?: (query: string, location?: string) => void;
  onToggleSidebar?: () => void;
}

type ActiveMegaMenu = 'properties' | 'buy' | 'rent' | 'lease' | 'hotels-pg' | 'builders' | 'about' | null;

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onSearch
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme !== 'light';

  // Scroll state for dynamic Apple navbar sizing
  const [scrolled, setScrolled] = useState(false);

  // Active mega menu panel
  const [activeMenu, setActiveMenu] = useState<ActiveMegaMenu>(null);
  const menuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search overlay state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Notification center state
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState<'rent' | 'offers' | 'updates' | 'personal'>('rent');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [personalNotifications, setPersonalNotifications] = useState<NotificationDocument[]>([]);

  // Profile dropdown state
  const [profileOpen, setProfileOpen] = useState(false);

  // Mobile navigation drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>('properties');

  // Container refs for outside click detection
  const navContainerRef = useRef<HTMLElement>(null);

  // 1. Dynamic Scroll Tracker
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Global Escape key and Click Outside handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setSearchOpen(false);
        setNotifOpen(false);
        setProfileOpen(false);
        setMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 3. Auto-focus search input when expanded
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 80);
    }
  }, [searchOpen]);

  // 4. Real-time Notifications Subscription
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

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    onNavigate('home');
  };

  // Hover handlers for Apple-style mega menu
  const handleMenuMouseEnter = (menu: ActiveMegaMenu) => {
    if (menuTimerRef.current) {
      clearTimeout(menuTimerRef.current);
    }
    setActiveMenu(menu);
  };

  const handleMenuMouseLeave = () => {
    menuTimerRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 180);
  };

  const closeAllMenus = () => {
    setActiveMenu(null);
    setSearchOpen(false);
    setNotifOpen(false);
    setProfileOpen(false);
    setMobileMenuOpen(false);
  };

  // Search submission
  const executeSearch = (queryToUse?: string) => {
    const q = (queryToUse !== undefined ? queryToUse : searchQuery).trim();
    closeAllMenus();
    if (onSearch) {
      onSearch(q);
    } else {
      onNavigate('properties', undefined, { type: undefined });
    }
  };

  return (
    <header
      ref={navContainerRef}
      onMouseLeave={handleMenuMouseLeave}
      style={{
        position: 'sticky',
        top: 0,
        width: '100%',
        zIndex: 250,
        backgroundColor: isDark
          ? (scrolled ? 'rgba(11, 11, 14, 0.92)' : 'rgba(11, 11, 14, 0.85)')
          : (scrolled ? 'rgba(250, 249, 246, 0.94)' : 'rgba(250, 249, 246, 0.88)'),
        backdropFilter: scrolled ? 'blur(28px)' : 'blur(20px)',
        WebkitBackdropFilter: scrolled ? 'blur(28px)' : 'blur(20px)',
        borderBottom: isDark
          ? '1px solid rgba(255, 255, 255, 0.08)'
          : '1px solid rgba(0, 0, 0, 0.07)',
        boxShadow: isDark
          ? (scrolled
              ? '0 12px 36px rgba(0, 0, 0, 0.55), 0 1px 0 rgba(212, 175, 55, 0.12)'
              : '0 4px 24px rgba(0, 0, 0, 0.35)')
          : (scrolled
              ? '0 8px 28px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(184, 134, 11, 0.15)'
              : '0 2px 14px rgba(0, 0, 0, 0.04)'),
        transition: 'all 260ms cubic-bezier(0.16, 1, 0.3, 1)',
        height: scrolled ? '3.75rem' : '4.5rem'
      }}
      className="apple-nav-header"
    >
      {/* Top Bar Edge-to-Edge Container */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        height: '100%',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        position: 'relative'
      }}>

        {/* ================= LEFT SECTION: LOKHA BRANDING ================= */}
        {/* Structure: [ Lokha Logo ] [ LOKHA ] \n REAL ESTATE & STAYS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          minWidth: '200px',
          flexShrink: 0
        }}>
          <button
            onClick={() => {
              closeAllMenus();
              onNavigate('home');
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              outline: 'none'
            }}
            aria-label="Lokha Home - Real Estate & Stays"
          >
            {/* Lokha Armillary Emblem (Icon-Only from existing Lokha design) */}
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <LokhaLogo variant="icon-only" size={scrolled ? 34 : 38} />
            </div>

            {/* Typography: [ LOKHA ] with subtle [ REAL ESTATE & STAYS ] below */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              textAlign: 'left'
            }}>
              <span style={{
                fontSize: scrolled ? '1.18rem' : '1.28rem',
                fontWeight: 800,
                letterSpacing: '0.14em',
                color: isDark ? '#FFFFFF' : '#18181B',
                lineHeight: 1.05,
                textTransform: 'uppercase',
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                transition: 'color 200ms ease'
              }}>
                LOKHA
              </span>
              <span style={{
                fontSize: '0.54rem',
                fontWeight: 700,
                letterSpacing: '0.22em',
                color: isDark ? 'rgba(212, 175, 55, 0.9)' : '#B8860B',
                textTransform: 'uppercase',
                lineHeight: 1,
                marginTop: '3px',
                transition: 'color 200ms ease'
              }}>
                REAL ESTATE & STAYS
              </span>
            </div>
          </button>
        </div>

        {/* ================= CENTER NAVIGATION (DESKTOP MEGA MENUS) ================= */}
        <nav
          className="apple-center-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            height: '100%',
            flex: 1,
            maxWidth: '740px'
          }}
          aria-label="Primary Navigation"
        >
          {/* 1. Home */}
          <button
            onClick={() => {
              closeAllMenus();
              onNavigate('home');
            }}
            onMouseEnter={() => handleMenuMouseEnter(null)}
            className={`apple-nav-item ${currentView === 'home' ? 'active' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem 0.8rem',
              fontSize: '0.86rem',
              fontWeight: currentView === 'home' ? 600 : 400,
              color: currentView === 'home'
                ? (isDark ? '#F5E6BE' : 'var(--gold-primary, #B8860B)')
                : (isDark ? 'rgba(255, 255, 255, 0.78)' : '#52525B'),
              transition: 'all 200ms ease',
              borderRadius: '8px',
              position: 'relative'
            }}
          >
            Home
            {currentView === 'home' && (
              <span style={{
                position: 'absolute',
                bottom: '4px',
                left: '25%',
                right: '25%',
                height: '2px',
                backgroundColor: 'var(--gold-primary, #D4AF37)',
                borderRadius: '999px',
                boxShadow: '0 0 8px rgba(212, 175, 55, 0.6)'
              }} />
            )}
          </button>

          {/* 2. Properties (Mega Menu) */}
          <div
            onMouseEnter={() => handleMenuMouseEnter('properties')}
            style={{ height: '100%', display: 'flex', alignItems: 'center' }}
          >
            <button
              onClick={() => {
                closeAllMenus();
                onNavigate('properties');
              }}
              className={`apple-nav-item ${activeMenu === 'properties' || currentView === 'properties' ? 'active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem 0.8rem',
                fontSize: '0.86rem',
                fontWeight: activeMenu === 'properties' || currentView === 'properties' ? 600 : 400,
                color: activeMenu === 'properties'
                  ? (isDark ? '#FFFFFF' : '#18181B')
                  : currentView === 'properties'
                  ? (isDark ? '#F5E6BE' : 'var(--gold-primary, #B8860B)')
                  : (isDark ? 'rgba(255, 255, 255, 0.78)' : '#52525B'),
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 200ms ease',
                borderRadius: '8px'
              }}
            >
              <span>Properties</span>
              <ChevronDown
                size={13}
                style={{
                  transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: activeMenu === 'properties' ? 'rotate(180deg)' : 'rotate(0deg)',
                  opacity: 0.7
                }}
              />
            </button>
          </div>

          {/* 3. Buy (Mega Menu) */}
          <div
            onMouseEnter={() => handleMenuMouseEnter('buy')}
            style={{ height: '100%', display: 'flex', alignItems: 'center' }}
          >
            <button
              onClick={() => {
                closeAllMenus();
                onNavigate('buy');
              }}
              className={`apple-nav-item ${activeMenu === 'buy' || currentView === 'buy' ? 'active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem 0.8rem',
                fontSize: '0.86rem',
                fontWeight: activeMenu === 'buy' || currentView === 'buy' ? 600 : 400,
                color: activeMenu === 'buy'
                  ? (isDark ? '#FFFFFF' : '#18181B')
                  : currentView === 'buy'
                  ? (isDark ? '#F5E6BE' : 'var(--gold-primary, #B8860B)')
                  : (isDark ? 'rgba(255, 255, 255, 0.78)' : '#52525B'),
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 200ms ease',
                borderRadius: '8px'
              }}
            >
              <span>Buy</span>
              <ChevronDown
                size={13}
                style={{
                  transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: activeMenu === 'buy' ? 'rotate(180deg)' : 'rotate(0deg)',
                  opacity: 0.7
                }}
              />
            </button>
          </div>

          {/* 4. Rent (Mega Menu) */}
          <div
            onMouseEnter={() => handleMenuMouseEnter('rent')}
            style={{ height: '100%', display: 'flex', alignItems: 'center' }}
          >
            <button
              onClick={() => {
                closeAllMenus();
                onNavigate('rent');
              }}
              className={`apple-nav-item ${activeMenu === 'rent' || currentView === 'rent' ? 'active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem 0.8rem',
                fontSize: '0.86rem',
                fontWeight: activeMenu === 'rent' || currentView === 'rent' ? 600 : 400,
                color: activeMenu === 'rent'
                  ? (isDark ? '#FFFFFF' : '#18181B')
                  : currentView === 'rent'
                  ? (isDark ? '#F5E6BE' : 'var(--gold-primary, #B8860B)')
                  : (isDark ? 'rgba(255, 255, 255, 0.78)' : '#52525B'),
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 200ms ease',
                borderRadius: '8px'
              }}
            >
              <span>Rent</span>
              <ChevronDown
                size={13}
                style={{
                  transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: activeMenu === 'rent' ? 'rotate(180deg)' : 'rotate(0deg)',
                  opacity: 0.7
                }}
              />
            </button>
          </div>

          {/* 5. Lease (Mega Menu) */}
          <div
            onMouseEnter={() => handleMenuMouseEnter('lease')}
            style={{ height: '100%', display: 'flex', alignItems: 'center' }}
          >
            <button
              onClick={() => {
                closeAllMenus();
                onNavigate('properties', undefined, { purpose: 'Lease' });
              }}
              className={`apple-nav-item ${activeMenu === 'lease' ? 'active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem 0.8rem',
                fontSize: '0.86rem',
                fontWeight: activeMenu === 'lease' ? 600 : 400,
                color: activeMenu === 'lease'
                  ? (isDark ? '#FFFFFF' : '#18181B')
                  : (isDark ? 'rgba(255, 255, 255, 0.78)' : '#52525B'),
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 200ms ease',
                borderRadius: '8px'
              }}
            >
              <span>Lease</span>
              <ChevronDown
                size={13}
                style={{
                  transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: activeMenu === 'lease' ? 'rotate(180deg)' : 'rotate(0deg)',
                  opacity: 0.7
                }}
              />
            </button>
          </div>

          {/* 6. Hotels & PG (Mega Menu) */}
          <div
            onMouseEnter={() => handleMenuMouseEnter('hotels-pg')}
            style={{ height: '100%', display: 'flex', alignItems: 'center' }}
          >
            <button
              onClick={() => {
                closeAllMenus();
                onNavigate('properties', undefined, { purpose: 'Stays' });
              }}
              className={`apple-nav-item ${activeMenu === 'hotels-pg' ? 'active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem 0.8rem',
                fontSize: '0.86rem',
                fontWeight: activeMenu === 'hotels-pg' ? 600 : 400,
                color: activeMenu === 'hotels-pg'
                  ? (isDark ? '#FFFFFF' : '#18181B')
                  : (isDark ? 'rgba(255, 255, 255, 0.78)' : '#52525B'),
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 200ms ease',
                borderRadius: '8px'
              }}
            >
              <span>Hotels & PG</span>
              <ChevronDown
                size={13}
                style={{
                  transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: activeMenu === 'hotels-pg' ? 'rotate(180deg)' : 'rotate(0deg)',
                  opacity: 0.7
                }}
              />
            </button>
          </div>

          {/* 7. Builders (Mega Menu) */}
          <div
            onMouseEnter={() => handleMenuMouseEnter('builders')}
            style={{ height: '100%', display: 'flex', alignItems: 'center' }}
          >
            <button
              onClick={() => {
                closeAllMenus();
                onNavigate('projects');
              }}
              className={`apple-nav-item ${activeMenu === 'builders' || currentView === 'projects' ? 'active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem 0.8rem',
                fontSize: '0.86rem',
                fontWeight: activeMenu === 'builders' || currentView === 'projects' ? 600 : 400,
                color: activeMenu === 'builders'
                  ? (isDark ? '#FFFFFF' : '#18181B')
                  : currentView === 'projects'
                  ? (isDark ? '#F5E6BE' : 'var(--gold-primary, #B8860B)')
                  : (isDark ? 'rgba(255, 255, 255, 0.78)' : '#52525B'),
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 200ms ease',
                borderRadius: '8px'
              }}
            >
              <span>Builders</span>
              <ChevronDown
                size={13}
                style={{
                  transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: activeMenu === 'builders' ? 'rotate(180deg)' : 'rotate(0deg)',
                  opacity: 0.7
                }}
              />
            </button>
          </div>

          {/* 8. About (Mega Menu) */}
          <div
            onMouseEnter={() => handleMenuMouseEnter('about')}
            style={{ height: '100%', display: 'flex', alignItems: 'center' }}
          >
            <button
              onClick={() => {
                closeAllMenus();
                onNavigate('about');
              }}
              className={`apple-nav-item ${activeMenu === 'about' || currentView === 'about' ? 'active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem 0.8rem',
                fontSize: '0.86rem',
                fontWeight: activeMenu === 'about' || currentView === 'about' ? 600 : 400,
                color: activeMenu === 'about'
                  ? (isDark ? '#FFFFFF' : '#18181B')
                  : currentView === 'about'
                  ? (isDark ? '#F5E6BE' : 'var(--gold-primary, #B8860B)')
                  : (isDark ? 'rgba(255, 255, 255, 0.78)' : '#52525B'),
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 200ms ease',
                borderRadius: '8px'
              }}
            >
              <span>About</span>
              <ChevronDown
                size={13}
                style={{
                  transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: activeMenu === 'about' ? 'rotate(180deg)' : 'rotate(0deg)',
                  opacity: 0.7
                }}
              />
            </button>
          </div>
        </nav>

        {/* ================= RIGHT SECTION: SEARCH, NOTIFICATIONS, THEME, PROFILE ================= */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          {/* A. Search Trigger Button */}
          <button
            onClick={() => {
              setSearchOpen(!searchOpen);
              setActiveMenu(null);
              setNotifOpen(false);
              setProfileOpen(false);
            }}
            className="apple-icon-btn"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: searchOpen
                ? 'rgba(212, 175, 55, 0.18)'
                : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
              border: searchOpen
                ? '1px solid rgba(212, 175, 55, 0.45)'
                : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'),
              color: searchOpen
                ? 'var(--gold-primary, #D4AF37)'
                : (isDark ? 'rgba(255, 255, 255, 0.8)' : '#3F3F46'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 200ms ease'
            }}
            title="Search Lokha"
            aria-label="Search"
          >
            {searchOpen ? <X size={16} /> : <Search size={16} />}
          </button>

          {/* B. Notifications Center Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setActiveMenu(null);
                setSearchOpen(false);
                setProfileOpen(false);
              }}
              className="apple-icon-btn"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: notifOpen
                  ? 'rgba(212, 175, 55, 0.18)'
                  : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
                border: notifOpen
                  ? '1px solid rgba(212, 175, 55, 0.45)'
                  : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'),
                color: notifOpen
                  ? 'var(--gold-primary, #D4AF37)'
                  : (isDark ? 'rgba(255, 255, 255, 0.8)' : '#3F3F46'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 200ms ease'
              }}
              title="Notifications Radar"
              aria-label="Notifications"
            >
              <Bell size={16} />
              {totalAlertsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--gold-primary, #D4AF37)',
                  color: '#070709',
                  fontSize: '0.6rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  boxShadow: '0 0 10px rgba(212, 175, 55, 0.8)'
                }}>
                  {totalAlertsCount > 9 ? '9+' : totalAlertsCount}
                </span>
              )}
            </button>

            {/* Notifications Popover Menu */}
            {notifOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.85rem)',
                  right: 0,
                  width: '420px',
                  maxWidth: '92vw',
                  maxHeight: '560px',
                  backgroundColor: isDark ? '#0F0F14' : '#FFFFFF',
                  border: isDark ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(184, 134, 11, 0.3)',
                  borderRadius: '16px',
                  boxShadow: isDark
                    ? '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.06)'
                    : '0 20px 48px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 320,
                  animation: 'appleMenuIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  overflow: 'hidden'
                }}
              >
                {/* Popover Header */}
                <div style={{
                  padding: '1rem 1.15rem 0.75rem',
                  borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
                  backgroundColor: isDark ? 'rgba(212, 175, 55, 0.04)' : 'rgba(184, 134, 11, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sparkles size={16} color="var(--gold-primary, #D4AF37)" />
                      <span style={{
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        color: isDark ? '#FFFFFF' : '#18181B',
                        letterSpacing: '0.02em'
                      }}>
                        LOKHA Radar & Alerts
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
                        color: 'var(--gold-primary, #D4AF37)',
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
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                    padding: '0.25rem',
                    borderRadius: '8px'
                  }}>
                    <button
                      onClick={() => setActiveNotifTab('rent')}
                      style={{
                        flex: 1,
                        padding: '0.4rem 0.25rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        backgroundColor: activeNotifTab === 'rent' ? 'var(--gold-primary, #D4AF37)' : 'transparent',
                        color: activeNotifTab === 'rent' ? '#070709' : (isDark ? 'rgba(255, 255, 255, 0.65)' : '#52525B')
                      }}
                    >
                      Rent / Lease
                    </button>
                    <button
                      onClick={() => setActiveNotifTab('offers')}
                      style={{
                        flex: 1,
                        padding: '0.4rem 0.25rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        backgroundColor: activeNotifTab === 'offers' ? 'var(--gold-primary, #D4AF37)' : 'transparent',
                        color: activeNotifTab === 'offers' ? '#070709' : (isDark ? 'rgba(255, 255, 255, 0.65)' : '#52525B')
                      }}
                    >
                      Offers
                    </button>
                    <button
                      onClick={() => setActiveNotifTab('updates')}
                      style={{
                        flex: 1,
                        padding: '0.4rem 0.25rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        backgroundColor: activeNotifTab === 'updates' ? 'var(--gold-primary, #D4AF37)' : 'transparent',
                        color: activeNotifTab === 'updates' ? '#070709' : (isDark ? 'rgba(255, 255, 255, 0.65)' : '#52525B')
                      }}
                    >
                      Platform
                    </button>
                    {user && (
                      <button
                        onClick={() => setActiveNotifTab('personal')}
                        style={{
                          flex: 1,
                          padding: '0.4rem 0.25rem',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          backgroundColor: activeNotifTab === 'personal' ? 'var(--gold-primary, #D4AF37)' : 'transparent',
                          color: activeNotifTab === 'personal' ? '#070709' : (isDark ? 'rgba(255, 255, 255, 0.65)' : '#52525B')
                        }}
                      >
                        Personal {unreadPersonalCount > 0 ? `(${unreadPersonalCount})` : ''}
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications Scroll Body */}
                <div style={{ padding: '0.85rem', overflowY: 'auto', maxHeight: '380px' }}>
                  {activeNotifTab === 'rent' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {rentLeaseItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setNotifOpen(false);
                            onNavigate('properties', item.city);
                          }}
                          style={{
                            display: 'flex',
                            gap: '0.75rem',
                            padding: '0.65rem',
                            borderRadius: '10px',
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.45)')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)')}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            style={{ width: '68px', height: '68px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'rgba(212, 175, 55, 0.18)', color: 'var(--gold-primary, #D4AF37)', fontWeight: 700 }}>
                                {item.bhk}
                              </span>
                              <span style={{ fontSize: '0.62rem', color: isDark ? 'rgba(255, 255, 255, 0.45)' : '#71717A' }}>{item.postedAt}</span>
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#FFFFFF' : '#18181B', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#52525B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.15rem' }}>
                              <MapPin size={11} color="var(--gold-primary, #D4AF37)" />
                              <span>{item.locality}, {item.city}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--gold-primary, #D4AF37)' }}>{item.rentAmount}</span>
                              <span style={{ fontSize: '0.65rem', color: isDark ? 'rgba(255, 255, 255, 0.45)' : '#71717A' }}>Dep: {item.depositAmount}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeNotifTab === 'offers' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {APP_OFFERS_NOTIFICATIONS.map(offer => (
                        <div
                          key={offer.id}
                          style={{
                            padding: '0.8rem',
                            borderRadius: '10px',
                            backgroundColor: isDark ? 'rgba(212, 175, 55, 0.05)' : 'rgba(184, 134, 11, 0.05)',
                            border: isDark ? '1px solid rgba(212, 175, 55, 0.22)' : '1px solid rgba(184, 134, 11, 0.22)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.64rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold-primary, #D4AF37)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Flame size={12} />
                              {offer.badge}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: isDark ? 'rgba(255, 255, 255, 0.45)' : '#71717A' }}>{offer.validUntil}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#FFFFFF' : '#18181B' }}>{offer.title}</div>
                          <div style={{ fontSize: '0.74rem', color: isDark ? 'rgba(255, 255, 255, 0.68)' : '#52525B', lineHeight: 1.35 }}>{offer.description}</div>
                          {offer.code && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.04)', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px dashed rgba(212, 175, 55, 0.4)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Tag size={13} color="var(--gold-primary, #D4AF37)" />
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--gold-primary, #D4AF37)' }}>{offer.code}</span>
                              </div>
                              <button
                                onClick={() => handleCopyCode(offer.code!)}
                                style={{ background: 'none', border: 'none', color: copiedCode === offer.code ? '#22C55E' : 'var(--gold-primary, #D4AF37)', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                              >
                                {copiedCode === offer.code ? <><Check size={12} /><span>Copied</span></> : <><Copy size={12} /><span>Copy</span></>}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeNotifTab === 'updates' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {APP_UPDATES_NOTIFICATIONS.map(up => (
                        <div
                          key={up.id}
                          style={{
                            padding: '0.8rem',
                            borderRadius: '10px',
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.35rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--gold-primary, #D4AF37)', backgroundColor: 'rgba(212, 175, 55, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                              {up.version}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: isDark ? 'rgba(255, 255, 255, 0.45)' : '#71717A' }}>{up.date}</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#FFFFFF' : '#18181B' }}>{up.title}</div>
                          <ul style={{ margin: '0.2rem 0 0', paddingLeft: '1.1rem', fontSize: '0.72rem', color: isDark ? 'rgba(255, 255, 255, 0.65)' : '#52525B', lineHeight: 1.45 }}>
                            {up.highlights.map((n: string, idx: number) => (
                              <li key={idx}>{n}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeNotifTab === 'personal' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {personalNotifications.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: isDark ? 'rgba(255, 255, 255, 0.45)' : '#71717A', fontSize: '0.8rem' }}>
                          No personal notifications at this time.
                        </div>
                      ) : (
                        personalNotifications.map(notif => (
                          <div
                            key={notif.notificationId}
                            onClick={() => handlePersonalNotificationClick(notif)}
                            style={{
                              padding: '0.75rem',
                              borderRadius: '10px',
                              backgroundColor: notif.isRead
                                ? (isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)')
                                : 'rgba(212, 175, 55, 0.08)',
                              border: notif.isRead
                                ? (isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)')
                                : '1px solid rgba(212, 175, 55, 0.3)',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#FFFFFF' : '#18181B' }}>{notif.title}</div>
                            <div style={{ fontSize: '0.72rem', color: isDark ? 'rgba(255, 255, 255, 0.65)' : '#52525B', marginTop: '0.2rem' }}>{notif.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Popover Footer */}
                <div style={{
                  padding: '0.65rem 0.85rem',
                  borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
                  backgroundColor: isDark ? '#09090C' : '#FAF9F6'
                }}>
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      onNavigate('notifications');
                    }}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(212, 175, 55, 0.12)',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      color: 'var(--gold-primary, #D4AF37)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <span>View All in Notification Center</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* C. Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="apple-icon-btn"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
              color: isDark ? 'rgba(255, 255, 255, 0.85)' : '#27272A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 200ms ease'
            }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="#F59E0B" />}
          </button>

          {/* D. Login / Profile Button */}
          {!user ? (
            <div className="apple-auth-btns" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={() => {
                  closeAllMenus();
                  onNavigate('login');
                }}
                style={{
                  background: 'transparent',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.15)',
                  color: isDark ? '#FFFFFF' : '#18181B',
                  padding: '0.4rem 0.95rem',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--gold-primary, #D4AF37)';
                  e.currentTarget.style.color = isDark ? '#F5E6BE' : '#B8860B';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.color = isDark ? '#FFFFFF' : '#18181B';
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  closeAllMenus();
                  onNavigate('signup');
                }}
                style={{
                  background: 'var(--gold-gradient, linear-gradient(135deg, #F7E7BA 0%, #D4AF37 50%, #A87919 100%))',
                  border: 'none',
                  color: '#070709',
                  padding: '0.45rem 1.1rem',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(212, 175, 55, 0.3)',
                  transition: 'opacity 200ms ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setActiveMenu(null);
                  setSearchOpen(false);
                  setNotifOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.3rem 0.75rem 0.3rem 0.35rem',
                  borderRadius: '999px',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  border: profileOpen
                    ? '1px solid rgba(212, 175, 55, 0.45)'
                    : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'),
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
                aria-label="User Profile Menu"
              >
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'var(--gold-gradient, linear-gradient(135deg, #F7E7BA 0%, #D4AF37 50%, #A87919 100%))',
                  color: '#070709',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.8rem'
                }}>
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'L'}
                </div>
                <span className="apple-profile-name" style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: isDark ? '#FFFFFF' : '#18181B',
                  maxWidth: '90px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user.displayName || 'Member'}
                </span>
                <ChevronDown size={13} color="var(--gold-primary, #D4AF37)" />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.75rem)',
                    right: 0,
                    width: '240px',
                    backgroundColor: isDark ? '#0F0F14' : '#FFFFFF',
                    border: isDark ? '1px solid rgba(212, 175, 55, 0.28)' : '1px solid rgba(184, 134, 11, 0.25)',
                    borderRadius: '16px',
                    boxShadow: isDark
                      ? '0 20px 48px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.06)'
                      : '0 16px 36px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                    padding: '0.5rem',
                    zIndex: 320,
                    animation: 'appleMenuIn 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
                  }}
                >
                  <div style={{ padding: '0.75rem', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)', marginBottom: '0.35rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: isDark ? '#FFFFFF' : '#18181B' }}>
                      {user.displayName || 'Lokha Client'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: isDark ? 'rgba(255, 255, 255, 0.5)' : '#71717A', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onNavigate('dashboard');
                      }}
                      className={`apple-profile-link ${isDark ? 'dark' : 'light'}`}
                    >
                      <User size={15} color="var(--gold-primary, #D4AF37)" />
                      <span>Profile & Overview</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onNavigate('dashboard');
                      }}
                      className={`apple-profile-link ${isDark ? 'dark' : 'light'}`}
                    >
                      <Building size={15} />
                      <span>My Properties</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onNavigate('saved');
                      }}
                      className={`apple-profile-link ${isDark ? 'dark' : 'light'}`}
                    >
                      <Heart size={15} />
                      <span>Saved Properties</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onNavigate('dashboard');
                      }}
                      className={`apple-profile-link ${isDark ? 'dark' : 'light'}`}
                    >
                      <CalendarCheck size={15} />
                      <span>Inquiries & Chats</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onNavigate('settings');
                      }}
                      className={`apple-profile-link ${isDark ? 'dark' : 'light'}`}
                    >
                      <Settings size={15} />
                      <span>Settings</span>
                    </button>

                    <div style={{ borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)', margin: '0.35rem 0' }} />

                    <button
                      onClick={handleLogout}
                      className={`apple-profile-link ${isDark ? 'dark' : 'light'}`}
                      style={{ color: '#EF4444' }}
                    >
                      <LogOut size={15} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* E. Mobile Menu Toggle Button */}
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setActiveMenu(null);
              setSearchOpen(false);
              setNotifOpen(false);
              setProfileOpen(false);
            }}
            className="apple-mobile-menu-btn"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: mobileMenuOpen
                ? 'rgba(212, 175, 55, 0.18)'
                : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
              border: mobileMenuOpen
                ? '1px solid rgba(212, 175, 55, 0.45)'
                : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'),
              color: mobileMenuOpen ? 'var(--gold-primary, #D4AF37)' : (isDark ? '#FFFFFF' : '#18181B'),
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 200ms ease'
            }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ================= EXPANDABLE APPLE-STYLE MEGA PANELS ================= */}

      {/* 1. PROPERTIES MEGA PANEL */}
      {activeMenu === 'properties' && (
        <div
          onMouseEnter={() => handleMenuMouseEnter('properties')}
          onMouseLeave={handleMenuMouseLeave}
          className={`apple-mega-panel ${isDark ? 'dark' : 'light'}`}
        >
          <div className="apple-mega-inner">
            <div className="apple-mega-column">
              <span className={`apple-mega-heading ${isDark ? 'dark' : 'light'}`}>Property Types</span>
              <div className="apple-mega-links">
                <button onClick={() => { closeAllMenus(); onNavigate('properties'); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">All Properties</span>
                  <span className="apple-link-sub">Browse total curated inventory</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { type: 'Apartment' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Apartments</span>
                  <span className="apple-link-sub">Penthouses, high-rises & duplexes</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { type: 'Villa' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Villas</span>
                  <span className="apple-link-sub">Independent luxury gated estates</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { type: 'House' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Houses</span>
                  <span className="apple-link-sub">Private bungalows & townhomes</span>
                </button>
              </div>
            </div>

            <div className="apple-mega-column">
              <span className={`apple-mega-heading ${isDark ? 'dark' : 'light'}`}>Commercial & Land</span>
              <div className="apple-mega-links">
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { type: 'Plots' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Plots</span>
                  <span className="apple-link-sub">Freehold plots & corner parcels</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { type: 'Commercial' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Commercial</span>
                  <span className="apple-link-sub">Retail, tech hubs & showrooms</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { type: 'Office' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Offices</span>
                  <span className="apple-link-sub">Grade-A corporate office suites</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { type: 'Shop' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Shops</span>
                  <span className="apple-link-sub">High footfall retail storefronts</span>
                </button>
              </div>
            </div>

            <div className={`apple-mega-feature-card ${isDark ? 'dark' : 'light'}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--gold-primary, #D4AF37)', fontSize: '0.72rem', fontWeight: 800 }}>
                <Sparkles size={14} />
                <span>RADAR SPOTLIGHT</span>
              </div>
              <h4 style={{ color: isDark ? '#FFFFFF' : '#18181B', fontSize: '0.95rem', fontWeight: 700, margin: '0.4rem 0 0.25rem' }}>
                Interactive Map Radar
              </h4>
              <p style={{ color: isDark ? 'rgba(255, 255, 255, 0.65)' : '#52525B', fontSize: '0.75rem', lineHeight: 1.4, margin: '0 0 0.75rem' }}>
                Locate premium properties with GPS precision, metro proximity, and school zones.
              </p>
              <button
                onClick={() => { closeAllMenus(); onNavigate('map'); }}
                className="apple-mega-feature-btn"
              >
                <span>Launch GPS Map</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. BUY MEGA PANEL */}
      {activeMenu === 'buy' && (
        <div
          onMouseEnter={() => handleMenuMouseEnter('buy')}
          onMouseLeave={handleMenuMouseLeave}
          className={`apple-mega-panel ${isDark ? 'dark' : 'light'}`}
        >
          <div className="apple-mega-inner">
            <div className="apple-mega-column">
              <span className={`apple-mega-heading ${isDark ? 'dark' : 'light'}`}>Buy Residential</span>
              <div className="apple-mega-links">
                <button onClick={() => { closeAllMenus(); onNavigate('buy'); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Buy Property</span>
                  <span className="apple-link-sub">Complete buying directory</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Buy', type: 'Apartment' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Apartments for Sale</span>
                  <span className="apple-link-sub">Ready to move & under construction</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Buy', type: 'Villa' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Villas for Sale</span>
                  <span className="apple-link-sub">Exclusive gated villa communities</span>
                </button>
              </div>
            </div>

            <div className="apple-mega-column">
              <span className={`apple-mega-heading ${isDark ? 'dark' : 'light'}`}>Land & Commercial Sale</span>
              <div className="apple-mega-links">
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Buy', type: 'House' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Houses for Sale</span>
                  <span className="apple-link-sub">Independent duplexes and homes</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Buy', type: 'Plots' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Plots for Sale</span>
                  <span className="apple-link-sub">Approved residential parcels</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Buy', type: 'Commercial' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Commercial for Sale</span>
                  <span className="apple-link-sub">Pre-leased high yield commercial assets</span>
                </button>
              </div>
            </div>

            <div className={`apple-mega-feature-card ${isDark ? 'dark' : 'light'}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--gold-primary, #D4AF37)', fontSize: '0.72rem', fontWeight: 800 }}>
                <Calculator size={14} />
                <span>BUYER TOOLS</span>
              </div>
              <h4 style={{ color: isDark ? '#FFFFFF' : '#18181B', fontSize: '0.95rem', fontWeight: 700, margin: '0.4rem 0 0.25rem' }}>
                Home Loan EMI Calculator
              </h4>
              <p style={{ color: isDark ? 'rgba(255, 255, 255, 0.65)' : '#52525B', fontSize: '0.75rem', lineHeight: 1.4, margin: '0 0 0.75rem' }}>
                Calculate monthly installments, interest rates, and loan eligibility instantly.
              </p>
              <button
                onClick={() => { closeAllMenus(); onNavigate('emi-calculator'); }}
                className="apple-mega-feature-btn"
              >
                <span>Calculate EMI</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. RENT MEGA PANEL */}
      {activeMenu === 'rent' && (
        <div
          onMouseEnter={() => handleMenuMouseEnter('rent')}
          onMouseLeave={handleMenuMouseLeave}
          className={`apple-mega-panel ${isDark ? 'dark' : 'light'}`}
        >
          <div className="apple-mega-inner">
            <div className="apple-mega-column">
              <span className={`apple-mega-heading ${isDark ? 'dark' : 'light'}`}>Rent Homes</span>
              <div className="apple-mega-links">
                <button onClick={() => { closeAllMenus(); onNavigate('rent'); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Rent Property</span>
                  <span className="apple-link-sub">Curated verified luxury rentals</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Rent', type: 'Apartment' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Apartments for Rent</span>
                  <span className="apple-link-sub">Fully furnished & semi-furnished flats</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Rent', type: 'House' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Houses for Rent</span>
                  <span className="apple-link-sub">Spacious family houses with lawns</span>
                </button>
              </div>
            </div>

            <div className="apple-mega-column">
              <span className={`apple-mega-heading ${isDark ? 'dark' : 'light'}`}>Villas & Commercial</span>
              <div className="apple-mega-links">
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Rent', type: 'Villa' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Villas for Rent</span>
                  <span className="apple-link-sub">Private pool villas & club access</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Rent', type: 'Commercial' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Commercial Rentals</span>
                  <span className="apple-link-sub">Furnished offices & shop units</span>
                </button>
              </div>
            </div>

            <div className={`apple-mega-feature-card ${isDark ? 'dark' : 'light'}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--gold-primary, #D4AF37)', fontSize: '0.72rem', fontWeight: 800 }}>
                <KeyRound size={14} />
                <span>EXECUTIVE LEASING</span>
              </div>
              <h4 style={{ color: isDark ? '#FFFFFF' : '#18181B', fontSize: '0.95rem', fontWeight: 700, margin: '0.4rem 0 0.25rem' }}>
                Rent Radar & Inspections
              </h4>
              <p style={{ color: isDark ? 'rgba(255, 255, 255, 0.65)' : '#52525B', fontSize: '0.75rem', lineHeight: 1.4, margin: '0 0 0.75rem' }}>
                Schedule personal visits and explore live rental yield heatmaps.
              </p>
              <button
                onClick={() => { closeAllMenus(); onNavigate('site-visits'); }}
                className="apple-mega-feature-btn"
              >
                <span>Schedule Visit</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. LEASE MEGA PANEL */}
      {activeMenu === 'lease' && (
        <div
          onMouseEnter={() => handleMenuMouseEnter('lease')}
          onMouseLeave={handleMenuMouseLeave}
          className={`apple-mega-panel ${isDark ? 'dark' : 'light'}`}
        >
          <div className="apple-mega-inner">
            <div className="apple-mega-column">
              <span className={`apple-mega-heading ${isDark ? 'dark' : 'light'}`}>Lease Opportunities</span>
              <div className="apple-mega-links">
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Lease' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Lease Property</span>
                  <span className="apple-link-sub">Structured long-term lease estates</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Lease' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Long-term Lease</span>
                  <span className="apple-link-sub">3-year to 9-year locked terms</span>
                </button>
              </div>
            </div>

            <div className="apple-mega-column">
              <span className={`apple-mega-heading ${isDark ? 'dark' : 'light'}`}>Commercial & Land</span>
              <div className="apple-mega-links">
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Lease', type: 'Commercial' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Commercial Lease</span>
                  <span className="apple-link-sub">Corporate HQs & tech park spaces</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Lease', type: 'Plots' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Land Lease</span>
                  <span className="apple-link-sub">Industrial, solar & farm leases</span>
                </button>
              </div>
            </div>

            <div className={`apple-mega-feature-card ${isDark ? 'dark' : 'light'}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--gold-primary, #D4AF37)', fontSize: '0.72rem', fontWeight: 800 }}>
                <ShieldCheck size={14} />
                <span>LEGAL ASSURANCE</span>
              </div>
              <h4 style={{ color: isDark ? '#FFFFFF' : '#18181B', fontSize: '0.95rem', fontWeight: 700, margin: '0.4rem 0 0.25rem' }}>
                Corporate Advisory
              </h4>
              <p style={{ color: isDark ? 'rgba(255, 255, 255, 0.65)' : '#52525B', fontSize: '0.75rem', lineHeight: 1.4, margin: '0 0 0.75rem' }}>
                Vetted lease agreements, stamp duty assistance & legal compliance check.
              </p>
              <button
                onClick={() => { closeAllMenus(); onNavigate('insights'); }}
                className="apple-mega-feature-btn"
              >
                <span>Read Legal Guides</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. HOTELS & PG MEGA PANEL */}
      {activeMenu === 'hotels-pg' && (
        <div
          onMouseEnter={() => handleMenuMouseEnter('hotels-pg')}
          onMouseLeave={handleMenuMouseLeave}
          className={`apple-mega-panel ${isDark ? 'dark' : 'light'}`}
        >
          <div className="apple-mega-inner">
            <div className="apple-mega-column">
              <span className={`apple-mega-heading ${isDark ? 'dark' : 'light'}`}>Hospitality & Short Stays</span>
              <div className="apple-mega-links">
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Stays' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Hotels</span>
                  <span className="apple-link-sub">Boutique luxury resorts and hotel suites</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Stays', type: 'Apartment' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Serviced Apartments</span>
                  <span className="apple-link-sub">Kitchen equipped extended stays</span>
                </button>
              </div>
            </div>

            <div className="apple-mega-column">
              <span className={`apple-mega-heading ${isDark ? 'dark' : 'light'}`}>Shared & Student Living</span>
              <div className="apple-mega-links">
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Stays' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">PG</span>
                  <span className="apple-link-sub">Co-living paying guest accommodations</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Stays' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Hostels</span>
                  <span className="apple-link-sub">Youth & professional hostels with WiFi & food</span>
                </button>
              </div>
            </div>

            <div className={`apple-mega-feature-card ${isDark ? 'dark' : 'light'}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--gold-primary, #D4AF37)', fontSize: '0.72rem', fontWeight: 800 }}>
                <Hotel size={14} />
                <span>FLEXIBLE LIVING</span>
              </div>
              <h4 style={{ color: isDark ? '#FFFFFF' : '#18181B', fontSize: '0.95rem', fontWeight: 700, margin: '0.4rem 0 0.25rem' }}>
                Instant Verified Stays
              </h4>
              <p style={{ color: isDark ? 'rgba(255, 255, 255, 0.65)' : '#52525B', fontSize: '0.75rem', lineHeight: 1.4, margin: '0 0 0.75rem' }}>
                Zero brokerage, high speed fiber internet, verified housekeepers, and flexible deposit terms.
              </p>
              <button
                onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Stays' }); }}
                className="apple-mega-feature-btn"
              >
                <span>Browse Stays</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. BUILDERS MEGA PANEL */}
      {activeMenu === 'builders' && (
        <div
          onMouseEnter={() => handleMenuMouseEnter('builders')}
          onMouseLeave={handleMenuMouseLeave}
          className={`apple-mega-panel ${isDark ? 'dark' : 'light'}`}
        >
          <div className="apple-mega-inner">
            <div className="apple-mega-column">
              <span className={`apple-mega-heading ${isDark ? 'dark' : 'light'}`}>Developer Ecosystem</span>
              <div className="apple-mega-links">
                <button onClick={() => { closeAllMenus(); onNavigate('agencies'); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Builder Listings</span>
                  <span className="apple-link-sub">Top tier RERA approved developers</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('projects'); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">New Projects</span>
                  <span className="apple-link-sub">Townships, high-rise launches & phases</span>
                </button>
              </div>
            </div>

            <div className="apple-mega-column">
              <span className={`apple-mega-heading ${isDark ? 'dark' : 'light'}`}>Land & Allotments</span>
              <div className="apple-mega-links">
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { type: 'Plots' }); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Land Offers</span>
                  <span className="apple-link-sub">Joint ventures & prime parcel acquisitions</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('list-property'); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Available Slots</span>
                  <span className="apple-link-sub">List developer project units on Lokha</span>
                </button>
              </div>
            </div>

            <div className={`apple-mega-feature-card ${isDark ? 'dark' : 'light'}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--gold-primary, #D4AF37)', fontSize: '0.72rem', fontWeight: 800 }}>
                <Building2 size={14} />
                <span>RERA VERIFIED</span>
              </div>
              <h4 style={{ color: isDark ? '#FFFFFF' : '#18181B', fontSize: '0.95rem', fontWeight: 700, margin: '0.4rem 0 0.25rem' }}>
                Certified Real Estate Advisors
              </h4>
              <p style={{ color: isDark ? 'rgba(255, 255, 255, 0.65)' : '#52525B', fontSize: '0.75rem', lineHeight: 1.4, margin: '0 0 0.75rem' }}>
                Connect directly with authorized project consultants and builder relationship managers.
              </p>
              <button
                onClick={() => { closeAllMenus(); onNavigate('agents'); }}
                className="apple-mega-feature-btn"
              >
                <span>Consult Advisor</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. ABOUT MEGA PANEL */}
      {activeMenu === 'about' && (
        <div
          onMouseEnter={() => handleMenuMouseEnter('about')}
          onMouseLeave={handleMenuMouseLeave}
          className={`apple-mega-panel ${isDark ? 'dark' : 'light'}`}
        >
          <div className="apple-mega-inner">
            <div className="apple-mega-column">
              <span className={`apple-mega-heading ${isDark ? 'dark' : 'light'}`}>The Brand</span>
              <div className="apple-mega-links">
                <button onClick={() => { closeAllMenus(); onNavigate('about'); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">About Lokha</span>
                  <span className="apple-link-sub">Our vision for ultra-luxury real estate</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('contact'); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Private Concierge Hotline</span>
                  <span className="apple-link-sub">Dedicated high-net-worth client support</span>
                </button>
              </div>
            </div>

            <div className="apple-mega-column">
              <span className={`apple-mega-heading ${isDark ? 'dark' : 'light'}`}>Intelligence & Hubs</span>
              <div className="apple-mega-links">
                <button onClick={() => { closeAllMenus(); onNavigate('insights'); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">Legal Guides & Stamp Duty</span>
                  <span className="apple-link-sub">State regulations, RERA guidelines & tax rules</span>
                </button>
                <button onClick={() => { closeAllMenus(); onNavigate('locations'); }} className={`apple-mega-link ${isDark ? 'dark' : 'light'}`}>
                  <span className="apple-link-title">City Hubs & Circle Rates</span>
                  <span className="apple-link-sub">Micro-market reports for premier metro areas</span>
                </button>
              </div>
            </div>

            <div className={`apple-mega-feature-card ${isDark ? 'dark' : 'light'}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--gold-primary, #D4AF37)', fontSize: '0.72rem', fontWeight: 800 }}>
                <TrendingUp size={14} />
                <span>VALUATION ENGINE</span>
              </div>
              <h4 style={{ color: isDark ? '#FFFFFF' : '#18181B', fontSize: '0.95rem', fontWeight: 700, margin: '0.4rem 0 0.25rem' }}>
                AI Home Valuation
              </h4>
              <p style={{ color: isDark ? 'rgba(255, 255, 255, 0.65)' : '#52525B', fontSize: '0.75rem', lineHeight: 1.4, margin: '0 0 0.75rem' }}>
                Estimate fair market value for any luxury property based on current registration registry data.
              </p>
              <button
                onClick={() => { closeAllMenus(); onNavigate('home-valuation'); }}
                className="apple-mega-feature-btn"
              >
                <span>Check Valuation</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= APPLE-STYLE EXPANDABLE SEARCH OVERLAY ================= */}
      {searchOpen && (
        <div
          className="apple-search-overlay"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: isDark ? '#0A0A0E' : '#FFFFFF',
            borderBottom: isDark ? '1px solid rgba(212, 175, 55, 0.35)' : '1px solid rgba(184, 134, 11, 0.35)',
            boxShadow: isDark
              ? '0 28px 60px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              : '0 20px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)',
            padding: '1.5rem 1.5rem 1.75rem',
            animation: 'appleSearchSlideDown 240ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
            zIndex: 300
          }}
        >
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeSearch();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.03)',
                border: isDark ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(184, 134, 11, 0.4)',
                borderRadius: '14px',
                padding: '0.75rem 1.15rem',
                boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 2px 10px rgba(0, 0, 0, 0.06)'
              }}
            >
              <Search size={20} color="var(--gold-primary, #D4AF37)" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search luxury properties, locations, hotels, PGs, builders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#FFFFFF' : '#18181B',
                  fontSize: '1.05rem',
                  outline: 'none',
                  fontWeight: 500
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: isDark ? 'rgba(255, 255, 255, 0.5)' : '#71717A', cursor: 'pointer', padding: 0 }}
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                style={{
                  background: 'var(--gold-gradient, linear-gradient(135deg, #F7E7BA 0%, #D4AF37 50%, #A87919 100%))',
                  border: 'none',
                  color: '#070709',
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Search
              </button>
            </form>

            {/* Quick Suggestion Pills */}
            <div style={{ marginTop: '1.15rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? 'rgba(255, 255, 255, 0.45)' : '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Quick Suggestions & Categories
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {[
                  { label: 'Luxury Villas in Bengaluru', q: 'Villa', loc: 'Bengaluru' },
                  { label: 'Penthouses in Mumbai', q: 'Apartment', loc: 'Mumbai' },
                  { label: 'Commercial Offices', q: 'Office', loc: '' },
                  { label: 'Hotels & PG Stays', q: 'Stays', loc: '' },
                  { label: 'Plots in Chennai', q: 'Plot', loc: 'Chennai' },
                  { label: 'Township Projects', q: 'Project', loc: '' }
                ].map(sug => (
                  <button
                    key={sug.label}
                    type="button"
                    onClick={() => {
                      executeSearch(sug.q);
                    }}
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                      color: isDark ? 'rgba(255, 255, 255, 0.8)' : '#3F3F46',
                      padding: '0.35rem 0.8rem',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--gold-primary, #D4AF37)';
                      e.currentTarget.style.color = isDark ? '#F5E6BE' : '#B8860B';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
                      e.currentTarget.style.color = isDark ? 'rgba(255, 255, 255, 0.8)' : '#3F3F46';
                    }}
                  >
                    {sug.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE FLOATING NAVIGATION DRAWER ================= */}
      {mobileMenuOpen && (
        <div
          className="apple-mobile-drawer"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: isDark ? '#0C0C10' : '#FAF9F6',
            borderBottom: isDark ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(184, 134, 11, 0.25)',
            boxShadow: isDark ? '0 30px 60px rgba(0, 0, 0, 0.9)' : '0 20px 40px rgba(0, 0, 0, 0.15)',
            maxHeight: 'calc(100vh - 4.5rem)',
            overflowY: 'auto',
            padding: '1.25rem 1rem 2rem',
            animation: 'appleSearchSlideDown 240ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
            zIndex: 290
          }}
        >
          {/* Quick Mobile Search */}
          <div style={{ marginBottom: '1rem' }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeSearch();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '10px',
                padding: '0.55rem 0.85rem'
              }}
            >
              <Search size={16} color="var(--gold-primary, #D4AF37)" />
              <input
                type="text"
                placeholder="Search properties, builders, stays..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, background: 'none', border: 'none', color: isDark ? '#FFFFFF' : '#18181B', fontSize: '0.88rem', outline: 'none' }}
              />
            </form>
          </div>

          {/* Group 1: Home */}
          <button
            onClick={() => {
              closeAllMenus();
              onNavigate('home');
            }}
            className="apple-mobile-link-main"
            style={{ borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Home size={17} color="var(--gold-primary, #D4AF37)" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#FFFFFF' : '#18181B' }}>Home</span>
            </div>
            <ArrowRight size={14} color={isDark ? 'rgba(255, 255, 255, 0.4)' : '#71717A'} />
          </button>

          {/* Group 2: Properties Accordion */}
          <div className="apple-mobile-accordion" style={{ borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)' }}>
            <button
              onClick={() => setMobileExpandedGroup(mobileExpandedGroup === 'properties' ? null : 'properties')}
              className="apple-mobile-accordion-header"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Layers size={17} color="var(--gold-primary, #D4AF37)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#FFFFFF' : '#18181B' }}>Properties</span>
              </div>
              <ChevronDown
                size={16}
                color={isDark ? 'rgba(255, 255, 255, 0.5)' : '#71717A'}
                style={{ transform: mobileExpandedGroup === 'properties' ? 'rotate(180deg)' : 'rotate(0)' }}
              />
            </button>
            {mobileExpandedGroup === 'properties' && (
              <div className="apple-mobile-sublinks">
                <button onClick={() => { closeAllMenus(); onNavigate('properties'); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>All Properties</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { type: 'Apartment' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Apartments</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { type: 'Villa' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Villas</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { type: 'House' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Houses</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { type: 'Plots' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Plots</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { type: 'Commercial' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Commercial</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { type: 'Office' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Offices</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { type: 'Shop' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Shops</button>
              </div>
            )}
          </div>

          {/* Group 3: Buy Accordion */}
          <div className="apple-mobile-accordion" style={{ borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)' }}>
            <button
              onClick={() => setMobileExpandedGroup(mobileExpandedGroup === 'buy' ? null : 'buy')}
              className="apple-mobile-accordion-header"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Building size={17} color="var(--gold-primary, #D4AF37)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#FFFFFF' : '#18181B' }}>Buy</span>
              </div>
              <ChevronDown
                size={16}
                color={isDark ? 'rgba(255, 255, 255, 0.5)' : '#71717A'}
                style={{ transform: mobileExpandedGroup === 'buy' ? 'rotate(180deg)' : 'rotate(0)' }}
              />
            </button>
            {mobileExpandedGroup === 'buy' && (
              <div className="apple-mobile-sublinks">
                <button onClick={() => { closeAllMenus(); onNavigate('buy'); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Buy Property</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Buy', type: 'Apartment' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Apartments for Sale</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Buy', type: 'Villa' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Villas for Sale</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Buy', type: 'House' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Houses for Sale</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Buy', type: 'Plots' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Plots for Sale</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Buy', type: 'Commercial' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Commercial for Sale</button>
              </div>
            )}
          </div>

          {/* Group 4: Rent Accordion */}
          <div className="apple-mobile-accordion" style={{ borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)' }}>
            <button
              onClick={() => setMobileExpandedGroup(mobileExpandedGroup === 'rent' ? null : 'rent')}
              className="apple-mobile-accordion-header"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <KeyRound size={17} color="var(--gold-primary, #D4AF37)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#FFFFFF' : '#18181B' }}>Rent</span>
              </div>
              <ChevronDown
                size={16}
                color={isDark ? 'rgba(255, 255, 255, 0.5)' : '#71717A'}
                style={{ transform: mobileExpandedGroup === 'rent' ? 'rotate(180deg)' : 'rotate(0)' }}
              />
            </button>
            {mobileExpandedGroup === 'rent' && (
              <div className="apple-mobile-sublinks">
                <button onClick={() => { closeAllMenus(); onNavigate('rent'); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Rent Property</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Rent', type: 'Apartment' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Apartments for Rent</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Rent', type: 'House' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Houses for Rent</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Rent', type: 'Villa' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Villas for Rent</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Rent', type: 'Commercial' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Commercial Rentals</button>
              </div>
            )}
          </div>

          {/* Group 5: Lease Accordion */}
          <div className="apple-mobile-accordion" style={{ borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)' }}>
            <button
              onClick={() => setMobileExpandedGroup(mobileExpandedGroup === 'lease' ? null : 'lease')}
              className="apple-mobile-accordion-header"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Briefcase size={17} color="var(--gold-primary, #D4AF37)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#FFFFFF' : '#18181B' }}>Lease</span>
              </div>
              <ChevronDown
                size={16}
                color={isDark ? 'rgba(255, 255, 255, 0.5)' : '#71717A'}
                style={{ transform: mobileExpandedGroup === 'lease' ? 'rotate(180deg)' : 'rotate(0)' }}
              />
            </button>
            {mobileExpandedGroup === 'lease' && (
              <div className="apple-mobile-sublinks">
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Lease' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Lease Property</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Lease' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Long-term Lease</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Lease', type: 'Commercial' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Commercial Lease</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Lease', type: 'Plots' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Land Lease</button>
              </div>
            )}
          </div>

          {/* Group 6: Hotels & PG Accordion */}
          <div className="apple-mobile-accordion" style={{ borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)' }}>
            <button
              onClick={() => setMobileExpandedGroup(mobileExpandedGroup === 'hotels-pg' ? null : 'hotels-pg')}
              className="apple-mobile-accordion-header"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Hotel size={17} color="var(--gold-primary, #D4AF37)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#FFFFFF' : '#18181B' }}>Hotels & PG</span>
              </div>
              <ChevronDown
                size={16}
                color={isDark ? 'rgba(255, 255, 255, 0.5)' : '#71717A'}
                style={{ transform: mobileExpandedGroup === 'hotels-pg' ? 'rotate(180deg)' : 'rotate(0)' }}
              />
            </button>
            {mobileExpandedGroup === 'hotels-pg' && (
              <div className="apple-mobile-sublinks">
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Stays' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Hotels</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Stays' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>PG</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Stays' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Hostels</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { purpose: 'Stays', type: 'Apartment' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Serviced Apartments</button>
              </div>
            )}
          </div>

          {/* Group 7: Builders Accordion */}
          <div className="apple-mobile-accordion" style={{ borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)' }}>
            <button
              onClick={() => setMobileExpandedGroup(mobileExpandedGroup === 'builders' ? null : 'builders')}
              className="apple-mobile-accordion-header"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Building2 size={17} color="var(--gold-primary, #D4AF37)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#FFFFFF' : '#18181B' }}>Builders</span>
              </div>
              <ChevronDown
                size={16}
                color={isDark ? 'rgba(255, 255, 255, 0.5)' : '#71717A'}
                style={{ transform: mobileExpandedGroup === 'builders' ? 'rotate(180deg)' : 'rotate(0)' }}
              />
            </button>
            {mobileExpandedGroup === 'builders' && (
              <div className="apple-mobile-sublinks">
                <button onClick={() => { closeAllMenus(); onNavigate('agencies'); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Builder Listings</button>
                <button onClick={() => { closeAllMenus(); onNavigate('projects'); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>New Projects</button>
                <button onClick={() => { closeAllMenus(); onNavigate('properties', undefined, { type: 'Plots' }); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Land Offers</button>
                <button onClick={() => { closeAllMenus(); onNavigate('list-property'); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Available Slots</button>
              </div>
            )}
          </div>

          {/* Group 8: About Accordion */}
          <div className="apple-mobile-accordion" style={{ borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)' }}>
            <button
              onClick={() => setMobileExpandedGroup(mobileExpandedGroup === 'about' ? null : 'about')}
              className="apple-mobile-accordion-header"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Compass size={17} color="var(--gold-primary, #D4AF37)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#FFFFFF' : '#18181B' }}>About</span>
              </div>
              <ChevronDown
                size={16}
                color={isDark ? 'rgba(255, 255, 255, 0.5)' : '#71717A'}
                style={{ transform: mobileExpandedGroup === 'about' ? 'rotate(180deg)' : 'rotate(0)' }}
              />
            </button>
            {mobileExpandedGroup === 'about' && (
              <div className="apple-mobile-sublinks">
                <button onClick={() => { closeAllMenus(); onNavigate('about'); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>About Lokha</button>
                <button onClick={() => { closeAllMenus(); onNavigate('contact'); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Private Concierge Hotline</button>
                <button onClick={() => { closeAllMenus(); onNavigate('insights'); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>Legal Guides & Stamp Duty</button>
                <button onClick={() => { closeAllMenus(); onNavigate('locations'); }} className={`apple-mobile-sublink ${isDark ? 'dark' : 'light'}`}>City Hubs & Rates</button>
              </div>
            )}
          </div>

          {/* Mobile Auth Actions */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)' }}>
            {!user ? (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => { closeAllMenus(); onNavigate('login'); }}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '10px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.12)',
                    color: isDark ? '#FFFFFF' : '#18181B',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { closeAllMenus(); onNavigate('signup'); }}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--gold-primary, #D4AF37)',
                    color: '#070709',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: 'none'
                  }}
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => { closeAllMenus(); onNavigate('dashboard'); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    color: 'var(--gold-primary, #D4AF37)',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  <User size={15} />
                  <span>Dashboard ({user.displayName || 'Member'})</span>
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem',
                    borderRadius: '10px',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embedded Apple Style Rules */}
      <style>{`
        /* Mega Menu Panel Animation */
        .apple-mega-panel {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          animation: appleMegaIn 240ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          z-index: 240;
        }

        .apple-mega-panel.dark {
          background-color: rgba(14, 14, 18, 0.96);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.04);
        }

        .apple-mega-panel.light {
          background-color: rgba(255, 255, 255, 0.98);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.03);
        }

        .apple-mega-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem 2.25rem;
          display: grid;
          grid-template-columns: 1fr 1fr 340px;
          gap: 2rem;
        }

        .apple-mega-column {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .apple-mega-heading {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding-bottom: 0.4rem;
        }

        .apple-mega-heading.dark {
          color: rgba(255, 255, 255, 0.45);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .apple-mega-heading.light {
          color: #71717A;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .apple-mega-links {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .apple-mega-link {
          background: none;
          border: none;
          padding: 0.5rem 0.65rem;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          cursor: pointer;
          transition: all 180ms ease;
          text-align: left;
        }

        .apple-mega-link.dark:hover {
          background-color: rgba(255, 255, 255, 0.05);
          transform: translateX(3px);
        }

        .apple-mega-link.light:hover {
          background-color: rgba(0, 0, 0, 0.04);
          transform: translateX(3px);
        }

        .apple-mega-link.dark .apple-link-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: #FFFFFF;
          transition: color 180ms ease;
        }

        .apple-mega-link.light .apple-link-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: #18181B;
          transition: color 180ms ease;
        }

        .apple-mega-link:hover .apple-link-title {
          color: var(--gold-primary, #D4AF37) !important;
        }

        .apple-mega-link.dark .apple-link-sub {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 0.15rem;
        }

        .apple-mega-link.light .apple-link-sub {
          font-size: 0.72rem;
          color: #71717A;
          margin-top: 0.15rem;
        }

        .apple-mega-feature-card {
          border-radius: 14px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
        }

        .apple-mega-feature-card.dark {
          background: linear-gradient(145deg, rgba(212, 175, 55, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
          border: 1px solid rgba(212, 175, 55, 0.22);
        }

        .apple-mega-feature-card.light {
          background: linear-gradient(145deg, rgba(184, 134, 11, 0.06) 0%, rgba(0, 0, 0, 0.02) 100%);
          border: 1px solid rgba(184, 134, 11, 0.22);
        }

        .apple-mega-feature-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: none;
          border: none;
          color: var(--gold-primary, #D4AF37);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          transition: transform 180ms ease;
        }

        .apple-mega-feature-btn:hover {
          transform: translateX(4px);
        }

        /* Profile Dropdown Links */
        .apple-profile-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.55rem 0.75rem;
          border-radius: 8px;
          background-color: transparent;
          border: none;
          cursor: pointer;
          font-size: 0.82rem;
          text-align: left;
          width: 100%;
          transition: all 150ms ease;
        }

        .apple-profile-link.dark {
          color: rgba(255, 255, 255, 0.8);
        }
        .apple-profile-link.dark:hover {
          background-color: rgba(255, 255, 255, 0.06);
          color: #FFFFFF;
        }

        .apple-profile-link.light {
          color: #3F3F46;
        }
        .apple-profile-link.light:hover {
          background-color: rgba(0, 0, 0, 0.04);
          color: #18181B;
        }

        /* Mobile Accordion Links */
        .apple-mobile-link-main {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          padding: 0.85rem 0.65rem;
          background: none;
          border: none;
          width: 100%;
          cursor: pointer;
        }

        .apple-mobile-accordion {
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .apple-mobile-accordion-header {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          padding: 0.85rem 0.65rem;
          background: none;
          border: none;
          width: 100%;
          cursor: pointer;
        }

        .apple-mobile-sublinks {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.45rem;
          padding: 0.25rem 0.65rem 0.85rem;
        }

        .apple-mobile-sublink {
          text-align: left;
          padding: 0.45rem 0.65rem;
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .apple-mobile-sublink.dark {
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.75);
        }

        .apple-mobile-sublink.light {
          background-color: rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.06);
          color: #3F3F46;
        }

        /* Keyframe Animations */
        @keyframes appleMegaIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes appleSearchSlideDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes appleMenuIn {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Responsive Breakpoints */
        @media (max-width: 1100px) {
          .apple-center-nav {
            gap: 0.1rem !important;
          }
          .apple-nav-item {
            padding: 0.45rem 0.55rem !important;
            font-size: 0.82rem !important;
          }
          .apple-mega-inner {
            grid-template-columns: 1fr 1fr !important;
          }
          .apple-mega-feature-card {
            display: none !important;
          }
        }

        @media (max-width: 890px) {
          .apple-center-nav {
            display: none !important;
          }
          .apple-auth-btns {
            display: none !important;
          }
          .apple-mobile-menu-btn {
            display: flex !important;
          }
          .apple-profile-name {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
