
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
  const [isChecking, setIsChecking] = useState(false);
  const [typedText, setTypedText] = useState('');

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const name = username.toLowerCase().replace('@', '');
    if (name.length < 3) return "HANDLE_TOO_SHORT";
    if (username === '@nibsec' || username === '@oryn') return "RESERVED_IDENTIFIER";
    return null;
  };

  const isValid = username.startsWith('@') && displayName.length > 2 && !validate();

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(250,204,21,0.05)_0%,_transparent_100%)]"></div>
      
      <div className="max-w-xl w-full glass rounded-[4rem] p-16 space-y-12 relative shadow-[0_0_120px_rgba(0,0,0,1)]">
        <div className="text-center space-y-3">
          <p className="text-[10px] font-mono text-yellow-400 uppercase tracking-[0.5em] h-4">{typedText}</p>
          <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter">Cipher <span className="text-yellow-400">Setup</span></h2>
        </div>

        <div className="flex flex-col items-center space-y-8">
           <div className="relative group">
              <div className="w-40 h-40 hexagon p-1.5 bg-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.3)]">
                 <img src={avatar} className="w-full h-full hexagon object-cover brightness-110" />
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
                type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                placeholder="Agent Name"
                className="w-full bg-black/50 border border-white/5 rounded-3xl py-6 px-10 outline-none focus:border-yellow-400 transition-all font-black text-white text-lg placeholder:text-gray-900"
              />
           </div>
           <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest px-4">Operative Handle</label>
              <input 
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/5 rounded-3xl py-6 px-10 outline-none focus:border-yellow-400 transition-all font-mono text-yellow-400 text-lg shadow-inner"
              />
           </div>

           <button 
             disabled={!isValid}
             onClick={() => onComplete(username, avatar, displayName)}
             className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.4em] text-xs transition-all ${isValid ? 'bg-yellow-400 text-black shadow-[0_20px_50px_rgba(250,204,21,0.3)] hover:scale-[1.03]' : 'bg-white/5 text-gray-800'}`}
           >Initialize Node</button>
        </div>
      </div>
    </div>
  );
};

export default SetupView;
