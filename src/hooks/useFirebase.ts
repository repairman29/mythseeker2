import { useState, useCallback } from 'react';
import { Character, Campaign, GameMessage } from '../types';
import { firebaseService } from '../services/firebaseService';

// Remove the singleton pattern from here since it's now in the service file
export function useFirebase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the singleton instance
  const service = firebaseService;

  const createCharacter = useCallback(async (characterData: Partial<Character>): Promise<Character> => {
    try {
      setLoading(true);
      setError(null);
      const character = await service.createCharacter(characterData);
      return character;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create character';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const getCharacters = useCallback(async (userId: string): Promise<Character[]> => {
    try {
      setLoading(true);
      setError(null);
      const characters = await service.getCharacters(userId);
      return characters;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch characters';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const updateCharacter = useCallback(async (characterId: string, updates: Partial<Character>): Promise<Character> => {
    try {
      setLoading(true);
      setError(null);
      const character = await service.updateCharacter(characterId, updates);
      return character;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update character';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const deleteCharacter = useCallback(async (characterId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await service.deleteCharacter(characterId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete character';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const createCampaign = useCallback(async (campaignData: Partial<Campaign>): Promise<Campaign> => {
    try {
      setLoading(true);
      setError(null);
      const campaign = await service.createCampaign(campaignData);
      return campaign;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create campaign';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const getCampaigns = useCallback(async (): Promise<Campaign[]> => {
    try {
      setLoading(true);
      setError(null);
      const campaigns = await service.getCampaigns();
      return campaigns;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get campaigns';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const getCampaign = useCallback(async (campaignId: string): Promise<Campaign> => {
    try {
      setLoading(true);
      setError(null);
      const campaign = await service.getCampaign(campaignId);
      return campaign;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get campaign';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const updateCampaign = useCallback(async (campaignId: string, updates: Partial<Campaign>): Promise<Campaign> => {
    try {
      setLoading(true);
      setError(null);
      const campaign = await service.updateCampaign(campaignId, updates);
      return campaign;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update campaign';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const sendMessage = useCallback(async (messageData: Partial<GameMessage>): Promise<GameMessage> => {
    try {
      setLoading(true);
      setError(null);
      const message = await service.sendMessage(messageData);
      return message;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const getMessages = useCallback(async (campaignId: string, limitCount: number = 50): Promise<GameMessage[]> => {
    try {
      setLoading(true);
      setError(null);
      const messages = await service.getMessages(campaignId, limitCount);
      return messages;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const subscribeToMessages = useCallback((campaignId: string, callback: (messages: GameMessage[]) => void) => {
    return service.subscribeToMessages(campaignId, callback);
  }, [service]);

  const rollDice = useCallback(async (diceType: string, modifier: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      const result = await service.rollDice(diceType, modifier);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to roll dice';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [service]);

  return {
    loading,
    error,
    createCharacter,
    getCharacters,
    updateCharacter,
    deleteCharacter,
    createCampaign,
    getCampaigns,
    getCampaign,
    updateCampaign,
    sendMessage,
    getMessages,
    subscribeToMessages,
    rollDice
  };
} 