import React from 'react';
import { useAuth, useFirebase } from '../hooks';
import { Button, CharacterCard, CharacterCreationModal, CharacterEditModal, LoadingSpinner } from '../components';
import { Character } from '../types';
import { useNavigate } from 'react-router-dom';
import AchievementService from '../services/achievementService';

const CharactersPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { getCharacters, createCharacter, updateCharacter, deleteCharacter } = useFirebase();
  const navigate = useNavigate();
  
  const [characters, setCharacters] = React.useState<Character[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingCharacter, setEditingCharacter] = React.useState<Character | null>(null);

  React.useEffect(() => {
    const loadCharacters = async () => {
      // Don't load data if still authenticating
      if (authLoading) {
        return;
      }

      // If user is not authenticated, clear data and stop loading
      if (!user || !user.id) {
        setCharacters([]);
        setLoading(false);
        return;
      }

      // User is authenticated, load data
      try {
        setLoading(true);
        console.log('Loading characters for user:', user.id);
        const userCharacters = await getCharacters(user.id);
        console.log('Characters loaded successfully:', userCharacters.length);
        setCharacters(userCharacters);
      } catch (error) {
        console.error('Failed to load characters:', error);
        // Don't show error to user, just log it
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, [user?.id, authLoading]); // Depend on both user.id and authLoading

  const handleCreateCharacter = async (characterData: Partial<Character>) => {
    try {
      setActionLoading(true);
      console.log('Creating character with data:', characterData);
      
      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Character creation timed out')), 30000); // 30 seconds
      });
      
      const characterPromise = createCharacter(characterData);
      const newCharacter = await Promise.race([characterPromise, timeoutPromise]) as Character;
      
      if (newCharacter) {
        console.log('Character created successfully:', newCharacter);
        setCharacters(prev => [newCharacter, ...prev]);
        setShowCreateModal(false);

        // Track achievement progress for character creation
        if (user) {
          const newlyUnlocked = AchievementService.getInstance().processEvent(user.id, {
            type: 'characters_created',
            value: 1,
            characterId: newCharacter.id
          });

          // Show achievement notifications
          newlyUnlocked.forEach((achievement: any) => {
            console.log(`🎉 Achievement Unlocked: ${achievement.name}!`);
            // TODO: Add toast notification here
          });
        }
      }
    } catch (error) {
      console.error('Failed to create character:', error);
      // Show error to user and close modal
      alert(`Failed to create character: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowCreateModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCharacter = async (characterId: string, updates: Partial<Character>) => {
    try {
      setActionLoading(true);
      
      const updatedCharacter = await updateCharacter(characterId, updates);
      
      setCharacters(prev => prev.map(char => 
        char.id === characterId ? updatedCharacter : char
      ));
      setShowEditModal(false);
      setEditingCharacter(null);
    } catch (error) {
      console.error('Failed to update character:', error);
      alert(`Failed to update character: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCharacter = async (characterId: string) => {
    if (!window.confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
      return;
    }
    
    try {
      setActionLoading(true);
      
      await deleteCharacter(characterId);
      
      setCharacters(prev => prev.filter(char => char.id !== characterId));
    } catch (error) {
      console.error('Failed to delete character:', error);
      alert(`Failed to delete character: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (character: Character) => {
    setEditingCharacter(character);
    setShowEditModal(true);
  };

  // Show loading spinner while authenticating or loading data
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // If not authenticated, show message
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">Please Sign In</h2>
          <p className="text-gray-300 mb-4">You need to be signed in to manage your characters.</p>
          <Button 
            variant="primary"
            onClick={() => navigate('/')}
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Info (only in development) */}
      {import.meta.env.DEV && (
        <div className="bg-gray-800 rounded-lg p-4 text-sm">
          <h3 className="text-white font-medium mb-2">Debug Info:</h3>
          <p className="text-gray-300">User: {user ? `${user.displayName} (${user.id})` : 'Not authenticated'}</p>
          <p className="text-gray-300">Characters loaded: {characters.length}</p>
          <p className="text-gray-300">Loading: {loading ? 'Yes' : 'No'}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Characters</h1>
          <p className="text-gray-300">Manage your D&D characters</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          variant="primary"
        >
          Create Character
        </Button>
      </div>

      {/* Characters Grid */}
      {characters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map(character => (
            <CharacterCard 
              key={character.id} 
              character={character}
              onEdit={() => openEditModal(character)}
              onDelete={() => handleDeleteCharacter(character.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No characters yet</h3>
          <p className="text-gray-400 mb-6">
            Create your first character to start your adventure
          </p>
          <Button 
            onClick={() => setShowCreateModal(true)}
            variant="primary"
          >
            Create Your First Character
          </Button>
        </div>
      )}

      {/* Character Creation Modal */}
      <CharacterCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCharacter}
        loading={actionLoading}
      />

      {/* Character Edit Modal */}
      <CharacterEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCharacter(null);
        }}
        onSubmit={handleEditCharacter}
        character={editingCharacter}
        loading={actionLoading}
      />
    </div>
  );
};

export default CharactersPage; 