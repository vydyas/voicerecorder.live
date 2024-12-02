import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Music, User as UserIcon, User2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { getRecordings } from '../../utils/supabaseStorage';
import { Link, useNavigate } from 'react-router-dom';

interface UserMenuProps {
  user: User;
}

interface Recording {
  id: string;
  created_at: string;
  public_url: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any local storage or state related to auth
      localStorage.removeItem('sb-mtrtulsvgiwtjtlcbqsq-auth-token');
      
      // Close dropdown and redirect to home
      setShowDropdown(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const loadRecordings = async () => {
    if (!showDropdown) {
      setIsLoading(true);
      const data = await getRecordings(user.id);
      setRecordings(data);
      setIsLoading(false);
    }
  };

  const toggleDropdown = async () => {
    if (!showDropdown) {
      await loadRecordings();
    }
    setShowDropdown(!showDropdown);
  };

  const avatarUrl = user.user_metadata?.avatar_url || 'https://lh3.googleusercontent.com/a/ACg8ocIqsha7rkavpqUeXMwrAYpq8kWuBmlp4jWDErwnvhDV1Yj31jc90Q=s96-c';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 bg-white rounded-full p-1 hover:shadow-md transition-all duration-200"
      >
        {!imageError && avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-gray-200"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-10 h-10 rounded-full border-2 border-gray-200 bg-indigo-100 flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-indigo-600" />
          </div>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <UserIcon size={20} className="text-gray-500" />
              <div>
                <div className="font-medium text-gray-900">
                  {user.user_metadata?.full_name || user.email}
                </div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
            </div>
          </div>

          <div className="py-1" role="none">
            <Link
              to={`/profile/${user.id}`}
              className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              onClick={() => setShowDropdown(false)}
            >
              <User2 size={18} />
              <span>View Profile</span>
            </Link>
            <Link
              to="/recordings"
              className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              onClick={() => setShowDropdown(false)}
            >
              <Music size={18} />
              <span>My Recordings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>

          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading recordings...</div>
          ) : recordings.length > 0 ? (
            <div className="border-t border-gray-100 mt-2">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Recordings</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recordings.map((recording) => (
                    <div
                      key={recording.id}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div className="text-sm text-gray-600 mb-2">
                        {new Date(recording.created_at).toLocaleString()}
                      </div>
                      <audio controls className="w-full" src={recording.public_url}>
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 border-t border-gray-100">
              No recordings found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserMenu;