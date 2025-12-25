import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, PaymentRequest } from '../types';

interface AdminViewProps {
  onExit: () => void;
}

interface SignalEvent {
  id: string;
  sender: string;
  type: 'AUTH' | 'SIGNAL' | 'LIQUIDITY' | 'ALERT' | 'SYSTEM';
  content: string;
  timestamp: number;
  delta?: string;
}

const AdminView: React.FC<AdminViewProps> = ({ onExit }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [activeTab, setActiveTab] = useState<'war-room' | 'operatives' | 'vault' | 'network'>('operatives');
  const [operatives, setOperatives] = useState<User[]>([]);
  const [signals, setSignals] = useState<SignalEvent[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedOp, setSelectedOp] = useState<User | null>(null);
  const [mintAmount, setMintAmount] = useState('100');

  const pollIntervalRef = useRef<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdminLogin = () => {
    // Second layer Overseer token
    if (adminPass === 'HIVE_OVERSEER_2025') {
      setIsAuthenticated(true);
    } else {
      alert("SIGNAL REJECTED: INVALID OVERSEER TOKEN");
      setAdminPass('');
    }
  };

  const fetchHiveData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsRefreshing(true);
    try {
      const [usersRes, paymentsRes, logsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/purchases'),
        fetch('/api/logs')
      ]);

      if (usersRes.ok) {
        const users = await usersRes.json();
        setOperatives(users.sort((a: User, b: User) => (b.registrationDate || 0) - (a.registrationDate || 0)));
      }
      if (paymentsRes.ok) setPayments(await paymentsRes.json());
      if (logsRes.ok) setSignals(await logsRes.json());

    } catch (e) {
      console.error("Overseer uplink failure");
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHiveData();
      pollIntervalRef.current = window.setInterval(fetchHiveData, 10000);
    }
    return () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); };
  }, [fetchHiveData, isAuthenticated]);

  const handleMintCoins = async () => {
    if (!selectedOp || isProcessing) return;
    setIsProcessing(selectedOp.id);
    const amount = parseFloat(mintAmount);
    if (isNaN(amount)) return;

    try {
      const newBalance = (parseFloat(selectedOp.walletBalance || '0') + amount).toFixed(0);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...selectedOp, walletBalance: newBalance })
      });

      if (response.ok) {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: 'LIQUIDITY', 
            sender: 'OVERSEER', 
            content: `Direct credit injection for ${selectedOp.username}`, 
            delta: `+${amount} NIB` 
          })
        });
        showToast(`Minted ${amount} NIB for ${selectedOp.username}`);
        await fetchHiveData();
        setSelectedOp(prev => prev ? { ...prev, walletBalance: newBalance } : null);
      }
    } catch (e) {
      showToast("Minting protocol failed", 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleBanToggle = async (op: User, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isProcessing) return;
    setIsProcessing(op.id);
    
    const updatedStatus = !op.isBanned;
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...op, isBanned: updatedStatus })
      });

      if (response.ok) {
        showToast(`Node ${op.username} ${updatedStatus ? 'Terminated' : 'Restored'}`);
        await fetchHiveData();
        if (selectedOp?.id === op.id) setSelectedOp(prev => prev ? { ...prev, isBanned: updatedStatus } : null);
      }
    } catch (e) {
      showToast("Identity protocol failed", 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleVaultAction = async (req: PaymentRequest, status: 'approved' | 'rejected') => {
    if (isProcessing) return;
    setIsProcessing(req.id);
    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req, status })
      });

      if (response.ok && status === 'approved') {
        const op = operatives.find(u => u.id === req.userId);
        if (op) {
          const newBalance = (parseFloat(op.walletBalance || '0') + parseFloat(req.amount)).toFixed(0);
          await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...op, walletBalance: newBalance })
          });
        }
        showToast("NIB Coin Handshake Approved");
      } else {
        showToast("Signal Rejected", 'error');
      }
      await fetchHiveData();
    } catch (e) {
      showToast("Ledger sync failure", 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleString([], { hour12: false, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center p-6 font-mono relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 honeycomb-bg pointer-events-none"></div>
        <div className="w-full max-w-md bg-[#0c0c0c] border border-yellow-400/30 rounded-[3.5rem] p-12 text-center space-y-10 shadow-[0_0_120px_rgba(250,204,21,0.2)] animate-in zoom-in-95">
           <div className="w-24 h-24 hexagon bg-yellow-400 mx-auto flex items-center justify-center text-black shadow-glow">
              <i className="fa-solid fa-user-shield text-4xl"></i>
           </div>
           <div className="space-y-4">
              <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">Overseer Access</h2>
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">Identify Master Token</p>
           </div>
           <input 
             type="password" 
             value={adminPass}
             onChange={e => setAdminPass(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
             placeholder="••••••••••••"
             className="w-full bg-black border border-white/10 rounded-2xl py-6 px-8 text-center text-yellow-400 font-black tracking-widest outline-none focus:border-yellow-400 transition-all"
           />
           <div className="flex space-x-4">
              <button onClick={onExit} className="flex-1 py-5 bg-white/5 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Abort</button>
              <button onClick={handleAdminLogin} className="flex-1 py-5 bg-yellow-400 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-glow hover:scale-105 active:scale-95 transition-all">Uplink</button>
           </div>
        </div>
      </div>
    );
  }

  const totalCoins = operatives.reduce((acc, op) => acc + parseFloat(op.walletBalance || '0'), 0);
  const activeNodes = operatives.filter(o => !o.isBanned).length;

  return (
    <div className="h-full flex flex-col bg-[#050505] text-white font-mono relative">
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[3000] px-8 py-4 rounded-2xl border flex items-center space-x-4 animate-in slide-in-from-top-4 shadow-2xl backdrop-blur-3xl ${toast.type === 'success' ? 'bg-green-600/10 border-green-500/50 text-green-500' : 'bg-red-600/10 border-red-500/50 text-red-500'}`}>
           <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
           <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <header className="h-24 bg-black/80 backdrop-blur-xl border-b border-white/5 px-10 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center space-x-12">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 hexagon bg-yellow-400 flex items-center justify-center text-black shadow-glow`}>
               <i className="fa-solid fa-eye text-2xl"></i>
            </div>
            <h1 className="text-sm font-black tracking-tighter uppercase italic">NIB SEC <span className="text-yellow-400">OVERSEER</span></h1>
          </div>
          <nav className="flex space-x-2">
            {[
              { id: 'operatives', icon: 'fa-users', label: 'Neural Nodes' },
              { id: 'vault', icon: 'fa-coins', label: 'NIB Vault' },
              { id: 'network', icon: 'fa-network-wired', label: 'Network Health' },
              { id: 'war-room', icon: 'fa-tower-broadcast', label: 'Live Stream' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center space-x-3 ${activeTab === tab.id ? 'bg-yellow-400 text-black shadow-glow' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}>
                <i className={`fa-solid ${tab.icon}`}></i><span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <button onClick={onExit} className="px-8 py-3 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Sever Connection</button>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {selectedOp && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in">
             <div className="w-full max-w-2xl bg-[#0a0a0a] border border-yellow-400/20 rounded-[4rem] p-12 relative shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                
                <button onClick={() => setSelectedOp(null)} className="absolute top-10 right-10 text-gray-500 hover:text-white transition-colors"><i className="fa-solid fa-xmark text-2xl"></i></button>
                
                <div className="flex items-center space-x-8 mb-12">
                   <div className="w-32 h-32 hexagon bg-yellow-400 p-1"><img src={selectedOp.avatarUrl} className="w-full h-full hexagon object-cover" /></div>
                   <div className="space-y-2">
                      <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter">{selectedOp.displayName}</h3>
                      <p className="text-yellow-400 font-bold uppercase tracking-[0.3em] text-[10px]">{selectedOp.username} | NODE: {selectedOp.id.slice(0, 12)}...</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-12">
                   <div className="bg-black/60 border border-white/5 p-8 rounded-[3rem] space-y-4">
                      <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Available Liquidity</p>
                      <p className="text-5xl font-black text-white">{selectedOp.walletBalance} <span className="text-sm text-yellow-400">NIB</span></p>
                   </div>
                   <div className="bg-black/60 border border-white/5 p-8 rounded-[3rem] space-y-4">
                      <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Injection Protocols</p>
                      <div className="flex items-center space-x-4">
                         <input 
                           type="number" 
                           value={mintAmount}
                           onChange={e => setMintAmount(e.target.value)}
                           className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-yellow-400 font-black text-2xl outline-none focus:border-yellow-400/40 transition-all"
                         />
                         <button onClick={handleMintCoins} className="w-16 h-16 bg-yellow-400 text-black rounded-2xl flex items-center justify-center shadow-glow active:scale-95 transition-all hover:scale-105"><i className="fa-solid fa-bolt text-xl"></i></button>
                      </div>
                   </div>
                </div>

                <div className="flex space-x-4">
                   <button onClick={() => handleBanToggle(selectedOp)} className={`flex-1 py-6 rounded-3xl font-black uppercase text-xs tracking-widest transition-all ${selectedOp.isBanned ? 'bg-green-600 text-white shadow-glow' : 'bg-red-600 text-white shadow-[0_10px_30px_rgba(220,38,38,0.3)]'}`}>
                      {selectedOp.isBanned ? 'Restore Signal' : 'Terminate Neural Link'}
                   </button>
                   <button className="px-8 py-6 bg-white/5 border border-white/5 rounded-3xl text-gray-500 hover:text-white hover:bg-white/10 transition-all"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'operatives' && (
          <div className="h-full overflow-y-auto p-12 space-y-4 custom-scrollbar">
            <div className="grid grid-cols-6 px-10 text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] pb-4">
               <span className="col-span-2">Operative Node</span>
               <span className="text-center">Protocol</span>
               <span className="text-center">Credits</span>
               <span className="text-center">Status</span>
               <span className="text-right">Actions</span>
            </div>
            {operatives.map(op => (
              <div key={op.id} onClick={() => setSelectedOp(op)} className={`bg-[#080808] border border-white/5 p-6 rounded-[3rem] grid grid-cols-6 items-center transition-all hover:bg-white/[0.04] cursor-pointer ${op.isBanned ? 'opacity-40 grayscale' : 'shadow-xl'}`}>
                <div className="col-span-2 flex items-center space-x-6">
                  <div className={`w-12 h-12 hexagon p-0.5 bg-yellow-400`}><img src={op.avatarUrl} className="w-full h-full hexagon object-cover" /></div>
                  <div><p className="text-sm font-black uppercase italic text-white">{op.displayName}</p><p className="text-[9px] text-gray-600 font-mono">{op.username}</p></div>
                </div>
                <div className="text-center"><span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase text-gray-500">{op.loginMethod}</span></div>
                <div className="text-center text-xl font-black text-yellow-400">{op.walletBalance} <span className="text-[9px] text-gray-600">NIB</span></div>
                <div className="text-center">
                   <span className={`px-5 py-2 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${op.isBanned ? 'text-red-500 border-red-500/30 bg-red-500/5' : 'text-green-500 border-green-500/30 bg-green-500/5'}`}>
                      {op.isBanned ? 'TERMINATED' : 'ACTIVE'}
                   </span>
                </div>
                <div className="text-right">
                   <button className="w-10 h-10 rounded-xl bg-white/5 text-gray-500 group-hover:text-white transition-all"><i className="fa-solid fa-chevron-right"></i></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'network' && (
          <div className="h-full p-12 flex flex-col items-center justify-center space-y-12">
             <div className="grid grid-cols-3 gap-12 w-full max-w-6xl">
                <div className="bg-[#0c0c0c] border border-white/5 p-16 rounded-[4.5rem] text-center space-y-8 shadow-2xl relative overflow-hidden group">
                   <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/[0.02] transition-colors"></div>
                   <div className="w-24 h-24 bg-yellow-400 mx-auto rounded-[2rem] flex items-center justify-center text-black shadow-glow group-hover:scale-110 transition-transform"><i className="fa-solid fa-coins text-4xl"></i></div>
                   <div className="space-y-2">
                      <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.4em]">Cumulative Supply</p>
                      <p className="text-6xl font-black italic text-white tracking-tighter">{totalCoins.toLocaleString()}</p>
                   </div>
                </div>
                <div className="bg-[#0c0c0c] border border-white/5 p-16 rounded-[4.5rem] text-center space-y-8 shadow-2xl relative overflow-hidden group">
                   <div className="w-24 h-24 bg-blue-600 mx-auto rounded-[2rem] flex items-center justify-center text-white group-hover:scale-110 transition-transform"><i className="fa-solid fa-microchip text-4xl"></i></div>
                   <div className="space-y-2">
                      <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.4em]">Neural Nodes</p>
                      <p className="text-6xl font-black italic text-white tracking-tighter">{activeNodes}</p>
                   </div>
                </div>
                <div className="bg-[#0c0c0c] border border-white/5 p-16 rounded-[4.5rem] text-center space-y-8 shadow-2xl relative overflow-hidden group">
                   <div className="w-24 h-24 bg-green-600 mx-auto rounded-[2rem] flex items-center justify-center text-white group-hover:scale-110 transition-transform"><i className="fa-solid fa-shield-halved text-4xl"></i></div>
                   <div className="space-y-2">
                      <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.4em]">Signal Integrity</p>
                      <p className="text-6xl font-black italic text-white tracking-tighter">99.9%</p>
                   </div>
                </div>
             </div>
             <div className="w-full max-w-6xl bg-[#080808] border border-white/5 p-12 rounded-[4.5rem] h-64 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 flex items-center justify-around pointer-events-none">
                   {[...Array(30)].map((_, i) => (
                     <div key={i} className="w-1 bg-yellow-400 transition-all duration-500 animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }}></div>
                   ))}
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-[0.6em] text-yellow-400 z-10">Neural Pulse Monitor</h3>
                <p className="text-[10px] text-gray-700 font-mono mt-4 tracking-[0.4em] z-10 uppercase">Global Data Handshake Active</p>
             </div>
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="h-full overflow-y-auto p-12 space-y-12 custom-scrollbar">
            <div className="grid gap-6">
               {payments.filter(p => p.status === 'pending').map(p => (
                 <div key={p.id} className="bg-[#0a0a0a] border border-yellow-400/20 p-12 rounded-[4rem] flex items-center justify-between shadow-glow animate-in slide-in-from-bottom-4">
                    <div className="space-y-3">
                       <p className="text-4xl font-black text-white italic tracking-tighter uppercase">{p.username}</p>
                       <div className="flex items-center space-x-6">
                          <span className="text-[10px] text-yellow-400 font-black uppercase tracking-[0.2em] bg-yellow-400/5 px-4 py-1.5 rounded-full border border-yellow-400/20">{p.method} Protocol</span>
                          <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">{formatDate(p.timestamp)}</span>
                       </div>
                    </div>
                    <div className="flex items-center space-x-12">
                       <p className="text-6xl font-black text-yellow-400">{p.amount} <span className="text-sm text-white/40">NIB</span></p>
                       <div className="flex space-x-4">
                          <button onClick={() => handleVaultAction(p, 'rejected')} className="px-10 py-6 bg-white/5 border border-white/10 rounded-3xl text-[10px] font-black uppercase text-red-500 hover:bg-red-600 hover:text-white transition-all">Reject</button>
                          <button onClick={() => handleVaultAction(p, 'approved')} className="px-16 py-6 bg-yellow-400 text-black rounded-3xl text-[10px] font-black uppercase shadow-glow hover:scale-105 transition-all">Authorize</button>
                       </div>
                    </div>
                 </div>
               ))}
               {payments.filter(p => p.status === 'pending').length === 0 && (
                 <div className="text-center py-40 opacity-20 text-[10px] uppercase font-black tracking-[1em] border-2 border-dashed border-white/5 rounded-[5rem]">
                    No Pending Liquidity Requests
                 </div>
               )}
            </div>
            
            {/* Recent History in Vault */}
            {payments.filter(p => p.status !== 'pending').length > 0 && (
              <div className="space-y-6 px-4">
                <h4 className="text-[10px] text-gray-700 font-black uppercase tracking-[0.5em]">Ledger Archive</h4>
                <div className="grid grid-cols-2 gap-4">
                   {payments.filter(p => p.status !== 'pending').slice(0, 10).map(p => (
                     <div key={p.id} className="bg-black/40 border border-white/5 p-6 rounded-[2.5rem] flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity">
                        <div className="flex items-center space-x-4">
                           <div className={`w-3 h-3 rounded-full ${p.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                           <p className="text-[11px] font-black uppercase text-white">{p.username}</p>
                        </div>
                        <p className="text-[11px] font-black text-yellow-400">{p.amount} NIB</p>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'war-room' && (
          <div className="h-full flex flex-col p-12 overflow-hidden">
             <div className="flex-1 bg-black/40 border border-white/5 rounded-[4rem] p-12 overflow-y-auto custom-scrollbar font-mono relative">
                <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-black/50 to-transparent pointer-events-none"></div>
                {signals.map((sig, idx) => (
                  <div key={idx} className="flex items-start space-x-8 py-5 border-b border-white/[0.03] animate-in slide-in-from-left-4">
                    <span className="text-gray-800 text-[11px] font-bold">[{new Date(sig.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
                    <span className={`font-black text-[11px] uppercase tracking-tight ${sig.type === 'ALERT' ? 'text-red-500' : sig.type === 'LIQUIDITY' ? 'text-yellow-400' : 'text-blue-400'}`}>{sig.sender}:</span>
                    <span className="text-[12px] text-gray-400 flex-1 leading-relaxed">{sig.content}</span>
                    {sig.delta && <span className="text-[10px] font-black text-yellow-400 bg-yellow-400/5 px-3 py-1 rounded-lg border border-yellow-400/10">{sig.delta}</span>}
                  </div>
                ))}
                {signals.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-10">
                    <i className="fa-solid fa-tower-broadcast text-8xl"></i>
                    <p className="text-xs uppercase font-black tracking-[1em]">Awaiting Uplink</p>
                  </div>
                )}
             </div>
          </div>
        )}
      </main>

      <footer className="h-12 bg-black/60 border-t border-white/5 px-10 flex items-center justify-between text-[8px] font-black uppercase text-gray-700 tracking-[0.5em] shrink-0">
         <div className="flex space-x-12">
            <span>Neural Nodes: {operatives.length}</span>
            <span>Ledger Entries: {payments.length}</span>
            <span>Uptime: 99.9%</span>
         </div>
         <div className="flex items-center space-x-2">
            <span className="text-yellow-400/30">NIB SEC OVERSEER PRO-2.8.0</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
         </div>
      </footer>
    </div>
  );
};

export default AdminView;