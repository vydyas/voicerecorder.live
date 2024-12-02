import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { trackEvents } from '../utils/analytics';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthData = () => {
    setSession(null);
    setUser(null);
    // Clear all Supabase-related items from localStorage
    window.localStorage.removeItem('sb-mtrtulsvgiwtjtlcbqsq-auth-token');
    window.localStorage.removeItem('supabase.auth.token');
    // Clear any other auth-related items that might exist
    Object.keys(window.localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase.auth')) {
        window.localStorage.removeItem(key);
      }
    });
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (event === 'SIGNED_IN') {
        trackEvents.userSignedIn();
      } else if (event === 'SIGNED_OUT') {
        trackEvents.userSignedOut();
        clearAuthData();
        // Reload the page to ensure clean state
        window.location.href = '/';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      clearAuthData();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Force clean up even if API call fails
      clearAuthData();
      window.location.href = '/';
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;