
import React, { useState, useEffect, useRef } from 'react';
import { User, Chat, Message, Theme } from '../types';

interface MainViewProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  onStartCall: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const initialMockChats: Chat[] = [
  { id: 'nib_official', name: 'NIB SEC', type: 'channel', avatar: 'https://i.ibb.co/3ykXF4K/nib-logo.png', unreadCount: 1, membersCount: 15400, lastMessage: 'Welcome to the secure hive.', isPinned: true, isVerified: true },
  { id: 'saved', name: 'Saved Messages', type: 'saved', avatar: 'https://cdn-icons-png.flaticon.com/512/566/566412.png', unreadCount: 0, lastMessage: 'Cloud storage encrypted.' },
  { id: '2', name: 'Dev Hive', type: 'group', avatar: 'https://picsum.photos/102', unreadCount: 0, membersCount: 8, lastMessage: 'Check the honeycomb logic.' },
  { id: '3', name: '@the_queen', type: 'direct', avatar: 'https://picsum.photos/103', unreadCount: 1, lastMessage: 'Protocol 7 initiated.' },
];

const MainView: React.FC<MainViewProps> = ({ user, setUser, onStartCall, theme, toggleTheme }) => {
  const [chats, setChats] = useState<Chat[]>(initialMockChats);
  const [activeChatId, setActiveChatId] = useState<string | null>('nib_official');
  const [messageInput, setMessageInput] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [walletStep, setWalletStep] = useState<'balance' | 'buy' | 'pay' | 'confirm' | 'waiting'>('balance');
  const [buyAmount, setBuyAmount] = useState('50');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, chatId: string } | null>(null);
  
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  // Settings State
  const [editUsername, setEditUsername] = useState(user.username);
  const [editDisplayName, setEditDisplayName] = useState(user.displayName);
  const [editAvatar, setEditAvatar] = useState(user.avatarUrl);

  const activeChat = chats.find(c => c.id === activeChatId);

  const mockMessages: Message[] = [
    { id: 'm1', senderId: 'nib_official', text: 'Operational security is our top priority Operative.', timestamp: Date.now() - 3600000 },
    { id: 'm2', senderId: 'user', text: 'Confirmed. Encryption looks solid.', timestamp: Date.now() - 3000000 },
  ];

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    setMessageInput('');
  };

  const handleSaveSettings = () => {
    setUser({ ...user, username: editUsername, displayName: editDisplayName, avatarUrl: editAvatar });
    setShowSettingsModal(false);
  };

  const togglePin = (chatId: string) => {
    setChats(prev => prev.map(chat => chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat));
    setContextMenu(null);
  };

  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const renderChatItem = (chat: Chat) => (
    <button 
      key={chat.id}
      onClick={() => setActiveChatId(chat.id)}
      onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, chatId: chat.id }); }}
      className={`w-full flex items-center space-x-3 p-4 rounded-[2rem] transition-all relative group ${
        activeChatId === chat.id 
        ? (theme === 'night' ? 'bg-yellow-400/10 border border-yellow-400/20' : 'bg-yellow-400/20 border border-yellow-400/30') 
        : 'hover:bg-white/5'
      }`}
    >
      <div className="relative shrink-0">
        <div className={`w-14 h-14 hexagon p-0.5 ${chat.isPinned ? 'bg-yellow-400' : (theme === 'night' ? 'bg-neutral-800' : 'bg-gray-200')}`}>
          <img src={chat.avatar} alt={chat.name} className="w-full h-full hexagon object-cover" />
        </div>
        {chat.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse border-2 border-black">
            {chat.unreadCount}
          </span>
        )}
      </div>
      <div className="hidden lg:flex flex-col items-start flex-1 min-w-0">
        <div className="flex justify-between w-full">
          <span className="font-black text-sm truncate flex items-center tracking-tight">
            {chat.name}
            {chat.isVerified && <i className="fa-solid fa-circle-check text-yellow-400 text-[10px] ml-1.5 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></i>}
          </span>
          <span className="text-[10px] text-gray-600 font-bold">12:45</span>
        </div>
        <p className="text-xs text-gray-500 truncate w-full font-medium">{chat.lastMessage}</p>
      </div>
    </button>
  );

  const DrawerItem = ({ icon, label, onClick, badge }: { icon: string, label: string, onClick?: () => void, badge?: string }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 hover:bg-yellow-400/10 transition-all group rounded-2xl mx-2 my-0.5 w-[calc(100%-1rem)] active:scale-95`}
    >
      <div className="flex items-center space-x-5">
        <div className="w-10 h-10 flex items-center justify-center bg-neutral-900/50 rounded-xl border border-white/5 group-hover:border-yellow-400/40 transition-all">
          <i className={`${icon} text-lg text-gray-500 group-hover:text-yellow-400 transition-all`}></i>
        </div>
        <span className="font-black text-[11px] uppercase tracking-[0.2em] group-hover:text-yellow-400 transition-colors">{label}</span>
      </div>
      {badge && <span className="bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg">{badge}</span>}
    </button>
  );

  return (
    <div className="h-full flex overflow-hidden relative">
      
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[300] flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-[#080808] border border-white/10 rounded-[48px] p-10 space-y-10 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h4 className="text-3xl font-black uppercase tracking-tighter">Settings</h4>
              <button onClick={() => setShowSettingsModal(false)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:text-red-500 transition-all">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 hexagon border-4 border-yellow-400 p-1 group relative cursor-pointer">
                 <img src={editAvatar} className="w-full h-full hexagon object-cover" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all hexagon flex items-center justify-center">
                    <i className="fa-solid fa-camera text-2xl text-white"></i>
                 </div>
              </div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Operative Ident Image</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-600 tracking-widest ml-4">Display Name</label>
                <input value={editDisplayName} onChange={e => setEditDisplayName(e.target.value)} className="w-full bg-black border border-white/10 rounded-3xl py-5 px-8 outline-none focus:border-yellow-400 font-bold text-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-600 tracking-widest ml-4">Username</label>
                <input value={editUsername} onChange={e => setEditUsername(e.target.value)} className="w-full bg-black border border-white/10 rounded-3xl py-5 px-8 outline-none focus:border-yellow-400 font-bold text-lg text-yellow-400 font-mono" />
              </div>
            </div>

            <button onClick={handleSaveSettings} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black py-6 rounded-3xl transition-all shadow-[0_15px_40px_rgba(250,204,21,0.2)] active:scale-95 uppercase tracking-[0.3em]">Save Profile</button>
          </div>
        </div>
      )}

      {/* Wallet Modal (Full Buy Flow) */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[300] flex items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#080808] border border-yellow-400/20 rounded-[48px] p-10 space-y-8 shadow-[0_0_100px_rgba(250,204,21,0.15)] relative animate-in fade-in zoom-in duration-300">
            {/* Steps Rendering */}
            {walletStep === 'balance' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <h4 className="text-3xl font-black uppercase tracking-tighter italic">NIB Wallet</h4>
                  <button onClick={() => setShowWalletModal(false)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:text-red-500"><i className="fa-solid fa-xmark"></i></button>
                </div>
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-[3rem] p-10 text-black shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                    <i className="fa-solid fa-bee text-[120px]"></i>
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">Secured Balance</p>
                  <div className="flex items-center space-x-4">
                    <span className="text-6xl font-black">{user.walletBalance}</span>
                    <span className="text-2xl font-black mt-4">NIB</span>
                  </div>
                </div>
                <button onClick={() => setWalletStep('buy')} className="w-full bg-white text-black font-black py-6 rounded-3xl flex items-center justify-center space-x-4 hover:bg-yellow-400 transition-all shadow-xl active:scale-95">
                  <i className="fa-solid fa-circle-plus text-xl"></i>
                  <span className="uppercase tracking-[0.3em] font-black">BUY NIB</span>
                </button>
              </div>
            )}

            {walletStep === 'buy' && (
              <div className="space-y-10">
                <button onClick={() => setWalletStep('balance')} className="text-gray-500 hover:text-white flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest">
                  <i className="fa-solid fa-arrow-left"></i><span>Back</span>
                </button>
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-yellow-400/10 border border-yellow-400/30 rounded-full flex items-center justify-center text-4xl text-yellow-400 animate-pulse shadow-[0_0_30px_rgba(250,204,21,0.2)]">
                    <i className="fa-solid fa-bee"></i>
                  </div>
                  <h5 className="text-2xl font-black uppercase italic">Quantity Required</h5>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <input 
                      type="number" 
                      min="50"
                      value={buyAmount}
                      onChange={e => setBuyAmount(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-3xl py-6 px-10 text-3xl font-black outline-none focus:border-yellow-400 text-center transition-all" 
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 text-yellow-400 font-black">NIB</div>
                  </div>
                  <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">Minimum: 50 NIB | 1 NIB = 1 ETB</p>
                  <div className="bg-neutral-900 rounded-3xl p-6 flex justify-between items-center border border-white/5">
                    <span className="text-gray-500 font-black uppercase tracking-widest text-xs">Total Price</span>
                    <span className="text-2xl font-black text-white">{buyAmount} ETB</span>
                  </div>
                </div>
                <button 
                  disabled={parseInt(buyAmount) < 50}
                  onClick={() => setWalletStep('pay')} 
                  className="w-full bg-yellow-400 text-black font-black py-6 rounded-3xl hover:bg-white shadow-2xl transition-all disabled:opacity-30 uppercase tracking-[0.4em] active:scale-95"
                >
                  BUY
                </button>
              </div>
            )}

            {walletStep === 'pay' && (
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h5 className="text-3xl font-black uppercase tracking-tighter italic">Payment Method</h5>
                  <p className="text-[10px] text-gray-600 font-bold tracking-[0.3em]">SECURE GATEWAY ENCRYPTED</p>
                </div>
                <button onClick={() => setWalletStep('confirm')} className="w-full bg-[#121212] border border-white/10 hover:border-yellow-400/50 p-8 rounded-[3rem] transition-all group flex items-center justify-between">
                   <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-building-columns text-white text-2xl"></i>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-black tracking-tight">Telebirr</p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Instant Node Update</p>
                      </div>
                   </div>
                   <i className="fa-solid fa-chevron-right text-gray-700 group-hover:text-yellow-400 transition-colors"></i>
                </button>
              </div>
            )}

            {walletStep === 'confirm' && (
              <div className="space-y-8 animate-in zoom-in duration-500">
                <div className="bg-[#facc1508] border border-yellow-400/30 rounded-[3rem] p-10 text-center space-y-8 relative overflow-hidden shadow-[0_0_60px_rgba(250,204,21,0.1)]">
                   <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 to-transparent pointer-events-none"></div>
                   <div className="space-y-4">
                      <p className="text-xs font-black text-yellow-400/60 uppercase tracking-[0.5em]">Payment Address</p>
                      <div className="space-y-1">
                        <p className="text-3xl font-black text-white tracking-tighter">0978366565</p>
                        <p className="text-lg font-bold text-yellow-400 italic">Alemseged</p>
                      </div>
                   </div>
                   <div className="h-px bg-yellow-400/10 w-1/2 mx-auto"></div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Amount to Pay</p>
                      <p className="text-2xl font-black text-yellow-400">{buyAmount} ETB</p>
                   </div>
                </div>
                <div className="text-center space-y-4">
                  <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse glow-yellow px-4">Send A transaction Screenshot</p>
                  <button onClick={() => { window.open('https://t.me/oryn179', '_blank'); setWalletStep('waiting'); }} className="w-full bg-yellow-400 text-black font-black py-6 rounded-3xl hover:bg-white shadow-2xl transition-all uppercase tracking-[0.3em]">Done</button>
                </div>
              </div>
            )}

            {walletStep === 'waiting' && (
              <div className="space-y-10 text-center py-10 animate-in fade-in duration-700">
                <div className="w-24 h-24 mx-auto text-yellow-400 text-6xl animate-spin">
                  <i className="fa-solid fa-circle-notch"></i>
                </div>
                <div className="space-y-4">
                   <h5 className="text-2xl font-black uppercase italic">Processing Signal...</h5>
                   <p className="text-gray-400 text-sm font-bold max-w-xs mx-auto">It will take min 3hrs - max 3 Business Days</p>
                   <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest px-8">If your transaction does not appear within 3days, Call us +251978366565</p>
                </div>
                <button onClick={() => setShowWalletModal(false)} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:text-yellow-400 transition-all">Close Terminal</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Side Drawer Overlay */}
      {showDrawer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] transition-opacity duration-300" onClick={() => setShowDrawer(false)}>
          <div className={`absolute left-0 top-0 bottom-0 w-80 lg:w-96 ${theme === 'night' ? 'bg-[#080808] border-r border-white/5' : 'bg-white border-r border-gray-200'} shadow-[40px_0_100px_rgba(0,0,0,0.5)] transition-transform duration-500 transform translate-x-0 overflow-hidden flex flex-col`} onClick={(e) => e.stopPropagation()}>
            <div className={`p-8 space-y-6 ${theme === 'night' ? 'bg-black/40' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-start">
                <div className="w-24 h-24 hexagon border-4 border-yellow-400 p-1 bg-neutral-800 shadow-2xl overflow-hidden">
                  <img src={user.avatarUrl} className="w-full h-full hexagon object-cover" />
                </div>
                <button onClick={toggleTheme} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 hover:border-yellow-400/30 flex items-center justify-center transition-all text-yellow-400 shadow-lg">
                  <i className={`fa-solid ${theme === 'night' ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
                </button>
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-2xl tracking-tighter uppercase">{user.displayName}</h3>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{user.username}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
              <DrawerItem icon="fa-solid fa-id-badge" label="My Profile" />
              <DrawerItem icon="fa-solid fa-wallet" label="My Wallet" badge={`${user.walletBalance} SEC`} onClick={() => { setShowWalletModal(true); setWalletStep('balance'); setShowDrawer(false); }} />
              <div className="h-px bg-white/5 my-4 mx-6"></div>
              <DrawerItem icon="fa-solid fa-users-viewfinder" label="Create Group" />
              <DrawerItem icon="fa-solid fa-tower-broadcast" label="Create Channel" />
              <DrawerItem icon="fa-solid fa-address-book" label="Contacts" onClick={() => { setShowContactsModal(true); setShowDrawer(false); }} />
              <DrawerItem icon="fa-solid fa-phone-volume" label="Calls" />
              <DrawerItem icon="fa-solid fa-bookmark" label="Saved Messages" onClick={() => { setActiveChatId('saved'); setShowDrawer(false); }} />
              <div className="h-px bg-white/5 my-4 mx-6"></div>
              <DrawerItem icon="fa-solid fa-sliders" label="Settings" onClick={() => { setShowSettingsModal(true); setShowDrawer(false); }} />
              <DrawerItem icon="fa-solid fa-circle-info" label="NIB Help" />
            </div>
            <div className="p-6 border-t border-white/5 text-center"><p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">NIB SEC v3.5.0 Build 1004</p></div>
          </div>
        </div>
      )}

      {/* Main Sidebar (Desktop Only) */}
      <div className={`w-24 lg:w-96 border-r ${theme === 'night' ? 'border-white/5 bg-black' : 'border-gray-200 bg-white'} flex flex-col z-20 shadow-2xl transition-all`}>
        <div className="p-6 lg:p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button onClick={() => setShowDrawer(true)} className="w-14 h-14 rounded-3xl hover:bg-white/5 border border-transparent hover:border-white/10 flex flex-col items-center justify-center space-y-1.5 group transition-all">
              <div className="w-7 h-0.5 bg-yellow-400 group-hover:w-8 transition-all"></div><div className="w-8 h-0.5 bg-yellow-400"></div><div className="w-6 h-0.5 bg-yellow-400 group-hover:w-8 transition-all"></div>
            </button>
            <span className="hidden lg:block font-black text-3xl text-yellow-400 tracking-tighter italic">NIB SEC</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-2 custom-scrollbar">
          {chats.filter(c => c.isPinned).map(renderChatItem)}
          <div className="flex items-center px-4 py-4"><div className="flex-1 h-px bg-white/5"></div><span className="px-4 text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">Encrypted Feeds</span><div className="flex-1 h-px bg-white/5"></div></div>
          {chats.filter(c => !c.isPinned).map(renderChatItem)}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col relative ${theme === 'night' ? 'bg-black/40' : 'bg-gray-100'}`}>
        <div className={`h-24 lg:h-28 border-b ${theme === 'night' ? 'border-white/5 bg-black/60' : 'border-gray-200 bg-white/80'} backdrop-blur-3xl px-8 lg:px-12 flex items-center justify-between z-10`}>
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 hexagon p-0.5 bg-white/10 shadow-2xl relative">
              <img src={activeChat?.avatar} className="w-full h-full hexagon object-cover" />
              {activeChat?.isVerified && <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border border-yellow-400/20"><i className="fa-solid fa-circle-check text-yellow-400 text-[10px]"></i></div>}
            </div>
            <div>
              <div className="font-black text-2xl lg:text-3xl tracking-tighter flex items-center">
                {activeChat?.name}
                {activeChat?.isVerified && <i className="fa-solid fa-circle-check text-yellow-400 text-xs ml-3 shadow-[0_0_15px_rgba(250,204,21,0.5)]"></i>}
              </div>
              <div className="text-[11px] text-gray-500 uppercase tracking-[0.3em] font-black">
                {activeChat?.id === 'nib_official' ? '@Nibsec' : (activeChat?.membersCount ? `${activeChat.membersCount.toLocaleString()} OPERATIVES` : 'SECURE LINE')}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button className="hidden lg:flex w-14 h-14 rounded-[2rem] bg-white/5 border border-white/5 hover:border-yellow-400/40 items-center justify-center text-gray-500 hover:text-yellow-400 transition-all shadow-lg"><i className="fa-solid fa-magnifying-glass text-xl"></i></button>
            <button onClick={onStartCall} className="w-16 h-16 rounded-[2.5rem] bg-yellow-400 text-black hover:bg-white transition-all flex items-center justify-center shadow-[0_15px_40px_rgba(250,204,21,0.3)] group"><i className="fa-solid fa-phone text-2xl group-hover:rotate-12 transition-transform"></i></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 lg:p-14 space-y-10 custom-scrollbar">
          <div className="flex justify-center sticky top-0 z-0 py-6"><span className="bg-black/90 backdrop-blur-3xl text-[11px] text-yellow-400/80 px-10 py-4 rounded-full uppercase tracking-[0.5em] border border-yellow-400/30 font-black shadow-[0_20px_60px_rgba(0,0,0,0.8)]"><i className="fa-solid fa-shield-halved mr-3"></i>Node-to-Node AES-256 ACTIVE</span></div>
          {mockMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%] lg:max-w-[70%] space-y-3">
                <div className={`p-8 rounded-[4rem] text-[16px] leading-relaxed relative transition-all group ${msg.senderId === 'user' ? 'bg-yellow-400 text-black font-black shadow-2xl' : (theme === 'night' ? 'bg-[#0a0a0a] border border-white/5 text-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'bg-white border border-gray-200 text-gray-800 shadow-lg')}`}>{msg.text}</div>
                <div className={`text-[11px] px-8 text-gray-600 font-black uppercase tracking-widest ${msg.senderId === 'user' ? 'text-right' : 'text-left'}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{msg.senderId === 'user' && <i className="fa-solid fa-check-double ml-2 text-blue-500"></i>}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={`p-10 lg:p-12 border-t ${theme === 'night' ? 'bg-black/80 border-white/5' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center space-x-6 max-w-7xl mx-auto"><button className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-3xl hover:text-yellow-400 border border-white/5 hover:border-yellow-400/40 transition-all shrink-0"><i className="fa-solid fa-paperclip text-2xl"></i></button><div className="flex-1 relative"><input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="TRANSMIT SECURE SIGNAL..." className={`w-full bg-black/50 border ${theme === 'night' ? 'border-white/10' : 'border-gray-200'} rounded-[3rem] py-6 px-12 outline-none focus:border-yellow-400/50 transition-all font-black uppercase tracking-[0.2em] text-sm placeholder:text-gray-800 shadow-inner`}/></div><button className={`w-18 h-18 lg:w-20 lg:h-20 flex items-center justify-center rounded-[3rem] transition-all shadow-2xl active:scale-90 ${messageInput.trim() ? 'bg-yellow-400 text-black scale-110' : 'bg-white/5 text-gray-800'}`}><i className="fa-solid fa-paper-plane text-2xl lg:text-3xl"></i></button></div>
        </div>
      </div>

      {/* Re-usable Modals for Contacts, New Contact etc. could be here as well, kept from previous version but improved UI */}
    </div>
  );
};

export default MainView;
