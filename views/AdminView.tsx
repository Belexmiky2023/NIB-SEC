
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
  
  const signalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pollHive = () => {
      const globalSignals = JSON.parse(localStorage.getItem('nib_global_signals') || '[]');
      setSignals(globalSignals);

      const savedOps = localStorage.getItem('nib_admin_ops');
      const savedPays = localStorage.getItem('nib_admin_pays');
      
      setOperatives(savedOps ? JSON.parse(savedOps) : []);
      setPayments(savedPays ? JSON.parse(savedPays) : []);
    };
    pollHive();
    const inv = setInterval(pollHive, 1500);
    return () => clearInterval(inv);
  }, []);

  const addSignal = (type: SignalEvent['type'], content: string) => {
    const signalLog = JSON.parse(localStorage.getItem('nib_global_signals') || '[]');
    const newSignal: SignalEvent = { id: Date.now(), sender: 'OVERSEER', type, content, timestamp: Date.now() };
    localStorage.setItem('nib_global_signals', JSON.stringify([newSignal, ...signalLog].slice(0, 100)));
  };

  const handleBanStatus = (userId: string, isBanned: boolean) => {
    const updatedOps = operatives.map(op => {
      if (op.id === userId) {
        return { ...op, isBanned };
      }
      return op;
    });
    localStorage.setItem('nib_admin_ops', JSON.stringify(updatedOps));
    setOperatives(updatedOps);
    
    const targetUser = operatives.find(o => o.id === userId);
    addSignal('ALERT', `OPERATIVE STATUS CHANGE: ${targetUser?.username} is now ${isBanned ? 'BANNED' : 'REINSTATED'} by Overseer.`);
  };

  const handlePaymentAction = (reqId: string, status: 'approved' | 'rejected') => {
    const updatedPayments = payments.map(p => {
      if (p.id === reqId) {
        return { ...p, status };
      }
      return p;
    });

    const req = payments.find(p => p.id === reqId);
    if (!req) return;

    if (status === 'approved') {
      const updatedOps = operatives.map(op => {
        if (op.id === req.userId) {
          const currentBal = parseFloat(op.walletBalance) || 0;
          const addAmount = parseFloat(req.amount) || 0;
          return { ...op, walletBalance: (currentBal + addAmount).toFixed(2) };
        }
        return op;
      });
      localStorage.setItem('nib_admin_ops', JSON.stringify(updatedOps));
      setOperatives(updatedOps);
      
      localStorage.setItem(`nib_payment_success_${req.userId}`, JSON.stringify({
        amount: req.amount,
        timestamp: Date.now()
      }));

      addSignal('LIQUIDITY', `ACCESS GRANTED: ${req.amount} NIB coins synced to Operative ${req.username}.`);
    } else {
      addSignal('ALERT', `WARNING: Signal request from ${req.username} was REJECTED by Overseer.`);
    }

    localStorage.setItem('nib_admin_pays', JSON.stringify(updatedPayments));
    setPayments(updatedPayments);
  };

  const formatDate = (ts?: number) => {
    if (!ts) return "---";
    return new Date(ts).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
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
              { id: 'war-room', label: 'Tactical', icon: 'fa-microchip' }, 
              { id: 'operatives', label: 'User Registry', icon: 'fa-users' }, 
              { id: 'vault', label: 'Purchases', icon: 'fa-vault', badge: pendingPayments.length } 
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center space-x-3 px-6 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'bg-yellow-400 text-black' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                <i className={`fa-solid ${tab.icon}`}></i><span>{tab.label}</span>
                {tab.id === 'vault' && tab.badge ? <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full ml-2">{tab.badge}</span> : null}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={onExit} className="px-6 py-2 bg-red-600/10 text-red-600 border border-red-600/20 rounded-lg text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Abort</button>
      </header>

      <main className="flex-1 overflow-hidden flex">
        <section className="flex-1 flex flex-col bg-black/40 relative">
          
          {activeTab === 'operatives' && (
            <div className="flex-1 p-10 space-y-8 overflow-y-auto custom-scrollbar">
               <div className="flex items-center justify-between px-4">
                  <h2 className="text-2xl font-black italic uppercase text-white">Registered Operatives</h2>
                  <p className="text-[10px] text-gray-700 font-mono">{operatives.length} TOTAL NODES</p>
               </div>
               <div className="grid grid-cols-1 gap-4 px-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 grid grid-cols-6 text-[9px] font-black text-gray-600 uppercase tracking-widest px-8 mb-2">
                    <span className="col-span-2">Operative Identity</span>
                    <span>Auth Provider / Phone</span>
                    <span>Joined Date</span>
                    <span className="text-right">NIB Balance</span>
                    <span className="text-right">Actions</span>
                  </div>
                  {operatives.map(op => (
                    <div key={op.id} className="p-6 bg-[#0a0a0a] border border-white/5 rounded-[3rem] flex items-center justify-between group hover:border-yellow-400/20 transition-all shadow-xl">
                       <div className="flex items-center space-x-6 w-1/3">
                          <div className={`w-14 h-14 hexagon p-0.5 ${op.isBanned ? 'bg-red-600' : 'bg-yellow-400/20 group-hover:bg-yellow-400'} transition-all shadow-glow shrink-0`}>
                            <img src={op.avatarUrl} className={`w-full h-full hexagon object-cover ${op.isBanned ? 'grayscale' : 'grayscale group-hover:grayscale-0'}`} />
                          </div>
                          <div className="truncate">
                            <p className={`text-lg font-black uppercase truncate ${op.isBanned ? 'text-gray-600' : 'text-white'}`}>{op.displayName}</p>
                            <p className="text-[10px] text-gray-600 font-mono truncate">{op.username}</p>
                          </div>
                       </div>
                       <div className="w-1/6 text-center">
                          <span className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase ${op.loginMethod === 'phone' ? 'border-yellow-400/20 text-yellow-400' : 'border-blue-400/20 text-blue-400'}`}>
                            {op.loginMethod === 'phone' ? (op.phone || 'Phone') : (op.loginMethod || 'Google/GH')}
                          </span>
                       </div>
                       <div className="w-1/6 text-center">
                          <p className="text-[10px] text-gray-500 font-mono">{formatDate(op.registrationDate)}</p>
                       </div>
                       <div className="w-1/6 text-right">
                          <p className={`text-xl font-black ${op.isBanned ? 'text-gray-700' : 'text-yellow-400'}`}>{op.walletBalance}</p>
                          <p className="text-[9px] text-gray-700 font-black uppercase tracking-widest">NIB COINS</p>
                       </div>
                       <div className="w-1/6 text-right flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 border rounded-full font-black text-[9px] uppercase tracking-widest ${op.isBanned ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                            {op.isBanned ? 'Banned' : 'Active'}
                          </span>
                          <button 
                            onClick={() => handleBanStatus(op.id, !op.isBanned)} 
                            className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase border transition-all ${op.isBanned ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-black' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'}`}
                          >
                            {op.isBanned ? 'Unban' : 'Ban Node'}
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="flex-1 p-10 space-y-12 overflow-y-auto custom-scrollbar">
               <div className="space-y-6">
                 <div className="flex items-center justify-between px-4">
                    <h2 className="text-2xl font-black italic uppercase text-white">Pending Signal Requests</h2>
                    <p className="text-[10px] text-orange-400 font-black uppercase tracking-[0.2em]">{pendingPayments.length} AWAITING AUTHORIZATION</p>
                 </div>
                 <div className="space-y-4 px-4">
                    {pendingPayments.map(p => (
                      <div key={p.id} className="bg-[#0a0a0a] border border-orange-400/20 p-8 rounded-[3rem] flex items-center justify-between shadow-2xl group hover:border-yellow-400/30 transition-all">
                         <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                               <span className="text-[10px] text-orange-400 font-black uppercase tracking-[0.3em]">Incoming Request:</span>
                               <span className="text-[10px] font-mono text-gray-500">{formatDate(p.timestamp)}</span>
                            </div>
                            <div className="flex flex-col space-y-1">
                               <p className="text-2xl font-black text-white italic uppercase tracking-tighter">Who buying: {p.username}</p>
                               <p className="text-lg font-black text-yellow-400 uppercase">Amount: {p.amount} NIB</p>
                            </div>
                            <div className="flex items-center space-x-4 mt-4">
                               <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                                  <p className="text-[10px] font-mono text-gray-400">Node ID: {p.userId.slice(0,16)}...</p>
                               </div>
                               <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                                  <p className="text-[10px] font-mono text-gray-500">METHOD: {p.method}</p>
                               </div>
                            </div>
                         </div>
                         <div className="flex space-x-4">
                            <button onClick={() => handlePaymentAction(p.id, 'rejected')} className="px-10 py-5 bg-red-600/10 text-red-600 rounded-3xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Reject</button>
                            <button onClick={() => handlePaymentAction(p.id, 'approved')} className="px-10 py-5 bg-yellow-400 text-black rounded-3xl text-[10px] font-black uppercase shadow-glow hover:scale-105 active:scale-95 transition-all">Authorize</button>
                         </div>
                      </div>
                    ))}
                    {pendingPayments.length === 0 && <div className="text-center py-12 bg-white/5 rounded-[3rem] border border-dashed border-white/10 opacity-30 font-black uppercase tracking-widest text-xs">No pending requests</div>}
                 </div>
               </div>

               <div className="space-y-6">
                 <div className="flex items-center justify-between px-4">
                    <h2 className="text-xl font-black italic uppercase text-gray-500">Transaction Ledger</h2>
                    <p className="text-[10px] text-gray-700 font-mono">ARCHIVED ACTIVITIES</p>
                 </div>
                 <div className="space-y-3 px-4 pb-20">
                    {historyPayments.map(p => (
                      <div key={p.id} className="p-6 bg-[#080808] border border-white/5 rounded-3xl flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
                         <div className="flex items-center space-x-8">
                            <div className="w-10 h-10 hexagon bg-white/5 flex items-center justify-center">
                              <i className={`fa-solid ${p.status === 'approved' ? 'fa-check text-green-500' : 'fa-xmark text-red-500'}`}></i>
                            </div>
                            <div>
                               <p className="text-sm font-black text-white uppercase italic">{p.username}</p>
                               <p className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">{formatDate(p.timestamp)}</p>
                            </div>
                            <div className="text-center">
                               <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">{p.amount} NIB</p>
                               <p className="text-[8px] text-gray-700 font-mono">{p.method}</p>
                            </div>
                         </div>
                         <div>
                            <span className={`px-4 py-1.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${p.status === 'approved' ? 'border-green-500/20 text-green-500' : 'border-red-500/20 text-red-500'}`}>
                              {p.status}
                            </span>
                         </div>
                      </div>
                    ))}
                    {historyPayments.length === 0 && <div className="text-center py-10 opacity-10 uppercase font-black text-[10px] tracking-widest">History is empty</div>}
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'war-room' && (
            <div className="flex-1 flex flex-col p-10 overflow-hidden">
               <h2 className="text-xl font-black italic uppercase text-white mb-8">Signal Interception Feed</h2>
               <div className="flex-1 bg-[#080808] border border-white/5 rounded-[3rem] p-8 overflow-y-auto custom-scrollbar flex flex-col-reverse shadow-inner">
                 <div ref={signalEndRef} />
                 <div className="space-y-4">
                    {signals.map(sig => (
                      <div key={sig.id} className="group flex items-start space-x-6 py-4 border-b border-white/5 hover:bg-white/[0.02] px-6 rounded-2xl transition-all">
                        <span className="text-gray-700 text-[10px] shrink-0 font-mono w-24">[{new Date(sig.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
                        <div className="flex-1 min-w-0">
                           <span className="text-white font-black text-[10px] uppercase tracking-tighter mr-3">{sig.sender}:</span>
                           <span className="text-gray-500 text-[11px] leading-relaxed break-words">{sig.content}</span>
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
