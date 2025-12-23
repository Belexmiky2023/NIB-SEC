
import React, { useState, useEffect, useRef } from 'react';
import { User, Chat, Message, Theme, PaymentRequest } from '../types';

interface MainViewProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  onStartCall: (contact: Chat) => void;
  onSignOut: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const initialMockChats: Chat[] = [
  { id: 'nib_official', name: 'NIB SEC HQ', type: 'channel', avatar: 'https://i.ibb.co/3ykXF4K/nib-logo.png', unreadCount: 1, membersCount: 32400, lastMessage: 'All nodes green.', isPinned: true, isVerified: true },
  { id: 'saved', name: 'Secure Vault', type: 'saved', avatar: 'https://cdn-icons-png.flaticon.com/512/566/566412.png', unreadCount: 0, lastMessage: 'Cloud signal active.', isPinned: true },
];

const MainView: React.FC<MainViewProps> = ({ user, setUser, onStartCall, onSignOut, theme, toggleTheme }) => {
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('nib_chats');
    return saved ? JSON.parse(saved) : initialMockChats;
  });
  const [activeChatId, setActiveChatId] = useState<string | null>('nib_official');
  const [messageInput, setMessageInput] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [balanceAnimate, setBalanceAnimate] = useState(false);
  
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('nib_message_history');
    return saved ? JSON.parse(saved) : {
      'nib_official': [{ id: 'm1', senderId: 'nib_official', text: 'Connection established. Welcome back, operative.', timestamp: Date.now() - 3600000 }]
    };
  });

  const [showWallet, setShowWallet] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [walletStep, setWalletStep] = useState<'balance' | 'buy' | 'telebirr' | 'waiting'>('balance');
  const [buyQuantity, setBuyQuantity] = useState('100');
  const [paymentSuccessData, setPaymentSuccessData] = useState<any>(null);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const userIdRef = useRef(user.id);
  const currentBalanceRef = useRef(user.walletBalance);

  useEffect(() => {
    userIdRef.current = user.id;
    currentBalanceRef.current = user.walletBalance;
  }, [user]);

  useEffect(() => {
    const syncNode = async () => {
      setIsSyncing(true);
      try {
        const response = await fetch(`/api/user/sync?id=${userIdRef.current}`);
        if (response.ok) {
          const remoteData: User = await response.json();
          if (remoteData.isBanned) {
            setUser(remoteData);
            localStorage.removeItem('nib_sec_user_data');
            localStorage.removeItem('nib_sec_app_state');
            return;
          }
          if (remoteData.walletBalance !== currentBalanceRef.current) {
            const diff = parseFloat(remoteData.walletBalance) - parseFloat(currentBalanceRef.current);
            if (diff > 0) setPaymentSuccessData({ amount: diff.toFixed(0) });
            setBalanceAnimate(true);
            setUser(remoteData);
            setTimeout(() => setBalanceAnimate(false), 2000);
          } else {
            setUser(remoteData);
          }
        }
      } catch (err) {
        console.warn('[HEARTBEAT] Signal interference detected.');
      } finally {
        setTimeout(() => setIsSyncing(false), 800);
      }
    };
    const heartbeatInterval = setInterval(syncNode, 8000);
    return () => clearInterval(heartbeatInterval);
  }, [setUser]);

  const submitCoinRequest = async () => {
    try {
      const newReq: PaymentRequest = { 
        id: 'req-' + Date.now(), 
        userId: user.id, 
        username: user.username || user.displayName, 
        amount: buyQuantity, 
        method: 'Telebirr', 
        timestamp: Date.now(), 
        status: 'pending' 
      };
      await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq),
      });
      setWalletStep('waiting');
    } catch (err) {
      alert('Network error. Handshake failed.');
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || isTransmitting || !activeChatId) return;
    setIsTransmitting(true);
    const msgText = messageInput.trim();
    const newMessage: Message = { id: 'm-' + Date.now(), senderId: 'user', text: msgText, timestamp: Date.now() };
    const updatedMessages = { ...chatMessages, [activeChatId]: [...(chatMessages[activeChatId] || []), newMessage] };
    setChatMessages(updatedMessages);
    localStorage.setItem('nib_message_history', JSON.stringify(updatedMessages));
    const updatedChats = chats.map(c => c.id === activeChatId ? { ...c, lastMessage: msgText } : c);
    setChats(updatedChats);
    localStorage.setItem('nib_chats', JSON.stringify(updatedChats));
    setMessageInput('');
    setTimeout(() => setIsTransmitting(false), 100);
  };

  const renderChatItem = (chat: Chat) => (
    <div key={chat.id} className={`w-full flex items-center space-x-4 p-5 rounded-[2.5rem] cursor-pointer transition-all ${activeChatId === chat.id ? 'bg-yellow-400/10 border border-yellow-400/20 shadow-2xl' : 'hover:bg-white/5 border border-transparent'}`} onClick={() => setActiveChatId(chat.id)}>
      <div className="relative shrink-0">
        <div className={`w-14 h-14 hexagon p-0.5 ${chat.isPinned ? 'bg-yellow-400' : 'bg-neutral-800'}`}>
          <img src={chat.avatar} className="w-full h-full hexagon object-cover" alt={chat.name} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span className="font-bold text-[13px] truncate uppercase tracking-tight text-white">{chat.name}{chat.isVerified && <i className="fa-solid fa-circle-check text-yellow-400 text-[9px] ml-1.5"></i>}</span>
        </div>
        <p className="text-[10px] text-gray-600 truncate uppercase font-mono tracking-widest">{chat.lastMessage}</p>
      </div>
    </div>
  );

  const activeChat = chats.find(c => c.id === activeChatId);
  const currentMessages = activeChatId ? (chatMessages[activeChatId] || []) : [];

  return (
    <div className="h-full flex overflow-hidden relative selection:bg-yellow-400 selection:text-black">
      <div className={`fixed top-6 right-6 z-[2000] flex items-center space-x-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/5 transition-all duration-500 ${isSyncing ? 'opacity-100' : 'opacity-40'}`}>
         <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-yellow-400 animate-ping' : 'bg-gray-800'}`}></div>
         <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Neural Link</span>
      </div>

      {showNewChat && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-[#080808] border border-yellow-400/10 rounded-[4rem] p-12 relative shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">New Transmission</h2>
                <button onClick={() => setShowNewChat(false)} className="text-gray-500 hover:text-white"><i className="fa-solid fa-xmark text-xl"></i></button>
              </div>
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-gray-700"></i>
                <input 
                  type="text" 
                  value={newChatSearch}
                  onChange={(e) => setNewChatSearch(e.target.value)}
                  placeholder="SEARCH NODES..." 
                  className="w-full bg-black border border-white/10 rounded-3xl py-5 pl-14 pr-8 text-[11px] font-black uppercase tracking-[0.2em] text-white outline-none focus:border-yellow-400/50 transition-all"
                />
              </div>
           </div>
        </div>
      )}

      {paymentSuccessData && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in zoom-in-95 duration-500">
           <div className="w-full max-w-2xl bg-[#080808] border-2 border-yellow-400 rounded-[4rem] p-12 text-center space-y-10 shadow-[0_0_120px_rgba(250,204,21,0.3)]">
              <div className="flex justify-center">
                 <div className="w-32 h-32 hexagon bg-yellow-400 flex items-center justify-center text-black shadow-[0_0_50px_rgba(250,204,21,0.6)] animate-bounce">
                    <i className="fa-solid fa-bolt-lightning text-6xl"></i>
                 </div>
              </div>
              <div className="space-y-4">
                 <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter">Signal Refuelled</h2>
                 <p className="text-yellow-400 font-black uppercase tracking-[0.3em] text-xl">+{paymentSuccessData.amount} NIB CREDITS</p>
              </div>
              <button onClick={() => setPaymentSuccessData(null)} className="w-full py-8 bg-yellow-400 text-black rounded-3xl font-black uppercase text-lg shadow-glow hover:scale-105 active:scale-95 transition-all">Receive Credits</button>
           </div>
        </div>
      )}

      <div className="w-24 lg:w-[380px] bg-[#050505] border-r border-white/5 flex flex-col z-20 relative">
        <div className="h-28 px-8 flex items-center justify-between shrink-0 border-b border-white/5">
           <button onClick={onSignOut} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-red-500 transition-all"><i className="fa-solid fa-power-off"></i></button>
           <h1 className="hidden lg:block text-xl font-black text-white uppercase italic tracking-tighter">NIB <span className="text-yellow-400">SEC</span></h1>
           <button onClick={() => setShowNewChat(true)} className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center text-black shadow-glow"><i className="fa-solid fa-plus text-xl"></i></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
           <div className="space-y-2">
              <h4 className="px-6 text-[9px] text-gray-800 font-black uppercase tracking-[0.4em]">Vaulted</h4>
              {chats.filter(c => c.isPinned).map(renderChatItem)}
           </div>
           <div className="space-y-2">
              <h4 className="px-6 text-[9px] text-gray-800 font-black uppercase tracking-[0.4em]">Active Signal</h4>
              {chats.filter(c => !c.isPinned).map(renderChatItem)}
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative bg-[#020202]">
        {activeChatId ? (
          <>
            <div className="h-28 px-12 flex items-center justify-between border-b border-white/5 bg-black/20 z-10 backdrop-blur-md">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 hexagon p-0.5 bg-yellow-400"><img src={activeChat?.avatar} className="w-full h-full hexagon object-cover" /></div>
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase text-white flex items-center">{activeChat?.name}</h2>
                  <div className="flex items-center space-x-2 text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span>Encrypted Tunnel</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4">
                 <button onClick={() => setShowWallet(true)} className={`px-6 py-3 rounded-xl border font-black uppercase tracking-widest text-[10px] transition-all ${balanceAnimate ? 'bg-yellow-400 text-black border-yellow-400 scale-110 shadow-glow' : 'bg-white/5 text-yellow-400 border-white/5 hover:bg-yellow-400/10'}`}>
                    {user.walletBalance} NIB
                 </button>
                 <button onClick={() => activeChat && onStartCall(activeChat)} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white hover:text-yellow-400 transition-all shadow-md"><i className="fa-solid fa-phone"></i></button>
              </div>
            </div>
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-12 space-y-8 custom-scrollbar">
              {currentMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-6 rounded-[2.5rem] text-sm leading-relaxed shadow-xl animate-msg ${msg.senderId === 'user' ? 'bg-yellow-400 text-black font-black rounded-tr-none' : 'bg-[#0a0a0a] border border-white/5 text-gray-200 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-black/40 border-t border-white/5">
              <div className="flex items-center space-x-6 max-w-6xl mx-auto">
                 <input type="text" value={messageInput} onChange={e => setMessageInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="TYPE SECURED TRANSMISSION..." className="flex-1 bg-black border border-white/10 rounded-[2rem] py-5 px-10 outline-none text-[11px] font-black uppercase tracking-[0.2em] text-white focus:border-yellow-400/30 shadow-inner transition-all" />
                 <button onClick={handleSendMessage} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${messageInput.trim() ? 'bg-yellow-400 text-black shadow-glow' : 'bg-white/5 text-gray-800'}`}><i className="fa-solid fa-paper-plane"></i></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20"><i className="fa-solid fa-bee text-9xl text-yellow-400 mb-8 animate-pulse"></i><h2 className="text-3xl font-black uppercase tracking-[0.5em]">Awaiting Link</h2></div>
        )}
      </div>

      {showWallet && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-[#080808] border border-yellow-400/10 rounded-[4rem] p-12 relative shadow-2xl">
              {walletStep === 'balance' && (
                <div className="space-y-10">
                   <div className="flex justify-between items-center"><h2 className="text-3xl font-black italic uppercase text-white">Node Credits</h2><button onClick={() => setShowWallet(false)} className="text-gray-500 hover:text-white"><i className="fa-solid fa-xmark text-xl"></i></button></div>
                   <div className="bg-black/60 rounded-[3rem] p-12 border border-white/5 text-center space-y-8">
                      <div className="space-y-2"><p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">Current Liquid</p><h3 className="text-7xl font-black text-yellow-400 drop-shadow-glow">{user.walletBalance} <span className="text-xl text-white/30 tracking-widest">NIB</span></h3></div>
                      <button onClick={() => setWalletStep('buy')} className="w-full py-6 bg-yellow-400 text-black rounded-3xl font-black uppercase text-xs hover:scale-105 active:scale-95 transition-all shadow-glow">Request Signal</button>
                   </div>
                </div>
              )}
              {walletStep === 'buy' && (
                <div className="space-y-8">
                   <div className="flex items-center space-x-4"><button onClick={() => setWalletStep('balance')} className="text-yellow-400"><i className="fa-solid fa-arrow-left"></i></button><h3 className="text-xl font-black uppercase italic text-white">Select Quantity</h3></div>
                   <input type="number" min="50" step="50" value={buyQuantity} onChange={(e) => setBuyQuantity(e.target.value)} className="w-full bg-black border border-white/10 rounded-[2.5rem] py-8 px-10 text-5xl font-black text-yellow-400 text-center outline-none focus:border-yellow-400/50 transition-all shadow-inner" />
                   <button onClick={() => setWalletStep('telebirr')} className="w-full py-6 bg-yellow-400 text-black rounded-3xl font-black uppercase text-xs shadow-xl">Handshake</button>
                </div>
              )}
              {walletStep === 'telebirr' && (
                <div className="space-y-10 text-center">
                   <div className="space-y-4"><div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl"><i className="fa-solid fa-mobile text-white text-3xl"></i></div><h4 className="text-xl font-black text-white italic uppercase">Telebirr Node</h4></div>
                   <div className="bg-black p-10 rounded-[3.5rem] border border-yellow-400/20 space-y-2 shadow-inner"><p className="text-[10px] text-gray-600 uppercase tracking-widest">Protocol ID</p><p className="text-4xl font-mono font-black text-yellow-400">0978366565</p><p className="text-sm font-black text-white">Alemseged</p></div>
                   <button onClick={submitCoinRequest} className="w-full py-6 bg-yellow-400 text-black rounded-3xl font-black uppercase text-xs hover:scale-105 transition-all shadow-glow">Confirm Signal</button>
                </div>
              )}
              {walletStep === 'waiting' && (
                <div className="text-center space-y-10 py-10">
                   <div className="w-24 h-24 hexagon bg-white/5 mx-auto flex items-center justify-center"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-yellow-400"></i></div>
                   <div className="space-y-4"><h3 className="text-2xl font-black uppercase italic text-white">Sync Pending</h3><p className="text-xs text-gray-500 uppercase leading-relaxed max-w-xs mx-auto">Overseer is verifying the ledger entry. Signal updates every 8s.</p></div>
                   <button onClick={() => setShowWallet(false)} className="w-full py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:text-white transition-colors">Close Tunnel</button>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default MainView;
