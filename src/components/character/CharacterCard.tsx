import React from 'react';
import { User, Heart, Shield, Sword } from 'lucide-react';
import { Button } from '../ui';
import { Character } from '../../types';

interface CharacterCardProps {
  character: Character;
  onEdit?: () => void;
  onView?: () => void;
  onSelect?: () => void;
  onDelete?: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ 
  character, 
  onEdit, 
  onView, 
  onSelect,
  onDelete
}) => {
  const getClassColor = (characterClass: string | undefined) => {
    if (!characterClass) return 'from-gray-500 to-gray-600';
    
    const colorMap: Record<string, string> = {
      'fighter': 'from-red-500 to-red-600',
      'wizard': 'from-blue-500 to-blue-600',
      'rogue': 'from-gray-500 to-gray-600',
      'cleric': 'from-yellow-500 to-yellow-600',
      'ranger': 'from-green-500 to-green-600',
      'bard': 'from-purple-500 to-purple-600',
      'barbarian': 'from-orange-500 to-orange-600',
      'paladin': 'from-yellow-400 to-yellow-500',
      'warlock': 'from-indigo-500 to-indigo-600',
      'sorcerer': 'from-pink-500 to-pink-600',
      'monk': 'from-amber-500 to-amber-600',
      'druid': 'from-emerald-500 to-emerald-600'
    };
    return colorMap[characterClass.toLowerCase()] || 'from-gray-500 to-gray-600';
  };

  const formatRaceClass = (race: string | undefined, characterClass: string | undefined) => {
    const raceStr = race || 'Unknown';
    const classStr = characterClass || 'Unknown';
    return `${raceStr.charAt(0).toUpperCase() + raceStr.slice(1)} ${classStr.charAt(0).toUpperCase() + classStr.slice(1)}`;
  };

  const getHealthPercentage = () => {
    const current = character.hitPoints?.current || 0;
    const maximum = character.hitPoints?.maximum || 1;
    return (current / maximum) * 100;
  };

  const getHealthColor = () => {
    const percentage = getHealthPercentage();
    if (percentage > 75) return 'bg-green-500';
    if (percentage > 50) return 'bg-yellow-500';
    if (percentage > 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-700 group">
      {/* Character Avatar & Header */}
      <div className="flex items-center space-x-4 mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${getClassColor(character.class)} rounded-full flex items-center justify-center shadow-md`}>
          <span className="text-white font-bold text-lg">
            {(character.name || 'U').charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">
            {character.name || 'Unnamed Character'}
          </h3>
          <p className="text-sm text-gray-300">
            Level {character.level || 1} {formatRaceClass(character.race, character.class)}
          </p>
        </div>
        {character.level >= 10 && (
          <div className="text-yellow-500">
            <span className="text-xs font-medium bg-yellow-100 px-2 py-1 rounded-full">
              ⭐ Veteran
            </span>
          </div>
        )}
      </div>

      {/* Health Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-sm text-gray-300 mb-1">
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4 text-red-400" />
            Health
          </span>
          <span>{character.hitPoints?.current || 0}/{character.hitPoints?.maximum || 1}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`${getHealthColor()} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${getHealthPercentage()}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-1">
            <Shield className="h-3 w-3" />
            AC
          </div>
          <div className="font-bold text-white">{character.armorClass || 10}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-1">
            <Sword className="h-3 w-3" />
            Prof
          </div>
          <div className="font-bold text-white">+{character.proficiencyBonus || 2}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-1">
            <User className="h-3 w-3" />
            Speed
          </div>
          <div className="font-bold text-white">{character.speed || 30}ft</div>
        </div>
      </div>

      {/* Experience Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs text-gray-300 mb-1">
          <span>Experience</span>
          <span>{(character.experience || 0).toLocaleString()} XP</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1">
          <div 
            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(((character.experience || 0) % 1000) / 10, 100)}%` 
            }}
          />
        </div>
      </div>

      {/* Background & Personality Hint */}
      <div className="mb-4">
        <p className="text-xs text-gray-400 capitalize">
          {(character.background || 'folk hero').replace('-', ' ')} Background
        </p>
        {character.personality?.traits?.length > 0 && (
          <p className="text-xs text-gray-300 italic mt-1 line-clamp-2">
            "{character.personality.traits[0]}"
          </p>
        )}
      </div>

      {/* Campaign History */}
      {character.campaignHistory?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400">
            Adventures: {character.campaignHistory.length}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        {onSelect && (
          <Button 
            variant="primary" 
            size="sm" 
            fullWidth={!onEdit && !onDelete}
            onClick={onSelect}
          >
            Select
          </Button>
        )}
        {onEdit && (
          <Button 
            variant="outline" 
            size="sm" 
            fullWidth={!onSelect && !onDelete}
            onClick={onEdit}
          >
            Edit
          </Button>
        )}
        {onDelete && (
          <Button 
            variant="danger" 
            size="sm" 
            fullWidth={!onSelect && !onEdit}
            onClick={onDelete}
          >
            Delete
          </Button>
        )}
        {onView && (
          <Button 
            variant="ghost" 
            size="sm" 
            fullWidth={!onSelect && !onEdit && !onDelete}
            onClick={onView}
          >
            View Sheet
          </Button>
        )}
      </div>

      {/* Last Updated */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Updated {character.updatedAt?.toLocaleDateString() || 'Unknown'}
      </div>
    </div>
  );
}; 