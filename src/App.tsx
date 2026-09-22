import React, { useState, useEffect } from 'react';
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
import { AddPropertyPage } from './pages/AddPropertyPage';

// New Real-Estate Marketplace Pages
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { BuyPage } from './pages/BuyPage';
import { RentPage } from './pages/RentPage';
import { MapSearchPage } from './pages/MapSearchPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ComparePage } from './pages/ComparePage';
import { SiteVisitsPage } from './pages/SiteVisitsPage';
import { EmiCalculatorPage } from './pages/EmiCalculatorPage';
import { HomeValuationPage } from './pages/HomeValuationPage';
import { AgentsPage } from './pages/AgentsPage';
import { AgenciesPage } from './pages/AgenciesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { LocationsPage } from './pages/LocationsPage';
import { InsightsPage } from './pages/InsightsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import type { PropertyDocument } from './types/firebaseModels';

function parsePathToView(pathname: string): { view: string; param?: string } {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  if (!clean || clean === '') return { view: 'home' };
  if (clean.startsWith('properties/')) return { view: `property-${clean.replace('properties/', '')}` };
  if (clean.startsWith('property/')) return { view: `property-${clean.replace('property/', '')}` };
  if (clean.startsWith('agents/')) return { view: `agent-${clean.replace('agents/', '')}` };
  if (clean.startsWith('projects/')) return { view: `project-${clean.replace('projects/', '')}` };
  if (clean.startsWith('locations/')) return { view: `location-${clean.replace('locations/', '')}` };
  if (clean.startsWith('insights/')) return { view: `insight-${clean.replace('insights/', '')}` };
  return { view: clean };
}

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [globalSearchLocation, setGlobalSearchLocation] = useState<string>('');
  const [compareItems, setCompareItems] = useState<PropertyDocument[]>([]);

  // Browser History & URL Synchronization
  useEffect(() => {
    const initial = parsePathToView(window.location.pathname);
    if (initial.view && initial.view !== 'home') {
      setCurrentView(initial.view);
    }

    const handlePop = () => {
      const parsed = parsePathToView(window.location.pathname);
      setCurrentView(parsed.view);
    };

    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const handleNavigate = (view: string, location?: string) => {
    if (location !== undefined) {
      setGlobalSearchLocation(location);
    }
    setCurrentView(view);

    // Sync browser URL
    let path = `/${view}`;
    if (view === 'home') path = '/';
    else if (view.startsWith('property-')) path = `/properties/${view.replace('property-', '')}`;
    else if (view.startsWith('agent-')) path = `/agents/${view.replace('agent-', '')}`;
    else if (view.startsWith('project-')) path = `/projects/${view.replace('project-', '')}`;
    else if (view.startsWith('location-')) path = `/locations/${view.replace('location-', '')}`;
    else if (view.startsWith('insight-')) path = `/insights/${view.replace('insight-', '')}`;

    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string, location?: string) => {
    setGlobalSearchQuery(query);
    if (location !== undefined) {
      setGlobalSearchLocation(location);
    }
    handleNavigate('properties');
  };

  const handleAddToCompare = (prop: PropertyDocument) => {
    setCompareItems(prev => {
      if (prev.some(p => p.propertyId === prop.propertyId)) return prev;
      if (prev.length >= 4) return [...prev.slice(1), prop];
      return [...prev, prop];
    });
  };

  const renderContent = () => {
    // Dynamic single property view
    if (currentView.startsWith('property-')) {
      const propId = currentView.replace('property-', '');
      return (
        <PropertyDetailsPage
          propertyId={propId}
          onNavigate={handleNavigate}
          onCompareAdd={handleAddToCompare}
        />
      );
    }

    // Dynamic single agent view
    if (currentView.startsWith('agent-')) {
      const agentId = currentView.replace('agent-', '');
      return <AgentsPage selectedAgentId={agentId} onNavigate={handleNavigate} />;
    }

    // Dynamic single project view
    if (currentView.startsWith('project-')) {
      const projectId = currentView.replace('project-', '');
      return <ProjectsPage selectedProjectId={projectId} onNavigate={handleNavigate} />;
    }

    // Dynamic single location view
    if (currentView.startsWith('location-')) {
      const city = currentView.replace('location-', '');
      return <LocationsPage selectedCity={city} onNavigate={handleNavigate} />;
    }

    // Dynamic single insight view
    if (currentView.startsWith('insight-')) {
      const slug = currentView.replace('insight-', '');
      return <InsightsPage selectedSlug={slug} onNavigate={handleNavigate} />;
    }

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

      case 'buy':
        return <BuyPage onNavigate={handleNavigate} />;

      case 'rent':
      case 'stays':
        return <RentPage onNavigate={handleNavigate} />;

      case 'map':
        return <MapSearchPage onNavigate={handleNavigate} />;

      case 'favorites':
      case 'saved':
        return (
          <FavoritesPage
            onNavigate={handleNavigate}
            onCompareAdd={handleAddToCompare}
          />
        );

      case 'compare':
        return (
          <ComparePage
            initialProperties={compareItems}
            onNavigate={handleNavigate}
          />
        );

      case 'site-visits':
      case 'bookings':
        return <SiteVisitsPage onNavigate={handleNavigate} />;

      case 'emi-calculator':
        return <EmiCalculatorPage onNavigate={handleNavigate} />;

      case 'home-valuation':
      case 'valuation':
        return <HomeValuationPage onNavigate={handleNavigate} />;

      case 'agents':
        return <AgentsPage onNavigate={handleNavigate} />;

      case 'agencies':
        return <AgenciesPage onNavigate={handleNavigate} />;

      case 'projects':
        return <ProjectsPage onNavigate={handleNavigate} />;

      case 'locations':
        return <LocationsPage onNavigate={handleNavigate} />;

      case 'insights':
        return <InsightsPage onNavigate={handleNavigate} />;

      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;

      case 'contact':
        return <ContactPage onNavigate={handleNavigate} />;

      case 'notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;

      case 'dashboard':
      case 'messages':
        return (
          <ProtectedRoute onRedirectToLogin={() => handleNavigate('login')}>
            <DashboardPage onNavigate={handleNavigate} />
          </ProtectedRoute>
        );

      case 'add-property':
      case 'list-property':
      case 'sell':
        return (
          <ProtectedRoute onRedirectToLogin={() => handleNavigate('login')}>
            <AddPropertyPage onNavigate={handleNavigate} />
          </ProtectedRoute>
        );

      case 'settings':
        return (
          <ProtectedRoute onRedirectToLogin={() => handleNavigate('login')}>
            <SettingsPage onNavigate={handleNavigate} />
          </ProtectedRoute>
        );

      case 'properties':
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
