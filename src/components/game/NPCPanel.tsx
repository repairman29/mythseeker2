import React, { useState, useEffect } from 'react';
import { AdvancedNPC, NPCRelationship, NPCMemory, EmotionalState } from '../../types/npc';
import NPCRelationshipService from '../../services/npcRelationshipService';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface NPCPanelProps {
  campaignId: string;
  worldState: any;
  onNPCUpdate?: (npc: AdvancedNPC) => void;
}

export const NPCPanel: React.FC<NPCPanelProps> = ({ 
  campaignId, 
  worldState, 
  onNPCUpdate 
}) => {
  const [npcs, setNpcs] = useState<AdvancedNPC[]>([]);
  const [selectedNPC, setSelectedNPC] = useState<AdvancedNPC | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNPCModal, setShowNPCModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'alive' | 'active' | 'faction'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'race' | 'class' | 'location' | 'relationships'>('name');
  const [selectedFaction, setSelectedFaction] = useState<string>('all');

  const npcService = NPCRelationshipService.getInstance();

  useEffect(() => {
    loadNPCs();
  }, [campaignId]);

  const loadNPCs = () => {
    const allNPCs = npcService.getAllNPCs();
    setNpcs(allNPCs);
  };

  const generateNewNPC = async () => {
    setIsGenerating(true);
    try {
      const context = {
        campaignId,
        worldState: {
          location: worldState.currentLocation || 'unknown',
          factions: worldState.factions?.map((f: any) => f.name) || [],
          currentEvents: [],
          timeOfDay: worldState.timeOfDay || 'day',
          season: 'summer'
        },
        existingNPCs: npcs.map(npc => npc.id),
        playerCharacters: [],
        requirements: {}
      };

      const newNPC = await npcService.generateNPC(context);
      setNpcs(prev => [...prev, newNPC]);
      setSelectedNPC(newNPC);
      setShowNPCModal(true);
      
      if (onNPCUpdate) {
        onNPCUpdate(newNPC);
      }
    } catch (error) {
      console.error('Error generating NPC:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getNPCIcon = (npc: AdvancedNPC) => {
    if (npc.class) {
      switch (npc.class.toLowerCase()) {
        case 'merchant': return '💰';
        case 'guard': return '🛡️';
        case 'sage': return '📚';
        case 'fighter': return '⚔️';
        case 'mage': return '🔮';
        case 'rogue': return '🗡️';
        default: return '👤';
      }
    }
    return '👤';
  };

  const getRelationshipIcon = (relationship: NPCRelationship) => {
    if (relationship.strength >= 50) return '❤️';
    if (relationship.strength >= 20) return '😊';
    if (relationship.strength >= -20) return '😐';
    if (relationship.strength >= -50) return '😠';
    return '💀';
  };

  const getEmotionalStateColor = (emotionalState: EmotionalState) => {
    const emotion = emotionalState.primary.name.toLowerCase();
    if (emotion.includes('happy') || emotion.includes('joy')) return 'text-green-500';
    if (emotion.includes('sad') || emotion.includes('grief')) return 'text-blue-500';
    if (emotion.includes('angry') || emotion.includes('rage')) return 'text-red-500';
    if (emotion.includes('fear') || emotion.includes('anxiety')) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getSocialStatusColor = (status: string) => {
    switch (status) {
      case 'royalty': return 'text-purple-500';
      case 'noble': return 'text-blue-500';
      case 'merchant': return 'text-green-500';
      case 'military': return 'text-red-500';
      case 'religious': return 'text-yellow-500';
      case 'criminal': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const filteredNPCs = npcs
    .filter(npc => {
      if (filter === 'alive' && !npc.isAlive) return false;
      if (filter === 'active' && !npc.isActive) return false;
      if (filter === 'faction' && selectedFaction !== 'all') {
        return npc.factionMemberships.some(fm => fm.factionId === selectedFaction);
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'race':
          return a.race.localeCompare(b.race);
        case 'class':
          return (a.class || '').localeCompare(b.class || '');
        case 'location':
          return a.currentLocation.localeCompare(b.currentLocation);
        case 'relationships':
          return b.relationships.length - a.relationships.length;
        default:
          return 0;
      }
    });

  const availableFactions = Array.from(new Set(
    npcs.flatMap(npc => npc.factionMemberships.map(fm => fm.factionId))
  ));

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">NPCs</h3>
        <Button 
          onClick={generateNewNPC}
          disabled={isGenerating}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm"
        >
          {isGenerating ? 'Generating...' : 'Generate NPC'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
        >
          <option value="all">All NPCs</option>
          <option value="alive">Alive Only</option>
          <option value="active">Active Only</option>
          <option value="faction">By Faction</option>
        </select>

        {filter === 'faction' && (
          <select 
            value={selectedFaction}
            onChange={(e) => setSelectedFaction(e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
          >
            <option value="all">All Factions</option>
            {availableFactions.map(faction => (
              <option key={faction} value={faction}>{faction}</option>
            ))}
          </select>
        )}

        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
        >
          <option value="name">Sort by Name</option>
          <option value="race">Sort by Race</option>
          <option value="class">Sort by Class</option>
          <option value="location">Sort by Location</option>
          <option value="relationships">Sort by Relationships</option>
        </select>
      </div>

      {/* NPC List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredNPCs.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No NPCs found. Generate a new NPC to get started!
          </div>
        ) : (
          filteredNPCs.map(npc => (
            <div 
              key={npc.id}
              className="bg-gray-700 rounded p-3 cursor-pointer hover:bg-gray-600 transition-colors"
              onClick={() => {
                setSelectedNPC(npc);
                setShowNPCModal(true);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getNPCIcon(npc)}</span>
                  <div>
                    <h4 className="text-white font-medium">{npc.name}</h4>
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-300">{npc.race}</span>
                      {npc.class && <span className="text-gray-300">• {npc.class}</span>}
                      <span className={getSocialStatusColor(npc.socialStatus)}>
                        {npc.socialStatus}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-xs text-gray-400">
                  <div className={getEmotionalStateColor(npc.emotionalState)}>
                    {npc.emotionalState.primary.name}
                  </div>
                  <div>{npc.relationships.length} relationships</div>
                  <div>{npc.currentLocation}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* NPC Detail Modal */}
      {selectedNPC && (
        <Modal
          isOpen={showNPCModal}
          onClose={() => setShowNPCModal(false)}
          title={`${selectedNPC.name} - ${selectedNPC.race} ${selectedNPC.class || ''}`}
        >
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Basic Info */}
            <div>
              <h4 className="text-white font-medium mb-2">Basic Information</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p><strong>Age:</strong> {selectedNPC.age}</p>
                <p><strong>Gender:</strong> {selectedNPC.gender}</p>
                <p><strong>Location:</strong> {selectedNPC.currentLocation}</p>
                <p><strong>Status:</strong> {selectedNPC.isAlive ? 'Alive' : 'Deceased'} • {selectedNPC.isActive ? 'Active' : 'Inactive'}</p>
                <p><strong>Social Status:</strong> <span className={getSocialStatusColor(selectedNPC.socialStatus)}>{selectedNPC.socialStatus}</span></p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-white font-medium mb-2">Description</h4>
              <p className="text-sm text-gray-300">{selectedNPC.description}</p>
            </div>

            {/* Personality */}
            <div>
              <h4 className="text-white font-medium mb-2">Personality</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>Openness: {selectedNPC.personality.openness}</div>
                  <div>Conscientiousness: {selectedNPC.personality.conscientiousness}</div>
                  <div>Extraversion: {selectedNPC.personality.extraversion}</div>
                  <div>Agreeableness: {selectedNPC.personality.agreeableness}</div>
                  <div>Neuroticism: {selectedNPC.personality.neuroticism}</div>
                </div>
                {selectedNPC.personality.traits.length > 0 && (
                  <div>
                    <strong>Traits:</strong> {selectedNPC.personality.traits.map(t => t.name).join(', ')}
                  </div>
                )}
                {selectedNPC.personality.quirks.length > 0 && (
                  <div>
                    <strong>Quirks:</strong> {selectedNPC.personality.quirks.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Motivations */}
            {selectedNPC.motivations.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-2">Motivations</h4>
                <div className="space-y-2">
                  {selectedNPC.motivations.map((motivation, index) => (
                    <div key={index} className="text-sm text-gray-300">
                      <div className="flex justify-between">
                        <strong>{motivation.type}:</strong>
                        <span>{motivation.intensity}/100</span>
                      </div>
                      <p>{motivation.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relationships */}
            {selectedNPC.relationships.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-2">Relationships</h4>
                <div className="space-y-2">
                  {selectedNPC.relationships.slice(0, 5).map((relationship, index) => (
                    <div key={index} className="text-sm text-gray-300 flex items-center gap-2">
                      <span>{getRelationshipIcon(relationship)}</span>
                      <span>{relationship.targetType}: {relationship.targetId}</span>
                      <span className="text-xs">({relationship.strength})</span>
                    </div>
                  ))}
                  {selectedNPC.relationships.length > 5 && (
                    <div className="text-xs text-gray-400">
                      +{selectedNPC.relationships.length - 5} more relationships
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Memories */}
            {selectedNPC.memories.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-2">Recent Memories</h4>
                <div className="space-y-2">
                  {selectedNPC.memories.slice(0, 3).map((memory, index) => (
                    <div key={index} className="text-sm text-gray-300">
                      <div className="flex justify-between">
                        <strong>{memory.title}</strong>
                        <span className="text-xs">{memory.importance}/100</span>
                      </div>
                      <p className="text-xs">{memory.description}</p>
                    </div>
                  ))}
                  {selectedNPC.memories.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{selectedNPC.memories.length - 3} more memories
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills */}
            {selectedNPC.skills.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-2">Skills</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                  {selectedNPC.skills.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between">
                        <span>{skill.name}</span>
                        <span>{skill.level}</span>
                      </div>
                      <div className="text-xs text-gray-400">{skill.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current State */}
            <div>
              <h4 className="text-white font-medium mb-2">Current State</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div className="flex items-center gap-2">
                  <span>Emotion:</span>
                  <span className={getEmotionalStateColor(selectedNPC.emotionalState)}>
                    {selectedNPC.emotionalState.primary.name} ({selectedNPC.emotionalState.primary.intensity}/100)
                  </span>
                </div>
                <div>Current Activity: {selectedNPC.dailyRoutine.currentActivity}</div>
                <div>Next Activity: {selectedNPC.dailyRoutine.nextActivity}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-600">
              <Button 
                onClick={() => {
                  // TODO: Implement NPC interaction
                  console.log('Interact with NPC:', selectedNPC.name);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Interact
              </Button>
              <Button 
                onClick={() => {
                  // TODO: Implement NPC editing
                  console.log('Edit NPC:', selectedNPC.name);
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Edit
              </Button>
              <Button 
                onClick={() => setShowNPCModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}; 