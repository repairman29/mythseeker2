import React, { useEffect, useRef } from 'react';
import { User, Bot, Shield, Dice6 } from 'lucide-react';
import { GameMessage } from '../../types';

interface MessageListProps {
  messages: GameMessage[];
  currentUser: { id: string; displayName: string } | null;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUser }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'dm':
        return <Bot className="h-4 w-4 text-purple-600" />;
      case 'system':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'dice':
        return <Dice6 className="h-4 w-4 text-green-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMessageColor = (type: string, senderId: string) => {
    if (type === 'dm') return 'bg-purple-50 border-purple-200';
    if (type === 'system') return 'bg-blue-50 border-blue-200';
    if (type === 'dice') return 'bg-green-50 border-green-200';
    if (senderId === currentUser?.id) return 'bg-blue-100 border-blue-300';
    return 'bg-gray-50 border-gray-200';
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
          <p>{message.content}</p>
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium ${
            critical ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 
            'bg-white border border-gray-300'
          }`}>
            <Dice6 className="h-4 w-4" />
            <span>
              {diceType}: {result}
              {total !== result && ` (Total: ${total})`}
            </span>
            {critical && <span className="text-yellow-600">✨</span>}
          </div>
        </div>
      );
    }

    // Handle regular messages with potential formatting
    return (
      <div className="prose prose-sm max-w-none">
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`
            border rounded-lg p-4 shadow-sm slide-in-right
            ${getMessageColor(message.type, message.senderId)}
            ${message.isSecret ? 'ring-2 ring-red-300 bg-red-50' : ''}
          `}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getMessageIcon(message.type)}
              <span className="font-medium text-gray-900">
                {message.senderName}
                {message.type === 'dm' && ' (DM)'}
                {message.isSecret && ' 🤫'}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
          
          {renderMessageContent(message)}

          {/* Show target users for secret messages */}
          {message.isSecret && message.targetUsers && (
            <div className="mt-2 pt-2 border-t border-red-200">
              <p className="text-xs text-red-600">
                Secret message for: {message.targetUsers.join(', ')}
              </p>
            </div>
          )}
        </div>
      ))}
      
      {messages.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Welcome to your adventure!</p>
          <p className="text-sm">The story begins now...</p>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}; 