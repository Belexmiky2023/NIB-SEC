
import React, { useState, useEffect, useRef } from 'react';
import { User, PaymentRequest } from '../types';

interface AdminViewProps {
  onExit: () => void;
}

interface SignalEvent {
  id: number;
  sender: string;
  type: 'AUTH' | 'SIGNAL' | 'LIQUIDITY' | 'ALERT' | 'SYSTEM';
  content: string;
  timestamp: number;
}

const AdminView: React.FC<AdminViewProps> = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState<'war-room' | 'operatives' | 'vault'>('war-room');
  const [operatives, setOperatives] = useState<User[]>([]);
  const [signals, setSignals] = useState<SignalEvent[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [bannedCount, setBannedCount] = useState(0);
  
  const signalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pollHive = async () => {
      try {
        // 1. Fetch ALL Operatives from Backend API (KV Source)
        const opsResponse = await fetch('/api/users');
        if (opsResponse.ok) {
          const savedOps: User[] = await opsResponse.json();
          // Sort by registration date descending
          const sortedOps = savedOps.sort((a, b) => (b.registrationDate || 0) - (a.registrationDate || 0));
          setOperatives(sortedOps);
          setBannedCount(sortedOps.filter(op => op.isBanned).length);
        }

        // 2. Fetch ALL Purchase Records from Backend API (KV Source)
        const paysResponse = await fetch('/api/purchases');
        if (paysResponse.ok) {
          const savedPays: PaymentRequest[] = await paysResponse.json();
          setPayments(savedPays);
        }

        // 3. Heartbeat for Active Nodes
        const liveNodesRaw = localStorage.getItem('nib_live_nodes');
        const liveNodes = liveNodesRaw ? JSON.parse(liveNodesRaw) : {};
        const now = Date.now();
        const activeNodes = Object.values(liveNodes).filter((node: any) => (now - node.lastSeen) < 30000);
        setActiveCount(activeNodes.length);

        console.log(`[ADMIN_SYNC] Fetched ${operatives.length} users from shared identity vault.`);
      } catch (e) {
        console.error("Overseer uplink failure:", e);
      }
    };
    
    pollHive();
    const inv = setInterval(pollHive, 5000);
    return () => clearInterval(inv);
  }, [operatives.length, payments.length]);

  const handleBanStatus = async (userId: string, isBanned: boolean) => {
    const targetUser = operatives.find(o => o.id === userId);
    if (!targetUser) return;

    const updatedUser = { ...targetUser, isBanned };

    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });
      // Refresh local state will happen on next poll cycle
    } catch (e) {
      alert("Failed to modify node status.");
    }
  };

  const handlePaymentAction = async (reqId: string, status: 'approved' | 'rejected') => {
    const req = payments.find(p => p.id === reqId);
    if (!req) return;

    const updatedReq = { ...req, status };

    try {
      await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReq),
      });

      if (status === 'approved') {
        const userToUpdate = operatives.find(o => o.id === req.userId);
        if (userToUpdate) {
          const newBal = (parseFloat(userToUpdate.walletBalance) + parseFloat(req.amount)).toFixed(2);
          await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...userToUpdate, walletBalance: newBal }),
          });
        }
      }
    } catch (e) {
      alert("Ledger update failed.");
    }
  };

  const formatDate = (ts?: number) => {
    if (!ts) return "UNIDENTIFIED";
    return new Date(ts).toLocaleDateString([], { 
      year: '2-digit', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const historyPayments = payments.filter(p => p.status !== 'pending').sort((a,b) => b.timestamp - a.timestamp);

  return (
    <div className="h-full flex flex-col bg-[#050505] text-white font-mono selection:bg-yellow-400 selection:text-black">
      <header className="h-20 bg-black/80 backdrop-blur-xl border-b border-white/5 px-10 flex items-center justify-between z-50">
        <div className="flex items-center space-x-12">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 hexagon bg-yellow-400 flex items-center justify-center text-black shadow-glow"><i className="fa-solid fa-eye text-xl"></i></div>
            <h1 className="text-sm font-black tracking-tighter uppercase italic">NIB SEC <span className="text-yellow-400">OVERSEER</span></h1>
          </div>
          <nav className="flex items-center space-x-2">
            {[ 
              { id: 'operatives', label: 'Nodes', icon: 'fa-users' }, 
              { id: 'vault', label: 'Vault', icon: 'fa-vault', badge: pendingPayments.length },
              { id: 'war-room', label: 'Logs', icon: 'fa-microchip' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center space-x-3 px-6 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'bg-yellow-400 text-black' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                <i className={`fa-solid ${tab.icon}`}></i><span>{tab.label}</span>
                {tab.id === 'vault' && tab.badge ? <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full ml-2">{tab.badge}</span> : null}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={onExit} className="px-6 py-2 bg-red-600/10 text-red-600 border border-red-600/20 rounded-lg text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Exit Overseer</button>
      </header>

      <main className="flex-1 overflow-hidden flex">
        <section className="flex-1 flex flex-col bg-black/40 relative">
          
          {activeTab === 'operatives' && (
            <div className="flex-1 p-10 space-y-8 overflow-y-auto custom-scrollbar">
               <div className="flex items-center justify-between px-4">
                  <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">Operative Hub</h2>
                  <div className="flex items-center space-x-4">
                     <div className="flex items-center space-x-3 bg-green-500/5 px-4 py-2 rounded-2xl border border-green-500/10">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></span>
                        <p className="text-[10px] text-green-400 font-black uppercase tracking-widest">{activeCount} LIVE</p>
                     </div>
                     <div className="flex items-center space-x-3 bg-red-500/5 px-4 py-2 rounded-2xl border border-red-500/10">
                        <span className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_#dc2626]"></span>
                        <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">{bannedCount} BANNED</p>
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 gap-4 px-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 grid grid-cols-6 text-[9px] font-black text-gray-600 uppercase tracking-widest px-8 mb-2">
                    <span className="col-span-2">Operative Identity</span>
                    <span>Provider</span>
                    <span>Joined Node</span>
                    <span className="text-right">Liquidity</span>
                    <span className="text-right">Actions</span>
                  </div>
                  {operatives.map(op => (
                    <div key={op.id} className={`p-6 bg-[#0a0a0a] border border-white/5 rounded-[3rem] flex items-center justify-between group transition-all shadow-xl hover:bg-white/[0.02] ${op.isBanned ? 'opacity-60 grayscale' : ''}`}>
                       <div className="flex items-center space-x-6 w-1/3">
                          <div className={`w-14 h-14 hexagon p-0.5 ${op.isBanned ? 'bg-red-600' : 'bg-yellow-400'}`}>
                            <img src={op.avatarUrl} className="w-full h-full hexagon object-cover" />
                          </div>
                          <div className="truncate">
                            <p className="text-lg font-black uppercase text-white tracking-tighter truncate">{op.displayName}</p>
                            <p className="text-[10px] text-gray-600 font-mono truncate">{op.username || op.email}</p>
                          </div>
                       </div>
                       <div className="w-1/6 text-center">
                          <span className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase ${op.loginMethod === 'google' ? 'border-blue-500/20 text-blue-400' : op.loginMethod === 'github' ? 'border-white/20 text-white' : 'border-yellow-400/20 text-yellow-400'}`}>
                            {op.loginMethod}
                          </span>
                       </div>
                       <div className="w-1/6 text-center">
                          <p className="text-[10px] text-gray-500 font-mono">{formatDate(op.registrationDate)}</p>
                       </div>
                       <div className="w-1/6 text-right">
                          <p className="text-xl font-black text-yellow-400">{op.walletBalance} <span className="text-[10px] text-gray-600">NIB</span></p>
                       </div>
                       <div className="w-1/6 text-right">
                          <button 
                            onClick={() => handleBanStatus(op.id, !op.isBanned)} 
                            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${op.isBanned ? 'bg-green-600/10 border-green-500 text-green-500 hover:bg-green-600 hover:text-white' : 'bg-red-600/10 border-red-500 text-red-500 hover:bg-red-600 hover:text-white'}`}
                          >
                            {op.isBanned ? 'Unban' : 'Ban'}
                          </button>
                       </div>
                    </div>
                  ))}
                  {operatives.length === 0 && <div className="text-center py-20 opacity-20 font-black uppercase tracking-widest">No nodes identified in the KV vault</div>}
               </div>
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="flex-1 p-10 space-y-12 overflow-y-auto custom-scrollbar">
               <div className="space-y-6">
                 <h2 className="text-2xl font-black italic uppercase text-white px-4 tracking-tighter">Pending Handshakes</h2>
                 <div className="space-y-4 px-4">
                    {pendingPayments.map(p => (
                      <div key={p.id} className="bg-[#0a0a0a] border border-orange-400/20 p-8 rounded-[3rem] flex items-center justify-between shadow-2xl">
                         <div className="space-y-1">
                            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Requesting Operative:</p>
                            <p className="text-xl font-black text-white uppercase italic tracking-tighter">{p.username}</p>
                            <div className="flex items-center space-x-3">
                               <p className="text-2xl font-black text-yellow-400">{p.amount} NIB</p>
                               <span className="text-[10px] text-gray-700 font-mono">[{formatDate(p.timestamp)}]</span>
                            </div>
                         </div>
                         <div className="flex space-x-4">
                            <button onClick={() => handlePaymentAction(p.id, 'rejected')} className="px-10 py-5 bg-red-600/10 border border-red-500/20 text-red-500 rounded-3xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Reject</button>
                            <button onClick={() => handlePaymentAction(p.id, 'approved')} className="px-10 py-5 bg-yellow-400 text-black rounded-3xl text-[10px] font-black uppercase shadow-glow hover:scale-105 transition-all">Approve</button>
                         </div>
                      </div>
                    ))}
                    {pendingPayments.length === 0 && <div className="text-center py-12 opacity-30 uppercase font-black tracking-widest text-xs border border-dashed border-white/10 rounded-[3rem]">No pending signal requests</div>}
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'war-room' && (
            <div className="flex-1 flex flex-col p-10 overflow-hidden">
               <h2 className="text-xl font-black italic uppercase text-white mb-8 tracking-tighter">Neural Signal Feed</h2>
               <div className="flex-1 bg-[#080808] border border-white/5 rounded-[3rem] p-8 overflow-y-auto custom-scrollbar flex flex-col-reverse shadow-inner">
                 <div ref={signalEndRef} />
                 <div className="space-y-4">
                    {signals.map((sig, idx) => (
                      <div key={idx} className="group flex items-start space-x-6 py-4 border-b border-white/5">
                        <span className="text-gray-700 text-[10px] font-mono shrink-0">[{new Date(sig.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
                        <div className="flex-1 min-w-0">
                           <span className="text-white font-black text-[10px] uppercase tracking-tighter mr-3">{sig.sender}:</span>
                           <span className={`text-[11px] leading-relaxed break-words ${sig.type === 'ALERT' ? 'text-red-500' : 'text-gray-500'}`}>{sig.content}</span>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminView;
