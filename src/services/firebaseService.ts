import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { User, Character, Campaign, GameMessage } from '../types';

export class FirebaseService {
  private currentUser: User | null = null;
  private authStateChangeListeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Listen for auth state changes
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        this.handleAuthStateChange(firebaseUser);
      } else {
        this.currentUser = null;
        this.authStateChangeListeners.forEach(listener => listener(null));
      }
    });
  }

  private async handleAuthStateChange(firebaseUser: FirebaseUser): Promise<void> {
    try {
      // Get or create user document
      const userDoc = await this.getOrCreateUser(firebaseUser);
      this.currentUser = userDoc;
      this.authStateChangeListeners.forEach(listener => listener(userDoc));
    } catch (error) {
      console.error('Error handling auth state change:', error);
    }
  }

  private async getOrCreateUser(firebaseUser: FirebaseUser): Promise<User> {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Update last login
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp()
      });
      return userSnap.data() as User;
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

      await updateDoc(userRef, {
        ...newUser,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });

      return newUser;
    }
  }

  // Authentication methods
  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    try {
      const result = await signInWithPopup(auth, provider);
      const user = await this.getOrCreateUser(result.user);
      return user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw new Error('Failed to sign in with Google');
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
    this.authStateChangeListeners.push(callback);
    
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

      return { ...character, id: docRef.id };
    } catch (error) {
      console.error('Error creating character:', error);
      throw new Error('Failed to create character');
    }
  }

  async getCharacters(userId: string): Promise<Character[]> {
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
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Character);
      });
      
      return characters;
    } catch (error) {
      console.error('Error getting characters:', error);
      throw new Error('Failed to get characters');
    }
  }

  async updateCharacter(characterId: string, updates: Partial<Character>): Promise<Character> {
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
      return {
        ...data,
        id: updatedDoc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Character;
    } catch (error) {
      console.error('Error updating character:', error);
      throw new Error('Failed to update character');
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

      return { ...campaign, id: docRef.id };
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw new Error('Failed to create campaign');
    }
  }

  // Message methods
  async sendMessage(messageData: Partial<GameMessage>): Promise<GameMessage> {
    if (!this.currentUser) throw new Error('User not authenticated');

    try {
      const messagesRef = collection(db, 'messages');
      const message: Omit<GameMessage, 'id'> = {
        campaignId: messageData.campaignId!,
        senderId: messageData.senderId || this.currentUser.id,
        senderName: messageData.senderName || this.currentUser.displayName,
        type: messageData.type || 'player',
        content: messageData.content!,
        timestamp: new Date(),
        isSecret: messageData.isSecret,
        targetUsers: messageData.targetUsers,
        metadata: messageData.metadata
      };

      const docRef = await addDoc(messagesRef, {
        ...message,
        timestamp: serverTimestamp()
      });

      return { ...message, id: docRef.id };
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  async getMessages(campaignId: string, limitCount: number = 50): Promise<GameMessage[]> {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('campaignId', '==', campaignId),
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
          timestamp: data.timestamp?.toDate() || new Date()
        } as GameMessage);
      });
      
      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting messages:', error);
      throw new Error('Failed to get messages');
    }
  }

  // Real-time subscriptions
  subscribeToMessages(campaignId: string, callback: (messages: GameMessage[]) => void): () => void {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('campaignId', '==', campaignId),
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
          timestamp: data.timestamp?.toDate() || new Date()
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