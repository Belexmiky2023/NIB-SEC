import React, { useState } from 'react';

interface OnboardingViewProps {
  onComplete: () => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    else onComplete();
  };

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans select-none">
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentPage === 3 ? 'opacity-30' : 'opacity-10'} honeycomb-bg`}></div>
      
      {/* Background Gradient for Depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/5 via-transparent to-transparent pointer-events-none"></div>

      <div className="max-w-4xl w-full glass rounded-[4rem] p-12 lg:p-20 relative z-20 space-y-16 animate-in zoom-in-95 duration-500 shadow-2xl border border-white/5 overflow-hidden">
        
        {/* Navigation Indicator & Numbers */}
        <div className="flex justify-between items-center px-4">
           <div className="flex space-x-3">
             {[1, 2, 3, 4].map(p => (
               <div 
                 key={p} 
                 className={`h-1 rounded-full transition-all duration-500 ${currentPage === p ? 'w-12 bg-yellow-400 shadow-glow' : 'w-4 bg-white/10'}`}
               ></div>
             ))}
           </div>
           <div className="flex items-center space-x-8">
              {[1, 2, 3, 4].map(p => (
                <button 
                  key={p} 
                  onClick={() => setCurrentPage(p)}
                  className={`text-[11px] font-black tracking-widest transition-all ${currentPage === p ? 'text-yellow-400 scale-125' : 'text-gray-700 hover:text-white'}`}
                >
                  &lt;{p}&gt;
                </button>
              ))}
           </div>
        </div>

        {/* Content Section */}
        <div className="min-h-[380px] flex flex-col items-center text-center justify-center space-y-12 transition-all duration-500">
          
          {currentPage === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                  <div className="absolute inset-0 bg-yellow-400/20 blur-3xl animate-pulse"></div>
                  <div className="w-full h-full hexagon border-2 border-yellow-400 flex items-center justify-center bg-black">
                     <i className="fa-solid fa-satellite-dish text-6xl text-yellow-400 animate-bounce"></i>
                  </div>
               </div>
               <div className="space-y-4">
                 <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white">Welcome to NIB-SEC</h2>
                 <p className="text-xl text-gray-500 max-w-xl mx-auto leading-relaxed uppercase font-medium">
                   We Have a Latest <span className="text-yellow-400">Chatting</span>, <span className="text-yellow-400">Calling</span> And Secured System protocols ready for deployment.
                 </p>
               </div>
            </div>
          )}

          {currentPage === 2 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
               <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Nib-sec Features</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                 {[
                   { icon: 'fa-server', title: 'HoneyServer', desc: 'Personal Private Channel' },
                   { icon: 'fa-comments', title: 'HoneyChat', desc: 'Secure Chatting Group' },
                   { icon: 'fa-coins', title: 'NIB Coin', desc: 'Native Crypto Utility' }
                 ].map((feat, i) => (
                   <div key={feat.title} className="p-8 bg-white/5 border border-white/5 rounded-[3rem] space-y-4 group hover:bg-white/[0.08] transition-all" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="w-14 h-14 hexagon bg-black border border-yellow-400/30 flex items-center justify-center mx-auto text-yellow-400 group-hover:scale-110 transition-all">
                         <i className={`fa-solid ${feat.icon} text-2xl`}></i>
                      </div>
                      <h3 className="text-base font-black uppercase tracking-tighter text-white">{feat.title}</h3>
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">{feat.desc}</p>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {currentPage === 3 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
               <div className="relative mx-auto w-48 h-48 group">
                  <div className="absolute inset-0 bg-yellow-400/30 blur-[60px] group-hover:bg-yellow-400/50 transition-all"></div>
                  {/* NIB COIN LOGO: A COIN WITH A BEE ICON */}
                  <div className="w-full h-full rounded-full border-[10px] border-yellow-400 bg-black flex items-center justify-center shadow-2xl animate-spin-slow">
                     <i className="fa-solid fa-bee text-7xl text-yellow-400"></i>
                  </div>
                  <div className="absolute -top-4 -right-4 bg-white text-black text-[10px] font-black px-4 py-2 rounded-full rotate-12 shadow-glow">NIB TOKEN</div>
               </div>
               <div className="space-y-6">
                 <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">NIB-COIN Ecosystem</h2>
                 <p className="text-sm text-gray-500 uppercase tracking-widest leading-relaxed max-w-2xl mx-auto font-black">
                   Buy NIB-COIN, send <span className="text-yellow-400">GIFTS</span>, buy goods and more. 
                   <br/>Generate tokens by referring your friends to the hive.
                 </p>
               </div>
            </div>
          )}

          {currentPage === 4 && (
            <div className="space-y-16 animate-in zoom-in-95 duration-700">
               <div className="space-y-4">
                  <h2 className="text-6xl font-black uppercase italic tracking-tighter text-white">Ready To Chat ??</h2>
                  <p className="text-[10px] text-yellow-400/60 font-black uppercase tracking-[0.6em]">System Verification Complete</p>
               </div>
               
               <button 
                onClick={onComplete}
                className="group relative px-20 py-10 rounded-[3rem] overflow-hidden transition-all hover:scale-110 active:scale-95 shadow-[0_20px_60px_rgba(250,204,21,0.5)] popup-anim"
               >
                 {/* Honey Texture Background */}
                 <div className="absolute inset-0 bg-yellow-400 transition-colors group-hover:bg-yellow-300"></div>
                 <div className="absolute inset-0 opacity-30 mix-blend-multiply honeycomb-bg"></div>
                 <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                 
                 <div className="relative flex items-center space-x-6 text-black">
                    <span className="text-2xl font-black uppercase italic tracking-tighter">Enter The Hive</span>
                    <i className="fa-solid fa-arrow-right text-2xl group-hover:translate-x-3 transition-transform"></i>
                 </div>
               </button>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-white/5">
           <button 
             onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
             disabled={currentPage === 1}
             className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white disabled:opacity-0 transition-all"
           >
             &lt; Back Signal
           </button>
           <button 
             onClick={nextPage}
             className="text-[10px] font-black uppercase tracking-widest text-yellow-400 hover:text-white transition-all"
           >
             {currentPage === totalPages ? 'Finalize >' : 'Next Protocol >'}
           </button>
        </div>
      </div>

      <style>{`
        .glass { background: rgba(5,5,5, 0.7); backdrop-filter: blur(50px); }
        .shadow-glow { box-shadow: 0 0 40px rgba(250, 204, 21, 0.4); }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        
        @keyframes popup {
          0% { transform: scale(0.9) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .popup-anim { animation: popup 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        .honeycomb-bg {
          background-image: url("data:image/svg+xml,%3Csvg width='52' height='30' viewBox='0 0 52 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23facc15' fill-opacity='0.15'%3E%3Cpath d='M10 0l16 9v11L10 29l-16-9V9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          background-size: 52px 30px;
        }
      `}</style>
    </div>
  );
};

export default OnboardingView;