import React, { useEffect, useRef } from 'react';
import { User, Bot, Shield, Dice6, MessageCircle, AlertTriangle } from 'lucide-react';
import { GameMessage } from '../../types';

interface MessageListProps {
  messages: GameMessage[];
  currentUser: { id: string; displayName: string } | null;
  isAiTyping?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  isAiTyping = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageTime.toLocaleDateString();
  };

  const getMessageIcon = (type: string, senderId: string) => {
    if (senderId === 'dm-ai') return <Bot className="h-4 w-4 text-purple-400" />;
    if (type === 'dm') return <Shield className="h-4 w-4 text-blue-400" />;
    if (type === 'system') return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    if (type === 'dice') return <Dice6 className="h-4 w-4 text-green-400" />;
    if (type === 'combat') return <Shield className="h-4 w-4 text-red-400" />;
    return <User className="h-4 w-4 text-gray-400" />;
  };

  const getMessageColor = (type: string, senderId: string) => {
    const isCurrentUser = currentUser && senderId === currentUser.id;
    
    if (senderId === 'dm-ai') {
      return 'bg-purple-900/30 border-purple-700/50 text-purple-100';
    }
    
    if (type === 'dm') {
      return 'bg-blue-900/30 border-blue-700/50 text-blue-100';
    }
    
    if (type === 'system') {
      return 'bg-yellow-900/30 border-yellow-700/50 text-yellow-100';
    }
    
    if (type === 'dice') {
      return 'bg-green-900/30 border-green-700/50 text-green-100';
    }
    
    if (type === 'combat') {
      return 'bg-red-900/30 border-red-700/50 text-red-100';
    }
    
    if (isCurrentUser) {
      return 'bg-gray-700/50 border-gray-600/50 text-gray-100';
    }
    
    return 'bg-gray-800/50 border-gray-700/50 text-gray-100';
  };

  const renderMessageContent = (message: GameMessage) => {
    // Handle dice roll messages
    if (message.type === 'dice' && message.metadata?.diceRoll) {
      const { diceRoll } = message.metadata;
      return (
        <div className="space-y-2">
          <div className="text-lg font-mono font-bold">
            {Array.isArray(diceRoll.result) ? diceRoll.result.join(' + ') : diceRoll.result} = <span className="text-2xl text-green-400">{diceRoll.total}</span>
            {diceRoll.critical && <span className="ml-2 text-red-400 animate-pulse">💥 CRITICAL!</span>}
          </div>
          <div className="text-sm text-gray-400">
            {diceRoll.type} {diceRoll.modifier > 0 ? `+${diceRoll.modifier}` : diceRoll.modifier < 0 ? diceRoll.modifier : ''}
          </div>
        </div>
      );
    }

    // Handle combat messages
    if (message.type === 'combat') {
      return (
        <div className="space-y-2">
          <div className="font-semibold text-red-300">{message.content}</div>
          {message.metadata?.combatAction && (
            <div className="text-sm text-red-400 bg-red-900/30 p-2 rounded">
              {typeof message.metadata.combatAction === 'string' 
                ? message.metadata.combatAction 
                : JSON.stringify(message.metadata.combatAction)
              }
            </div>
          )}
        </div>
      );
    }

    // Handle regular messages with markdown-like formatting
    const formattedContent = message.content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-yellow-300">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-blue-300">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1 rounded text-green-300">$1</code>');

    return (
      <div 
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    );
  };

  const getMessageAnimation = (index: number) => {
    const animations = [
      'animate-fade-in-up',
      'animate-fade-in-left',
      'animate-fade-in-right',
      'animate-slide-in-bottom'
    ];
    return animations[index % animations.length];
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-800 relative messages-scrollbar">
      {/* Messages Container */}
      <div className="p-4 space-y-4 min-h-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="h-16 w-16 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No messages yet</h3>
            <p className="text-sm text-center max-w-md">
              Start the adventure by sending your first message! The AI Dungeon Master will respond and guide your journey.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={message.id} 
              className={`
                border rounded-lg p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl card-hover message-bubble
                ${getMessageColor(message.type, message.senderId)}
                ${getMessageAnimation(index)}
                ${message.isSecret ? 'ring-2 ring-red-500/50 bg-red-900/30' : ''}
              `}
            >
              {/* Message Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getMessageIcon(message.type, message.senderId)}
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-100">
                      {message.senderName}
                      {message.type === 'dm' && ' (DM)'}
                      {message.isSecret && ' 🤫'}
                    </span>
                    {message.metadata?.aiContext && (
                      <span className="text-xs bg-purple-800/50 text-purple-200 px-2 py-1 rounded-full">
                        AI
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              
              {/* Message Content */}
              <div className="space-y-2">
                {renderMessageContent(message)}
              </div>

              {/* Message Metadata */}
              {message.metadata && (
                <div className="mt-3 pt-2 border-t border-gray-600/30">
                  {message.metadata.aiContext && (
                    <div className="text-xs text-purple-400">
                      AI Response • {message.metadata.aiContext.model} • {Math.round(message.metadata.aiContext.responseTime)}ms
                    </div>
                  )}
                  
                  {/* Show target users for secret messages */}
                  {message.isSecret && message.targetUsers && (
                    <div className="text-xs text-red-400 mt-1">
                      Secret message for: {message.targetUsers.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {/* AI Typing Indicator */}
        {isAiTyping && (
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-400 animate-bounce" />
              <span className="text-purple-200 font-medium">Dungeon Master is typing...</span>
            </div>
            <div className="flex space-x-1 mt-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll to bottom anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}; 