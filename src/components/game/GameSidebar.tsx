import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Settings, Sun, Cloud, CloudRain, CloudSnow, Moon, Wind } from 'lucide-react';
import { WorldStatePanel, FactionPanel, EconomicPanel, QuestPanel, NPCPanel } from './index';
import { DiceRoller } from '../dice/DiceRoller';
import { Campaign } from '../../types';

interface GameSidebarProps {
  campaignId: string;
  campaign?: Campaign | null;
  onLocationChange?: (location: string) => void;
  onTimeAdvance?: (hours: number) => void;
  onFactionInteraction?: (factionId: string, action: string) => void;
  onTrade?: (itemId: string, action: 'buy' | 'sell', quantity: number) => void;
}

type TabType = 'world' | 'factions' | 'economy' | 'quests' | 'npcs' | 'dice';

export const GameSidebar: React.FC<GameSidebarProps> = ({
  campaignId,
  campaign,
  onLocationChange,
  onTimeAdvance,
  onFactionInteraction,
  onTrade
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('world');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Campaign-specific weather and atmosphere
  const getCampaignAtmosphere = () => {
    if (!campaign) return { theme: 'default', weather: 'clear', timeOfDay: 'day' };
    
    const campaignName = campaign.name.toLowerCase();
    const theme = campaign.theme?.toLowerCase() || 'default';
    
    // Curse of Strahd - Always dark and gloomy
    if (campaignName.includes('strahd') || campaignName.includes('barovia')) {
      return {
        theme: 'gothic',
        weather: 'overcast',
        timeOfDay: 'dusk',
        atmosphere: 'dark',
        description: 'The mists of Barovia shroud the land in eternal gloom...'
      };
    }
    
    // Lost Mines of Phandelver - Varied but generally clear
    if (campaignName.includes('phandelver') || campaignName.includes('lost mines')) {
      return {
        theme: 'adventure',
        weather: 'clear',
        timeOfDay: 'day',
        atmosphere: 'bright',
        description: 'The crisp mountain air carries the promise of adventure...'
      };
    }
    
    // Storm King's Thunder - Stormy and dramatic
    if (campaignName.includes('storm') || campaignName.includes('thunder')) {
      return {
        theme: 'epic',
        weather: 'stormy',
        timeOfDay: 'afternoon',
        atmosphere: 'dramatic',
        description: 'Thunder echoes across the land as giants walk the earth...'
      };
    }
    
    // Default campaign atmosphere
    return {
      theme: 'default',
      weather: campaign.worldState?.weather || 'clear',
      timeOfDay: campaign.worldState?.timeOfDay || 'day',
      atmosphere: 'neutral',
      description: 'Adventure awaits in this mystical realm...'
    };
  };

  const atmosphere = getCampaignAtmosphere();

  // Weather icons based on campaign context
  const getWeatherIcon = () => {
    if (atmosphere.theme === 'gothic') return <Cloud className="h-5 w-5 text-gray-400" />;
    if (atmosphere.theme === 'epic') return <Wind className="h-5 w-5 text-blue-400" />;
    
    switch (atmosphere.weather) {
      case 'clear': return <Sun className="h-5 w-5 text-yellow-400" />;
      case 'cloudy': return <Cloud className="h-5 w-5 text-gray-400" />;
      case 'rainy': return <CloudRain className="h-5 w-5 text-blue-400" />;
      case 'stormy': return <Wind className="h-5 w-5 text-blue-400" />;
      case 'snowy': return <CloudSnow className="h-5 w-5 text-blue-200" />;
      default: return <Sun className="h-5 w-5 text-yellow-400" />;
    }
  };

  // Time of day icon
  const getTimeIcon = () => {
    if (atmosphere.theme === 'gothic') return <Moon className="h-4 w-4 text-gray-400" />;
    
    switch (atmosphere.timeOfDay) {
      case 'dawn': return <Sun className="h-4 w-4 text-orange-400" />;
      case 'morning': return <Sun className="h-4 w-4 text-yellow-400" />;
      case 'noon': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'afternoon': return <Sun className="h-4 w-4 text-orange-400" />;
      case 'evening': return <Sun className="h-4 w-4 text-red-400" />;
      case 'dusk': return <Moon className="h-4 w-4 text-purple-400" />;
      case 'night': return <Moon className="h-4 w-4 text-blue-400" />;
      default: return <Sun className="h-4 w-4 text-yellow-400" />;
    }
  };

  // Resize functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !sidebarRef.current) return;
    
    const newWidth = window.innerWidth - e.clientX;
    const minWidth = 280;
    const maxWidth = 600;
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const tabs = [
    { id: 'world' as TabType, label: 'World', icon: '🌍', description: 'World state & weather' },
    { id: 'factions' as TabType, label: 'Factions', icon: '⚔️', description: 'Political landscape' },
    { id: 'economy' as TabType, label: 'Economy', icon: '💰', description: 'Trade & commerce' },
    { id: 'quests' as TabType, label: 'Quests', icon: '📋', description: 'Active missions' },
    { id: 'npcs' as TabType, label: 'NPCs', icon: '👥', description: 'Characters & relationships' },
    { id: 'dice' as TabType, label: 'Dice', icon: '🎲', description: 'Dice rolling tools' }
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
            worldState={campaign?.worldState || {}}
            onQuestUpdate={(quest) => {
              console.log('Quest updated:', quest);
            }}
          />
        );
      case 'npcs':
        return (
          <NPCPanel
            campaignId={campaignId}
            worldState={campaign?.worldState || {}}
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

  const getSidebarClasses = () => {
    const baseClasses = "bg-gray-800 border-l border-gray-700 flex flex-col transition-all duration-300 ease-in-out";
    const themeClasses = {
      gothic: "bg-gray-900 border-gray-600",
      epic: "bg-gray-800 border-gray-600",
      adventure: "bg-gray-800 border-gray-700",
      default: "bg-gray-800 border-gray-700"
    };
    
    return `${baseClasses} ${themeClasses[atmosphere.theme as keyof typeof themeClasses] || themeClasses.default}`;
  };

  if (isCollapsed) {
    return (
      <div className="bg-gray-800 border-l border-gray-700 flex flex-col w-12">
        <div className="flex flex-col items-center py-4 space-y-2">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsCollapsed(false);
              }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title={`${tab.label} - ${tab.description}`}
            >
              <span className="text-lg">{tab.icon}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={sidebarRef}
      className={`${getSidebarClasses()} relative`}
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* Campaign Atmosphere Header */}
      <div className={`p-4 border-b border-gray-700 ${atmosphere.theme === 'gothic' ? 'bg-gray-900' : 'bg-gray-800'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-200">
            {campaign?.name || 'Campaign'}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 text-gray-400 hover:text-white transition-colors btn-hover"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 text-gray-400 hover:text-white transition-colors btn-hover"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Weather & Time Display */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getWeatherIcon()}
            <span className="text-sm text-gray-300 capitalize">
              {atmosphere.weather}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {getTimeIcon()}
            <span className="text-sm text-gray-300 capitalize">
              {atmosphere.timeOfDay}
            </span>
          </div>
        </div>
        
        {/* Atmosphere Description */}
        <p className="text-xs text-gray-400 italic">
          {atmosphere.description}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700 bg-gray-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-2 text-xs font-medium transition-all duration-200 btn-hover ${
              activeTab === tab.id
                ? 'bg-gray-700 text-white border-b-2 border-blue-500 shadow-lg'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
            }`}
            title={tab.description}
          >
            <div className="flex flex-col items-center">
              <span className="text-lg mb-1">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto messages-scrollbar">
        <div className="p-4">
          {renderTabContent()}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        ref={resizeRef}
        className="resize-handle"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}; 