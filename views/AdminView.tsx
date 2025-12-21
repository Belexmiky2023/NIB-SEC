
import React, { useState, useEffect } from 'react';
import { User, PaymentRequest, Chat } from '../types';

interface AdminViewProps {
  onExit: () => void;
}

interface AdminEvent {
  id: string;
  type: 'login' | 'payment' | 'system' | 'action';
  message: string;
  timestamp: number;
}

const AdminView: React.FC<AdminViewProps> = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState<'operatives' | 'vault' | 'channels' | 'network'>('operatives');
  const [operatives, setOperatives] = useState<User[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [mainChannel, setMainChannel] = useState<Chat>(() => {
    const saved = localStorage.getItem('nib_chats');
    const chats = saved ? JSON.parse(saved) : [];
    return chats.find((c: Chat) => c.id === 'nib_official') || {
      id: 'nib_official',
      name: 'NIB SEC',
      type: 'channel',
      avatar: 'https://i.ibb.co/3ykXF4K/nib-logo.png',
      unreadCount: 0,
      membersCount: 25800,
      isVerified: true
    };
  });

  // Local Storage Monitoring for "users who login"
  useEffect(() => {
    const loadData = () => {
      // Load current site user if exists
      const currentUserData = localStorage.getItem('nib_sec_user_data');
      const savedOps = localStorage.getItem('nib_admin_ops');
      const savedPays = localStorage.getItem('nib_admin_pays');
      
      let allUsers: User[] = savedOps ? JSON.parse(savedOps) : [];
      
      if (currentUserData) {
        const u: User = JSON.parse(currentUserData);
        if (!allUsers.find(op => op.id === u.id)) {
          allUsers.push(u);
        } else {
          // Update existing to reflect latest login stats
          allUsers = allUsers.map(op => op.id === u.id ? u : op);
        }
      }
      
      setOperatives(allUsers);
      setPayments(savedPays ? JSON.parse(savedPays) : []);
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('nib_admin_ops', JSON.stringify(operatives));
    localStorage.setItem('nib_admin_pays', JSON.stringify(payments));
    
    // Also update main channel if changed
    const savedChats = localStorage.getItem('nib_chats');
    if (savedChats) {
      const chats: Chat[] = JSON.parse(savedChats);
      const updated = chats.map(c => c.id === mainChannel.id ? mainChannel : c);
      localStorage.setItem('nib_chats', JSON.stringify(updated));
    }
  }, [operatives, payments, mainChannel]);

  const addEvent = (type: AdminEvent['type'], message: string) => {
    const newEvent: AdminEvent = { id: 'e-' + Date.now(), type, message, timestamp: Date.now() };
    setEvents(prev => [newEvent, ...prev].slice(0, 50));
  };

  const handleAction = (userId: string, action: 'ban' | 'verify' | 'unban' | 'unverify') => {
    setOperatives(prev => prev.map(u => {
      if (u.id === userId) {
        if (action === 'ban') { addEvent('action', `Terminated node access for ${u.username}`); return { ...u, isBanned: true }; }
        if (action === 'unban') { addEvent('action', `Restored node access for ${u.username}`); return { ...u, isBanned: false }; }
        if (action === 'verify') { addEvent('action', `Credential verification granted to ${u.username}`); return { ...u, isVerified: true }; }
        if (action === 'unverify') { addEvent('action', `Credential verification revoked for ${u.username}`); return { ...u, isVerified: false }; }
      }
      return u;
    }));
  };

  const handlePayment = (pid: string, status: 'approved' | 'rejected') => {
    const req = payments.find(p => p.id === pid);
    if (!req) return;

    if (status === 'approved') {
      setOperatives(prev => prev.map(u => {
        if (u.id === req.userId) {
          return { ...u, walletBalance: (parseFloat(u.walletBalance) + parseFloat(req.amount)).toFixed(2) };
        }
        return u;
      }));
      addEvent('payment', `Approved ${req.amount} NIB for ${req.username}`);
    } else {
      addEvent('payment', `Disapproved coin request from ${req.username}`);
    }

    setPayments(prev => prev.filter(p => p.id !== pid));
  };

  const updateChannel = (field: 'name' | 'avatar', value: string) => {
    setMainChannel(prev => ({ ...prev, [field]: value }));
    addEvent('system', `Channel ${field} updated to: ${value}`);
  };

  return (
    <div className="h-full flex flex-col bg-black text-white font-mono select-none overflow-hidden">
      {/* Header */}
      <div className="h-20 bg-[#080808] border-b border-yellow-400/20 px-8 flex items-center justify-between shadow-2xl relative z-20">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-yellow-400 text-black rounded-lg flex items-center justify-center text-xl shadow-[0_0_20px_rgba(250,204,21,0.4)]">
             <i className="fa-solid fa-bolt"></i>
          </div>
          <div>
            <h2 className="text-lg font-black uppercase italic tracking-tighter">NIB OVERSEER</h2>
            <p className="text-[8px] text-green-500 font-black uppercase tracking-widest animate-pulse">Master Authority Protocol Active</p>
          </div>
        </div>
        <button onClick={onExit} className="px-5 py-2 bg-red-600/10 text-red-600 border border-red-600/20 rounded-lg font-black uppercase text-[10px] hover:bg-red-600 hover:text-white transition-all">TERMINATE SESSION</button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Nav */}
        <div className="w-64 border-r border-white/5 bg-[#050505] p-4 space-y-2">
          {[
            { id: 'operatives', icon: 'fa-users', label: 'Nodes / Users' },
            { id: 'vault', icon: 'fa-coins', label: 'NIB-coin Requests', badge: payments.length },
            { id: 'channels', icon: 'fa-tower-broadcast', label: 'Channel Manager' },
            { id: 'network', icon: 'fa-microchip', label: 'System Logs' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${activeTab === tab.id ? 'bg-yellow-400 text-black font-black' : 'text-gray-500 hover:bg-white/5'}`}
            >
              <div className="flex items-center space-x-3">
                 <i className={`fa-solid ${tab.icon} w-5`}></i>
                 <span className="text-[10px] uppercase font-black">{tab.label}</span>
              </div>
              {tab.badge ? <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{tab.badge}</span> : null}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar relative bg-[#020202]">
          {activeTab === 'operatives' && (
             <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                   <h3 className="text-2xl font-black italic uppercase text-yellow-400">Handshake Registry</h3>
                   <span className="text-[10px] text-gray-600 uppercase font-black">{operatives.length} Active Nodes</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {operatives.map(op => (
                     <div key={op.id} className={`p-6 rounded-3xl border ${op.isBanned ? 'bg-red-950/20 border-red-500/20' : 'bg-neutral-900/40 border-white/5'} flex items-center justify-between group`}>
                        <div className="flex items-center space-x-4">
                           <div className="w-14 h-14 hexagon p-0.5 bg-yellow-400/20 relative">
                              <img src={op.avatarUrl} className="w-full h-full hexagon object-cover grayscale brightness-110" />
                              {op.isVerified && <i className="fa-solid fa-circle-check absolute -top-1 -right-1 text-yellow-400 text-xs bg-black rounded-full"></i>}
                           </div>
                           <div>
                              <p className="text-lg font-black tracking-tighter flex items-center">
                                {op.displayName}
                                {op.isVerified && <span className="ml-2 text-[8px] bg-yellow-400 text-black px-2 py-0.5 rounded uppercase font-black">Verified</span>}
                                {op.isBanned && <span className="ml-2 text-[8px] bg-red-600 text-white px-2 py-0.5 rounded uppercase font-black">Banned</span>}
                              </p>
                              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{op.username || 'Initializing...'}</p>
                           </div>
                        </div>
                        <div className="flex items-center space-x-3">
                           <div className="text-right mr-6">
                              <p className="text-xl font-black text-yellow-400">{op.walletBalance}</p>
                              <p className="text-[8px] text-gray-600 uppercase font-black">NIB Coins</p>
                           </div>
                           <button onClick={() => handleAction(op.id, op.isVerified ? 'unverify' : 'verify')} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-all">
                              <i className={`fa-solid ${op.isVerified ? 'fa-user-slash' : 'fa-certificate'}`}></i>
                           </button>
                           <button onClick={() => handleAction(op.id, op.isBanned ? 'unban' : 'ban')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${op.isBanned ? 'bg-green-600 text-white' : 'bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white'}`}>
                              <i className={`fa-solid ${op.isBanned ? 'fa-unlock' : 'fa-ban'}`}></i>
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          )}

          {activeTab === 'vault' && (
             <div className="space-y-8 animate-in fade-in duration-500">
                <h3 className="text-2xl font-black italic uppercase text-yellow-400">Vault Acquisition Requests</h3>
                {payments.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-3xl opacity-30">
                     <i className="fa-solid fa-ghost text-4xl mb-4"></i>
                     <p className="text-[10px] font-black uppercase tracking-widest">No pending transactions in hive</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                     {payments.map(p => (
                        <div key={p.id} className="bg-neutral-900/60 border border-yellow-400/10 p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl">
                           <div className="space-y-1">
                              <p className="text-xl font-black text-white">{p.username}</p>
                              <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                 <span>{p.method}</span>
                                 <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                 <span className="text-yellow-400">{p.amount} ETB -> {p.amount} NIB</span>
                              </div>
                           </div>
                           <div className="flex space-x-4">
                              <button onClick={() => handlePayment(p.id, 'rejected')} className="px-6 py-3 bg-red-600/10 text-red-600 border border-red-600/20 rounded-xl font-black uppercase text-[10px] hover:bg-red-600 hover:text-white transition-all">Disapprove</button>
                              <button onClick={() => handlePayment(p.id, 'approved')} className="px-6 py-3 bg-yellow-400 text-black rounded-xl font-black uppercase text-[10px] hover:scale-105 transition-all shadow-lg">Approve</button>
                           </div>
                        </div>
                     ))}
                  </div>
                )}
             </div>
          )}

          {activeTab === 'channels' && (
             <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 max-w-2xl">
                <h3 className="text-2xl font-black italic uppercase text-yellow-400">Channel Management</h3>
                <div className="bg-neutral-900/40 border border-white/5 rounded-[3rem] p-10 space-y-8">
                   <div className="flex flex-col items-center space-y-6">
                      <div className="relative group">
                         <div className="w-32 h-32 hexagon p-1 bg-yellow-400">
                            <img src={mainChannel.avatar} className="w-full h-full hexagon object-cover" alt="channel-avatar" />
                         </div>
                         <label className="absolute inset-0 flex items-center justify-center bg-black/60 hexagon opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                            <i className="fa-solid fa-camera text-yellow-400 text-xl"></i>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                               const file = e.target.files?.[0];
                               if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => updateChannel('avatar', reader.result as string);
                                  reader.readAsDataURL(file);
                               }
                            }} />
                         </label>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 text-center">Update Main Channel profile picture</p>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-4">Channel Name</label>
                         <input 
                           type="text" 
                           value={mainChannel.name}
                           onChange={(e) => updateChannel('name', e.target.value)}
                           className="w-full bg-black border border-white/10 rounded-2xl py-5 px-8 outline-none focus:border-yellow-400 transition-all font-black text-white italic"
                         />
                      </div>
                   </div>
                   
                   <div className="p-6 bg-yellow-400/5 border border-yellow-400/10 rounded-2xl">
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-relaxed">
                        Changes to the main channel broadcast reflect instantly across all connected operatives globally.
                      </p>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'network' && (
             <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-4">
                   <h4 className="text-xs font-black uppercase tracking-[0.4em] italic text-yellow-400/60">Live Signal Log</h4>
                </div>
                <div className="flex-1 bg-black border border-white/5 rounded-[2rem] p-8 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-3">
                   {events.length === 0 && <p className="text-gray-800 text-center py-20">NO RECENT SIGNAL EVENTS</p>}
                   {events.map((ev, i) => (
                     <div key={ev.id} className="flex space-x-4 border-b border-white/5 pb-2">
                        <span className="opacity-30">[{new Date(ev.timestamp).toLocaleTimeString()}]</span>
                        <span className={`uppercase font-black ${ev.type === 'payment' ? 'text-yellow-400' : ev.type === 'action' ? 'text-red-500' : 'text-green-500'}`}>[{ev.type}]</span>
                        <span className="flex-1 tracking-tight text-gray-300">{ev.message}</span>
                     </div>
                   ))}
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminView;
