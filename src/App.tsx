import React, { useState, useEffect } from 'react';
import { CivicIssue, IssueStatus, UserProfile } from './types';
import { fetchCivicIssues, updateCivicIssueStatus, getCurrentUser, signOutUser } from './lib/supabase';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LocationModal } from './components/LocationModal';
import { AuthModal } from './components/AuthModal';
import { CivicRightsModal } from './components/CivicRightsModal';
import { Home } from './pages/Home';
import { CivicIssues } from './pages/CivicIssues';
import { ReportProblemView } from './components/ReportProblemView';
import { NewsUpdates } from './components/NewsUpdates';
import { ChatAssistant } from './components/ChatAssistant';
import { MyReports } from './components/MyReports';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [initialCategoryFilter, setInitialCategoryFilter] = useState<string>('all');

  // Location Persistence (Default Lahore • Johar Town)
  const [city, setCity] = useState<string>(() => {
    return localStorage.getItem('shehriawaz_city') || 'Lahore';
  });
  const [area, setArea] = useState<string>(() => {
    return localStorage.getItem('shehriawaz_area') || 'Johar Town';
  });

  // User State
  const [user, setUser] = useState<UserProfile | null>(null);

  // Issues State
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(true);

  // Modals
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCivicRightsModalOpen, setIsCivicRightsModalOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitial = async () => {
      // 1. Load user
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.city) setCity(currentUser.city);
        if (currentUser.area) setArea(currentUser.area);
      }

      // 2. Load issues
      const loadedIssues = await fetchCivicIssues();
      setIssues(loadedIssues);
      setLoadingIssues(false);
    };

    loadInitial();
  }, []);

  // Save location updates
  const handleSelectLocation = (newCity: string, newArea: string) => {
    setCity(newCity);
    setArea(newArea);
    localStorage.setItem('shehriawaz_city', newCity);
    localStorage.setItem('shehriawaz_area', newArea);
  };

  const handleLogout = async () => {
    await signOutUser();
    setUser(null);
  };

  // Update status (e.g. demo status changer)
  const handleUpdateStatus = async (issueId: string, newStatus: IssueStatus) => {
    const success = await updateCivicIssueStatus(issueId, newStatus);
    if (success) {
      setIssues((prev) =>
        prev.map((iss) => (iss.id === issueId ? { ...iss, status: newStatus } : iss))
      );
    }
  };

  // New Issue submitted
  const handleNewIssueSuccess = (newIssue: CivicIssue) => {
    setIssues((prev) => [newIssue, ...prev]);
  };

  const handleNavigateToIssues = (categoryFilter?: string) => {
    if (categoryFilter) {
      setInitialCategoryFilter(categoryFilter);
    } else {
      setInitialCategoryFilter('all');
    }
    setCurrentTab('issues');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F5F2] text-[#1A2420]" id="shehriawaz-root-app">
      
      {/* Universal Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        city={city}
        area={area}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenReportModal={() => {
          setCurrentTab('report');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCivicRightsModal={() => setIsCivicRightsModalOpen(true)}
      />

      {/* Main Tab Content */}
      <div className="flex-1">
        {currentTab === 'home' && (
          <Home
            issues={issues}
            selectedCity={city}
            selectedArea={area}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
            onOpenReportModal={() => setCurrentTab('report')}
            onNavigateToIssues={handleNavigateToIssues}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'issues' && (
          <CivicIssues
            issues={issues}
            selectedCity={city}
            selectedArea={area}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
            onOpenReportModal={() => setCurrentTab('report')}
            initialCategory={initialCategoryFilter}
            onUpdateStatus={handleUpdateStatus}
            user={user}
          />
        )}

        {currentTab === 'report' && (
          <ReportProblemView
            initialCity={city}
            initialArea={area}
            user={user}
            onSuccess={handleNewIssueSuccess}
            onNavigateToIssues={() => {
              setCurrentTab('issues');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentTab === 'news' && (
          <NewsUpdates currentCity={city} currentArea={area} />
        )}

        {currentTab === 'chat' && (
          <ChatAssistant currentCity={city} currentArea={area} />
        )}

        {currentTab === 'my-reports' && (
          <MyReports
            issues={issues}
            user={user}
            onOpenReportModal={() => setCurrentTab('report')}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>

      {/* Universal Footer */}
      <Footer />

      {/* Location Selector Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentCity={city}
        currentArea={area}
        onSelectLocation={handleSelectLocation}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          if (loggedUser.city) setCity(loggedUser.city);
          if (loggedUser.area) setArea(loggedUser.area);
        }}
        defaultCity={city}
        defaultArea={area}
      />

      {/* Civic Rights Guide Modal */}
      <CivicRightsModal
        isOpen={isCivicRightsModalOpen}
        onClose={() => setIsCivicRightsModalOpen(false)}
      />

    </div>
  );
}
