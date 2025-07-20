import React, { useState, useEffect } from 'react';
import { EconomicItem } from '../../types/world';
import { Button } from '../ui/Button';

interface EconomicPanelProps {
  campaignId: string;
  onTrade?: (itemId: string, action: 'buy' | 'sell', quantity: number) => void;
}

export const EconomicPanel: React.FC<EconomicPanelProps> = ({
  campaignId,
  onTrade
}) => {
  const [items, setItems] = useState<EconomicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [tradeQuantity, setTradeQuantity] = useState(1);

  // Mock economic items for demonstration
  const mockItems: EconomicItem[] = [
    {
      id: 'sword',
      name: 'Steel Sword',
      basePrice: 15,
      currentPrice: 18,
      supply: 85,
      demand: 70,
      lastUpdated: new Date()
    },
    {
      id: 'potion',
      name: 'Health Potion',
      basePrice: 5,
      currentPrice: 7,
      supply: 45,
      demand: 90,
      lastUpdated: new Date()
    },
    {
      id: 'scroll',
      name: 'Magic Scroll',
      basePrice: 25,
      currentPrice: 22,
      supply: 95,
      demand: 30,
      lastUpdated: new Date()
    },
    {
      id: 'armor',
      name: 'Leather Armor',
      basePrice: 20,
      currentPrice: 24,
      supply: 60,
      demand: 75,
      lastUpdated: new Date()
    },
    {
      id: 'gem',
      name: 'Precious Gem',
      basePrice: 100,
      currentPrice: 120,
      supply: 20,
      demand: 85,
      lastUpdated: new Date()
    },
    {
      id: 'herb',
      name: 'Rare Herb',
      basePrice: 8,
      currentPrice: 6,
      supply: 80,
      demand: 25,
      lastUpdated: new Date()
    }
  ];

  useEffect(() => {
    // Simulate loading economic data
    setTimeout(() => {
      setItems(mockItems);
      setLoading(false);
    }, 500);
  }, [campaignId]);

  const getPriceChangeColor = (basePrice: number, currentPrice: number) => {
    const change = currentPrice - basePrice;
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getPriceChangeIcon = (basePrice: number, currentPrice: number) => {
    const change = currentPrice - basePrice;
    if (change > 0) return '↗️';
    if (change < 0) return '↘️';
    return '→';
  };

  const getSupplyDemandColor = (supply: number, demand: number) => {
    const ratio = supply / demand;
    if (ratio < 0.5) return 'text-red-400'; // High demand, low supply
    if (ratio < 1) return 'text-yellow-400'; // Moderate demand
    return 'text-green-400'; // High supply, low demand
  };

  const getSupplyDemandText = (supply: number, demand: number) => {
    const ratio = supply / demand;
    if (ratio < 0.5) return 'High Demand';
    if (ratio < 1) return 'Moderate';
    return 'Oversupplied';
  };

  const handleTrade = (itemId: string, action: 'buy' | 'sell') => {
    onTrade?.(itemId, action, tradeQuantity);
    console.log(`${action} ${tradeQuantity} of ${itemId}`);
  };

  const updatePrices = () => {
    // Simulate price fluctuations
    setItems(prevItems => 
      prevItems.map(item => ({
        ...item,
        currentPrice: Math.max(1, item.currentPrice + (Math.random() - 0.5) * 4),
        supply: Math.max(0, Math.min(100, item.supply + (Math.random() - 0.5) * 10)),
        demand: Math.max(0, Math.min(100, item.demand + (Math.random() - 0.5) * 10)),
        lastUpdated: new Date()
      }))
    );
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Market Economy</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={updatePrices}
          className="text-xs"
        >
          Update Prices
        </Button>
      </div>

      {/* Market Items */}
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">{item.name}</h4>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">
                  {item.currentPrice} gp
                </div>
                <div className={`text-xs ${getPriceChangeColor(item.basePrice, item.currentPrice)}`}>
                  {getPriceChangeIcon(item.basePrice, item.currentPrice)} {item.currentPrice - item.basePrice > 0 ? '+' : ''}{item.currentPrice - item.basePrice} gp
                </div>
              </div>
            </div>

            {/* Supply and Demand */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div>
                <span className="text-gray-400">Supply:</span>
                <span className="text-white ml-1">{item.supply}%</span>
              </div>
              <div>
                <span className="text-gray-400">Demand:</span>
                <span className="text-white ml-1">{item.demand}%</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">Status:</span>
                <span className={`ml-1 font-medium ${getSupplyDemandColor(item.supply, item.demand)}`}>
                  {getSupplyDemandText(item.supply, item.demand)}
                </span>
              </div>
            </div>

            {/* Trade Actions */}
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="99"
                value={tradeQuantity}
                onChange={(e) => setTradeQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleTrade(item.id, 'buy')}
                className="text-xs"
                disabled={item.supply < 10}
              >
                Buy ({tradeQuantity * item.currentPrice} gp)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTrade(item.id, 'sell')}
                className="text-xs"
              >
                Sell ({tradeQuantity * Math.floor(item.currentPrice * 0.7)} gp)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
                className="text-xs"
              >
                Details
              </Button>
            </div>

            {/* Expanded Details */}
            {selectedItem === item.id && (
              <div className="mt-3 p-3 bg-gray-600 rounded-lg">
                <h5 className="text-sm font-medium text-white mb-2">Item Details</h5>
                <div className="space-y-2 text-xs text-gray-300">
                  <p><strong>Base Price:</strong> {item.basePrice} gp</p>
                  <p><strong>Price Change:</strong> {item.currentPrice - item.basePrice > 0 ? '+' : ''}{item.currentPrice - item.basePrice} gp ({((item.currentPrice - item.basePrice) / item.basePrice * 100).toFixed(1)}%)</p>
                  <p><strong>Market Trend:</strong> {
                    item.currentPrice > item.basePrice ? 'Rising' :
                    item.currentPrice < item.basePrice ? 'Falling' : 'Stable'
                  }</p>
                  <p><strong>Availability:</strong> {
                    item.supply >= 80 ? 'Abundant' :
                    item.supply >= 50 ? 'Common' :
                    item.supply >= 20 ? 'Scarce' : 'Rare'
                  }</p>
                  <p><strong>Last Updated:</strong> {item.lastUpdated.toLocaleTimeString()}</p>
                </div>
                
                <div className="mt-3 flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => console.log(`Investigate ${item.name}`)}
                    className="text-xs"
                  >
                    Investigate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => console.log(`Track ${item.name} prices`)}
                    className="text-xs"
                  >
                    Track Prices
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Market Summary */}
      <div className="bg-gray-700 rounded-lg p-3">
        <h4 className="text-sm font-medium text-white mb-2">Market Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-400">Total Items:</span>
            <span className="text-white ml-1">{items.length}</span>
          </div>
          <div>
            <span className="text-gray-400">Average Price:</span>
            <span className="text-white ml-1">
              {Math.round(items.reduce((sum, item) => sum + item.currentPrice, 0) / items.length)} gp
            </span>
          </div>
          <div>
            <span className="text-gray-400">Most Expensive:</span>
            <span className="text-white ml-1">
              {items.reduce((max, item) => item.currentPrice > max.currentPrice ? item : max).name}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Market Status:</span>
            <span className="text-white ml-1">
              {items.filter(item => item.currentPrice > item.basePrice).length > items.length / 2 ? 'Bull Market' : 'Bear Market'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 