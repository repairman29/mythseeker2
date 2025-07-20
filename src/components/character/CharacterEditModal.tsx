import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../ui';
import { Character } from '../../types';

interface CharacterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (characterId: string, updates: Partial<Character>) => void;
  character: Character | null;
  loading: boolean;
}

export const CharacterEditModal: React.FC<CharacterEditModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  character,
  loading 
}) => {
  const [formData, setFormData] = useState<Partial<Character>>({});

  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name || '',
        race: character.race || '',
        class: character.class || '',
        background: character.background || '',
        alignment: character.alignment || '',
        level: character.level || 1,
        experience: character.experience || 0,
        armorClass: character.armorClass || 10,
        proficiencyBonus: character.proficiencyBonus || 2,
        speed: character.speed || 30,
        hitPoints: {
          current: character.hitPoints?.current || 0,
          maximum: character.hitPoints?.maximum || 1,
          temporary: character.hitPoints?.temporary || 0
        }
      });
    }
  }, [character]);

  const handleSubmit = () => {
    if (character?.id) {
      onSubmit(character.id, formData);
    }
  };

  if (!character) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Character" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Character Name"
            value={formData.name || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            placeholder="Enter character name"
            required
          />
          
          <Input
            label="Race"
            value={formData.race || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, race: value }))}
            placeholder="Enter race"
          />
          
          <Input
            label="Class"
            value={formData.class || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, class: value }))}
            placeholder="Enter class"
          />
          
          <Input
            label="Background"
            value={formData.background || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, background: value }))}
            placeholder="Enter background"
          />
          
          <Input
            label="Alignment"
            value={formData.alignment || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, alignment: value }))}
            placeholder="Enter alignment"
          />
          
          <Input
            label="Level"
            type="number"
            value={formData.level?.toString() || '1'}
            onChange={(value) => setFormData(prev => ({ ...prev, level: parseInt(value) || 1 }))}
            helpText="1-20"
          />
          
          <Input
            label="Experience"
            type="number"
            value={formData.experience?.toString() || '0'}
            onChange={(value) => setFormData(prev => ({ ...prev, experience: parseInt(value) || 0 }))}
            helpText="Minimum 0"
          />
          
          <Input
            label="Armor Class"
            type="number"
            value={formData.armorClass?.toString() || '10'}
            onChange={(value) => setFormData(prev => ({ ...prev, armorClass: parseInt(value) || 10 }))}
            helpText="Minimum 0"
          />
          
          <Input
            label="Proficiency Bonus"
            type="number"
            value={formData.proficiencyBonus?.toString() || '2'}
            onChange={(value) => setFormData(prev => ({ ...prev, proficiencyBonus: parseInt(value) || 2 }))}
            helpText="Minimum 0"
          />
          
          <Input
            label="Speed"
            type="number"
            value={formData.speed?.toString() || '30'}
            onChange={(value) => setFormData(prev => ({ ...prev, speed: parseInt(value) || 30 }))}
            helpText="Minimum 0"
          />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-lg font-medium text-white mb-3">Hit Points</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Current HP"
              type="number"
              value={formData.hitPoints?.current?.toString() || '0'}
              onChange={(value) => setFormData(prev => ({ 
                ...prev, 
                hitPoints: { 
                  current: parseInt(value) || 0,
                  maximum: prev.hitPoints?.maximum || 1,
                  temporary: prev.hitPoints?.temporary || 0
                } 
              }))}
              helpText="Minimum 0"
            />
            
            <Input
              label="Maximum HP"
              type="number"
              value={formData.hitPoints?.maximum?.toString() || '1'}
              onChange={(value) => setFormData(prev => ({ 
                ...prev, 
                hitPoints: { 
                  current: prev.hitPoints?.current || 0,
                  maximum: parseInt(value) || 1,
                  temporary: prev.hitPoints?.temporary || 0
                } 
              }))}
              helpText="Minimum 1"
            />
            
            <Input
              label="Temporary HP"
              type="number"
              value={formData.hitPoints?.temporary?.toString() || '0'}
              onChange={(value) => setFormData(prev => ({ 
                ...prev, 
                hitPoints: { 
                  current: prev.hitPoints?.current || 0,
                  maximum: prev.hitPoints?.maximum || 1,
                  temporary: parseInt(value) || 0
                } 
              }))}
              helpText="Minimum 0"
            />
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={!formData.name?.trim()}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}; 