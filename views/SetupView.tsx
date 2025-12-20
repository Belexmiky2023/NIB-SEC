
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface SetupViewProps {
  initialData: User;
  onComplete: (username: string, avatar: string) => void;
}

const SetupView: React.FC<SetupViewProps> = ({ initialData, onComplete }) => {
  const [username, setUsername] = useState('@');
  const [avatar, setAvatar] = useState(initialData.avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  // Mock database of taken usernames
  const takenUsernames = ['@nibsec', '@admin', '@root', '@bee', '@security'];

  useEffect(() => {
    if (username.length > 1) {
      setIsChecking(true);
      const timer = setTimeout(() => {
        const cleanName = username.toLowerCase();
        if (takenUsernames.includes(cleanName)) {
          setError('Already Existed.');
          setSuggestions([
            `${cleanName}_01`,
            `${cleanName}bee`,
            `nib_${cleanName.replace('@', '')}`,
            `${cleanName}179`,
            `@nibsec_${cleanName.replace('@', '')}`
          ]);
        } else if (!username.startsWith('@')) {
          setError('Username must start with @');
          setSuggestions([]);
        } else if (username.length < 4) {
          setError('Too short.');
          setSuggestions([]);
        } else {
          setError(null);
          setSuggestions([]);
        }
        setIsChecking(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [username]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isValid = username.length > 3 && username.startsWith('@') && !error && !isChecking;

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-neutral-900 border border-yellow-400/20 rounded-[40px] p-10 space-y-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/5 hexagon rotate-12"></div>
        
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-yellow-400">Profile Setup</h2>
          <p className="text-gray-500 text-sm">Initialize your secure operative ID.</p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="w-28 h-28 hexagon bg-neutral-800 border-2 border-yellow-400 overflow-hidden flex items-center justify-center group-hover:border-white transition-colors">
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <label className="absolute bottom-0 right-0 bg-yellow-400 text-black w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-colors border-4 border-neutral-900 shadow-xl">
              <i className="fa-solid fa-camera text-xs"></i>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500 px-2 font-bold">Username Identification</label>
            <div className="relative">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className={`w-full bg-neutral-800 border ${error ? 'border-red-500' : 'border-neutral-700 focus:border-yellow-400'} rounded-2xl py-4 px-6 outline-none transition-all font-mono text-yellow-400`}
              />
              {isChecking && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <i className="fa-solid fa-circle-notch fa-spin text-yellow-400"></i>
                </div>
              )}
            </div>
            
            {error && (
              <div className="px-2 space-y-2">
                <p className="text-red-500 text-xs font-bold">{error}</p>
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map(s => (
                      <button 
                        key={s}
                        onClick={() => setUsername(s)}
                        className="text-[10px] bg-neutral-800 border border-yellow-400/30 text-yellow-400 px-2 py-1 rounded-md hover:border-yellow-400"
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
            onClick={() => onComplete(username, avatar)}
            className={`w-full py-4 rounded-2xl font-bold transition-all ${
              isValid 
                ? 'bg-yellow-400 text-black hover:bg-white shadow-[0_0_20px_rgba(250,204,21,0.2)]' 
                : 'bg-neutral-800 text-gray-600 cursor-not-allowed'
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
