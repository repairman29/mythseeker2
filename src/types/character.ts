export interface Character {
  id: string;
  userId: string;
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  alignment: string;
  abilities: CharacterAbilities;
  hitPoints: HitPoints;
  armorClass: number;
  proficiencyBonus: number;
  speed: number;
  experience: number;
  skills: Record<string, SkillProficiency>;
  savingThrows: Record<string, boolean>;
  languages: string[];
  equipment: CharacterEquipment;
  personality: CharacterPersonality;
  createdAt: Date;
  updatedAt: Date;
  campaignHistory: string[];
  achievements: string[];
}

export interface CharacterAbilities {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface HitPoints {
  current: number;
  maximum: number;
  temporary: number;
}

export interface SkillProficiency {
  proficient: boolean;
  expertise: boolean;
}

export interface CharacterEquipment {
  weapons: string[];
  armor: string[];
  items: string[];
  money: CharacterMoney;
}

export interface CharacterMoney {
  gold: number;
  silver: number;
  copper: number;
}

export interface CharacterPersonality {
  traits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
} 