import React, { useState, useRef, useEffect } from 'react';
import { Send, Dice6, Eye, EyeOff, Users, Smile, Mic, Paperclip } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string, isSecret?: boolean, targetUsers?: string[]) => void;
  onRollDice: (diceType: string, modifier?: number) => void;
  disabled?: boolean;
  placeholder?: string;
  players?: Array<{ id: string; displayName: string }>;
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || disabled) return;

    // Check for dice roll commands
    const diceMatch = message.trim().match(/^\/roll\s+(d\d+)(?:\s+([+-]?\d+))?/i);
    if (diceMatch) {
      const diceType = diceMatch[1].toLowerCase();
      const modifier = diceMatch[2] ? parseInt(diceMatch[2]) : 0;
      onRollDice(diceType, modifier);
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
    { label: 'Investigate', action: 'I carefully examine my surroundings for clues.', icon: '🔍' },
    { label: 'Listen', action: 'I listen carefully for any sounds.', icon: '👂' },
    { label: 'Ready Action', action: 'I prepare to react to what happens next.', icon: '⚡' },
    { label: 'Help', action: 'I help an ally with their action.', icon: '🤝' },
    { label: 'Stealth', action: 'I move quietly and stay in the shadows.', icon: '👤' },
    { label: 'Intimidate', action: 'I try to intimidate with my presence.', icon: '😠' }
  ];

  const commonDice = [
    { label: 'd20', type: 'd20', modifier: 0 },
    { label: 'd6', type: 'd6', modifier: 0 },
    { label: 'd100', type: 'd100', modifier: 0 },
    { label: 'd20+5', type: 'd20', modifier: 5 },
    { label: 'd20-2', type: 'd20', modifier: -2 }
  ];

  const emojis = ['😊', '😎', '😱', '😈', '🤔', '💪', '🎯', '⚔️', '🛡️', '🏹', '🔮', '💎', '🔥', '❄️', '⚡', '🌙'];

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const startRecording = () => {
    setIsRecording(true);
    // TODO: Implement voice recording
    setTimeout(() => setIsRecording(false), 3000);
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap gap-2 mb-3">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => setMessage(action.action)}
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-full transition-colors flex items-center gap-1 btn-hover"
            disabled={disabled}
            title={action.label}
          >
            <span>{action.icon}</span>
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        ))}
        
        <div className="flex gap-1">
          {commonDice.map((dice, index) => (
            <button
              key={index}
              onClick={() => onRollDice(dice.type, dice.modifier)}
              className="px-2 py-1 text-xs bg-blue-700 hover:bg-blue-600 text-blue-200 rounded transition-colors flex items-center gap-1 btn-hover"
              disabled={disabled}
              title={`Roll ${dice.label}`}
            >
              <Dice6 className="h-3 w-3" />
              <span className="hidden sm:inline">{dice.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Target User Selector for Secret Messages */}
      {showTargetSelector && (
        <div className="mb-3 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-200">Select recipients for secret message:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {players.map(player => (
              <button
                key={player.id}
                onClick={() => togglePlayerTarget(player.id)}
                className={`px-2 py-1 text-xs rounded transition-colors btn-hover ${
                  targetUsers.includes(player.id)
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {player.displayName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input Area */}
      <div className="flex items-end gap-2">
        {/* Action Buttons */}
        <div className="flex flex-col gap-1">
          <button
            onClick={toggleSecretMessage}
            className={`p-2 rounded transition-colors btn-hover ${
              isSecret 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-300'
            }`}
            title={isSecret ? 'Disable secret message' : 'Send secret message'}
          >
            {isSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-300 rounded transition-colors btn-hover"
            title="Add emoji"
          >
            <Smile className="h-4 w-4" />
          </button>
          
          <button
            onClick={startRecording}
            className={`p-2 rounded transition-colors btn-hover ${
              isRecording 
                ? 'bg-red-600 text-white animate-pulse' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-300'
            }`}
            title="Voice message"
          >
            <Mic className="h-4 w-4" />
          </button>
          
          <button
            className="p-2 bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-300 rounded transition-colors btn-hover"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-400 resize-none focus-ring transition-all duration-200"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10">
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => addEmoji(emoji)}
                    className="p-1 hover:bg-gray-600 rounded transition-colors text-lg btn-hover"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center btn-hover"
          title="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      {/* Character Counter and Status */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>{message.length}/1000 characters</span>
          {isSecret && (
            <span className="text-red-400 flex items-center gap-1">
              <EyeOff className="h-3 w-3" />
              Secret message
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}; 