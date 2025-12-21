
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
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', senderId: 'nib_official', text: 'Operational security is our top priority Operative.', timestamp: Date.now() - 3600000 },
    { id: 'm2', senderId: 'user', text: 'Acknowledged. Node is online.', timestamp: Date.now() - 3000000 },
  ]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [walletStep, setWalletStep] = useState<'balance' | 'buy' | 'pay' | 'confirm' | 'waiting'>('balance');
  const [buyAmount, setBuyAmount] = useState('50');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, chatId: string } | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

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
      const newMessage: Message = {
        id: 'm-' + Date.now(),
        senderId: 'user',
        text: messageInput.trim(),
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      setIsTransmitting(false);
    }, 400);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeChat = chats.find(c => c.id === activeChatId);

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
          <span className="text-[10px] text-gray-600 font-bold">NOW</span>
        </div>
        <p className="text-xs text-gray-500 truncate w-full font-medium">{chat.lastMessage}</p>
      </div>
    </button>
  );

  return (
    <div className="h-full flex overflow-hidden relative">
      
      {/* Wallet Modal with Premium Cipher Card */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[300] flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-neutral-900 border border-white/5 rounded-[4rem] p-12 space-y-12 animate-in fade-in zoom-in duration-300 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400/20"></div>
             
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <i className="fa-solid fa-vault text-yellow-400 text-xl"></i>
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter">Vault Interface</h4>
                </div>
                <button onClick={() => setShowWalletModal(false)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-red-500 transition-colors"><i className="fa-solid fa-xmark"></i></button>
             </div>

             {/* The Cipher Card (VISA Style) */}
             <div className="glass-card w-full h-64 rounded-[2.5rem] p-10 flex flex-col justify-between group transition-transform hover:scale-[1.02]">
                <div className="flex justify-between items-start">
                   <div className="space-y-4">
                      <div className="w-14 h-10 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-lg flex items-center justify-center shadow-inner overflow-hidden border border-black/20">
                         <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                      </div>
                      <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.5em] embossed">Signal Protocol Active</p>
                   </div>
                   <div className="flex items-center space-x-2 text-yellow-400">
                      <i className="fa-solid fa-bee text-4xl"></i>
                      <span className="font-black italic text-xl">NIB SEC</span>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="text-2xl lg:text-3xl font-mono tracking-[0.3em] text-white/90 embossed">
                      {user.id.toUpperCase().replace(/(.{4})/g, '$1 ')}
                   </div>
                   <div className="flex justify-between items-end">
                      <div className="space-y-1">
                         <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Node Holder</p>
                         <p className="text-xs font-black uppercase tracking-widest text-white/80">{user.displayName}</p>
                      </div>
                      <div className="text-right space-y-1">
                         <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Valid Thru</p>
                         <p className="text-xs font-black tracking-widest text-white/80">09 / 28</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-black/40 rounded-[2.5rem] p-10 flex items-center justify-between border border-white/5">
                <div className="space-y-1">
                   <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Current Liquidity</p>
                   <div className="flex items-center space-x-2">
                      <span className="text-4xl font-black text-yellow-400">{user.walletBalance}</span>
                      <span className="text-sm font-black text-gray-400 mt-2">NIB</span>
                   </div>
                </div>
                <button 
                  onClick={() => setWalletStep('buy')}
                  className="px-10 py-5 bg-white text-black rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all active:scale-95 shadow-xl"
                >
                  RECHARGE SIGNAL
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Side Drawer Truncated for Space */}
      {showDrawer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]" onClick={() => setShowDrawer(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-80 lg:w-96 bg-[#080808] border-r border-white/5 flex flex-col" onClick={e => e.stopPropagation()}>
             <div className="p-10 space-y-8 bg-black/40">
                <div className="w-24 h-24 hexagon border-4 border-yellow-400 p-1 bg-neutral-800 shadow-2xl overflow-hidden">
                  <img src={user.avatarUrl} className="w-full h-full hexagon object-cover" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-2xl tracking-tighter uppercase">{user.displayName}</h3>
                  <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.3em]">{user.username}</p>
                </div>
             </div>
             <div className="flex-1 p-4 space-y-2">
                <button onClick={() => {setShowWalletModal(true); setShowDrawer(false);}} className="w-full flex items-center space-x-5 p-5 hover:bg-yellow-400/10 rounded-2xl transition-all group">
                   <i className="fa-solid fa-wallet text-gray-500 group-hover:text-yellow-400"></i>
                   <span className="font-black text-[11px] uppercase tracking-widest group-hover:text-yellow-400">Cipher Vault</span>
                </button>
                <button onClick={onSignOut} className="w-full flex items-center space-x-5 p-5 hover:bg-red-500/10 rounded-2xl transition-all group">
                   <i className="fa-solid fa-power-off text-gray-500 group-hover:text-red-500"></i>
                   <span className="font-black text-[11px] uppercase tracking-widest group-hover:text-red-500">Terminate</span>
                </button>
             </div>
          </div>
        </div>
      )}

      <div className="w-24 lg:w-96 border-r border-white/5 bg-black flex flex-col z-20">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
           <button onClick={() => setShowDrawer(true)} className="w-14 h-14 rounded-3xl hover:bg-white/5 border border-transparent hover:border-white/10 flex flex-col items-center justify-center space-y-1.5 group transition-all">
              <div className="w-7 h-0.5 bg-yellow-400 group-hover:w-8 transition-all"></div><div className="w-8 h-0.5 bg-yellow-400"></div><div className="w-6 h-0.5 bg-yellow-400 group-hover:w-8 transition-all"></div>
           </button>
           <span className="hidden lg:block font-black text-3xl text-yellow-400 tracking-tighter italic">NIB SEC</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-2 custom-scrollbar">
           {chats.map(renderChatItem)}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative bg-black/40">
        <div className="h-24 lg:h-28 border-b border-white/5 bg-black/60 backdrop-blur-3xl px-12 flex items-center justify-between z-10">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 hexagon p-0.5 bg-white/10 relative shadow-2xl">
              <img src={activeChat?.avatar} className="w-full h-full hexagon object-cover" />
            </div>
            <div>
              <div className="font-black text-2xl lg:text-3xl tracking-tighter flex items-center uppercase">{activeChat?.name}</div>
              <div className="flex items-center space-x-2">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 <p className="text-[11px] text-gray-500 uppercase tracking-[0.3em] font-black">ACTIVE NODE</p>
              </div>
            </div>
          </div>
          <button onClick={onStartCall} className="w-16 h-16 rounded-[2.5rem] bg-yellow-400 text-black hover:bg-white transition-all flex items-center justify-center shadow-[0_15px_40px_rgba(250,204,21,0.3)]"><i className="fa-solid fa-phone text-2xl"></i></button>
        </div>

        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
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

        {/* Improved Message Input Area */}
        <div className="p-10 border-t bg-black/80 border-white/5">
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
                {isTransmitting && <span className="text-[9px] text-yellow-400 font-black uppercase tracking-widest animate-pulse">Transmitting Packet...</span>}
             </div>

             <div className="flex items-center space-x-6">
                <button className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-3xl hover:text-yellow-400 border border-white/5 hover:border-yellow-400/40 transition-all shrink-0"><i className="fa-solid fa-paperclip text-2xl"></i></button>
                <div className="flex-1 relative">
                   <input 
                    type="text" 
                    value={messageInput} 
                    onChange={(e) => setMessageInput(e.target.value)} 
                    onKeyDown={handleKeyPress}
                    disabled={isTransmitting}
                    placeholder="TRANSMIT SECURE SIGNAL..." 
                    className="w-full bg-black/50 border border-white/10 rounded-[3rem] py-6 px-12 outline-none focus:border-yellow-400/50 transition-all font-black uppercase tracking-[0.2em] text-sm shadow-inner text-white placeholder:text-gray-800" 
                  />
                  {messageInput && !isTransmitting && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-yellow-400/50 animate-pulse">
                      <i className="fa-solid fa-wave-square"></i>
                    </div>
                  )}
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
