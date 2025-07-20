import { Campaign, GameMessage, Character, NPC } from '../types';

// AI Service interfaces
interface WorldState {
  currentLocation: string;
  timeOfDay: string;
  weather: string;
  season: string;
  activeQuests?: string;
  npcs?: NPC[];
}

export interface AIContext {
  campaign: Campaign;
  recentMessages: GameMessage[];
  characters: Character[];
  worldState: WorldState;
}

interface AIResponse {
  content: string;
  model: string;
  responseTime: number;
  confidence: number;
}

export class AIService {
  private conversationHistory: Map<string, GameMessage[]> = new Map();
  private contextMemory: Map<string, unknown> = new Map();
  private vertexAiEndpoint: string;
  private openAiEndpoint: string;

  constructor() {
    // Initialize API endpoints from environment
    this.vertexAiEndpoint = process.env.VITE_VERTEX_AI_ENDPOINT || 'https://generativelanguage.googleapis.com';
    this.openAiEndpoint = 'https://api.openai.com/v1/chat/completions';
    
    console.log('🤖 AI Service: Initialized with endpoints:', {
      vertexAiEndpoint: this.vertexAiEndpoint,
      openAiEndpoint: this.openAiEndpoint,
      hasOpenAIKey: !!process.env.VITE_OPENAI_API_KEY,
      hasVertexAIKey: !!process.env.VITE_VERTEX_AI_API_KEY
    });
  }

  async generateResponse(
    context: AIContext,
    userInput: string,
    aiPersonality: string = 'dramatic'
  ): Promise<string> {
    console.log('🤖 AI Service: Starting response generation...');
    console.log('🤖 AI Service: Context received:', {
      campaignName: context.campaign.name,
      campaignId: context.campaign.id,
      recentMessagesCount: context.recentMessages.length,
      charactersCount: context.characters.length,
      worldState: context.worldState
    });
    console.log('🤖 AI Service: User input:', userInput);
    console.log('🤖 AI Service: AI personality:', aiPersonality);

    try {
      // Try Vertex AI first (primary AI)
      console.log('🤖 AI Service: Attempting Vertex AI (Gemini Pro)...');
      const vertexResponse = await this.tryVertexAI(context, userInput, aiPersonality);
      if (vertexResponse) {
        console.log('🤖 AI Service: ✅ Vertex AI (Gemini Pro) response received:', vertexResponse.content.substring(0, 100) + '...');
        return vertexResponse.content;
      }

      // Fallback to OpenAI
      console.log('🤖 AI Service: Vertex AI failed, attempting OpenAI (GPT-4)...');
      const openAiResponse = await this.tryOpenAI(context, userInput, aiPersonality);
      if (openAiResponse) {
        console.log('🤖 AI Service: ✅ OpenAI (GPT-4) response received:', openAiResponse.content.substring(0, 100) + '...');
        return openAiResponse.content;
      }

      // Final fallback to intelligent local response
      console.log('🤖 AI Service: ⚠️ External AI failed, using intelligent local fallback...');
      const fallbackResponse = this.generateIntelligentFallback(context, userInput, aiPersonality);
      console.log('🤖 AI Service: 🔄 Local fallback response:', fallbackResponse.substring(0, 100) + '...');
      return fallbackResponse;

    } catch (error) {
      console.error('🤖 AI Service Error:', error);
      console.log('🤖 AI Service: 🚨 Using emergency fallback...');
      const emergencyResponse = this.generateIntelligentFallback(context, userInput, aiPersonality);
      console.log('🤖 AI Service: 🆘 Emergency fallback response:', emergencyResponse.substring(0, 100) + '...');
      return emergencyResponse;
    }
  }

  private async tryVertexAI(
    context: AIContext, 
    userInput: string, 
    personality: string
  ): Promise<AIResponse | null> {
    const vertexAiKey = process.env.VITE_VERTEX_AI_API_KEY;
    if (!vertexAiKey) {
      console.log('Vertex AI API key not configured, skipping...');
      return null;
    }

    try {
      const systemPrompt = this.buildAdvancedSystemPrompt(context, personality);
      
      // Google Generative AI API call (simpler than full Vertex AI)
      const response = await fetch(`${this.vertexAiEndpoint}/v1beta/models/gemini-pro:generateContent?key=${vertexAiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nPlayer Action: ${userInput}` }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Vertex AI response error:', response.status, errorText);
        throw new Error(`Vertex AI request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (content) {
        console.log('🤖 AI Service: Vertex AI success!');
        return {
          content: this.enhanceWithPersonality(content, personality, context),
          model: 'gemini-pro',
          responseTime: Date.now() - Date.now(),
          confidence: 0.95
        };
      }
      
      console.error('Vertex AI response missing content:', data);
      return null;
    } catch (error) {
      console.error('Vertex AI error:', error);
      return null;
    }
  }

  private async tryOpenAI(
    context: AIContext, 
    userInput: string, 
    personality: string
  ): Promise<AIResponse | null> {
    const openAiKey = process.env.VITE_OPENAI_API_KEY;
    if (!openAiKey) {
      console.log('OpenAI API key not configured, skipping...');
      return null;
    }

    try {
      const systemPrompt = this.buildAdvancedSystemPrompt(context, personality);
      
      const response = await fetch(this.openAiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userInput
            }
          ],
          max_tokens: 1000,
          temperature: 0.8,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI response error:', response.status, errorText);
        throw new Error(`OpenAI request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (content) {
        console.log('🤖 AI Service: OpenAI success!');
        return {
          content: this.enhanceWithPersonality(content, personality, context),
          model: 'gpt-4',
          responseTime: Date.now() - Date.now(),
          confidence: 0.90
        };
      }
      
      console.error('OpenAI response missing content:', data);
      return null;
    } catch (error) {
      console.error('OpenAI error:', error);
      return null;
    }
  }

  private buildAdvancedSystemPrompt(context: AIContext, personality: string): string {
    const { campaign, characters, worldState } = context;
    
    // Get recent context (last 5 messages)
    const recentContext = context.recentMessages
      .slice(-5)
      .map(msg => `${msg.senderId}: ${msg.content}`)
      .join('\n');

    // Get active quests
    const activeQuests = worldState.activeQuests || 'No active quests';

    // Get notable NPCs
    const npcs = worldState.npcs
      ?.slice(0, 3)
      .map((npc: NPC) => `- ${npc.name} (${npc.race}): ${npc.description}`)
      .join('\n') || 'No notable NPCs present';

    return `You are an expert Dungeon Master running "${campaign.name}" - a ${campaign.theme} campaign.

CURRENT CONTEXT:
- Location: ${worldState.currentLocation}
- Time: ${worldState.timeOfDay}, ${worldState.weather}, ${worldState.season}
- Campaign Difficulty: ${campaign.settings.difficulty}
- AI Personality: ${personality}

PARTY COMPOSITION:
${characters.map(char => `${char.name} (Level ${char.level} ${char.race} ${char.class} - HP: ${char.hitPoints.current}/${char.hitPoints.maximum})`).join('\n')}

ACTIVE QUESTS:
${activeQuests}

NOTABLE NPCs:
${npcs}

RECENT CONVERSATION:
${recentContext}

PERSONALITY GUIDELINES:
${this.getAdvancedPersonalityGuidelines(personality)}

RESPONSE REQUIREMENTS:
- Respond as an expert DM would, describing scenes vividly
- Manage consequences of player actions realistically
- Advance the story while respecting player agency
- Request specific dice rolls when mechanically appropriate
- Keep responses engaging and immersive (2-4 sentences typically)
- Maintain consistency with established world state and character relationships
- Consider the emotional weight and consequences of actions`;
  }

  private getAdvancedPersonalityGuidelines(personality: string): string {
    const guidelines = {
      helpful: `Be encouraging and collaborative. Offer subtle hints when players seem stuck. Focus on enabling player success while maintaining challenge. Use supportive language and emphasize teamwork.`,
      
      dramatic: `Use vivid, cinematic language that emphasizes the epic nature of events. Build tension through pacing and word choice. Describe actions with weight and consequence. Create memorable moments that feel larger than life.`,
      
      mysterious: `Speak in layers of meaning. Reveal information gradually and incompletely. Create atmosphere through what you don't say as much as what you do. Leave breadcrumbs of intrigue. Use evocative, enigmatic language.`,
      
      humorous: `Inject wit and levity while respecting the story's integrity. Use clever wordplay and situational comedy. Find humor in character interactions and unexpected situations. Keep the mood light without undermining dramatic moments.`
    };
    
    return guidelines[personality as keyof typeof guidelines] || guidelines.helpful;
  }

  private enhanceWithPersonality(response: string, personality: string, _context: AIContext): string {
    const enhancements = {
      dramatic: [
        "The very fabric of destiny trembles!",
        "This moment shall echo through legend!",
        "The threads of fate converge!",
        "History holds its breath..."
      ],
      mysterious: [
        "...though deeper currents flow beneath.",
        "Yet shadows whisper of hidden truths.",
        "The veil between worlds grows thin.",
        "Ancient powers stir in response..."
      ],
      humorous: [
        "Well, that's one for the tavern tales!",
        "Your chronicler will have interesting notes.",
        "Even the gods are taking notes.",
        "That's either brilliant or completely mad. Possibly both."
      ],
      helpful: [
        "Consider your options carefully - you have several paths forward.",
        "Remember, your party's strengths complement each other well.",
        "This situation has multiple solutions worth exploring.",
        "Trust in your abilities and work together."
      ]
    };

    // Add personality enhancement 30% of the time
    if (Math.random() < 0.3 && personality in enhancements) {
      const enhancement = enhancements[personality as keyof typeof enhancements];
      const selectedEnhancement = enhancement[Math.floor(Math.random() * enhancement.length)];
      return `${response} ${selectedEnhancement}`;
    }

    return response;
  }

  private generateIntelligentFallback(context: AIContext, userInput: string, personality: string): string {
    const input = (userInput || '').toLowerCase();
    const { campaign, worldState } = context;

    // Special handling for welcome messages
    if (input.includes('dungeon master') && input.includes('set the stage')) {
      console.log('🤖 AI Service: Detected welcome message request, generating scene-setting response...');
      return this.generateWelcomeMessage(context, personality);
    }

    // Contextual response categories based on input analysis
    const responseCategories = {
      exploration: [
        `As you explore ${worldState.currentLocation}, the ${worldState.weather.toLowerCase()} ${worldState.timeOfDay} air carries hints of ${Math.random() > 0.5 ? 'adventure' : 'mystery'} ahead...`,
        `Your investigation of the area reveals details that others might overlook. The ${worldState.timeOfDay} light plays across surfaces, creating new perspectives...`,
        `The environment around you tells a story - one of ${campaign.theme.toLowerCase()} and the traces left by those who came before...`
      ],
      combat: [
        `Steel rings against steel as the battle erupts! Roll for initiative as ${worldState.timeOfDay} shadows dance around the conflict!`,
        `The clash of combat fills the air! Your training kicks in as instinct takes over. Time to see what you're truly made of!`,
        `Battle is joined! The very ground trembles with the force of the encounter. Victory will require both skill and cunning!`
      ],
      social: [
        `The NPCs around you study your approach with interest. In ${worldState.currentLocation}, reputation and words carry significant weight...`,
        `Your social gambit resonates with the cultural dynamics of this ${campaign.theme.toLowerCase()} setting. How others respond will depend on more than just words...`,
        `The social currents in ${worldState.currentLocation} are complex. Your approach could open new doors... or close others forever.`
      ],
      magic: [
        `Arcane energies respond to your will, weaving through the ${worldState.weather.toLowerCase()} ${worldState.timeOfDay} air with otherworldly power...`,
        `The magical forces around ${worldState.currentLocation} seem particularly responsive during this ${worldState.timeOfDay}. Your spell takes on enhanced significance...`,
        `Magic flows through you like a living thing, shaped by your intent and the mystical properties of this ${campaign.theme.toLowerCase()} realm...`
      ],
      investigation: [
        `Your keen observation cuts through surface appearances. In ${worldState.currentLocation}, the truth often hides in plain sight...`,
        `The clues begin to form a pattern - one that speaks to larger forces at work in this ${campaign.theme.toLowerCase()} world...`,
        `Your investigation reveals layers of complexity. Nothing is quite as simple as it first appeared in this intricate web of cause and effect...`
      ]
    };

    // Determine response category based on input keywords
    const responses: string[] = (() => {
      if (/attack|fight|combat|battle|strike|hit|sword|weapon/.test(input)) {
        return responseCategories.combat;
      } else if (/talk|speak|persuade|convince|diplomacy|negotiate|social/.test(input)) {
        return responseCategories.social;
      } else if (/cast|spell|magic|arcane|enchant|summon/.test(input)) {
        return responseCategories.magic;
      } else if (/search|investigate|examine|study|look|inspect|clue/.test(input)) {
        return responseCategories.investigation;
      }
      return responseCategories.exploration; // default
    })();

    const response = responses[Math.floor(Math.random() * responses.length)];
    return this.enhanceWithPersonality(response, personality, context);
  }

  private generateWelcomeMessage(context: AIContext, personality: string): string {
    const { campaign, worldState, characters } = context;
    
    const timeDescriptions = {
      morning: "Golden rays of dawn",
      afternoon: "Warm afternoon sunlight",
      evening: "Soft evening light",
      night: "Silver moonlight",
      midnight: "Deep midnight shadows"
    };

    const weatherDescriptions = {
      "Clear skies": "crystal clear skies stretch overhead",
      "Cloudy": "soft clouds drift lazily across the sky",
      "Rainy": "gentle rain patters against the ground",
      "Stormy": "dark storm clouds gather ominously",
      "Foggy": "mysterious fog swirls around you"
    };

    const themeDescriptions = {
      "High Fantasy": "magical realm where legends are born",
      "Dark Fantasy": "shadowy world of danger and intrigue",
      "Steampunk": "mechanical marvels and steam-powered wonders",
      "Post-Apocalyptic": "ruined world struggling to rebuild",
      "Medieval": "age of knights, castles, and chivalry",
      "Sci-Fi": "futuristic world of technology and wonder",
      "Horror": "terrifying realm where nightmares come to life",
      "Adventure": "world of exploration and discovery",
      "Mystery": "enigmatic realm of secrets and intrigue",
      "Comedy": "whimsical world of laughter and lighthearted adventure"
    };

    const timeDesc = timeDescriptions[worldState.timeOfDay as keyof typeof timeDescriptions] || "Light";
    const weatherDesc = weatherDescriptions[worldState.weather as keyof typeof weatherDescriptions] || "clear skies stretch overhead";
    const themeDesc = themeDescriptions[campaign.theme as keyof typeof themeDescriptions] || "fantasy realm";

    const characterIntro = characters.length > 0 
      ? `\n\nYou find yourselves in ${worldState.currentLocation} - ${characters.map(c => `${c.name}, the ${c.race} ${c.class}`).join(' and ')} stand ready for adventure.`
      : `\n\nYou find yourselves in ${worldState.currentLocation}, ready to begin your journey.`;

    const baseMessage = `${timeDesc} filters through ${weatherDesc} as you step into the ${themeDesc} of ${campaign.name}. ${characterIntro}

The ${worldState.season.toLowerCase()} air carries the promise of adventure, and the world around you seems to hold its breath, waiting for the story that's about to unfold.`;

    return this.enhanceWithPersonality(baseMessage, personality, context);
  }

  async generateCombatNarrative(_action: string, result: number, _target?: string): Promise<string> {
    const narratives = {
      critical: [
        "CRITICAL SUCCESS! Your perfect execution leaves even seasoned warriors in awe!",
        "The stars align! Your strike is flawless, a moment of legendary prowess!",
        "A masterful display! Your technique is poetry in motion, devastating and beautiful!"
      ],
      fumble: [
        "The chaos of battle claims another victim as your action goes spectacularly awry!",
        "Fortune abandons you at the crucial moment, turning triumph into disaster!",
        "In the heat of combat, even the best-laid plans can unravel catastrophically!"
      ],
      success: [
        "Your action connects with satisfying precision, training and determination paying off!",
        "Skill and timing converge as your effort finds its mark successfully!",
        "Your focused execution achieves exactly what you intended!"
      ],
      failure: [
        "Your attempt meets with stubborn resistance as circumstances work against you!",
        "Despite your best efforts, this action doesn't unfold as planned!",
        "The fickle nature of combat deflects your otherwise sound strategy!"
      ]
    };

    if (result === 20) return narratives.critical[Math.floor(Math.random() * narratives.critical.length)];
    if (result === 1) return narratives.fumble[Math.floor(Math.random() * narratives.fumble.length)];
    if (result >= 15) return narratives.success[Math.floor(Math.random() * narratives.success.length)];
    return narratives.failure[Math.floor(Math.random() * narratives.failure.length)];
  }

  // Context memory management
  updateContextMemory(campaignId: string, key: string, value: unknown): void {
    const contextKey = `${campaignId}:${key}`;
    this.contextMemory.set(contextKey, value);
  }

  getContextMemory(campaignId: string, key: string): unknown {
    const contextKey = `${campaignId}:${key}`;
    return this.contextMemory.get(contextKey);
  }

  // Conversation history management
  addToHistory(campaignId: string, message: GameMessage): void {
    if (!this.conversationHistory.has(campaignId)) {
      this.conversationHistory.set(campaignId, []);
    }
    
    const history = this.conversationHistory.get(campaignId)!;
    history.push(message);
    
    // Keep only last 50 messages for performance
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }

  getConversationHistory(campaignId: string): GameMessage[] {
    return this.conversationHistory.get(campaignId) || [];
  }
}

// Export singleton instance
export const aiService = new AIService(); 