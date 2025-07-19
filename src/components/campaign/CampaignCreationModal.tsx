import React, { useState } from 'react';
import { Modal, Button, Input, LoadingSpinner } from '../ui';
import { Campaign } from '../../types';

interface CampaignCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (campaignData: Partial<Campaign>) => Promise<void>;
  loading?: boolean;
}

export const CampaignCreationModal: React.FC<CampaignCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    theme: 'fantasy',
    maxPlayers: 6,
    difficulty: 'medium'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Campaign description is required';
    }

    if (formData.maxPlayers < 2 || formData.maxPlayers > 10) {
      newErrors.maxPlayers = 'Max players must be between 2 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        theme: formData.theme as Campaign['theme'],
        maxPlayers: formData.maxPlayers,
        settings: {
          difficulty: formData.difficulty as Campaign['settings']['difficulty'],
          ruleSet: 'dnd5e',
          aiPersonality: 'dramatic',
          voiceEnabled: false,
          allowPlayerSecrets: true,
          experienceType: 'milestone',
          restingRules: 'standard'
        },
        worldState: {
          currentLocation: 'Starting Town',
          timeOfDay: 'morning',
          weather: 'Clear',
          season: 'Spring',
          activeQuests: [],
          npcs: [],
          events: [],
          calendar: {
            day: 1,
            month: 'Spring',
            year: 1
          }
        }
      });

      // Reset form on successful submission
      setFormData({
        name: '',
        description: '',
        theme: 'fantasy',
        maxPlayers: 6,
        difficulty: 'medium'
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        theme: 'fantasy',
        maxPlayers: 6,
        difficulty: 'medium'
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Campaign">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Campaign Name"
          placeholder="Enter campaign name"
          value={formData.name}
          onChange={(value) => handleInputChange('name', value)}
          required
          error={errors.name}
          disabled={loading}
        />

        <Input
          label="Description"
          placeholder="Describe your campaign world and story"
          value={formData.description}
          onChange={(value) => handleInputChange('description', value)}
          required
          error={errors.description}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Theme
            </label>
            <select
              value={formData.theme}
              onChange={(e) => handleInputChange('theme', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="fantasy">Fantasy</option>
              <option value="sci-fi">Sci-Fi</option>
              <option value="horror">Horror</option>
              <option value="western">Western</option>
              <option value="modern">Modern</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="deadly">Deadly</option>
            </select>
          </div>
        </div>

        <Input
          label="Max Players"
          type="number"
          placeholder="6"
          value={formData.maxPlayers.toString()}
          onChange={(value) => handleInputChange('maxPlayers', parseInt(value) || 6)}
          required
          error={errors.maxPlayers}
          disabled={loading}
          helpText="Maximum number of players (2-10)"
        />

        <div className="flex space-x-3 pt-4">
          <Button
            onClick={handleClose}
            variant="secondary"
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" color="white" />
                <span>Creating...</span>
              </div>
            ) : (
              'Create Campaign'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}; 