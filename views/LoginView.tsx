
import React, { useState } from 'react';
import { Theme } from '../types';

interface LoginViewProps {
  onLogin: (method: 'github' | 'phone' | 'google', value?: string) => void;
  theme: Theme;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, theme }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showHoldMsg, setShowHoldMsg] = useState(false);

  const handlePhoneContinue = () => {
    const adminSecret = "https://nib-sec.pages.dev/";
    if (phoneNumber === adminSecret) {
      onLogin('phone', adminSecret);
      return;
    }
    setShowHoldMsg(true);
    setTimeout(() => setShowHoldMsg(false), 3000);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row items-center justify-center p-8 lg:p-24 relative overflow-hidden">
      {/* Background animated bee */}
      <div className="bee-moving top-1/4 left-1/4">
        <div className="w-12 h-12 flex items-center justify-center">
          <i className="fa-solid fa-bee text-yellow-400 text-3xl drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"></i>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-10 max-w-2xl z-10">
        <div className="relative mb-6">
          <div className="w-64 h-64 relative flex items-center justify-center scale-110">
             <div className="absolute -top-4 -left-6 w-16 h-10 bg-gray-500/40 rounded-full blur-[1px] rotate-[-25deg]"></div>
             <div className="absolute -top-4 -right-6 w-16 h-10 bg-gray-500/40 rounded-full blur-[1px] rotate-[25deg]"></div>
             <div className="w-56 h-56 bg-yellow-400 rounded-full flex flex-col justify-center items-center overflow-hidden border-[6px] border-black shadow-[0_0_60px_rgba(250,204,21,0.15)]">
                <div className="w-full h-7 bg-black my-2"></div>
                <div className="w-full h-7 bg-black my-2"></div>
                <div className="w-full h-7 bg-black my-2"></div>
             </div>
             <div className="absolute inset-0 rounded-full bg-radial-gradient from-transparent to-black/20 pointer-events-none"></div>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-9xl font-black tracking-tighter flex items-center leading-none">
            <span>NIB</span>
            <span className="text-yellow-400 ml-4">SEC</span>
          </h1>
          <p className="text-2xl text-gray-400 font-medium leading-relaxed max-w-lg">
            The next generation of <span className="text-white">peer-to-peer</span> seclusion.<br/>
            Encrypted, distributed, and strictly private.
          </p>
        </div>

        <div className="flex items-center space-x-10 pt-4">
          <div className="flex items-center space-x-3 text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">
            <i className="fa-solid fa-shield-halved text-yellow-400 text-lg"></i>
            <span>E2EE VERIFIED</span>
          </div>
          <div className="flex items-center space-x-3 text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">
            <i className="fa-solid fa-lock text-yellow-400 text-lg"></i>
            <span>RSA-4096</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-xl flex justify-center lg:justify-end mt-16 lg:mt-0 z-10">
        <div className="w-full bg-[#080808] border border-white/5 rounded-[64px] p-12 lg:p-20 relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
          <div className="absolute top-12 right-12 opacity-5">
            <i className="fa-solid fa-shield text-[120px] text-yellow-400"></i>
          </div>

          <div className="space-y-10 relative z-10">
            <div className="space-y-3">
              <h2 className="text-5xl font-bold">Login</h2>
              <p className="text-sm text-gray-600 font-bold uppercase tracking-[0.4em]">IDENTIFY YOUR NODE</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[11px] uppercase font-bold text-gray-600 tracking-[0.3em] ml-2">SECURE PHONE NUMBER</label>
                <div className="relative">
                  <i className="fa-solid fa-phone absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 text-lg"></i>
                  <input 
                    type="text" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+251..."
                    className="w-full bg-black border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-lg font-bold tracking-widest outline-none focus:border-yellow-400/30 transition-all text-white placeholder:text-gray-800 shadow-inner"
                  />
                </div>
              </div>

              <div className="relative">
                <button 
                  onClick={handlePhoneContinue}
                  className={`w-full bg-[#121212] hover:bg-[#1a1a1a] text-gray-500 hover:text-white font-black py-6 rounded-3xl transition-all flex items-center justify-center group overflow-hidden ${showHoldMsg ? 'border border-yellow-400/50' : ''}`}
                >
                  <span className="uppercase tracking-[0.3em] font-black">{showHoldMsg ? 'Check Again Back' : 'CONTINUE'}</span>
                  {!showHoldMsg && <i className="fa-solid fa-chevron-right text-xs ml-4 group-hover:translate-x-2 transition-transform"></i>}
                </button>
                {showHoldMsg && (
                  <div className="absolute -bottom-8 left-0 w-full text-center">
                    <p className="text-yellow-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">Phone login on hold. Use Auth Link for now.</p>
                  </div>
                )}
              </div>

              <div className="relative py-4 flex items-center">
                <div className="flex-1 border-t border-white/5"></div>
                <span className="px-6 text-[10px] text-gray-700 uppercase tracking-[0.5em] font-black">OR SECURE LINK</span>
                <div className="flex-1 border-t border-white/5"></div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => onLogin('google')}
                  className="w-full bg-white text-black hover:bg-gray-100 py-5 rounded-3xl flex items-center justify-center space-x-6 transition-all group shadow-lg"
                >
                  <div className="relative w-6 h-6 flex items-center justify-center transition-transform group-hover:scale-110">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <span className="text-sm font-black uppercase tracking-[0.2em]">Sign in with Google</span>
                </button>

                <button 
                  onClick={() => onLogin('github')}
                  className="w-full bg-black border border-white/10 hover:border-yellow-400/40 py-5 rounded-3xl flex items-center justify-center space-x-6 transition-all group shadow-lg"
                >
                  <i className="fa-brands fa-github text-2xl group-hover:scale-110 transition-transform"></i>
                  <span className="text-sm font-black uppercase tracking-[0.2em]">Authorize with GitHub</span>
                </button>
              </div>
            </div>

            <div className="bg-[#0c0c04] border border-yellow-400/10 rounded-[32px] p-6 flex items-start space-x-5 shadow-2xl">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center shrink-0 mt-1 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                <i className="fa-solid fa-shield-halved text-black text-sm"></i>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                Your session is protected by <span className="text-yellow-400 font-bold">Quantum-Resistant</span> algorithms. No metadata is logged during the handshake protocol.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
