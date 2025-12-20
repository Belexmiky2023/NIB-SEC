
import React from 'react';

interface LoginViewProps {
  onLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 space-y-12">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-yellow-400 hexagon flex items-center justify-center animate-pulse">
            <i className="fa-solid fa-shield-halved text-black text-4xl"></i>
          </div>
        </div>
        <h1 className="text-5xl font-bold tracking-tighter text-yellow-400 italic">NIB SEC</h1>
        <p className="text-gray-400 text-sm tracking-widest uppercase">Secured Communication Platform</p>
      </div>

      <div className="max-w-md w-full bg-neutral-900/50 backdrop-blur-xl border border-yellow-400/20 p-8 rounded-3xl shadow-2xl space-y-8">
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-semibold">Access Terminal</h2>
          <p className="text-gray-500 text-xs">Verify your identity via GitHub to enter the encrypted zone.</p>
        </div>

        <button 
          onClick={onLogin}
          className="w-full flex items-center justify-center space-x-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(250,204,21,0.3)]"
        >
          <i className="fa-brands fa-github text-xl"></i>
          <span>Sign in with GitHub</span>
        </button>

        <div className="flex justify-between items-center pt-4 border-t border-white/5 text-[10px] text-gray-600 uppercase tracking-widest">
          <span>AES-256 Bit Encryption</span>
          <span>Zero Knowledge Proof</span>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="fixed top-20 left-20 opacity-20 hidden lg:block">
        <i className="fa-solid fa-cube text-yellow-400 text-6xl animate-spin-slow"></i>
      </div>
      <div className="fixed bottom-20 right-20 opacity-20 hidden lg:block">
        <i className="fa-solid fa-hexagon-nodes text-yellow-400 text-6xl animate-pulse"></i>
      </div>
    </div>
  );
};

export default LoginView;
