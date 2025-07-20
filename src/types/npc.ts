// Advanced NPC System Types
export interface AdvancedNPC {
  id: string;
  name: string;
  race: string;
  class?: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'unknown';
  
  // Core Attributes
  attributes: NPCAttributes;
  skills: NPCSkill[];
  
  // Personality & Behavior
  personality: NPCPersonality;
  motivations: NPCMotivation[];
  fears: string[];
  desires: string[];
  
  // Social Network
  relationships: NPCRelationship[];
  factionMemberships: FactionMembership[];
  socialStatus: SocialStatus;
  
  // Memory & History
  memories: NPCMemory[];
  lifeEvents: LifeEvent[];
  secrets: NPCSecret[];
  
  // Current State
  emotionalState: EmotionalState;
  currentLocation: string;
  dailyRoutine: DailyRoutine;
  isAlive: boolean;
  isActive: boolean;
  
  // Appearance & Description
  appearance: NPCAppearance;
  description: string;
  voice: VoiceCharacteristics;
  
  // Meta
  createdAt: Date;
  lastUpdated: Date;
  createdBy: 'ai' | 'dm' | 'system';
  tags: string[];
}

export interface NPCAttributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface NPCSkill {
  name: string;
  level: number;
  category: 'combat' | 'social' | 'crafting' | 'knowledge' | 'survival';
  description: string;
}

export interface NPCPersonality {
  // Big Five Personality Traits (0-100)
  openness: number;        // Openness to experience
  conscientiousness: number; // Organization and responsibility
  extraversion: number;    // Social energy and assertiveness
  agreeableness: number;   // Cooperation and trust
  neuroticism: number;     // Emotional stability
  
  // Additional traits
  traits: PersonalityTrait[];
  quirks: string[];
  speechPatterns: SpeechPattern[];
  bodyLanguage: BodyLanguageTrait[];
}

export interface PersonalityTrait {
  name: string;
  intensity: number; // 0-100
  description: string;
  positiveEffects: string[];
  negativeEffects: string[];
}

export interface SpeechPattern {
  type: 'formal' | 'casual' | 'slang' | 'academic' | 'military' | 'religious';
  characteristics: string[];
  catchphrases: string[];
  speechRate: 'slow' | 'normal' | 'fast';
  volume: 'whisper' | 'normal' | 'loud';
}

export interface BodyLanguageTrait {
  type: 'posture' | 'gesture' | 'expression' | 'movement';
  description: string;
  triggers: string[];
  meaning: string;
}

export interface NPCMotivation {
  type: 'survival' | 'power' | 'wealth' | 'knowledge' | 'love' | 'revenge' | 'redemption' | 'fame';
  intensity: number; // 0-100
  description: string;
  currentProgress: number; // 0-100
  obstacles: string[];
  methods: string[];
}

export interface NPCRelationship {
  targetId: string; // NPC or Player ID
  targetType: 'npc' | 'player';
  relationshipType: RelationshipType;
  strength: number; // -100 to 100 (negative = hostile, positive = friendly)
  trust: number; // 0-100
  respect: number; // 0-100
  fear: number; // 0-100
  love: number; // 0-100
  history: RelationshipEvent[];
  currentStatus: 'active' | 'dormant' | 'broken' | 'deceased';
  lastInteraction: Date;
}

export type RelationshipType = 
  | 'family' | 'friend' | 'lover' | 'ally' | 'enemy' | 'mentor' | 'student'
  | 'employer' | 'employee' | 'rival' | 'acquaintance' | 'stranger'
  | 'guardian' | 'ward' | 'partner' | 'nemesis';

export interface RelationshipEvent {
  id: string;
  date: Date;
  type: 'positive' | 'negative' | 'neutral' | 'romantic' | 'conflict' | 'cooperation';
  description: string;
  impact: {
    strength: number;
    trust: number;
    respect: number;
    fear: number;
    love: number;
  };
  context: string;
}

export interface FactionMembership {
  factionId: string;
  role: string;
  rank: number; // 0-100
  joinedAt: Date;
  contributions: string[];
  reputation: number; // -100 to 100
  isActive: boolean;
}

export type SocialStatus = 
  | 'outcast' | 'peasant' | 'commoner' | 'merchant' | 'artisan' | 'noble'
  | 'royalty' | 'religious' | 'military' | 'criminal' | 'wanderer';

export interface NPCMemory {
  id: string;
  type: MemoryType;
  title: string;
  description: string;
  date: Date;
  emotionalImpact: number; // -100 to 100
  importance: number; // 0-100
  associatedNPCs: string[];
  associatedLocations: string[];
  isShared: boolean;
  canBeRecalled: boolean;
  lastRecalled: Date;
}

export type MemoryType = 
  | 'personal' | 'social' | 'trauma' | 'achievement' | 'loss' | 'romance'
  | 'conflict' | 'cooperation' | 'learning' | 'travel' | 'work' | 'family';

export interface LifeEvent {
  id: string;
  type: LifeEventType;
  title: string;
  description: string;
  date: Date;
  impact: {
    personality: Partial<NPCPersonality>;
    relationships: RelationshipEvent[];
    skills: NPCSkill[];
    motivations: NPCMotivation[];
  };
  consequences: string[];
  isPublic: boolean;
}

export type LifeEventType = 
  | 'birth' | 'death' | 'marriage' | 'divorce' | 'birth_of_child' | 'loss_of_loved_one'
  | 'career_change' | 'relocation' | 'trauma' | 'achievement' | 'discovery'
  | 'betrayal' | 'redemption' | 'war' | 'peace' | 'illness' | 'recovery';

export interface NPCSecret {
  id: string;
  title: string;
  description: string;
  type: SecretType;
  importance: number; // 0-100
  knownBy: string[]; // NPC/Player IDs who know this secret
  consequences: string[];
  isRevealed: boolean;
  revealedAt?: Date;
  revealedTo?: string[];
}

export type SecretType = 
  | 'personal' | 'criminal' | 'romantic' | 'political' | 'magical' | 'family'
  | 'financial' | 'identity' | 'past' | 'future' | 'relationship';

export interface EmotionalState {
  primary: Emotion;
  secondary: Emotion[];
  intensity: number; // 0-100
  duration: number; // minutes
  triggers: string[];
  effects: EmotionalEffect[];
  lastUpdated: Date;
}

export interface Emotion {
  name: string;
  intensity: number; // 0-100
  description: string;
  physicalSigns: string[];
  behavioralEffects: string[];
}

export interface EmotionalEffect {
  type: 'behavior' | 'speech' | 'decision' | 'relationship' | 'skill';
  description: string;
  modifier: number; // -100 to 100
  duration: number; // minutes
}

export interface DailyRoutine {
  schedule: RoutineEvent[];
  currentActivity: string;
  nextActivity: string;
  lastActivityChange: Date;
  isInterrupted: boolean;
  interruptionReason?: string;
}

export interface RoutineEvent {
  time: string; // "HH:MM" format
  activity: string;
  location: string;
  duration: number; // minutes
  priority: 'low' | 'medium' | 'high' | 'critical';
  canBeInterrupted: boolean;
  associatedNPCs: string[];
}

export interface NPCAppearance {
  height: string;
  build: 'slim' | 'athletic' | 'average' | 'stocky' | 'large';
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  distinguishingFeatures: string[];
  clothing: string[];
  accessories: string[];
  scars: string[];
  tattoos: string[];
}

export interface VoiceCharacteristics {
  pitch: 'high' | 'medium' | 'low';
  tone: 'warm' | 'cold' | 'neutral' | 'melodic' | 'rough' | 'smooth';
  accent: string;
  speechImpediment?: string;
  volume: 'quiet' | 'normal' | 'loud';
  speed: 'slow' | 'normal' | 'fast';
}

// NPC Generation Templates
export interface NPCTemplate {
  id: string;
  name: string;
  race: string;
  class?: string;
  personalityTemplate: PersonalityTemplate;
  backgroundTemplate: BackgroundTemplate;
  relationshipTemplates: RelationshipTemplate[];
  tags: string[];
}

export interface PersonalityTemplate {
  traitWeights: Record<string, number>;
  motivationTypes: Array<{ type: NPCMotivation['type']; weight: number }>;
  speechPatterns: SpeechPattern[];
  commonTraits: string[];
}

export interface BackgroundTemplate {
  lifeEvents: Array<{ type: LifeEventType; probability: number }>;
  skillFocus: Array<{ category: NPCSkill['category']; weight: number }>;
  socialStatus: Array<{ status: SocialStatus; weight: number }>;
  commonSecrets: string[];
}

export interface RelationshipTemplate {
  targetType: 'npc' | 'player' | 'faction';
  relationshipType: RelationshipType;
  strengthRange: { min: number; max: number };
  commonEvents: string[];
}

// NPC Interaction Types
export interface NPCInteraction {
  id: string;
  npcId: string;
  playerId: string;
  type: InteractionType;
  content: string;
  timestamp: Date;
  emotionalImpact: number;
  relationshipChange: Partial<NPCRelationship>;
  consequences: string[];
  isPublic: boolean;
  witnesses: string[];
}

export type InteractionType = 
  | 'greeting' | 'conversation' | 'quest' | 'trade' | 'combat' | 'romance'
  | 'betrayal' | 'help' | 'threat' | 'gift' | 'insult' | 'compliment'
  | 'request' | 'offer' | 'demand' | 'apology' | 'forgiveness';

// NPC Generation Context
export interface NPCGenerationContext {
  campaignId: string;
  worldState: {
    location: string;
    factions: string[];
    currentEvents: string[];
    timeOfDay: string;
    season: string;
  };
  existingNPCs: string[];
  playerCharacters: string[];
  requirements: {
    role?: string;
    faction?: string;
    relationshipTo?: string;
    personalityType?: string;
    skills?: string[];
  };
} 