
import React, { useState, useEffect } from 'react';

interface LoginViewProps {
  onLogin: (method: 'github' | 'phone' | 'google', value?: string) => void;
  theme: string;
}

const countries = [
  { name: 'Ethiopia', code: '+251', flag: '🇪🇹' },
  { name: 'USA', code: '+1', flag: '🇺🇸' },
  { name: 'UK', code: '+44', flag: '🇬🇧' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'UAE', code: '+971', flag: '🇦🇪' },
];

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isComingSoon, setIsComingSoon] = useState(false);

  useEffect(() => {
    if (isComingSoon) {
      const timer = setTimeout(() => setIsComingSoon(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isComingSoon]);

  const handleContinue = () => {
    if (phoneNumber.trim().length > 5) {
      setIsComingSoon(true);
      // For now, we block the login and show the message
      // onLogin('phone', `${selectedCountry.code}${phoneNumber}`);
    }
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col lg:flex-row items-center justify-center p-8 lg:p-24 relative overflow-hidden gap-12 lg:gap-32">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-400/5 rounded-full blur-[150px] pointer-events-none"></div>
      
      {/* Moving Bee with Honey Bar */}
      <div className="absolute top-[15%] left-[10%] bee-with-bar hidden lg:block z-10 pointer-events-none">
          <div className="relative">
              <i className="fa-solid fa-bee text-yellow-400 text-6xl opacity-40"></i>
              <div className="absolute -bottom-2 -right-4 w-12 h-2 bg-yellow-600 rounded-full border border-yellow-400/30"></div>
          </div>
      </div>

      {/* Big Honey Pot at bottom center/left */}
      <div className="absolute -bottom-20 left-[5%] opacity-20 hidden lg:block pointer-events-none">
          <i className="fa-solid fa-jar text-[300px] text-yellow-500/20"></i>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <i className="fa-solid fa-bee text-6xl text-yellow-400/30"></i>
          </div>
      </div>

      {/* Left Column: Branding */}
      <div className="flex-1 max-w-xl space-y-10 z-20 text-center lg:text-left">
        <div className="relative inline-block group">
          <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-full border-[10px] border-black bg-yellow-400 flex flex-col items-center justify-center overflow-hidden shadow-[0_0_80px_rgba(250,204,21,0.4)] relative">
            {/* Horizontal Stripes like a Bee */}
            <div className="absolute inset-0 flex flex-col justify-evenly">
              <div className="h-4 lg:h-6 bg-black w-full"></div>
              <div className="h-4 lg:h-6 bg-black w-full"></div>
              <div className="h-4 lg:h-6 bg-black w-full"></div>
            </div>
            <div className="z-10 bg-yellow-400 p-2 rounded-full border-4 border-black">
               <i className="fa-solid fa-bee text-black text-6xl lg:text-8xl"></i>
            </div>
          </div>
          {/* Floating dots decoration */}
          <div className="absolute -top-4 -left-8 w-6 h-4 bg-gray-600 rounded-full opacity-50 blur-[2px]"></div>
          <div className="absolute -top-6 left-12 w-6 h-4 bg-gray-600 rounded-full opacity-50 blur-[2px]"></div>
        </div>

        <div className="space-y-4">
          <h1 className="text-7xl lg:text-9xl font-black tracking-tighter italic text-white leading-none">
            NIB <span className="text-yellow-400">SEC</span>
          </h1>
          <div className="space-y-2 max-w-md mx-auto lg:mx-0">
            <p className="text-lg lg:text-xl text-gray-400 font-medium">
              The next generation of <span className="text-white font-bold">peer-to-peer seclusion.</span>
            </p>
            <p className="text-lg text-gray-500 font-medium">
              Encrypted, distributed, and strictly private.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center lg:justify-start space-x-8 pt-4">
          <div className="flex items-center space-x-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
            <i className="fa-solid fa-shield-halved text-yellow-400"></i>
            <span>E2EE VERIFIED</span>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
            <i className="fa-solid fa-lock text-yellow-400"></i>
            <span>RSA-4096</span>
          </div>
        </div>
      </div>

      {/* Right Column: Login Card */}
      <div className="w-full max-w-md z-20">
        <div className="bg-[#0c0c0c] border border-white/5 rounded-[3.5rem] p-10 lg:p-14 space-y-10 login-card-shadow relative overflow-hidden">
          {/* Card Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-3xl pointer-events-none"></div>
          <i className="fa-solid fa-shield text-yellow-500/5 text-[150px] absolute -top-10 -right-10 pointer-events-none rotate-12"></i>

          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white italic">Login</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">Identify Your Node</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2">Secure Phone Number</label>
              <div className="relative flex items-center bg-[#111] border border-white/5 rounded-3xl p-2 focus-within:border-yellow-400/50 transition-all">
                {/* Country Selector */}
                <div className="relative">
                  <button 
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center space-x-2 px-4 py-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-transparent active:scale-95"
                  >
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <span className="text-gray-400 font-bold">{selectedCountry.code}</span>
                    <i className="fa-solid fa-chevron-down text-[8px] text-gray-600"></i>
                  </button>
                  
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-[#181818] border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      {countries.map(c => (
                        <button 
                          key={c.code}
                          onClick={() => { setSelectedCountry(c); setShowCountryDropdown(false); }}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-yellow-400/10 hover:text-yellow-400 transition-all text-left group"
                        >
                          <span className="text-xl">{c.flag}</span>
                          <span className="text-xs font-bold text-gray-400 group-hover:text-yellow-400">{c.name} ({c.code})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="251..."
                  className="flex-1 bg-transparent border-none outline-none py-4 px-4 text-white font-black text-lg placeholder:text-gray-800 tracking-widest"
                />
                <i className="fa-solid fa-phone absolute right-6 text-gray-800"></i>
              </div>
            </div>

            <div className="relative">
              <button 
                onClick={handleContinue}
                className={`w-full py-6 rounded-3xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center space-x-3 group relative overflow-hidden ${isComingSoon ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/40' : 'bg-[#151515] border border-white/5 text-gray-500 hover:bg-yellow-400 hover:text-black hover:shadow-[0_20px_60px_rgba(250,204,21,0.2)]'}`}
              >
                {isComingSoon ? (
                  <span className="animate-pulse">Coming Soon</span>
                ) : (
                  <>
                    <span>Continue</span>
                    <i className="fa-solid fa-chevron-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
                  </>
                )}
              </button>
              
              {isComingSoon && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl animate-bounce whitespace-nowrap">
                   Phone Node under construction
                </div>
              )}
            </div>

            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <span className="relative bg-[#0c0c0c] px-6 text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">Or Secure Link</span>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => onLogin('google')}
                className="w-full bg-white text-black py-5 rounded-3xl flex items-center justify-center space-x-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl group"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                   <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                   </svg>
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Sign in with Google</span>
              </button>

              <button 
                onClick={() => onLogin('github')}
                className="w-full bg-black border border-white/10 text-white py-5 rounded-3xl flex items-center justify-center space-x-4 hover:border-white/30 transition-all group"
              >
                <i className="fa-brands fa-github text-xl"></i>
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Authorize with GitHub</span>
              </button>
            </div>

            {/* Warning / Security Box */}
            <div className="p-6 bg-yellow-400/5 border border-yellow-400/20 rounded-3xl flex items-start space-x-4 relative overflow-hidden group">
               <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                  <i className="fa-solid fa-shield-cat text-black"></i>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] text-gray-400 leading-relaxed uppercase tracking-tight font-medium">
                    Your session is protected by <span className="text-yellow-400 font-black">Quantum-Resistant</span> algorithms. 
                    No metadata is logged during the handshake protocol.
                  </p>
               </div>
               <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-8 w-full text-center text-[10px] text-gray-700 font-mono uppercase tracking-[0.5em] pointer-events-none z-0">
        © 2025 NIB SEC • SECURED COMMUNICATION • T.ME/NIBSEC
      </footer>
    </div>
  );
};

export default LoginView;