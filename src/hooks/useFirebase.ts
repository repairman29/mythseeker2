import { useState, useCallback } from 'react';
import { FirebaseService } from '../services';
import { Character, Campaign, GameMessage } from '../types';

const firebaseService = new FirebaseService();

interface FirebaseState {
  loading: boolean;
  error: string | null;
}

interface UseFirebaseReturn extends FirebaseState {
  // Character operations
  createCharacter: (characterData: Partial<Character>) => Promise<Character | null>;
  getCharacters: (userId: string) => Promise<Character[]>;
  updateCharacter: (characterId: string, updates: Partial<Character>) => Promise<Character | null>;
  
  // Campaign operations
  createCampaign: (campaignData: Partial<Campaign>) => Promise<Campaign | null>;
  getCampaigns: (userId: string) => Promise<Campaign[]>;
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => Promise<Campaign | null>;
  
  // Message operations
  sendMessage: (messageData: Partial<GameMessage>) => Promise<GameMessage | null>;
  getMessages: (campaignId: string, limit?: number) => Promise<GameMessage[]>;
  subscribeToMessages: (campaignId: string, callback: (messages: GameMessage[]) => void) => () => void;
  
  // Utility
  clearError: () => void;
}

export const useFirebase = (): UseFirebaseReturn => {
  const [state, setState] = useState<FirebaseState>({
    loading: false,
    error: null
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Character operations
  const createCharacter = useCallback(async (characterData: Partial<Character>): Promise<Character | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const character = await firebaseService.createCharacter(characterData);
      setLoading(false);
      return character;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create character';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [setLoading, setError]);

  const getCharacters = useCallback(async (userId: string): Promise<Character[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const characters = await firebaseService.getCharacters(userId);
      setLoading(false);
      return characters;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch characters';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  }, [setLoading, setError]);

  const updateCharacter = useCallback(async (characterId: string, updates: Partial<Character>): Promise<Character | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const character = await firebaseService.updateCharacter(characterId, updates);
      setLoading(false);
      return character;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update character';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [setLoading, setError]);

  // Campaign operations
  const createCampaign = useCallback(async (campaignData: Partial<Campaign>): Promise<Campaign | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const campaign = await firebaseService.createCampaign(campaignData);
      setLoading(false);
      return campaign;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create campaign';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [setLoading, setError]);

  const getCampaigns = useCallback(async (_userId: string): Promise<Campaign[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // Note: This method doesn't exist in FirebaseService yet, so we'll return empty array
      // TODO: Implement getCampaigns in FirebaseService
      setLoading(false);
      return [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch campaigns';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  }, [setLoading, setError]);

  const updateCampaign = useCallback(async (_campaignId: string, _updates: Partial<Campaign>): Promise<Campaign | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Note: This method doesn't exist in FirebaseService yet, so we'll return null
      // TODO: Implement updateCampaign in FirebaseService
      setLoading(false);
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update campaign';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [setLoading, setError]);

  // Message operations
  const sendMessage = useCallback(async (messageData: Partial<GameMessage>): Promise<GameMessage | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const message = await firebaseService.sendMessage(messageData);
      setLoading(false);
      return message;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [setLoading, setError]);

  const getMessages = useCallback(async (campaignId: string, limit: number = 50): Promise<GameMessage[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const messages = await firebaseService.getMessages(campaignId, limit);
      setLoading(false);
      return messages;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  }, [setLoading, setError]);

  const subscribeToMessages = useCallback((campaignId: string, callback: (messages: GameMessage[]) => void) => {
    return firebaseService.subscribeToMessages(campaignId, callback);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    ...state,
    createCharacter,
    getCharacters,
    updateCharacter,
    createCampaign,
    getCampaigns,
    updateCampaign,
    sendMessage,
    getMessages,
    subscribeToMessages,
    clearError
  };
}; 