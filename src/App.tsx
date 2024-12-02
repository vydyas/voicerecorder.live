import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import HomePage from './pages/HomePage';
import RecordingsPage from './pages/RecordingsPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { useEffect } from 'react';
import { initGA, pageview } from './utils/analytics';

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