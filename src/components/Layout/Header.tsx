import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginButton from '../Auth/LoginButton';
import UserMenu from '../Auth/UserMenu';
import { Mic } from 'lucide-react';

const Header: React.FC = () => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
          >
            <Mic className="w-6 h-6" />
            <span className={`${isScrolled ? 'text-indigo-600' : 'text-indigo-500'}`}>
              Online Voice Recorder
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            {user && (
              <Link
                to="/recordings"
                className={`font-medium transition-colors duration-200 ${
                  location.pathname === '/recordings'
                    ? 'text-indigo-600'
                    : isScrolled
                    ? 'text-gray-600 hover:text-gray-900'
                    : 'text-gray-700'
                }`}
              >
                My Recordings
              </Link>
            )}
            <div className={`${isScrolled ? '' : 'backdrop-blur-sm bg-white/10 rounded-full p-1'}`}>
              {user ? <UserMenu user={user} /> : <LoginButton />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;