import { useState, useCallback } from 'react';
import { FirebaseService } from '../services';

interface DiceRoll {
  id: string;
  diceType: string;
  result: number;
  total: number;
  critical: boolean;
  timestamp: Date;
  modifier?: number;
}

interface DiceState {
  loading: boolean;
  error: string | null;
  rollHistory: DiceRoll[];
  lastRoll: DiceRoll | null;
}

interface UseDiceReturn extends DiceState {
  rollDice: (diceType: string, modifier?: number) => Promise<DiceRoll | null>;
  rollMultiple: (diceType: string, count: number, modifier?: number) => Promise<DiceRoll[]>;
  clearHistory: () => void;
  clearError: () => void;
  getRollStats: () => { totalRolls: number; averageRoll: number; criticalHits: number };
}

const firebaseService = new FirebaseService();

export const useDice = (): UseDiceReturn => {
  const [state, setState] = useState<DiceState>({
    loading: false,
    error: null,
    rollHistory: [],
    lastRoll: null
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const addToHistory = useCallback((roll: DiceRoll) => {
    setState(prev => ({
      ...prev,
      rollHistory: [roll, ...prev.rollHistory.slice(0, 49)], // Keep last 50 rolls
      lastRoll: roll
    }));
  }, []);

  const rollDice = useCallback(async (diceType: string, modifier: number = 0): Promise<DiceRoll | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseService.rollDice(diceType, modifier);
      
      const roll: DiceRoll = {
        id: `roll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        diceType,
        result: result.result,
        total: result.total,
        critical: result.critical,
        timestamp: new Date(),
        modifier
      };
      
      addToHistory(roll);
      setLoading(false);
      return roll;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to roll dice';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [setLoading, setError, addToHistory]);

  const rollMultiple = useCallback(async (diceType: string, count: number, modifier: number = 0): Promise<DiceRoll[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const rolls: DiceRoll[] = [];
      
      for (let i = 0; i < count; i++) {
        const result = await firebaseService.rollDice(diceType, modifier);
        
        const roll: DiceRoll = {
          id: `roll_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
          diceType,
          result: result.result,
          total: result.total,
          critical: result.critical,
          timestamp: new Date(),
          modifier
        };
        
        rolls.push(roll);
        addToHistory(roll);
      }
      
      setLoading(false);
      return rolls;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to roll multiple dice';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  }, [setLoading, setError, addToHistory]);

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, rollHistory: [], lastRoll: null }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const getRollStats = useCallback(() => {
    const { rollHistory } = state;
    
    if (rollHistory.length === 0) {
      return { totalRolls: 0, averageRoll: 0, criticalHits: 0 };
    }
    
    const totalRolls = rollHistory.length;
    const totalValue = rollHistory.reduce((sum, roll) => sum + roll.total, 0);
    const averageRoll = Math.round((totalValue / totalRolls) * 100) / 100;
    const criticalHits = rollHistory.filter(roll => roll.critical).length;
    
    return { totalRolls, averageRoll, criticalHits };
  }, [state.rollHistory]);

  return {
    ...state,
    rollDice,
    rollMultiple,
    clearHistory,
    clearError,
    getRollStats
  };
}; 