import { 
  AdvancedQuest, 
  QuestType, 
  QuestDifficulty, 
  QuestStatus, 
  AdvancedQuestObjective, 
  ObjectiveType,
  QuestRequirement,
  QuestReward,
  QuestBranch,
  QuestTemplate,
  QuestGenerationContext
} from '../types/quest';
import { Campaign } from '../types/campaign';
import { aiService, AIContext } from './aiService';

class QuestGenerationService {
  private static instance: QuestGenerationService;
  private questTemplates: QuestTemplate[] = [];
  private questCache: Map<string, AdvancedQuest[]> = new Map();

  private constructor() {
    this.initializeQuestTemplates();
  }

  public static getInstance(): QuestGenerationService {
    if (!QuestGenerationService.instance) {
      QuestGenerationService.instance = new QuestGenerationService();
    }
    return QuestGenerationService.instance;
  }

  private initializeQuestTemplates(): void {
    // Combat Quest Templates
    this.questTemplates.push({
      id: 'combat_hunt',
      name: 'Monster Hunt',
      type: 'combat',
      difficulty: 'medium',
      template: {
        titlePatterns: [
          'Hunt the {monster}',
          'Slay the {monster} of {location}',
          'Eliminate the {monster} threat',
          'Defeat the {monster} menace'
        ],
        descriptionPatterns: [
          'A dangerous {monster} has been terrorizing {location}. The locals are desperate for help.',
          'Reports of a {monster} attacking travelers near {location} have reached your ears.',
          'The {monster} of {location} has claimed too many lives. It must be stopped.'
        ],
        objectiveTemplates: [{
          type: 'kill',
          patterns: ['Defeat the {monster}', 'Slay the {monster}', 'Eliminate the {monster}'],
          targetOptions: ['goblin', 'orc', 'troll', 'dragon', 'bandit', 'undead', 'beast'],
          quantityRange: { min: 1, max: 5 },
          locationOptions: ['forest', 'cave', 'ruins', 'village', 'mountain']
        }],
        rewardTemplates: [{
          type: 'experience',
          valueRanges: { min: 100, max: 500 },
          descriptionPatterns: ['Experience gained from defeating the {monster}']
        }, {
          type: 'gold',
          valueRanges: { min: 50, max: 200 },
          descriptionPatterns: ['Gold reward for eliminating the threat']
        }],
        storyElements: {
          backgroundPatterns: [
            'The {monster} has been causing problems for weeks',
            'Local authorities have offered a reward for the {monster}\'s defeat',
            'The {monster} is said to have valuable treasure'
          ],
          consequencePatterns: [
            'The area becomes safer for travelers',
            'Local merchants offer better prices',
            'The {monster}\'s lair reveals hidden secrets'
          ],
          npcInvolvementPatterns: [
            'A local hunter provides information',
            'The village elder offers guidance',
            'Survivors share their stories'
          ],
          worldImpactPatterns: [
            'Trade routes become safer',
            'Local reputation improves',
            'New areas become accessible'
          ]
        }
      },
      tags: ['combat', 'hunt', 'monster'],
      worldConditions: [
        { type: 'location', value: 'wilderness', operator: 'contains' }
      ]
    });

    // Social Quest Templates
    this.questTemplates.push({
      id: 'social_mediation',
      name: 'Mediation',
      type: 'social',
      difficulty: 'easy',
      template: {
        titlePatterns: [
          'Resolve the {conflict}',
          'Mediate between {faction1} and {faction2}',
          'Settle the {dispute}',
          'Bring peace to {location}'
        ],
        descriptionPatterns: [
          'Tensions between {faction1} and {faction2} threaten to erupt into violence.',
          'A dispute over {resource} has divided the community of {location}.',
          'The people of {location} need someone to resolve their differences.'
        ],
        objectiveTemplates: [{
          type: 'talk',
          patterns: ['Speak with {npc}', 'Convince {npc}', 'Negotiate with {npc}'],
          targetOptions: ['merchant', 'farmer', 'noble', 'guard', 'priest'],
          quantityRange: { min: 2, max: 4 },
          npcOptions: ['merchant', 'farmer', 'noble', 'guard', 'priest']
        }],
        rewardTemplates: [{
          type: 'faction_reputation',
          valueRanges: { min: 10, max: 50 },
          descriptionPatterns: ['Improved reputation with local factions']
        }],
        storyElements: {
          backgroundPatterns: [
            'The conflict has been brewing for months',
            'Previous attempts at resolution have failed',
            'Both sides are willing to compromise'
          ],
          consequencePatterns: [
            'The community becomes more united',
            'Trade between factions improves',
            'New opportunities arise from cooperation'
          ],
          npcInvolvementPatterns: [
            'Both faction leaders are present',
            'Neutral mediators offer advice',
            'Witnesses provide context'
          ],
          worldImpactPatterns: [
            'Local economy improves',
            'Political stability increases',
            'Cultural exchange flourishes'
          ]
        }
      },
      tags: ['social', 'mediation', 'diplomacy'],
      worldConditions: [
        { type: 'faction', value: 'multiple', operator: 'contains' }
      ]
    });

    // Exploration Quest Templates
    this.questTemplates.push({
      id: 'exploration_discovery',
      name: 'Ancient Discovery',
      type: 'exploration',
      difficulty: 'medium',
      template: {
        titlePatterns: [
          'Explore the {location}',
          'Discover the secrets of {location}',
          'Investigate the {anomaly}',
          'Uncover the mystery of {location}'
        ],
        descriptionPatterns: [
          'Ancient ruins have been discovered in {location}. Their secrets await.',
          'Strange lights have been seen coming from {location}.',
          'A map has been found pointing to hidden treasures in {location}.'
        ],
        objectiveTemplates: [{
          type: 'explore',
          patterns: ['Explore {location}', 'Search {location}', 'Investigate {location}'],
          targetOptions: ['ruins', 'cave', 'temple', 'tower', 'dungeon'],
          quantityRange: { min: 1, max: 3 },
          locationOptions: ['ancient ruins', 'hidden cave', 'forgotten temple', 'mysterious tower']
        }, {
          type: 'discover',
          patterns: ['Find the {artifact}', 'Locate the {treasure}', 'Discover the {secret}'],
          targetOptions: ['ancient artifact', 'hidden treasure', 'forgotten knowledge', 'magical item'],
          quantityRange: { min: 1, max: 2 },
          locationOptions: ['ruins', 'cave', 'temple', 'tower']
        }],
        rewardTemplates: [{
          type: 'item',
          valueRanges: { min: 1, max: 3 },
          descriptionPatterns: ['Ancient artifacts and treasures']
        }, {
          type: 'experience',
          valueRanges: { min: 200, max: 400 },
          descriptionPatterns: ['Experience gained from exploration']
        }],
        storyElements: {
          backgroundPatterns: [
            'The location has been abandoned for centuries',
            'Local legends speak of hidden treasures',
            'Recent events have revealed the location'
          ],
          consequencePatterns: [
            'New areas become accessible',
            'Ancient knowledge is preserved',
            'Historical mysteries are solved'
          ],
          npcInvolvementPatterns: [
            'A scholar provides historical context',
            'Local guides offer assistance',
            'Survivors share their experiences'
          ],
          worldImpactPatterns: [
            'Historical knowledge expands',
            'New trade routes open',
            'Cultural heritage is preserved'
          ]
        }
      },
      tags: ['exploration', 'discovery', 'ancient'],
      worldConditions: [
        { type: 'location', value: 'ruins', operator: 'contains' }
      ]
    });
  }

  public async generateQuest(context: QuestGenerationContext): Promise<AdvancedQuest> {
    try {
      // Select appropriate template based on context
      const template = this.selectTemplate(context);
      
      // Generate quest using AI with proper context
      const aiPrompt = this.buildAIPrompt(template, context);
      
      // Create a mock AIContext for the AI service
      const aiContext: AIContext = {
        campaign: {
          id: context.campaignId,
          name: 'Quest Generation Campaign',
          theme: context.worldState.activeFactions[0] || 'fantasy',
          settings: { difficulty: 'medium' as const, ruleSet: 'dnd5e' as const, aiPersonality: 'dramatic' as const, voiceEnabled: false, allowPlayerSecrets: true, experienceType: 'experience' as const, restingRules: 'standard' as const }
        } as Campaign,
        recentMessages: [],
        characters: [],
        worldState: {
          currentLocation: context.worldState.location,
          timeOfDay: context.worldState.timeOfDay,
          weather: context.worldState.weather,
          season: 'spring'
        }
      };
      
      const aiResponse = await aiService.generateResponse(aiContext, aiPrompt, 'dramatic');
      
      // Parse AI response and create quest
      const quest = this.parseAIResponse(aiResponse, template, context);
      
      // Cache the quest
      this.cacheQuest(context.campaignId, quest);
      
      return quest;
    } catch (error) {
      console.error('Error generating quest:', error);
      // Fallback to template-based generation
      return this.generateFallbackQuest(context);
    }
  }

  private selectTemplate(context: QuestGenerationContext): QuestTemplate {
    // Filter templates based on world conditions and player preferences
    const suitableTemplates = this.questTemplates.filter(template => {
      // Check world conditions
      const worldConditionsMet = template.worldConditions.every(condition => {
        switch (condition.type) {
          case 'location':
            return context.worldState.location.includes(condition.value);
          case 'faction':
            return context.worldState.activeFactions.includes(condition.value);
          case 'weather':
            return context.worldState.weather === condition.value;
          default:
            return true;
        }
      });

      // Check player preferences
      const typePreferred = context.playerPreferences.preferredTypes.includes(template.type);
      const difficultySuitable = this.isDifficultySuitable(template.difficulty, context.playerPreferences.difficultyPreference);

      return worldConditionsMet && (typePreferred || Math.random() > 0.7) && difficultySuitable;
    });

    if (suitableTemplates.length === 0) {
      return this.questTemplates[0]; // Fallback to first template
    }

    // Weight selection based on player preferences
    const weights = suitableTemplates.map(template => {
      let weight = 1;
      if (context.playerPreferences.preferredTypes.includes(template.type)) weight *= 2;
      if (template.difficulty === context.playerPreferences.difficultyPreference) weight *= 1.5;
      return weight;
    });

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < suitableTemplates.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return suitableTemplates[i];
      }
    }

    return suitableTemplates[0];
  }

  private isDifficultySuitable(templateDifficulty: QuestDifficulty, playerPreference: QuestDifficulty): boolean {
    const difficulties: QuestDifficulty[] = ['trivial', 'easy', 'medium', 'hard', 'deadly', 'epic'];
    const templateIndex = difficulties.indexOf(templateDifficulty);
    const playerIndex = difficulties.indexOf(playerPreference);
    
    // Allow quests within 1 difficulty level of preference
    return Math.abs(templateIndex - playerIndex) <= 1;
  }

  private buildAIPrompt(template: QuestTemplate, context: QuestGenerationContext): string {
    return `
Generate a dynamic quest for a tabletop RPG campaign with the following context:

WORLD STATE:
- Location: ${context.worldState.location}
- Time: ${context.worldState.timeOfDay}
- Weather: ${context.worldState.weather}
- Active Factions: ${context.worldState.activeFactions.join(', ')}
- Player Level: ${context.worldState.playerLevel}

TEMPLATE: ${template.name}
TYPE: ${template.type}
DIFFICULTY: ${template.difficulty}

AVAILABLE NPCs: ${context.availableNPCs.join(', ')}
AVAILABLE LOCATIONS: ${context.availableLocations.join(', ')}

Generate a quest that:
1. Uses the template patterns but adapts them to the current world state
2. Creates 2-4 objectives that make sense for the context
3. Provides appropriate rewards for the difficulty level
4. Includes branching possibilities based on player choices
5. Integrates with existing world elements

Format the response as JSON with the following structure:
{
  "title": "Quest title",
  "description": "Quest description",
  "objectives": [
    {
      "description": "Objective description",
      "type": "objective type",
      "target": "target name",
      "required": number,
      "location": "location if applicable"
    }
  ],
  "rewards": [
    {
      "type": "reward type",
      "value": "reward value",
      "description": "reward description"
    }
  ],
  "storyElements": {
    "background": "background story",
    "consequences": ["consequence 1", "consequence 2"],
    "npcInvolvement": ["npc 1", "npc 2"],
    "worldImpact": ["impact 1", "impact 2"]
  },
  "branches": [
    {
      "name": "branch name",
      "description": "branch description",
      "triggerCondition": "what triggers this branch"
    }
  ]
}
`;
  }

  private parseAIResponse(aiResponse: string, template: QuestTemplate, context: QuestGenerationContext): AdvancedQuest {
    try {
      const parsed = JSON.parse(aiResponse);
      
      const quest: AdvancedQuest = {
        id: this.generateQuestId(),
        campaignId: context.campaignId,
        title: parsed.title,
        description: parsed.description,
        type: template.type,
        difficulty: template.difficulty,
        status: 'available',
        objectives: parsed.objectives.map((obj: any, index: number) => ({
          id: `obj_${index}`,
          description: obj.description,
          type: obj.type as ObjectiveType,
          target: obj.target,
          current: 0,
          required: obj.required || 1,
          completed: false,
          location: obj.location
        })),
        currentObjectiveIndex: 0,
        requirements: [],
        levelRequirement: context.worldState.playerLevel,
        rewards: parsed.rewards.map((reward: any) => ({
          type: reward.type,
          value: reward.value,
          description: reward.description
        })),
        experienceReward: parsed.rewards.find((r: any) => r.type === 'experience')?.value || 100,
        storyElements: parsed.storyElements,
        progress: {
          startedAt: new Date(),
          timeSpent: 0,
          objectivesCompleted: 0,
          totalObjectives: parsed.objectives.length
        },
        branches: parsed.branches.map((branch: any) => ({
          id: `branch_${Math.random().toString(36).substr(2, 9)}`,
          name: branch.name,
          description: branch.description,
          triggerCondition: branch.triggerCondition,
          objectives: [],
          rewards: [],
          consequences: []
        })),
        currentBranch: 'main',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'ai',
        tags: template.tags
      };

      return quest;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI quest generation response');
    }
  }

  private generateFallbackQuest(context: QuestGenerationContext): AdvancedQuest {
    const template = this.questTemplates[0];
    
    return {
      id: this.generateQuestId(),
      campaignId: context.campaignId,
      title: 'Investigate the Mysterious Lights',
      description: 'Strange lights have been seen in the nearby forest. The locals are concerned and need someone to investigate.',
      type: 'exploration',
      difficulty: 'easy',
      status: 'available',
      objectives: [{
        id: 'obj_1',
        description: 'Explore the forest area where lights were seen',
        type: 'explore',
        target: 'forest',
        current: 0,
        required: 1,
        completed: false,
        location: 'forest'
      }],
      currentObjectiveIndex: 0,
      requirements: [],
      levelRequirement: 1,
      rewards: [{
        type: 'experience',
        value: 100,
        description: 'Experience for solving the mystery'
      }],
      experienceReward: 100,
      storyElements: {
        background: 'Local farmers reported strange lights in the forest at night.',
        consequences: ['The mystery is solved', 'Local reputation improves'],
        npcInvolvement: ['Local farmers', 'Village elder'],
        worldImpact: ['Area becomes safer', 'New information about the forest']
      },
      progress: {
        startedAt: new Date(),
        timeSpent: 0,
        objectivesCompleted: 0,
        totalObjectives: 1
      },
      branches: [],
      currentBranch: 'main',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      tags: ['exploration', 'mystery']
    };
  }

  private generateQuestId(): string {
    return `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cacheQuest(campaignId: string, quest: AdvancedQuest): void {
    if (!this.questCache.has(campaignId)) {
      this.questCache.set(campaignId, []);
    }
    this.questCache.get(campaignId)!.push(quest);
  }

  public getCachedQuests(campaignId: string): AdvancedQuest[] {
    return this.questCache.get(campaignId) || [];
  }

  public clearCache(campaignId?: string): void {
    if (campaignId) {
      this.questCache.delete(campaignId);
    } else {
      this.questCache.clear();
    }
  }
}

export default QuestGenerationService; 