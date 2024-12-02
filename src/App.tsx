import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { useEffect } from 'react';
import { initGA, pageview } from './utils/analytics';
import React, { Suspense, lazy } from 'react';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const RecordingsPage = lazy(() => import('./pages/RecordingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Component to track page views
const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Delay the pageview tracking slightly to ensure GA is initialized
    const timeoutId = setTimeout(() => {
      pageview(location.pathname + location.search);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location]);

  return null;
};

const AppContent = () => {
  return (
    <>
      <PageViewTracker />
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
        <Header />
        <div className="pt-16">
          <Suspense 
            fallback={
              <div className="container mx-auto px-4 py-8">
                <LoadingSpinner />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/recordings"
                element={
                  <ProtectedRoute>
                    <RecordingsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/profile/:userId" element={<ProfilePage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </>
  );
};

function App() {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;