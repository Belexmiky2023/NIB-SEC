
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface SetupViewProps {
  initialData: User;
  onComplete: (username: string, avatar: string, displayName: string) => void;
}

const SetupView: React.FC<SetupViewProps> = ({ initialData, onComplete }) => {
  const [username, setUsername] = useState(initialData.username || '@');
  const [displayName, setDisplayName] = useState(initialData.displayName || '');
  const [avatar, setAvatar] = useState(initialData.avatarUrl);
  const [typedText, setTypedText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const fullText = "INITIALIZING NEURAL HANDSHAKE... GENERATING IDENTITY TOKEN...";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (displayName.trim().length >= 3) {
      const base = displayName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const randomId = Math.floor(100 + Math.random() * 899);
      const year = new Date().getFullYear().toString().slice(-2);
      
      const patterns = [
        `@${base}`,
        `@agent_${base}`,
        `@node_${base}`,
        `@operative_${base}`,
        `@hive_${base}`,
        `@cipher_${base}`,
        `@${base}_sec`,
        `@${base}${randomId}`,
        `@${base}_${year}`,
        `@nib_${base}`,
        `@shadow_${base}`,
        `@${base}_vault`,
        `@${base}_x`
      ];
      
      // Shuffle and take 6 unique suggestions
      const shuffled = patterns
        .sort(() => 0.5 - Math.random())
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 6);
        
      setSuggestions(shuffled);
    } else {
      setSuggestions([]);
    }
  }, [displayName]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getValidationError = () => {
    if (!username.startsWith('@')) return "Handle must start with @";
    if (/\s/.test(username)) return "Spaces are prohibited";
    const handlePart = username.slice(1);
    if (handlePart.length === 0) return "Enter handle after @";
    if (handlePart.length < 3) return "Minimum 3 chars";
    const validChars = /^[a-zA-Z0-9_]+$/;
    if (!validChars.test(handlePart)) return "Only letters, numbers, underscores";
    const reserved = ['@nibsec', '@oryn', '@admin', '@system', '@overseer', '@support', '@nib'];
    if (reserved.includes(username.toLowerCase())) return "Handle is reserved";
    return null;
  };

  const validationError = getValidationError();
  const isValid = !validationError && displayName.trim().length > 2;

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(250,204,21,0.05)_0%,_transparent_100%)]"></div>
      
      <div className="max-w-xl w-full glass rounded-[4rem] p-16 space-y-12 relative shadow-2xl">
        <div className="text-center space-y-3">
          <p className="text-[10px] font-mono text-yellow-400 uppercase tracking-[0.5em] h-4">{typedText}</p>
          <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter">Cipher <span className="text-yellow-400">Setup</span></h2>
        </div>

        <div className="flex flex-col items-center space-y-8">
           <div className="relative group">
              <div className="w-40 h-40 hexagon p-1.5 bg-yellow-400">
                 <img src={avatar} className="w-full h-full hexagon object-cover" />
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/80 hexagon opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                 <i className="fa-solid fa-cloud-arrow-up text-3xl text-yellow-400"></i>
                 <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">Protocol requires visual token</p>
        </div>

        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest px-4">Display Alias</label>
              <input 
                type="text" 
                value={displayName} 
                onChange={e => setDisplayName(e.target.value)} 
                placeholder="Agent Name" 
                className="w-full bg-black/50 border border-white/5 rounded-3xl py-6 px-10 outline-none focus:border-yellow-400 text-white font-black transition-all" 
              />
           </div>
           
           <div className="space-y-4">
              <div className="flex justify-between items-center px-4">
                <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Operative Handle</label>
                {validationError && <span className="text-[8px] font-bold text-red-500 uppercase animate-pulse">{validationError}</span>}
              </div>
              <input 
                type="text" 
                value={username} 
                onChange={e => {
                  const val = e.target.value;
                  if (!val.startsWith('@')) setUsername('@' + val.replace(/[^a-zA-Z0-9_]/g, ''));
                  else setUsername(val);
                }} 
                className={`w-full bg-black/50 border rounded-3xl py-6 px-10 outline-none font-mono text-lg transition-all ${validationError ? 'border-red-500/50 text-red-400' : 'border-white/5 text-yellow-400 focus:border-yellow-400'}`} 
              />
              
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 px-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  {suggestions.map(s => (
                    <button 
                      key={s} 
                      onClick={() => setUsername(s)} 
                      className="text-[9px] font-black uppercase bg-yellow-400/5 px-4 py-2 rounded-full hover:bg-yellow-400 hover:text-black transition-all text-gray-500 border border-yellow-400/10 hover:border-yellow-400"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
           </div>

           <button 
             disabled={!isValid} 
             onClick={() => onComplete(username, avatar, displayName.trim())} 
             className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.4em] text-xs transition-all ${isValid ? 'bg-yellow-400 text-black shadow-[0_15px_30px_rgba(250,204,21,0.2)] hover:scale-105 active:scale-95' : 'bg-white/5 text-gray-800 cursor-not-allowed'}`}
           >
             Initialize Node
           </button>
        </div>
      </div>
    </div>
  );
};

export default SetupView;
