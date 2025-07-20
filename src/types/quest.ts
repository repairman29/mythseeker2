// Advanced Quest System Types
export interface AdvancedQuest {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  status: QuestStatus;
  
  // Objectives
  objectives: AdvancedQuestObjective[];
  currentObjectiveIndex: number;
  
  // Requirements
  requirements: QuestRequirement[];
  levelRequirement: number;
  factionRequirement?: string;
  
  // Rewards
  rewards: QuestReward[];
  experienceReward: number;
  
  // Story Elements
  storyElements: {
    background: string;
    consequences: string[];
    npcInvolvement: string[];
    worldImpact: string[];
  };
  
  // Progress Tracking
  progress: {
    startedAt: Date;
    completedAt?: Date;
    timeSpent: number; // in minutes
    objectivesCompleted: number;
    totalObjectives: number;
  };
  
  // Branching
  branches: QuestBranch[];
  currentBranch: string;
  
  // Meta
  createdAt: Date;
  updatedAt: Date;
  createdBy: 'ai' | 'dm' | 'system';
  tags: string[];
}

export type QuestType = 
  | 'main_story' 
  | 'side_quest' 
  | 'faction_quest' 
  | 'exploration' 
  | 'combat' 
  | 'social' 
  | 'crafting' 
  | 'mystery' 
  | 'escort' 
  | 'delivery';

export type QuestDifficulty = 
  | 'trivial' 
  | 'easy' 
  | 'medium' 
  | 'hard' 
  | 'deadly' 
  | 'epic';

export type QuestStatus = 
  | 'available' 
  | 'active' 
  | 'completed' 
  | 'failed' 
  | 'abandoned';

export interface AdvancedQuestObjective {
  id: string;
  description: string;
  type: ObjectiveType;
  target: string;
  current: number;
  required: number;
  completed: boolean;
  location?: string;
  npcInvolved?: string;
  itemsRequired?: string[];
}

export type ObjectiveType = 
  | 'kill' 
  | 'collect' 
  | 'talk' 
  | 'explore' 
  | 'craft' 
  | 'deliver' 
  | 'escort' 
  | 'solve' 
  | 'survive' 
  | 'discover';

export interface QuestRequirement {
  type: 'level' | 'faction' | 'item' | 'skill' | 'reputation';
  value: string | number;
  operator: 'equals' | 'greater_than' | 'less_than' | 'has' | 'not_has';
  description: string;
}

export interface QuestReward {
  type: 'experience' | 'gold' | 'item' | 'faction_reputation' | 'skill_point' | 'ability';
  value: string | number;
  description: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface QuestBranch {
  id: string;
  name: string;
  description: string;
  triggerCondition: string;
      objectives: AdvancedQuestObjective[];
  rewards: QuestReward[];
  consequences: string[];
}

// Quest Generation Templates
export interface QuestTemplate {
  id: string;
  name: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  template: {
    titlePatterns: string[];
    descriptionPatterns: string[];
    objectiveTemplates: ObjectiveTemplate[];
    rewardTemplates: RewardTemplate[];
    storyElements: StoryElementTemplate;
  };
  tags: string[];
  worldConditions: WorldCondition[];
}

export interface ObjectiveTemplate {
  type: ObjectiveType;
  patterns: string[];
  targetOptions: string[];
  quantityRange: { min: number; max: number };
  locationOptions?: string[];
  npcOptions?: string[];
}

export interface RewardTemplate {
  type: QuestReward['type'];
  valueRanges: { min: number; max: number };
  descriptionPatterns: string[];
  rarityWeights?: Record<string, number>;
}

export interface StoryElementTemplate {
  backgroundPatterns: string[];
  consequencePatterns: string[];
  npcInvolvementPatterns: string[];
  worldImpactPatterns: string[];
}

export interface WorldCondition {
  type: 'location' | 'faction' | 'weather' | 'time' | 'event';
  value: string;
  operator: 'equals' | 'not_equals' | 'contains';
}

// Quest Generation Context
export interface QuestGenerationContext {
  campaignId: string;
  worldState: {
    location: string;
    timeOfDay: string;
    weather: string;
    activeFactions: string[];
    recentEvents: string[];
    playerLevel: number;
    playerFactions: Record<string, number>;
  };
  availableNPCs: string[];
  availableLocations: string[];
  questHistory: string[];
  playerPreferences: {
    preferredTypes: QuestType[];
    difficultyPreference: QuestDifficulty;
    storyFocus: 'combat' | 'social' | 'exploration' | 'balanced';
  };
} 