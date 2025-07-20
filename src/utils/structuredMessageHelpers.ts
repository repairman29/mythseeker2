import { GameMessage, StructuredContent, GameItem, InteractiveAction, InteractiveChoice } from '../types/game';

export const createItemDiscoveryMessage = (
  campaignId: string,
  items: GameItem[],
  description: string = "You discover some items!"
): Partial<GameMessage> => {
  const structuredContent: StructuredContent = {
    type: 'item_discovery',
    title: '🎁 Item Discovery',
    description,
    items,
    actions: items.map(item => ({
      id: `add_${item.id}`,
      label: `Add ${item.name} to Inventory`,
      type: 'add_to_inventory',
      color: 'success',
      icon: '📦'
    } as InteractiveAction)),
    rewards: {
      items
    }
  };

  return {
    campaignId,
    senderId: 'dm-ai',
    senderName: 'Dungeon Master',
    content: description,
    timestamp: new Date(),
    type: 'structured',
    structuredContent
  };
};

export const createChoicePromptMessage = (
  campaignId: string,
  title: string,
  description: string,
  choices: InteractiveChoice[]
): Partial<GameMessage> => {
  const structuredContent: StructuredContent = {
    type: 'choice_prompt',
    title,
    description,
    choices
  };

  return {
    campaignId,
    senderId: 'dm-ai',
    senderName: 'Dungeon Master',
    content: description,
    timestamp: new Date(),
    type: 'structured',
    structuredContent
  };
};

export const createLootDropMessage = (
  campaignId: string,
  items: GameItem[],
  gold: number = 0,
  experience: number = 0
): Partial<GameMessage> => {
  const structuredContent: StructuredContent = {
    type: 'loot_drop',
    title: '💎 Loot Found!',
    description: `You found ${items.length} item(s) and ${gold} gold!`,
    items,
    actions: [
      {
        id: 'take_all',
        label: 'Take All Loot',
        type: 'add_to_inventory',
        color: 'success',
        icon: '📦'
      },
      {
        id: 'examine_items',
        label: 'Examine Items',
        type: 'examine',
        color: 'info',
        icon: '👁️'
      }
    ],
    rewards: {
      items,
      gold,
      experience
    }
  };

  return {
    campaignId,
    senderId: 'dm-ai',
    senderName: 'Dungeon Master',
    content: `You found ${items.length} item(s) and ${gold} gold!`,
    timestamp: new Date(),
    type: 'structured',
    structuredContent
  };
};

export const createNPCInteractionMessage = (
  campaignId: string,
  npcName: string,
  dialogue: string,
  choices: InteractiveChoice[]
): Partial<GameMessage> => {
  const structuredContent: StructuredContent = {
    type: 'npc_interaction',
    title: `🗣️ ${npcName}`,
    description: dialogue,
    choices
  };

  return {
    campaignId,
    senderId: 'dm-ai',
    senderName: 'Dungeon Master',
    content: `${npcName}: "${dialogue}"`,
    timestamp: new Date(),
    type: 'structured',
    structuredContent
  };
};

export const createQuestUpdateMessage = (
  campaignId: string,
  questTitle: string,
  update: string,
  rewards?: any
): Partial<GameMessage> => {
  const structuredContent: StructuredContent = {
    type: 'quest_update',
    title: `📜 Quest Update: ${questTitle}`,
    description: update,
    rewards
  };

  return {
    campaignId,
    senderId: 'dm-ai',
    senderName: 'Dungeon Master',
    content: `Quest Update: ${questTitle} - ${update}`,
    timestamp: new Date(),
    type: 'structured',
    structuredContent
  };
};

// Sample items for testing
export const sampleItems: GameItem[] = [
  {
    id: 'sword_001',
    name: 'Iron Longsword',
    description: 'A well-crafted iron longsword with a leather-wrapped hilt.',
    type: 'weapon',
    rarity: 'common',
    value: 15,
    weight: 3,
    properties: [
      { name: 'Damage', value: '1d8 slashing' },
      { name: 'Range', value: 'Melee' },
      { name: 'Properties', value: 'Versatile (1d10)' }
    ]
  },
  {
    id: 'potion_001',
    name: 'Healing Potion',
    description: 'A red liquid that glows with magical energy.',
    type: 'consumable',
    rarity: 'common',
    value: 50,
    weight: 0.5,
    properties: [
      { name: 'Effect', value: 'Heals 2d4+2 hit points' },
      { name: 'Duration', value: 'Instant' }
    ],
    quantity: 3,
    stackable: true
  },
  {
    id: 'ring_001',
    name: 'Ring of Protection',
    description: 'A silver ring that provides magical protection.',
    type: 'magical',
    rarity: 'rare',
    value: 3500,
    weight: 0,
    enchantments: [
      {
        name: 'Protection',
        effect: '+1 to AC and saving throws',
        level: 1
      }
    ]
  }
];

// Sample choices for testing
export const sampleChoices: InteractiveChoice[] = [
  {
    id: 'choice_1',
    label: 'Accept the quest',
    description: 'Take on the dangerous mission',
    color: 'success',
    consequences: [
      {
        type: 'quest',
        target: 'main_quest',
        value: 'active',
        description: 'Main quest activated'
      }
    ]
  },
  {
    id: 'choice_2',
    label: 'Decline politely',
    description: 'Refuse the quest but maintain good relations',
    color: 'secondary',
    consequences: [
      {
        type: 'reputation',
        target: 'town_guard',
        value: 1,
        description: 'Gained respect for honesty'
      }
    ]
  },
  {
    id: 'choice_3',
    label: 'Demand more gold',
    description: 'Negotiate for better payment',
    color: 'warning',
    consequences: [
      {
        type: 'reputation',
        target: 'town_guard',
        value: -1,
        description: 'Lost some respect for greed'
      },
      {
        type: 'gold',
        target: 'quest_reward',
        value: 50,
        description: 'Additional 50 gold if quest accepted'
      }
    ]
  }
]; 