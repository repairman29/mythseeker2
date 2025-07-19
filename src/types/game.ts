export interface GameMessage {
  id: string;
  campaignId: string;
  senderId: string;
  senderName: string;
  type: 'player' | 'dm' | 'system' | 'dice' | 'combat' | 'whisper';
  content: string;
  timestamp: Date;
  isSecret?: boolean;
  targetUsers?: string[];
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  diceRoll?: DiceRollMetadata;
  aiContext?: AIContextMetadata;
  combatAction?: CombatActionMetadata;
  location?: string;
  emotion?: string;
}

export interface DiceRollMetadata {
  type: string;
  result: number;
  modifier: number;
  total: number;
  critical?: boolean;
}

export interface AIContextMetadata {
  model: string;
  responseTime: number;
  confidence: number;
}

export interface CombatActionMetadata {
  action: string;
  target?: string;
  damage?: number;
  effect?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'character' | 'combat' | 'exploration' | 'social' | 'meta';
  requirements: AchievementRequirement[];
  rewards: AchievementRewards;
  earned: boolean;
  earnedDate?: Date;
  progress?: number;
}

export interface AchievementRequirement {
  type: string;
  value: number;
  description: string;
}

export interface AchievementRewards {
  experience?: number;
  title?: string;
  cosmetic?: string;
}

export interface AppState {
  user: import('./user').User | null;
  characters: import('./character').Character[];
  campaigns: import('./campaign').Campaign[];
  currentCampaign: import('./campaign').Campaign | null;
  gameMessages: GameMessage[];
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  notifications: AppNotification[];
}

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
} 