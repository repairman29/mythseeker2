import { useState, useCallback } from 'react';
import { AIService } from '../services';
import { GameMessage } from '../types';

const aiService = new AIService();

// AI Service interfaces (matching AIService)
interface AIResponse {
  content: string;
  model: string;
  responseTime: number;
  confidence: number;
}

interface AIState {
  loading: boolean;
  error: string | null;
  lastResponse: AIResponse | null;
}

interface UseAIReturn extends AIState {
  // Core AI interactions
  generateResponse: (context: Parameters<AIService['generateResponse']>[0], userInput: string, personality?: string) => Promise<string | null>;
  generateCombatNarrative: (action: string, result: number, target?: string) => Promise<string | null>;
  
  // Context management
  updateContextMemory: (campaignId: string, key: string, value: unknown) => void;
  getContextMemory: (campaignId: string, key: string) => unknown;
  addToHistory: (campaignId: string, message: GameMessage) => void;
  getConversationHistory: (campaignId: string) => GameMessage[];
  
  // Utility
  clearError: () => void;
  clearLastResponse: () => void;
}

export const useAI = (): UseAIReturn => {
  const [state, setState] = useState<AIState>({
    loading: false,
    error: null,
    lastResponse: null
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setLastResponse = useCallback((response: AIResponse | null) => {
    setState(prev => ({ ...prev, lastResponse: response }));
  }, []);

  // Core AI interactions
  const generateResponse = useCallback(async (context: Parameters<AIService['generateResponse']>[0], userInput: string, personality: string = 'dramatic'): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await aiService.generateResponse(context, userInput, personality);
      setLoading(false);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate AI response';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [setLoading, setError]);

  const generateCombatNarrative = useCallback(async (action: string, result: number, target?: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await aiService.generateCombatNarrative(action, result, target);
      setLoading(false);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate combat narrative';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [setLoading, setError]);

  // Context management
  const updateContextMemory = useCallback((campaignId: string, key: string, value: unknown) => {
    aiService.updateContextMemory(campaignId, key, value);
  }, []);

  const getContextMemory = useCallback((campaignId: string, key: string) => {
    return aiService.getContextMemory(campaignId, key);
  }, []);

  const addToHistory = useCallback((campaignId: string, message: GameMessage) => {
    aiService.addToHistory(campaignId, message);
  }, []);

  const getConversationHistory = useCallback((campaignId: string) => {
    return aiService.getConversationHistory(campaignId);
  }, []);

  // Utility functions
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const clearLastResponse = useCallback(() => {
    setLastResponse(null);
  }, [setLastResponse]);

  return {
    ...state,
    generateResponse,
    generateCombatNarrative,
    updateContextMemory,
    getContextMemory,
    addToHistory,
    getConversationHistory,
    clearError,
    clearLastResponse
  };
}; 