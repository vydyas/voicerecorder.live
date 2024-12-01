import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import HomePage from './pages/HomePage';
import RecordingsPage from './pages/RecordingsPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
          <Header />
          <div className="pt-16"> {/* Add padding to account for fixed header */}
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
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;