
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
  { id: 'nib_official', name: 'NIB SEC', type: 'channel', avatar: 'https://i.ibb.co/3ykXF4K/nib-logo.png', unreadCount: 1, membersCount: 25800, lastMessage: 'Quantum handshake established.', isPinned: true, isVerified: true },
  { id: 'saved', name: 'Saved Messages', type: 'saved', avatar: 'https://cdn-icons-png.flaticon.com/512/566/566412.png', unreadCount: 0, lastMessage: 'Encrypted storage node active.', isPinned: true },
  { id: '2', name: 'Alpha Squad', type: 'group', avatar: 'https://picsum.photos/105', unreadCount: 3, membersCount: 12, lastMessage: 'Meeting at 22:00 UTC.' },
  { id: '3', name: '@queen_bee', type: 'direct', avatar: 'https://picsum.photos/103', unreadCount: 0, lastMessage: 'Protocol updated.' },
];

const MainView: React.FC<MainViewProps> = ({ user, setUser, onStartCall, onSignOut, theme, toggleTheme }) => {
  const [chats, setChats] = useState<Chat[]>(initialMockChats);
  const [activeChatId, setActiveChatId] = useState<string | null>('nib_official');
  const [messageInput, setMessageInput] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  
  // Wallet States
  const [showWallet, setShowWallet] = useState(false);
  const [walletStep, setWalletStep] = useState<'balance' | 'buy' | 'telebirr' | 'waiting'>('balance');
  const [buyQuantity, setBuyQuantity] = useState('50');

  // Messages
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', senderId: 'nib_official', text: 'Welcome to the NIB SEC secure node. All communications are E2EE.', timestamp: Date.now() - 3600000 },
  ]);

  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || isTransmitting) return;
    setIsTransmitting(true);
    const newMessage: Message = { id: 'm-' + Date.now(), senderId: 'user', text: messageInput.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    setTimeout(() => setIsTransmitting(false), 400);
  };

  const activeChat = chats.find(c => c.id === activeChatId);
  const pinnedChats = chats.filter(c => c.isPinned);
  const unpinnedChats = chats.filter(c => !c.isPinned);

  const renderChatItem = (chat: Chat) => (
    <button 
      key={chat.id}
      onClick={() => setActiveChatId(chat.id)}
      className={`w-full flex items-center space-x-4 p-4 rounded-[2.5rem] transition-all relative group ${
        activeChatId === chat.id ? 'bg-yellow-400/10 border border-yellow-400/20 shadow-xl' : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className="relative shrink-0">
        <div className={`w-14 h-14 hexagon p-0.5 ${chat.isPinned ? 'bg-yellow-400' : 'bg-neutral-800'}`}>
          <img src={chat.avatar} className="w-full h-full hexagon object-cover" alt={chat.name} />
        </div>
        {chat.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
            {chat.unreadCount}
          </span>
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex justify-between items-center">
          <span className="font-black text-sm truncate flex items-center">
            {chat.name}
            {chat.isVerified && <i className="fa-solid fa-circle-check text-yellow-400 text-[10px] ml-1.5 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]"></i>}
          </span>
          {chat.isPinned && <i className="fa-solid fa-thumbtack text-yellow-400 text-[10px]"></i>}
        </div>
        <p className="text-[11px] text-gray-500 truncate w-full font-bold">{chat.lastMessage}</p>
      </div>
    </button>
  );

  return (
    <div className="h-full flex overflow-hidden relative honeycomb-bg">
      
      {/* HAMBURGER SIDE DRAWER */}
      {showHamburger && (
        <div className="fixed inset-0 z-[500] flex">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowHamburger(false)}></div>
          <div className="w-80 h-full bg-[#0a0a0a] border-r border-yellow-400/20 shadow-[0_0_100px_rgba(250,204,21,0.1)] relative z-10 animate-in slide-in-from-left duration-300 flex flex-col">
             <div className="p-10 bg-gradient-to-br from-yellow-400/10 to-transparent border-b border-white/5">
                <div className="w-20 h-20 hexagon p-1 bg-yellow-400 shadow-2xl mb-6">
                   <img src={user.avatarUrl} className="w-full h-full hexagon object-cover" />
                </div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter">{user.displayName}</h3>
                <p className="text-xs text-yellow-400/60 font-mono">{user.username}</p>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-1">
                <button className="w-full flex items-center space-x-4 p-4 rounded-2xl hover:bg-yellow-400/10 hover:text-yellow-400 transition-all group">
                   <i className="fa-solid fa-user-circle w-6 text-gray-600 group-hover:text-yellow-400"></i>
                   <span className="text-xs font-black uppercase tracking-widest">My Profile</span>
                </button>
                <button onClick={() => {setShowWallet(true); setShowHamburger(false);}} className="w-full flex items-center space-x-4 p-4 rounded-2xl hover:bg-yellow-400/10 hover:text-yellow-400 transition-all group">
                   <i className="fa-solid fa-vault w-6 text-gray-600 group-hover:text-yellow-400"></i>
                   <div className="flex-1 flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-widest">Wallet / Balance</span>
                      <span className="text-[10px] bg-yellow-400/10 px-2 py-0.5 rounded text-yellow-400">{user.walletBalance} NIB</span>
                   </div>
                </button>
                <div className="h-px bg-white/5 my-2"></div>
                <button className="w-full flex items-center space-x-4 p-4 rounded-2xl hover:bg-yellow-400/10 hover:text-yellow-400 transition-all group">
                   <i className="fa-solid fa-bullhorn w-6 text-gray-600 group-hover:text-yellow-400"></i>
                   <span className="text-xs font-black uppercase tracking-widest">Create Channel</span>
                </button>
                <button className="w-full flex items-center space-x-4 p-4 rounded-2xl hover:bg-yellow-400/10 hover:text-yellow-400 transition-all group">
                   <i className="fa-solid fa-users w-6 text-gray-600 group-hover:text-yellow-400"></i>
                   <span className="text-xs font-black uppercase tracking-widest">Create Group</span>
                </button>
                <div className="h-px bg-white/5 my-2"></div>
                <button className="w-full flex items-center space-x-4 p-4 rounded-2xl hover:bg-yellow-400/10 hover:text-yellow-400 transition-all group">
                   <i className="fa-solid fa-address-book w-6 text-gray-600 group-hover:text-yellow-400"></i>
                   <span className="text-xs font-black uppercase tracking-widest">Contacts</span>
                </button>
                <button className="w-full flex items-center space-x-4 p-4 rounded-2xl hover:bg-yellow-400/10 hover:text-yellow-400 transition-all group">
                   <i className="fa-solid fa-phone w-6 text-gray-600 group-hover:text-yellow-400"></i>
                   <span className="text-xs font-black uppercase tracking-widest">Calls</span>
                </button>
                <button className="w-full flex items-center space-x-4 p-4 rounded-2xl hover:bg-yellow-400/10 hover:text-yellow-400 transition-all group">
                   <i className="fa-solid fa-bookmark w-6 text-gray-600 group-hover:text-yellow-400"></i>
                   <span className="text-xs font-black uppercase tracking-widest">Saved Messages</span>
                </button>
                <div className="h-px bg-white/5 my-2"></div>
                <button className="w-full flex items-center space-x-4 p-4 rounded-2xl hover:bg-yellow-400/10 hover:text-yellow-400 transition-all group">
                   <i className="fa-solid fa-gear w-6 text-gray-600 group-hover:text-yellow-400"></i>
                   <span className="text-xs font-black uppercase tracking-widest">Settings</span>
                </button>
                <button onClick={toggleTheme} className="w-full flex items-center space-x-4 p-4 rounded-2xl hover:bg-yellow-400/10 hover:text-yellow-400 transition-all group">
                   <i className={`fa-solid ${theme === 'night' ? 'fa-moon' : 'fa-sun'} w-6 text-gray-600 group-hover:text-yellow-400`}></i>
                   <span className="text-xs font-black uppercase tracking-widest">{theme === 'night' ? 'Night Mode' : 'Light Mode'}</span>
                </button>
                <button onClick={onSignOut} className="w-full flex items-center space-x-4 p-4 rounded-2xl hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all group">
                   <i className="fa-solid fa-power-off w-6"></i>
                   <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
                </button>
             </div>
             <div className="p-6 text-center">
                <p className="text-[10px] text-gray-700 font-mono tracking-widest uppercase">© 2025 NIB SEC PLATFORM</p>
             </div>
          </div>
        </div>
      )}

      {/* WALLET / CIPHER VAULT MODAL */}
      {showWallet && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-neutral-900 border border-yellow-400/20 rounded-[4rem] p-12 relative overflow-hidden shadow-[0_0_150px_rgba(250,204,21,0.1)]">
              <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400/40"></div>
              
              {walletStep === 'balance' && (
                <div className="space-y-10 animate-in zoom-in duration-300">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                         <i className="fa-solid fa-bee text-yellow-400 text-3xl drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"></i>
                         <h2 className="text-3xl font-black italic tracking-tighter uppercase">Cipher Vault</h2>
                      </div>
                      <button onClick={() => setShowWallet(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"><i className="fa-solid fa-xmark"></i></button>
                   </div>
                   <div className="bg-black/40 rounded-[3rem] p-12 border border-white/5 text-center space-y-8 group">
                      <div className="space-y-2">
                         <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Available Balance</p>
                         <h3 className="text-7xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.2)]">{user.walletBalance} <span className="text-2xl text-white/40 tracking-widest">NIB</span></h3>
                      </div>
                      <button onClick={() => setWalletStep('buy')} className="w-full py-6 bg-yellow-400 text-black rounded-[2.5rem] font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_60px_rgba(250,204,21,0.3)]">BUY NIB</button>
                   </div>
                </div>
              )}

              {walletStep === 'buy' && (
                <div className="space-y-8 animate-in slide-in-from-right-10 duration-300">
                   <div className="flex items-center space-x-4">
                      <button onClick={() => setWalletStep('balance')} className="text-yellow-400 text-xl"><i className="fa-solid fa-arrow-left"></i></button>
                      <h3 className="text-xl font-black uppercase italic tracking-widest">Acquire Signal</h3>
                   </div>
                   <div className="space-y-6 bg-black/40 p-10 rounded-[3rem] border border-white/5">
                      <div className="space-y-3">
                         <label className="text-[10px] text-gray-600 font-black uppercase tracking-widest px-4">Quantity (Minimum 50 NIB)</label>
                         <div className="relative">
                            <input 
                              type="number" 
                              min="50"
                              value={buyQuantity}
                              onChange={(e) => setBuyQuantity(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded-[2.5rem] py-6 px-10 outline-none focus:border-yellow-400 text-4xl font-black text-yellow-400 shadow-inner" 
                            />
                            <i className="fa-solid fa-bee absolute right-10 top-1/2 -translate-y-1/2 text-gray-800 text-2xl"></i>
                         </div>
                      </div>
                      <div className="flex justify-between items-center px-4">
                         <span className="text-xs text-gray-500 font-black">RATE: 1 NIB = 1 ETB</span>
                         <span className="text-2xl font-black text-white">{buyQuantity} ETB</span>
                      </div>
                      <button 
                        disabled={parseInt(buyQuantity) < 50}
                        onClick={() => setWalletStep('telebirr')}
                        className={`w-full py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-sm transition-all shadow-xl ${parseInt(buyQuantity) >= 50 ? 'bg-yellow-400 text-black hover:bg-white' : 'bg-neutral-800 text-gray-600 cursor-not-allowed'}`}
                      >BUY</button>
                   </div>
                </div>
              )}

              {walletStep === 'telebirr' && (
                <div className="space-y-10 animate-in zoom-in duration-500">
                   <div className="text-center space-y-4">
                      <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(37,99,235,0.4)] border-4 border-white/10">
                         <i className="fa-solid fa-mobile-screen text-white text-4xl"></i>
                      </div>
                      <h4 className="text-2xl font-black tracking-tighter uppercase italic text-white">Telebirr Payment</h4>
                   </div>
                   <div className="bg-[#0c0c04] p-10 rounded-[4rem] border-2 border-yellow-400/40 space-y-8 relative overflow-hidden shadow-[0_0_80px_rgba(250,204,21,0.2)]">
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
                   <button 
                     onClick={() => setWalletStep('waiting')}
                     className="w-full py-6 bg-yellow-400 text-black rounded-[2.5rem] font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-2xl"
                   >DONE</button>
                </div>
              )}

              {walletStep === 'waiting' && (
                <div className="text-center space-y-10 animate-in fade-in duration-700">
                   <div className="relative py-12">
                      <i className="fa-solid fa-circle-notch fa-spin text-8xl text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]"></i>
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
                         <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">If your transaction does not appear within 3days, Call us</p>
                         <p className="text-lg font-black text-yellow-400 tracking-widest">+251978366565</p>
                      </div>
                      <a href="https://t.me/oryn179" target="_blank" className="inline-block text-xs font-black text-yellow-400 hover:text-white uppercase tracking-widest pt-4">t.me/oryn179</a>
                   </div>
                   <button onClick={() => {setShowWallet(false); setWalletStep('balance');}} className="w-full py-6 bg-white/5 border border-white/10 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">Close Terminal</button>
                </div>
              )}
           </div>
        </div>
      )}

      {/* LEFT SIDEBAR: CHAT LIST */}
      <div className="w-24 lg:w-[420px] bg-black border-r border-white/5 flex flex-col z-20 relative">
        <div className="h-28 px-8 flex items-center justify-between shrink-0 bg-black/80 backdrop-blur-md border-b border-white/5">
           <button onClick={() => setShowHamburger(true)} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-yellow-400 text-xl hover:bg-yellow-400/10 transition-all shadow-xl">
              <i className="fa-solid fa-bars-staggered"></i>
           </button>
           <h1 className="hidden lg:block text-2xl font-black text-yellow-400 uppercase tracking-tighter italic">NIB SEC</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 custom-scrollbar">
           {pinnedChats.length > 0 && (
              <div className="space-y-3">
                 <h4 className="px-4 text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Pinned</h4>
                 <div className="space-y-2">
                    {pinnedChats.map(renderChatItem)}
                 </div>
              </div>
           )}
           <div className="space-y-3">
              <h4 className="px-4 text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Messages</h4>
              <div className="space-y-2">
                 {unpinnedChats.map(renderChatItem)}
              </div>
           </div>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col relative bg-black/40 backdrop-blur-3xl">
        <div className="h-28 border-b border-white/5 bg-black/60 backdrop-blur-3xl px-12 flex items-center justify-between z-10 shrink-0 shadow-2xl">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 hexagon p-0.5 bg-yellow-400 shadow-2xl">
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
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 <p className="text-[11px] text-gray-500 uppercase tracking-[0.3em] font-black">ACTIVE NODE</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             {/* Profile Dropdown Trigger */}
             <div className="relative">
                <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="flex items-center space-x-2 bg-white/5 px-4 py-3 rounded-2xl border border-white/10 hover:border-yellow-400/40 transition-all group">
                   <div className="w-8 h-8 rounded-full overflow-hidden border border-yellow-400/50">
                      <img src={user.avatarUrl} className="w-full h-full object-cover" />
                   </div>
                   <i className="fa-solid fa-chevron-down text-[10px] text-gray-500 group-hover:text-yellow-400"></i>
                </button>
                {showProfileDropdown && (
                   <div className="absolute top-full right-0 mt-4 w-64 bg-neutral-900 border border-yellow-400/20 rounded-[2rem] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50 animate-in zoom-in duration-200">
                      <div className="p-4 text-center space-y-4">
                         <div className="w-20 h-20 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto border border-yellow-400/20 animate-pulse">
                            <i className="fa-solid fa-bee text-yellow-400 text-4xl"></i>
                         </div>
                         <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Under Maintenance</h4>
                         <div className="h-px bg-white/5"></div>
                         <button className="w-full py-3 hover:bg-yellow-400/10 rounded-xl text-left px-4 flex items-center space-x-3 transition-all group">
                            <i className="fa-solid fa-user-plus text-gray-600 group-hover:text-yellow-400"></i>
                            <span className="text-[10px] font-black uppercase">Add Account</span>
                         </button>
                         <button onClick={onSignOut} className="w-full py-3 hover:bg-red-500/10 rounded-xl text-left px-4 flex items-center space-x-3 transition-all group text-gray-500 hover:text-red-500">
                            <i className="fa-solid fa-power-off"></i>
                            <span className="text-[10px] font-black uppercase">Sign Out</span>
                         </button>
                      </div>
                   </div>
                )}
             </div>
             <button onClick={onStartCall} className="w-16 h-16 rounded-[2.5rem] bg-yellow-400 text-black hover:bg-white transition-all flex items-center justify-center shadow-[0_15px_40px_rgba(250,204,21,0.3)] active:scale-95"><i className="fa-solid fa-phone text-2xl"></i></button>
          </div>
        </div>

        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar relative">
           {messages.map(msg => (
             <div key={msg.id} className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[70%] space-y-3 ${msg.senderId === 'user' ? 'animate-message-out' : ''}`}>
                 <div className={`p-8 rounded-[3.5rem] text-[16px] leading-relaxed relative transition-all shadow-2xl ${
                   msg.senderId === 'user' 
                   ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-black font-black' 
                   : 'bg-[#0a0a0a] border border-white/5 text-gray-100'
                 }`}>
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
             <div className="flex items-center space-x-6">
                <button className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-3xl hover:text-yellow-400 border border-white/5 hover:border-yellow-400/40 transition-all shrink-0 shadow-lg group"><i className="fa-solid fa-face-smile text-2xl group-hover:scale-110"></i></button>
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
                    messageInput.trim() ? 'bg-yellow-400 text-black shadow-[0_0_30px_rgba(250,204,21,0.5)]' : 'bg-white/5 text-gray-800'
                  }`}
                >
                  <i className="fa-solid fa-paper-plane text-3xl"></i>
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainView;
