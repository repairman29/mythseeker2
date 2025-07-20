import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth, useDice, useFirebase, useAI } from '../hooks';
import { MessageList, MessageInput, LoadingSpinner, GameSidebar } from '../components';
import { Campaign, GameMessage, Character } from '../types';
import AchievementService from '../services/achievementService';
import { 
  createItemDiscoveryMessage, 
  createChoicePromptMessage, 
  createLootDropMessage,
  createNPCInteractionMessage,
  sampleItems,
  sampleChoices 
} from '../utils/structuredMessageHelpers';

const GamePage: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { user } = useAuth();
  const { rollDice } = useDice();
  const { sendMessage, sendAIMessage, getMessages, subscribeToMessages, getCampaign, getCharacters } = useFirebase();
  const { generateResponse, addToHistory, getConversationHistory } = useAI();
  
  const [campaign, setCampaign] = React.useState<Campaign | null>(null);
  const [messages, setMessages] = React.useState<GameMessage[]>([]);
  const [characters, setCharacters] = React.useState<Character[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isAiResponding, setIsAiResponding] = React.useState(false);
  const [welcomeMessageSent, setWelcomeMessageSent] = React.useState(false);
  const [isGeneratingWelcome, setIsGeneratingWelcome] = React.useState(false);

  React.useEffect(() => {
    const loadCampaign = async () => {
      if (!campaignId) {
        console.log('No campaign ID provided');
        return;
      }
      
      console.log('Loading campaign with ID:', campaignId);
      
      try {
        const campaignData = await getCampaign(campaignId);
        console.log('🎭 GamePage: Campaign loaded successfully:', {
          id: campaignData.id,
          name: campaignData.name,
          theme: campaignData.theme,
          worldState: campaignData.worldState,
          settings: campaignData.settings,
          hasWorldState: !!campaignData.worldState,
          hasSettings: !!campaignData.settings
        });
        setCampaign(campaignData);
        setWelcomeMessageSent(false); // Reset welcome message state for new campaign
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
        
        // If this is a new campaign with no messages, generate AI welcome
        if (campaignMessages.length === 0 && campaign && !welcomeMessageSent) {
          console.log('🎭 GamePage: New campaign detected, generating AI welcome message...');
          generateAIWelcomeMessage();
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (campaign) {
      loadMessages();
    }
  }, [campaign, campaignId, getMessages, addToHistory, welcomeMessageSent]);

  // Function to generate AI welcome message
  const generateAIWelcomeMessage = async () => {
    if (!campaign || !user || isGeneratingWelcome) return;
    
    console.log('🎭 GamePage: Generating AI welcome message for campaign:', campaign.name);
    setIsGeneratingWelcome(true);
    
    try {
      const welcomeContext = {
        campaign,
        recentMessages: [],
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
      
      // Create a welcome prompt that sets the stage
      const characterInfo = characters.length > 0 
        ? `\nPlayer Characters: ${characters.map(c => `${c.name} (${c.race} ${c.class})`).join(', ')}`
        : '\nPlayer Characters: None yet created';
        
      const welcomePrompt = `You are the Dungeon Master for "${campaign.name}", a ${campaign.theme} themed adventure. 

Current World State:
- Location: ${campaign.worldState.currentLocation}
- Time: ${campaign.worldState.timeOfDay}
- Weather: ${campaign.worldState.weather}
- Season: ${campaign.worldState.season}
- Active Quests: ${campaign.worldState.activeQuests?.map(q => q.title).join(', ') || 'None'}${characterInfo}

Please set the stage for the players by describing the current scene, atmosphere, and any immediate context they should be aware of. Make it engaging, immersive, and true to the ${campaign.theme} theme. Consider the time of day, weather, and location to create a vivid picture of where the players find themselves.`;
      
      console.log('🎭 GamePage: Sending welcome prompt to AI:', welcomePrompt);
      
      const aiResponse = await generateResponse(
        welcomeContext,
        welcomePrompt,
        campaign.settings.aiPersonality || 'dramatic'
      );
      
      console.log('🎭 GamePage: AI welcome response received:', aiResponse ? aiResponse.substring(0, 100) + '...' : 'No response');
      
      if (aiResponse) {
        const aiContext = {
          model: 'gemini-pro',
          responseTime: Date.now(),
          confidence: 0.95,
          isWelcomeMessage: true
        };
        
        await sendAIMessage(campaign.id, aiResponse, aiContext);
        console.log('🎭 GamePage: AI welcome message sent to Firebase');
        setWelcomeMessageSent(true); // Set flag after successful welcome message
      } else {
        console.log('🎭 GamePage: No AI welcome response generated');
      }
    } catch (error) {
      console.error('Failed to generate AI welcome message:', error);
    } finally {
      setIsGeneratingWelcome(false);
    }
  };

  React.useEffect(() => {
    if (!campaignId) return;

    console.log('🔍 Setting up message subscription for campaign:', campaignId);

    const unsubscribe = subscribeToMessages(campaignId, (newMessages) => {
      console.log('📨 Received messages from subscription:', newMessages.length, 'messages');
      console.log('📨 Latest message:', newMessages[newMessages.length - 1]);
      
      setMessages(newMessages);
      
      // Add new messages to AI history
      const existingIds = new Set(getConversationHistory(campaignId).map(m => m.id));
      newMessages.forEach(message => {
        if (!existingIds.has(message.id)) {
          addToHistory(campaignId, message);
        }
      });
    });

    return () => {
      console.log('🔍 Unsubscribing from messages for campaign:', campaignId);
      unsubscribe();
    };
  }, [campaignId, subscribeToMessages, addToHistory, getConversationHistory]);

  const handleSendMessage = async (content: string) => {
    if (!user || !campaign) {
      console.log('❌ Cannot send message: user or campaign missing', { user: !!user, campaign: !!campaign });
      return;
    }

    console.log('🚀 Attempting to send message:', { content, userId: user.id, campaignId: campaign.id });

    try {
      const message: Partial<GameMessage> = {
        campaignId: campaign.id,
        senderId: user.id,
        senderName: user.displayName,
        content,
        timestamp: new Date(),
        type: 'player'
      };

      console.log('📝 Message object created:', message);
      const messageId = await sendMessage(message);
      console.log('✅ Message sent successfully with ID:', messageId);

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
            
            console.log('🎭 GamePage: Preparing AI context:', {
              campaignName: aiContext.campaign.name,
              campaignId: aiContext.campaign.id,
              recentMessagesCount: aiContext.recentMessages.length,
              charactersCount: aiContext.characters.length,
              worldState: aiContext.worldState,
              userInput: content
            });
            
            const aiResponse = await generateResponse(
              aiContext,
              content,
              campaign.settings.aiPersonality || 'dramatic'
            );
            
            console.log('🎭 GamePage: AI response received:', aiResponse ? aiResponse.substring(0, 100) + '...' : 'No response');
            
            if (aiResponse) {
              const aiContext = {
                model: 'gemini-pro',
                responseTime: Date.now(),
                confidence: 0.95
              };
              
              await sendAIMessage(campaign.id, aiResponse, aiContext);
              console.log('🎭 GamePage: AI message sent to Firebase');
            } else {
              console.log('🎭 GamePage: No AI response generated');
            }
          } catch (error) {
            console.error('Failed to generate AI response:', error);
          } finally {
            setIsAiResponding(false);
          }
        }, 1000 + Math.random() * 2000); // Random delay for natural feel
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
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

  const handleActionClick = async (action: any) => {
    if (!user || !campaign) return;

    try {
      console.log('Action clicked:', action);
      
      // Create a message about the action taken
      const actionMessage: Partial<GameMessage> = {
        campaignId: campaign.id,
        senderId: user.id,
        senderName: user.displayName,
        content: `⚡ ${user.displayName} ${action.label.toLowerCase()}`,
        timestamp: new Date(),
        type: 'player'
      };

      await sendMessage(actionMessage);

      // Handle different action types
      switch (action.type) {
        case 'add_to_inventory':
          console.log('Adding item to inventory:', action);
          // TODO: Implement inventory management
          break;
        case 'equip':
          console.log('Equipping item:', action);
          // TODO: Implement equipment system
          break;
        case 'use':
          console.log('Using item:', action);
          // TODO: Implement item usage
          break;
        case 'examine':
          console.log('Examining item:', action);
          // TODO: Show detailed item info
          break;
        case 'attack':
          console.log('Attacking:', action);
          // TODO: Implement combat system
          break;
        case 'interact':
          console.log('Interacting:', action);
          // TODO: Handle NPC interactions
          break;
        default:
          console.log('Unknown action type:', action.type);
      }

      // Generate AI response based on the action
      if (!isAiResponding) {
        setIsAiResponding(true);
        
        setTimeout(async () => {
          try {
            const aiContext = {
              campaign,
              recentMessages: messages.slice(-5),
              characters,
              action: action,
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
              `Player performed action: ${action.label}`,
              campaign.settings.aiPersonality || 'dramatic'
            );
            
            if (aiResponse) {
              const aiContext = {
                model: 'gemini-pro',
                responseTime: Date.now(),
                confidence: 0.95
              };
              
              await sendAIMessage(campaign.id, aiResponse, aiContext);
            }
          } catch (error) {
            console.error('Failed to generate AI response for action:', error);
          } finally {
            setIsAiResponding(false);
          }
        }, 1000 + Math.random() * 2000);
      }
    } catch (error) {
      console.error('Failed to handle action:', error);
    }
  };

  const handleChoiceClick = async (choice: any) => {
    if (!user || !campaign) return;

    try {
      console.log('Choice selected:', choice);
      
      // Create a message about the choice made
      const choiceMessage: Partial<GameMessage> = {
        campaignId: campaign.id,
        senderId: user.id,
        senderName: user.displayName,
        content: `🤔 ${user.displayName} chose: ${choice.label}`,
        timestamp: new Date(),
        type: 'player'
      };

      await sendMessage(choiceMessage);

      // Handle choice consequences
      if (choice.consequences) {
        choice.consequences.forEach((consequence: any) => {
          console.log('Consequence:', consequence);
          // TODO: Apply consequences (reputation, relationships, etc.)
        });
      }

      // Generate AI response based on the choice
      if (!isAiResponding) {
        setIsAiResponding(true);
        
        setTimeout(async () => {
          try {
            const aiContext = {
              campaign,
              recentMessages: messages.slice(-5),
              characters,
              choice: choice,
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
              `Player made choice: ${choice.label}`,
              campaign.settings.aiPersonality || 'dramatic'
            );
            
            if (aiResponse) {
              const aiContext = {
                model: 'gemini-pro',
                responseTime: Date.now(),
                confidence: 0.95
              };
              
              await sendAIMessage(campaign.id, aiResponse, aiContext);
            }
          } catch (error) {
            console.error('Failed to generate AI response for choice:', error);
          } finally {
            setIsAiResponding(false);
          }
        }, 1000 + Math.random() * 2000);
      }
    } catch (error) {
      console.error('Failed to handle choice:', error);
    }
  };

  const testStructuredMessages = async () => {
    if (!campaign) return;

    try {
      // Test item discovery
      const itemMessage = createItemDiscoveryMessage(
        campaign.id,
        [sampleItems[0], sampleItems[1]],
        "You search the fallen bandit's body and find some useful items!"
      );
      await sendAIMessage(campaign.id, "You discover some items!", { structuredContent: itemMessage.structuredContent });

      // Test choice prompt
      setTimeout(async () => {
        const choiceMessage = createChoicePromptMessage(
          campaign.id,
          "The Town Guard Approaches",
          "A stern-looking guard approaches you. 'We've been having trouble with bandits on the road. Would you be willing to help us?'",
          sampleChoices
        );
        await sendAIMessage(campaign.id, "The guard offers you a quest.", { structuredContent: choiceMessage.structuredContent });
      }, 2000);

      // Test loot drop
      setTimeout(async () => {
        const lootMessage = createLootDropMessage(
          campaign.id,
          [sampleItems[2]],
          150,
          200
        );
        await sendAIMessage(campaign.id, "You found some valuable loot!", { structuredContent: lootMessage.structuredContent });
      }, 4000);

    } catch (error) {
      console.error('Failed to test structured messages:', error);
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

  if (isGeneratingWelcome) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-300">🎭 AI Dungeon Master is setting the stage...</p>
        </div>
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
            <button
              onClick={testStructuredMessages}
              className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors"
              title="Test structured messages"
            >
              🧪 Test
            </button>
            <button
              onClick={generateAIWelcomeMessage}
              disabled={isGeneratingWelcome}
              className={`px-3 py-1 text-white text-xs rounded transition-colors ${
                isGeneratingWelcome 
                  ? 'bg-purple-800 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
              title="AI sets the stage for current scene"
            >
              {isGeneratingWelcome ? '🎭 Setting...' : '🎭 Set Stage'}
            </button>
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
              onActionClick={handleActionClick}
              onChoiceClick={handleChoiceClick}
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