import React from 'react';
import { useAuth, useFirebase, useGameState } from '../hooks';
import { Button, CharacterCard, LoadingSpinner } from '../components';
import { Character, Campaign } from '../types';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { getCharacters, getCampaigns } = useFirebase();
  const { currentCampaign, joinCampaign } = useGameState();
  
  const [characters, setCharacters] = React.useState<Character[]>([]);
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      if (user) {
        try {
          const [userCharacters, userCampaigns] = await Promise.all([
            getCharacters(user.id),
            getCampaigns(user.id)
          ]);
          setCharacters(userCharacters);
          setCampaigns(userCampaigns);
        } catch (error) {
          console.error('Failed to load dashboard data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDashboardData();
  }, [user, getCharacters, getCampaigns]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, {user?.displayName}!
        </h1>
        <p className="text-gray-300">
          Ready for your next adventure? Create a character or join a campaign to get started.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button variant="primary" className="w-full">
              Create Character
            </Button>
            <Button variant="secondary" className="w-full">
              Join Campaign
            </Button>
            <Button variant="secondary" className="w-full">
              Start Solo Adventure
            </Button>
          </div>
        </div>

        {/* Current Campaign */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Current Campaign</h2>
          {currentCampaign ? (
            <div className="space-y-3">
              <h3 className="text-white font-medium">{currentCampaign.name}</h3>
              <p className="text-gray-300 text-sm">{currentCampaign.description}</p>
              <Button variant="primary" className="w-full">
                Continue Playing
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 mb-4">No active campaign</p>
              <Button variant="secondary" className="w-full">
                Find Campaign
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Your Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Characters:</span>
              <span className="text-white font-medium">{characters.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Campaigns:</span>
              <span className="text-white font-medium">{campaigns.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Sessions:</span>
              <span className="text-white font-medium">{user?.stats?.sessionsAttended || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Characters */}
      {characters.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Characters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.slice(0, 3).map(character => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        </div>
      )}

      {/* Available Campaigns */}
      {campaigns.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Available Campaigns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.slice(0, 3).map(campaign => (
              <div key={campaign.id} className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">{campaign.name}</h3>
                <p className="text-gray-300 text-sm mb-3">{campaign.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">
                    {campaign.players.length}/{campaign.maxPlayers} players
                  </span>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => joinCampaign(campaign.id)}
                  >
                    Join
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage; 