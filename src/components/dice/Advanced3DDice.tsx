import React, { useState, useEffect } from 'react';
import { DiceProps } from '../../types';

export const Advanced3DDice: React.FC<DiceProps> = ({ 
  type, 
  isRolling, 
  result, 
  onRoll, 
  size = 'md', 
  disabled = false 
}) => {
  const [rotation, setRotation] = useState(0);
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    if (isRolling) {
      setBouncing(true);
      const interval = setInterval(() => {
        setRotation(prev => prev + 30);
      }, 50);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        setBouncing(false);
        setRotation(0);
      }, 1500);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isRolling]);

  const getDiceSize = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8 text-xs';
      case 'lg': return 'w-16 h-16 text-lg';
      default: return 'w-12 h-12 text-sm';
    }
  };

  const getDiceColor = () => {
    switch (type) {
      case 'd4': return 'from-red-500 to-red-600';
      case 'd6': return 'from-green-500 to-green-600';
      case 'd8': return 'from-blue-500 to-blue-600';
      case 'd10': return 'from-yellow-500 to-yellow-600';
      case 'd12': return 'from-purple-500 to-purple-600';
      case 'd20': return 'from-indigo-500 to-indigo-600';
      case 'd100': return 'from-pink-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getDiceShape = () => {
    // Different shapes for different dice types
    switch (type) {
      case 'd4': return 'clip-path-triangle';
      case 'd6': return 'rounded-lg';
      case 'd8': return 'rounded-lg transform rotate-45';
      case 'd10': return 'rounded-xl';
      case 'd12': return 'rounded-2xl';
      case 'd20': return 'rounded-full';
      case 'd100': return 'rounded-lg';
      default: return 'rounded-lg';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={() => !disabled && !isRolling && onRoll(type)}
        disabled={disabled || isRolling}
        className={`
          ${getDiceSize()} bg-gradient-to-br ${getDiceColor()} ${getDiceShape()}
          flex items-center justify-center font-bold text-white
          transition-all duration-200 shadow-lg hover:shadow-xl
          ${isRolling ? 'animate-bounce dice-rolling' : 'hover:scale-110 active:scale-95'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${result === parseInt(type.substring(1)) ? 'critical-hit shadow-glow-yellow' : ''}
          ${result === 1 && type === 'd20' ? 'shadow-glow-red' : ''}
        `}
        style={{
          transform: `rotate(${rotation}deg) ${bouncing ? 'scale(1.1)' : 'scale(1)'}`,
          filter: isRolling ? 'brightness(1.3) drop-shadow(0 0 10px rgba(255,255,255,0.5))' : 'brightness(1)'
        }}
      >
        {!isRolling && result ? result : type.toUpperCase()}
      </button>
      
      {result && !isRolling && (
        <div className={`text-xs font-medium transition-all duration-300 ${
          result === parseInt(type.substring(1)) ? 'text-yellow-600 animate-pulse' : 
          result === 1 && type === 'd20' ? 'text-red-600 animate-pulse' : 'text-gray-600'
        }`}>
          {result === parseInt(type.substring(1)) && (
            <span className="flex items-center gap-1">
              ✨ <span className="font-bold">MAX!</span> ✨
            </span>
          )}
          {result === 1 && type === 'd20' && (
            <span className="flex items-center gap-1">
              💀 <span className="font-bold">CRIT FAIL</span> 💀
            </span>
          )}
          {result !== parseInt(type.substring(1)) && !(result === 1 && type === 'd20') && (
            <span>Result: {result}</span>
          )}
        </div>
      )}
    </div>
  );
}; 