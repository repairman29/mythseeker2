export interface GameMessage {
  id: string;
  campaignId: string;
  senderId: string;
  senderName: string;
  type: 'player' | 'dm' | 'system' | 'dice' | 'combat' | 'whisper' | 'structured';
  content: string;
  timestamp: Date;
  isSecret?: boolean;
  targetUsers?: string[];
  metadata?: MessageMetadata;
  structuredContent?: StructuredContent;
}

export interface MessageMetadata {
  diceRoll?: DiceRollMetadata;
  aiContext?: AIContextMetadata;
  combatAction?: CombatActionMetadata;
  location?: string;
  emotion?: string;
  items?: GameItem[];
  actions?: InteractiveAction[];
  choices?: InteractiveChoice[];
}

export interface StructuredContent {
  type: 'item_discovery' | 'inventory_action' | 'choice_prompt' | 'combat_action' | 'skill_check' | 'loot_drop' | 'quest_update' | 'npc_interaction';
  title?: string;
  description?: string;
  items?: GameItem[];
  actions?: InteractiveAction[];
  choices?: InteractiveChoice[];
  rewards?: RewardMetadata;
  requirements?: RequirementMetadata;
  expiration?: Date;
}

export interface GameItem {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'tool' | 'treasure' | 'quest' | 'magical';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number;
  weight: number;
  properties?: ItemProperty[];
  enchantments?: ItemEnchantment[];
  quantity?: number;
  stackable?: boolean;
  imageUrl?: string;
}

export interface ItemProperty {
  name: string;
  value: string | number;
  description?: string;
}

export interface ItemEnchantment {
  name: string;
  effect: string;
  level: number;
}

export interface InteractiveAction {
  id: string;
  label: string;
  type: 'add_to_inventory' | 'equip' | 'use' | 'examine' | 'drop' | 'give' | 'sell' | 'craft' | 'learn' | 'cast' | 'attack' | 'defend' | 'move' | 'interact';
  icon?: string;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  disabled?: boolean;
  confirmation?: string;
  requirements?: RequirementMetadata;
  effects?: ActionEffect[];
}

export interface InteractiveChoice {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  disabled?: boolean;
  consequences?: ChoiceConsequence[];
  requirements?: RequirementMetadata;
}

export interface ChoiceConsequence {
  type: 'reputation' | 'relationship' | 'quest' | 'item' | 'experience' | 'gold' | 'status';
  target?: string;
  value: number | string;
  description: string;
}

export interface ActionEffect {
  type: 'damage' | 'healing' | 'buff' | 'debuff' | 'status' | 'movement' | 'discovery';
  target?: string;
  value: number | string;
  duration?: number;
  description: string;
}

export interface RewardMetadata {
  experience?: number;
  gold?: number;
  items?: GameItem[];
  reputation?: { faction: string; amount: number }[];
  achievements?: string[];
}

export interface RequirementMetadata {
  level?: number;
  skills?: { skill: string; value: number }[];
  items?: { itemId: string; quantity: number }[];
  gold?: number;
  reputation?: { faction: string; value: number }[];
  quests?: { questId: string; status: 'active' | 'completed' }[];
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