export interface Campaign {
  id: string;
  name: string;
  description: string;
  theme: string;
  imageUrl?: string;
  host: string;
  players: CampaignPlayer[];
  maxPlayers: number;
  isPublic: boolean;
  settings: CampaignSettings;
  worldState: WorldState;
  status: 'active' | 'paused' | 'completed' | 'archived';
  createdAt: Date;
  lastPlayedAt: Date;
  tags: string[];
}

export interface CampaignPlayer {
  userId: string;
  characterId: string;
  role: 'player' | 'co-dm';
  joinedAt: Date;
  isActive: boolean;
  permissions: string[];
}

export interface CampaignSettings {
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  ruleSet: 'dnd5e' | 'pathfinder' | 'custom';
  aiPersonality: 'helpful' | 'dramatic' | 'mysterious' | 'humorous';
  voiceEnabled: boolean;
  allowPlayerSecrets: boolean;
  experienceType: 'milestone' | 'experience';
  restingRules: 'standard' | 'gritty' | 'heroic';
}

export interface WorldState {
  currentLocation: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  weather: string;
  season: string;
  activeQuests: Quest[];
  npcs: NPC[];
  events: WorldEvent[];
  calendar: GameCalendar;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side' | 'personal';
  status: 'active' | 'completed' | 'failed' | 'abandoned';
  objectives: QuestObjective[];
  rewards: QuestRewards;
  giver?: string;
  location?: string;
}

export interface QuestObjective {
  description: string;
  completed: boolean;
}

export interface QuestRewards {
  experience?: number;
  gold?: number;
  items?: string[];
}

export interface NPC {
  id: string;
  name: string;
  race: string;
  class?: string;
  description: string;
  personality: string[];
  relationships: Record<string, number>;
  location: string;
  isAlive: boolean;
  secrets: string[];
  motivations: string[];
}

export interface WorldEvent {
  id: string;
  title: string;
  description: string;
  type: 'political' | 'natural' | 'magical' | 'social' | 'economic';
  severity: 'minor' | 'moderate' | 'major' | 'world-changing';
  date: Date;
  location: string;
  consequences: string[];
  playerInvolved: boolean;
}

export interface GameCalendar {
  day: number;
  month: string;
  year: number;
} 