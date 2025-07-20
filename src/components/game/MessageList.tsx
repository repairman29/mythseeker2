import React, { useEffect, useRef } from 'react';
import { User, Bot, Shield, Dice6 } from 'lucide-react';
import { GameMessage } from '../../types';

interface MessageListProps {
  messages: GameMessage[];
  currentUser: { id: string; displayName: string } | null;
  isAiTyping?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUser, isAiTyping = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'dm':
        return <Bot className="h-4 w-4 text-purple-400" />;
      case 'system':
        return <Shield className="h-4 w-4 text-blue-400" />;
      case 'dice':
        return <Dice6 className="h-4 w-4 text-green-400" />;
      default:
        return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  const getMessageColor = (type: string, senderId: string) => {
    if (type === 'dm') return 'bg-purple-900/30 border-purple-700/50';
    if (type === 'system') return 'bg-blue-900/30 border-blue-700/50';
    if (type === 'dice') return 'bg-green-900/30 border-green-700/50';
    if (senderId === currentUser?.id) return 'bg-blue-900/30 border-blue-700/50';
    return 'bg-gray-800/50 border-gray-700/50';
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessageContent = (message: GameMessage) => {
    // Handle dice roll messages with special formatting
    if (message.type === 'dice' && message.metadata?.diceRoll) {
      const { type: diceType, result, total, critical } = message.metadata.diceRoll;
      return (
        <div className="space-y-2">
          <p className="text-gray-200">{message.content}</p>
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium ${
            critical ? 'bg-yellow-900/50 text-yellow-200 border border-yellow-600/50' : 
            'bg-gray-700/50 border border-gray-600/50 text-gray-200'
          }`}>
            <Dice6 className="h-4 w-4" />
            <span>
              {diceType}: {result}
              {total !== result && ` (Total: ${total})`}
            </span>
            {critical && <span className="text-yellow-400">✨</span>}
          </div>
        </div>
      );
    }

    // Handle regular messages with potential formatting
    return (
      <div className="prose prose-sm max-w-none prose-invert">
        <p className="whitespace-pre-wrap text-gray-200">{message.content}</p>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`
            border rounded-lg p-4 shadow-lg slide-in-right backdrop-blur-sm
            ${getMessageColor(message.type, message.senderId)}
            ${message.isSecret ? 'ring-2 ring-red-500/50 bg-red-900/30' : ''}
            hover:shadow-xl transition-all duration-200
          `}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getMessageIcon(message.type)}
              <span className="font-medium text-gray-100">
                {message.senderName}
                {message.type === 'dm' && ' (DM)'}
                {message.isSecret && ' 🤫'}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
          
          {renderMessageContent(message)}

          {/* Show target users for secret messages */}
          {message.isSecret && message.targetUsers && (
            <div className="mt-2 pt-2 border-t border-red-700/50">
              <p className="text-xs text-red-400">
                Secret message for: {message.targetUsers.join(', ')}
              </p>
            </div>
          )}
        </div>
      ))}
      
      {isAiTyping && (
        <div className="border border-purple-700/50 rounded-lg p-4 shadow-lg bg-purple-900/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-4 w-4 text-purple-400" />
            <span className="font-medium text-gray-100">Dungeon Master</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
          <p className="text-sm text-gray-300 italic">Crafting your adventure...</p>
        </div>
      )}
      
      {messages.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <div className="bg-gray-800/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Bot className="h-8 w-8 text-gray-500" />
          </div>
          <p className="text-lg font-medium mb-2">Welcome to your adventure!</p>
          <p className="text-sm text-gray-500">The story begins now...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}; 