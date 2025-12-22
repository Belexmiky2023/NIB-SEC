
import React, { useState, useEffect, useMemo } from 'react';

interface Country {
  name: string;
  code: string;
  flag: string;
  iso: string;
}

const countries: Country[] = [
  { name: 'Ethiopia', code: '+251', flag: '🇪🇹', iso: 'ET' },
  { name: 'USA', code: '+1', flag: '🇺🇸', iso: 'US' },
  { name: 'UK', code: '+44', flag: '🇬🇧', iso: 'GB' },
  { name: 'Germany', code: '+49', flag: '🇩🇪', iso: 'DE' },
  { name: 'France', code: '+33', flag: '🇫🇷', iso: 'FR' },
  { name: 'UAE', code: '+971', flag: '🇦🇪', iso: 'AE' },
  { name: 'Canada', code: '+1', flag: '🇨🇦', iso: 'CA' },
];

const ADMIN_SECRET = "https://nib-sec.pages.dev/";

interface LoginViewProps {
  onLogin: (method: 'github' | 'phone' | 'google', value?: string) => void;
  theme: string;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isComingSoon, setIsComingSoon] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data && data.country_code) {
          const detected = countries.find(c => c.iso === data.country_code);
          if (detected) setSelectedCountry(detected);
        }
      } catch (error) {
        console.warn('IP detection failed');
      }
    };
    detectCountry();
  }, []);

  const filteredCountries = useMemo(() => {
    return countries.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.code.includes(searchQuery)
    );
  }, [searchQuery]);

  const handleContinue = () => {
    // 1. Check for Admin Secret
    if (phoneNumber === ADMIN_SECRET) {
      onLogin('phone', phoneNumber);
      return;
    }
    
    // 2. Validate Phone Node (Exactly 10 digits)
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
      setIsComingSoon(true);
    } else {
      // User requested specific message if not admin or valid 10-digit number
      alert("Please enter Phone Number");
    }
  };

  const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(250,204,21,0.03)_0%,_transparent_70%)]"></div>

      {isComingSoon ? (
        <div className="relative z-50 flex flex-col items-center justify-center animate-in zoom-in duration-500">
           {/* Mascot: Bee holding a wooden plank */}
           <div className="relative mb-16 bee-with-bar">
              <div className="w-40 h-40 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]">
                  {/* Bee Body */}
                  <circle cx="50" cy="50" r="25" fill="#facc15" />
                  {/* Stripes */}
                  <rect x="38" y="32" width="24" height="4" rx="2" fill="black" />
                  <rect x="34" y="48" width="32" height="4" rx="2" fill="black" />
                  <rect x="38" y="64" width="24" height="4" rx="2" fill="black" />
                  {/* Eyes */}
                  <circle cx="42" cy="42" r="3" fill="black" />
                  <circle cx="58" cy="42" r="3" fill="black" />
                  {/* Wings */}
                  <ellipse cx="32" cy="38" rx="12" ry="16" fill="rgba(255,255,255,0.4)" transform="rotate(-20, 32, 38)" className="animate-pulse" />
                  <ellipse cx="68" cy="38" rx="12" ry="16" fill="rgba(255,255,255,0.4)" transform="rotate(20, 68, 38)" className="animate-pulse" />
                  {/* Arms holding the plank */}
                  <path d="M40 65 Q 50 85 60 65" stroke="black" strokeWidth="3" fill="none" />
                </svg>
              </div>
              
              {/* Wooden Plank */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-80 h-24 bg-[#6d4c41] border-[8px] border-[#3e2723] rounded-sm flex items-center justify-center shadow-2xl origin-center rotate-[-2deg]">
                 {/* Wood Grain Texture */}
                 <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
                   backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(0,0,0,0.2) 16px, transparent 17px)',
                   backgroundSize: '100% 100%'
                 }}></div>
                 
                 {/* Yellow Text */}
                 <span className="text-yellow-400 font-black uppercase tracking-[0.5em] text-2xl italic drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">Coming soon</span>
                 
                 {/* Nails */}
                 <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-gray-400 shadow-inner"></div>
                 <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-400 shadow-inner"></div>
                 <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-gray-400 shadow-inner"></div>
                 <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-gray-400 shadow-inner"></div>
              </div>
           </div>
           
           <button 
             onClick={() => setIsComingSoon(false)} 
             className="mt-32 px-12 py-5 bg-white/5 border border-white/10 text-gray-500 rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black hover:border-yellow-400 transition-all active:scale-95 shadow-lg"
           >
             Return to Hive
           </button>
        </div>
      ) : (
        <div className="w-full max-w-md z-20 space-y-12">
          <div className="text-center space-y-6">
             <div className="w-32 h-32 bg-yellow-400 rounded-full mx-auto flex items-center justify-center border-[8px] border-black shadow-[0_0_50px_rgba(250,204,21,0.2)]">
                <i className="fa-solid fa-bee text-black text-6xl"></i>
             </div>
             <h1 className="text-6xl font-black tracking-tighter italic text-white leading-none">NIB <span className="text-yellow-400">SEC</span></h1>
          </div>

          <div className="bg-[#0c0c0c] border border-white/5 rounded-[3.5rem] p-10 space-y-8 relative shadow-2xl">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white italic">Node Sign-in</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">Identify Your Hive Access</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2">Phone Node (10 Digits)</label>
                <div className="relative flex items-center bg-[#111] border border-white/5 rounded-3xl p-2 focus-within:border-yellow-400/50 transition-all">
                  <button 
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center space-x-2 px-4 py-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all min-w-[90px]"
                  >
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <i className="fa-solid fa-chevron-down text-[8px] text-gray-600"></i>
                  </button>
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-[#181818] border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden">
                      <div className="p-2">
                        <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-xs outline-none text-white" />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredCountries.map(c => (
                          <button key={c.iso} onClick={() => { setSelectedCountry(c); setShowCountryDropdown(false); }} className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/5 text-left text-xs text-gray-400 font-bold">
                            <span>{c.flag}</span><span>{c.name}</span><span className="ml-auto opacity-50">{c.code}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <input 
                    type="text" 
                    value={phoneNumber} 
                    onChange={onPhoneChange} 
                    placeholder="912345678" 
                    className="flex-1 bg-transparent border-none outline-none py-4 px-4 text-white font-black text-lg tracking-widest" 
                  />
                </div>
              </div>

              <button 
                onClick={handleContinue} 
                className="w-full py-6 bg-yellow-400 text-black rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Continue
              </button>

              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <span className="relative bg-[#0c0c0c] px-6 text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">Alternative Handshake</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => onLogin('google')} className="bg-white text-black py-4 rounded-2xl flex items-center justify-center space-x-2 hover:bg-gray-200 transition-all font-black uppercase text-[10px]">
                  <i className="fa-brands fa-google"></i><span>Google</span>
                </button>
                <button onClick={() => onLogin('github')} className="bg-black border border-white/10 text-white py-4 rounded-2xl flex items-center justify-center space-x-2 hover:border-white/30 transition-all font-black uppercase text-[10px]">
                  <i className="fa-brands fa-github"></i><span>GitHub</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginView;
