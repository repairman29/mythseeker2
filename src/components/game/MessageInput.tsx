import React, { useState, useRef, useEffect } from 'react';
import { Send, Lock, Dice6, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui';

interface MessageInputProps {
  onSendMessage: (content: string, isSecret?: boolean, targetUsers?: string[]) => void;
  onRollDice: (diceType: string) => void;
  disabled?: boolean;
  placeholder?: string;
  players?: Array<{ id: string; name: string }>;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  onRollDice, 
  disabled = false, 
  placeholder = "Describe your action...",
  players = []
}) => {
  const [message, setMessage] = useState('');
  const [isSecret, setIsSecret] = useState(false);
  const [targetUsers, setTargetUsers] = useState<string[]>([]);
  const [showTargetSelector, setShowTargetSelector] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || disabled) return;

    // Check for dice roll commands
    const diceMatch = message.trim().match(/^\/roll\s+(d\d+)/i);
    if (diceMatch) {
      onRollDice(diceMatch[1].toLowerCase());
      setMessage('');
      return;
    }

    // Send regular message
    onSendMessage(
      message.trim(), 
      isSecret, 
      isSecret && targetUsers.length > 0 ? targetUsers : undefined
    );
    setMessage('');
    setIsSecret(false);
    setTargetUsers([]);
    setShowTargetSelector(false);
  };

  const handleButtonClick = () => {
    handleSubmit();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleSecretMessage = () => {
    setIsSecret(!isSecret);
    if (!isSecret) {
      setShowTargetSelector(true);
    } else {
      setShowTargetSelector(false);
      setTargetUsers([]);
    }
  };

  const togglePlayerTarget = (playerId: string) => {
    setTargetUsers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const quickActions = [
    { label: 'Investigate', action: 'I carefully examine my surroundings for clues.' },
    { label: 'Listen', action: 'I listen carefully for any sounds.' },
    { label: 'Ready Action', action: 'I prepare to react to what happens next.' },
    { label: 'Help', action: 'I help an ally with their action.' }
  ];

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-3">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => setMessage(action.action)}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            disabled={disabled}
          >
            {action.label}
          </button>
        ))}
        
        <button
          onClick={() => onRollDice('d20')}
          className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors flex items-center gap-1"
          disabled={disabled}
        >
          <Dice6 className="h-3 w-3" />
          Roll d20
        </button>
      </div>

      {/* Target User Selector for Secret Messages */}
      {showTargetSelector && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800 mb-2">Send secret message to:</p>
          <div className="flex flex-wrap gap-2">
            {players.map(player => (
              <button
                key={player.id}
                onClick={() => togglePlayerTarget(player.id)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  targetUsers.includes(player.id)
                    ? 'bg-red-200 text-red-800'
                    : 'bg-white border border-red-300 text-red-600 hover:bg-red-100'
                }`}
              >
                {player.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={`
              w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg resize-none
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${isSecret ? 'border-red-300 bg-red-50' : ''}
              ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
            `}
            style={{ 
              minHeight: '40px',
              maxHeight: '120px',
              height: Math.min(120, Math.max(40, message.split('\n').length * 20 + 20))
            }}
          />
          
          {/* Secret Message Toggle */}
          <button
            type="button"
            onClick={toggleSecretMessage}
            className={`
              absolute right-2 top-2 p-1 rounded transition-colors
              ${isSecret ? 'text-red-600 bg-red-100' : 'text-gray-400 hover:text-gray-600'}
            `}
            title={isSecret ? 'Cancel secret message' : 'Send secret message'}
            disabled={disabled}
          >
            {isSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Button
          disabled={!message.trim() || disabled}
          icon={isSecret ? <Lock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          variant={isSecret ? 'danger' : 'primary'}
          onClick={handleButtonClick}
        >
          {isSecret ? 'Secret' : 'Send'}
        </Button>
      </form>

      {/* Command Help */}
      <div className="mt-2 text-xs text-gray-500">
        <p>
          Commands: <code>/roll d20</code>, <code>/roll d6</code>, etc. | 
          <strong>Shift+Enter</strong> for new line
        </p>
      </div>
    </div>
  );
}; 