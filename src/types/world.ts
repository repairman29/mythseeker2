export interface WorldState {
  currentLocation: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  weather: 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'snowy';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  activeQuests: Quest[];
  npcs: NPC[];
  events: WorldEvent[];
  calendar: Calendar;
  lastUpdated: Date;
}

export interface Calendar {
  day: number;
  month: string;
  year: number;
}

export interface WorldEvent {
  id: string;
  title: string;
  description: string;
  type: 'random' | 'scheduled' | 'triggered' | 'holiday';
  impact?: string;
  duration?: string;
  scheduledTime?: Date;
  triggered?: boolean;
  completed?: boolean;
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  disposition: 'friendly' | 'neutral' | 'hostile' | 'formal' | 'helpful';
  location?: string;
  quests?: string[];
  relationships?: Record<string, number>;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  type: 'main' | 'side' | 'daily' | 'weekly';
  requirements?: QuestRequirement[];
  rewards?: QuestReward[];
  status: 'available' | 'active' | 'completed' | 'failed';
  giver?: string;
  target?: string;
  location?: string;
  timeLimit?: number;
  progress?: number;
}

export interface QuestRequirement {
  type: 'level' | 'item' | 'skill' | 'reputation' | 'location';
  value: any;
  description: string;
}

export interface QuestReward {
  experience?: number;
  gold?: number;
  items?: string[];
  reputation?: Record<string, number>;
  title?: string;
}

export interface Faction {
  id: string;
  name: string;
  relationships: Record<string, number>;
  influence: number;
  territory: string[];
  lastUpdated: Date;
}

export interface EconomicItem {
  id: string;
  name: string;
  basePrice: number;
  currentPrice: number;
  supply: number;
  demand: number;
  lastUpdated: Date;
}

export interface WorldSettings {
  timeScale: number; // How fast time passes (1 = real time, 2 = 2x speed, etc.)
  weatherChangeRate: number; // How often weather changes (in hours)
  eventFrequency: number; // How often random events occur
  npcSpawnRate: number; // How often NPCs spawn in locations
  questGenerationRate: number; // How often new quests are generated
}

export interface Location {
  id: string;
  name: string;
  type: 'settlement' | 'wilderness' | 'dungeon' | 'landmark';
  description: string;
  connectedLocations: string[];
  npcs: string[];
  events: string[];
  availableQuests: string[];
  restrictions?: string[];
  atmosphere?: string;
} 