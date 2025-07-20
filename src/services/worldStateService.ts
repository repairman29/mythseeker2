import { WorldState, WorldEvent, NPC, Quest, Faction, EconomicItem } from '../types/world';

export interface WorldStateData {
  campaignId: string;
  worldState: WorldState;
  lastUpdated: Date;
  version: number;
}

export interface WorldEventData {
  id: string;
  campaignId: string;
  event: WorldEvent;
  triggeredAt: Date;
  completedAt?: Date;
}

export interface FactionData {
  id: string;
  campaignId: string;
  faction: Faction;
  lastUpdated: Date;
}

export interface EconomicData {
  id: string;
  campaignId: string;
  items: EconomicItem[];
  lastUpdated: Date;
}

class WorldStateService {
  private static instance: WorldStateService;
  private worldStates: Map<string, WorldState> = new Map();
  private callbacks: Array<(campaignId: string, worldState: WorldState) => void> = [];

  private constructor() {}

  static getInstance(): WorldStateService {
    if (!WorldStateService.instance) {
      WorldStateService.instance = new WorldStateService();
    }
    return WorldStateService.instance;
  }

  // Register callback for world state changes
  registerCallback(callback: (campaignId: string, worldState: WorldState) => void) {
    this.callbacks.push(callback);
  }

  // Unregister callback
  unregisterCallback(callback: (campaignId: string, worldState: WorldState) => void) {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  // Load world state (simplified for demo)
  async loadWorldState(campaignId: string): Promise<WorldState> {
    try {
      // Check if we have a cached world state
      const cachedState = this.worldStates.get(campaignId);
      if (cachedState) {
        return cachedState;
      }

      // Create default world state
      const defaultWorldState = this.createDefaultWorldState();
      this.worldStates.set(campaignId, defaultWorldState);
      return defaultWorldState;
    } catch (error) {
      console.error('Failed to load world state:', error);
      return this.createDefaultWorldState();
    }
  }

  // Save world state (simplified for demo)
  async saveWorldState(campaignId: string, worldState: WorldState): Promise<void> {
    try {
      this.worldStates.set(campaignId, worldState);
      this.notifyCallbacks(campaignId, worldState);
    } catch (error) {
      console.error('Failed to save world state:', error);
      throw error;
    }
  }

  // Get current world state
  getWorldState(campaignId: string): WorldState | null {
    return this.worldStates.get(campaignId) || null;
  }

  // Update world state
  async updateWorldState(campaignId: string, updates: Partial<WorldState>): Promise<WorldState> {
    const currentState = this.getWorldState(campaignId);
    if (!currentState) {
      throw new Error('World state not found for campaign');
    }

    const updatedState: WorldState = {
      ...currentState,
      ...updates,
      lastUpdated: new Date()
    };

    await this.saveWorldState(campaignId, updatedState);
    return updatedState;
  }

  // Time management
  async advanceTime(campaignId: string, hours: number = 1): Promise<WorldState> {
    const currentState = this.getWorldState(campaignId);
    if (!currentState) {
      throw new Error('World state not found for campaign');
    }

    const currentTime = new Date(currentState.lastUpdated);
    const newTime = new Date(currentTime.getTime() + hours * 60 * 60 * 1000);

    // Calculate time of day
    const hour = newTime.getHours();
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // Update calendar
    const calendar = { ...currentState.calendar };
    const daysPassed = Math.floor(hours / 24);
    if (daysPassed > 0) {
      calendar.day += daysPassed;
      // Simple month progression (30 days per month)
      if (calendar.day > 30) {
        calendar.day = 1;
        // Cycle through seasons
        const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];
        const currentSeasonIndex = seasons.indexOf(calendar.month);
        const nextSeasonIndex = (currentSeasonIndex + 1) % seasons.length;
        calendar.month = seasons[nextSeasonIndex];
      }
    }

    const updatedState = await this.updateWorldState(campaignId, {
      timeOfDay,
      calendar,
      lastUpdated: newTime
    });

    // Check for time-based events
    await this.checkTimeBasedEvents(campaignId, updatedState);

    return updatedState;
  }

  // Weather system
  async updateWeather(campaignId: string): Promise<WorldState> {
    const currentState = this.getWorldState(campaignId);
    if (!currentState) {
      throw new Error('World state not found for campaign');
    }

    const weatherOptions: Array<'clear' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'snowy'> = ['clear', 'cloudy', 'rainy', 'stormy', 'foggy', 'snowy'];
    const newWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];

    return await this.updateWorldState(campaignId, {
      weather: newWeather
    });
  }

  // Location management
  async changeLocation(campaignId: string, newLocation: string): Promise<WorldState> {
    const currentState = this.getWorldState(campaignId);
    if (!currentState) {
      throw new Error('World state not found for campaign');
    }

    // Generate location-specific NPCs and events
    const locationNPCs = this.generateLocationNPCs(newLocation);
    const locationEvents = this.generateLocationEvents(newLocation);

    return await this.updateWorldState(campaignId, {
      currentLocation: newLocation,
      npcs: locationNPCs,
      events: [...currentState.events, ...locationEvents]
    });
  }

  // Event system
  async addWorldEvent(campaignId: string, event: WorldEvent): Promise<WorldState> {
    const currentState = this.getWorldState(campaignId);
    if (!currentState) {
      throw new Error('World state not found for campaign');
    }

    return await this.updateWorldState(campaignId, {
      events: [...currentState.events, event]
    });
  }

  // Faction system (simplified for demo)
  async updateFactionRelationships(campaignId: string, factionId: string, targetFactionId: string, change: number): Promise<void> {
    console.log(`Updated faction relationship: ${factionId} -> ${targetFactionId} = ${change}`);
  }

  // Economic system (simplified for demo)
  async updateEconomicPrices(campaignId: string, itemId: string, newPrice: number): Promise<void> {
    console.log(`Updated economic price: ${itemId} = ${newPrice}`);
  }

  // Quest system
  async addQuest(campaignId: string, quest: Quest): Promise<WorldState> {
    const currentState = this.getWorldState(campaignId);
    if (!currentState) {
      throw new Error('World state not found for campaign');
    }

    return await this.updateWorldState(campaignId, {
      activeQuests: [...currentState.activeQuests, quest]
    });
  }

  async completeQuest(campaignId: string, questId: string): Promise<WorldState> {
    const currentState = this.getWorldState(campaignId);
    if (!currentState) {
      throw new Error('World state not found for campaign');
    }

    const updatedQuests = currentState.activeQuests.filter(quest => quest.id !== questId);
    return await this.updateWorldState(campaignId, {
      activeQuests: updatedQuests
    });
  }

  // Private helper methods
  private createDefaultWorldState(): WorldState {
    return {
      currentLocation: 'Tavern',
      timeOfDay: 'morning',
      weather: 'clear',
      season: 'spring',
      activeQuests: [],
      npcs: [],
      events: [],
      calendar: {
        day: 1,
        month: 'Spring',
        year: 1492
      },
      lastUpdated: new Date()
    };
  }

  private notifyCallbacks(campaignId: string, worldState: WorldState) {
    this.callbacks.forEach(callback => {
      try {
        callback(campaignId, worldState);
      } catch (error) {
        console.error('Error in world state callback:', error);
      }
    });
  }

  private async checkTimeBasedEvents(campaignId: string, worldState: WorldState) {
    // Check for scheduled events
    const timeBasedEvents = worldState.events.filter(event => 
      event.type === 'scheduled' && 
      event.scheduledTime && 
      new Date(event.scheduledTime) <= new Date()
    );

    for (const event of timeBasedEvents) {
      await this.triggerEvent(campaignId, event);
    }
  }

  private async triggerEvent(campaignId: string, event: WorldEvent) {
    // Update world state based on event
    const currentState = this.getWorldState(campaignId);
    if (currentState) {
      const updatedEvents = currentState.events.map(e => 
        e.id === event.id ? { ...e, triggered: true } : e
      );
      await this.updateWorldState(campaignId, { events: updatedEvents });
    }
  }

  private generateLocationNPCs(location: string): NPC[] {
    const npcTemplates: Record<string, NPC[]> = {
      'Tavern': [
        { id: 'innkeeper', name: 'Greta the Innkeeper', role: 'innkeeper', disposition: 'friendly' },
        { id: 'barkeep', name: 'Tom the Barkeep', role: 'barkeep', disposition: 'neutral' }
      ],
      'Market': [
        { id: 'merchant', name: 'Marcus the Merchant', role: 'merchant', disposition: 'friendly' },
        { id: 'guard', name: 'Sergeant Kael', role: 'guard', disposition: 'neutral' }
      ],
      'Castle': [
        { id: 'noble', name: 'Lord Aldric', role: 'noble', disposition: 'formal' },
        { id: 'advisor', name: 'Counselor Elara', role: 'advisor', disposition: 'helpful' }
      ]
    };

    return npcTemplates[location] || [];
  }

  private generateLocationEvents(location: string): WorldEvent[] {
    const eventTemplates: Record<string, WorldEvent[]> = {
      'Tavern': [
        { id: 'brawl', type: 'random' as const, title: 'Bar Brawl', description: 'A fight breaks out between patrons' },
        { id: 'performance', type: 'scheduled' as const, title: 'Bard Performance', description: 'A traveling bard performs' }
      ],
      'Market': [
        { id: 'theft', type: 'random' as const, title: 'Pickpocket', description: 'Someone reports a theft' },
        { id: 'festival', type: 'scheduled' as const, title: 'Market Festival', description: 'A local festival is in full swing' }
      ]
    };

    return eventTemplates[location] || [];
  }

  // Subscribe to real-time world state changes (simplified for demo)
  subscribeToWorldState(campaignId: string, callback: (worldState: WorldState) => void): () => void {
    // For demo purposes, just return a no-op function
    // In a real implementation, this would set up Firebase listeners
    return () => {
      console.log('Unsubscribed from world state changes');
    };
  }
}

export default WorldStateService; 