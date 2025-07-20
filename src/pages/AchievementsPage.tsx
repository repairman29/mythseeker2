import React, { useState, useEffect } from 'react';
import { AchievementCard } from '../components/achievement/AchievementCard';
import AchievementService, { AchievementProgress } from '../services/achievementService';
import { Achievement } from '../types';
import { useAuth } from '../context/AuthContext';

export const AchievementsPage: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userProgress, setUserProgress] = useState<AchievementProgress[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Achievement['category'] | 'all'>('all');
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);
  const [showUnearnedOnly, setShowUnearnedOnly] = useState(false);

  useEffect(() => {
    if (user) {
      const allAchievements = AchievementService.getInstance().getAllAchievements();
      const progress = AchievementService.getInstance().getUserProgress(user.id);
      
      setAchievements(allAchievements);
      setUserProgress(progress);
    }
  }, [user]);

  const categories: { value: Achievement['category'] | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '🏆' },
    { value: 'character', label: 'Character', icon: '👤' },
    { value: 'combat', label: 'Combat', icon: '⚔️' },
    { value: 'exploration', label: 'Exploration', icon: '🗺️' },
    { value: 'social', label: 'Social', icon: '💬' },
    { value: 'meta', label: 'Meta', icon: '⭐' }
  ];

  const filteredAchievements = achievements.filter(achievement => {
    // Category filter
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
      return false;
    }

    // Earned/Unearned filters
    const progress = userProgress.find(p => p.achievementId === achievement.id);
    const isEarned = progress?.earned || achievement.earned;

    if (showEarnedOnly && !isEarned) return false;
    if (showUnearnedOnly && isEarned) return false;

    return true;
  });

  const earnedCount = userProgress.filter(p => p.earned).length;
  const totalCount = achievements.length;
  const achievementScore = AchievementService.getInstance().getUserAchievementScore(user?.id || '');

  const getProgressForAchievement = (achievementId: string): AchievementProgress | undefined => {
    return userProgress.find(p => p.achievementId === achievementId);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">🏆 Achievements</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{earnedCount}</div>
              <div className="text-gray-400">Achievements Earned</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{totalCount}</div>
              <div className="text-gray-400">Total Achievements</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{achievementScore}</div>
              <div className="text-gray-400">Achievement Score</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`
                  px-4 py-2 rounded-lg transition-colors duration-200
                  ${selectedCategory === category.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }
                `}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>

          {/* Status filters */}
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showEarnedOnly}
                onChange={(e) => {
                  setShowEarnedOnly(e.target.checked);
                  if (e.target.checked) setShowUnearnedOnly(false);
                }}
                className="mr-2"
              />
              Show Earned Only
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showUnearnedOnly}
                onChange={(e) => {
                  setShowUnearnedOnly(e.target.checked);
                  if (e.target.checked) setShowEarnedOnly(false);
                }}
                className="mr-2"
              />
              Show Unearned Only
            </label>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map(achievement => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              progress={getProgressForAchievement(achievement.id)}
              showProgress={true}
            />
          ))}
        </div>

        {/* Empty state */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">No Achievements Found</h3>
            <p className="text-gray-400">
              Try adjusting your filters to see more achievements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 