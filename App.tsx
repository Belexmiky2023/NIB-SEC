
import React, { useState, useEffect } from 'react';
import { User, AppState, Theme } from './types';
import LoginView from './views/LoginView';
import LoadingView from './views/LoadingView';
import SetupView from './views/SetupView';
import MainView from './views/MainView';
import CallingView from './views/CallingView';

const GITHUB_CLIENT_ID = "Ov23liHIbFs3qWTJ0bez";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appState, setAppState] = useState<AppState>('LOGIN');
  const [theme, setTheme] = useState<Theme>('night');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) handleOAuthSuccess();
  }, []);

  const handleOAuthSuccess = () => {
    setAppState('LOADING');
    setTimeout(() => {
      // Mocking GitHub user data
      const mockUser: User = {
        id: 'gh-' + Math.random().toString(36).substr(2, 9),
        username: '@gh_user', // Will be refined in SetupView
        displayName: 'GitHub Operative',
        email: 'dev@github.com',
        avatarUrl: 'https://picsum.photos/200',
        isProfileComplete: false,
        walletBalance: '0.00'
      };
      setUser(mockUser);
      setAppState('SETUP');
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 3000);
  };

  const handleLogin = (method: 'github' | 'phone') => {
    if (method === 'github') {
      const redirectUri = window.location.origin + window.location.pathname;
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
      window.location.href = githubAuthUrl;
    } else {
      setAppState('LOADING');
      setTimeout(() => {
        const mockUser: User = {
          id: 'u-' + Math.random().toString(36).substr(2, 9),
          username: '',
          displayName: '',
          phone: '+1 555 000-0000',
          avatarUrl: 'https://picsum.photos/200',
          isProfileComplete: false,
          walletBalance: '0.00'
        };
        setUser(mockUser);
        setAppState('SETUP');
      }, 2000);
    }
  };

  const handleSetupComplete = (username: string, avatar: string, displayName: string) => {
    if (user) {
      setUser({ ...user, username, avatarUrl: avatar, displayName, isProfileComplete: true });
      setAppState('LOADING');
      setTimeout(() => setAppState('MAIN'), 2000);
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'night' ? 'light' : 'night');

  return (
    <div className={`h-screen w-screen overflow-hidden transition-colors duration-300 ${theme === 'night' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {appState === 'LOGIN' && <LoginView onLogin={handleLogin} theme={theme} />}
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
          setUser={setUser}
          onStartCall={() => setAppState('CALLING')} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
      {appState === 'CALLING' && (
        <CallingView onEndCall={() => setAppState('MAIN')} />
      )}
      
      <footer className="fixed bottom-4 w-full text-center text-[10px] text-gray-600 font-mono uppercase tracking-[0.3em] pointer-events-none z-0">
        © 2025 NIB SEC • SECURED COMMUNICATION • T.ME/NIBSEC
      </footer>
    </div>
  );
};

export default App;
