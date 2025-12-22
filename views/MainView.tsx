
import React, { useState, useEffect, useRef } from 'react';
import { User, Chat, Message, Theme, PaymentRequest } from '../types';

interface MainViewProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  onStartCall: () => void;
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
  
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('nib_message_history');
    return saved ? JSON.parse(saved) : {
      'nib_official': [{ id: 'm1', senderId: 'nib_official', text: 'Connection established. Welcome back, operative.', timestamp: Date.now() - 3600000 }]
    };
  });

  const [showHamburger, setShowHamburger] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [walletStep, setWalletStep] = useState<'balance' | 'buy' | 'telebirr' | 'waiting'>('balance');
  const [buyQuantity, setBuyQuantity] = useState('100');
  const [paymentSuccessData, setPaymentSuccessData] = useState<any>(null);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const activeChat = chats.find(c => c.id === activeChatId);
  const currentMessages = activeChatId ? (chatMessages[activeChatId] || []) : [];

  const broadcastSignal = (type: 'AUTH' | 'SIGNAL' | 'LIQUIDITY' | 'ALERT' | 'SYSTEM', message: string) => {
    const signalLog = JSON.parse(localStorage.getItem('nib_global_signals') || '[]');
    const newSignal = { id: Date.now(), sender: user.displayName, type, content: message, timestamp: Date.now() };
    localStorage.setItem('nib_global_signals', JSON.stringify([newSignal, ...signalLog].slice(0, 100)));
  };

  useEffect(() => {
    const heartbeat = () => {
      // Keep node alive in admin view
      const liveNodes = JSON.parse(localStorage.getItem('nib_live_nodes') || '{}');
      liveNodes[user.id] = { ...user, lastSeen: Date.now() };
      localStorage.setItem('nib_live_nodes', JSON.stringify(liveNodes));

      // Sync wallet balance if admin changed it
      const savedOps = localStorage.getItem('nib_admin_ops');
      if (savedOps) {
        const ops: User[] = JSON.parse(savedOps);
        const myNode = ops.find(o => o.id === user.id);
        if (myNode && myNode.walletBalance !== user.walletBalance) {
          setUser(prev => prev ? { ...prev, walletBalance: myNode.walletBalance } : null);
        }
      }

      // Check for payment success notification
      const successKey = `nib_payment_success_${user.id}`;
      const successRaw = localStorage.getItem(successKey);
      if (successRaw) {
        const data = JSON.parse(successRaw);
        setPaymentSuccessData(data);
        localStorage.removeItem(successKey);
        setShowWallet(false);
      }
    };
    heartbeat();
    const inv = setInterval(heartbeat, 3000);
    return () => clearInterval(inv);
  }, [user, setUser]);

  const submitCoinRequest = () => {
    try {
      const requestsStr = localStorage.getItem('nib_admin_pays');
      const requests: PaymentRequest[] = requestsStr ? JSON.parse(requestsStr) : [];
      
      const newReq: PaymentRequest = { 
        id: 'req-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4), 
        userId: user.id, 
        username: user.username || user.displayName, 
        amount: buyQuantity, 
        method: 'Telebirr', 
        timestamp: Date.now(), 
        status: 'pending' 
      };

      const updatedRequests = [...requests, newReq];
      localStorage.setItem('nib_admin_pays', JSON.stringify(updatedRequests));
      
      console.log('Purchase Request Created:', newReq);
      broadcastSignal('LIQUIDITY', `Initiated liquidation request for ${buyQuantity} Signal Coins.`);
      setWalletStep('waiting');
    } catch (err) {
      console.error('Failed to create purchase request', err);
      alert('Network error. Failed to initiate handshake.');
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
    setTimeout(() => setIsTransmitting(false), 200);
  };

  const startChatWithOperative = (op: User) => {
    const existing = chats.find(c => c.id === op.id);
    if (existing) {
      setActiveChatId(op.id);
    } else {
      const newChat: Chat = {
        id: op.id,
        name: op.displayName,
        type: 'direct',
        avatar: op.avatarUrl,
        unreadCount: 0,
        lastMessage: 'Encryption tunnel initialized.'
      };
      const updatedChats = [newChat, ...chats];
      setChats(updatedChats);
      localStorage.setItem('nib_chats', JSON.stringify(updatedChats));
      setActiveChatId(op.id);
    }
    setShowNewChat(false);
    setNewChatSearch('');
  };

  const renderChatItem = (chat: Chat) => (
    <div key={chat.id} className={`w-full flex items-center space-x-4 p-5 rounded-[2.5rem] cursor-pointer transition-all ${activeChatId === chat.id ? 'bg-yellow-400/10 border border-yellow-400/20 shadow-2xl' : 'hover:bg-white/5 border border-transparent'}`} onClick={() => { setActiveChatId(chat.id); setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c)); }}>
      <div className="relative shrink-0">
        <div className={`w-14 h-14 hexagon p-0.5 ${chat.isPinned ? 'bg-yellow-400' : 'bg-neutral-800'}`}><img src={chat.avatar} className="w-full h-full hexagon object-cover" alt={chat.name} /></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5"><span className="font-bold text-[13px] truncate uppercase tracking-tight text-white">{chat.name}{chat.isVerified && <i className="fa-solid fa-circle-check text-yellow-400 text-[9px] ml-1.5 verified-glow"></i>}</span></div>
        <p className="text-[10px] text-gray-600 truncate uppercase font-mono tracking-widest">{chat.lastMessage}</p>
      </div>
    </div>
  );

  const operatives: User[] = JSON.parse(localStorage.getItem('nib_admin_ops') || '[]').filter((o: User) => o.id !== user.id);
  const filteredOps = operatives.filter(o => 
    o.displayName.toLowerCase().includes(newChatSearch.toLowerCase()) || 
    (o.username && o.username.toLowerCase().includes(newChatSearch.toLowerCase()))
  );

  return (
    <div className="h-full flex overflow-hidden relative">
      {/* NEW CHAT MODAL */}
      {showNewChat && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-[#080808] border border-yellow-400/10 rounded-[4rem] p-12 relative shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">New Transmission</h2>
                <button onClick={() => setShowNewChat(false)} className="text-gray-500 hover:text-white transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
              </div>
              <div className="space-y-6">
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-gray-700"></i>
                  <input 
                    type="text" 
                    value={newChatSearch}
                    onChange={(e) => setNewChatSearch(e.target.value)}
                    placeholder="SEARCH OPERATIVE..." 
                    className="w-full bg-black border border-white/10 rounded-3xl py-5 pl-14 pr-8 text-[11px] font-black uppercase tracking-[0.2em] text-white outline-none focus:border-yellow-400/50 shadow-inner"
                  />
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-4 pr-2">
                  {filteredOps.length > 0 ? filteredOps.map(op => (
                    <button key={op.id} onClick={() => startChatWithOperative(op)} className="w-full flex items-center space-x-6 p-6 rounded-[2.5rem] bg-white/5 border border-transparent hover:border-yellow-400/30 hover:bg-yellow-400/5 transition-all text-left group">
                       <div className="w-16 h-16 hexagon p-0.5 bg-yellow-400/20 shadow-glow"><img src={op.avatarUrl} className="w-full h-full hexagon object-cover grayscale group-hover:grayscale-0" /></div>
                       <div className="flex-1">
                         <p className="text-white font-black uppercase tracking-tight">{op.displayName}</p>
                         <p className="text-[10px] text-gray-500 font-mono">{op.username}</p>
                       </div>
                       <div className="w-10 h-10 rounded-full flex items-center justify-center text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-solid fa-message"></i></div>
                    </button>
                  )) : (
                    <div className="text-center py-20 opacity-20 font-black uppercase tracking-[0.4em]">No matching nodes found</div>
                  )}
                </div>
              </div>
           </div>
        </div>
      )}

      {/* FINAL DESIGN PAYMENT SUCCESS MODAL */}
      {paymentSuccessData && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in zoom-in-95 duration-500">
           <div className="w-full max-w-2xl bg-[#080808] border-2 border-yellow-400 rounded-[4rem] p-12 text-center space-y-10 shadow-[0_0_120px_rgba(250,204,21,0.3)]">
              <div className="flex justify-center">
                 <div className="w-32 h-32 hexagon bg-yellow-400 flex items-center justify-center text-black shadow-[0_0_50px_rgba(250,204,21,0.6)] animate-bounce">
                    <i className="fa-solid fa-circle-check text-6xl"></i>
                 </div>
              </div>
              <div className="space-y-6">
                 <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter">Payment Accepted</h2>
                 <p className="text-yellow-400 font-black uppercase tracking-[0.2em] text-xl">
                    Your payment was accepted. You Got {paymentSuccessData.amount} NIB
                 </p>
              </div>
              <div className="space-y-8">
                 <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.4em] opacity-80 border-b border-white/5 pb-4">
                    Thanks To Buy ({paymentSuccessData.amount} NIB coin)
                 </p>
                 <h3 className="text-white text-3xl font-black uppercase leading-tight italic max-w-lg mx-auto drop-shadow-md">
                    Your Account Has Been Added ({paymentSuccessData.amount} Nib Coin)
                 </h3>
              </div>
              <button 
                onClick={() => setPaymentSuccessData(null)} 
                className="w-full py-8 bg-yellow-400 text-black rounded-3xl font-black uppercase text-lg shadow-[0_20px_40px_rgba(250,204,21,0.3)] hover:scale-105 active:scale-95 transition-all tracking-widest"
              >
                Continue
              </button>
           </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="w-24 lg:w-[380px] bg-[#050505] border-r border-white/5 flex flex-col z-20 relative shadow-2xl">
        <div className="h-28 px-8 flex items-center justify-between shrink-0 border-b border-white/5 bg-black/40 backdrop-blur-md">
           <button onClick={() => setShowHamburger(true)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-yellow-400 hover:bg-yellow-400/10 transition-all shadow-md"><i className="fa-solid fa-bars-staggered"></i></button>
           <h1 className="hidden lg:block text-xl font-black text-white uppercase italic tracking-tighter">NIB <span className="text-yellow-400">SEC</span></h1>
           <button onClick={() => setShowNewChat(true)} className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all shadow-glow"><i className="fa-solid fa-plus text-xl"></i></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
           <div className="space-y-2">
              <h4 className="px-6 text-[9px] text-gray-800 font-black uppercase tracking-[0.4em]">Pinned / HQ</h4>
              {chats.filter(c => c.isPinned).map(renderChatItem)}
           </div>
           <div className="space-y-2">
              <h4 className="px-6 text-[9px] text-gray-800 font-black uppercase tracking-[0.4em]">Direct Signal</h4>
              {chats.filter(c => !c.isPinned).map(renderChatItem)}
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative bg-[#020202]">
        {activeChatId ? (
          <>
            <div className="h-28 px-12 flex items-center justify-between border-b border-white/5 bg-black/20 z-10 shadow-xl backdrop-blur-md">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 hexagon p-0.5 bg-yellow-400"><img src={activeChat?.avatar} className="w-full h-full hexagon object-cover" /></div>
                <div><h2 className="text-2xl font-black tracking-tighter uppercase text-white flex items-center">{activeChat?.name}</h2><div className="flex items-center space-x-2 text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]"><span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></span><span>Synchronized Tunnel</span></div></div>
              </div>
              <div className="flex space-x-4">
                 <button onClick={() => setShowWallet(true)} className="bg-yellow-400/5 px-6 py-3 rounded-xl border border-yellow-400/10 text-yellow-400 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all">Wallet</button>
                 <button onClick={onStartCall} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white hover:text-yellow-400 transition-all"><i className="fa-solid fa-phone"></i></button>
              </div>
            </div>
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-12 space-y-8 custom-scrollbar">
              {currentMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[75%] space-y-2 animate-msg">
                    <div className={`p-6 rounded-[2.5rem] text-sm leading-relaxed shadow-xl ${msg.senderId === 'user' ? 'bg-yellow-400 text-black font-black rounded-tr-none' : 'bg-[#0a0a0a] border border-white/5 text-gray-200 rounded-tl-none'}`}>{msg.text}</div>
                    <p className={`text-[9px] px-6 text-gray-700 font-mono ${msg.senderId === 'user' ? 'text-right' : 'text-left'}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-black/40 border-t border-white/5">
              <div className="flex items-center space-x-6 max-w-6xl mx-auto">
                 <input type="text" value={messageInput} onChange={e => setMessageInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="TYPE ENCRYPTED MESSAGE..." className="flex-1 bg-black border border-white/10 rounded-[2rem] py-5 px-10 outline-none text-[11px] font-black uppercase tracking-[0.2em] text-white focus:border-yellow-400/30 shadow-inner" />
                 <button onClick={handleSendMessage} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${messageInput.trim() ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-white/5 text-gray-800'}`}><i className="fa-solid fa-paper-plane"></i></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20"><i className="fa-solid fa-bee text-9xl text-yellow-400 mb-8 animate-pulse"></i><h2 className="text-3xl font-black uppercase tracking-[0.5em]">Awaiting Selection</h2></div>
        )}
      </div>

      {showWallet && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-[#080808] border border-yellow-400/10 rounded-[4rem] p-12 relative shadow-2xl">
              {walletStep === 'balance' && (
                <div className="space-y-10">
                   <div className="flex justify-between items-center"><h2 className="text-3xl font-black italic uppercase text-white">Signal Bank</h2><button onClick={() => setShowWallet(false)} className="text-gray-500 hover:text-white transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button></div>
                   <div className="bg-black/60 rounded-[3rem] p-12 border border-white/5 text-center space-y-8">
                      <div className="space-y-2"><p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">Current Liquidity</p><h3 className="text-7xl font-black text-yellow-400 drop-shadow-glow">{user.walletBalance} <span className="text-xl text-white/30 tracking-widest">NIB</span></h3></div>
                      <button onClick={() => setWalletStep('buy')} className="w-full py-6 bg-yellow-400 text-black rounded-3xl font-black uppercase text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-yellow-400/10">Acquire Signal</button>
                   </div>
                </div>
              )}
              {walletStep === 'buy' && (
                <div className="space-y-8">
                   <div className="flex items-center space-x-4"><button onClick={() => setWalletStep('balance')} className="text-yellow-400 hover:scale-110 transition-transform"><i className="fa-solid fa-arrow-left"></i></button><h3 className="text-xl font-black uppercase italic text-white">Select Quantity</h3></div>
                   <input type="number" min="50" value={buyQuantity} onChange={(e) => setBuyQuantity(e.target.value)} className="w-full bg-black border border-white/10 rounded-[2.5rem] py-8 px-10 text-5xl font-black text-yellow-400 text-center outline-none focus:border-yellow-400/50 transition-all shadow-inner" />
                   <button onClick={() => setWalletStep('telebirr')} className="w-full py-6 bg-yellow-400 text-black rounded-3xl font-black uppercase text-xs shadow-xl">Proceed</button>
                </div>
              )}
              {walletStep === 'telebirr' && (
                <div className="space-y-10 text-center">
                   <div className="space-y-4"><div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl"><i className="fa-solid fa-mobile text-white text-3xl"></i></div><h4 className="text-xl font-black text-white italic uppercase">Telebirr Handshake</h4></div>
                   <div className="bg-black p-10 rounded-[3.5rem] border border-yellow-400/20 space-y-2 shadow-inner"><p className="text-[10px] text-gray-600 uppercase tracking-widest">Target Node ID</p><p className="text-4xl font-mono font-black text-yellow-400">0978366565</p><p className="text-sm font-black text-white">Alemseged</p></div>
                   <button onClick={submitCoinRequest} className="w-full py-6 bg-yellow-400 text-black rounded-3xl font-black uppercase text-xs hover:scale-105 transition-all shadow-glow">Verify Transaction</button>
                </div>
              )}
              {walletStep === 'waiting' && (
                <div className="text-center space-y-10 py-10">
                   <i className="fa-solid fa-circle-notch fa-spin text-7xl text-yellow-400"></i>
                   <div className="space-y-4"><h3 className="text-2xl font-black uppercase italic text-white">Signal Pending</h3><p className="text-xs text-gray-500 uppercase leading-relaxed max-w-xs mx-auto">Admin is verifying your node. Synchronization takes 3h-72h.</p></div>
                   <button onClick={() => setShowWallet(false)} className="w-full py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:text-white transition-colors">Close</button>
                </div>
              )}
           </div>
        </div>
      )}

      {showHamburger && (
        <div className="fixed inset-0 z-[700] flex">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowHamburger(false)}></div>
           <div className="w-80 h-full bg-[#080808] border-r border-yellow-400/20 z-10 p-10 flex flex-col animate-in slide-in-from-left duration-300 shadow-2xl">
              <div className="mb-12 text-center lg:text-left">
                 <div className="w-24 h-24 hexagon bg-yellow-400 p-1 mb-6 shadow-glow mx-auto lg:mx-0"><img src={user.avatarUrl} className="w-full h-full hexagon object-cover" /></div>
                 <h3 className="text-xl font-black text-white italic uppercase">{user.displayName}</h3>
                 <p className="text-[10px] text-yellow-400/50 uppercase font-mono">{user.username}</p>
              </div>
              <div className="flex-1 space-y-2">
                 {[ 
                   { icon: 'fa-user', label: 'Identity Settings' }, 
                   { icon: 'fa-vault', label: 'Signal Vault', action: () => setShowWallet(true) }, 
                   { icon: 'fa-moon', label: theme === 'night' ? 'Daylight Protocol' : 'Shadow Protocol', action: toggleTheme }, 
                   { icon: 'fa-power-off', label: 'Terminate Session', action: onSignOut, color: 'text-red-500' } 
                 ].map((item, i) => (
                   <button key={i} onClick={() => { item.action?.(); setShowHamburger(false); }} className={`w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-white/5 transition-all text-left group ${item.color || 'text-gray-400'}`}>
                      <i className={`fa-solid ${item.icon} w-6 transition-transform group-hover:scale-125`}></i><span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MainView;
