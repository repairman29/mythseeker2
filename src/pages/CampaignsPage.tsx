import React from 'react';
import { useAuth, useFirebase, useGameState } from '../hooks';
import { Button, LoadingSpinner, CampaignCreationModal } from '../components';
import { Campaign } from '../types';
import { useNavigate } from 'react-router-dom';
import AchievementService from '../services/achievementService';

const CampaignsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { getCampaigns, createCampaign } = useFirebase();
  const { joinCampaign } = useGameState();
  const navigate = useNavigate();
  
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  React.useEffect(() => {
    const loadCampaigns = async () => {
      // Don't load data if still authenticating
      if (authLoading) {
        return;
      }

      // If user is not authenticated, clear data and stop loading
      if (!user) {
        setCampaigns([]);
        setLoading(false);
        return;
      }

      // User is authenticated, load data
      try {
        const userCampaigns = await getCampaigns();
        console.log('Campaigns loaded:', userCampaigns.length, 'campaigns');
        console.log('Campaign details:', userCampaigns);
        setCampaigns(userCampaigns);
      } catch (error) {
        console.error('Failed to load campaigns:', error);
        // Don't show error to user, just log it
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, [user?.id, authLoading]); // Depend on both user.id and authLoading

  const handleCreateCampaign = async (campaignData: Partial<Campaign>) => {
    if (!user) return;
    
    setActionLoading(true);
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

        // Track achievement progress for hosting campaigns
        const newlyUnlocked = AchievementService.getInstance().processEvent(user.id, {
          type: 'campaigns_hosted',
          value: 1,
          campaignId: newCampaign.id
        });

        // Show achievement notifications
        newlyUnlocked.forEach((achievement: any) => {
          console.log(`🎉 Achievement Unlocked: ${achievement.name}!`);
          // TODO: Add toast notification here
        });
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinCampaign = async (campaignId: string) => {
    if (!user) return;
    
    console.log('Joining campaign:', campaignId);
    
    try {
      await joinCampaign(campaignId);
      console.log('Successfully joined campaign:', campaignId);

      // Small delay to ensure Firestore security rules propagate
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Track achievement progress for joining campaigns
      const newlyUnlocked = AchievementService.getInstance().processEvent(user.id, {
        type: 'campaigns_joined',
        value: 1,
        campaignId: campaignId
      });

      // Show achievement notifications
      newlyUnlocked.forEach((achievement: any) => {
        console.log(`🎉 Achievement Unlocked: ${achievement.name}!`);
        // TODO: Add toast notification here
      });

      // Navigate to the game page with campaign ID
      navigate(`/game/${campaignId}`);
    } catch (error) {
      console.error('Failed to join campaign:', error);
    }
  };

  const handleCreateDemoCampaigns = async () => {
    if (!user) return;
    
    setActionLoading(true);
    try {
      const demoCampaigns = [
        {
          name: "The Lost Mines of Phandelver",
          description: "A classic D&D adventure where you explore ancient ruins and face off against the Redbrands gang.",
          theme: "fantasy",
          maxPlayers: 5,
          settings: {
            difficulty: "easy" as const,
            ruleSet: "dnd5e" as const,
            aiPersonality: "dramatic" as const,
            voiceEnabled: false,
            allowPlayerSecrets: true,
            experienceType: "experience" as const,
            restingRules: "standard" as const
          }
        },
        {
          name: "Curse of Strahd",
          description: "A gothic horror adventure in the misty realm of Barovia, where you must defeat the vampire lord Strahd.",
          theme: "horror",
          maxPlayers: 6,
          settings: {
            difficulty: "hard" as const,
            ruleSet: "dnd5e" as const,
            aiPersonality: "mysterious" as const,
            voiceEnabled: false,
            allowPlayerSecrets: true,
            experienceType: "experience" as const,
            restingRules: "gritty" as const
          }
        },
        {
          name: "Storm King's Thunder",
          description: "An epic adventure across the Savage Frontier, dealing with giants and ancient magic.",
          theme: "epic",
          maxPlayers: 6,
          settings: {
            difficulty: "medium" as const,
            ruleSet: "dnd5e" as const,
            aiPersonality: "dramatic" as const,
            voiceEnabled: false,
            allowPlayerSecrets: true,
            experienceType: "experience" as const,
            restingRules: "standard" as const
          }
        }
      ];

      for (const campaignData of demoCampaigns) {
        console.log('Creating demo campaign:', campaignData.name);
        const newCampaign = await createCampaign({
          ...campaignData,
          host: user.id,
          players: [], // Don't pre-populate players array - let joinCampaign handle it
          isPublic: true,
          status: 'active',
          createdAt: new Date(),
          lastPlayedAt: new Date(),
          tags: ['demo', campaignData.theme]
        });
        console.log('Demo campaign created:', newCampaign);
      }

      // Reload campaigns
      const userCampaigns = await getCampaigns();
      setCampaigns(userCampaigns);

    } catch (error) {
      console.error('Failed to create demo campaigns:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Show loading spinner while authenticating or loading data
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // If not authenticated, show message
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">Please Sign In</h2>
          <p className="text-gray-300 mb-4">You need to be signed in to manage your campaigns.</p>
          <Button 
            variant="primary"
            onClick={() => navigate('/')}
          >
            Go to Sign In
          </Button>
        </div>
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
        <div className="flex space-x-3">
          <Button 
            onClick={handleCreateDemoCampaigns}
            variant="secondary"
            disabled={actionLoading}
          >
            {actionLoading ? 'Creating...' : 'Create Demo Campaigns'}
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            variant="primary"
          >
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Demo Campaigns Section */}
      {campaigns.length === 0 && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Quick Start</h3>
          <p className="text-gray-300 mb-4">
            Create demo campaigns to test the NPC system and other features.
          </p>
          <Button 
            onClick={handleCreateDemoCampaigns}
            variant="secondary"
            disabled={actionLoading}
          >
            {actionLoading ? 'Creating...' : 'Create Demo Campaigns'}
          </Button>
        </div>
      )}

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
              onClick={handleCreateDemoCampaigns}
              variant="secondary"
              disabled={actionLoading}
            >
              {actionLoading ? 'Creating...' : 'Create Demo Campaigns'}
            </Button>
          </div>
        </div>
      )}

      {/* Campaign Creation Modal */}
      <CampaignCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCampaign}
        loading={actionLoading}
      />
    </div>
  );
};

export default CampaignsPage; 