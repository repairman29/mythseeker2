import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  setDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  getRedirectResult,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { User, Character, Campaign, GameMessage } from '../types';

export class FirebaseService {
  private currentUser: User | null = null;
  private authStateChangeListeners: ((user: User | null) => void)[] = [];
  private authStateListenerInitialized = false;

  // Helper function to safely convert timestamps
  private convertTimestamp(timestamp: Timestamp | null | undefined): Date {
    if (!timestamp) return new Date();
    return timestamp.toDate();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  constructor() {
    console.log('🔧 FirebaseService: Initializing...');
    // Don't set up the listener here - wait for first subscription
  }

  private initializeAuthStateListener() {
    if (this.authStateListenerInitialized) {
      return;
    }
    
    this.authStateListenerInitialized = true;
    
    // Check for redirect result first
    this.handleRedirectResult();
    
    // Listen for auth state changes
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await this.getOrCreateUser(firebaseUser);
          this.currentUser = user;
          this.authStateChangeListeners.forEach(listener => listener(user));
        } catch (error) {
          console.error('Error getting/creating user:', error);
          this.currentUser = null;
          this.authStateChangeListeners.forEach(listener => listener(null));
        }
      } else {
        this.currentUser = null;
        this.authStateChangeListeners.forEach(listener => listener(null));
      }
    });
  }

  private async handleRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        // User signed in via redirect
        const user = await this.getOrCreateUser(result.user);
        this.currentUser = user;
        this.authStateChangeListeners.forEach(listener => listener(user));
      }
    } catch (error) {
      console.error('Error handling redirect result:', error);
    }
  }

  private async getOrCreateUser(firebaseUser: FirebaseUser): Promise<User> {
    // Wait a moment to ensure Firebase Auth is fully initialized
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const userRef = doc(db, 'users', firebaseUser.uid);
    
    try {
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // Update last login
        await updateDoc(userRef, {
          lastLoginAt: serverTimestamp()
        });
        const userData = userSnap.data();
        const user: User = {
          ...userData,
          id: userSnap.id
        } as User;
        return user;
      } else {
        // Create new user document
        const newUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Anonymous',
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          preferences: {
            theme: 'light',
            notifications: true,
            aiPersonality: 'dramatic',
            voiceEnabled: false,
            autoRoll: false
          },
          subscription: {
            tier: 'free',
            features: ['1 campaign', 'basic AI', 'community content']
          },
          stats: {
            campaignsPlayed: 0,
            charactersCreated: 0,
            sessionsAttended: 0,
            totalPlayTime: 0,
            favoriteClass: '',
            achievementsUnlocked: 0
          }
        };

        // Use setDoc instead of updateDoc for creating new documents
        await setDoc(userRef, {
          ...newUser,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        });

        return newUser;
      }
    } catch (error) {
      console.error('Error in getOrCreateUser:', error);
      // Return a basic user object if Firestore access fails
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Anonymous',
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        preferences: {
          theme: 'light',
          notifications: true,
          aiPersonality: 'dramatic',
          voiceEnabled: false,
          autoRoll: false
        },
        subscription: {
          tier: 'free',
          features: ['1 campaign', 'basic AI', 'community content']
        },
        stats: {
          campaignsPlayed: 0,
          charactersCreated: 0,
          sessionsAttended: 0,
          totalPlayTime: 0,
          favoriteClass: '',
          achievementsUnlocked: 0
        }
      };
    }
  }

  // Authentication methods
  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    try {
      // Try popup first
      const result = await signInWithPopup(auth, provider);
      const user = await this.getOrCreateUser(result.user);
      return user;
    } catch (error: any) {
      console.error('Popup sign-in failed, trying redirect:', error);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled');
      } else if (error.code === 'auth/popup-blocked' || 
                 error.code === 'auth/cancelled-popup-request' ||
                 error.code === 'auth/unauthorized-domain') {
        // Fallback to redirect for popup-blocked scenarios
        try {
          await signInWithRedirect(auth, provider);
          // The redirect will happen, and the result will be handled in handleRedirectResult
          throw new Error('Redirecting to Google sign-in...');
        } catch (redirectError) {
          console.error('Redirect sign-in also failed:', redirectError);
          throw new Error('Sign-in failed. Please try again.');
        }
      } else {
        throw new Error('Failed to sign in with Google');
      }
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    // Prevent duplicate callbacks
    if (this.authStateChangeListeners.includes(callback)) {
      return () => {
        const index = this.authStateChangeListeners.indexOf(callback);
        if (index > -1) {
          this.authStateChangeListeners.splice(index, 1);
        }
      };
    }
    
    this.authStateChangeListeners.push(callback);
    
    // Initialize listener if not already
    if (!this.authStateListenerInitialized) {
      this.initializeAuthStateListener();
    }

    // Return unsubscribe function
    return () => {
      const index = this.authStateChangeListeners.indexOf(callback);
      if (index > -1) {
        this.authStateChangeListeners.splice(index, 1);
      }
    };
  }

  // Character methods
  async createCharacter(characterData: Partial<Character>): Promise<Character> {
    if (!this.currentUser) throw new Error('User not authenticated');

    try {
      const charactersRef = collection(db, 'characters');
      const character: Omit<Character, 'id'> = {
        userId: this.currentUser.id,
        name: characterData.name || 'Unnamed Hero',
        race: characterData.race || 'Human',
        class: characterData.class || 'Fighter',
        level: 1,
        background: characterData.background || 'Folk Hero',
        alignment: 'Neutral Good',
        abilities: {
          strength: 15,
          dexterity: 14,
          constitution: 13,
          intelligence: 12,
          wisdom: 10,
          charisma: 8
        },
        hitPoints: { current: 10, maximum: 10, temporary: 0 },
        armorClass: 16,
        proficiencyBonus: 2,
        speed: 30,
        experience: 0,
        skills: {
          athletics: { proficient: true, expertise: false },
          intimidation: { proficient: true, expertise: false }
        },
        savingThrows: {
          strength: true,
          constitution: true
        },
        languages: ['Common'],
        equipment: {
          weapons: ['Longsword'],
          armor: ['Chain Mail'],
          items: ['Adventurer\'s Pack', 'Rope (50 feet)', 'Torch (10)'],
          money: { gold: 100, silver: 0, copper: 0 }
        },
        personality: {
          traits: ['I judge people by their actions, not their words.'],
          ideals: ['People deserve to be treated with dignity and respect.'],
          bonds: ['I have a family that I must protect.'],
          flaws: ['I have trouble trusting in my allies.']
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        campaignHistory: [],
        achievements: []
      };

      const docRef = await addDoc(charactersRef, {
        ...character,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const result = { ...character, id: docRef.id };
      return result;
    } catch (error) {
      console.error('Error creating character:', error);
      throw new Error('Failed to create character');
    }
  }

  async getCharacters(userId: string): Promise<Character[]> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const charactersRef = collection(db, 'characters');
      const q = query(
        charactersRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const characters: Character[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        characters.push({
          ...data,
          id: doc.id,
          createdAt: this.convertTimestamp(data.createdAt),
          updatedAt: this.convertTimestamp(data.updatedAt)
        } as Character);
      });
      
      return characters;
    } catch (error) {
      console.error('Error getting characters:', error);
      throw new Error('Failed to get characters');
    }
  }

  async updateCharacter(characterId: string, updates: Partial<Character>): Promise<Character> {
    if (!this.currentUser) throw new Error('User not authenticated');

    try {
      const characterRef = doc(db, 'characters', characterId);
      
      await updateDoc(characterRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      const updatedDoc = await getDoc(characterRef);
      if (!updatedDoc.exists()) {
        throw new Error('Character not found after update');
      }
      
      const data = updatedDoc.data();
      
      const result = {
        ...data,
        id: updatedDoc.id,
        createdAt: this.convertTimestamp(data.createdAt),
        updatedAt: this.convertTimestamp(data.updatedAt)
      } as Character;
      
      return result;
    } catch (error) {
      console.error('Error updating character:', error);
      throw new Error('Failed to update character');
    }
  }

  async deleteCharacter(characterId: string): Promise<void> {
    if (!this.currentUser) throw new Error('User not authenticated');

    try {
      const characterRef = doc(db, 'characters', characterId);
      
      await deleteDoc(characterRef);
    } catch (error) {
      console.error('Error deleting character:', error);
      throw new Error('Failed to delete character');
    }
  }

  // Campaign methods
  async createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
    if (!this.currentUser) throw new Error('User not authenticated');

    try {
      const campaignsRef = collection(db, 'campaigns');
      const campaign: Omit<Campaign, 'id'> = {
        name: campaignData.name || 'New Adventure',
        description: campaignData.description || 'An epic journey awaits!',
        theme: 'High Fantasy',
        host: this.currentUser.id,
        players: [],
        maxPlayers: campaignData.maxPlayers || 6,
        isPublic: campaignData.isPublic || false,
        settings: {
          difficulty: 'medium',
          ruleSet: 'dnd5e',
          aiPersonality: 'dramatic',
          voiceEnabled: false,
          allowPlayerSecrets: true,
          experienceType: 'milestone',
          restingRules: 'standard'
        },
        worldState: {
          currentLocation: 'Starting Village',
          timeOfDay: 'morning',
          weather: 'Clear skies',
          season: 'Spring',
          activeQuests: [],
          npcs: [],
          events: [],
          calendar: {
            day: 1,
            month: 'Hammer',
            year: 1491
          }
        },
        status: 'active',
        createdAt: new Date(),
        lastPlayedAt: new Date(),
        tags: ['fantasy', 'adventure']
      };

      const docRef = await addDoc(campaignsRef, {
        ...campaign,
        createdAt: serverTimestamp(),
        lastPlayedAt: serverTimestamp()
      });

      // Add the host to the players subcollection so they can read messages
      const playerRef = doc(db, 'campaigns', docRef.id, 'players', this.currentUser.id);
      await setDoc(playerRef, {
        userId: this.currentUser.id,
        displayName: this.currentUser.displayName,
        email: this.currentUser.email,
        joinedAt: serverTimestamp(),
        role: 'host',
        isActive: true
      });

      return { ...campaign, id: docRef.id };
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw new Error('Failed to create campaign');
    }
  }

  async getCampaigns(): Promise<Campaign[]> {
    if (!this.currentUser) throw new Error('User not authenticated');
    
    if (!this.currentUser.id) {
      console.error('🔧 Validation error: currentUser.id is undefined or empty');
      throw new Error('User ID is required');
    }

    try {
      const campaignsRef = collection(db, 'campaigns');
      const q = query(
        campaignsRef,
        where('host', '==', this.currentUser.id),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const campaigns: Campaign[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        campaigns.push({
          ...data,
          id: doc.id,
          createdAt: this.convertTimestamp(data.createdAt),
          lastPlayedAt: this.convertTimestamp(data.lastPlayedAt)
        } as Campaign);
      });
      
      return campaigns;
    } catch (error) {
      console.error('Error getting campaigns:', error);
      throw new Error('Failed to get campaigns');
    }
  }

  async getCampaign(campaignId: string): Promise<Campaign> {
    if (!this.currentUser) throw new Error('User not authenticated');

    try {
      const campaignRef = doc(db, 'campaigns', campaignId);
      const campaignDoc = await getDoc(campaignRef);
      
      if (!campaignDoc.exists()) {
        throw new Error('Campaign not found');
      }
      
      const data = campaignDoc.data();
      
      return {
        ...data,
        id: campaignDoc.id,
        createdAt: this.convertTimestamp(data.createdAt),
        lastPlayedAt: this.convertTimestamp(data.lastPlayedAt)
      } as Campaign;
    } catch (error) {
      console.error('Error getting campaign:', error);
      throw new Error('Failed to get campaign');
    }
  }

  async updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<Campaign> {
    if (!this.currentUser) throw new Error('User not authenticated');

    try {
      const campaignRef = doc(db, 'campaigns', campaignId);
      await updateDoc(campaignRef, {
        ...updates,
        lastPlayedAt: serverTimestamp()
      });
      
      const updatedDoc = await getDoc(campaignRef);
      if (!updatedDoc.exists()) {
        throw new Error('Campaign not found after update');
      }
      
      const data = updatedDoc.data();
      
      return {
        ...data,
        id: updatedDoc.id,
        createdAt: this.convertTimestamp(data.createdAt),
        lastPlayedAt: this.convertTimestamp(data.lastPlayedAt)
      } as Campaign;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw new Error('Failed to update campaign');
    }
  }

  async joinCampaign(campaignId: string): Promise<void> {
    if (!this.currentUser) throw new Error('User not authenticated');

    try {
      console.log('🔧 joinCampaign: Starting to join campaign:', campaignId);
      console.log('🔧 joinCampaign: Current user:', this.currentUser.id);
      
      // Check if user is already a member
      const playerRef = doc(db, 'campaigns', campaignId, 'players', this.currentUser.id);
      const playerDoc = await getDoc(playerRef);
      
      if (playerDoc.exists()) {
        console.log('🔧 joinCampaign: User is already a member of this campaign');
        return; // User is already a member, no need to join again
      }
      
      // Add the user to the players subcollection
      console.log('🔧 joinCampaign: Adding user to players subcollection...');
      
      await setDoc(playerRef, {
        userId: this.currentUser.id,
        displayName: this.currentUser.displayName,
        email: this.currentUser.email,
        joinedAt: serverTimestamp(),
        role: 'player',
        isActive: true
      });

      console.log('🔧 joinCampaign: User successfully added to players subcollection');

      // Update the campaign's players array
      const campaignRef = doc(db, 'campaigns', campaignId);
      console.log('🔧 joinCampaign: Updating campaign lastPlayedAt...');
      
      await updateDoc(campaignRef, {
        lastPlayedAt: serverTimestamp()
      });

      console.log('🔧 joinCampaign: Campaign joined successfully!');
    } catch (error) {
      console.error('🔧 joinCampaign: Error details:', error);
      console.error('🔧 joinCampaign: Error code:', (error as any).code);
      console.error('🔧 joinCampaign: Error message:', (error as any).message);
      throw new Error('Failed to join campaign');
    }
  }

  // Helper method to check if user is a campaign member
  async isCampaignMember(campaignId: string): Promise<boolean> {
    if (!this.currentUser) return false;

    try {
      const playerRef = doc(db, 'campaigns', campaignId, 'players', this.currentUser.id);
      const playerDoc = await getDoc(playerRef);
      return playerDoc.exists();
    } catch (error) {
      console.error('Error checking campaign membership:', error);
      return false;
    }
  }

  // Message methods
  async sendMessage(message: Partial<GameMessage>): Promise<string> {
    console.log('🔧 sendMessage: Starting message send...');
    console.log('🔧 sendMessage: Current user:', this.currentUser?.id);
    console.log('🔧 sendMessage: Campaign ID:', message.campaignId);
    
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    // Check if user is a member of the campaign
    const isMember = await this.isCampaignMember(message.campaignId!);
    console.log('🔧 sendMessage: User is campaign member:', isMember);
    
    if (!isMember) {
      throw new Error('User is not a member of this campaign');
    }

    const messageData = {
      ...message,
      senderId: this.currentUser.id,
      senderName: this.currentUser.displayName || this.currentUser.email || 'Unknown User',
      timestamp: message.timestamp || new Date(),
      id: message.id || this.generateId()
    };

    console.log('🔧 sendMessage: Message data prepared:', messageData);
    console.log('🔧 sendMessage: Attempting to add document to Firestore...');

    try {
      const docRef = await addDoc(collection(db, 'campaigns', message.campaignId!, 'messages'), messageData);
      console.log('🔧 sendMessage: Message sent successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('🔧 sendMessage: Error details:', error);
      console.error('🔧 sendMessage: Error code:', (error as any).code);
      console.error('🔧 sendMessage: Error message:', (error as any).message);
      throw new Error('Failed to send message');
    }
  }

  async sendAIMessage(campaignId: string, content: string, aiContext?: any): Promise<string> {
    console.log('🔧 sendAIMessage: Starting AI message send...');
    console.log('🔧 sendAIMessage: Current user:', this.currentUser?.id);
    console.log('🔧 sendAIMessage: Campaign ID:', campaignId);
    
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    // Check if user is a member of the campaign
    const isMember = await this.isCampaignMember(campaignId);
    console.log('🔧 sendAIMessage: User is campaign member:', isMember);
    
    if (!isMember) {
      throw new Error('User is not a member of this campaign');
    }

    const messageData = {
      campaignId,
      senderId: this.currentUser.id, // Use current user's ID for permissions
      senderName: 'Dungeon Master', // But display as DM
      content,
      timestamp: new Date(),
      type: 'dm',
      id: this.generateId(),
      metadata: {
        aiContext: {
          model: aiContext?.model || 'gemini-pro',
          responseTime: Date.now(),
          confidence: aiContext?.confidence || 0.95,
          isAI: true // Mark this as an AI message
        }
      }
    };

    console.log('🔧 sendAIMessage: AI message data prepared:', messageData);
    console.log('🔧 sendAIMessage: Attempting to add AI message to Firestore...');

    try {
      const docRef = await addDoc(collection(db, 'campaigns', campaignId, 'messages'), messageData);
      console.log('🔧 sendAIMessage: AI message sent successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('🔧 sendAIMessage: Error details:', error);
      console.error('🔧 sendAIMessage: Error code:', (error as any).code);
      console.error('🔧 sendAIMessage: Error message:', (error as any).message);
      throw new Error('Failed to send AI message');
    }
  }

  async getMessages(campaignId: string, limitCount: number = 50): Promise<GameMessage[]> {
    if (!this.currentUser) {
      console.warn('User not authenticated when trying to get messages');
      return [];
    }

    try {
      const messagesRef = collection(db, 'campaigns', campaignId, 'messages');
      const q = query(
        messagesRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const messages: GameMessage[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        messages.push({
          ...data,
          id: doc.id,
          timestamp: this.convertTimestamp(data.timestamp)
        } as GameMessage);
      });
      
      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting messages:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  // Real-time subscriptions
  subscribeToMessages(campaignId: string, callback: (messages: GameMessage[]) => void): () => void {
    const messagesRef = collection(db, 'campaigns', campaignId, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const messages: GameMessage[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          ...data,
          id: doc.id,
          timestamp: this.convertTimestamp(data.timestamp)
        } as GameMessage);
      });
      callback(messages.reverse());
    });
  }

  // Utility methods
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async rollDice(diceType: string, modifier: number = 0): Promise<{
    result: number;
    total: number;
    critical: boolean;
  }> {
    // Simulate network delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
    
    const sides = diceType === 'd100' ? 100 : parseInt(diceType.substring(1));
    const result = Math.floor(Math.random() * sides) + 1;
    const total = result + modifier;
    const critical = (diceType === 'd20' && (result === 20 || result === 1));
    
    return { result, total, critical };
  }
}

// Singleton pattern - ensure only one instance exists
let firebaseServiceInstance: FirebaseService | null = null;

export function getFirebaseService(): FirebaseService {
  if (!firebaseServiceInstance) {
    console.log('🔧 Creating FirebaseService singleton instance');
    firebaseServiceInstance = new FirebaseService();
  }
  return firebaseServiceInstance;
}

// Export the singleton instance
export const firebaseService = getFirebaseService(); 