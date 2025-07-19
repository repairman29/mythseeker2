import React from 'react';
import { useAuth, useFirebase } from '../hooks';
import { Button, CharacterCard, CharacterCreationModal, LoadingSpinner } from '../components';
import { Character } from '../types';

const CharactersPage: React.FC = () => {
  const { user } = useAuth();
  const { getCharacters, createCharacter } = useFirebase();
  
  const [characters, setCharacters] = React.useState<Character[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  React.useEffect(() => {
    const loadCharacters = async () => {
      if (user) {
        try {
          const userCharacters = await getCharacters(user.id);
          setCharacters(userCharacters);
        } catch (error) {
          console.error('Failed to load characters:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCharacters();
  }, [user, getCharacters]);

  const handleCreateCharacter = async (characterData: Partial<Character>) => {
    try {
      const newCharacter = await createCharacter(characterData);
      if (newCharacter) {
        setCharacters(prev => [newCharacter, ...prev]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create character:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            <CharacterCard key={character.id} character={character} />
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
        loading={false}
      />
    </div>
  );
};

export default CharactersPage; 