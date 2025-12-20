
import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: () => void;
}

type AuthMode = 'LOGIN' | 'REGISTER';

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For this prototype, we trigger the GitHub flow as the "Secure" entry
    onLogin();
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-yellow-400/10 hexagon w-32 h-32 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      <div className="text-center space-y-2 mb-8 z-10">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-yellow-400 hexagon flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(250,204,21,0.4)]">
              <i className="fa-solid fa-shield-halved text-black text-4xl"></i>
            </div>
            {/* Small bee flying around logo */}
            <div className="absolute -top-4 -right-4 text-yellow-400 text-xl bee-float">
              <i className="fa-solid fa-bee"></i>
            </div>
          </div>
        </div>
        <h1 className="text-6xl font-black tracking-tighter text-yellow-400 italic drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]">
          NIB SEC
        </h1>
        <p className="text-gray-500 text-xs tracking-[0.5em] uppercase font-bold">
          The Encrypted Hive
        </p>
      </div>

      <div className="max-w-md w-full bg-neutral-900/40 backdrop-blur-2xl border border-yellow-400/20 p-1 rounded-[2.5rem] shadow-2xl z-10">
        <div className="bg-black/60 rounded-[2.3rem] p-8 space-y-6 border border-white/5">
          {/* Auth Mode Toggle */}
          <div className="flex bg-neutral-900/80 p-1 rounded-2xl border border-white/5">
            <button 
              onClick={() => setMode('LOGIN')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                mode === 'LOGIN' ? 'bg-yellow-400 text-black shadow-lg' : 'text-gray-500 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button 
              onClick={() => setMode('REGISTER')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                mode === 'REGISTER' ? 'bg-yellow-400 text-black shadow-lg' : 'text-gray-500 hover:text-white'
              }`}
            >
              Join Hive
            </button>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {mode === 'LOGIN' ? 'Welcome Back, Operative' : 'Register New Signal'}
              </h2>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">
                Security clearance required
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-600 ml-4 tracking-widest">Signal ID (Email)</label>
                <div className="relative group">
                  <i className="fa-solid fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-400 transition-colors"></i>
                  <input 
                    type="email" 
                    placeholder="operative@nibsec.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-900/50 border border-white/5 focus:border-yellow-400/50 rounded-2xl py-4 pl-12 pr-6 outline-none transition-all text-sm font-medium placeholder:text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-600 ml-4 tracking-widest">Access Key</label>
                <div className="relative group">
                  <i className="fa-solid fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-400 transition-colors"></i>
                  <input 
                    type="password" 
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-neutral-900/50 border border-white/5 focus:border-yellow-400/50 rounded-2xl py-4 pl-12 pr-6 outline-none transition-all text-sm font-medium placeholder:text-gray-700"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl border border-white/10 transition-all active:scale-95 text-sm uppercase tracking-widest"
              >
                {mode === 'LOGIN' ? 'Establish Link' : 'Initialize Profile'}
              </button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-black px-4 text-[10px] text-gray-600 uppercase tracking-widest font-bold">Secure Gateway</span>
              </div>
            </div>

            <button 
              onClick={onLogin}
              className="w-full flex items-center justify-center space-x-3 bg-yellow-400 hover:bg-yellow-500 text-black font-black py-4 rounded-2xl transition-all shadow-[0_10px_30px_rgba(250,204,21,0.2)] active:scale-95 group"
            >
              <i className="fa-brands fa-github text-xl group-hover:rotate-12 transition-transform"></i>
              <span className="text-sm uppercase tracking-widest">Sign in with GitHub</span>
            </button>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/5 text-[9px] text-gray-600 uppercase tracking-[0.2em] font-bold">
            <span className="flex items-center">
              <i className="fa-solid fa-circle text-[6px] text-green-500 mr-2 animate-pulse"></i>
              Node: Paris-09
            </span>
            <span>AES-XTS-256</span>
          </div>
        </div>
      </div>
      
      {/* Decorative Floating Elements */}
      <div className="fixed top-20 left-20 opacity-10 hidden xl:block">
        <div className="hexagon w-32 h-32 border-2 border-yellow-400 animate-[spin_20s_linear_infinite]"></div>
      </div>
      <div className="fixed bottom-20 right-20 opacity-10 hidden xl:block">
        <div className="hexagon w-48 h-48 border-2 border-yellow-400 animate-[spin_30s_linear_infinite_reverse]"></div>
      </div>
    </div>
  );
};

export default LoginView;
