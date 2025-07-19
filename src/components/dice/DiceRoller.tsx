import React, { useState } from 'react';
import { Dice6, Target, Eye, Shield, Sword } from 'lucide-react';
import { Advanced3DDice } from './Advanced3DDice';
import { Button } from '../ui';
import { DiceType } from '../../types';

interface DiceRollResult {
  id: string;
  type: string;
  result: number;
  modifier: number;
  total: number;
  critical: boolean;
  timestamp: Date;
}

interface DiceRollerProps {
  onRoll: (diceType: string, result: number, total: number, critical: boolean) => void;
  disabled?: boolean;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({ onRoll, disabled = false }) => {
  const [currentRolls, setCurrentRolls] = useState<Map<string, { isRolling: boolean; result?: number }>>(new Map());
  const [modifier, setModifier] = useState(0);
  const [rollHistory, setRollHistory] = useState<DiceRollResult[]>([]);

  const rollDice = async (diceType: string) => {
    if (disabled) return;

    setCurrentRolls(prev => new Map(prev).set(diceType, { isRolling: true }));

    setTimeout(() => {
      const sides = diceType === 'd100' ? 100 : parseInt(diceType.substring(1));
      const result = Math.floor(Math.random() * sides) + 1;
      const total = result + modifier;
      const critical = (diceType === 'd20' && (result === 20 || result === 1));

      setCurrentRolls(prev => new Map(prev).set(diceType, { isRolling: false, result }));

      const rollEntry: DiceRollResult = {
        id: 'roll-' + Date.now(),
        type: diceType,
        result,
        modifier,
        total,
        critical,
        timestamp: new Date()
      };
      setRollHistory(prev => [rollEntry, ...prev.slice(0, 9)]);

      onRoll(diceType, result, total, critical);

      setTimeout(() => {
        setCurrentRolls(prev => {
          const newMap = new Map(prev);
          newMap.delete(diceType);
          return newMap;
        });
      }, 3000);
    }, 1500);
  };

  const diceTypes: Array<{ type: DiceType; label: string; sides: number }> = [
    { type: 'd4', label: 'd4', sides: 4 },
    { type: 'd6', label: 'd6', sides: 6 },
    { type: 'd8', label: 'd8', sides: 8 },
    { type: 'd10', label: 'd10', sides: 10 },
    { type: 'd12', label: 'd12', sides: 12 },
    { type: 'd20', label: 'd20', sides: 20 },
    { type: 'd100', label: 'd%', sides: 100 }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Dice6 className="h-5 w-5 text-blue-600" />
          Dice Roller
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Modifier:</span>
          <input
            type="number"
            value={modifier}
            onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            min="-10"
            max="10"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {diceTypes.map(dice => {
          const rollState = currentRolls.get(dice.type);
          return (
            <Advanced3DDice
              key={dice.type}
              type={dice.type}
              isRolling={rollState?.isRolling || false}
              result={rollState?.result}
              onRoll={rollDice}
              disabled={disabled}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => rollDice('d20')}
          disabled={disabled}
          icon={<Target className="h-4 w-4" />}
        >
          Attack Roll
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => rollDice('d20')}
          disabled={disabled}
          icon={<Eye className="h-4 w-4" />}
        >
          Skill Check
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => rollDice('d20')}
          disabled={disabled}
          icon={<Shield className="h-4 w-4" />}
        >
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => rollDice('d6')}
          disabled={disabled}
          icon={<Sword className="h-4 w-4" />}
        >
          Damage
        </Button>
      </div>

      {rollHistory.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Rolls</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {rollHistory.map(roll => (
              <div key={roll.id} className={`flex justify-between items-center text-xs px-2 py-1 rounded ${
                roll.critical ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-50 text-gray-600'
              }`}>
                <span className="font-medium">
                  {roll.type}: {roll.result}
                  {roll.modifier !== 0 && ` ${roll.modifier >= 0 ? '+' : ''}${roll.modifier}`}
                  {roll.modifier !== 0 && ` = ${roll.total}`}
                </span>
                <span className="text-gray-500">
                  {roll.timestamp.toLocaleTimeString([], { timeStyle: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 