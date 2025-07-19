import React, { Suspense } from 'react';
import { useAuth, useGameState, useFirebase } from './hooks';
import { Button, Modal, Toast, ErrorBoundary, LoadingSpinner } from './components';

// Lazy load page components for code splitting
const DashboardPage = React.lazy(() => import('./pages').then(module => ({ default: module.DashboardPage })));
const CharactersPage = React.lazy(() => import('./pages').then(module => ({ default: module.CharactersPage })));
const CampaignsPage = React.lazy(() => import('./pages').then(module => ({ default: module.CampaignsPage })));
const GamePage = React.lazy(() => import('./pages').then(module => ({ default: module.GamePage })));

// Simple routing enum
enum Route {
  DASHBOARD = 'dashboard',
  CHARACTERS = 'characters',
  CAMPAIGNS = 'campaigns',
  GAME = 'game'
}

function App() {
  const { user, loading: authLoading, error: authError, loginWithGoogle, logout } = useAuth();
  const { currentCampaign } = useGameState();
  const { loading: firebaseLoading, error: firebaseError } = useFirebase();
  
  const [currentRoute, setCurrentRoute] = React.useState<Route>(Route.DASHBOARD);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Array<{id: string, type: 'success' | 'error', message: string}>>([]);

  // Handle authentication errors
  React.useEffect(() => {
    if (authError) {
      addNotification('error', authError);
    }
  }, [authError]);

  // Handle Firebase errors
  React.useEffect(() => {
    if (firebaseError) {
      addNotification('error', firebaseError);
    }
  }, [firebaseError]);

  const addNotification = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      setShowLoginModal(false);
      addNotification('success', 'Successfully logged in!');
    } catch (error) {
      addNotification('error', 'Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentRoute(Route.DASHBOARD);
      addNotification('success', 'Successfully logged out!');
    } catch (error) {
      addNotification('error', 'Logout failed. Please try again.');
    }
  };

  // Loading state
  if (authLoading || firebaseLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" color="white" text="Loading MythSeeker..." />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">🎲 MythSeeker</h1>
          <p className="text-gray-300 mb-8 text-lg">AI-Powered Tabletop RPG Platform</p>
          <Button 
            onClick={() => setShowLoginModal(true)}
            size="lg"
            variant="primary"
          >
            Sign In with Google
          </Button>
          
          <Modal 
            isOpen={showLoginModal} 
            onClose={() => setShowLoginModal(false)}
            title="Welcome to MythSeeker"
          >
            <div className="text-center p-6">
              <p className="text-gray-600 mb-6">
                Sign in to start your adventure with AI-powered storytelling
              </p>
              <Button 
                onClick={handleLogin}
                size="lg"
                variant="primary"
                className="w-full"
              >
                Continue with Google
              </Button>
            </div>
          </Modal>
        </div>
      </div>
    );
  }

  // Main application
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">🎲 MythSeeker</h1>
              
              <nav className="ml-10 flex space-x-8">
                <button
                  onClick={() => setCurrentRoute(Route.DASHBOARD)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentRoute === Route.DASHBOARD
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentRoute(Route.CHARACTERS)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentRoute === Route.CHARACTERS
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Characters
                </button>
                <button
                  onClick={() => setCurrentRoute(Route.CAMPAIGNS)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentRoute === Route.CAMPAIGNS
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Campaigns
                </button>
                {currentCampaign && (
                  <button
                    onClick={() => setCurrentRoute(Route.GAME)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentRoute === Route.GAME
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-300 hover:text-white hover:bg-blue-600'
                    }`}
                  >
                    Game Session
                  </button>
                )}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-white">{user.displayName}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <Button 
                onClick={handleLogout}
                variant="secondary"
                size="sm"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="md" />
            </div>
          }>
            {currentRoute === Route.DASHBOARD && <DashboardPage />}
            {currentRoute === Route.CHARACTERS && <CharactersPage />}
            {currentRoute === Route.CAMPAIGNS && <CampaignsPage />}
            {currentRoute === Route.GAME && currentCampaign && <GamePage campaign={currentCampaign} />}
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {notifications.map(notification => (
          <Toast
            key={notification.id}
            notification={{
              id: notification.id,
              type: notification.type,
              title: notification.type === 'success' ? 'Success' : 'Error',
              message: notification.message,
              timestamp: new Date()
            }}
            onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
          />
        ))}
      </div>
    </div>
  );
}

export default App; 