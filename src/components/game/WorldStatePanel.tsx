import React, { useState, useEffect } from 'react';
import { WorldState, WorldEvent, NPC, Quest } from '../../types/world';
import WorldStateService from '../../services/worldStateService';
import { Button } from '../ui/Button';

interface WorldStatePanelProps {
  campaignId: string;
  onLocationChange?: (location: string) => void;
  onTimeAdvance?: (hours: number) => void;
}

export const WorldStatePanel: React.FC<WorldStatePanelProps> = ({
  campaignId,
  onLocationChange,
  onTimeAdvance
}) => {
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEventDetails, setShowEventDetails] = useState<string | null>(null);
  const [worldStateService] = useState(() => WorldStateService.getInstance());

  useEffect(() => {
    const loadWorldState = async () => {
      try {
        setLoading(true);
        const state = await worldStateService.loadWorldState(campaignId);
        setWorldState(state);
      } catch (error) {
        console.error('Failed to load world state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorldState();

    // Subscribe to real-time updates
    const unsubscribe = worldStateService.subscribeToWorldState(campaignId, (state) => {
      setWorldState(state);
    });

    return unsubscribe;
  }, [campaignId, worldStateService]);

  const handleAdvanceTime = async (hours: number) => {
    try {
      const updatedState = await worldStateService.advanceTime(campaignId, hours);
      setWorldState(updatedState);
      onTimeAdvance?.(hours);
    } catch (error) {
      console.error('Failed to advance time:', error);
    }
  };

  const handleChangeLocation = async (newLocation: string) => {
    try {
      const updatedState = await worldStateService.changeLocation(campaignId, newLocation);
      setWorldState(updatedState);
      onLocationChange?.(newLocation);
    } catch (error) {
      console.error('Failed to change location:', error);
    }
  };

  const handleUpdateWeather = async () => {
    try {
      const updatedState = await worldStateService.updateWeather(campaignId);
      setWorldState(updatedState);
    } catch (error) {
      console.error('Failed to update weather:', error);
    }
  };

  const getTimeIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌆';
      case 'night': return '🌙';
      default: return '🕐';
    }
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'clear': return '☀️';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      case 'stormy': return '⛈️';
      case 'foggy': return '🌫️';
      case 'snowy': return '❄️';
      default: return '🌤️';
    }
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'Spring': return '🌸';
      case 'Summer': return '🌻';
      case 'Autumn': return '🍂';
      case 'Winter': return '❄️';
      default: return '🌱';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!worldState) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-400">No world state available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">World State</h3>

      {/* Time and Calendar */}
      <div className="bg-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-300">Time & Calendar</h4>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAdvanceTime(1)}
              className="text-xs"
            >
              +1h
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAdvanceTime(6)}
              className="text-xs"
            >
              +6h
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAdvanceTime(24)}
              className="text-xs"
            >
              +1d
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <span>{getTimeIcon(worldState.timeOfDay)}</span>
            <span className="text-white capitalize">{worldState.timeOfDay}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>{getSeasonIcon(worldState.calendar.month)}</span>
            <span className="text-white">
              Day {worldState.calendar.day}, {worldState.calendar.month}
            </span>
          </div>
        </div>
      </div>

      {/* Weather */}
      <div className="bg-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-300">Weather</h4>
          <Button
            size="sm"
            variant="outline"
            onClick={handleUpdateWeather}
            className="text-xs"
          >
            Change
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getWeatherIcon(worldState.weather)}</span>
          <span className="text-white capitalize">{worldState.weather}</span>
        </div>
      </div>

      {/* Location */}
      <div className="bg-gray-700 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Current Location</h4>
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">📍 {worldState.currentLocation}</span>
          <div className="flex space-x-1">
            {['Tavern', 'Market', 'Castle', 'Forest', 'Dungeon'].map(location => (
              <Button
                key={location}
                size="sm"
                variant={worldState.currentLocation === location ? "primary" : "outline"}
                onClick={() => handleChangeLocation(location)}
                className="text-xs"
              >
                {location}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Quests */}
      {worldState.activeQuests.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Active Quests</h4>
          <div className="space-y-2">
            {worldState.activeQuests.map(quest => (
              <div key={quest.id} className="bg-gray-600 rounded p-2">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">📜 {quest.title}</span>
                  <span className="text-gray-400 text-xs">{quest.difficulty}</span>
                </div>
                <p className="text-gray-300 text-xs mt-1">{quest.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NPCs */}
      {worldState.npcs.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Present NPCs</h4>
          <div className="space-y-2">
            {worldState.npcs.map(npc => (
              <div key={npc.id} className="bg-gray-600 rounded p-2">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">👤 {npc.name}</span>
                  <span className="text-gray-400 text-xs">{npc.role}</span>
                </div>
                <p className="text-gray-300 text-xs mt-1">{npc.disposition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* World Events */}
      {worldState.events.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-300 mb-2">World Events</h4>
          <div className="space-y-2">
            {worldState.events.slice(0, 3).map(event => (
              <div key={event.id} className="bg-gray-600 rounded p-2">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">⚡ {event.title}</span>
                  <span className="text-gray-400 text-xs">{event.type}</span>
                </div>
                <p className="text-gray-300 text-xs mt-1">{event.description}</p>
                {showEventDetails === event.id && (
                  <div className="mt-2 p-2 bg-gray-500 rounded text-xs text-gray-200">
                    <p><strong>Impact:</strong> {event.impact || 'Unknown'}</p>
                    <p><strong>Duration:</strong> {event.duration || 'Unknown'}</p>
                  </div>
                )}
                <button
                  onClick={() => setShowEventDetails(showEventDetails === event.id ? null : event.id)}
                  className="text-blue-400 text-xs mt-1 hover:text-blue-300"
                >
                  {showEventDetails === event.id ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
            ))}
            {worldState.events.length > 3 && (
              <p className="text-gray-400 text-xs text-center">
                +{worldState.events.length - 3} more events
              </p>
            )}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-xs text-gray-400 text-center">
        Last updated: {worldState.lastUpdated.toLocaleString()}
      </div>
    </div>
  );
}; 