import React from 'react';
import { MapPin, Clock, Cloud, Target, Users } from 'lucide-react';
import { Campaign } from '../../types';

interface WorldPanelProps {
  campaign: Campaign;
  compact?: boolean;
}

export const WorldPanel: React.FC<WorldPanelProps> = ({ campaign, compact = false }) => {
  const { worldState } = campaign;

  const getWeatherIcon = (weather: string) => {
    if (weather.toLowerCase().includes('rain')) return '🌧️';
    if (weather.toLowerCase().includes('snow')) return '❄️';
    if (weather.toLowerCase().includes('storm')) return '⛈️';
    if (weather.toLowerCase().includes('cloudy')) return '☁️';
    if (weather.toLowerCase().includes('clear')) return '☀️';
    return '🌤️';
  };

  const getTimeIcon = (timeOfDay: string) => {
    switch (timeOfDay.toLowerCase()) {
      case 'dawn': return '🌅';
      case 'morning': return '🌞';
      case 'noon': return '☀️';
      case 'afternoon': return '🌇';
      case 'evening': return '🌆';
      case 'dusk': return '🌇';
      case 'night': return '🌙';
      case 'midnight': return '🌚';
      default: return '🕐';
    }
  };

  const getSeasonIcon = (season: string) => {
    switch (season.toLowerCase()) {
      case 'spring': return '🌸';
      case 'summer': return '☀️';
      case 'autumn':
      case 'fall': return '🍂';
      case 'winter': return '❄️';
      default: return '🌿';
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            {worldState.currentLocation}
          </h3>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            {getTimeIcon(worldState.timeOfDay)} {worldState.timeOfDay}
          </span>
          <span className="flex items-center gap-1">
            {getWeatherIcon(worldState.weather)} {worldState.weather}
          </span>
        </div>

        {worldState.activeQuests.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Active Quests: {worldState.activeQuests.length}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          World State
        </h3>
      </div>

      {/* Location */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Current Location</h4>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="font-medium text-blue-900">{worldState.currentLocation}</p>
        </div>
      </div>

      {/* Time & Weather */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
            <Clock className="h-3 w-3" />
            Time
          </div>
          <div className="text-lg">
            {getTimeIcon(worldState.timeOfDay)}
          </div>
          <div className="text-sm font-medium text-gray-900 capitalize">
            {worldState.timeOfDay}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
            <Cloud className="h-3 w-3" />
            Weather
          </div>
          <div className="text-lg">
            {getWeatherIcon(worldState.weather)}
          </div>
          <div className="text-sm font-medium text-gray-900">
            {worldState.weather}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
            Season
          </div>
          <div className="text-lg">
            {getSeasonIcon(worldState.season)}
          </div>
          <div className="text-sm font-medium text-gray-900">
            {worldState.season}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Date</h4>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm text-gray-700">
            Day {worldState.calendar.day} of {worldState.calendar.month}, {worldState.calendar.year}
          </p>
        </div>
      </div>

      {/* Active Quests */}
      {worldState.activeQuests.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-green-600" />
            Active Quests ({worldState.activeQuests.length})
          </h4>
          <div className="space-y-2">
            {worldState.activeQuests.slice(0, 3).map((quest, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                                 <h5 className="font-medium text-green-900">{quest.title}</h5>
                 <p className="text-sm text-green-700 mt-1">{quest.description}</p>
                 {quest.objectives.length > 0 && (
                   <div className="mt-2">
                     <div className="flex justify-between text-xs text-green-600 mb-1">
                       <span>Progress</span>
                       <span>{Math.round((quest.objectives.filter(obj => obj.completed).length / quest.objectives.length) * 100)}%</span>
                     </div>
                     <div className="w-full bg-green-200 rounded-full h-1">
                       <div 
                         className="bg-green-500 h-1 rounded-full transition-all duration-300"
                         style={{ width: `${(quest.objectives.filter(obj => obj.completed).length / quest.objectives.length) * 100}%` }}
                       />
                     </div>
                   </div>
                 )}
              </div>
            ))}
            {worldState.activeQuests.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{worldState.activeQuests.length - 3} more quests
              </p>
            )}
          </div>
        </div>
      )}

      {/* Notable NPCs */}
      {worldState.npcs.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            Notable NPCs
          </h4>
          <div className="space-y-2">
            {worldState.npcs.slice(0, 3).map((npc, index) => (
              <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-purple-900">{npc.name}</h5>
                  <span className="text-xs text-purple-600 capitalize">{npc.race}</span>
                </div>
                                 <p className="text-sm text-purple-700 mt-1">{npc.description}</p>
                 {Object.keys(npc.relationships).length > 0 && (
                   <div className="mt-1">
                     <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                       {Object.keys(npc.relationships)[0]}
                     </span>
                   </div>
                 )}
              </div>
            ))}
            {worldState.npcs.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{worldState.npcs.length - 3} more NPCs
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 