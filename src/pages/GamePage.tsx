import React from 'react';
import { useAuth, useDice, useFirebase } from '../hooks';
import { MessageList, MessageInput, WorldPanel, DiceRoller, LoadingSpinner } from '../components';
import { Campaign, GameMessage } from '../types';

interface GamePageProps {
  campaign: Campaign;
}

const GamePage: React.FC<GamePageProps> = ({ campaign }) => {
  const { user } = useAuth();
  const { rollDice } = useDice();
  const { sendMessage, getMessages, subscribeToMessages } = useFirebase();
  
  const [messages, setMessages] = React.useState<GameMessage[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadMessages = async () => {
      try {
        const campaignMessages = await getMessages(campaign.id, 50);
        setMessages(campaignMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [campaign.id, getMessages]);

  React.useEffect(() => {
    const unsubscribe = subscribeToMessages(campaign.id, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [campaign.id, subscribeToMessages]);

  const handleSendMessage = async (content: string) => {
    if (!user) return;

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
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleDiceRoll = async (diceType: string, modifier: number = 0) => {
    try {
      const roll = await rollDice(diceType, modifier);
      if (roll && user) {
        const message: Partial<GameMessage> = {
          campaignId: campaign.id,
          senderId: user.id,
          senderName: user.displayName,
          content: `🎲 Rolled ${diceType}${modifier > 0 ? ` + ${modifier}` : ''}: **${roll.total}**${roll.critical ? ' (Critical!)' : ''}`,
          timestamp: new Date(),
          type: 'dice'
        };

        await sendMessage(message);
      }
    } catch (error) {
      console.error('Failed to roll dice:', error);
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
            />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4">
            <MessageInput 
              onSendMessage={handleSendMessage}
              onRollDice={handleDiceRoll}
              disabled={false}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* World Panel */}
          <div className="flex-1 overflow-y-auto">
            <WorldPanel 
              campaign={campaign}
            />
          </div>

          {/* Dice Roller */}
          <div className="border-t border-gray-700 p-4">
            <DiceRoller 
              onRoll={(diceType, result, total) => {
                handleDiceRoll(diceType, total - result);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage; 