
import React, { useState, useEffect, useRef } from 'react';
import { User, PaymentRequest, Chat, Message } from '../types';

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
  const [liveNodes, setLiveNodes] = useState<Record<string, any>>({});
  const [signals, setSignals] = useState<SignalEvent[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  
  const [mainChannel, setMainChannel] = useState<Chat>(() => {
    const saved = localStorage.getItem('nib_chats');
    const chats = saved ? JSON.parse(saved) : [];
    return chats.find((c: Chat) => c.id === 'nib_official') || {
      id: 'nib_official', name: 'NIB SEC HQ', type: 'channel', 
      avatar: 'https://i.ibb.co/3ykXF4K/nib-logo.png', unreadCount: 0, 
      membersCount: 32400, isVerified: true
    };
  });

  const signalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pollHive = () => {
      const globalSignals = JSON.parse(localStorage.getItem('nib_global_signals') || '[]');
      setSignals(globalSignals);

      const nodes = JSON.parse(localStorage.getItem('nib_live_nodes') || '{}');
      const now = Date.now();
      const active = Object.fromEntries(Object.entries(nodes).filter(([_, node]: [string, any]) => now - node.lastSeen < 15000));
      setLiveNodes(active);

      const savedOps = localStorage.getItem('nib_admin_ops');
      const savedPays = localStorage.getItem('nib_admin_pays');
      setOperatives(savedOps ? JSON.parse(savedOps) : []);
      setPayments(savedPays ? JSON.parse(savedPays) : []);
    };

    pollHive();
    const inv = setInterval(pollHive, 1500);
    return () => clearInterval(inv);
  }, []);

  useEffect(() => {
    if (signalEndRef.current) {
      signalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [signals]);

  const addSignal = (type: SignalEvent['type'], content: string) => {
    const signalLog = JSON.parse(localStorage.getItem('nib_global_signals') || '[]');
    const newSignal: SignalEvent = {
      id: Date.now(),
      sender: 'OVERSEER',
      type,
      content,
      timestamp: Date.now()
    };
    localStorage.setItem('nib_global_signals', JSON.stringify([newSignal, ...signalLog].slice(0, 100)));
    setSignals(prev => [newSignal, ...prev].slice(0, 100));
  };

  const sendBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    const msg: Message = {
      id: 'broadcast-' + Date.now(),
      senderId: 'nib_official',
      text: `[BROADCAST] ${broadcastMsg}`,
      timestamp: Date.now()
    };
    localStorage.setItem('nib_admin_broadcast', JSON.stringify(msg));
    setBroadcastMsg('');
    addSignal('SYSTEM', broadcastMsg);
  };

  const handlePaymentAction = (reqId: string, status: 'approved' | 'rejected') => {
    const req = payments.find(p => p.id === reqId);
    if (!req) return;

    if (status === 'approved') {
      // Find the operative in the master list
      const updatedOps = operatives.map(op => {
        if (op.id === req.userId) {
          const currentBal = parseFloat(op.walletBalance) || 0;
          const addAmount = parseFloat(req.amount) || 0;
          return { ...op, walletBalance: (currentBal + addAmount).toFixed(2) };
        }
        return op;
      });

      // Update LocalStorage and State
      localStorage.setItem('nib_admin_ops', JSON.stringify(updatedOps));
      setOperatives(updatedOps);
      
      // Update the specific user's session data if they are live
      const savedUserData = localStorage.getItem('nib_sec_user_data');
      if (savedUserData) {
        const parsedUser = JSON.parse(savedUserData);
        if (parsedUser.id === req.userId) {
          parsedUser.walletBalance = (parseFloat(parsedUser.walletBalance) + parseFloat(req.amount)).toFixed(2);
          localStorage.setItem('nib_sec_user_data', JSON.stringify(parsedUser));
        }
      }

      addSignal('LIQUIDITY', `ACCESS GRANTED: ${req.amount} NIB coins synced to Operative ${req.username}.`);
    } else {
      addSignal('ALERT', `WARNING: Be careful. Signal request from ${req.username} was REJECTED by Overseer.`);
    }

    // Remove request from pending
    const newPays = payments.filter(p => p.id !== reqId);
    localStorage.setItem('nib_admin_pays', JSON.stringify(newPays));
    setPayments(newPays);
  };

  const getTypeColor = (type: SignalEvent['type']) => {
    switch(type) {
      case 'AUTH': return 'text-cyan-400';
      case 'SIGNAL': return 'text-yellow-400';
      case 'LIQUIDITY': return 'text-emerald-400';
      case 'ALERT': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] text-white font-mono selection:bg-yellow-400 selection:text-black">
      {/* TAC-NAV HEADER */}
      <header className="h-20 bg-black/80 backdrop-blur-xl border-b border-white/5 px-10 flex items-center justify-between z-50">
        <div className="flex items-center space-x-12">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 hexagon bg-yellow-400 flex items-center justify-center text-black">
              <i className="fa-solid fa-eye text-xl"></i>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tighter uppercase italic">NIB SEC <span className="text-yellow-400">OVERSEER</span></h1>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">System Status: Optimal</span>
              </div>
            </div>
          </div>
          
          <nav className="flex items-center space-x-2">
            {[
              { id: 'war-room', label: 'Tactical War Room', icon: 'fa-microchip' },
              { id: 'operatives', label: 'Nodes', icon: 'fa-users' },
              { id: 'vault', label: 'Vault', icon: 'fa-vault', badge: payments.length }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-3 px-6 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'bg-yellow-400 text-black' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                <span>{tab.label}</span>
                {tab.badge ? <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full ml-2">{tab.badge}</span> : null}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-[10px] text-gray-600 uppercase font-black">Admin Clearance: Level 7</p>
            <p className="text-[9px] text-yellow-400/40 uppercase">RSA-4096 Authenticated</p>
          </div>
          <button onClick={onExit} className="px-6 py-2 bg-red-600/10 text-red-600 border border-red-600/20 rounded-lg text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Abort</button>
        </div>
      </header>

      {/* MAIN COMMAND INTERFACE */}
      <main className="flex-1 overflow-hidden flex">
        
        {/* LEFT COLUMN: SYSTEM BROADCAST & STATS */}
        <aside className="w-80 border-r border-white/5 flex flex-col p-8 space-y-10 bg-black/20">
          <div className="space-y-4">
            <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] px-2">Global Broadcast</h3>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
              <textarea 
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="TRANSMIT TO ALL NODES..."
                className="w-full bg-transparent border-none outline-none text-[10px] text-yellow-400 font-mono h-24 resize-none placeholder:text-gray-800"
              />
              <button 
                onClick={sendBroadcast}
                className="w-full py-4 bg-yellow-400 text-black rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(250,204,21,0.2)]"
              >
                Execute Broadcast
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] px-2">Network Health</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[8px] text-gray-500 uppercase mb-1">Live Nodes</p>
                <p className="text-2xl font-black text-white">{Object.keys(liveNodes).length}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[8px] text-gray-500 uppercase mb-1">Latency</p>
                <p className="text-2xl font-black text-green-500">12ms</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[8px] text-gray-500 uppercase mb-1">Packets/s</p>
                <p className="text-2xl font-black text-yellow-400">42</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[8px] text-gray-500 uppercase mb-1">Enc Level</p>
                <p className="text-2xl font-black text-cyan-400">HIGH</p>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: LIVE PULSE (ACTIVITY FEED) */}
        <section className="flex-1 flex flex-col bg-black/40 relative">
          {activeTab === 'war-room' && (
            <div className="flex-1 flex flex-col p-10 overflow-hidden">
               <div className="flex items-center justify-between mb-8 px-4">
                 <h2 className="text-xl font-black italic uppercase text-white">Live <span className="text-yellow-400">Signal Pulse</span></h2>
                 <span className="text-[9px] font-mono text-gray-700 tracking-widest">REAL-TIME DATA INTERCEPTION ACTIVE</span>
               </div>
               
               <div className="flex-1 bg-[#080808] border border-white/5 rounded-[3rem] p-8 overflow-y-auto custom-scrollbar shadow-inner flex flex-col-reverse">
                 <div ref={signalEndRef} />
                 <div className="space-y-4">
                    {signals.length === 0 ? (
                      <div className="py-32 text-center opacity-20">
                         <i className="fa-solid fa-satellite-dish text-6xl mb-6"></i>
                         <p className="text-[10px] font-black uppercase tracking-[0.4em]">Listening for Hive neural signals...</p>
                      </div>
                    ) : (
                      signals.map(sig => (
                        <div key={sig.id} className="group flex items-start space-x-6 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all px-4 rounded-xl">
                          <span className="text-gray-700 text-[10px] shrink-0 font-mono w-20">[{new Date(sig.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
                          <span className={`${getTypeColor(sig.type)} font-black text-[10px] shrink-0 w-24`}>[{sig.type}]</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-white font-bold text-[10px] uppercase tracking-tighter mr-2">{sig.sender}:</span>
                            <span className="text-gray-400 text-[10px] break-words tracking-tight leading-relaxed">{sig.content}</span>
                          </div>
                        </div>
                      ))
                    )}
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'operatives' && (
            <div className="flex-1 p-10 space-y-8 overflow-y-auto custom-scrollbar">
               <h2 className="text-2xl font-black italic uppercase text-white px-4">Registry <span className="text-yellow-400">Nodes</span></h2>
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 px-4">
                  {operatives.map(op => (
                    <div key={op.id} className="p-8 bg-[#0a0a0a] border border-white/5 rounded-[3rem] flex items-center justify-between group hover:border-yellow-400/20 transition-all">
                       <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 hexagon p-0.5 bg-yellow-400/20 group-hover:bg-yellow-400 transition-all">
                             <img src={op.avatarUrl} className="w-full h-full hexagon object-cover grayscale brightness-110 group-hover:grayscale-0" />
                          </div>
                          <div>
                             <p className="text-lg font-black uppercase text-white">{op.displayName}</p>
                             <p className="text-[10px] text-gray-600 font-mono">{op.username}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-2xl font-black text-yellow-400">{op.walletBalance}</p>
                          <p className="text-[9px] text-gray-700 font-black uppercase tracking-widest">Signal Coins</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="flex-1 p-10 space-y-10 overflow-y-auto custom-scrollbar">
               <h2 className="text-2xl font-black italic uppercase text-white px-4">Pending <span className="text-yellow-400">Liquidations</span></h2>
               <div className="space-y-6 px-4">
                  {payments.length === 0 ? (
                    <div className="py-40 text-center opacity-10">
                       <i className="fa-solid fa-vault text-8xl mb-6"></i>
                       <p className="text-xl font-black uppercase tracking-widest">Vault is Secure</p>
                    </div>
                  ) : (
                    payments.map(p => (
                      <div key={p.id} className="bg-[#0a0a0a] border border-emerald-400/10 p-10 rounded-[4rem] flex items-center justify-between shadow-2xl">
                         <div className="space-y-2">
                            <p className="text-2xl font-black text-white italic uppercase tracking-tighter">{p.username}</p>
                            <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{p.amount} ETB • {p.method}</p>
                         </div>
                         <div className="flex space-x-4">
                            <button onClick={() => handlePaymentAction(p.id, 'rejected')} className="px-10 py-5 bg-red-600/10 text-red-600 rounded-3xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Reject</button>
                            <button onClick={() => handlePaymentAction(p.id, 'approved')} className="px-10 py-5 bg-yellow-400 text-black rounded-3xl text-[10px] font-black uppercase shadow-xl hover:scale-105 active:scale-95 transition-all">Authorize Node</button>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: ACTIVE NODE CLUSTER */}
        <aside className="w-96 border-l border-white/5 flex flex-col p-8 bg-black/40 overflow-hidden">
          <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] px-2 mb-8">Node Heatmap (LIVE)</h3>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
             {Object.keys(liveNodes).length === 0 ? (
               <div className="py-20 text-center opacity-10">
                  <p className="text-[8px] font-black uppercase tracking-widest">Silence in the Hive</p>
               </div>
             ) : (
               Object.values(liveNodes).map((node: any) => (
                 <div 
                   key={node.id} 
                   onClick={() => setSelectedNode(node)}
                   className={`p-5 rounded-[2.5rem] border transition-all cursor-pointer flex items-center space-x-5 ${selectedNode?.id === node.id ? 'bg-yellow-400 border-yellow-400 text-black shadow-lg' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                 >
                    <div className="relative shrink-0">
                       <div className={`w-14 h-14 hexagon p-0.5 ${selectedNode?.id === node.id ? 'bg-black' : 'bg-yellow-400'}`}>
                          <img src={node.avatarUrl} className="w-full h-full hexagon object-cover" />
                       </div>
                       <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-ping"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className={`text-[11px] font-black uppercase truncate ${selectedNode?.id === node.id ? 'text-black' : 'text-white'}`}>{node.displayName}</p>
                       <p className={`text-[9px] font-mono tracking-tighter ${selectedNode?.id === node.id ? 'text-black/60' : 'text-gray-600'}`}>{node.username}</p>
                    </div>
                 </div>
               ))
             )}
          </div>

          {/* NODE INSPECTOR (Contextual Pane) */}
          {selectedNode && (
            <div className="mt-8 pt-8 border-t border-white/10 animate-in slide-in-from-bottom-10">
               <div className="flex items-center justify-between mb-6">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-yellow-400">Node Inspector</h4>
                 <button onClick={() => setSelectedNode(null)} className="text-gray-600 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
               </div>
               <div className="bg-black/60 rounded-[2.5rem] p-6 border border-white/10 space-y-4">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-600 font-black uppercase">Method</span>
                    <span className="text-white font-mono uppercase">{selectedNode.loginMethod}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-600 font-black uppercase">Coins</span>
                    <span className="text-yellow-400 font-mono">{selectedNode.walletBalance}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-600 font-black uppercase">Status</span>
                    <span className="text-green-500 font-black uppercase tracking-widest">Active</span>
                  </div>
                  <button className="w-full py-3 bg-red-600/20 text-red-600 rounded-xl text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Kill Connection</button>
               </div>
            </div>
          )}
        </aside>
      </main>

      {/* SYSTEM TICKER */}
      <footer className="h-10 bg-black border-t border-white/5 px-10 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.3em] text-gray-700">
        <div className="flex items-center space-x-8">
          <span>Signal Interception: Active</span>
          <span>E2E-Handshakes: Verified</span>
          <span>Quantum Barrier: Stable</span>
        </div>
        <div className="text-yellow-400/20">
          SEC-AUTH: 0x{Math.random().toString(16).substr(2, 8).toUpperCase()}
        </div>
      </footer>
    </div>
  );
};

export default AdminView;
