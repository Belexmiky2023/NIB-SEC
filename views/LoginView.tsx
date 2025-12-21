
import React from 'react';

interface LoginViewProps {
  onLogin: (method: 'github' | 'phone' | 'google', value?: string) => void;
  theme: string;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-yellow-400/5 rounded-full blur-[200px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-400/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-12 relative z-10 text-center">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-yellow-400 rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(250,204,21,0.3)]">
            <i className="fa-solid fa-bee text-black text-5xl"></i>
          </div>
          <h1 className="text-5xl font-black italic text-white tracking-tighter">NIB <span className="text-yellow-400">SEC</span></h1>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-600">The Hive Awaits Your Node</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => onLogin('github')}
            className="w-full bg-yellow-400 text-black py-5 rounded-[2rem] flex items-center justify-center space-x-4 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_15px_40px_rgba(250,204,21,0.2)] group"
          >
            <i className="fa-brands fa-github text-xl"></i>
            <span className="text-sm font-black uppercase tracking-widest">Sign in with GitHub</span>
          </button>

          <button 
            onClick={() => onLogin('google')}
            className="w-full bg-[#111] border border-white/10 text-white py-5 rounded-[2rem] flex items-center justify-center space-x-4 hover:border-yellow-400/50 transition-all group"
          >
            <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full">
               <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
               </svg>
            </div>
            <span className="text-sm font-black uppercase tracking-widest">Sign in with Google</span>
          </button>
        </div>

        <div className="pt-12">
          <div className="inline-flex items-center space-x-3 text-[10px] font-black text-gray-700 uppercase tracking-widest border border-white/5 px-6 py-2 rounded-full">
            <i className="fa-solid fa-lock text-yellow-400"></i>
            <span>Secured Handshake Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
