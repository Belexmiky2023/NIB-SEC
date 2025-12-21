
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
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const takenUsernames = [
    '@nibsec', '@nibsecoffical', '@nibsecurity', 
    '@oryn', '@oryn179', '@179oryn'
  ];

  useEffect(() => {
    const cleanUsername = username.toLowerCase().trim();
    if (cleanUsername.length > 1) {
      setIsChecking(true);
      const timer = setTimeout(() => {
        const namePart = cleanUsername.replace('@', '');
        
        if (takenUsernames.includes(cleanUsername)) {
          setError('Username already exists.');
          setSuggestions([
            `@nib_${namePart}`,
            `@${namePart}_sec`,
            `@v_${namePart}`,
            `@${namePart}_bee`
          ]);
        } else if (!username.startsWith('@')) {
          setError('Username must start with @');
          setSuggestions([]);
        } else if (/^\d+$/.test(namePart)) {
          setError('User name can not be number');
          setSuggestions([
            `@user_${namePart}`,
            `@bee_${namePart}`,
            `@nib${namePart}`
          ]);
        } else if (username.length < 4) {
          setError('Username is too short.');
          setSuggestions([]);
        } else {
          setError(null);
          setSuggestions([]);
        }
        setIsChecking(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [username]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isValid = username.length > 3 && username.startsWith('@') && displayName.trim().length > 1 && !error && !isChecking;

  return (
    <div className="h-full flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl">
      <div className="max-w-md w-full bg-[#0a0a0a] border border-yellow-400/20 rounded-[48px] p-10 space-y-8 relative overflow-hidden shadow-[0_0_100px_rgba(250,204,21,0.1)]">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black text-yellow-400 uppercase tracking-tighter italic">Identity Setup</h2>
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Establish your encrypted handle</p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="w-32 h-32 hexagon bg-neutral-900 border-2 border-yellow-400/30 overflow-hidden flex items-center justify-center group-hover:border-yellow-400 transition-all shadow-2xl">
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <label className="absolute bottom-1 right-1 bg-yellow-400 text-black w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-all border-4 border-[#0a0a0a]">
              <i className="fa-solid fa-camera text-sm"></i>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.3em] text-gray-600 px-4 font-black">Display Name</label>
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-black border border-white/10 rounded-[2rem] py-4 px-8 outline-none focus:border-yellow-400/50 transition-all font-bold text-white placeholder:text-gray-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.3em] text-gray-600 px-4 font-black">Username Address</label>
            <div className="relative">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className={`w-full bg-black border ${error ? 'border-red-500' : 'border-white/10 focus:border-yellow-400'} rounded-[2rem] py-4 px-8 outline-none transition-all font-mono text-yellow-400`}
              />
              {isChecking && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <i className="fa-solid fa-circle-notch fa-spin text-yellow-400"></i>
                </div>
              )}
            </div>
            
            {error && (
              <div className="px-4 space-y-3">
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map(s => (
                      <button 
                        key={s}
                        onClick={() => setUsername(s)}
                        className="text-[9px] font-bold bg-yellow-400/5 border border-yellow-400/20 text-yellow-400 px-3 py-1.5 rounded-full hover:bg-yellow-400 hover:text-black transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            disabled={!isValid}
            onClick={() => onComplete(username, avatar, displayName)}
            className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs transition-all ${
              isValid 
                ? 'bg-yellow-400 text-black hover:shadow-[0_15px_40px_rgba(250,204,21,0.3)]' 
                : 'bg-neutral-900 text-gray-700 cursor-not-allowed border border-white/5'
            }`}
          >
            Launch Interface
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupView;
