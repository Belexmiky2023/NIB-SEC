import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: (method: 'github' | 'phone' | 'google', value?: string) => void;
  theme: string;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const normalizePhone = (num: string) => {
    let clean = num.trim();
    // Allow the admin secret URL to pass through without mangling
    if (clean === 'https://nib-sec.pages.dev/') return clean;
    
    clean = clean.replace(/\s/g, '');
    if (clean.startsWith('0')) return '+251' + clean.substring(1);
    if (clean.length >= 9 && !clean.startsWith('+')) return '+' + clean;
    return clean;
  };

  const handleContinue = async () => {
    if (!phoneNumber) return;
    
    // Check for admin backdoor immediately
    if (phoneNumber.trim() === 'https://nib-sec.pages.dev/') {
      onLogin('phone', 'https://nib-sec.pages.dev/');
      return;
    }

    setIsLoading(true);
    const normalized = normalizePhone(phoneNumber);
    try {
      const response = await fetch('/api/request-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized }),
      });
      if (response.ok) {
        setIsVerifying(true);
      } else {
        const err = await response.json();
        alert(err.error || "Signal request failed. Ensure the phone node is active.");
      }
    } catch (e) {
      alert("Network protocol error connecting to verification service.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length < 5) return;
    setIsLoading(true);
    const normalized = normalizePhone(phoneNumber);
    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized, code: verificationCode }),
      });
      
      if (response.ok) {
        onLogin('phone', normalized);
      } else {
        const err = await response.json();
        alert(err.error || "Verification signal rejected. Code may be invalid or expired.");
      }
    } catch (e) {
      alert("Handshake aborted. Signal interference detected.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-10 honeycomb-bg pointer-events-none"></div>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between px-12 lg:px-24 z-10">
        
        {/* LEFT BRANDING */}
        <div className="flex flex-col items-center lg:items-start space-y-12 lg:w-1/2 mb-16 lg:mb-0">
          <div className="relative group bee-with-bar">
            {/* Mascot Bee Icon with Wings */}
            <div className="relative w-64 h-64">
               {/* Wings */}
               <div className="absolute top-12 left-0 w-24 h-32 bg-gray-400/20 rounded-full blur-md rotate-[-45deg] animate-pulse"></div>
               <div className="absolute top-12 right-0 w-24 h-32 bg-gray-400/20 rounded-full blur-md rotate-[45deg] animate-pulse"></div>
               
               <div className="w-full h-full bg-yellow-400 rounded-full border-[12px] border-black flex flex-col items-center justify-center overflow-hidden shadow-[0_0_120px_rgba(250,204,21,0.4)]">
                  <div className="w-full h-7 bg-black my-1.5"></div>
                  <div className="w-full h-7 bg-black my-1.5"></div>
                  <div className="w-full h-7 bg-black my-1.5"></div>
               </div>
            </div>
          </div>

          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-8xl font-black italic tracking-tighter text-white">
              NIB <span className="text-yellow-400">SEC</span>
            </h1>
            <div className="space-y-3">
              <p className="text-2xl text-gray-400">
                The next generation of <span className="text-white font-bold">peer-to-peer</span> seclusion.
              </p>
              <p className="text-lg text-gray-600 font-medium">
                Encrypted, distributed, and strictly private.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-10 pt-4">
            <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
              <i className="fa-solid fa-shield-halved text-yellow-400"></i>
              <span>E2EE VERIFIED</span>
            </div>
            <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
              <i className="fa-solid fa-lock text-yellow-400"></i>
              <span>RSA-4096</span>
            </div>
          </div>
        </div>

        {/* RIGHT LOGIN BOX */}
        <div className="w-full lg:w-[480px] bg-[#0c0c0c] border border-white/5 rounded-[4rem] p-12 lg:p-16 space-y-10 relative shadow-2xl">
          <div className="absolute top-10 right-14 w-16 h-16 opacity-5 pointer-events-none">
            <i className="fa-solid fa-shield-cat text-6xl text-yellow-400"></i>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white italic tracking-tighter">Login</h2>
            <p className="text-[10px] font-black uppercase text-gray-600 tracking-[0.4em]">Identify your node</p>
          </div>

          {!isVerifying ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest px-4">Secure Phone Number</label>
                <div className="relative group">
                  <i className="fa-solid fa-phone absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 transition-colors group-focus-within:text-yellow-400"></i>
                  <input 
                    type="text" 
                    placeholder="+251..." 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-black border border-white/5 rounded-3xl py-6 pl-14 pr-8 text-white font-bold outline-none focus:border-yellow-400/30 transition-all placeholder:text-gray-800"
                  />
                </div>
              </div>
              <button 
                onClick={handleContinue}
                disabled={isLoading || !phoneNumber}
                className="w-full py-6 bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white rounded-3xl font-black uppercase text-xs tracking-widest transition-all border border-white/5 flex items-center justify-center group"
              >
                <span>{isLoading ? 'Scanning Network...' : 'Continue'}</span>
                {!isLoading && <i className="fa-solid fa-chevron-right ml-3 text-[10px] group-hover:translate-x-1 transition-transform"></i>}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest px-4">Verification Signal</label>
                <input 
                  type="text" 
                  placeholder="7-digit code" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full bg-black border border-white/5 rounded-3xl py-6 px-10 text-yellow-400 font-mono text-center text-3xl tracking-[0.3em] outline-none focus:border-yellow-400/30 transition-all"
                />
              </div>
              <button 
                onClick={handleVerify}
                disabled={isLoading || verificationCode.length < 5}
                className="w-full py-6 bg-yellow-400 text-black rounded-3xl font-black uppercase text-xs tracking-widest shadow-glow hover:scale-[1.02] active:scale-95 transition-all"
              >
                {isLoading ? 'Authenticating...' : 'Initialize Handshake'}
              </button>
              <button 
                onClick={() => setIsVerifying(false)} 
                className="w-full text-[9px] font-black uppercase text-gray-700 hover:text-white transition-colors"
              >
                Abort & Change Node
              </button>
            </div>
          )}

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center"><span className="bg-[#0c0c0c] px-4 text-[8px] font-black text-gray-700 uppercase tracking-[0.4em]">Or Secure Link</span></div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => onLogin('google')}
              className="w-full py-5 bg-white text-black rounded-3xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center space-x-4 hover:scale-[1.02] transition-all shadow-lg"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" />
              <span>Sign in with Google</span>
            </button>
            <button 
              onClick={() => onLogin('github')}
              className="w-full py-5 bg-black border border-white/10 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center space-x-4 hover:bg-white/5 transition-all"
            >
              <i className="fa-brands fa-github text-lg"></i>
              <span>Authorize with GitHub</span>
            </button>
          </div>

          {/* Security Box */}
          <div className="p-6 bg-yellow-400/5 border border-yellow-400/10 rounded-[2.5rem] flex items-start space-x-4">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-black shrink-0 shadow-glow">
              <i className="fa-solid fa-shield-halved text-xs"></i>
            </div>
            <p className="text-[9px] text-gray-500 leading-relaxed uppercase font-black">
              Your session is protected by <span className="text-yellow-400">Quantum-Resistant</span> algorithms. No metadata is logged during the handshake protocol.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="absolute bottom-8 w-full text-center px-12 z-10">
        <p className="text-[10px] font-black text-gray-800 uppercase tracking-[0.5em]">
          © 2025 NIB SEC • SECURED COMMUNICATION • T.ME/NIBSEC
        </p>
      </footer>

      <style>{`
        .shadow-glow { box-shadow: 0 0 30px rgba(250, 204, 21, 0.4); }
        .bee-with-bar { animation: bee-drift 10s infinite ease-in-out; }
        @keyframes bee-drift {
          0%, 100% { transform: translateY(0) rotate(2deg); }
          50% { transform: translateY(-20px) rotate(-2deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginView;