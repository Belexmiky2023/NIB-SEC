
import React, { useState, useEffect, useRef } from 'react';
import { User, Chat, Message, Theme } from '../types';

interface MainViewProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  onStartCall: () => void;
  onSignOut: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const initialMockChats: Chat[] = [
  { id: 'nib_official', name: 'NIB SEC', type: 'channel', avatar: 'https://i.ibb.co/3ykXF4K/nib-logo.png', unreadCount: 1, membersCount: 25800, lastMessage: 'Operational security update.', isPinned: true, isVerified: true },
  { id: 'saved', name: 'Saved Messages', type: 'saved', avatar: 'https://cdn-icons-png.flaticon.com/512/566/566412.png', unreadCount: 0, lastMessage: 'Cloud storage encrypted.' },
  { id: '2', name: 'The Colony', type: 'group', avatar: 'https://picsum.photos/105', unreadCount: 0, membersCount: 12, lastMessage: 'Check the new node list.' },
  { id: '3', name: '@the_queen', type: 'direct', avatar: 'https://picsum.photos/103', unreadCount: 1, lastMessage: 'Status report?' },
];

const MainView: React.FC<MainViewProps> = ({ user, setUser, onStartCall, onSignOut, theme, toggleTheme }) => {
  const [chats, setChats] = useState<Chat[]>(initialMockChats);
  const [activeChatId, setActiveChatId] = useState<string | null>('nib_official');
  const [messageInput, setMessageInput] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', senderId: 'nib_official', text: 'Operational security is our top priority Operative.', timestamp: Date.now() - 3600000 },
    { id: 'm2', senderId: 'user', text: 'Acknowledged. Node is online.', timestamp: Date.now() - 3000000 },
  ]);

  // Fix: Define activeChat by finding the current active chat object from the chats list
  const activeChat = chats.find(c => c.id === activeChatId);

  // Wallet State
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletStep, setWalletStep] = useState<'balance' | 'buy_form' | 'telebirr_popup' | 'waiting'>('balance');
  const [buyQuantity, setBuyQuantity] = useState('50');

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState(user.displayName);
  const [tempUsername, setTempUsername] = useState(user.username);
  const [tempAvatar, setTempAvatar] = useState(user.avatarUrl);

  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sessions = JSON.parse(localStorage.getItem('nib_active_sessions') || '[]');
    const session = { 
      id: user.id, 
      username: user.username, 
      lastAction: 'Node Online', 
      timestamp: Date.now(),
      avatar: user.avatarUrl
    };
    const filtered = sessions.filter((s: any) => s.id !== user.id);
    localStorage.setItem('nib_active_sessions', JSON.stringify([session, ...filtered].slice(0, 10)));
  }, [user]);

  const playSendSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || isTransmitting) return;
    setIsTransmitting(true);
    playSendSound();
    setTimeout(() => {
      const newMessage: Message = { id: 'm-' + Date.now(), senderId: 'user', text: messageInput.trim(), timestamp: Date.now() };
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      setIsTransmitting(false);
    }, 500);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTempAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = () => {
    setUser(prev => prev ? { ...prev, displayName: tempDisplayName, username: tempUsername, avatarUrl: tempAvatar } : null);
    setShowSettings(false);
  };

  const renderChatItem = (chat: Chat) => (
    <button 
      key={chat.id}
      onClick={() => setActiveChatId(chat.id)}
      className={`w-full flex items-center space-x-3 p-4 rounded-[2.5rem] transition-all relative group ${
        activeChatId === chat.id 
        ? 'bg-yellow-400/10 border border-yellow-400/20 shadow-lg' 
        : 'hover:bg-white/5'
      }`}
    >
      <div className="relative shrink-0">
        <div className={`w-14 h-14 hexagon p-0.5 ${chat.isPinned ? 'bg-yellow-400' : 'bg-neutral-800'}`}>
          <img src={chat.avatar} alt={chat.name} className="w-full h-full hexagon object-cover" />
        </div>
        {chat.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
            {chat.unreadCount}
          </span>
        )}
      </div>
      <div className="hidden lg:flex flex-col items-start flex-1 min-w-0">
        <div className="flex justify-between w-full">
          <span className="font-black text-sm truncate flex items-center tracking-tight">
            {chat.name}
            {chat.isVerified && <i className="fa-solid fa-circle-check text-yellow-400 text-[10px] ml-1.5"></i>}
          </span>
          <span className="text-[10px] text-gray-600 font-bold">12:45</span>
        </div>
        <p className="text-xs text-gray-500 truncate w-full font-medium">{chat.id === 'nib_official' ? '@Nibsec' : chat.lastMessage}</p>
      </div>
    </button>
  );

  return (
    <div className="h-full flex overflow-hidden relative">
      
      {/* WALLET MODAL OVERHAUL */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[300] flex items-center justify-center p-6" onClick={() => {setShowWalletModal(false); setWalletStep('balance');}}>
          <div className="w-full max-w-xl bg-neutral-900 border border-white/5 rounded-[4rem] p-12 space-y-8 animate-in zoom-in duration-300 relative overflow-hidden" onClick={e => e.stopPropagation()}>
             <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400/20 shadow-[0_0_20px_rgba(250,204,21,0.2)]"></div>
             
             {walletStep === 'balance' && (
                <div className="space-y-10">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <i className="fa-solid fa-vault text-yellow-400 text-xl"></i>
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter">Cipher Vault</h4>
                      </div>
                      <button onClick={() => setShowWalletModal(false)} className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-red-500 transition-colors"><i className="fa-solid fa-xmark"></i></button>
                   </div>
                   <div className="bg-black/40 rounded-[3rem] p-12 border border-white/5 text-center space-y-6 relative group overflow-hidden">
                      <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <i className="fa-solid fa-bee text-7xl text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)] animate-bounce"></i>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Current Liquidity</p>
                        <h2 className="text-6xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.2)]">{user.walletBalance} <span className="text-xl text-white/50 tracking-widest uppercase">NIB</span></h2>
                      </div>
                      <button 
                        onClick={() => setWalletStep('buy_form')}
                        className="w-full py-6 bg-yellow-400 text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_50px_rgba(250,204,21,0.3)]"
                      >
                        BUY NIB
                      </button>
                   </div>
                </div>
             )}

             {walletStep === 'buy_form' && (
               <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between">
                     <button onClick={() => setWalletStep('balance')} className="text-yellow-400 hover:text-white transition-colors"><i className="fa-solid fa-arrow-left"></i></button>
                     <h4 className="text-lg font-black uppercase italic tracking-widest">Signal Acquisition</h4>
                     <div className="w-6"></div>
                  </div>
                  <div className="space-y-6 bg-black/40 p-10 rounded-[3rem] border border-white/5">
                     <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black px-4">Quantity (Minimum 50 NIB)</label>
                        <div className="relative">
                           <input 
                             type="number" 
                             min="50"
                             value={buyQuantity}
                             onChange={(e) => setBuyQuantity(e.target.value)}
                             className="w-full bg-black border border-white/10 rounded-[2.5rem] py-6 px-10 outline-none focus:border-yellow-400 text-4xl font-black text-yellow-400" 
                           />
                           <i className="fa-solid fa-bee absolute right-10 top-1/2 -translate-y-1/2 text-gray-800 text-2xl"></i>
                        </div>
                     </div>
                     <div className="flex justify-between items-center px-4">
                        <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Rate</span>
                        <span className="text-sm font-black text-white">1 NIB = 1 ETB</span>
                     </div>
                     <div className="bg-yellow-400/5 p-6 rounded-3xl border border-yellow-400/10 flex justify-between items-center">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Cost</p>
                        <p className="text-3xl font-black text-white">{buyQuantity} ETB</p>
                     </div>
                     <button 
                        disabled={parseInt(buyQuantity) < 50}
                        onClick={() => setWalletStep('telebirr_popup')}
                        className={`w-full py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all shadow-xl ${parseInt(buyQuantity) >= 50 ? 'bg-yellow-400 text-black hover:bg-white' : 'bg-neutral-800 text-gray-600 cursor-not-allowed'}`}
                      >
                        BUY
                      </button>
                  </div>
               </div>
             )}

             {walletStep === 'telebirr_popup' && (
                <div className="space-y-10 animate-in zoom-in duration-500">
                   <div className="text-center space-y-4">
                      <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(37,99,235,0.4)] border-4 border-white/10 group">
                         <i className="fa-solid fa-mobile-screen text-white text-4xl group-hover:scale-110 transition-transform"></i>
                      </div>
                      <h4 className="text-2xl font-black tracking-tighter uppercase italic text-white">Telebirr Gateway</h4>
                   </div>
                   <div className="bg-[#0c0c04] p-10 rounded-[3.5rem] border-2 border-yellow-400/40 space-y-8 relative overflow-hidden shadow-[0_0_80px_rgba(250,204,21,0.2)]">
                      {/* Honey Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent pointer-events-none"></div>
                      
                      <div className="space-y-6 relative z-10 text-center">
                         <div className="space-y-2">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Phone No</p>
                            <p className="text-4xl font-mono font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]">0978366565</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Recipient Name</p>
                            <p className="text-2xl font-black text-white uppercase tracking-wider">Alemseged</p>
                         </div>
                      </div>
                      
                      <div className="pt-4 text-center">
                         <p className="text-[10px] text-yellow-400 font-black uppercase tracking-[0.25em] animate-pulse drop-shadow-[0_0_8px_rgba(250,204,21,1)]">
                            Send A transaction Screenshot
                         </p>
                      </div>
                   </div>
                   <div className="flex flex-col space-y-4">
                      <button 
                        onClick={() => setWalletStep('waiting')}
                        className="w-full py-6 bg-yellow-400 text-black rounded-[2.5rem] font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-2xl"
                      >
                        DONE
                      </button>
                      <a 
                        href="https://t.me/oryn179" 
                        target="_blank" 
                        className="w-full py-4 border border-white/5 rounded-[2rem] text-center text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all"
                      >
                        Contact via Telegram
                      </a>
                   </div>
                </div>
             )}

             {walletStep === 'waiting' && (
                <div className="text-center space-y-10 animate-in fade-in duration-700">
                   <div className="relative py-12">
                      <i className="fa-solid fa-circle-notch fa-spin text-8xl text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.3)]"></i>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <i className="fa-solid fa-bee text-2xl text-white"></i>
                      </div>
                   </div>
                   <div className="space-y-6 px-4">
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter">Handshake Verification</h3>
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                         It will take min 3hrs - max 3 Business Days for our nodes to confirm the transfer.
                      </p>
                      <div className="space-y-2 pt-4 border-t border-white/5">
                         <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">
                           If your transaction does not appear within 3days, Call us
                         </p>
                         <p className="text-lg font-black text-yellow-400 tracking-widest">+251978366565</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setShowWalletModal(false)}
                     className="w-full py-6 bg-white/5 border border-white/10 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                   >
                     CLOSE TERMINAL
                   </button>
                </div>
             )}
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[400] flex items-center justify-center p-6">
           <div className="w-full max-w-lg bg-[#0a0a0a] border border-yellow-400/20 rounded-[4rem] p-12 space-y-10 animate-in zoom-in duration-300 relative">
              <div className="text-center">
                 <h2 className="text-3xl font-black text-yellow-400 uppercase italic tracking-tighter">Terminal Settings</h2>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                 <div className="relative group cursor-pointer">
                    <div className="w-32 h-32 hexagon border-2 border-yellow-400 p-1 bg-neutral-900 shadow-2xl">
                       <img src={tempAvatar} className="w-full h-full hexagon object-cover" />
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 hexagon transition-opacity">
                       <i className="fa-solid fa-camera text-white text-xl"></i>
                       <input type="file" className="hidden" onChange={handleAvatarChange} />
                    </label>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest px-4">Display Name</label>
                    <input 
                      type="text" 
                      value={tempDisplayName} 
                      onChange={e => setTempDisplayName(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-2xl py-4 px-8 outline-none focus:border-yellow-400 font-bold text-white shadow-inner" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest px-4">Username Address</label>
                    <input 
                      type="text" 
                      value={tempUsername} 
                      onChange={e => setTempUsername(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-2xl py-4 px-8 outline-none focus:border-yellow-400 font-mono text-yellow-400 shadow-inner" 
                    />
                 </div>
              </div>

              <div className="flex space-x-4 pt-4">
                 <button onClick={() => setShowSettings(false)} className="flex-1 py-5 border border-white/10 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest text-gray-600 hover:text-white transition-all">Cancel</button>
                 <button onClick={saveSettings} className="flex-1 py-5 bg-yellow-400 text-black rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-white transition-all">Save Changes</button>
              </div>
           </div>
        </div>
      )}

      {/* Main Sidebar */}
      <div className="w-24 lg:w-96 border-r border-white/5 bg-black flex flex-col z-20">
        <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
           <button onClick={onSignOut} className="w-14 h-14 rounded-3xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 flex flex-col items-center justify-center space-y-1.5 group transition-all" title="SIGN OUT">
              <div className="w-7 h-0.5 bg-current transition-all"></div>
              <div className="w-8 h-0.5 bg-current"></div>
              <div className="w-6 h-0.5 bg-current transition-all"></div>
           </button>
           <span className="hidden lg:block font-black text-3xl text-yellow-400 tracking-tighter italic drop-shadow-[0_0_10px_rgba(250,204,21,0.2)]">NIB SEC</span>
        </div>

        {/* Integrated Profile Section */}
        <div className="p-8 border-b border-white/5 bg-[#050505] relative overflow-hidden shrink-0">
           <div className="absolute top-0 right-0 opacity-10 pointer-events-none bee-moving">
              <i className="fa-solid fa-bee text-[120px] text-yellow-400"></i>
           </div>
           
           <div className="relative z-10 flex flex-col space-y-6">
              <div className="flex items-start justify-between">
                 <div className="w-16 h-16 hexagon p-1 bg-yellow-400/20 shadow-2xl relative cursor-pointer group" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                    <img src={user.avatarUrl} className="w-full h-full hexagon object-cover" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 text-black rounded-full flex items-center justify-center text-[10px] border-2 border-black group-hover:scale-110 transition-transform shadow-lg">
                       <i className={`fa-solid ${showProfileDropdown ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                    </div>
                 </div>
                 <div className="flex flex-col items-end space-y-2">
                    <span className="text-[7px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full border border-red-500/20 font-black animate-pulse uppercase tracking-widest">Under Maintenance</span>
                    <button onClick={() => {setShowWalletModal(true); setWalletStep('balance');}} className="flex items-center space-x-2 text-[10px] text-yellow-400/80 font-black uppercase tracking-widest hover:text-yellow-400 transition-colors group">
                       <i className="fa-solid fa-bee group-hover:scale-110 transition-transform"></i>
                       <span>Vault: {user.walletBalance} NIB</span>
                    </button>
                 </div>
              </div>

              <div>
                 <h3 className="font-black text-lg tracking-tighter uppercase">{user.displayName}</h3>
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">{user.username}</p>
              </div>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="animate-in slide-in-from-top-2 duration-200 grid grid-cols-1 gap-2">
                   <button onClick={() => {setShowSettings(true); setShowProfileDropdown(false);}} className="w-full flex items-center space-x-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-yellow-400/40 transition-all text-left group">
                      <i className="fa-solid fa-gear text-gray-600 group-hover:text-yellow-400 text-sm"></i>
                      <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white">Settings</span>
                   </button>
                   <button className="w-full flex items-center space-x-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-yellow-400/40 transition-all text-left group">
                      <i className="fa-solid fa-user-plus text-gray-600 group-hover:text-yellow-400 text-sm"></i>
                      <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white">Add Account</span>
                   </button>
                </div>
              )}
           </div>
        </div>

        {/* Improved Create Buttons */}
        <div className="px-6 py-4 grid grid-cols-2 gap-3 shrink-0">
           <button className="py-4 bg-white/5 hover:bg-yellow-400/10 border border-white/5 hover:border-yellow-400/40 rounded-2xl transition-all flex flex-col items-center justify-center space-y-2 group shadow-lg">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                 <i className="fa-solid fa-bullhorn text-gray-500 group-hover:text-yellow-400 text-sm"></i>
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 group-hover:text-white">Create Channel</span>
           </button>
           <button className="py-4 bg-white/5 hover:bg-yellow-400/10 border border-white/5 hover:border-yellow-400/40 rounded-2xl transition-all flex flex-col items-center justify-center space-y-2 group shadow-lg">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                 <i className="fa-solid fa-users text-gray-500 group-hover:text-yellow-400 text-sm"></i>
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 group-hover:text-white">Create Group</span>
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-2 custom-scrollbar">
           {chats.map(renderChatItem)}
        </div>
      </div>

      {/* Main Chat Content */}
      <div className="flex-1 flex flex-col relative bg-black/40">
        <div className="h-24 lg:h-28 border-b border-white/5 bg-black/60 backdrop-blur-3xl px-12 flex items-center justify-between z-10 shrink-0 shadow-2xl">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 hexagon p-0.5 bg-white/10 relative shadow-2xl">
              <img src={activeChat?.avatar} className="w-full h-full hexagon object-cover" />
            </div>
            <div>
              <div className="font-black text-2xl lg:text-3xl tracking-tighter flex items-center uppercase text-white">
                {activeChat?.name}
                {activeChat?.isVerified && (
                   <i className="fa-solid fa-circle-check text-yellow-400 text-sm ml-3 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"></i>
                )}
              </div>
              <div className="flex items-center space-x-2">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                 <p className="text-[11px] text-gray-500 uppercase tracking-[0.3em] font-black">ACTIVE NODE</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <button onClick={toggleTheme} className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 hover:border-yellow-400/40 flex items-center justify-center transition-all text-yellow-400 shadow-xl group">
                <i className={`fa-solid ${theme === 'night' ? 'fa-sun' : 'fa-moon'} text-xl group-hover:scale-110 transition-transform`}></i>
             </button>
             <button onClick={onStartCall} className="w-16 h-16 rounded-[2.5rem] bg-yellow-400 text-black hover:bg-white transition-all flex items-center justify-center shadow-[0_15px_40px_rgba(250,204,21,0.3)] active:scale-95"><i className="fa-solid fa-phone text-2xl"></i></button>
          </div>
        </div>

        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar relative">
           {messages.map(msg => (
             <div key={msg.id} className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[70%] space-y-3 ${msg.senderId === 'user' ? 'animate-message-out' : ''}`}>
                 <div className={`p-8 rounded-[3.5rem] text-[16px] leading-relaxed relative transition-all shadow-2xl ${msg.senderId === 'user' ? 'bg-yellow-400 text-black font-black' : 'bg-[#0a0a0a] border border-white/5 text-gray-100'}`}>
                    {msg.text}
                 </div>
                 <div className={`text-[10px] px-8 text-gray-600 font-black uppercase tracking-widest ${msg.senderId === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                 </div>
               </div>
             </div>
           ))}
        </div>

        <div className="p-10 border-t bg-black/80 border-white/5 shrink-0">
          <div className="flex flex-col space-y-4 max-w-7xl mx-auto">
             <div className="flex items-center justify-between px-6">
                <div className="flex items-center space-x-2">
                   <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1 h-3 rounded-full transition-colors ${messageInput.length > i * 5 ? 'bg-yellow-400' : 'bg-white/10'}`}></div>
                      ))}
                   </div>
                   <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Signal Strength</span>
                </div>
                {isTransmitting && <span className="text-[9px] text-yellow-400 font-black uppercase tracking-widest animate-pulse font-mono tracking-tighter">TRANSMITTING [HEX:{Math.random().toString(16).slice(2,8).toUpperCase()}]</span>}
             </div>

             <div className="flex items-center space-x-6">
                <button className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-3xl hover:text-yellow-400 border border-white/5 hover:border-yellow-400/40 transition-all shrink-0 shadow-lg"><i className="fa-solid fa-paperclip text-2xl"></i></button>
                <div className="flex-1 relative">
                   <input 
                    type="text" 
                    value={messageInput} 
                    onChange={(e) => setMessageInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    disabled={isTransmitting}
                    placeholder="TRANSMIT SECURE SIGNAL..." 
                    className="w-full bg-black/50 border border-white/10 rounded-[3rem] py-6 px-12 outline-none focus:border-yellow-400/50 transition-all font-black uppercase tracking-[0.2em] text-sm shadow-inner text-white placeholder:text-gray-800" 
                  />
                </div>
                <button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isTransmitting}
                  className={`w-20 h-20 flex items-center justify-center rounded-[3rem] transition-all shadow-2xl active:scale-90 relative overflow-hidden ${
                    messageInput.trim() ? 'bg-yellow-400 text-black' : 'bg-white/5 text-gray-800'
                  }`}
                >
                  {isTransmitting ? (
                    <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <i className="fa-solid fa-paper-plane text-3xl"></i>
                  )}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainView;
