import React, { useState, useCallback } from 'react';
import { Button } from '../ui/Button';
import SoundService from '../../services/soundService';

interface DiceRollerProps {
  onRoll?: (result: DiceResult) => void;
  disabled?: boolean;
}

export interface DiceResult {
  diceType: string;
  result: number;
  modifier: number;
  total: number;
  isCritical: boolean;
  isNatural20: boolean;
  rolls: number[];
}

const DICE_TYPES = [
  { value: 'd4', label: 'D4' },
  { value: 'd6', label: 'D6' },
  { value: 'd8', label: 'D8' },
  { value: 'd10', label: 'D10' },
  { value: 'd12', label: 'D12' },
  { value: 'd20', label: 'D20' },
  { value: 'd100', label: 'D100' }
];

export const DiceRoller: React.FC<DiceRollerProps> = ({ onRoll, disabled = false }) => {
  const [selectedDice, setSelectedDice] = useState('d20');
  const [modifier, setModifier] = useState(0);
  const [lastResult, setLastResult] = useState<DiceResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [soundService] = useState(() => SoundService.getInstance());

  const rollDice = useCallback(async () => {
    if (disabled || isRolling) return;

    setIsRolling(true);

    try {
      // Play dice roll sound
      await soundService.playDiceRoll();

      // Simulate rolling animation
      await new Promise(resolve => setTimeout(resolve, 500));

      const diceType = selectedDice;
      const sides = parseInt(diceType.substring(1));
      const rolls: number[] = [];
      
      // For d100, roll two d10s
      if (diceType === 'd100') {
        const tens = Math.floor(Math.random() * 10) * 10;
        const ones = Math.floor(Math.random() * 10);
        rolls.push(tens + ones);
      } else {
        rolls.push(Math.floor(Math.random() * sides) + 1);
      }

      const result = rolls[0];
      const total = result + modifier;
      const isNatural20 = diceType === 'd20' && result === 20;
      const isCritical = isNatural20 || (diceType === 'd20' && result === 1);

      const diceResult: DiceResult = {
        diceType,
        result,
        modifier,
        total,
        isCritical,
        isNatural20,
        rolls
      };

      setLastResult(diceResult);

      // Play critical hit sound if applicable
      if (isCritical) {
        await soundService.playCriticalHit();
      }

      onRoll?.(diceResult);
    } catch (error) {
      console.error('Error rolling dice:', error);
    } finally {
      setIsRolling(false);
    }
  }, [selectedDice, modifier, disabled, isRolling, onRoll, soundService]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      rollDice();
    }
  }, [rollDice]);

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Dice Roller</h3>
      
      {/* Dice Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Dice Type</label>
        <div className="grid grid-cols-4 gap-2">
          {DICE_TYPES.map(dice => (
            <button
              key={dice.value}
              onClick={() => setSelectedDice(dice.value)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                selectedDice === dice.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {dice.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modifier */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Modifier</label>
        <input
          type="number"
          value={modifier}
          onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0"
        />
      </div>

      {/* Roll Button */}
      <Button
        onClick={rollDice}
        disabled={disabled || isRolling}
        className="w-full py-3 text-lg font-semibold"
        variant="primary"
      >
        {isRolling ? 'Rolling...' : `Roll ${selectedDice.toUpperCase()}${modifier !== 0 ? ` ${modifier > 0 ? '+' : ''}${modifier}` : ''}`}
      </Button>

      {/* Last Result */}
      {lastResult && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">
              {lastResult.total}
            </div>
            <div className="text-sm text-gray-300">
              {lastResult.diceType.toUpperCase()}: {lastResult.result}
              {lastResult.modifier !== 0 && (
                <span className="ml-1">
                  {lastResult.modifier > 0 ? '+' : ''}{lastResult.modifier}
                </span>
              )}
            </div>
            {lastResult.isNatural20 && (
              <div className="mt-2 text-yellow-400 font-semibold">
                🎯 Natural 20!
              </div>
            )}
            {lastResult.isCritical && !lastResult.isNatural20 && (
              <div className="mt-2 text-red-400 font-semibold">
                💀 Critical Failure!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts */}
      <div className="text-xs text-gray-400 text-center">
        Press Enter or Space to roll
      </div>
    </div>
  );
}; 