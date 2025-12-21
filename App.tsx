
import React, { useState, useEffect } from 'react';
import { User, AppState, Theme } from './types';
import LoginView from './views/LoginView';
import LoadingView from './views/LoadingView';
import SetupView from './views/SetupView';
import MainView from './views/MainView';
import CallingView from './views/CallingView';
import AdminView from './views/AdminView';

const GITHUB_CLIENT_ID = "Ov23liHIbFs3qWTJ0bez";
const GOOGLE_CLIENT_ID = "1027735078146-l610f2vn1cnm4o791d4795m07fdq9gd2.apps.googleusercontent.com";
const GOOGLE_REDIRECT_URI = "https://nib-sec.pages.dev/callback";
const ADMIN_SECRET = "https://nib-sec.pages.dev/";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appState, setAppState] = useState<AppState>('LOGIN');
  const [theme, setTheme] = useState<Theme>('night');
  const [isInitialized, setIsInitialized] = useState(false);

  // Persistence logic - Load from LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('nib_sec_user_data');
    const savedState = localStorage.getItem('nib_sec_app_state');
    const savedTheme = localStorage.getItem('nib_sec_theme_pref');

    if (savedTheme) setTheme(savedTheme as Theme);
    
    // Check for OAuth codes in URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const path = window.location.pathname;

    if (code) {
      // Determine method based on path or scope param
      const isGoogle = path.includes('callback') || params.has('scope');
      handleOAuthExchange(code, isGoogle ? 'google' : 'github');
    } else if (savedUser && savedState) {
      const parsedUser = JSON.parse(savedUser);
      if (['MAIN', 'ADMIN', 'SETUP'].includes(savedState)) {
        setUser(parsedUser);
        setAppState(savedState as AppState);
      }
    }

    setIsInitialized(true);
  }, []);

  // Save state changes to LocalStorage
  useEffect(() => {
    if (!isInitialized) return;

    if (appState !== 'LOADING') {
      localStorage.setItem('nib_sec_app_state', appState);
      localStorage.setItem('nib_sec_theme_pref', theme);
      if (user) {
        localStorage.setItem('nib_sec_user_data', JSON.stringify(user));
      } else {
        localStorage.removeItem('nib_sec_user_data');
      }
    }
  }, [appState, user, theme, isInitialized]);

  const handleOAuthExchange = async (code: string, method: 'github' | 'google') => {
    setAppState('LOADING');
    try {
      if (method === 'google') {
        // Secure server-side exchange
        const response = await fetch('/api/google-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to exchange Google code');
        }
        
        const data = await response.json();
        handleOAuthSuccess('google', data);
      } else {
        // GitHub flow (currently mock, can be expanded to a function similar to google-auth)
        handleOAuthSuccess('github');
      }
    } catch (error: any) {
      console.error('OAuth Error:', error);
      alert(`Authentication error: ${error.message}`);
      setAppState('LOGIN');
    } finally {
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.origin);
    }
  };

  const handleOAuthSuccess = (method: 'github' | 'google', externalData?: any) => {
    const mockUser: User = {
      id: (method === 'github' ? 'gh-' : 'go-') + Math.random().toString(36).substr(2, 9),
      username: externalData?.name ? `@${externalData.name.toLowerCase().replace(/\s/g, '_')}` : (method === 'github' ? '@gh_user' : '@google_operative'),
      displayName: externalData?.name || (method === 'github' ? 'GitHub Operative' : 'Google Operative'),
      email: externalData?.email || (method === 'github' ? 'dev@github.com' : 'user@gmail.com'),
      avatarUrl: externalData?.picture || 'https://picsum.photos/200',
      isProfileComplete: false,
      walletBalance: '0.00',
      loginMethod: method
    };
    setUser(mockUser);
    setAppState('SETUP');
  };

  const handleLogin = (method: 'github' | 'phone' | 'google', val?: string) => {
    if (method === 'github') {
      const redirectUri = window.location.origin;
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
      window.location.href = githubAuthUrl;
    } else if (method === 'google') {
      // Redirect to Google's OAuth 2.0 endpoint
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=openid%20profile%20email&access_type=online`;
      window.location.href = googleAuthUrl;
    } else {
      setAppState('LOADING');
      setTimeout(() => {
        if (val === ADMIN_SECRET) {
          setAppState('ADMIN');
          return;
        }
        const mockUser: User = {
          id: 'u-' + Math.random().toString(36).substr(2, 9),
          username: '',
          displayName: '',
          phone: val,
          avatarUrl: 'https://picsum.photos/200',
          isProfileComplete: false,
          walletBalance: '0.00',
          loginMethod: 'phone'
        };
        setUser(mockUser);
        setAppState('SETUP');
      }, 2000);
    }
  };

  const handleSetupComplete = (username: string, avatar: string, displayName: string) => {
    if (user) {
      const updatedUser = { ...user, username, avatarUrl: avatar, displayName, isProfileComplete: true };
      setUser(updatedUser);
      setAppState('LOADING');
      setTimeout(() => setAppState('MAIN'), 2000);
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    setUser(null);
    setAppState('LOGIN');
    window.location.reload(); 
  };

  const toggleTheme = () => setTheme(prev => prev === 'night' ? 'light' : 'night');

  if (!isInitialized) return <LoadingView />;

  return (
    <div className={`h-screen w-screen overflow-hidden transition-colors duration-300 ${theme === 'night' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {appState === 'LOGIN' && <LoginView onLogin={handleLogin} theme={theme} />}
      {appState === 'LOADING' && <LoadingView />}
      {appState === 'ADMIN' && <AdminView onExit={() => setAppState('LOGIN')} />}
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
          onSignOut={handleSignOut}
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
