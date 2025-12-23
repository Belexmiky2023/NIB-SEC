
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
  const [activeTab, setActiveTab] = useState<'war-room' | 'operatives' | 'vault'>('operatives');
  const [operatives, setOperatives] = useState<User[]>([]);
  const [signals, setSignals] = useState<SignalEvent[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedOp, setSelectedOp] = useState<User | null>(null);

  const pollIntervalRef = useRef<number | null>(null);
  const warRoomEndRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const recordSignal = async (type: SignalEvent['type'], sender: string, content: string, delta?: string) => {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, sender, content, delta })
      });
    } catch (e) {
      console.error("Signal recording failure");
    }
  };

  const fetchHiveData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchHiveData();
    pollIntervalRef.current = window.setInterval(fetchHiveData, 10000);
    return () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); };
  }, [fetchHiveData]);

  const handleBanToggle = async (op: User, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isProcessing) return; // Prevent double trigger
    setIsProcessing(op.id);
    
    const updatedStatus = !op.isBanned;
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...op, isBanned: updatedStatus })
      });

      if (response.ok) {
        await recordSignal('ALERT', 'OVERSEER', `Node ${op.username} termination protocol: ${updatedStatus ? 'ACTIVE' : 'DEACTIVATED'}`);
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
          await recordSignal('LIQUIDITY', 'LEDGER', `Authorized credit injection for ${req.username}`, `+${req.amount} NIB`);
        }
        showToast("Signal Handshake Approved");
      } else {
        await recordSignal('SYSTEM', 'LEDGER', `Rejected signal request from ${req.username}`);
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

  const pendingCount = payments.filter(p => p.status === 'pending').length;

  return (
    <div className="h-full flex flex-col bg-[#050505] text-white font-mono selection:bg-yellow-400 selection:text-black relative">
      
      {/* GLOBAL TOAST */}
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[3000] px-8 py-4 rounded-2xl border flex items-center space-x-4 animate-in slide-in-from-top-4 shadow-2xl backdrop-blur-3xl ${toast.type === 'success' ? 'bg-green-600/10 border-green-500/50 text-green-500' : 'bg-red-600/10 border-red-500/50 text-red-500'}`}>
           <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
           <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      {/* OPERATIVE DETAIL MODAL */}
      {selectedOp && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-[#080808] border border-white/10 rounded-[3rem] p-10 relative shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center space-x-6">
                <div className={`w-24 h-24 hexagon p-1 ${selectedOp.isBanned ? 'bg-red-600' : 'bg-yellow-400'}`}>
                  <img src={selectedOp.avatarUrl} className="w-full h-full hexagon object-cover" />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">{selectedOp.displayName}</h3>
                  <p className="text-sm text-yellow-400 font-black tracking-widest">{selectedOp.username}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOp(null)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                <i className="fa-solid fa-xmark text-xl text-gray-500"></i>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
               {[
                 { label: 'Node ID', value: selectedOp.id },
                 { label: 'Status', value: selectedOp.isBanned ? 'TERMINATED' : 'ACTIVE', color: selectedOp.isBanned ? 'text-red-500' : 'text-green-500' },
                 { label: 'Liquidity', value: `${selectedOp.walletBalance} NIB`, color: 'text-yellow-400' },
                 { label: 'Provider', value: selectedOp.loginMethod?.toUpperCase() },
                 { label: 'Joined', value: formatDate(selectedOp.registrationDate || 0) },
                 { label: 'Verified', value: selectedOp.isVerified ? 'ENHANCED' : 'STANDARD' }
               ].map(item => (
                 <div key={item.label} className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                    <p className="text-[9px] text-gray-700 font-black uppercase tracking-widest mb-1">{item.label}</p>
                    <p className={`text-xs font-black uppercase truncate ${item.color || 'text-white'}`}>{item.value}</p>
                 </div>
               ))}
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] px-2">KV Identity Payload</h4>
              <div className="bg-black border border-white/5 rounded-2xl p-6 font-mono text-[10px] text-gray-400 h-32 overflow-y-auto custom-scrollbar">
                <pre className="text-yellow-400/80">{JSON.stringify(selectedOp, null, 2)}</pre>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button 
                disabled={!!isProcessing}
                onClick={() => handleBanToggle(selectedOp)}
                className={`flex-1 py-5 rounded-2xl font-black uppercase text-xs tracking-widest border transition-all ${isProcessing === selectedOp.id ? 'opacity-50' : selectedOp.isBanned ? 'bg-green-600/10 border-green-500/30 text-green-500 hover:bg-green-600 hover:text-white' : 'bg-red-600/10 border-red-500/30 text-red-500 hover:bg-red-600 hover:text-white'}`}
              >
                {isProcessing === selectedOp.id ? 'PROCESSSING...' : selectedOp.isBanned ? 'Restore Node' : 'Terminate Node'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="h-20 bg-black/80 backdrop-blur-xl border-b border-white/5 px-10 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-10">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 hexagon bg-yellow-400 flex items-center justify-center text-black shadow-glow transition-all ${isRefreshing ? 'animate-pulse scale-105' : ''}`}>
               <i className="fa-solid fa-eye text-xl"></i>
            </div>
            <h1 className="text-sm font-black tracking-tighter uppercase italic">NIB SEC <span className="text-yellow-400">OVERSEER</span></h1>
          </div>
          <nav className="flex space-x-2">
            {[
              { id: 'operatives', icon: 'fa-users', label: 'Nodes' },
              { id: 'vault', icon: 'fa-vault', label: 'Vault', badge: pendingCount },
              { id: 'war-room', icon: 'fa-tower-broadcast', label: 'War Room' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center space-x-3 ${activeTab === tab.id ? 'bg-yellow-400 text-black shadow-glow' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}>
                <i className={`fa-solid ${tab.icon}`}></i><span>{tab.label}</span>
                {tab.badge ? <span className="ml-2 bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-full animate-pulse">{tab.badge}</span> : null}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-6">
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border border-yellow-400/20 transition-opacity ${isRefreshing ? 'opacity-100' : 'opacity-20'}`}>
             <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"></div>
             <span className="text-[8px] font-black uppercase text-yellow-400 tracking-widest">Polling Hive</span>
          </div>
          <button onClick={onExit} className="px-6 py-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-lg text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Exit Neural Link</button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {activeTab === 'operatives' && (
          <div className="h-full overflow-y-auto p-10 space-y-4 custom-scrollbar">
            <div className="grid grid-cols-6 px-8 text-[9px] font-black text-gray-800 uppercase tracking-widest pb-4">
               <span className="col-span-2">Operative Node</span>
               <span className="text-center">Protocol</span>
               <span className="text-center">Joined</span>
               <span className="text-right px-8">Credits</span>
               <span className="text-right">Action</span>
            </div>
            {operatives.map(op => (
              <div 
                key={op.id} 
                onClick={() => setSelectedOp(op)}
                className={`group bg-[#080808] border border-white/5 p-6 rounded-[3rem] grid grid-cols-6 items-center transition-all hover:bg-white/[0.04] cursor-pointer ${op.isBanned ? 'opacity-40 grayscale' : 'shadow-xl'}`}
              >
                <div className="col-span-2 flex items-center space-x-6">
                  <div className={`w-12 h-12 hexagon p-0.5 ${op.isBanned ? 'bg-red-600' : 'bg-yellow-400'}`}><img src={op.avatarUrl} className="w-full h-full hexagon object-cover" /></div>
                  <div><p className="text-sm font-black uppercase italic text-white tracking-tight">{op.displayName}</p><p className="text-[9px] text-gray-600 font-mono">{op.username}</p></div>
                </div>
                <div className="text-center"><span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-gray-400">{op.loginMethod}</span></div>
                <div className="text-center text-[10px] text-gray-700 font-mono">{formatDate(op.registrationDate || 0)}</div>
                <div className="text-right px-8 text-xl font-black text-yellow-400">{op.walletBalance} <span className="text-[8px] text-gray-600">NIB</span></div>
                <div className="text-right">
                  <button 
                    disabled={!!isProcessing} 
                    onClick={(e) => handleBanToggle(op, e)}
                    className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${isProcessing === op.id ? 'opacity-50 cursor-wait' : op.isBanned ? 'border-green-500 text-green-500 hover:bg-green-600 hover:text-white' : 'border-red-500 text-red-500 hover:bg-red-600 hover:text-white'}`}
                  >
                    {isProcessing === op.id ? 'Wait...' : op.isBanned ? 'Restore' : 'Terminate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="h-full overflow-y-auto p-10 space-y-12 custom-scrollbar">
            <div className="space-y-6">
               <h2 className="text-xl font-black italic uppercase text-white px-4 tracking-tighter flex items-center">
                  <i className="fa-solid fa-clock-rotate-left mr-3 text-orange-400"></i> Pending Handshakes
               </h2>
               <div className="grid gap-4 px-4">
                  {payments.filter(p => p.status === 'pending').map(p => (
                    <div key={p.id} className="bg-[#0a0a0a] border border-orange-400/20 p-8 rounded-[3.5rem] flex items-center justify-between shadow-2xl">
                       <div className="space-y-2">
                          <p className="text-xl font-black text-white uppercase italic tracking-tighter">{p.username}</p>
                          <div className="flex items-center space-x-4">
                             <p className="text-3xl font-black text-yellow-400">{p.amount} NIB</p>
                             <span className="text-[9px] font-mono text-gray-700 uppercase">{formatDate(p.timestamp)}</span>
                          </div>
                       </div>
                       <div className="flex space-x-4">
                          <button disabled={!!isProcessing} onClick={() => handleVaultAction(p, 'rejected')} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase text-gray-500 hover:text-red-500 hover:border-red-500/30 transition-all">Reject</button>
                          <button disabled={!!isProcessing} onClick={() => handleVaultAction(p, 'approved')} className="px-12 py-4 bg-yellow-400 text-black rounded-2xl text-[9px] font-black uppercase shadow-glow hover:scale-105 transition-all">Authorize Signal</button>
                       </div>
                    </div>
                  ))}
                  {payments.filter(p => p.status === 'pending').length === 0 && <div className="text-center py-20 opacity-20 border border-dashed border-white/10 rounded-[3rem] text-[10px] uppercase font-black tracking-widest">All ledgers balanced</div>}
               </div>
            </div>

            <div className="space-y-6">
               <h2 className="text-xl font-black italic uppercase text-white px-4 tracking-tighter flex items-center">
                  <i className="fa-solid fa-vault mr-3 text-gray-600"></i> Signal Archives
               </h2>
               <div className="grid gap-2 px-4 pb-20">
                  {payments.filter(p => p.status !== 'pending').sort((a,b) => b.timestamp - a.timestamp).map(p => (
                    <div key={p.id} className="bg-black/40 border border-white/5 p-5 rounded-[2.5rem] flex items-center justify-between group">
                       <div className="flex items-center space-x-6">
                          <div className={`w-10 h-10 hexagon flex items-center justify-center text-xs ${p.status === 'approved' ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-500'}`}><i className={`fa-solid ${p.status === 'approved' ? 'fa-check' : 'fa-xmark'}`}></i></div>
                          <span className="text-xs font-black uppercase text-white tracking-tight">{p.username}</span>
                       </div>
                       <div className="text-right">
                          <p className={`text-sm font-black ${p.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>{p.amount} NIB</p>
                          <p className="text-[8px] font-mono text-gray-700 uppercase">{formatDate(p.timestamp)}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'war-room' && (
          <div className="h-full flex flex-col p-10 overflow-hidden">
            <h2 className="text-xl font-black italic uppercase text-white mb-8 tracking-tighter flex items-center">
               <i className="fa-solid fa-tower-broadcast mr-3 text-yellow-400 animate-pulse"></i> Neural Feed
            </h2>
            <div className="flex-1 bg-black/40 border border-white/5 rounded-[3.5rem] p-10 overflow-y-auto custom-scrollbar shadow-inner relative">
               <div className="space-y-4">
                  {signals.map((sig, idx) => (
                    <div key={sig.id || idx} className="group flex items-start space-x-6 py-4 border-b border-white/[0.03] animate-in slide-in-from-left-4 duration-300">
                      <span className="text-gray-800 text-[10px] font-mono shrink-0">[{new Date(sig.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
                      <div className="flex-1 min-w-0">
                         <span className={`font-black text-[10px] uppercase tracking-tighter mr-3 ${sig.type === 'ALERT' ? 'text-red-500' : sig.type === 'LIQUIDITY' ? 'text-yellow-400' : 'text-blue-400'}`}>{sig.sender}:</span>
                         <span className={`text-[11px] leading-relaxed ${sig.type === 'ALERT' ? 'text-red-400 font-bold' : 'text-gray-400'}`}>{sig.content}</span>
                      </div>
                      {sig.delta && <span className="text-[10px] font-black text-yellow-400 bg-yellow-400/5 px-2 py-0.5 rounded border border-yellow-400/10">{sig.delta}</span>}
                    </div>
                  ))}
                  {signals.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-10 uppercase font-black text-xs tracking-widest"><i className="fa-solid fa-microchip text-6xl mb-6"></i>Listening for Neural Signals...</div>}
                  <div ref={warRoomEndRef}></div>
               </div>
            </div>
          </div>
        )}
      </main>

      <footer className="h-10 bg-black/40 border-t border-white/5 px-10 flex items-center justify-between">
         <div className="flex space-x-6">
            <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">System Load: 2.1%</span>
            <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Uptime: 99.98%</span>
         </div>
         <span className="text-[8px] font-black text-yellow-400/40 uppercase tracking-[0.5em]">Overseer Terminal Protocol v2.5.0</span>
      </footer>
    </div>
  );
};

export default AdminView;
