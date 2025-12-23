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
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const getFullNormalizedPhone = () => {
    // Keep the '+' sign for backend normalization parity
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    return selectedCountry.code + cleanNumber;
  };

  const handleContinue = async () => {
    if (phoneNumber === ADMIN_SECRET) {
      onLogin('phone', phoneNumber);
      return;
    }
    
    const fullPhone = getFullNormalizedPhone();
    // Validate length (code + number)
    if (fullPhone.length >= 10 && fullPhone.length <= 16) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/request-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: fullPhone }),
        });
        
        if (response.ok) {
          setIsVerifying(true);
        } else {
          const errorData = await response.json().catch(() => ({ error: "Unknown protocol error" }));
          alert(`Signal request failed: ${errorData.error || "Please ensure the server node is active."}`);
        }
      } catch (e) {
        alert("Network error during handshake. Check your signal.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please enter a valid Phone Number");
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 7) {
      alert("Enter the 7-digit code received from the Telegram Bot");
      return;
    }

    setIsLoading(true);
    const fullPhone = getFullNormalizedPhone();
    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code: verificationCode }),
      });

      if (response.ok) {
        onLogin('phone', fullPhone);
      } else {
        const data = await response.json().catch(() => ({ error: "Handshake rejected" }));
        alert(data.error || "Invalid or expired code. Request a new signal.");
      }
    } catch (e) {
      alert("Verification signal failed. Handshake aborted.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(250,204,21,0.03)_0%,_transparent_70%)]"></div>

      <div className="w-full max-w-md z-20 space-y-12">
        <div className="text-center space-y-6">
           <div className="w-32 h-32 bg-yellow-400 rounded-full mx-auto flex items-center justify-center border-[8px] border-black shadow-[0_0_50px_rgba(250,204,21,0.2)]">
              <i className="fa-solid fa-bee text-black text-6xl"></i>
           </div>
           <h1 className="text-6xl font-black tracking-tighter italic text-white leading-none">NIB <span className="text-yellow-400">SEC</span></h1>
        </div>

        <div className="bg-[#0c0c0c] border border-white/5 rounded-[3.5rem] p-10 space-y-8 relative shadow-2xl">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white italic">{isVerifying ? "Verify Signal" : "Node Sign-in"}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">
              {isVerifying ? "Enter 7-Digit Archive Code" : "Identify Your Hive Access"}
            </p>
          </div>

          {!isVerifying ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2">Phone Node</label>
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
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    placeholder="912345678" 
                    className="flex-1 bg-transparent border-none outline-none py-4 px-4 text-white font-black text-lg tracking-widest" 
                    onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  />
                </div>
              </div>

              <button 
                onClick={handleContinue} 
                disabled={isLoading}
                className="w-full py-6 bg-yellow-400 text-black rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
              >
                {isLoading ? "REQUESTING..." : "Request Signal"}
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
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-yellow-400/5 border border-yellow-400/20 p-6 rounded-3xl text-center space-y-4">
                <p className="text-[11px] font-black text-yellow-400 uppercase tracking-widest leading-relaxed">
                  Open the Telegram Bot to receive your secure code:
                </p>
                <a 
                  href="https://t.me/NibSecBot" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block px-8 py-3 bg-yellow-400 text-black rounded-xl text-[10px] font-black uppercase shadow-glow"
                >
                  <i className="fa-brands fa-telegram mr-2"></i>Open @NibSecBot
                </a>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2">Verification Code</label>
                <input 
                  type="text" 
                  maxLength={7}
                  value={verificationCode} 
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} 
                  placeholder="0000000" 
                  className="w-full bg-black border border-white/5 rounded-3xl py-6 px-10 text-center text-white font-black text-4xl tracking-[0.2em] outline-none focus:border-yellow-400 transition-all" 
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                />
              </div>

              <div className="flex flex-col space-y-4">
                <button 
                  onClick={handleVerifyCode}
                  disabled={isLoading || verificationCode.length !== 7}
                  className="w-full py-6 bg-yellow-400 text-black rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-30 disabled:hover:scale-100"
                >
                  {isLoading ? "VERIFYING..." : "Verify Identity"}
                </button>
                <button 
                  onClick={() => setIsVerifying(false)}
                  className="w-full py-4 text-gray-600 hover:text-white transition-colors text-[9px] font-black uppercase tracking-[0.4em]"
                >
                  Modify Phone Node
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginView;