import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { NotificationsPage } from './pages/NotificationsPage';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [globalSearchLocation, setGlobalSearchLocation] = useState<string>('');

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string, location?: string) => {
    setGlobalSearchQuery(query);
    if (location !== undefined) {
      setGlobalSearchLocation(location);
    }
    setCurrentView('properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;

      case 'login':
        return (
          <LoginPage
            onSuccess={() => handleNavigate('dashboard')}
            onNavigateToSignUp={() => handleNavigate('signup')}
          />
        );

      case 'signup':
        return (
          <SignUpPage
            onSuccess={() => handleNavigate('dashboard')}
            onNavigateToLogin={() => handleNavigate('login')}
          />
        );

      case 'notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;

      case 'dashboard':
      case 'saved':
      case 'messages':
      case 'bookings':
        return (
          <ProtectedRoute onRedirectToLogin={() => handleNavigate('login')}>
            <DashboardPage onNavigate={handleNavigate} />
          </ProtectedRoute>
        );

      case 'settings':
        return (
          <ProtectedRoute onRedirectToLogin={() => handleNavigate('login')}>
            <SettingsPage onNavigate={handleNavigate} />
          </ProtectedRoute>
        );

      case 'properties':
      case 'stays':
      case 'projects':
        return (
          <PropertiesPage
            initialSearchQuery={globalSearchQuery}
            initialLocationQuery={globalSearchLocation}
            initialViewType={currentView}
          />
        );

      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-primary, #070709)',
            color: 'var(--text-primary, #FFFFFF)',
            position: 'relative'
          }}>
            {/* Top Navigation Bar: Spans 100% full screen width edge-to-edge */}
            <Navbar
              currentView={currentView}
              onNavigate={handleNavigate}
              onSearch={handleSearch}
              onToggleSidebar={() => setSidebarExpanded(prev => !prev)}
            />

            {/* Body Layout: Sidebar + Main Content Layout */}
            <div style={{
              display: 'flex',
              flex: 1,
              position: 'relative',
              minHeight: 'calc(100vh - 4.75rem)'
            }}>
              {/* 1. Animated Expandable Sidebar (Present on all pages) */}
              <Sidebar
                currentView={currentView}
                onNavigate={handleNavigate}
                isExpanded={sidebarExpanded}
                onToggleExpanded={(val?: boolean) => setSidebarExpanded(prev => val !== undefined ? val : !prev)}
              />

              {/* Mobile Backdrop Overlay when sidebar is expanded on small screens */}
              {sidebarExpanded && (
                <div
                  onClick={() => setSidebarExpanded(false)}
                  style={{
                    position: 'fixed',
                    top: '4.75rem',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 290
                  }}
                  className="mobile-backdrop"
                />
              )}

              {/* 2. Main Layout Area (Smoothly expands/contracts with sidebar) */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                marginLeft: sidebarExpanded
                  ? 'var(--sidebar-expanded-w, 260px)'
                  : 'var(--sidebar-collapsed-w, 68px)',
                transition: 'margin-left 280ms cubic-bezier(0.4, 0, 0.2, 1)'
              }} className="main-content-layout">
                {/* Dynamic View Content */}
                <main style={{ flex: 1 }}>
                  {renderContent()}
                </main>

                {/* Footer */}
                <Footer onNavigate={handleNavigate} />

                {/* Mobile Bottom Navigation Bar */}
                <MobileBottomNav currentView={currentView} onNavigate={handleNavigate} />
              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 768px) {
              .main-content-layout {
                margin-left: 0 !important;
                padding-bottom: 4.75rem !important;
                width: 100% !important;
                min-width: 0 !important;
              }
              .mobile-backdrop {
                display: block !important;
                z-index: 290 !important;
              }
            }
            @media (min-width: 769px) {
              .mobile-backdrop {
                display: none !important;
              }
            }
          `}</style>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
