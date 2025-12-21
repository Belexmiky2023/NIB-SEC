
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
  { name: 'Australia', code: '+61', flag: '🇦🇺', iso: 'AU' },
  { name: 'India', code: '+91', flag: '🇮🇳', iso: 'IN' },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬', iso: 'NG' },
  { name: 'Kenya', code: '+254', flag: '🇰🇪', iso: 'KE' },
  { name: 'South Africa', code: '+27', flag: '🇿🇦', iso: 'ZA' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷', iso: 'BR' },
  { name: 'Japan', code: '+81', flag: '🇯🇵', iso: 'JP' },
  { name: 'China', code: '+86', flag: '🇨🇳', iso: 'CN' },
  { name: 'Russia', code: '+7', flag: '🇷🇺', iso: 'RU' },
  { name: 'Italy', code: '+39', flag: '🇮🇹', iso: 'IT' },
  { name: 'Spain', code: '+34', flag: '🇪🇸', iso: 'ES' },
  { name: 'Netherlands', code: '+31', flag: '🇳🇱', iso: 'NL' },
  { name: 'Sweden', code: '+46', flag: '🇸🇪', iso: 'SE' },
  { name: 'Norway', code: '+47', flag: '🇳🇴', iso: 'NO' },
  { name: 'Turkey', code: '+90', flag: '🇹🇷', iso: 'TR' },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦', iso: 'SA' },
  { name: 'Egypt', code: '+20', flag: '🇪🇬', iso: 'EG' },
  { name: 'Mexico', code: '+52', flag: '🇲🇽', iso: 'MX' },
  { name: 'Argentina', code: '+54', flag: '🇦🇷', iso: 'AR' },
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

  // IP-based Country Detection
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data && data.country_code) {
          const detected = countries.find(c => c.iso === data.country_code);
          if (detected) {
            setSelectedCountry(detected);
          }
        }
      } catch (error) {
        console.warn('IP detection failed, using default country');
      }
    };
    detectCountry();
  }, []);

  useEffect(() => {
    if (isComingSoon) {
      const timer = setTimeout(() => setIsComingSoon(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isComingSoon]);

  const filteredCountries = useMemo(() => {
    return countries.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.code.includes(searchQuery)
    );
  }, [searchQuery]);

  const handleContinue = () => {
    if (phoneNumber === ADMIN_SECRET) {
      onLogin('phone', phoneNumber);
      return;
    }
    
    if (phoneNumber.trim().length > 5) {
      setIsComingSoon(true);
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

      {/* Left Column: Branding */}
      <div className="flex-1 max-w-xl space-y-10 z-20 text-center lg:text-left">
        <div className="relative inline-block group">
          <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-full border-[10px] border-black bg-yellow-400 flex flex-col items-center justify-center overflow-hidden shadow-[0_0_80px_rgba(250,204,21,0.4)] relative">
            <div className="absolute inset-0 flex flex-col justify-evenly">
              <div className="h-4 lg:h-6 bg-black w-full"></div>
              <div className="h-4 lg:h-6 bg-black w-full"></div>
              <div className="h-4 lg:h-6 bg-black w-full"></div>
            </div>
            <div className="z-10 bg-yellow-400 p-2 rounded-full border-4 border-black">
               <i className="fa-solid fa-bee text-black text-6xl lg:text-8xl"></i>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-7xl lg:text-9xl font-black tracking-tighter italic text-white leading-none">
            NIB <span className="text-yellow-400">SEC</span>
          </h1>
          <div className="space-y-2 max-w-md mx-auto lg:mx-0">
            <p className="text-lg lg:text-xl text-gray-400 font-medium">
              The next generation of <span className="text-white font-bold">peer-to-peer seclusion.</span>
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
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white italic">Login</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">Identify Your Node</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2">Secure Phone Number</label>
              <div className="relative flex items-center bg-[#111] border border-white/5 rounded-3xl p-2 focus-within:border-yellow-400/50 transition-all">
                <div className="relative">
                  <button 
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center space-x-2 px-4 py-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-transparent active:scale-95 min-w-[100px]"
                  >
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <span className="text-gray-400 font-bold">{selectedCountry.code}</span>
                    <i className="fa-solid fa-chevron-down text-[8px] text-gray-600"></i>
                  </button>
                  
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-[#181818] border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-2 border-b border-white/5">
                        <input 
                          type="text"
                          placeholder="Search country..."
                          autoFocus
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-xs outline-none text-white focus:border-yellow-400/40"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map(c => (
                            <button 
                              key={`${c.iso}-${c.code}`}
                              onClick={() => { setSelectedCountry(c); setShowCountryDropdown(false); setSearchQuery(''); }}
                              className="w-full flex items-center justify-between px-4 py-3 hover:bg-yellow-400/10 hover:text-yellow-400 transition-all text-left"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-xl">{c.flag}</span>
                                <span className="text-xs font-bold text-gray-400">{c.name}</span>
                              </div>
                              <span className="text-[10px] font-mono text-gray-600">{c.code}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-gray-600 text-[10px] uppercase font-black">No matches found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <input 
                  type="text" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter access code..."
                  className="flex-1 bg-transparent border-none outline-none py-4 px-4 text-white font-black text-lg placeholder:text-gray-800 tracking-widest"
                />
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
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl animate-bounce">
                   Phone Node under construction
                </div>
              )}
            </div>
            
            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <span className="relative bg-[#0c0c0c] px-6 text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">Or Secure Link</span>
            </div>

            <div className="space-y-4">
              <button onClick={() => onLogin('google')} className="w-full bg-white text-black py-5 rounded-3xl flex items-center justify-center space-x-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl font-black uppercase text-[11px] tracking-widest">
                <i className="fa-brands fa-google text-lg"></i>
                <span>Sign in with Google</span>
              </button>

              <button onClick={() => onLogin('github')} className="w-full bg-black border border-white/10 text-white py-5 rounded-3xl flex items-center justify-center space-x-4 hover:border-white/30 transition-all font-black uppercase text-[11px] tracking-widest">
                <i className="fa-brands fa-github text-xl"></i>
                <span>Authorize with GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
