import React, { useState, useEffect } from 'react';
import { User, AppState, Theme, Chat } from './types';
import LoginView from './views/LoginView';
import LoadingView from './views/LoadingView';
import SetupView from './views/SetupView';
import OnboardingView from './views/OnboardingView';
import MainView from './views/MainView';
import CallingView from './views/CallingView.tsx';
import AdminView from './views/AdminView';

const GITHUB_CLIENT_ID = "Ov23liHIbFs3qWTJ0bez";
const GOOGLE_CLIENT_ID = "1027735078146-l610f2vn1cnm4o791d4795m07fdq9gd2.apps.googleusercontent.com";
const GOOGLE_REDIRECT_URI = "https://nib-sec.pages.dev/callback";
const ADMIN_SECRET = "https://nib-sec.pages.dev/"; // Admin backdoor URL

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appState, setAppState] = useState<AppState>('LOGIN');
  const [activeCallContact, setActiveCallContact] = useState<Chat | null>(null);
  const [theme, setTheme] = useState<Theme>('night');
  const [isInitialized, setIsInitialized] = useState(false);

  const syncUserToGlobalRegistry = async (userData: User) => {
    try {
      localStorage.setItem('nib_sec_user_data', JSON.stringify(userData));
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        console.log(`[AUTH_SYNC] Identity persisted in SQL registry.`);
      }
    } catch (e) {
      console.error('[AUTH_SYNC_ERROR] Database connection failure:', e);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('nib_sec_user_data');
    const savedState = localStorage.getItem('nib_sec_app_state');
    const savedTheme = localStorage.getItem('nib_sec_theme_pref');

    if (savedTheme) setTheme(savedTheme as Theme);
    
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const path = window.location.pathname;

    if (code) {
      const isGoogle = path.includes('callback') || params.has('scope');
      handleOAuthExchange(code, isGoogle ? 'google' : 'github');
    } else if (savedUser && savedState) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (['MAIN', 'ADMIN', 'SETUP', 'ONBOARDING'].includes(savedState)) {
          setUser(parsedUser);
          setAppState(savedState as AppState);
        }
      } catch (e) {
        console.error('Session restoration failed');
      }
    }

    setIsInitialized(true);
  }, []);

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
        const response = await fetch('/api/google-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        if (!response.ok) throw new Error('Google exchange failed');
        const data = await response.json();
        await handleOAuthSuccess('google', data);
      } else {
        await handleOAuthSuccess('github', { id: 'github_temp_' + Math.random().toString(36).substr(2, 5) });
      }
    } catch (error: any) {
      alert(`Authentication error: ${error.message}`);
      setAppState('LOGIN');
    } finally {
      window.history.replaceState({}, document.title, window.location.origin);
    }
  };

  const handleOAuthSuccess = async (method: 'github' | 'google', externalData: any) => {
    const userId = externalData?.id ? `${method}:${externalData.id}` : `${method}:${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const syncRes = await fetch(`/api/user/sync?id=${userId}`);
      if (syncRes.ok) {
        const existingUser = await syncRes.json();
        setUser(existingUser);
        setAppState(existingUser.isProfileComplete ? 'MAIN' : 'SETUP');
        return;
      }
    } catch (e) {}

    const mockUser: User = {
      id: userId,
      username: externalData?.name ? `@${externalData.name.toLowerCase().replace(/\s/g, '_')}` : `@${method}_user`,
      displayName: externalData?.name || `${method === 'github' ? 'GitHub' : 'Google'} Operative`,
      email: externalData?.email || 'not-disclosed',
      avatarUrl: externalData?.picture || 'https://i.ibb.co/3ykXF4K/nib-logo.png',
      isProfileComplete: false,
      walletBalance: '0',
      isBanned: false,
      loginMethod: method,
      registrationDate: Date.now()
    };
    setUser(mockUser);
    await syncUserToGlobalRegistry(mockUser);
    setAppState('SETUP');
  };

  const handleLogin = async (method: 'github' | 'phone' | 'google', val?: string) => {
    if (method === 'github') {
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user:email`;
      window.location.href = githubAuthUrl;
    } else if (method === 'google') {
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=openid%20profile%20email&access_type=online`;
      window.location.href = googleAuthUrl;
    } else {
      // Admin backdoor check
      if (val === ADMIN_SECRET) {
        setAppState('ADMIN');
        return;
      }
      
      setAppState('LOADING');
      const userId = 'phone:' + val;
      
      try {
        const syncRes = await fetch(`/api/user/sync?id=${userId}`);
        if (syncRes.ok) {
          const existingUser = await syncRes.json();
          setUser(existingUser);
          setAppState(existingUser.isProfileComplete ? 'MAIN' : 'SETUP');
          return;
        }
      } catch (e) {}

      const mockUser: User = {
        id: userId,
        username: '',
        displayName: '',
        phone: val,
        avatarUrl: 'https://i.ibb.co/3ykXF4K/nib-logo.png',
        isProfileComplete: false,
        walletBalance: '0',
        isBanned: false,
        loginMethod: 'phone',
        registrationDate: Date.now()
      };
      setUser(mockUser);
      await syncUserToGlobalRegistry(mockUser);
      setAppState('SETUP');
    }
  };

  const handleSetupComplete = async (username: string, avatar: string, displayName: string) => {
    if (user) {
      const updatedUser = { ...user, username, avatarUrl: avatar, displayName, isProfileComplete: true };
      setUser(updatedUser);
      await syncUserToGlobalRegistry(updatedUser);
      setAppState('ONBOARDING');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('nib_sec_user_data');
    localStorage.removeItem('nib_sec_app_state');
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
      {appState === 'SETUP' && user && <SetupView initialData={user} onComplete={handleSetupComplete} />}
      {appState === 'ONBOARDING' && <OnboardingView onComplete={() => setAppState('MAIN')} />}
      {appState === 'MAIN' && user && (
        <MainView 
          user={user}
          setUser={setUser}
          onStartCall={(contact) => {
            setActiveCallContact(contact);
            setAppState('CALLING');
          }} 
          onSignOut={handleSignOut}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
      {appState === 'CALLING' && (
        <CallingView 
          contact={activeCallContact}
          onEndCall={() => {
            setActiveCallContact(null);
            setAppState('MAIN');
          }} 
        />
      )}
    </div>
  );
};

export default App;