import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AuthError from './AuthError';

const LoginButton: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          },
          redirectTo: import.meta.env.VITE_APP_ENV === 'production' 
            ? `${import.meta.env.VITE_API_URL}`
            : `${window.location.origin}`
        }
      });
      
      if (authError) throw authError;
      if (!data.url) throw new Error('No authentication URL returned');
      
      // Redirect to the OAuth URL
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Failed to sign in with Google. Please try again.');
      setIsLoading(false);  // Only reset loading on error
    }
  };

  return (
    <div>
      {error && <AuthError message={error} />}
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className={`flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <LogIn size={20} />
        <span>{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
      </button>
    </div>
  );
};

export default LoginButton;