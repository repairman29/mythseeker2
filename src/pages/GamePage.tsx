import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth, useDice, useFirebase, useAI } from '../hooks';
import { MessageList, MessageInput, LoadingSpinner, GameSidebar } from '../components';
import { Campaign, GameMessage, Character } from '../types';
import AchievementService from '../services/achievementService';

const GamePage: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { user } = useAuth();
  const { rollDice } = useDice();
  const { sendMessage, getMessages, subscribeToMessages, getCampaign, getCharacters } = useFirebase();
  const { generateResponse, addToHistory, getConversationHistory } = useAI();
  
  const [campaign, setCampaign] = React.useState<Campaign | null>(null);
  const [messages, setMessages] = React.useState<GameMessage[]>([]);
  const [characters, setCharacters] = React.useState<Character[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isAiResponding, setIsAiResponding] = React.useState(false);

  React.useEffect(() => {
    const loadCampaign = async () => {
      if (!campaignId) {
        console.log('No campaign ID provided');
        return;
      }
      
      console.log('Loading campaign with ID:', campaignId);
      
      try {
        const campaignData = await getCampaign(campaignId);
        console.log('Campaign loaded successfully:', campaignData);
        setCampaign(campaignData);
      } catch (error) {
        console.error('Failed to load campaign:', error);
        setError('Failed to load campaign');
      }
    };

    loadCampaign();
  }, [campaignId, getCampaign]);

  React.useEffect(() => {
    const loadCharacters = async () => {
      if (!user) return;
      
      try {
        const userCharacters = await getCharacters(user.id);
        setCharacters(userCharacters);
      } catch (error) {
        console.error('Failed to load characters:', error);
      }
    };

    loadCharacters();
  }, [user, getCharacters]);

  React.useEffect(() => {
    const loadMessages = async () => {
      if (!campaignId) return;
      
      try {
        const campaignMessages = await getMessages(campaignId, 50);
        setMessages(campaignMessages);
        
        // Add messages to AI conversation history
        campaignMessages.forEach(message => {
          addToHistory(campaignId, message);
        });
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (campaign) {
      loadMessages();
    }
  }, [campaign, campaignId, getMessages, addToHistory]);

  React.useEffect(() => {
    if (!campaignId) return;

    const unsubscribe = subscribeToMessages(campaignId, (newMessages) => {
      setMessages(newMessages);
      
      // Add new messages to AI history
      const existingIds = new Set(getConversationHistory(campaignId).map(m => m.id));
      newMessages.forEach(message => {
        if (!existingIds.has(message.id)) {
          addToHistory(campaignId, message);
        }
      });
    });

    return () => unsubscribe();
  }, [campaignId, subscribeToMessages, addToHistory, getConversationHistory]);

  const handleSendMessage = async (content: string) => {
    if (!user || !campaign) return;

    try {
      const message: Partial<GameMessage> = {
        campaignId: campaign.id,
        senderId: user.id,
        senderName: user.displayName,
        content,
        timestamp: new Date(),
        type: 'player'
      };

      await sendMessage(message);

      // Track achievement progress for sending messages
      const newlyUnlocked = AchievementService.getInstance().processEvent(user.id, {
        type: 'messages_sent',
        value: 1,
        campaignId: campaign.id
      });

      // Show achievement notifications
      newlyUnlocked.forEach((achievement: any) => {
        console.log(`🎉 Achievement Unlocked: ${achievement.name}!`);
        // TODO: Add toast notification here
      });

      // Generate AI response for player messages
      if (!isAiResponding) {
        setIsAiResponding(true);
        
        setTimeout(async () => {
          try {
            const aiContext = {
              campaign,
              recentMessages: messages.slice(-5),
              characters,
              worldState: {
                currentLocation: campaign.worldState.currentLocation,
                timeOfDay: campaign.worldState.timeOfDay,
                weather: campaign.worldState.weather,
                season: campaign.worldState.season,
                activeQuests: campaign.worldState.activeQuests?.map(q => q.title).join(', ') || 'No active quests',
                npcs: campaign.worldState.npcs || []
              }
            };
            
            const aiResponse = await generateResponse(
              aiContext,
              content,
              campaign.settings.aiPersonality || 'dramatic'
            );
            
            if (aiResponse) {
              const dmMessage: Partial<GameMessage> = {
                campaignId: campaign.id,
                senderId: 'dm-ai',
                senderName: 'Dungeon Master',
                content: aiResponse,
                timestamp: new Date(),
                type: 'dm',
                metadata: {
                  aiContext: {
                    model: 'gemini-pro',
                    responseTime: Date.now(),
                    confidence: 0.95
                  }
                }
              };
              
              await sendMessage(dmMessage);
            }
          } catch (error) {
            console.error('Failed to generate AI response:', error);
          } finally {
            setIsAiResponding(false);
          }
        }, 1000 + Math.random() * 2000); // Random delay for natural feel
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleDiceRoll = async (diceType: string, modifier: number = 0) => {
    if (!campaign) return;
    
    try {
      const roll = await rollDice(diceType, modifier);
      if (roll && user) {
        const message: Partial<GameMessage> = {
          campaignId: campaign.id,
          senderId: user.id,
          senderName: user.displayName,
          content: `🎲 Rolled ${diceType}${modifier > 0 ? ` + ${modifier}` : ''}: **${roll.total}**${roll.critical ? ' (Critical!)' : ''}`,
          timestamp: new Date(),
          type: 'dice',
          metadata: {
            diceRoll: {
              type: diceType,
              result: roll.result,
              total: roll.total,
              critical: roll.critical,
              modifier: modifier
            }
          }
        };

        await sendMessage(message);

        // Track achievement progress for dice rolls
        if (roll.critical) {
          const newlyUnlocked = AchievementService.getInstance().processEvent(user.id, {
            type: 'critical_hits',
            value: 1,
            campaignId: campaign.id
          });

          newlyUnlocked.forEach((achievement: any) => {
            console.log(`🎯 Critical Hit Achievement: ${achievement.name}!`);
          });
        }
      }
    } catch (error) {
      console.error('Failed to roll dice:', error);
    }
  };



  if (!campaignId) {
    return <Navigate to="/campaigns" replace />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-900 border border-red-700 text-red-100 px-6 py-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading || !campaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Game Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">{campaign.name}</h1>
            <p className="text-gray-300 text-sm">{campaign.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-white">Current Location</p>
              <p className="text-xs text-gray-400">{campaign.worldState.currentLocation}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white">Time</p>
              <p className="text-xs text-gray-400">{campaign.worldState.timeOfDay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Game Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <MessageList 
              messages={messages}
              currentUser={user ? { id: user.id, displayName: user.displayName } : null}
              isAiTyping={isAiResponding}
            />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4">
            <MessageInput 
              onSendMessage={handleSendMessage}
              onRollDice={handleDiceRoll}
              disabled={isAiResponding}
            />
          </div>
        </div>

        {/* Game Sidebar */}
        <GameSidebar
          campaignId={campaignId!}
          campaign={campaign}
          onLocationChange={(location: string) => {
            console.log('Location changed to:', location);
          }}
          onTimeAdvance={(hours: number) => {
            console.log('Time advanced by:', hours, 'hours');
          }}
          onFactionInteraction={(factionId: string, action: string) => {
            console.log('Faction interaction:', action, 'with', factionId);
          }}
          onTrade={(itemId: string, action: 'buy' | 'sell', quantity: number) => {
            console.log('Trade:', action, quantity, 'of', itemId);
          }}
        />
      </div>
    </div>
  );
};

export default GamePage; 