import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { FirebaseService } from '../services';

const firebaseService = new FirebaseService();

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => User | null;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  // Initialize auth state on mount
  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChange((user: User | null) => {
      setAuthState(prev => ({
        ...prev,
        user,
        loading: false,
        error: null
      }));
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await firebaseService.signInWithGoogle();
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Google login failed'
      }));
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await firebaseService.signOut();
      setAuthState(prev => ({ ...prev, user: null, loading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      }));
    }
  }, []);

  const getCurrentUser = useCallback(() => {
    return firebaseService.getCurrentUser();
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    loginWithGoogle,
    logout,
    getCurrentUser,
    clearError
  };
}; 