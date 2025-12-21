
import React, { useState, useEffect, useRef } from 'react';
import { User, PaymentRequest } from '../types';

interface AdminViewProps {
  onExit: () => void;
}

interface AdminEvent {
  id: string;
  type: 'login' | 'payment' | 'system';
  message: string;
  timestamp: number;
}

interface ActiveSession {
  id: string;
  username: string;
  lastAction: string;
  timestamp: number;
  avatar: string;
}

const DEFAULT_OPERATIVES: User[] = [
  { id: '1', username: '@nibsecoffical', displayName: 'NIB HQ', avatarUrl: 'https://i.ibb.co/3ykXF4K/nib-logo.png', isProfileComplete: true, walletBalance: '1000000', isVerified: true, loginMethod: 'phone' },
  { id: '2', username: '@oryn', displayName: 'Oryn', avatarUrl: 'https://picsum.photos/200', isProfileComplete: true, walletBalance: '500', isVerified: true, loginMethod: 'github' },
  { id: '3', username: '@bee_user', displayName: 'Busy Bee', avatarUrl: 'https://picsum.photos/201', isProfileComplete: true, walletBalance: '50', loginMethod: 'google' },
];

const AdminView: React.FC<AdminViewProps> = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState<'operatives' | 'vault' | 'network' | 'sessions'>('operatives');
  const [operatives, setOperatives] = useState<User[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [liveNodes, setLiveNodes] = useState(124);
  const [isInitialized, setIsInitialized] = useState(false);

  // Persistence: Load & Listen
  useEffect(() => {
    const savedOps = localStorage.getItem('nib_admin_ops');
    const savedPays = localStorage.getItem('nib_admin_pays');
    const savedEvents = localStorage.getItem('nib_admin_events');
    const savedSessions = localStorage.getItem('nib_active_sessions');

    setOperatives(savedOps ? JSON.parse(savedOps) : DEFAULT_OPERATIVES);
    setPayments(savedPays ? JSON.parse(savedPays) : []);
    setEvents(savedEvents ? JSON.parse(savedEvents) : [{ id: 'e0', type: 'system', message: 'Admin Handshake Protocol Ready.', timestamp: Date.now() }]);
    setActiveSessions(savedSessions ? JSON.parse(savedSessions) : []);
    setIsInitialized(true);

    // Watch for live session updates from main app
    const storageListener = () => {
      const live = localStorage.getItem('nib_active_sessions');
      if (live) setActiveSessions(JSON.parse(live));
    };
    window.addEventListener('storage', storageListener);
    return () => window.removeEventListener('storage', storageListener);
  }, []);

  // Save changes
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('nib_admin_ops', JSON.stringify(operatives));
    localStorage.setItem('nib_admin_pays', JSON.stringify(payments));
    localStorage.setItem('nib_admin_events', JSON.stringify(events.slice(0, 50)));
  }, [operatives, payments, events, isInitialized]);

  // Simulated Real-Time Fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveNodes(prev => Math.max(100, prev + (Math.random() > 0.5 ? 1 : -1)));
      
      // Random system logs
      if (Math.random() > 0.8) {
        addEvent('system', `Node ping from sector ${Math.floor(Math.random()*9)} established.`);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const addEvent = (type: AdminEvent['type'], message: string) => {
    const newEvent: AdminEvent = { id: 'e-' + Date.now(), type, message, timestamp: Date.now() };
    setEvents(prev => [newEvent, ...prev].slice(0, 50));
  };

  const handleAction = (userId: string, action: 'ban' | 'verify' | 'add_nib') => {
    setOperatives(prev => prev.map(u => {
      if (u.id === userId) {
        if (action === 'ban') { addEvent('system', `${u.username} node access ${u.isBanned ? 'restored' : 'terminated'}.`); return { ...u, isBanned: !u.isBanned }; }
        if (action === 'verify') { addEvent('system', `${u.username} credentials verified.`); return { ...u, isVerified: !u.isVerified }; }
        if (action === 'add_nib') { addEvent('system', `Signal boost: 100 NIB to ${u.username}.`); return { ...u, walletBalance: (parseFloat(u.walletBalance) + 100).toFixed(2) }; }
      }
      return u;
    }));
  };

  const approvePayment = (pid: string) => {
    const p = payments.find(pay => pay.id === pid);
    if (!p) return;
    handleAction(p.userId, 'add_nib');
    setPayments(prev => prev.filter(pay => pay.id !== pid));
    addEvent('payment', `Vault credit approved: ${p.amount} ETB from ${p.username}`);
  };

  return (
    <div className="h-full flex flex-col bg-black text-white font-mono select-none">
      {/* Admin Header */}
      <div className="h-24 bg-[#0a0a0a] border-b border-yellow-400/20 px-10 flex items-center justify-between shadow-2xl relative z-20">
        <div className="flex items-center space-x-6">
          <div className="w-12 h-12 bg-yellow-400 text-black rounded-xl flex items-center justify-center text-2xl relative shadow-yellow-glow">
             <i className="fa-solid fa-shield-cat"></i>
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-black"></div>
          </div>
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">NIB OVERSEER</h2>
            <div className="flex items-center space-x-2 text-[9px] text-gray-600 font-black uppercase tracking-widest">
               <span>Hive Admin Mode</span>
               <span>•</span>
               <span className="text-green-500">Live Connection</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-8">
           <div className="text-right">
              <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Global Nodes</p>
              <p className="text-xl font-black text-yellow-400">{liveNodes}</p>
           </div>
           <button onClick={onExit} className="px-6 py-3 bg-red-600/10 text-red-600 border border-red-600/20 rounded-xl font-black uppercase text-[10px] hover:bg-red-600 hover:text-white transition-all">TERMINATE</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation */}
        <div className="w-72 border-r border-white/5 bg-[#050505] p-6 space-y-3">
          <button onClick={() => setActiveTab('operatives')} className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${activeTab === 'operatives' ? 'bg-yellow-400 text-black font-black' : 'text-gray-500 hover:bg-white/5'}`}>
             <i className="fa-solid fa-id-card-clip"></i><span className="text-[10px] uppercase font-black">Operatives</span>
          </button>
          <button onClick={() => setActiveTab('sessions')} className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all relative ${activeTab === 'sessions' ? 'bg-yellow-400 text-black font-black' : 'text-gray-500 hover:bg-white/5'}`}>
             <i className="fa-solid fa-signal"></i><span className="text-[10px] uppercase font-black">Live Sessions</span>
             {activeSessions.length > 0 && <span className="absolute right-4 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full border border-black animate-bounce">{activeSessions.length}</span>}
          </button>
          <button onClick={() => setActiveTab('vault')} className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all relative ${activeTab === 'vault' ? 'bg-yellow-400 text-black font-black' : 'text-gray-500 hover:bg-white/5'}`}>
             <i className="fa-solid fa-vault"></i><span className="text-[10px] uppercase font-black">Vault</span>
             {payments.length > 0 && <span className="absolute right-4 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full border border-black">{payments.length}</span>}
          </button>
          <button onClick={() => setActiveTab('network')} className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${activeTab === 'network' ? 'bg-yellow-400 text-black font-black' : 'text-gray-500 hover:bg-white/5'}`}>
             <i className="fa-solid fa-tower-broadcast"></i><span className="text-[10px] uppercase font-black">Network</span>
          </button>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar relative bg-black">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none honeycomb-bg"></div>

          {activeTab === 'operatives' && (
             <div className="space-y-8 relative z-10 animate-in fade-in duration-500">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Handshake Registry</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                   {operatives.map(op => (
                     <div key={op.id} className={`p-8 rounded-[3rem] border bg-neutral-900/40 backdrop-blur-sm transition-all ${op.isBanned ? 'border-red-500/20' : 'border-white/5 hover:border-yellow-400/20 shadow-2xl'}`}>
                        <div className="flex items-center justify-between mb-8">
                           <div className="flex items-center space-x-6">
                              <div className="w-16 h-16 hexagon p-1 bg-yellow-400/20 relative">
                                 <img src={op.avatarUrl} className="w-full h-full hexagon object-cover grayscale brightness-110" />
                                 {op.isVerified && <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 text-black rounded-full flex items-center justify-center text-[10px]"><i className="fa-solid fa-check"></i></div>}
                              </div>
                              <div>
                                 <p className="text-xl font-black tracking-tighter">{op.displayName}</p>
                                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{op.username}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className={`text-2xl font-black ${op.isBanned ? 'text-red-500' : 'text-yellow-400'}`}>{op.walletBalance}</p>
                              <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">NIB TOKENS</p>
                           </div>
                        </div>
                        <div className="flex space-x-3">
                           <button onClick={() => handleAction(op.id, 'verify')} className="flex-1 py-4 bg-white/5 text-[9px] font-black uppercase rounded-2xl hover:bg-yellow-400 hover:text-black transition-all">Verify</button>
                           <button onClick={() => handleAction(op.id, 'add_nib')} className="flex-1 py-4 bg-white/5 text-[9px] font-black uppercase rounded-2xl hover:bg-yellow-400 hover:text-black transition-all">+100 NIB</button>
                           <button onClick={() => handleAction(op.id, 'ban')} className={`flex-1 py-4 text-[9px] font-black uppercase rounded-2xl transition-all ${op.isBanned ? 'bg-red-600 text-white' : 'bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white'}`}>{op.isBanned ? 'UNBAN' : 'BAN'}</button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          )}

          {activeTab === 'sessions' && (
             <div className="space-y-8 relative z-10 animate-in slide-in-from-right-10 duration-500">
                <div className="flex items-center justify-between">
                   <h3 className="text-3xl font-black italic uppercase tracking-tighter">Live Active Sessions</h3>
                   <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">MONITORING {activeSessions.length} HANDS</span>
                </div>
                {activeSessions.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center bg-white/5 rounded-[4rem] border border-white/5 border-dashed">
                     <i className="fa-solid fa-user-secret text-4xl text-gray-800 mb-4"></i>
                     <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">No active hive nodes detected.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                     {activeSessions.map(s => (
                        <div key={s.id} className="bg-[#0a0a0a] border border-yellow-400/20 p-8 rounded-[3.5rem] flex items-center justify-between group hover:border-yellow-400 transition-all shadow-2xl relative overflow-hidden">
                           <div className="flex items-center space-x-8">
                              <div className="w-14 h-14 hexagon p-0.5 bg-yellow-400">
                                 <img src={s.avatar} className="w-full h-full hexagon object-cover" />
                              </div>
                              <div>
                                 <p className="text-xl font-black tracking-tighter text-yellow-400">{s.username}</p>
                                 <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">LAST ACTION: <span className="text-white">{s.lastAction}</span></p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-white/40 uppercase mb-1 tracking-widest">PING TIME</p>
                              <p className="text-xs font-black text-green-500 font-mono tracking-tighter">{new Date(s.timestamp).toLocaleTimeString()}</p>
                           </div>
                        </div>
                     ))}
                  </div>
                )}
             </div>
          )}

          {activeTab === 'vault' && (
             <div className="space-y-8 relative z-10 animate-in fade-in duration-500">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Vault Requests</h3>
                {payments.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center bg-white/5 rounded-[4rem] border border-white/5">
                     <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">Vault is currently empty.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                     {payments.map(p => (
                        <div key={p.id} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem] flex items-center justify-between">
                           <div>
                              <p className="text-lg font-black uppercase tracking-tighter">{p.username}</p>
                              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{p.method} • {p.amount} ETB</p>
                           </div>
                           <div className="flex space-x-3">
                              <button onClick={() => approvePayment(p.id)} className="px-8 py-3 bg-yellow-400 text-black font-black uppercase text-[10px] rounded-xl hover:scale-105 transition-all">Approve</button>
                           </div>
                        </div>
                     ))}
                  </div>
                )}
             </div>
          )}

          {activeTab === 'network' && (
             <div className="h-full flex flex-col space-y-6 animate-in zoom-in duration-500 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                      <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-2">Node Latency</p>
                      <p className="text-3xl font-black text-green-500 tracking-tighter group-hover:scale-110 transition-transform origin-left">8ms</p>
                   </div>
                   <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                      <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-2">Load Threshold</p>
                      <p className="text-3xl font-black text-yellow-400 tracking-tighter group-hover:scale-110 transition-transform origin-left">24%</p>
                   </div>
                   <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                      <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-2">Hive Capacity</p>
                      <p className="text-3xl font-black text-blue-500 tracking-tighter group-hover:scale-110 transition-transform origin-left">STABLE</p>
                   </div>
                </div>

                <div className="flex-1 bg-black rounded-[3rem] p-10 border border-white/5 flex flex-col overflow-hidden">
                   <div className="flex justify-between items-center mb-6">
                      <h4 className="text-xs font-black uppercase tracking-[0.4em] italic text-yellow-400/60">Live Signal Log</h4>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                   </div>
                   <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-2 opacity-80">
                      {events.map((ev, i) => (
                        <div key={ev.id} className={`flex space-x-4 animate-in slide-in-from-left-2 duration-300 ${i === 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                           <span className="opacity-40">[{new Date(ev.timestamp).toLocaleTimeString()}]</span>
                           <span className={`w-20 uppercase font-black ${ev.type === 'payment' ? 'text-red-500' : ev.type === 'system' ? 'text-green-500' : 'text-blue-500'}`}>[{ev.type}]</span>
                           <span className="flex-1 tracking-tight">{ev.message}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminView;
