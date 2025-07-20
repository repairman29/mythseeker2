import React, { useState, useEffect } from 'react';
import { Faction } from '../../types/world';
import { Button } from '../ui/Button';

interface FactionPanelProps {
  campaignId: string;
  onFactionInteraction?: (factionId: string, action: string) => void;
}

export const FactionPanel: React.FC<FactionPanelProps> = ({
  campaignId,
  onFactionInteraction
}) => {
  const [factions, setFactions] = useState<Faction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);

  // Mock factions for demonstration
  const mockFactions: Faction[] = [
    {
      id: 'merchants-guild',
      name: "Merchants' Guild",
      relationships: {
        'thieves-guild': -20,
        'city-guard': 30,
        'nobles': 15
      },
      influence: 75,
      territory: ['Market District', 'Harbor'],
      lastUpdated: new Date()
    },
    {
      id: 'thieves-guild',
      name: "Thieves' Guild",
      relationships: {
        'merchants-guild': -20,
        'city-guard': -40,
        'nobles': -10
      },
      influence: 45,
      territory: ['Undercity', 'Slums'],
      lastUpdated: new Date()
    },
    {
      id: 'city-guard',
      name: 'City Guard',
      relationships: {
        'merchants-guild': 30,
        'thieves-guild': -40,
        'nobles': 25
      },
      influence: 80,
      territory: ['All Districts'],
      lastUpdated: new Date()
    },
    {
      id: 'nobles',
      name: 'Noble Houses',
      relationships: {
        'merchants-guild': 15,
        'thieves-guild': -10,
        'city-guard': 25
      },
      influence: 90,
      territory: ['Noble District', 'Castle'],
      lastUpdated: new Date()
    }
  ];

  useEffect(() => {
    // Simulate loading factions
    setTimeout(() => {
      setFactions(mockFactions);
      setLoading(false);
    }, 500);
  }, [campaignId]);

  const getRelationshipColor = (value: number) => {
    if (value >= 50) return 'text-green-400';
    if (value >= 20) return 'text-blue-400';
    if (value >= -20) return 'text-yellow-400';
    if (value >= -50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRelationshipText = (value: number) => {
    if (value >= 50) return 'Allied';
    if (value >= 20) return 'Friendly';
    if (value >= -20) return 'Neutral';
    if (value >= -50) return 'Hostile';
    return 'Enemy';
  };

  const getInfluenceColor = (influence: number) => {
    if (influence >= 80) return 'text-purple-400';
    if (influence >= 60) return 'text-blue-400';
    if (influence >= 40) return 'text-green-400';
    if (influence >= 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleFactionAction = (factionId: string, action: string) => {
    onFactionInteraction?.(factionId, action);
    console.log(`Faction action: ${action} on ${factionId}`);
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

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Factions</h3>

      {/* Faction List */}
      <div className="space-y-3">
        {factions.map(faction => (
          <div key={faction.id} className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">{faction.name}</h4>
              <span className={`text-sm font-semibold ${getInfluenceColor(faction.influence)}`}>
                {faction.influence}% Influence
              </span>
            </div>

            {/* Territory */}
            <div className="mb-2">
              <p className="text-xs text-gray-400 mb-1">Territory:</p>
              <div className="flex flex-wrap gap-1">
                {faction.territory.map(territory => (
                  <span key={territory} className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                    {territory}
                  </span>
                ))}
              </div>
            </div>

            {/* Relationships */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1">Relationships:</p>
              <div className="space-y-1">
                {Object.entries(faction.relationships).map(([targetId, value]) => {
                  const targetFaction = factions.find(f => f.id === targetId);
                  return (
                    <div key={targetId} className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">{targetFaction?.name || targetId}</span>
                      <span className={`font-medium ${getRelationshipColor(value)}`}>
                        {getRelationshipText(value)} ({value})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFactionAction(faction.id, 'negotiate')}
                className="text-xs"
              >
                Negotiate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFactionAction(faction.id, 'quest')}
                className="text-xs"
              >
                Request Quest
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedFaction(selectedFaction === faction.id ? null : faction.id)}
                className="text-xs"
              >
                Details
              </Button>
            </div>

            {/* Expanded Details */}
            {selectedFaction === faction.id && (
              <div className="mt-3 p-3 bg-gray-600 rounded-lg">
                <h5 className="text-sm font-medium text-white mb-2">Faction Details</h5>
                <div className="space-y-2 text-xs text-gray-300">
                  <p><strong>Leader:</strong> {faction.name === "Merchants' Guild" ? 'Guildmaster Thorne' : 
                    faction.name === "Thieves' Guild" ? 'Shadow King' :
                    faction.name === 'City Guard' ? 'Captain Valeria' : 'Lord Aldric'}</p>
                  <p><strong>Headquarters:</strong> {faction.territory[0]}</p>
                  <p><strong>Members:</strong> {Math.floor(faction.influence / 10) * 100}+</p>
                  <p><strong>Specialization:</strong> {
                    faction.name === "Merchants' Guild" ? 'Trade & Commerce' :
                    faction.name === "Thieves' Guild" ? 'Information & Theft' :
                    faction.name === 'City Guard' ? 'Law & Order' : 'Politics & Influence'
                  }</p>
                </div>
                
                <div className="mt-3 flex space-x-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleFactionAction(faction.id, 'join')}
                    className="text-xs"
                  >
                    Join Faction
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFactionAction(faction.id, 'spy')}
                    className="text-xs"
                  >
                    Gather Intel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Faction Summary */}
      <div className="bg-gray-700 rounded-lg p-3">
        <h4 className="text-sm font-medium text-white mb-2">Faction Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-400">Most Influential:</span>
            <span className="text-white ml-1">
              {factions.reduce((max, f) => f.influence > max.influence ? f : max).name}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Active Factions:</span>
            <span className="text-white ml-1">{factions.length}</span>
          </div>
          <div>
            <span className="text-gray-400">Average Influence:</span>
            <span className="text-white ml-1">
              {Math.round(factions.reduce((sum, f) => sum + f.influence, 0) / factions.length)}%
            </span>
          </div>
          <div>
            <span className="text-gray-400">Last Updated:</span>
            <span className="text-white ml-1">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 