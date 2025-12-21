
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

const DEFAULT_OPERATIVES: User[] = [
  { id: '1', username: '@nibsecoffical', displayName: 'NIB HQ', avatarUrl: 'https://i.ibb.co/3ykXF4K/nib-logo.png', isProfileComplete: true, walletBalance: '1000000', isVerified: true, loginMethod: 'phone' },
  { id: '2', username: '@oryn', displayName: 'Oryn', avatarUrl: 'https://picsum.photos/200', isProfileComplete: true, walletBalance: '500', isVerified: true, loginMethod: 'github' },
  { id: '3', username: '@bee_user', displayName: 'Busy Bee', avatarUrl: 'https://picsum.photos/201', isProfileComplete: true, walletBalance: '50', loginMethod: 'google' },
  { id: '4', username: '@gh_hacker', displayName: 'Git Node', avatarUrl: 'https://picsum.photos/202', isProfileComplete: true, walletBalance: '0', isBanned: true, loginMethod: 'github' },
];

const DEFAULT_PAYMENTS: PaymentRequest[] = [
  { id: 'p1', userId: '3', username: '@bee_user', amount: '200', method: 'Telebirr', timestamp: Date.now() - 50000, status: 'pending' },
];

const AdminView: React.FC<AdminViewProps> = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState<'operatives' | 'vault' | 'network'>('operatives');
  const [operatives, setOperatives] = useState<User[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [liveNodes, setLiveNodes] = useState(124);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sound effect for admin notifications
  const playAdminTone = (type: 'info' | 'alert') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type === 'alert' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(type === 'alert' ? 220 : 880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}
  };

  // Persistence: Load on mount
  useEffect(() => {
    const savedOps = localStorage.getItem('nib_admin_ops');
    const savedPays = localStorage.getItem('nib_admin_pays');
    const savedEvents = localStorage.getItem('nib_admin_events');

    setOperatives(savedOps ? JSON.parse(savedOps) : DEFAULT_OPERATIVES);
    setPayments(savedPays ? JSON.parse(savedPays) : DEFAULT_PAYMENTS);
    setEvents(savedEvents ? JSON.parse(savedEvents) : [{
      id: 'e0', type: 'system', message: 'Admin Terminal Initialized. Secure Tunnel Established.', timestamp: Date.now()
    }]);
    setIsInitialized(true);
  }, []);

  // Persistence: Save on change
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('nib_admin_ops', JSON.stringify(operatives));
    localStorage.setItem('nib_admin_pays', JSON.stringify(payments));
    localStorage.setItem('nib_admin_events', JSON.stringify(events.slice(0, 50))); // Keep last 50
  }, [operatives, payments, events, isInitialized]);

  // Simulated Real-Time Updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate live nodes
      setLiveNodes(prev => Math.max(100, prev + (Math.random() > 0.5 ? 1 : -1)));

      // Randomly spawn a new payment request (10% chance per tick)
      if (Math.random() > 0.9 && payments.length < 8) {
        const randomUser = operatives[Math.floor(Math.random() * operatives.length)];
        const newPay: PaymentRequest = {
          id: 'p-' + Date.now(),
          userId: randomUser.id,
          username: randomUser.username,
          amount: (Math.floor(Math.random() * 90) * 10 + 100).toString(),
          method: 'Telebirr',
          timestamp: Date.now(),
          status: 'pending'
        };
        setPayments(prev => [...prev, newPay]);
        addEvent('payment', `Incoming Vault Request from ${randomUser.username}: ${newPay.amount} ETB`);
        playAdminTone('alert');
      }

      // Randomly spawn a login event (15% chance per tick)
      if (Math.random() > 0.85) {
        const loginNames = ['@anon_node', '@sector_9', '@matrix_bee', '@ghost_op'];
        const name = loginNames[Math.floor(Math.random() * loginNames.length)];
        addEvent('login', `External Node ${name} synced with Hive.`);
        playAdminTone('info');
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [operatives, payments, isInitialized]);

  const addEvent = (type: AdminEvent['type'], message: string) => {
    const newEvent: AdminEvent = {
      id: 'e-' + Date.now(),
      type,
      message,
      timestamp: Date.now()
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 50));
  };

  const handleAction = (userId: string, action: 'ban' | 'verify' | 'add_nib') => {
    setOperatives(prev => prev.map(u => {
      if (u.id === userId) {
        if (action === 'ban') {
          addEvent('system', `${u.username} access privileges ${!u.isBanned ? 'REVOKED' : 'RESTORED'}`);
          return { ...u, isBanned: !u.isBanned };
        }
        if (action === 'verify') {
          addEvent('system', `${u.username} credentials ${!u.isVerified ? 'VERIFIED' : 'DOWNGRADED'}`);
          return { ...u, isVerified: !u.isVerified };
        }
        if (action === 'add_nib') {
          addEvent('system', `Manual injection of 100 NIB to ${u.username} node.`);
          return { ...u, walletBalance: (parseInt(u.walletBalance) + 100).toString() };
        }
      }
      return u;
    }));
  };

  const approvePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    handleAction(payment.userId, 'add_nib');
    setPayments(prev => prev.filter(p => p.id !== paymentId));
    addEvent('system', `Vault Transaction Approved: ${payment.amount} NIB for ${payment.username}`);
  };

  const rejectPayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    setPayments(prev => prev.filter(p => p.id !== paymentId));
    addEvent('system', `Vault Transaction REJECTED: ${payment.amount} NIB for ${payment.username}`);
  };

  return (
    <div className="h-full flex flex-col bg-black text-white font-mono animate-in fade-in duration-700 select-none">
      {/* Top Status Bar */}
      <div className="h-24 bg-[#0a0a0a] border-b border-yellow-400/20 px-10 flex items-center justify-between shadow-[0_0_50px_rgba(250,204,21,0.1)] shrink-0">
        <div className="flex items-center space-x-6">
          <div className="w-12 h-12 bg-yellow-400 text-black rounded-xl flex items-center justify-center text-2xl shadow-yellow-glow relative">
            <i className="fa-solid fa-user-shield"></i>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-black"></span>
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">The Hive Overseer</h2>
            <div className="flex items-center space-x-2">
               <span className="text-[10px] text-yellow-400/60 font-black uppercase tracking-[0.4em]">Master Control Interface</span>
               <span className="text-[9px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full border border-green-500/20 font-black flex items-center">
                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>SYSTEM ONLINE
               </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-8">
           <div className="hidden lg:flex flex-col items-end">
              <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Active Threads</p>
              <p className="text-xl font-black text-yellow-400">{liveNodes + payments.length}</p>
           </div>
           <button onClick={onExit} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-8 py-3 rounded-2xl border border-red-500/20 transition-all font-black uppercase tracking-widest text-xs">Terminate Session</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Nav Sidebar */}
        <div className="w-72 bg-[#050505] border-r border-white/5 p-6 space-y-4 shrink-0">
          <button onClick={() => setActiveTab('operatives')} className={`w-full flex items-center space-x-4 p-5 rounded-2xl transition-all ${activeTab === 'operatives' ? 'bg-yellow-400 text-black font-black' : 'hover:bg-white/5 text-gray-500'}`}>
            <i className="fa-solid fa-users"></i><span className="uppercase tracking-widest text-xs">Operatives</span>
          </button>
          <button onClick={() => setActiveTab('vault')} className={`w-full flex items-center space-x-4 p-5 rounded-2xl transition-all relative ${activeTab === 'vault' ? 'bg-yellow-400 text-black font-black' : 'hover:bg-white/5 text-gray-500'}`}>
            <i className="fa-solid fa-vault"></i><span className="uppercase tracking-widest text-xs">Vault Terminal</span>
            {payments.length > 0 && (
              <span className={`absolute top-2 right-4 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full border border-black animate-bounce font-black`}>
                {payments.length}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('network')} className={`w-full flex items-center space-x-4 p-5 rounded-2xl transition-all ${activeTab === 'network' ? 'bg-yellow-400 text-black font-black' : 'hover:bg-white/5 text-gray-500'}`}>
            <i className="fa-solid fa-network-wired"></i><span className="uppercase tracking-widest text-xs">Network Hub</span>
          </button>

          {/* Mini Event Feed in Sidebar */}
          <div className="mt-auto pt-10 space-y-4">
             <div className="px-4 flex items-center justify-between">
                <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Live Signals</span>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
             </div>
             <div className="space-y-3 max-h-48 overflow-hidden opacity-40 hover:opacity-100 transition-opacity">
                {events.slice(0, 3).map(ev => (
                  <div key={ev.id} className="text-[8px] leading-tight px-4 border-l border-yellow-400/20 font-bold uppercase tracking-tighter">
                    <span className="text-yellow-400/50 mr-1">[{new Date(ev.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}]</span>
                    {ev.message}
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-black relative">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none honeycomb-bg"></div>
          
          {activeTab === 'operatives' && (
            <div className="space-y-8 relative z-10">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter">Signal Registry</h3>
                  <div className="flex space-x-4">
                    <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-[10px] text-gray-500 font-black flex items-center">
                       <i className="fa-solid fa-server mr-3 text-yellow-400/50"></i>
                       LOAD: {(liveNodes / 2).toFixed(1)}%
                    </div>
                    <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-[10px] text-gray-500 font-black flex items-center">
                       <i className="fa-solid fa-tower-broadcast mr-3 text-green-400/50"></i>
                       NODES: {liveNodes}
                    </div>
                  </div>
               </div>
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 {operatives.map(op => (
                   <div key={op.id} className={`p-8 rounded-[3rem] border transition-all ${op.isBanned ? 'bg-red-500/5 border-red-500/20' : 'bg-neutral-900/40 border-white/5 hover:border-yellow-400/20 shadow-2xl backdrop-blur-sm'}`}>
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-6">
                           <div className="w-16 h-16 hexagon p-1 bg-yellow-400/20 relative">
                              <img src={op.avatarUrl} className="w-full h-full hexagon object-cover grayscale brightness-125" />
                              <div className="absolute -top-2 -left-2 bg-black border border-white/10 rounded-full p-1.5 flex items-center justify-center shadow-xl">
                                 {op.loginMethod === 'github' && <i className="fa-brands fa-github text-xs"></i>}
                                 {op.loginMethod === 'google' && <i className="fa-brands fa-google text-xs text-white"></i>}
                                 {op.loginMethod === 'phone' && <i className="fa-solid fa-phone text-[8px]"></i>}
                              </div>
                           </div>
                           <div>
                              <div className="flex items-center space-x-2">
                                <p className="text-xl font-black tracking-tighter">{op.displayName}</p>
                                {op.isVerified && <i className="fa-solid fa-circle-check text-yellow-400 animate-pulse"></i>}
                              </div>
                              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{op.username}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className={`text-2xl font-black ${op.isBanned ? 'text-red-500' : 'text-yellow-400'}`}>{op.walletBalance}</p>
                           <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">SEC TOKENS</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                         <button onClick={() => handleAction(op.id, 'verify')} className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${op.isVerified ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-white/5 text-gray-500 border border-white/5'}`}>{op.isVerified ? 'Unverify Node' : 'Verify Node'}</button>
                         <button onClick={() => handleAction(op.id, 'add_nib')} className="flex-1 py-4 bg-white text-black rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-colors">Inject 100 NIB</button>
                         <button onClick={() => handleAction(op.id, 'ban')} className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${op.isBanned ? 'bg-white text-black' : 'bg-red-600 text-white'}`}>{op.isBanned ? 'RESTORE ACCESS' : 'BAN NODE'}</button>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'vault' && (
             <div className="space-y-12 relative z-10 animate-in slide-in-from-right-10 duration-500">
               <div className="flex items-center justify-between">
                 <h3 className="text-4xl font-black italic uppercase tracking-tighter">Vault Terminal</h3>
                 <div className="flex space-x-3">
                    <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center">
                       <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 animate-ping"></span>
                       PENDING: {payments.length}
                    </div>
                 </div>
               </div>

               {payments.length === 0 ? (
                 <div className="h-96 flex flex-col items-center justify-center space-y-6 bg-white/5 rounded-[4rem] border border-white/5">
                    <i className="fa-solid fa-vault text-6xl text-gray-800"></i>
                    <p className="text-gray-600 font-black uppercase tracking-[0.5em] text-xs">No pending signal transfers found.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 gap-4">
                   {payments.map(pay => (
                     <div key={pay.id} className="bg-[#0a0a0a] border border-yellow-400/10 p-10 rounded-[4rem] flex flex-col lg:flex-row items-center justify-between group hover:border-yellow-400/30 transition-all shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center space-x-10 mb-6 lg:mb-0">
                           <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center border border-white/5">
                              <i className="fa-solid fa-money-bill-transfer text-yellow-400 text-2xl"></i>
                           </div>
                           <div>
                              <p className="text-2xl font-black tracking-tighter uppercase">{pay.username}</p>
                              <div className="flex items-center space-x-3 text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">
                                 <span>{pay.method}</span>
                                 <span>•</span>
                                 <span>{new Date(pay.timestamp).toLocaleTimeString()}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center space-x-12">
                           <div className="text-right">
                              <p className="text-4xl font-black text-yellow-400 tracking-tighter">{pay.amount}</p>
                              <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">ETB REQUESTED</p>
                           </div>
                           <div className="flex space-x-3">
                              <button onClick={() => rejectPayment(pay.id)} className="h-16 w-16 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-2xl transition-all flex items-center justify-center">
                                 <i className="fa-solid fa-xmark text-xl"></i>
                              </button>
                              <button onClick={() => approvePayment(pay.id)} className="h-16 px-10 bg-yellow-400 text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-400/10">
                                 APPROVE
                              </button>
                           </div>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          )}

          {activeTab === 'network' && (
             <div className="h-full flex flex-col space-y-10 animate-in zoom-in duration-500 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[3rem] relative overflow-hidden">
                      <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4">Node Latency</p>
                      <p className="text-4xl font-black text-green-500 tracking-tighter">12ms</p>
                      <div className="absolute bottom-0 right-0 p-6 opacity-5"><i className="fa-solid fa-bolt text-8xl"></i></div>
                   </div>
                   <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[3rem] relative overflow-hidden">
                      <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4">Encryption Layer</p>
                      <p className="text-4xl font-black text-yellow-400 tracking-tighter">RSA-4096</p>
                      <div className="absolute bottom-0 right-0 p-6 opacity-5"><i className="fa-solid fa-lock text-8xl"></i></div>
                   </div>
                   <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[3rem] relative overflow-hidden">
                      <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4">Global Health</p>
                      <p className="text-4xl font-black text-green-500 tracking-tighter">STABLE</p>
                      <div className="absolute bottom-0 right-0 p-6 opacity-5"><i className="fa-solid fa-heart-pulse text-8xl"></i></div>
                   </div>
                </div>

                <div className="flex-1 bg-[#050505] border border-white/5 rounded-[4rem] p-10 flex flex-col">
                   <div className="flex items-center justify-between mb-8">
                      <h4 className="text-xl font-black uppercase italic tracking-tighter">Live Traffic Console</h4>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em]">SECURE LOGGING</span>
                      </div>
                   </div>
                   <div className="flex-1 bg-black rounded-[2.5rem] p-8 overflow-y-auto custom-scrollbar border border-white/5 space-y-4 font-mono">
                      {events.map((ev, i) => (
                        <div key={ev.id} className={`flex items-start space-x-4 animate-in slide-in-from-left-4 fade-in duration-300 ${i === 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                           <span className="text-[10px] opacity-40 shrink-0 font-bold">[{new Date(ev.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
                           <span className={`text-[10px] font-black uppercase tracking-wider shrink-0 w-24 ${ev.type === 'payment' ? 'text-red-500' : ev.type === 'login' ? 'text-blue-500' : 'text-green-500'}`}>
                              [{ev.type.toUpperCase()}]
                           </span>
                           <span className="text-[11px] font-medium tracking-tight flex-1">{ev.message}</span>
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
