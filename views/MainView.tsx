
import React, { useState, useEffect, useRef } from 'react';
import { User, Chat, Message, Theme } from '../types';

interface MainViewProps {
  user: User;
  onStartCall: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const initialMockChats: Chat[] = [
  { id: 'saved', name: 'Saved Messages', type: 'saved', avatar: 'https://cdn-icons-png.flaticon.com/512/566/566412.png', unreadCount: 0, lastMessage: 'Cloud storage encrypted.' },
  { id: '1', name: 'NIB HQ', type: 'channel', avatar: 'https://picsum.photos/101', unreadCount: 12, membersCount: 450, lastMessage: 'Update on secure protocols.', isPinned: true },
  { id: '2', name: 'Dev Hive', type: 'group', avatar: 'https://picsum.photos/102', unreadCount: 0, membersCount: 8, lastMessage: 'Check the honeycomb logic.' },
  { id: '3', name: '@the_queen', type: 'direct', avatar: 'https://picsum.photos/103', unreadCount: 1, lastMessage: 'Protocol 7 initiated.' },
];

const MainView: React.FC<MainViewProps> = ({ user, onStartCall, theme, toggleTheme }) => {
  const [chats, setChats] = useState<Chat[]>(initialMockChats);
  const [activeChatId, setActiveChatId] = useState<string | null>('1');
  const [messageInput, setMessageInput] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, chatId: string } | null>(null);
  
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  const activeChat = chats.find(c => c.id === activeChatId);

  const mockMessages: Message[] = [
    { id: 'm1', senderId: '3', text: 'Operation Honeycomb is go.', timestamp: Date.now() - 3600000 },
    { id: 'm2', senderId: 'user', text: 'Acknowledged. Scanners are live.', timestamp: Date.now() - 3000000 },
    { id: 'm3', senderId: '3', text: 'Encryption keys have been rotated. Check terminal logs.', timestamp: Date.now() - 2000000, reactions: ['🔥', '🐝'] },
  ];

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    setMessageInput('');
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
      className={`w-full flex items-center space-x-3 p-4 rounded-3xl transition-all relative group ${
        activeChatId === chat.id 
        ? (theme === 'night' ? 'bg-yellow-400/10 border border-yellow-400/20 shadow-lg' : 'bg-yellow-400/20 border border-yellow-400/30 shadow-md') 
        : 'hover:bg-white/5'
      }`}
    >
      <div className="relative shrink-0">
        <div className={`w-12 h-12 hexagon p-0.5 ${chat.isPinned ? 'bg-yellow-400' : (theme === 'night' ? 'bg-neutral-800' : 'bg-gray-200')}`}>
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
            {chat.isPinned && <i className="fa-solid fa-thumbtack text-[10px] ml-1.5 text-yellow-400/40 rotate-45"></i>}
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
      className={`w-full flex items-center justify-between p-4 hover:bg-yellow-400/5 transition-all group rounded-2xl mx-2 my-0.5 w-[calc(100%-1rem)]`}
    >
      <div className="flex items-center space-x-5">
        <div className="w-10 h-10 flex items-center justify-center bg-neutral-900/50 rounded-xl border border-white/5 group-hover:border-yellow-400/30 transition-all">
          <i className={`${icon} text-lg text-gray-500 group-hover:text-yellow-400 transition-all`}></i>
        </div>
        <span className="font-bold text-[13px] uppercase tracking-widest">{label}</span>
      </div>
      {badge && <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
  );

  return (
    <div className="h-full flex overflow-hidden relative">
      
      {/* Side Drawer Overlay */}
      {showDrawer && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] transition-opacity duration-300"
          onClick={() => setShowDrawer(false)}
        >
          <div 
            className={`absolute left-0 top-0 bottom-0 w-80 lg:w-96 ${theme === 'night' ? 'bg-[#080808] border-r border-white/5' : 'bg-white border-r border-gray-200'} shadow-[40px_0_100px_rgba(0,0,0,0.5)] transition-transform duration-500 transform translate-x-0 overflow-hidden flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Profile Header */}
            <div className={`p-8 space-y-6 ${theme === 'night' ? 'bg-black/40' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-start">
                <div className="w-24 h-24 hexagon border-4 border-yellow-400 p-1 bg-neutral-800 shadow-2xl">
                  <img src={user.avatarUrl} className="w-full h-full hexagon object-cover" />
                </div>
                <button onClick={toggleTheme} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 hover:border-yellow-400/30 flex items-center justify-center transition-all text-yellow-400">
                  <i className={`fa-solid ${theme === 'night' ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
                </button>
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-2xl tracking-tighter uppercase">{user.username}</h3>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Secure Node ID: 8992-SEC</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
              <DrawerItem icon="fa-solid fa-id-badge" label="My Profile" />
              <DrawerItem icon="fa-solid fa-wallet" label="My Wallet" badge={`${user.walletBalance} SEC`} onClick={() => alert(`Vault balance: ${user.walletBalance} SEC`)} />
              
              <div className="h-px bg-white/5 my-4 mx-6"></div>
              
              <DrawerItem icon="fa-solid fa-users-viewfinder" label="Create Group" />
              <DrawerItem icon="fa-solid fa-tower-broadcast" label="Create Channel" />
              <DrawerItem icon="fa-solid fa-address-book" label="Contacts" onClick={() => { setShowContactsModal(true); setShowDrawer(false); }} />
              <DrawerItem icon="fa-solid fa-phone-volume" label="Calls" />
              <DrawerItem icon="fa-solid fa-bookmark" label="Saved Messages" onClick={() => { setActiveChatId('saved'); setShowDrawer(false); }} />
              
              <div className="h-px bg-white/5 my-4 mx-6"></div>
              
              <DrawerItem icon="fa-solid fa-sliders" label="Settings" />
              <DrawerItem icon="fa-solid fa-circle-info" label="NIB Help" />
            </div>

            <div className="p-6 border-t border-white/5 text-center">
               <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">NIB SEC v3.4.1 (Stable Build)</p>
            </div>
          </div>
        </div>
      )}

      {/* Contacts & New Contact Modals */}
      {showContactsModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[200] flex items-center justify-center p-6">
          <div className={`w-full max-w-xl ${theme === 'night' ? 'bg-[#0a0a0a]' : 'bg-white'} rounded-[48px] overflow-hidden shadow-2xl border border-white/10`}>
            <div className="p-8 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center space-x-4">
                <i className="fa-solid fa-address-book text-yellow-400 text-2xl"></i>
                <h3 className="text-2xl font-black uppercase tracking-tight">Contacts</h3>
              </div>
              <button onClick={() => setShowContactsModal(false)} className="w-12 h-12 rounded-2xl hover:bg-white/5 flex items-center justify-center transition-all">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="relative group">
                <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-yellow-400 transition-colors"></i>
                <input 
                  placeholder="Search operative ID or frequency..." 
                  className="w-full bg-black/50 border border-white/10 rounded-3xl py-5 pl-16 pr-8 outline-none focus:border-yellow-400/50 transition-all font-bold tracking-tight" 
                />
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowNewContactModal(true)}
                  className="flex-1 flex items-center justify-center space-x-4 p-6 bg-yellow-400 hover:bg-yellow-500 rounded-[32px] transition-all group shadow-xl active:scale-95"
                >
                  <i className="fa-solid fa-user-plus text-black text-xl group-hover:scale-110 transition-transform"></i>
                  <span className="font-black text-black uppercase tracking-widest text-sm">New Contact</span>
                </button>
                <button className="w-20 bg-neutral-900 border border-white/10 rounded-[32px] flex items-center justify-center hover:bg-neutral-800 transition-all">
                   <i className="fa-solid fa-share-nodes text-yellow-400 text-xl"></i>
                </button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                <p className="text-[11px] uppercase tracking-[0.3em] text-gray-600 font-black px-4">SECURE OPERATIVES</p>
                {['@drone_01', '@crypt_keeper', '@the_queen', '@honey_trap', '@guard_bee'].map(c => (
                  <div key={c} className="flex items-center justify-between p-5 hover:bg-yellow-400/5 border border-transparent hover:border-yellow-400/10 rounded-[32px] cursor-pointer transition-all group">
                    <div className="flex items-center space-x-5">
                      <div className="w-14 h-14 hexagon bg-neutral-900 p-0.5 border border-white/5 group-hover:border-yellow-400/30 transition-all">
                        <img src={`https://picsum.photos/seed/${c}/150`} className="w-full h-full hexagon object-cover grayscale group-hover:grayscale-0 transition-all" />
                      </div>
                      <div className="space-y-1">
                        <span className="font-black text-lg tracking-tight block">{c}</span>
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Last seen 5m ago</span>
                      </div>
                    </div>
                    <i className="fa-solid fa-chevron-right text-gray-800 group-hover:text-yellow-400 group-hover:translate-x-2 transition-all"></i>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Contact Creator (Telegram Style) */}
      {showNewContactModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[300] flex items-center justify-center p-6">
          <div className={`w-full max-w-lg ${theme === 'night' ? 'bg-[#080808]' : 'bg-white'} rounded-[48px] border border-white/10 shadow-2xl p-10 space-y-10`}>
            <div className="flex items-center justify-between">
              <h4 className="text-3xl font-black uppercase tracking-tighter">New Operative</h4>
              <button onClick={() => setShowNewContactModal(false)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:text-red-500">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <div className="flex flex-col items-center space-y-4 pb-4">
              <div className="w-28 h-28 hexagon bg-neutral-900 border-2 border-yellow-400/20 flex items-center justify-center text-gray-700 text-4xl">
                 <i className="fa-solid fa-user"></i>
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Assign Ident Icon</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-600 tracking-[0.3em] ml-4">Full Name</label>
                <input 
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="e.g. Agent 007" 
                  className="w-full bg-black border border-white/10 rounded-3xl py-5 px-8 outline-none focus:border-yellow-400/50 transition-all font-bold text-lg" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-600 tracking-[0.3em] ml-4">Secure Frequency (Phone)</label>
                <input 
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="+1 (000) 000-0000" 
                  className="w-full bg-black border border-white/10 rounded-3xl py-5 px-8 outline-none focus:border-yellow-400/50 transition-all font-bold text-lg" 
                />
              </div>
            </div>

            <button 
              onClick={() => setShowNewContactModal(false)}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black py-6 rounded-3xl transition-all shadow-xl active:scale-95 uppercase tracking-[0.3em] text-sm"
            >
              Establish Protocol
            </button>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-neutral-900 border border-yellow-400/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] py-3 min-w-[220px] animate-in fade-in zoom-in duration-200"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => togglePin(contextMenu.chatId)}
            className="w-full text-left px-6 py-4 text-sm hover:bg-yellow-400/10 flex items-center space-x-4 transition-colors group"
          >
            <i className={`fa-solid ${chats.find(c => c.id === contextMenu.chatId)?.isPinned ? 'fa-thumbtack-slash' : 'fa-thumbtack'} text-yellow-400 group-hover:scale-110 transition-transform`}></i>
            <span className="font-black uppercase tracking-widest text-[11px]">{chats.find(c => c.id === contextMenu.chatId)?.isPinned ? 'Unpin Frequency' : 'Pin to Top'}</span>
          </button>
          <div className="h-px bg-white/5 my-2 mx-4"></div>
          <button className="w-full text-left px-6 py-4 text-sm hover:bg-red-500/10 text-red-400 flex items-center space-x-4 transition-colors">
            <i className="fa-solid fa-trash-can"></i>
            <span className="font-black uppercase tracking-widest text-[11px]">Delete Tunnel</span>
          </button>
        </div>
      )}

      {/* Sidebar Navigation */}
      <div className={`w-24 lg:w-96 border-r ${theme === 'night' ? 'border-white/5 bg-black' : 'border-gray-200 bg-white'} flex flex-col z-20 shadow-2xl`}>
        <div className="p-6 lg:p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setShowDrawer(true)}
              className="w-14 h-14 rounded-3xl hover:bg-white/5 border border-transparent hover:border-white/10 flex flex-col items-center justify-center space-y-1.5 group transition-all"
            >
              <div className="w-7 h-0.5 bg-yellow-400 group-hover:w-8 transition-all"></div>
              <div className="w-8 h-0.5 bg-yellow-400"></div>
              <div className="w-6 h-0.5 bg-yellow-400 group-hover:w-8 transition-all"></div>
            </button>
            <span className="hidden lg:block font-black text-3xl text-yellow-400 tracking-tighter italic">NIB SEC</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-2 custom-scrollbar">
          {chats.filter(c => c.isPinned).map(renderChatItem)}
          {chats.filter(c => c.isPinned).length > 0 && (
            <div className="flex items-center px-4 py-4">
              <div className="flex-1 h-px bg-white/5"></div>
              <span className="px-4 text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">Encrypted Feeds</span>
              <div className="flex-1 h-px bg-white/5"></div>
            </div>
          )}
          {chats.filter(c => !c.isPinned).map(renderChatItem)}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col relative ${theme === 'night' ? 'bg-black/40' : 'bg-gray-100'}`}>
        {/* Chat Header */}
        <div className={`h-20 lg:h-24 border-b ${theme === 'night' ? 'border-white/5 bg-black/60' : 'border-gray-200 bg-white/80'} backdrop-blur-3xl px-8 lg:px-12 flex items-center justify-between z-10`}>
          <div className="flex items-center space-x-6">
            <div className="w-14 h-14 hexagon p-0.5 bg-white/10 shadow-2xl">
              <img src={activeChat?.avatar} className="w-full h-full hexagon object-cover" />
            </div>
            <div>
              <div className="font-black text-2xl tracking-tight flex items-center">
                {activeChat?.name}
                {activeChat?.type === 'channel' && <i className="fa-solid fa-bullhorn text-[12px] ml-3 text-yellow-400/60"></i>}
              </div>
              <div className="text-[11px] text-gray-500 uppercase tracking-[0.3em] font-black">
                {activeChat?.type === 'saved' ? 'SECURE VAULT STORAGE' : (activeChat?.membersCount ? `${activeChat.membersCount.toLocaleString()} OPERATIVES` : 'SECURE CHANNEL OPEN')}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button className="hidden lg:flex w-14 h-14 rounded-[2rem] bg-white/5 border border-white/5 hover:border-yellow-400/40 items-center justify-center text-gray-500 hover:text-yellow-400 transition-all">
               <i className="fa-solid fa-magnifying-glass text-xl"></i>
            </button>
            <button onClick={onStartCall} className="w-14 h-14 rounded-[2rem] bg-yellow-400/5 hover:bg-yellow-400 text-yellow-400 hover:text-black transition-all flex items-center justify-center border border-yellow-400/20 shadow-xl group">
              <i className="fa-solid fa-phone text-xl group-hover:rotate-12 transition-transform"></i>
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 custom-scrollbar">
          <div className="flex justify-center sticky top-0 z-0 py-6">
            <span className="bg-black/80 backdrop-blur-2xl text-[11px] text-yellow-400/70 px-8 py-3 rounded-full uppercase tracking-[0.4em] border border-yellow-400/20 font-black shadow-2xl">
              <i className="fa-solid fa-shield-halved mr-3"></i>
              Node-to-Node AES-256 ACTIVE
            </span>
          </div>

          {mockMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%] lg:max-w-[70%] space-y-2">
                <div className={`p-6 rounded-[3rem] text-[15px] relative transition-all group ${
                  msg.senderId === 'user' 
                  ? 'bg-yellow-400 text-black font-black shadow-[0_15px_40px_rgba(250,204,21,0.2)]' 
                  : (theme === 'night' ? 'bg-[#0a0a0a] border border-white/5 text-gray-100 shadow-2xl' : 'bg-white border border-gray-200 text-gray-800 shadow-sm')
                }`}>
                  {msg.text}
                  <div className={`absolute top-0 ${msg.senderId === 'user' ? '-left-12' : '-right-12'} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-2`}>
                     <button className="text-gray-600 hover:text-yellow-400 p-2 bg-black/40 rounded-full backdrop-blur" title="Save Message">
                        <i className="fa-solid fa-bookmark text-sm"></i>
                     </button>
                     <button className="text-gray-600 hover:text-blue-400 p-2 bg-black/40 rounded-full backdrop-blur" title="Forward">
                        <i className="fa-solid fa-share text-sm"></i>
                     </button>
                  </div>
                </div>
                <div className={`text-[11px] px-6 text-gray-600 font-black uppercase tracking-widest ${msg.senderId === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg.senderId === 'user' && <i className="fa-solid fa-check-double ml-2 text-blue-500"></i>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className={`p-8 lg:p-10 border-t ${theme === 'night' ? 'bg-black/80 border-white/5' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center space-x-6 max-w-6xl mx-auto">
            <button className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-3xl hover:text-yellow-400 border border-white/5 hover:border-yellow-400/40 transition-all shrink-0">
              <i className="fa-solid fa-paperclip text-2xl"></i>
            </button>
            <div className="flex-1 relative">
              <input 
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="TRANSMIT SECURE SIGNAL..."
                className={`w-full bg-black/30 border ${theme === 'night' ? 'border-white/10' : 'border-gray-200'} rounded-[2.5rem] py-5 px-10 outline-none focus:border-yellow-400/40 transition-all font-black uppercase tracking-widest text-sm placeholder:text-gray-800`}
              />
            </div>
            <button className={`w-16 h-16 flex items-center justify-center rounded-3xl transition-all shadow-xl active:scale-95 ${messageInput.trim() ? 'bg-yellow-400 text-black' : 'bg-white/5 text-gray-800'}`}>
              <i className="fa-solid fa-paper-plane text-2xl"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainView;
