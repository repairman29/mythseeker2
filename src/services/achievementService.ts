import { User } from '../types/user';
import { Achievement, AchievementCategory, AchievementEvent } from '../types/achievement';

export interface AchievementProgress {
  userId: string;
  achievementId: string;
  progress: number;
  earned: boolean;
  earnedAt?: Date;
}

export interface AchievementCallback {
  onAchievementUnlocked: (achievement: Achievement, user: User) => void;
}

class AchievementService {
  private static instance: AchievementService;
  private userProgress: Map<string, Map<string, AchievementProgress>> = new Map();
  private callbacks: AchievementCallback[] = [];

  private achievements: Achievement[] = [
    // Character Achievements
    {
      id: 'first-character',
      title: 'First Steps',
      description: 'Create your first character',
      category: 'character',
      requirements: { characterCount: 1 },
      rewards: { experience: 100, title: 'Novice' },
      rarity: 'common',
      icon: '👤'
    },
    {
      id: 'character-master',
      title: 'Character Master',
      description: 'Create 5 different characters',
      category: 'character',
      requirements: { characterCount: 5 },
      rewards: { experience: 500, title: 'Creator' },
      rarity: 'rare',
      icon: '🎭'
    },
    {
      id: 'diverse-cast',
      title: 'Diverse Cast',
      description: 'Create characters of 3 different classes',
      category: 'character',
      requirements: { uniqueClasses: 3 },
      rewards: { experience: 300, title: 'Versatile' },
      rarity: 'uncommon',
      icon: '🎪'
    },

    // Combat Achievements
    {
      id: 'first-hit',
      title: 'First Blood',
      description: 'Roll your first critical hit',
      category: 'combat',
      requirements: { criticalHits: 1 },
      rewards: { experience: 150, title: 'Striker' },
      rarity: 'common',
      icon: '⚔️'
    },
    {
      id: 'critical-master',
      title: 'Critical Master',
      description: 'Roll 10 critical hits',
      category: 'combat',
      requirements: { criticalHits: 10 },
      rewards: { experience: 1000, title: 'Precision' },
      rarity: 'epic',
      icon: '🎯'
    },
    {
      id: 'lucky-roll',
      title: 'Lucky Roll',
      description: 'Roll a natural 20',
      category: 'combat',
      requirements: { natural20s: 1 },
      rewards: { experience: 200, title: 'Fortunate' },
      rarity: 'uncommon',
      icon: '🍀'
    },

    // Exploration Achievements
    {
      id: 'first-message',
      title: 'First Words',
      description: 'Send your first message in a campaign',
      category: 'exploration',
      requirements: { messagesSent: 1 },
      rewards: { experience: 50, title: 'Speaker' },
      rarity: 'common',
      icon: '💬'
    },
    {
      id: 'social-butterfly',
      title: 'Social Butterfly',
      description: 'Send 50 messages across campaigns',
      category: 'exploration',
      requirements: { messagesSent: 50 },
      rewards: { experience: 400, title: 'Communicator' },
      rarity: 'rare',
      icon: '🦋'
    },
    {
      id: 'storyteller',
      title: 'Storyteller',
      description: 'Send 100 messages',
      category: 'exploration',
      requirements: { messagesSent: 100 },
      rewards: { experience: 800, title: 'Narrator' },
      rarity: 'epic',
      icon: '📚'
    },

    // Social Achievements
    {
      id: 'first-campaign',
      title: 'Campaign Starter',
      description: 'Host your first campaign',
      category: 'social',
      requirements: { campaignsHosted: 1 },
      rewards: { experience: 200, title: 'Host' },
      rarity: 'common',
      icon: '🏕️'
    },
    {
      id: 'campaign-master',
      title: 'Campaign Master',
      description: 'Host 5 campaigns',
      category: 'social',
      requirements: { campaignsHosted: 5 },
      rewards: { experience: 1000, title: 'Master Host' },
      rarity: 'epic',
      icon: '👑'
    },
    {
      id: 'team-player',
      title: 'Team Player',
      description: 'Join 3 different campaigns',
      category: 'social',
      requirements: { campaignsJoined: 3 },
      rewards: { experience: 300, title: 'Collaborator' },
      rarity: 'uncommon',
      icon: '🤝'
    },

    // Meta Achievements
    {
      id: 'dedicated-player',
      title: 'Dedicated Player',
      description: 'Earn 10 achievements',
      category: 'meta',
      requirements: { achievementsEarned: 10 },
      rewards: { experience: 500, title: 'Dedicated' },
      rarity: 'rare',
      icon: '⭐'
    },
    {
      id: 'achievement-hunter',
      title: 'Achievement Hunter',
      description: 'Earn 25 achievements',
      category: 'meta',
      requirements: { achievementsEarned: 25 },
      rewards: { experience: 1500, title: 'Hunter' },
      rarity: 'legendary',
      icon: '🏆'
    },
    {
      id: 'completionist',
      title: 'Completionist',
      description: 'Earn all achievements',
      category: 'meta',
      requirements: { achievementsEarned: 15 }, // Total achievements
      rewards: { experience: 5000, title: 'Completionist' },
      rarity: 'legendary',
      icon: '💎'
    }
  ];

  private constructor() {}

  static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  // Register callback for achievement unlocks
  registerCallback(callback: AchievementCallback) {
    this.callbacks.push(callback);
  }

  // Unregister callback
  unregisterCallback(callback: AchievementCallback) {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  getAllAchievements(): Achievement[] {
    return [...this.achievements];
  }

  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return this.achievements.filter(a => a.category === category);
  }

  getUserProgress(userId: string): AchievementProgress[] {
    const userMap = this.userProgress.get(userId);
    if (!userMap) return [];

    return Array.from(userMap.values());
  }

  getUserAchievements(userId: string): Achievement[] {
    const progress = this.getUserProgress(userId);
    return progress
      .filter(p => p.earned)
      .map(p => this.achievements.find(a => a.id === p.achievementId)!)
      .filter(Boolean);
  }

  getUserAchievementScore(userId: string): number {
    const earnedAchievements = this.getUserAchievements(userId);
    return earnedAchievements.reduce((score, achievement) => {
      switch (achievement.rarity) {
        case 'common': return score + 10;
        case 'uncommon': return score + 25;
        case 'rare': return score + 50;
        case 'epic': return score + 100;
        case 'legendary': return score + 250;
        default: return score + 10;
      }
    }, 0);
  }

  private getOrCreateUserMap(userId: string): Map<string, AchievementProgress> {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, new Map());
    }
    return this.userProgress.get(userId)!;
  }

  private checkAchievement(userId: string, achievement: Achievement, stats: any): boolean {
    const userMap = this.getOrCreateUserMap(userId);
    const existing = userMap.get(achievement.id);
    
    if (existing?.earned) return false;

    const requirements = achievement.requirements;
    let progress = 0;
    let maxProgress = 0;

    // Calculate progress for each requirement
    for (const [key, required] of Object.entries(requirements)) {
      const current = stats[key] || 0;
      maxProgress += required;
      progress += Math.min(current, required);
    }

    const progressPercentage = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;
    
    // Update or create progress
    const achievementProgress: AchievementProgress = {
      userId,
      achievementId: achievement.id,
      progress: progressPercentage,
      earned: progressPercentage >= 100,
      earnedAt: progressPercentage >= 100 ? new Date() : undefined
    };

    userMap.set(achievement.id, achievementProgress);

    // If newly earned, notify callbacks
    if (achievementProgress.earned && !existing?.earned) {
      this.notifyAchievementUnlocked(achievement, userId);
    }

    return achievementProgress.earned;
  }

  private notifyAchievementUnlocked(achievement: Achievement, userId: string) {
    // Create a mock user object for the callback
    const user: User = {
      id: userId,
      email: '',
      displayName: '',
      photoURL: '',
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    this.callbacks.forEach(callback => {
      try {
        callback.onAchievementUnlocked(achievement, user);
      } catch (error) {
        console.error('Error in achievement callback:', error);
      }
    });
  }

  processEvent(userId: string, event: AchievementEvent): Achievement[] {
    const newlyEarned: Achievement[] = [];
    
    // Get current user stats
    const stats = this.getUserStats(userId);
    
    // Check each achievement
    for (const achievement of this.achievements) {
      const earned = this.checkAchievement(userId, achievement, stats);
      if (earned) {
        newlyEarned.push(achievement);
      }
    }

    return newlyEarned;
  }

  private getUserStats(userId: string): any {
    const progress = this.getUserProgress(userId);
    const earnedAchievements = progress.filter(p => p.earned).length;
    
    // This would typically come from a more comprehensive stats system
    // For now, we'll use basic tracking
    return {
      characterCount: 0, // Would be tracked separately
      uniqueClasses: 0, // Would be tracked separately
      criticalHits: 0, // Would be tracked separately
      natural20s: 0, // Would be tracked separately
      messagesSent: 0, // Would be tracked separately
      campaignsHosted: 0, // Would be tracked separately
      campaignsJoined: 0, // Would be tracked separately
      achievementsEarned: earnedAchievements
    };
  }

  // Enhanced tracking methods
  trackCharacterCreation(userId: string, characterClass: string) {
    const stats = this.getUserStats(userId);
    stats.characterCount = (stats.characterCount || 0) + 1;
    
    // Track unique classes (simplified - would need proper tracking)
    const userMap = this.getOrCreateUserMap(userId);
    const classKey = `class_${characterClass}`;
    if (!userMap.has(classKey)) {
      userMap.set(classKey, {
        userId,
        achievementId: classKey,
        progress: 100,
        earned: true,
        earnedAt: new Date()
      });
    }
    
    this.processEvent(userId, { type: 'character_created', data: { class: characterClass } });
  }

  trackCriticalHit(userId: string, isNatural20: boolean = false) {
    const stats = this.getUserStats(userId);
    stats.criticalHits = (stats.criticalHits || 0) + 1;
    if (isNatural20) {
      stats.natural20s = (stats.natural20s || 0) + 1;
    }
    
    this.processEvent(userId, { 
      type: 'critical_hit', 
      data: { isNatural20 } 
    });
  }

  trackMessageSent(userId: string) {
    const stats = this.getUserStats(userId);
    stats.messagesSent = (stats.messagesSent || 0) + 1;
    
    this.processEvent(userId, { type: 'message_sent', data: {} });
  }

  trackCampaignHosted(userId: string) {
    const stats = this.getUserStats(userId);
    stats.campaignsHosted = (stats.campaignsHosted || 0) + 1;
    
    this.processEvent(userId, { type: 'campaign_hosted', data: {} });
  }

  trackCampaignJoined(userId: string) {
    const stats = this.getUserStats(userId);
    stats.campaignsJoined = (stats.campaignsJoined || 0) + 1;
    
    this.processEvent(userId, { type: 'campaign_joined', data: {} });
  }
}

export default AchievementService; 