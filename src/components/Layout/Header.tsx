import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoginButton from '../Auth/LoginButton';

const Header: React.FC = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenus = () => {
    setIsUserMenuOpen(false);
  };

  return (
    <>
      {/* Backdrop for mobile menus */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeMenus}
        />
      )}
      
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/70 backdrop-blur-lg shadow-lg border-b border-white/20' 
          : 'bg-gradient-to-r from-white/80 via-white/60 backdrop-blur-md'
      }`}>
        <div className="container mx-auto px-4">
          <div className="relative flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 z-50 transition-colors duration-200" 
              onClick={closeMenus}
            >
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                OnlineVoiceRecorder
              </span>
            </Link>

            {/* Right Section with Nav and Profile */}
            <div className="flex items-center space-x-6 z-50">

              {/* Profile/Login Section */}
              <div className="flex items-center">
                {user ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-all duration-200 transform hover:scale-105"
                  >
                    <img
                      src={user.user_metadata.avatar_url || 'https://via.placeholder.com/32'}
                      alt="Profile"
                      className="w-8 h-8 rounded-full ring-2 ring-white/50 shadow-lg"
                    />
                  </button>
                ) : (
                  <LoginButton className="text-gray-700 hover:text-indigo-600 transition-colors duration-200" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Menu Slider (Right Side) */}
        {user && (
          <div
            className={`fixed top-0 bottom-0 right-0 transform h-[100vh] ${
              isUserMenuOpen ? 'translate-x-0' : 'translate-x-full'
            } w-64 bg-[#FFFFFF] shadow-xl transition-transform duration-300 ease-in-out z-50 border-l border-gray-100`}
          >
            <div className="flex flex-col h-full">
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
                  <img
                    src={user.user_metadata.avatar_url || 'https://via.placeholder.com/40'}
                    alt="Profile"
                    className="w-10 h-10 rounded-full ring-2 ring-indigo-100"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.user_metadata.full_name || 'User'}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/recordings"
                  className="flex items-center justify-between px-2 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  onClick={closeMenus}
                >
                  <span>My Recordings</span>
                  <ChevronRight size={20} />
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    closeMenus();
                  }}
                  className="w-full text-left px-2 py-2 text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-lg transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;