import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { firebaseService } from '../services/firebaseService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listenerSetUpRef = useRef(false);

  useEffect(() => {
    // Prevent multiple listener setups
    if (listenerSetUpRef.current) {
      return;
    }

    listenerSetUpRef.current = true;
    
    // Use the singleton instance
    const unsubscribe = firebaseService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      setError(null);
    });

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
      listenerSetUpRef.current = false;
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await firebaseService.signInWithGoogle();
      setUser(user);
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google login failed';
      
      // Provide more user-friendly error messages
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes('popup-blocked')) {
        userFriendlyMessage = 'Pop-up was blocked. Please allow pop-ups for this site and try again.';
      } else if (errorMessage.includes('cancelled')) {
        userFriendlyMessage = 'Sign-in was cancelled.';
      } else if (errorMessage.includes('Redirecting')) {
        userFriendlyMessage = 'Redirecting to Google sign-in...';
      }
      
      setError(userFriendlyMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await firebaseService.signOut();
      setUser(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 