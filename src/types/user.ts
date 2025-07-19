export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: UserPreferences;
  subscription: UserSubscription;
  stats: UserStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  aiPersonality: 'helpful' | 'dramatic' | 'mysterious' | 'humorous';
  voiceEnabled: boolean;
  autoRoll: boolean;
}

export interface UserSubscription {
  tier: 'free' | 'adventurer' | 'hero' | 'legend';
  expiresAt?: Date;
  features: string[];
}

export interface UserStats {
  campaignsPlayed: number;
  charactersCreated: number;
  sessionsAttended: number;
  totalPlayTime: number;
  favoriteClass: string;
  achievementsUnlocked: number;
} 