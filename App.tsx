
import React, { useState, useEffect } from 'react';
import { User, AppState } from './types';
import LoginView from './views/LoginView';
import LoadingView from './views/LoadingView';
import SetupView from './views/SetupView';
import MainView from './views/MainView';
import CallingView from './views/CallingView';

const GITHUB_CLIENT_ID = "Ov23liHIbFs3qWTJ0bez";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appState, setAppState] = useState<AppState>('LOGIN');

  useEffect(() => {
    // Check for GitHub OAuth callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      handleOAuthSuccess();
    }
  }, []);

  const handleOAuthSuccess = () => {
    setAppState('LOADING');
    // Simulate API delay for "Fetching GitHub Data"
    setTimeout(() => {
      // Mocked GitHub data
      const mockUser: User = {
        id: 'gh-' + Math.random().toString(36).substr(2, 9),
        username: '', // Needs setup
        email: 'dev@github.com',
        avatarUrl: 'https://picsum.photos/200',
        isProfileComplete: false
      };
      setUser(mockUser);
      setAppState('SETUP');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 3000);
  };

  const handleLogin = () => {
    const redirectUri = window.location.origin + window.location.pathname;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
    window.location.href = githubAuthUrl;
  };

  const handleSetupComplete = (username: string, avatar: string) => {
    if (user) {
      setUser({ ...user, username, avatarUrl: avatar, isProfileComplete: true });
      setAppState('LOADING');
      setTimeout(() => setAppState('MAIN'), 2000);
    }
  };

  const startCall = () => setAppState('CALLING');
  const endCall = () => setAppState('MAIN');

  return (
    <div className="h-screen w-screen overflow-hidden text-white">
      {appState === 'LOGIN' && <LoginView onLogin={handleLogin} />}
      {appState === 'LOADING' && <LoadingView />}
      {appState === 'SETUP' && user && (
        <SetupView 
          initialData={user} 
          onComplete={handleSetupComplete} 
        />
      )}
      {appState === 'MAIN' && user && (
        <MainView 
          user={user} 
          onStartCall={startCall} 
        />
      )}
      {appState === 'CALLING' && (
        <CallingView onEndCall={endCall} />
      )}
      
      {/* Global Footer */}
      <footer className="fixed bottom-4 w-full text-center text-xs text-gray-500 font-light pointer-events-none">
        © 2025 NIB Sec. All rights reserved. | <a href="https://t.me/nibsec" className="pointer-events-auto hover:text-yellow-400 transition-colors">t.me/nibsec</a>
      </footer>
    </div>
  );
};

export default App;
