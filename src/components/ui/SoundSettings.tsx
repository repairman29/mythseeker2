import React, { useState, useEffect } from 'react';
import SoundService from '../../services/soundService';

interface SoundSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundSettings: React.FC<SoundSettingsProps> = ({ isOpen, onClose }) => {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [soundService] = useState(() => SoundService.getInstance());

  useEffect(() => {
    // Load current settings
    const savedEnabled = localStorage.getItem('soundEnabled');
    const savedVolume = localStorage.getItem('soundVolume');
    
    if (savedEnabled !== null) {
      setEnabled(savedEnabled === 'true');
    }
    if (savedVolume !== null) {
      setVolume(parseFloat(savedVolume));
    }
  }, []);

  const handleEnabledChange = (newEnabled: boolean) => {
    setEnabled(newEnabled);
    soundService.setEnabled(newEnabled);
    localStorage.setItem('soundEnabled', newEnabled.toString());
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    soundService.setVolume(newVolume);
    localStorage.setItem('soundVolume', newVolume.toString());
  };

  const testSound = async () => {
    try {
      await soundService.playAchievementUnlock();
    } catch (error) {
      console.warn('Failed to play test sound:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Sound Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Enable/Disable Sound */}
          <div className="flex items-center justify-between">
            <label className="text-white font-medium">Enable Sounds</label>
            <button
              onClick={() => handleEnabledChange(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <label className="text-white font-medium">Volume</label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                disabled={!enabled}
              />
              <span className="text-white text-sm w-8">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

          {/* Test Sound Button */}
          <div className="pt-2">
            <button
              onClick={testSound}
              disabled={!enabled}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                enabled
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Test Sound
            </button>
          </div>

          {/* Sound Categories */}
          <div className="space-y-2">
            <h3 className="text-white font-medium">Sound Categories</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center justify-between">
                <span>Achievement Unlocks</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Dice Rolls</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Critical Hits</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span>UI Interactions</span>
                <span className="text-green-400">✓</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 