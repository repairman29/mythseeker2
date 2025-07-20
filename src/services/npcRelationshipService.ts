import { 
  AdvancedNPC, 
  NPCPersonality, 
  NPCRelationship, 
  NPCMemory, 
  EmotionalState,
  NPCTemplate,
  NPCGenerationContext,
  NPCInteraction,
  InteractionType,
  RelationshipType,
  MemoryType,
  LifeEventType
} from '../types/npc';
import { Campaign } from '../types/campaign';
import { aiService, AIContext } from './aiService';

class NPCRelationshipService {
  private static instance: NPCRelationshipService;
  private npcs: Map<string, AdvancedNPC> = new Map();
  private npcTemplates: NPCTemplate[] = [];
  private interactions: NPCInteraction[] = [];

  private constructor() {
    this.initializeNPCTemplates();
  }

  public static getInstance(): NPCRelationshipService {
    if (!NPCRelationshipService.instance) {
      NPCRelationshipService.instance = new NPCRelationshipService();
    }
    return NPCRelationshipService.instance;
  }

  private initializeNPCTemplates(): void {
    // Merchant Template
    this.npcTemplates.push({
      id: 'merchant_template',
      name: 'Merchant',
      race: 'human',
      class: 'merchant',
      personalityTemplate: {
        traitWeights: {
          extraversion: 70,
          agreeableness: 60,
          conscientiousness: 80,
          openness: 50,
          neuroticism: 30
        },
        motivationTypes: [
          { type: 'wealth', weight: 80 },
          { type: 'power', weight: 40 },
          { type: 'knowledge', weight: 30 }
        ],
        speechPatterns: [{
          type: 'casual',
          characteristics: ['friendly', 'persuasive', 'business-like'],
          catchphrases: ['Best prices in town!', 'What can I do for you?', 'Quality guaranteed!'],
          speechRate: 'normal',
          volume: 'normal'
        }],
        commonTraits: ['charismatic', 'calculating', 'customer-oriented', 'well-connected']
      },
      backgroundTemplate: {
        lifeEvents: [
          { type: 'career_change', probability: 60 },
          { type: 'relocation', probability: 40 },
          { type: 'marriage', probability: 50 }
        ],
        skillFocus: [
          { category: 'social', weight: 80 },
          { category: 'knowledge', weight: 60 },
          { category: 'crafting', weight: 40 }
        ],
        socialStatus: [
          { status: 'merchant', weight: 90 },
          { status: 'commoner', weight: 10 }
        ],
        commonSecrets: ['business deals', 'family history', 'competitor information']
      },
      relationshipTemplates: [
        {
          targetType: 'player',
          relationshipType: 'acquaintance',
          strengthRange: { min: -20, max: 50 },
          commonEvents: ['trade', 'conversation', 'quest']
        }
      ],
      tags: ['merchant', 'trade', 'business']
    });

    // Guard Template
    this.npcTemplates.push({
      id: 'guard_template',
      name: 'Guard',
      race: 'human',
      class: 'fighter',
      personalityTemplate: {
        traitWeights: {
          extraversion: 40,
          agreeableness: 50,
          conscientiousness: 90,
          openness: 30,
          neuroticism: 20
        },
        motivationTypes: [
          { type: 'survival', weight: 70 },
          { type: 'power', weight: 30 },
          { type: 'redemption', weight: 20 }
        ],
        speechPatterns: [{
          type: 'military',
          characteristics: ['direct', 'authoritative', 'brief'],
          catchphrases: ['Halt!', 'Move along.', 'What business do you have here?'],
          speechRate: 'normal',
          volume: 'loud'
        }],
        commonTraits: ['disciplined', 'loyal', 'suspicious', 'protective']
      },
      backgroundTemplate: {
        lifeEvents: [
          { type: 'career_change', probability: 30 },
          { type: 'war', probability: 60 },
          { type: 'trauma', probability: 40 }
        ],
        skillFocus: [
          { category: 'combat', weight: 90 },
          { category: 'survival', weight: 60 },
          { category: 'social', weight: 30 }
        ],
        socialStatus: [
          { status: 'military', weight: 80 },
          { status: 'commoner', weight: 20 }
        ],
        commonSecrets: ['military history', 'personal trauma', 'family issues']
      },
      relationshipTemplates: [
        {
          targetType: 'player',
          relationshipType: 'acquaintance',
          strengthRange: { min: -30, max: 30 },
          commonEvents: ['greeting', 'investigation', 'conflict']
        }
      ],
      tags: ['guard', 'military', 'protection']
    });

    // Elder Template
    this.npcTemplates.push({
      id: 'elder_template',
      name: 'Elder',
      race: 'human',
      class: 'sage',
      personalityTemplate: {
        traitWeights: {
          extraversion: 30,
          agreeableness: 70,
          conscientiousness: 60,
          openness: 80,
          neuroticism: 40
        },
        motivationTypes: [
          { type: 'knowledge', weight: 90 },
          { type: 'redemption', weight: 40 },
          { type: 'love', weight: 30 }
        ],
        speechPatterns: [{
          type: 'academic',
          characteristics: ['thoughtful', 'wise', 'patient'],
          catchphrases: ['In my day...', 'Let me tell you a story...', 'Wisdom comes with age...'],
          speechRate: 'slow',
          volume: 'normal'
        }],
        commonTraits: ['wise', 'patient', 'storyteller', 'knowledgeable']
      },
      backgroundTemplate: {
        lifeEvents: [
          { type: 'achievement', probability: 70 },
          { type: 'loss_of_loved_one', probability: 60 },
          { type: 'discovery', probability: 50 }
        ],
        skillFocus: [
          { category: 'knowledge', weight: 90 },
          { category: 'social', weight: 60 },
          { category: 'crafting', weight: 40 }
        ],
        socialStatus: [
          { status: 'religious', weight: 40 },
          { status: 'noble', weight: 20 },
          { status: 'commoner', weight: 40 }
        ],
        commonSecrets: ['ancient knowledge', 'family history', 'past mistakes']
      },
      relationshipTemplates: [
        {
          targetType: 'player',
          relationshipType: 'mentor',
          strengthRange: { min: 20, max: 80 },
          commonEvents: ['conversation', 'teaching', 'storytelling']
        }
      ],
      tags: ['elder', 'wise', 'knowledge', 'mentor']
    });
  }

  public async generateNPC(context: NPCGenerationContext): Promise<AdvancedNPC> {
    try {
      // Select appropriate template
      const template = this.selectTemplate(context);
      
      // Generate NPC using AI with proper context
      const aiPrompt = this.buildAIPrompt(template, context);
      
      // Create a mock AIContext for the AI service
      const aiContext: AIContext = {
        campaign: {
          id: 'mock-campaign',
          name: 'NPC Generation Campaign',
          theme: context.worldState.factions[0] || 'fantasy',
          settings: { difficulty: 'medium' as const, ruleSet: 'dnd5e' as const, aiPersonality: 'dramatic' as const, voiceEnabled: false, allowPlayerSecrets: true, experienceType: 'experience' as const, restingRules: 'standard' as const }
        } as Campaign,
        recentMessages: [],
        characters: [],
        worldState: {
          currentLocation: context.worldState.location,
          timeOfDay: context.worldState.timeOfDay,
          weather: 'clear',
          season: context.worldState.season
        }
      };
      
      const aiResponse = await aiService.generateResponse(aiContext, aiPrompt, 'dramatic');
      
      // Parse AI response and create NPC
      const npc = this.parseAIResponse(aiResponse, template, context);
      
      // Store the NPC
      this.npcs.set(npc.id, npc);
      
      return npc;
    } catch (error) {
      console.error('Error generating NPC:', error);
      return this.generateFallbackNPC(context);
    }
  }

  private selectTemplate(context: NPCGenerationContext): NPCTemplate {
    // Filter templates based on requirements
    const suitableTemplates = this.npcTemplates.filter(template => {
      if (context.requirements.role && !template.name.toLowerCase().includes(context.requirements.role.toLowerCase())) {
        return false;
      }
      if (context.requirements.faction && !template.tags.some(tag => tag.includes('faction'))) {
        return false;
      }
      return true;
    });

    if (suitableTemplates.length === 0) {
      return this.npcTemplates[0]; // Fallback to first template
    }

    // Random selection with weights
    const weights = suitableTemplates.map(() => 1);
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

  private buildAIPrompt(template: NPCTemplate, context: NPCGenerationContext): string {
    return `
Generate a dynamic NPC for a tabletop RPG campaign with the following context:

TEMPLATE: ${template.name}
RACE: ${template.race}
CLASS: ${template.class || 'none'}

WORLD CONTEXT:
- Location: ${context.worldState.location}
- Factions: ${context.worldState.factions.join(', ')}
- Current Events: ${context.worldState.currentEvents.join(', ')}
- Time: ${context.worldState.timeOfDay}
- Season: ${context.worldState.season}

REQUIREMENTS: ${JSON.stringify(context.requirements)}

Generate an NPC that:
1. Follows the template personality and background patterns
2. Has realistic relationships with existing NPCs
3. Includes personal memories and life events
4. Has appropriate skills and motivations
5. Fits into the current world context

Format the response as JSON with the following structure:
{
  "name": "NPC name",
  "race": "race",
  "class": "class or null",
  "age": number,
  "gender": "male|female|non-binary|unknown",
  "description": "physical description",
  "personality": {
    "openness": number,
    "conscientiousness": number,
    "extraversion": number,
    "agreeableness": number,
    "neuroticism": number,
    "traits": ["trait1", "trait2"],
    "quirks": ["quirk1", "quirk2"]
  },
  "motivations": [
    {
      "type": "motivation_type",
      "intensity": number,
      "description": "motivation description"
    }
  ],
  "skills": [
    {
      "name": "skill name",
      "level": number,
      "category": "category",
      "description": "skill description"
    }
  ],
  "memories": [
    {
      "type": "memory_type",
      "title": "memory title",
      "description": "memory description",
      "emotionalImpact": number,
      "importance": number
    }
  ],
  "lifeEvents": [
    {
      "type": "event_type",
      "title": "event title",
      "description": "event description",
      "consequences": ["consequence1", "consequence2"]
    }
  ],
  "secrets": [
    {
      "title": "secret title",
      "description": "secret description",
      "type": "secret_type",
      "importance": number
    }
  ]
}
`;
  }

  private parseAIResponse(aiResponse: string, template: NPCTemplate, context: NPCGenerationContext): AdvancedNPC {
    try {
      const parsed = JSON.parse(aiResponse);
      
      const npc: AdvancedNPC = {
        id: this.generateNPCId(),
        name: parsed.name,
        race: parsed.race,
        class: parsed.class,
        age: parsed.age || 30,
        gender: parsed.gender || 'unknown',
        
        attributes: this.generateAttributes(),
        skills: parsed.skills || [],
        
        personality: {
          ...parsed.personality,
          traits: parsed.personality.traits.map((trait: string) => ({
            name: trait,
            intensity: Math.floor(Math.random() * 100),
            description: trait,
            positiveEffects: [],
            negativeEffects: []
          })),
          quirks: parsed.personality.quirks || [],
          speechPatterns: template.personalityTemplate.speechPatterns,
          bodyLanguage: []
        },
        
        motivations: parsed.motivations || [],
        fears: [],
        desires: [],
        
        relationships: this.generateInitialRelationships(context),
        factionMemberships: [],
        socialStatus: this.determineSocialStatus(template),
        
        memories: parsed.memories.map((memory: any) => ({
          id: `memory_${Math.random().toString(36).substr(2, 9)}`,
          type: memory.type as MemoryType,
          title: memory.title,
          description: memory.description,
          date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          emotionalImpact: memory.emotionalImpact,
          importance: memory.importance,
          associatedNPCs: [],
          associatedLocations: [context.worldState.location],
          isShared: false,
          canBeRecalled: true,
          lastRecalled: new Date()
        })),
        
        lifeEvents: parsed.lifeEvents.map((event: any) => ({
          id: `event_${Math.random().toString(36).substr(2, 9)}`,
          type: event.type as LifeEventType,
          title: event.title,
          description: event.description,
          date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          impact: {
            personality: {},
            relationships: [],
            skills: [],
            motivations: []
          },
          consequences: event.consequences,
          isPublic: true
        })),
        
        secrets: parsed.secrets.map((secret: any) => ({
          id: `secret_${Math.random().toString(36).substr(2, 9)}`,
          title: secret.title,
          description: secret.description,
          type: secret.type,
          importance: secret.importance,
          knownBy: [],
          consequences: [],
          isRevealed: false
        })),
        
        emotionalState: {
          primary: {
            name: 'neutral',
            intensity: 50,
            description: 'Feeling neutral',
            physicalSigns: [],
            behavioralEffects: []
          },
          secondary: [],
          intensity: 50,
          duration: 0,
          triggers: [],
          effects: [],
          lastUpdated: new Date()
        },
        
        currentLocation: context.worldState.location,
        dailyRoutine: this.generateDailyRoutine(),
        isAlive: true,
        isActive: true,
        
        appearance: this.generateAppearance(parsed.race),
        description: parsed.description,
        voice: this.generateVoice(),
        
        createdAt: new Date(),
        lastUpdated: new Date(),
        createdBy: 'ai',
        tags: template.tags
      };

      return npc;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI NPC generation response');
    }
  }

  private generateFallbackNPC(context: NPCGenerationContext): AdvancedNPC {
    const template = this.npcTemplates[0];
    
    return {
      id: this.generateNPCId(),
      name: 'Generic NPC',
      race: 'human',
      class: 'commoner',
      age: 30,
      gender: 'unknown',
      
      attributes: this.generateAttributes(),
      skills: [],
      
      personality: {
        openness: 50,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50,
        traits: [],
        quirks: [],
        speechPatterns: [],
        bodyLanguage: []
      },
      
      motivations: [],
      fears: [],
      desires: [],
      
      relationships: [],
      factionMemberships: [],
      socialStatus: 'commoner',
      
      memories: [],
      lifeEvents: [],
      secrets: [],
      
      emotionalState: {
        primary: {
          name: 'neutral',
          intensity: 50,
          description: 'Feeling neutral',
          physicalSigns: [],
          behavioralEffects: []
        },
        secondary: [],
        intensity: 50,
        duration: 0,
        triggers: [],
        effects: [],
        lastUpdated: new Date()
      },
      
      currentLocation: context.worldState.location,
      dailyRoutine: this.generateDailyRoutine(),
      isAlive: true,
      isActive: true,
      
      appearance: this.generateAppearance('human'),
      description: 'A generic NPC',
      voice: this.generateVoice(),
      
      createdAt: new Date(),
      lastUpdated: new Date(),
      createdBy: 'system',
      tags: ['generic']
    };
  }

  private generateAttributes(): any {
    return {
      strength: Math.floor(Math.random() * 20) + 1,
      dexterity: Math.floor(Math.random() * 20) + 1,
      constitution: Math.floor(Math.random() * 20) + 1,
      intelligence: Math.floor(Math.random() * 20) + 1,
      wisdom: Math.floor(Math.random() * 20) + 1,
      charisma: Math.floor(Math.random() * 20) + 1
    };
  }

  private generateInitialRelationships(context: NPCGenerationContext): NPCRelationship[] {
    const relationships: NPCRelationship[] = [];
    
    // Add relationships to existing NPCs
    context.existingNPCs.forEach(npcId => {
      if (Math.random() > 0.7) { // 30% chance of having a relationship
        relationships.push({
          targetId: npcId,
          targetType: 'npc',
          relationshipType: this.getRandomRelationshipType(),
          strength: Math.floor(Math.random() * 200) - 100,
          trust: Math.floor(Math.random() * 100),
          respect: Math.floor(Math.random() * 100),
          fear: Math.floor(Math.random() * 100),
          love: Math.floor(Math.random() * 100),
          history: [],
          currentStatus: 'active',
          lastInteraction: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
      }
    });

    return relationships;
  }

  private getRandomRelationshipType(): RelationshipType {
    const types: RelationshipType[] = ['acquaintance', 'friend', 'ally', 'rival', 'enemy'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private determineSocialStatus(template: NPCTemplate): any {
    const statuses = template.backgroundTemplate.socialStatus;
    const totalWeight = statuses.reduce((sum, status) => sum + status.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const status of statuses) {
      random -= status.weight;
      if (random <= 0) {
        return status.status;
      }
    }
    
    return 'commoner';
  }

  private generateDailyRoutine(): any {
    return {
      schedule: [
        {
          time: '06:00',
          activity: 'Wake up',
          location: 'Home',
          duration: 30,
          priority: 'high',
          canBeInterrupted: false,
          associatedNPCs: []
        },
        {
          time: '08:00',
          activity: 'Work',
          location: 'Workplace',
          duration: 480,
          priority: 'high',
          canBeInterrupted: true,
          associatedNPCs: []
        },
        {
          time: '18:00',
          activity: 'Return home',
          location: 'Home',
          duration: 60,
          priority: 'medium',
          canBeInterrupted: true,
          associatedNPCs: []
        }
      ],
      currentActivity: 'Work',
      nextActivity: 'Return home',
      lastActivityChange: new Date(),
      isInterrupted: false
    };
  }

  private generateAppearance(race: string): any {
    return {
      height: 'average',
      build: 'average',
      hairColor: 'brown',
      hairStyle: 'short',
      eyeColor: 'brown',
      skinTone: 'medium',
      distinguishingFeatures: [],
      clothing: ['simple clothes'],
      accessories: [],
      scars: [],
      tattoos: []
    };
  }

  private generateVoice(): any {
    return {
      pitch: 'medium',
      tone: 'neutral',
      accent: 'local',
      volume: 'normal',
      speed: 'normal'
    };
  }

  private generateNPCId(): string {
    return `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for managing NPCs
  public getNPC(id: string): AdvancedNPC | undefined {
    return this.npcs.get(id);
  }

  public getAllNPCs(): AdvancedNPC[] {
    return Array.from(this.npcs.values());
  }

  public updateNPC(npc: AdvancedNPC): void {
    this.npcs.set(npc.id, npc);
  }

  public deleteNPC(id: string): void {
    this.npcs.delete(id);
  }

  public recordInteraction(interaction: NPCInteraction): void {
    this.interactions.push(interaction);
    
    // Update NPC relationships based on interaction
    this.updateRelationshipsFromInteraction(interaction);
  }

  private updateRelationshipsFromInteraction(interaction: NPCInteraction): void {
    const npc = this.npcs.get(interaction.npcId);
    if (!npc) return;

    // Find or create relationship with player
    let relationship = npc.relationships.find(r => r.targetId === interaction.playerId);
    if (!relationship) {
      relationship = {
        targetId: interaction.playerId,
        targetType: 'player',
        relationshipType: 'acquaintance',
        strength: 0,
        trust: 50,
        respect: 50,
        fear: 0,
        love: 0,
        history: [],
        currentStatus: 'active',
        lastInteraction: new Date()
      };
      npc.relationships.push(relationship);
    }

    // Update relationship based on interaction
    if (interaction.relationshipChange) {
      Object.assign(relationship, interaction.relationshipChange);
    }

    // Add interaction to history
    relationship.history.push({
      id: interaction.id,
      date: interaction.timestamp,
      type: this.getInteractionType(interaction.type),
      description: interaction.content,
      impact: {
        strength: interaction.relationshipChange?.strength || 0,
        trust: interaction.relationshipChange?.trust || 0,
        respect: interaction.relationshipChange?.respect || 0,
        fear: interaction.relationshipChange?.fear || 0,
        love: interaction.relationshipChange?.love || 0
      },
      context: interaction.content
    });

    relationship.lastInteraction = interaction.timestamp;
    this.npcs.set(npc.id, npc);
  }

  private getInteractionType(type: InteractionType): 'positive' | 'negative' | 'neutral' | 'romantic' | 'conflict' | 'cooperation' {
    switch (type) {
      case 'greeting':
      case 'conversation':
      case 'compliment':
      case 'gift':
      case 'apology':
      case 'forgiveness':
        return 'positive';
      case 'insult':
      case 'threat':
      case 'betrayal':
        return 'negative';
      case 'romance':
        return 'romantic';
      case 'combat':
        return 'conflict';
      case 'quest':
      case 'help':
      case 'trade':
        return 'cooperation';
      default:
        return 'neutral';
    }
  }

  public getInteractions(npcId?: string): NPCInteraction[] {
    if (npcId) {
      return this.interactions.filter(i => i.npcId === npcId);
    }
    return this.interactions;
  }
}

export default NPCRelationshipService; 