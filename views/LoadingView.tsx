
import React from 'react';

const LoadingView: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-black">
      <div className="relative mb-12 bee-float">
        {/* Animated Bee Mascot */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Body */}
            <circle cx="50" cy="50" r="30" fill="#facc15" />
            <rect x="35" y="30" width="30" height="5" rx="2" fill="black" />
            <rect x="30" y="45" width="40" height="5" rx="2" fill="black" />
            <rect x="35" y="60" width="30" height="5" rx="2" fill="black" />
            {/* Eyes */}
            <circle cx="42" cy="40" r="4" fill="black" />
            <circle cx="58" cy="40" r="4" fill="black" />
            {/* Wings */}
            <ellipse cx="30" cy="35" rx="15" ry="20" fill="rgba(255,255,255,0.4)" transform="rotate(-30, 30, 35)" />
            <ellipse cx="70" cy="35" rx="15" ry="20" fill="rgba(255,255,255,0.4)" transform="rotate(30, 70, 35)" />
          </svg>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-2 bg-yellow-400/20 blur-xl rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <div className="text-3xl font-bold tracking-widest text-yellow-400 flex items-center justify-center">
          <span>NIB</span>
          <span className="mx-2 w-2 h-2 rounded-full bg-yellow-400 animate-bounce"></span>
          <span>SEC</span>
        </div>
        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest animate-pulse">Establishing Secure Tunnel...</p>
      </div>

      {/* Hexagon particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-yellow-400/5 hexagon w-24 h-24"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `scale(${Math.random() * 1.5}) rotate(${Math.random() * 360}deg)`,
              animation: `pulse ${2 + Math.random() * 3}s infinite ease-in-out`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingView;
