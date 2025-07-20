import React from 'react';
import { 
  StructuredContent, 
  GameItem, 
  InteractiveAction, 
  InteractiveChoice,
  RewardMetadata 
} from '../../types/game';
import { 
  Plus, 
  Minus, 
  Eye, 
  Sword, 
  Shield, 
  Heart, 
  Zap, 
  Star, 
  Gem, 
  Coins,
  Package,
  BookOpen,
  Wand2,
  Target,
  Move,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface StructuredMessageProps {
  content: StructuredContent;
  onActionClick: (action: InteractiveAction) => void;
  onChoiceClick: (choice: InteractiveChoice) => void;
  currentUser: { id: string; displayName: string } | null;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'text-gray-300 border-gray-500';
    case 'uncommon': return 'text-green-300 border-green-500';
    case 'rare': return 'text-blue-300 border-blue-500';
    case 'epic': return 'text-purple-300 border-purple-500';
    case 'legendary': return 'text-yellow-300 border-yellow-500';
    default: return 'text-gray-300 border-gray-500';
  }
};

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case 'common': return <Package className="h-4 w-4" />;
    case 'uncommon': return <CheckCircle className="h-4 w-4" />;
    case 'rare': return <Star className="h-4 w-4" />;
    case 'epic': return <Gem className="h-4 w-4" />;
    case 'legendary': return <Zap className="h-4 w-4" />;
    default: return <Package className="h-4 w-4" />;
  }
};

const getActionIcon = (type: string) => {
  switch (type) {
    case 'add_to_inventory': return <Plus className="h-4 w-4" />;
    case 'equip': return <Shield className="h-4 w-4" />;
    case 'use': return <Heart className="h-4 w-4" />;
    case 'examine': return <Eye className="h-4 w-4" />;
    case 'drop': return <Minus className="h-4 w-4" />;
    case 'give': return <Users className="h-4 w-4" />;
    case 'sell': return <Coins className="h-4 w-4" />;
    case 'craft': return <Package className="h-4 w-4" />;
    case 'learn': return <BookOpen className="h-4 w-4" />;
    case 'cast': return <Wand2 className="h-4 w-4" />;
    case 'attack': return <Sword className="h-4 w-4" />;
    case 'defend': return <Shield className="h-4 w-4" />;
    case 'move': return <Move className="h-4 w-4" />;
    case 'interact': return <Target className="h-4 w-4" />;
    default: return <Info className="h-4 w-4" />;
  }
};

const getActionColor = (color?: string) => {
  switch (color) {
    case 'primary': return 'bg-blue-600 hover:bg-blue-700 text-white';
    case 'secondary': return 'bg-gray-600 hover:bg-gray-700 text-white';
    case 'success': return 'bg-green-600 hover:bg-green-700 text-white';
    case 'danger': return 'bg-red-600 hover:bg-red-700 text-white';
    case 'warning': return 'bg-yellow-600 hover:bg-yellow-700 text-white';
    case 'info': return 'bg-blue-600 hover:bg-blue-700 text-white';
    default: return 'bg-blue-600 hover:bg-blue-700 text-white';
  }
};

export const StructuredMessage: React.FC<StructuredMessageProps> = ({
  content,
  onActionClick,
  onChoiceClick,
  currentUser
}) => {
  const renderItem = (item: GameItem) => (
    <div key={item.id} className={`border rounded-lg p-3 mb-3 ${getRarityColor(item.rarity)} bg-gray-800/50`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {getRarityIcon(item.rarity)}
          <div>
            <h4 className="font-semibold">{item.name}</h4>
            <p className="text-sm opacity-80">{item.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <Coins className="h-3 w-3" />
                {item.value} gp
              </span>
              <span>Type: {item.type}</span>
              {item.quantity && <span>Qty: {item.quantity}</span>}
            </div>
          </div>
        </div>
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded object-cover" />
        )}
      </div>
      
      {item.properties && item.properties.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {item.properties.map((prop, index) => (
              <div key={index} className="flex justify-between">
                <span className="opacity-70">{prop.name}:</span>
                <span>{prop.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {item.enchantments && item.enchantments.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="text-xs">
            {item.enchantments.map((enchant, index) => (
              <div key={index} className="text-purple-300">
                ✨ {enchant.name} (Level {enchant.level}): {enchant.effect}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAction = (action: InteractiveAction) => (
    <button
      key={action.id}
      onClick={() => onActionClick(action)}
      disabled={action.disabled}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
        ${getActionColor(action.color)}
        ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
      `}
    >
      {getActionIcon(action.type)}
      {action.label}
    </button>
  );

  const renderChoice = (choice: InteractiveChoice) => (
    <button
      key={choice.id}
      onClick={() => onChoiceClick(choice)}
      disabled={choice.disabled}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
        ${getActionColor(choice.color)}
        ${choice.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
      `}
    >
      {choice.icon && <span>{choice.icon}</span>}
      <div className="text-left">
        <div>{choice.label}</div>
        {choice.description && (
          <div className="text-xs opacity-80">{choice.description}</div>
        )}
      </div>
    </button>
  );

  const renderRewards = (rewards: RewardMetadata) => (
    <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3 mt-3">
      <h4 className="font-semibold text-green-300 mb-2">🎁 Rewards</h4>
      <div className="space-y-1 text-sm">
        {rewards.experience && (
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-400" />
            <span>{rewards.experience} Experience</span>
          </div>
        )}
        {rewards.gold && (
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-yellow-400" />
            <span>{rewards.gold} Gold</span>
          </div>
        )}
        {rewards.items && rewards.items.length > 0 && (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-400" />
            <span>{rewards.items.length} Item(s)</span>
          </div>
        )}
                 {rewards.reputation && rewards.reputation.length > 0 && (
           <div className="flex items-center gap-2">
             <Users className="h-4 w-4 text-green-400" />
             <span>Reputation changes</span>
           </div>
         )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Title and Description */}
      {content.title && (
        <h3 className="text-lg font-bold text-white">{content.title}</h3>
      )}
      {content.description && (
        <p className="text-gray-300">{content.description}</p>
      )}

      {/* Items */}
      {content.items && content.items.length > 0 && (
        <div>
          <h4 className="font-semibold text-white mb-2">📦 Items</h4>
          <div className="space-y-2">
            {content.items.map(renderItem)}
          </div>
        </div>
      )}

      {/* Actions */}
      {content.actions && content.actions.length > 0 && (
        <div>
          <h4 className="font-semibold text-white mb-2">⚡ Actions</h4>
          <div className="flex flex-wrap gap-2">
            {content.actions.map(renderAction)}
          </div>
        </div>
      )}

      {/* Choices */}
      {content.choices && content.choices.length > 0 && (
        <div>
          <h4 className="font-semibold text-white mb-2">🤔 Choices</h4>
          <div className="space-y-2">
            {content.choices.map(renderChoice)}
          </div>
        </div>
      )}

      {/* Rewards */}
      {content.rewards && (
        renderRewards(content.rewards)
      )}

      {/* Requirements */}
      {content.requirements && (
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3">
          <h4 className="font-semibold text-yellow-300 mb-2">📋 Requirements</h4>
          <div className="space-y-1 text-sm">
            {content.requirements.level && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>Level {content.requirements.level}</span>
              </div>
            )}
            {content.requirements.skills && content.requirements.skills.length > 0 && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span>Skills required</span>
              </div>
            )}
            {content.requirements.gold && (
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-400" />
                <span>{content.requirements.gold} Gold</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expiration */}
      {content.expiration && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span>This opportunity expires at {content.expiration.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}; 