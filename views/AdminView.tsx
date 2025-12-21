
import React, { useState } from 'react';
import { User, PaymentRequest } from '../types';

interface AdminViewProps {
  onExit: () => void;
}

const mockOperatives: User[] = [
  { id: '1', username: '@nibsecoffical', displayName: 'NIB HQ', avatarUrl: 'https://i.ibb.co/3ykXF4K/nib-logo.png', isProfileComplete: true, walletBalance: '1000000', isVerified: true, loginMethod: 'phone' },
  { id: '2', username: '@oryn', displayName: 'Oryn', avatarUrl: 'https://picsum.photos/200', isProfileComplete: true, walletBalance: '500', isVerified: true, loginMethod: 'github' },
  { id: '3', username: '@bee_user', displayName: 'Busy Bee', avatarUrl: 'https://picsum.photos/201', isProfileComplete: true, walletBalance: '50', loginMethod: 'phone' },
  { id: '4', username: '@gh_hacker', displayName: 'Git Node', avatarUrl: 'https://picsum.photos/202', isProfileComplete: true, walletBalance: '0', isBanned: true, loginMethod: 'github' },
];

const mockPayments: PaymentRequest[] = [
  { id: 'p1', userId: '3', username: '@bee_user', amount: '200', method: 'Telebirr', timestamp: Date.now() - 50000, status: 'pending' },
  { id: 'p2', userId: '2', username: '@oryn', amount: '1000', method: 'Telebirr', timestamp: Date.now() - 100000, status: 'pending' },
];

const AdminView: React.FC<AdminViewProps> = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState<'operatives' | 'vault' | 'network'>('operatives');
  const [operatives, setOperatives] = useState<User[]>(mockOperatives);
  const [payments, setPayments] = useState<PaymentRequest[]>(mockPayments);

  const handleAction = (userId: string, action: 'ban' | 'verify' | 'add_nib') => {
    setOperatives(prev => prev.map(u => {
      if (u.id === userId) {
        if (action === 'ban') return { ...u, isBanned: !u.isBanned };
        if (action === 'verify') return { ...u, isVerified: !u.isVerified };
        if (action === 'add_nib') return { ...u, walletBalance: (parseInt(u.walletBalance) + 100).toString() };
      }
      return u;
    }));
  };

  const approvePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    handleAction(payment.userId, 'add_nib');
    setPayments(prev => prev.filter(p => p.id !== paymentId));
    alert(`Approved ${payment.amount} NIB for ${payment.username}`);
  };

  return (
    <div className="h-full flex flex-col bg-black text-white font-mono">
      {/* Admin Header */}
      <div className="h-24 bg-[#0a0a0a] border-b border-yellow-400/20 px-10 flex items-center justify-between shadow-[0_0_50px_rgba(250,204,21,0.1)]">
        <div className="flex items-center space-x-6">
          <div className="w-12 h-12 bg-yellow-400 text-black rounded-xl flex items-center justify-center text-2xl shadow-yellow-glow relative">
            <i className="fa-solid fa-user-shield"></i>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-black"></span>
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">The Hive Overseer</h2>
            <div className="flex items-center space-x-2">
               <span className="text-[10px] text-yellow-400/60 font-black uppercase tracking-[0.4em]">Master Control Interface</span>
               <span className="text-[9px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full border border-green-500/20 font-black">LIVE</span>
            </div>
          </div>
        </div>
        <button onClick={onExit} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-8 py-3 rounded-2xl border border-red-500/20 transition-all font-black uppercase tracking-widest text-xs">Terminate Session</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-72 bg-[#050505] border-r border-white/5 p-6 space-y-4">
          <button 
            onClick={() => setActiveTab('operatives')}
            className={`w-full flex items-center space-x-4 p-5 rounded-2xl transition-all ${activeTab === 'operatives' ? 'bg-yellow-400 text-black font-black' : 'hover:bg-white/5 text-gray-500'}`}
          >
            <i className="fa-solid fa-users"></i>
            <span className="uppercase tracking-widest text-xs">Operatives</span>
          </button>
          <button 
            onClick={() => setActiveTab('vault')}
            className={`w-full flex items-center space-x-4 p-5 rounded-2xl transition-all ${activeTab === 'vault' ? 'bg-yellow-400 text-black font-black' : 'hover:bg-white/5 text-gray-500'}`}
          >
            <i className="fa-solid fa-vault"></i>
            <span className="uppercase tracking-widest text-xs">Vault Requests</span>
            {payments.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{payments.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('network')}
            className={`w-full flex items-center space-x-4 p-5 rounded-2xl transition-all ${activeTab === 'network' ? 'bg-yellow-400 text-black font-black' : 'hover:bg-white/5 text-gray-500'}`}
          >
            <i className="fa-solid fa-network-wired"></i>
            <span className="uppercase tracking-widest text-xs">Network Controls</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-black">
          {activeTab === 'operatives' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter">Signal Registry</h3>
                  <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-xs text-gray-500 font-black">Total Nodes: {operatives.length}</div>
               </div>

               <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 {operatives.map(op => (
                   <div key={op.id} className={`p-8 rounded-[3rem] border transition-all ${op.isBanned ? 'bg-red-500/5 border-red-500/20' : 'bg-neutral-900/50 border-white/5 hover:border-yellow-400/20 shadow-2xl'}`}>
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-6">
                           <div className="w-16 h-16 hexagon p-1 bg-yellow-400/20 relative">
                              <img src={op.avatarUrl} className="w-full h-full hexagon object-cover" />
                              <div className="absolute -top-2 -left-2 bg-black border border-white/10 rounded-full p-1.5 shadow-xl">
                                 {op.loginMethod === 'github' ? (
                                    <i className="fa-brands fa-github text-xs"></i>
                                 ) : (
                                    <i className="fa-solid fa-phone text-[8px]"></i>
                                 )}
                              </div>
                           </div>
                           <div>
                              <div className="flex items-center space-x-2">
                                <p className="text-xl font-black tracking-tight">{op.displayName}</p>
                                {op.isVerified && <i className="fa-solid fa-circle-check text-yellow-400"></i>}
                              </div>
                              <p className="text-xs text-gray-500 font-bold">{op.username}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-black text-yellow-400">{op.walletBalance}</p>
                           <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">NIB COINS</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                         <button onClick={() => handleAction(op.id, 'verify')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${op.isVerified ? 'bg-yellow-400 text-black' : 'bg-white/5 text-gray-500 border border-white/5'}`}>{op.isVerified ? 'Unverify' : 'Verify'}</button>
                         <button onClick={() => handleAction(op.id, 'add_nib')} className="flex-1 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all">Add 100 NIB</button>
                         <button onClick={() => handleAction(op.id, 'ban')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${op.isBanned ? 'bg-white text-black' : 'bg-red-600 text-white shadow-lg shadow-red-600/20'}`}>{op.isBanned ? 'Revoke Ban' : 'Terminate'}</button>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'vault' && (
             <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter">Vault Requests</h3>
               </div>
               {payments.length === 0 ? (
                 <div className="h-64 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-white/5 rounded-[4rem]">
                    <i className="fa-solid fa-circle-check text-4xl text-gray-800"></i>
                    <p className="text-gray-600 font-black uppercase tracking-widest">All signals processed</p>
                 </div>
               ) : (
                 <div className="space-y-6">
                   {payments.map(pay => (
                     <div key={pay.id} className="bg-[#0a0a0a] border border-yellow-400/10 p-10 rounded-[4rem] flex items-center justify-between shadow-2xl relative">
                        <div className="flex items-center space-x-10 relative z-10">
                           <div className="w-20 h-20 bg-blue-600/10 border border-blue-500/30 rounded-[2rem] flex items-center justify-center text-3xl text-blue-500">
                              <i className="fa-solid fa-building-columns"></i>
                           </div>
                           <div className="space-y-1">
                              <p className="text-2xl font-black tracking-tighter">{pay.username}</p>
                              <p className="text-xs text-gray-600 font-bold uppercase tracking-[0.2em]">{pay.method} • SECURE TUNNEL</p>
                           </div>
                        </div>
                        <div className="flex items-center space-x-12 relative z-10">
                           <p className="text-3xl font-black text-yellow-400">{pay.amount} ETB</p>
                           <button onClick={() => approvePayment(pay.id)} className="h-16 px-10 bg-yellow-400 text-black font-black uppercase tracking-[0.3em] rounded-3xl hover:bg-white shadow-xl transition-all">Approve Signal</button>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          )}

          {activeTab === 'network' && (
             <div className="h-full flex flex-col items-center justify-center space-y-10 animate-in zoom-in duration-700 text-center">
                <div className="w-40 h-40 text-yellow-400 text-8xl animate-pulse"><i className="fa-solid fa-tower-broadcast"></i></div>
                <h3 className="text-5xl font-black italic uppercase tracking-tighter">Mainframe Live</h3>
                <div className="grid grid-cols-2 gap-6 max-w-2xl w-full">
                   <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem] text-center">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Global Encryption</p>
                      <p className="text-2xl font-black text-green-500">ACTIVE</p>
                   </div>
                   <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem] text-center">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Network Load</p>
                      <p className="text-2xl font-black text-yellow-400">12%</p>
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
