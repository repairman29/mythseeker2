import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, SoundSettings } from '../components/ui';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [showSoundSettings, setShowSoundSettings] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold">MythSeeker Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSoundSettings(true)}
                className="p-2 text-gray-300 hover:text-white transition-colors"
                title="Sound Settings"
              >
                🔊
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">
                  Welcome, {user?.displayName || user?.email}
                </span>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Characters Created</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Campaigns Hosted</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Messages Sent</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Achievements Earned</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/characters"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-center font-medium transition-colors"
              >
                Create Character
              </Link>
              <Link
                to="/campaigns"
                className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg text-center font-medium transition-colors"
              >
                Host Campaign
              </Link>
              <Link
                to="/achievements"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg text-center font-medium transition-colors"
              >
                View Achievements
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="text-gray-400 text-sm">
                <p>Welcome to MythSeeker!</p>
                <p className="mt-2">Start by creating a character or hosting a campaign.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="text-3xl mb-3">🎭</div>
            <h3 className="text-lg font-semibold mb-2">Character Creation</h3>
            <p className="text-gray-300 text-sm">
              Create and customize your characters with detailed stats and backgrounds.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="text-3xl mb-3">🏕️</div>
            <h3 className="text-lg font-semibold mb-2">Campaign Management</h3>
            <p className="text-gray-300 text-sm">
              Host and join campaigns with AI-powered storytelling and dynamic worlds.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="text-3xl mb-3">🎲</div>
            <h3 className="text-lg font-semibold mb-2">Dice Rolling</h3>
            <p className="text-gray-300 text-sm">
              Advanced dice rolling with 3D animations and synchronized results.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="text-lg font-semibold mb-2">Achievements</h3>
            <p className="text-gray-300 text-sm">
              Earn achievements and track your progress across all game activities.
            </p>
          </div>
        </div>
      </main>

      {/* Sound Settings Modal */}
      <SoundSettings
        isOpen={showSoundSettings}
        onClose={() => setShowSoundSettings(false)}
      />
    </div>
  );
}; 