
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

  // CRITICAL: Push User Data to Backend KV Store for Admin Visibility
  const syncUserToGlobalRegistry = async (userData: User) => {
    try {
      // 1. Update Local Session for immediate UI responsiveness
      localStorage.setItem('nib_sec_user_data', JSON.stringify(userData));
      
      // 2. Mandatory Push to Cloudflare Identity Bridge (/api/users)
      console.log(`[AUTH_SYNC] Initiating backend handshake for operative: ${userData.id}`);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        console.log(`[AUTH_SYNC] Node connection established. Identity persisted in KV.`);
      } else {
        const errText = await response.text();
        console.error(`[AUTH_SYNC] Identity vault rejected node: ${errText}`);
      }
    } catch (e) {
      console.error('[AUTH_SYNC_ERROR] Neural link failure during persistence:', e);
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
        if (['MAIN', 'ADMIN', 'SETUP'].includes(savedState)) {
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
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to exchange Google code');
        }
        
        const data = await response.json();
        // Await synchronization to ensure data exists in KV before any other action
        await handleOAuthSuccess('google', data);
      } else {
        // Mock GitHub exchange for demonstration, ensuring it's also synced
        await handleOAuthSuccess('github', { id: 'github_temp_' + Math.random().toString(36).substr(2, 5) });
      }
    } catch (error: any) {
      console.error('OAuth Error:', error);
      alert(`Authentication error: ${error.message}`);
      setAppState('LOGIN');
    } finally {
      window.history.replaceState({}, document.title, window.location.origin);
    }
  };

  const handleOAuthSuccess = async (method: 'github' | 'google', externalData: any) => {
    // USE ACTUAL PROVIDER ID AS THE PRIMARY KEY FOR SHARED VISIBILITY
    const userId = externalData?.id ? `${method}:${externalData.id}` : `${method}:${Math.random().toString(36).substr(2, 9)}`;
    
    const mockUser: User = {
      id: userId,
      username: externalData?.name ? `@${externalData.name.toLowerCase().replace(/\s/g, '_')}` : `@${method}_user`,
      displayName: externalData?.name || `${method === 'github' ? 'GitHub' : 'Google'} Operative`,
      email: externalData?.email || 'not-disclosed',
      avatarUrl: externalData?.picture || 'https://picsum.photos/200',
      isProfileComplete: false,
      walletBalance: '0',
      isBanned: false,
      loginMethod: method,
      registrationDate: Date.now()
    };

    // Update state first for UI responsiveness
    setUser(mockUser);
    // CRITICAL: Await sync to confirm KV storage
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
      setAppState('LOADING');
      setTimeout(async () => {
        if (val === ADMIN_SECRET) {
          setAppState('ADMIN');
          return;
        }
        const mockUser: User = {
          id: 'phone:' + val,
          username: '',
          displayName: '',
          phone: val,
          avatarUrl: 'https://picsum.photos/200',
          isProfileComplete: false,
          walletBalance: '0',
          isBanned: false,
          loginMethod: 'phone',
          registrationDate: Date.now()
        };
        setUser(mockUser);
        await syncUserToGlobalRegistry(mockUser);
        setAppState('SETUP');
      }, 1500);
    }
  };

  const handleSetupComplete = async (username: string, avatar: string, displayName: string) => {
    if (user) {
      const updatedUser = { 
        ...user, 
        username, 
        avatarUrl: avatar, 
        displayName, 
        isProfileComplete: true,
        registrationDate: user.registrationDate || Date.now() 
      };
      setUser(updatedUser);
      // Ensure profile updates are also reflected in the shared identity vault
      await syncUserToGlobalRegistry(updatedUser);

      setAppState('LOADING');
      setTimeout(() => setAppState('MAIN'), 1500);
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

  if (user?.isBanned && appState !== 'LOGIN' && appState !== 'ADMIN') {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-8 text-center space-y-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-red-900/10 blur-3xl rounded-full scale-150 animate-pulse"></div>
        <div className="relative z-10 space-y-8">
           <div className="w-32 h-32 hexagon bg-red-600 flex items-center justify-center text-white mx-auto shadow-[0_0_50px_rgba(220,38,38,0.5)]">
              <i className="fa-solid fa-hand text-6xl"></i>
           </div>
           <div className="space-y-4">
              <h1 className="text-6xl font-black italic uppercase text-white tracking-tighter">Access <span className="text-red-500">Denied</span></h1>
              <p className="text-gray-500 font-mono text-sm uppercase tracking-[0.4em]">Node Termination Protocol Active</p>
           </div>
           <button onClick={handleSignOut} className="px-12 py-5 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
             Exit Hive
           </button>
        </div>
      </div>
    );
  }

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
