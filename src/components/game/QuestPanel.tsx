import React, { useState, useEffect } from 'react';
import { AdvancedQuest, QuestStatus, QuestType, QuestDifficulty } from '../../types/quest';
import QuestGenerationService from '../../services/questGenerationService';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface QuestPanelProps {
  campaignId: string;
  worldState: any;
  onQuestUpdate?: (quest: AdvancedQuest) => void;
}

export const QuestPanel: React.FC<QuestPanelProps> = ({ 
  campaignId, 
  worldState, 
  onQuestUpdate 
}) => {
  const [quests, setQuests] = useState<AdvancedQuest[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<AdvancedQuest | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [filter, setFilter] = useState<QuestStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'type' | 'difficulty' | 'progress'>('progress');

  const questService = QuestGenerationService.getInstance();

  useEffect(() => {
    loadQuests();
  }, [campaignId]);

  const loadQuests = () => {
    const cachedQuests = questService.getCachedQuests(campaignId);
    setQuests(cachedQuests);
  };

  const generateNewQuest = async () => {
    setIsGenerating(true);
    try {
      const context = {
        campaignId,
        worldState: {
          location: worldState.currentLocation || 'unknown',
          timeOfDay: worldState.timeOfDay || 'day',
          weather: worldState.weather || 'clear',
          activeFactions: worldState.factions?.map((f: any) => f.name) || [],
          recentEvents: [],
          playerLevel: 1,
          playerFactions: {}
        },
        availableNPCs: worldState.npcs?.map((npc: any) => npc.name) || [],
        availableLocations: ['forest', 'village', 'cave', 'ruins'],
        questHistory: quests.map(q => q.title),
        playerPreferences: {
          preferredTypes: ['combat', 'exploration', 'social'],
          difficultyPreference: 'medium' as QuestDifficulty,
          storyFocus: 'balanced' as const
        }
      };

      const newQuest = await questService.generateQuest(context);
      setQuests(prev => [...prev, newQuest]);
      setSelectedQuest(newQuest);
      setShowQuestModal(true);
      
      if (onQuestUpdate) {
        onQuestUpdate(newQuest);
      }
    } catch (error) {
      console.error('Error generating quest:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const acceptQuest = (quest: AdvancedQuest) => {
    const updatedQuest = { ...quest, status: 'active' as QuestStatus };
    updateQuest(updatedQuest);
  };

  const completeQuest = (quest: AdvancedQuest) => {
    const updatedQuest = { 
      ...quest, 
      status: 'completed' as QuestStatus,
      progress: {
        ...quest.progress,
        completedAt: new Date(),
        objectivesCompleted: quest.objectives.length
      }
    };
    updateQuest(updatedQuest);
  };

  const abandonQuest = (quest: AdvancedQuest) => {
    const updatedQuest = { ...quest, status: 'abandoned' as QuestStatus };
    updateQuest(updatedQuest);
  };

  const updateQuest = (updatedQuest: AdvancedQuest) => {
    setQuests(prev => prev.map(q => q.id === updatedQuest.id ? updatedQuest : q));
    if (onQuestUpdate) {
      onQuestUpdate(updatedQuest);
    }
  };

  const getQuestIcon = (type: QuestType) => {
    switch (type) {
      case 'combat': return '⚔️';
      case 'social': return '💬';
      case 'exploration': return '🗺️';
      case 'crafting': return '🔨';
      case 'mystery': return '🔍';
      case 'escort': return '🛡️';
      case 'delivery': return '📦';
      case 'main_story': return '📖';
      case 'side_quest': return '📋';
      case 'faction_quest': return '🏛️';
      default: return '❓';
    }
  };

  const getDifficultyColor = (difficulty: QuestDifficulty) => {
    switch (difficulty) {
      case 'trivial': return 'text-gray-400';
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-orange-500';
      case 'deadly': return 'text-red-500';
      case 'epic': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status: QuestStatus) => {
    switch (status) {
      case 'available': return 'text-blue-500';
      case 'active': return 'text-green-500';
      case 'completed': return 'text-purple-500';
      case 'failed': return 'text-red-500';
      case 'abandoned': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const filteredQuests = quests
    .filter(quest => filter === 'all' || quest.status === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'type':
          return a.type.localeCompare(b.type);
        case 'difficulty': {
          const difficulties = ['trivial', 'easy', 'medium', 'hard', 'deadly', 'epic'];
          return difficulties.indexOf(a.difficulty) - difficulties.indexOf(b.difficulty);
        }
        case 'progress':
          return b.progress.objectivesCompleted - a.progress.objectivesCompleted;
        default:
          return 0;
      }
    });

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Quests</h3>
        <Button 
          onClick={generateNewQuest}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
        >
          {isGenerating ? 'Generating...' : 'Generate Quest'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value as QuestStatus | 'all')}
          className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
        >
          <option value="all">All Quests</option>
          <option value="available">Available</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="abandoned">Abandoned</option>
        </select>

        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'type' | 'difficulty' | 'progress')}
          className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
        >
          <option value="progress">Sort by Progress</option>
          <option value="type">Sort by Type</option>
          <option value="difficulty">Sort by Difficulty</option>
        </select>
      </div>

      {/* Quest List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredQuests.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No quests found. Generate a new quest to get started!
          </div>
        ) : (
          filteredQuests.map(quest => (
            <div 
              key={quest.id}
              className="bg-gray-700 rounded p-3 cursor-pointer hover:bg-gray-600 transition-colors"
              onClick={() => {
                setSelectedQuest(quest);
                setShowQuestModal(true);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getQuestIcon(quest.type)}</span>
                  <div>
                    <h4 className="text-white font-medium">{quest.title}</h4>
                    <div className="flex gap-2 text-xs">
                      <span className={getDifficultyColor(quest.difficulty)}>
                        {quest.difficulty}
                      </span>
                      <span className={getStatusColor(quest.status)}>
                        {quest.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-xs text-gray-400">
                  <div>Progress: {quest.progress.objectivesCompleted}/{quest.objectives.length}</div>
                  <div>{Math.round((quest.progress.objectivesCompleted / quest.objectives.length) * 100)}%</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quest Detail Modal */}
      {selectedQuest && (
        <Modal
          isOpen={showQuestModal}
          onClose={() => setShowQuestModal(false)}
          title={selectedQuest.title}
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-2">Description</h4>
              <p className="text-gray-300 text-sm">{selectedQuest.description}</p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">Objectives</h4>
              <div className="space-y-2">
                {selectedQuest.objectives.map((objective, index) => (
                  <div 
                    key={objective.id}
                    className={`flex items-center gap-2 p-2 rounded ${
                      objective.completed ? 'bg-green-900/30' : 'bg-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={objective.completed}
                      onChange={() => {
                        const updatedQuest = {
                          ...selectedQuest,
                          objectives: selectedQuest.objectives.map((obj, i) => 
                            i === index ? { ...obj, completed: !obj.completed } : obj
                          ),
                          progress: {
                            ...selectedQuest.progress,
                            objectivesCompleted: selectedQuest.objectives.filter(obj => 
                              obj.completed || (i === index ? !obj.completed : obj.completed)
                            ).length
                          }
                        };
                        updateQuest(updatedQuest);
                        setSelectedQuest(updatedQuest);
                      }}
                      className="rounded"
                    />
                    <span className={`text-sm ${objective.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                      {objective.description}
                    </span>
                    {objective.target && (
                      <span className="text-xs text-gray-400">
                        ({objective.current}/{objective.required} {objective.target})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">Rewards</h4>
              <div className="space-y-1">
                {selectedQuest.rewards.map((reward, index) => (
                  <div key={index} className="text-sm text-gray-300">
                    • {reward.description}
                  </div>
                ))}
              </div>
            </div>

            {selectedQuest.storyElements && (
              <div>
                <h4 className="text-white font-medium mb-2">Story Elements</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <p><strong>Background:</strong> {selectedQuest.storyElements.background}</p>
                  {selectedQuest.storyElements.consequences.length > 0 && (
                    <div>
                      <strong>Consequences:</strong>
                      <ul className="list-disc list-inside ml-2">
                        {selectedQuest.storyElements.consequences.map((consequence, index) => (
                          <li key={index}>{consequence}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quest Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-600">
              {selectedQuest.status === 'available' && (
                <Button 
                  onClick={() => {
                    acceptQuest(selectedQuest);
                    setShowQuestModal(false);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Accept Quest
                </Button>
              )}
              
              {selectedQuest.status === 'active' && (
                <>
                  <Button 
                    onClick={() => {
                      completeQuest(selectedQuest);
                      setShowQuestModal(false);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Complete Quest
                  </Button>
                  <Button 
                    onClick={() => {
                      abandonQuest(selectedQuest);
                      setShowQuestModal(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Abandon Quest
                  </Button>
                </>
              )}
              
              <Button 
                onClick={() => setShowQuestModal(false)}
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