import React, { useState } from 'react';
import { WorldStatePanel, FactionPanel, EconomicPanel, QuestPanel, NPCPanel } from './index';
import { DiceRoller } from '../dice/DiceRoller';

interface GameSidebarProps {
  campaignId: string;
  onLocationChange?: (location: string) => void;
  onTimeAdvance?: (hours: number) => void;
  onFactionInteraction?: (factionId: string, action: string) => void;
  onTrade?: (itemId: string, action: 'buy' | 'sell', quantity: number) => void;
}

type TabType = 'world' | 'factions' | 'economy' | 'quests' | 'npcs' | 'dice';

export const GameSidebar: React.FC<GameSidebarProps> = ({
  campaignId,
  onLocationChange,
  onTimeAdvance,
  onFactionInteraction,
  onTrade
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('world');

  const tabs = [
    { id: 'world' as TabType, label: '🌍 World', icon: '🌍' },
    { id: 'factions' as TabType, label: '⚔️ Factions', icon: '⚔️' },
    { id: 'economy' as TabType, label: '💰 Economy', icon: '💰' },
    { id: 'quests' as TabType, label: '📋 Quests', icon: '📋' },
    { id: 'npcs' as TabType, label: '👥 NPCs', icon: '👥' },
    { id: 'dice' as TabType, label: '🎲 Dice', icon: '🎲' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'world':
        return (
          <WorldStatePanel
            campaignId={campaignId}
            onLocationChange={onLocationChange}
            onTimeAdvance={onTimeAdvance}
          />
        );
      case 'factions':
        return (
          <FactionPanel
            campaignId={campaignId}
            onFactionInteraction={onFactionInteraction}
          />
        );
      case 'economy':
        return (
          <EconomicPanel
            campaignId={campaignId}
            onTrade={onTrade}
          />
        );
      case 'quests':
        return (
          <QuestPanel
            campaignId={campaignId}
            worldState={{}}
            onQuestUpdate={(quest) => {
              console.log('Quest updated:', quest);
            }}
          />
        );
      case 'npcs':
        return (
          <NPCPanel
            campaignId={campaignId}
            worldState={{}}
            onNPCUpdate={(npc) => {
              console.log('NPC updated:', npc);
            }}
          />
        );
      case 'dice':
        return <DiceRoller />;
      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="flex flex-col items-center">
              <span className="text-lg mb-1">{tab.icon}</span>
              <span>{tab.label.split(' ')[1]}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}; 