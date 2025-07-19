import React from 'react';
import { useAuth, useFirebase, useGameState } from '../hooks';
import { Button, LoadingSpinner, CampaignCreationModal } from '../components';
import { Campaign } from '../types';

const CampaignsPage: React.FC = () => {
  const { user } = useAuth();
  const { getCampaigns, createCampaign } = useFirebase();
  const { joinCampaign } = useGameState();
  
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [creatingCampaign, setCreatingCampaign] = React.useState(false);

  React.useEffect(() => {
    const loadCampaigns = async () => {
      if (user) {
        try {
          const userCampaigns = await getCampaigns(user.id);
          setCampaigns(userCampaigns);
        } catch (error) {
          console.error('Failed to load campaigns:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCampaigns();
  }, [user, getCampaigns]);

  const handleCreateCampaign = async (campaignData: Partial<Campaign>) => {
    if (!user) return;
    
    setCreatingCampaign(true);
    try {
      const newCampaign = await createCampaign({
        ...campaignData,
        host: user.id,
        players: [],
        isPublic: false,
        status: 'active',
        createdAt: new Date(),
        lastPlayedAt: new Date(),
        tags: []
      });
      
      if (newCampaign) {
        setCampaigns(prev => [newCampaign, ...prev]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
    } finally {
      setCreatingCampaign(false);
    }
  };

  const handleJoinCampaign = async (campaignId: string) => {
    try {
      await joinCampaign(campaignId);
    } catch (error) {
      console.error('Failed to join campaign:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
          <p className="text-gray-300">Join or create D&D campaigns</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          variant="primary"
        >
          Create Campaign
        </Button>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  campaign.status === 'active' ? 'bg-green-600 text-white' :
                  campaign.status === 'paused' ? 'bg-yellow-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {campaign.status}
                </span>
              </div>
              
              <p className="text-gray-300 text-sm mb-4">{campaign.description}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Players:</span>
                  <span className="text-white">{campaign.players.length}/{campaign.maxPlayers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Theme:</span>
                  <span className="text-white capitalize">{campaign.theme}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Difficulty:</span>
                  <span className="text-white capitalize">{campaign.settings.difficulty}</span>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => handleJoinCampaign(campaign.id)}
                  className="flex-1"
                >
                  Join Campaign
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="flex-1"
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No campaigns yet</h3>
          <p className="text-gray-400 mb-6">
            Create your first campaign or join an existing one
          </p>
          <div className="space-x-4">
            <Button 
              onClick={() => setShowCreateModal(true)}
              variant="primary"
            >
              Create Campaign
            </Button>
            <Button 
              variant="secondary"
            >
              Browse Public Campaigns
            </Button>
          </div>
        </div>
      )}

      {/* Campaign Creation Modal */}
      <CampaignCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCampaign}
        loading={creatingCampaign}
      />
    </div>
  );
};

export default CampaignsPage; 