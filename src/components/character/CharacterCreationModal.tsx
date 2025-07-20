import React, { useState } from 'react';
import { Modal, Button, Input } from '../ui';
import { Character } from '../../types';

interface CharacterCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (character: Partial<Character>) => void;
  loading: boolean;
}

interface CharacterFormData {
  name: string;
  race: string;
  class: string;
  background: string;
  alignment: string;
}

export const CharacterCreationModal: React.FC<CharacterCreationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CharacterFormData>({
    name: '',
    race: 'human',
    class: 'fighter',
    background: 'folk-hero',
    alignment: 'neutral-good'
  });

  const steps = [
    { title: 'Basic Info', description: 'Name and core details' },
    { title: 'Race & Class', description: 'Choose your character\'s foundation' },
    { title: 'Background', description: 'Your character\'s history' },
    { title: 'Personality', description: 'Bring your character to life' }
  ];

  const races = [
    { value: 'human', label: 'Human', description: 'Versatile and ambitious' },
    { value: 'elf', label: 'Elf', description: 'Graceful and long-lived' },
    { value: 'dwarf', label: 'Dwarf', description: 'Sturdy and determined' },
    { value: 'halfling', label: 'Halfling', description: 'Small but brave' },
    { value: 'dragonborn', label: 'Dragonborn', description: 'Proud and powerful' },
    { value: 'gnome', label: 'Gnome', description: 'Curious and clever' },
    { value: 'half-elf', label: 'Half-Elf', description: 'Between two worlds' },
    { value: 'tiefling', label: 'Tiefling', description: 'Touched by fiendish heritage' }
  ];

  const classes = [
    { value: 'fighter', label: 'Fighter', description: 'Master of weapons and armor' },
    { value: 'wizard', label: 'Wizard', description: 'Scholar of arcane magic' },
    { value: 'rogue', label: 'Rogue', description: 'Skilled in stealth and cunning' },
    { value: 'cleric', label: 'Cleric', description: 'Divine spellcaster and healer' },
    { value: 'ranger', label: 'Ranger', description: 'Warrior of the wilderness' },
    { value: 'bard', label: 'Bard', description: 'Jack-of-all-trades performer' },
    { value: 'barbarian', label: 'Barbarian', description: 'Fierce warrior of primal fury' },
    { value: 'paladin', label: 'Paladin', description: 'Holy warrior with divine powers' },
    { value: 'warlock', label: 'Warlock', description: 'Wielder of otherworldly power' },
    { value: 'sorcerer', label: 'Sorcerer', description: 'Natural-born spellcaster' },
    { value: 'monk', label: 'Monk', description: 'Master of martial arts and ki' },
    { value: 'druid', label: 'Druid', description: 'Guardian of nature and shapeshifter' }
  ];

  const backgrounds = [
    { value: 'acolyte', label: 'Acolyte', description: 'Served in a temple or religious order' },
    { value: 'criminal', label: 'Criminal', description: 'Lived outside the law' },
    { value: 'folk-hero', label: 'Folk Hero', description: 'Champion of the common people' },
    { value: 'noble', label: 'Noble', description: 'Born to wealth and privilege' },
    { value: 'sage', label: 'Sage', description: 'Devoted to scholarly pursuits' },
    { value: 'soldier', label: 'Soldier', description: 'Trained in warfare and tactics' },
    { value: 'hermit', label: 'Hermit', description: 'Lived in seclusion seeking enlightenment' },
    { value: 'entertainer', label: 'Entertainer', description: 'Performer who thrived before crowds' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <Input
              label="Character Name"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              placeholder="Enter your character's name"
              required
              helpText="Choose a name that fits your character's personality and background"
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-white mb-3">Choose Your Race</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {races.map(race => (
                  <button
                    key={race.value}
                    onClick={() => setFormData(prev => ({ ...prev, race: race.value }))}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      formData.race === race.value
                        ? 'border-blue-500 bg-blue-900/20 text-white'
                        : 'border-gray-600 hover:bg-gray-700 text-gray-200'
                    }`}
                  >
                    <div className="font-medium">{race.label}</div>
                    <div className="text-sm text-gray-300">{race.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-white mb-3">Choose Your Class</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {classes.map(cls => (
                  <button
                    key={cls.value}
                    onClick={() => setFormData(prev => ({ ...prev, class: cls.value }))}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      formData.class === cls.value
                        ? 'border-blue-500 bg-blue-900/20 text-white'
                        : 'border-gray-600 hover:bg-gray-700 text-gray-200'
                    }`}
                  >
                    <div className="font-medium">{cls.label}</div>
                    <div className="text-sm text-gray-300">{cls.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white mb-3">Choose Your Background</h4>
            <div className="grid grid-cols-1 gap-3">
              {backgrounds.map(bg => (
                <button
                  key={bg.value}
                  onClick={() => setFormData(prev => ({ ...prev, background: bg.value }))}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    formData.background === bg.value
                      ? 'border-blue-500 bg-blue-900/20 text-white'
                      : 'border-gray-600 hover:bg-gray-700 text-gray-200'
                  }`}
                >
                  <div className="font-medium">{bg.label}</div>
                  <div className="text-sm text-gray-300">{bg.description}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-lg font-medium text-blue-300 mb-2">Character Summary</h4>
              <div className="text-blue-200">
                <p><strong>Name:</strong> {formData.name || 'Unnamed Character'}</p>
                <p><strong>Race:</strong> {races.find(r => r.value === formData.race)?.label}</p>
                <p><strong>Class:</strong> {classes.find(c => c.value === formData.class)?.label}</p>
                <p><strong>Background:</strong> {backgrounds.find(b => b.value === formData.background)?.label}</p>
              </div>
            </div>
            <p className="text-gray-300">
              Your character will be created with standard starting equipment and abilities. 
              You can customize further details after creation.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Character" size="lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-12 h-1 mx-2
                  ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <h3 className="text-lg font-medium text-white">{steps[currentStep].title}</h3>
          <p className="text-gray-300">{steps[currentStep].description}</p>
        </div>

        <div className="min-h-[300px]">
          {renderStep()}
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onClose : handleBack}
            disabled={loading}
          >
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={handleNext}
            loading={loading}
            disabled={!formData.name.trim()}
          >
            {currentStep === steps.length - 1 ? 'Create Character' : 'Next'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}; 