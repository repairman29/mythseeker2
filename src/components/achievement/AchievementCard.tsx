import React from 'react';
import { Achievement } from '../../types';
import { AchievementProgress } from '../../services/achievementService';

interface AchievementCardProps {
  achievement: Achievement;
  progress?: AchievementProgress;
  onClick?: () => void;
  showProgress?: boolean;
}

const rarityColors = {
  common: 'bg-gray-100 border-gray-300 text-gray-700',
  uncommon: 'bg-green-100 border-green-300 text-green-700',
  rare: 'bg-blue-100 border-blue-300 text-blue-700',
  epic: 'bg-purple-100 border-purple-300 text-purple-700',
  legendary: 'bg-yellow-100 border-yellow-300 text-yellow-700'
};

const rarityGradients = {
  common: 'from-gray-400 to-gray-500',
  uncommon: 'from-green-400 to-green-500',
  rare: 'from-blue-400 to-blue-500',
  epic: 'from-purple-400 to-purple-500',
  legendary: 'from-yellow-400 to-yellow-500'
};

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  progress,
  onClick,
  showProgress = true
}) => {
  const isEarned = achievement.earned || progress?.isCompleted;
  const progressPercentage = progress ? (progress.progress / progress.maxProgress) * 100 : 0;

  return (
    <div
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer
        ${isEarned 
          ? `${rarityColors[achievement.rarity]} shadow-lg transform scale-105` 
          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
        }
        ${onClick ? 'hover:shadow-md' : ''}
      `}
      onClick={onClick}
    >
      {/* Rarity indicator */}
      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-r ${rarityGradients[achievement.rarity]}`} />
      
      {/* Achievement icon */}
      <div className="flex items-center mb-3">
        <div className={`
          text-3xl mr-3 transition-transform duration-300
          ${isEarned ? 'animate-pulse' : 'opacity-50'}
        `}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-lg ${isEarned ? '' : 'text-gray-400'}`}>
            {achievement.name}
          </h3>
          <p className={`text-sm ${isEarned ? '' : 'text-gray-400'}`}>
            {achievement.description}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {showProgress && progress && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span>{progress.progress} / {progress.maxProgress}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                isEarned 
                  ? `bg-gradient-to-r ${rarityGradients[achievement.rarity]}`
                  : 'bg-gray-400'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Rewards */}
      {isEarned && achievement.rewards && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-600 mb-1">Rewards:</div>
          <div className="flex flex-wrap gap-2">
            {achievement.rewards.experience && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                +{achievement.rewards.experience} XP
              </span>
            )}
            {achievement.rewards.title && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                {achievement.rewards.title}
              </span>
            )}
            {achievement.rewards.cosmetic && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                {achievement.rewards.cosmetic}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Earned date */}
      {isEarned && achievement.earnedDate && (
        <div className="text-xs text-gray-500 mt-2">
          Earned: {achievement.earnedDate.toLocaleDateString()}
        </div>
      )}

      {/* Completion indicator */}
      {isEarned && (
        <div className="absolute top-2 left-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        </div>
      )}
    </div>
  );
}; 