import { useState, useCallback } from 'react';
import { FirebaseService } from '../services';
import { Campaign, GameMessage, Character, User } from '../types';

const firebaseService = new FirebaseService();

interface GameSession {
  campaignId: string;
  currentTurn: string;
  phase: 'setup' | 'exploration' | 'combat' | 'social' | 'rest';
  activePlayers: string[];
  lastActivity: Date;
}

interface GameState {
  loading: boolean;
  error: string | null;
  currentCampaign: Campaign | null;
  currentSession: GameSession | null;
  messages: GameMessage[];
  characters: Character[];
  activeUsers: User[];
}

interface UseGameStateReturn extends GameState {
  // Session management
  joinCampaign: (campaignId: string) => Promise<boolean>;
  leaveCampaign: () => Promise<void>;
  updateSessionPhase: (phase: GameSession['phase']) => Promise<void>;
  setCurrentTurn: (userId: string) => Promise<void>;
  
  // Real-time updates
  subscribeToCampaign: (campaignId: string) => () => void;
  subscribeToMessages: (campaignId: string) => () => void;
  
  // Utility
  clearError: () => void;
  getActivePlayerCount: () => number;
  isPlayerTurn: (userId: string) => boolean;
}

export const useGameState = (): UseGameStateReturn => {
  const [state, setState] = useState<GameState>({
    loading: false,
    error: null,
    currentCampaign: null,
    currentSession: null,
    messages: [],
    characters: [],
    activeUsers: []
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setCurrentCampaign = useCallback((campaign: Campaign | null) => {
    setState(prev => ({ ...prev, currentCampaign: campaign }));
  }, []);

  const setCurrentSession = useCallback((session: GameSession | null) => {
    setState(prev => ({ ...prev, currentSession: session }));
  }, []);

  const setMessages = useCallback((messages: GameMessage[]) => {
    setState(prev => ({ ...prev, messages }));
  }, []);

  const setCharacters = useCallback((characters: Character[]) => {
    setState(prev => ({ ...prev, characters }));
  }, []);

  const setActiveUsers = useCallback((users: User[]) => {
    setState(prev => ({ ...prev, activeUsers: users }));
  }, []);

  // Session management
  const joinCampaign = useCallback(async (campaignId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implement campaign joining logic in FirebaseService
      // For now, we'll simulate joining a campaign
      const mockCampaign: Campaign = {
        id: campaignId,
        name: 'Adventure Awaits',
        description: 'An epic journey begins...',
        theme: 'fantasy',
        maxPlayers: 6,
        isPublic: true,
        settings: {
          difficulty: 'medium',
          ruleSet: 'dnd5e',
          aiPersonality: 'dramatic',
          voiceEnabled: false,
          allowPlayerSecrets: true,
          experienceType: 'milestone',
          restingRules: 'standard'
        },
        host: 'current-user-id',
        players: [],
        worldState: {
          currentLocation: 'Tavern',
          timeOfDay: 'morning',
          weather: 'clear',
          season: 'spring',
          activeQuests: [],
          npcs: [],
          events: [],
          calendar: {
            day: 1,
            month: 'Spring',
            year: 1492
          }
        },
        createdAt: new Date(),
        lastPlayedAt: new Date(),
        status: 'active',
        tags: ['fantasy', 'adventure']
      };

      const mockSession: GameSession = {
        campaignId,
        currentTurn: 'current-user-id',
        phase: 'exploration',
        activePlayers: ['current-user-id'],
        lastActivity: new Date()
      };

      setCurrentCampaign(mockCampaign);
      setCurrentSession(mockSession);
      setLoading(false);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join campaign';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  }, [setLoading, setError, setCurrentCampaign, setCurrentSession]);

  const leaveCampaign = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implement campaign leaving logic
      setCurrentCampaign(null);
      setCurrentSession(null);
      setMessages([]);
      setCharacters([]);
      setActiveUsers([]);
      setLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to leave campaign';
      setError(errorMessage);
      setLoading(false);
    }
  }, [setLoading, setError, setCurrentCampaign, setCurrentSession, setMessages, setCharacters, setActiveUsers]);

  const updateSessionPhase = useCallback(async (phase: GameSession['phase']): Promise<void> => {
    if (!state.currentSession) {
      setError('No active session');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const updatedSession: GameSession = {
        ...state.currentSession,
        phase,
        lastActivity: new Date()
      };
      
      setCurrentSession(updatedSession);
      setLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update session phase';
      setError(errorMessage);
      setLoading(false);
    }
  }, [state.currentSession, setLoading, setError, setCurrentSession]);

  const setCurrentTurn = useCallback(async (userId: string): Promise<void> => {
    if (!state.currentSession) {
      setError('No active session');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const updatedSession: GameSession = {
        ...state.currentSession,
        currentTurn: userId,
        lastActivity: new Date()
      };
      
      setCurrentSession(updatedSession);
      setLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set current turn';
      setError(errorMessage);
      setLoading(false);
    }
  }, [state.currentSession, setLoading, setError, setCurrentSession]);

  // Real-time subscriptions
  const subscribeToCampaign = useCallback((campaignId: string) => {
    // TODO: Implement real-time campaign subscription
    // For now, return a no-op unsubscribe function
    return () => {
      console.log('Unsubscribed from campaign:', campaignId);
    };
  }, []);

  const subscribeToMessages = useCallback((campaignId: string) => {
    return firebaseService.subscribeToMessages(campaignId, (messages: GameMessage[]) => {
      setMessages(messages);
    });
  }, [setMessages]);

  // Utility functions
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const getActivePlayerCount = useCallback(() => {
    return state.activeUsers.length;
  }, [state.activeUsers]);

  const isPlayerTurn = useCallback((userId: string) => {
    return state.currentSession?.currentTurn === userId;
  }, [state.currentSession]);

  return {
    ...state,
    joinCampaign,
    leaveCampaign,
    updateSessionPhase,
    setCurrentTurn,
    subscribeToCampaign,
    subscribeToMessages,
    clearError,
    getActivePlayerCount,
    isPlayerTurn
  };
}; 