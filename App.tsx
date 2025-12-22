
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

  // CRITICAL: Persistence Logic for Global User Registry
  const syncUserToGlobalRegistry = (userData: User) => {
    try {
      const adminOpsRaw = localStorage.getItem('nib_admin_ops');
      let ops: User[] = adminOpsRaw ? JSON.parse(adminOpsRaw) : [];
      
      const existingIdx = ops.findIndex(o => o.id === userData.id);
      if (existingIdx !== -1) {
        ops[existingIdx] = { ...ops[existingIdx], ...userData };
      } else {
        ops.push(userData);
      }
      
      localStorage.setItem('nib_admin_ops', JSON.stringify(ops));
      console.log(`[AUTH_SYNC] Persistent record updated for User: ${userData.id} (${userData.username || 'Pending Handle'})`);
    } catch (e) {
      console.error('[AUTH_SYNC_ERROR] Failed to persist user record:', e);
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

    // Heartbeat for ban status check and balance syncing
    if (user && appState !== 'LOGIN' && appState !== 'ADMIN') {
      const savedOps = localStorage.getItem('nib_admin_ops');
      if (savedOps) {
        const ops: User[] = JSON.parse(savedOps);
        const latestInfo = ops.find(o => o.id === user.id);
        if (latestInfo) {
          if (latestInfo.isBanned !== user.isBanned || latestInfo.walletBalance !== user.walletBalance) {
            setUser({ ...user, isBanned: latestInfo.isBanned, walletBalance: latestInfo.walletBalance });
          }
        }
      }
    }

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
        handleOAuthSuccess('google', data);
      } else {
        handleOAuthSuccess('github');
      }
    } catch (error: any) {
      console.error('OAuth Error:', error);
      alert(`Authentication error: ${error.message}`);
      setAppState('LOGIN');
    } finally {
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
      loginMethod: method,
      registrationDate: Date.now()
    };
    setUser(mockUser);
    syncUserToGlobalRegistry(mockUser);
    setAppState('SETUP');
  };

  const handleLogin = (method: 'github' | 'phone' | 'google', val?: string) => {
    if (method === 'github') {
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user:email`;
      window.location.href = githubAuthUrl;
    } else if (method === 'google') {
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=openid%20profile%20email&access_type=online`;
      window.location.href = googleAuthUrl;
    } else {
      setAppState('LOADING');
      setTimeout(() => {
        if (val === ADMIN_SECRET) {
          console.log('[ADMIN] Overseer access granted.');
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
          loginMethod: 'phone',
          registrationDate: Date.now()
        };
        setUser(mockUser);
        syncUserToGlobalRegistry(mockUser);
        setAppState('SETUP');
      }, 1500);
    }
  };

  const handleSetupComplete = (username: string, avatar: string, displayName: string) => {
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
      syncUserToGlobalRegistry(updatedUser);

      setAppState('LOADING');
      setTimeout(() => setAppState('MAIN'), 1500);
    }
  };

  const handleSignOut = () => {
    console.log('[SESSION] Terminating node connection.');
    // CRITICAL FIX: Only remove session data, do NOT clear global registry
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
           <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[3rem] max-w-lg mx-auto backdrop-blur-xl">
              <p className="text-red-400 font-black uppercase text-xs leading-relaxed tracking-widest">
                Your operative credentials have been revoked by the Overseer. 
                Hive access is permanently restricted due to security violations.
              </p>
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
