
import React, { useEffect, useState } from 'react';

interface CallingViewProps {
  onEndCall: () => void;
}

const CallingView: React.FC<CallingViewProps> = ({ onEndCall }) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 honeycomb-bg"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center space-y-12">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-48 h-48 hexagon bg-neutral-900 border-4 border-yellow-400 p-2 animate-pulse shadow-[0_0_50px_rgba(250,204,21,0.2)]">
              <img src="https://picsum.photos/300" className="w-full h-full hexagon object-cover grayscale" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-xl">
              SECURE LINE
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold tracking-tight">Operation Queen</h2>
            <div className="flex items-center justify-center space-x-2 text-yellow-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
              <span>{formatTime(callDuration)}</span>
            </div>
          </div>
        </div>

        {/* Waveform Visualizer */}
        <div className="w-full max-w-md h-32 flex items-center justify-center space-x-1.5">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="w-1.5 bg-yellow-400 rounded-full"
              style={{
                height: `${20 + Math.random() * 80}%`,
                animation: `pulse ${0.5 + Math.random()}s infinite ease-in-out`
              }}
            ></div>
          ))}
        </div>

        {/* Call Controls */}
        <div className="flex items-center space-x-6 lg:space-x-10">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-16 h-16 lg:w-20 lg:h-20 hexagon flex items-center justify-center text-xl transition-all ${
              isMuted ? 'bg-red-500 text-white' : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}
          >
            <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
          </button>
          
          <button 
            onClick={onEndCall}
            className="w-20 h-20 lg:w-24 lg:h-24 hexagon bg-red-600 text-white flex items-center justify-center text-2xl hover:bg-red-700 transition-all hover:scale-110 shadow-[0_0_30px_rgba(220,38,38,0.4)]"
          >
            <i className="fa-solid fa-phone-slash"></i>
          </button>

          <button 
            onClick={() => setVideoEnabled(!videoEnabled)}
            className={`w-16 h-16 lg:w-20 lg:h-20 hexagon flex items-center justify-center text-xl transition-all ${
              !videoEnabled ? 'bg-neutral-900 border border-red-500/50 text-red-500' : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}
          >
            <i className={`fa-solid ${videoEnabled ? 'fa-video' : 'fa-video-slash'}`}></i>
          </button>
        </div>

        <div className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-bold">
          E2E Encrypted Protocol: V-SEC-9
        </div>
      </div>
    </div>
  );
};

export default CallingView;
