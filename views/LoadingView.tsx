
import React from 'react';

const LoadingView: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Flying Bee Mascot */}
      <div className="bee-flight absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-24 h-24">
           {/* Trail Glow */}
           <div className="absolute top-1/2 right-1/2 w-48 h-8 bg-yellow-400/10 blur-3xl -translate-y-1/2"></div>
           <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
             <circle cx="50" cy="50" r="25" fill="#facc15" />
             <rect x="38" y="32" width="24" height="4" rx="2" fill="black" />
             <rect x="34" y="48" width="32" height="4" rx="2" fill="black" />
             <rect x="38" y="64" width="24" height="4" rx="2" fill="black" />
             <circle cx="42" cy="42" r="3" fill="black" />
             <circle cx="58" cy="42" r="3" fill="black" />
             <ellipse cx="32" cy="38" rx="12" ry="16" fill="rgba(255,255,255,0.4)" transform="rotate(-20, 32, 38)" />
             <ellipse cx="68" cy="38" rx="12" ry="16" fill="rgba(255,255,255,0.4)" transform="rotate(20, 68, 38)" />
           </svg>
        </div>
      </div>

      {/* Floating Honeycomb Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className="absolute hexagon bg-yellow-400/5 animate-pulse"
            style={{
              width: `${40 + Math.random() * 80}px`,
              height: `${40 + Math.random() * 80}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center space-y-4">
        <h1 className="text-6xl font-black text-yellow-400 italic tracking-tighter drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]">NIB Sec</h1>
        <p className="text-sm font-black uppercase tracking-[0.5em] text-gray-500 animate-pulse">Secured Communication</p>
      </div>

      <footer className="absolute bottom-10 text-[10px] font-mono text-gray-700 tracking-[0.2em] uppercase">
        © 2025 NIB Sec
      </footer>
    </div>
  );
};

export default LoadingView;
