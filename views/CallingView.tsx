
import React, { useEffect, useState, useRef } from 'react';

interface CallingViewProps {
  onEndCall: () => void;
}

const CallingView: React.FC<CallingViewProps> = ({ onEndCall }) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<'requesting' | 'granted' | 'denied'>('requesting');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        streamRef.current = stream;
        setPermissionStatus('granted');
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to get media devices:", err);
        setPermissionStatus('denied');
      }
    };

    startMedia();

    return () => {
      clearInterval(timer);
      clearInterval(clockTimer);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = videoEnabled;
      });
    }
  }, [videoEnabled]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-[1000] flex flex-col font-sans select-none overflow-hidden honeycomb-bg">
      
      {/* BACKGROUND DECOR */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="bee-flight absolute top-1/4 left-1/4 w-32 h-32 opacity-10">
            <i className="fa-solid fa-bee text-yellow-400 text-6xl"></i>
         </div>
      </div>

      {/* HEADER: CALL INFO */}
      <div className="h-20 px-10 flex items-center justify-between relative z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center space-x-6">
           <div className="w-12 h-12 hexagon bg-yellow-400 flex items-center justify-center text-black shadow-[0_0_20px_rgba(250,204,21,0.4)]">
              <i className="fa-solid fa-shield-halved text-lg"></i>
           </div>
           <div>
              <h2 className="text-sm font-black uppercase italic tracking-tighter text-white">Secure Tunnel #HQ-01</h2>
              <div className="flex items-center space-x-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                 <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Encryption Active</p>
              </div>
           </div>
        </div>
        <div className="text-center">
           <p className="text-2xl font-black text-yellow-400 font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
              {formatDuration(callDuration)}
           </p>
        </div>
        <div className="text-right">
           <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{currentTime.toLocaleTimeString([], { hour12: false })}</p>
           <p className="text-[10px] text-yellow-400/40 font-black uppercase tracking-widest">NIB SEC NETWORK</p>
        </div>
      </div>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 relative p-10 flex items-center justify-center">
        <div className="relative w-full h-full max-w-5xl bg-neutral-900/40 rounded-[4rem] overflow-hidden shadow-2xl border-2 border-white/5 group">
           {/* Video Feed or Placeholder */}
           {permissionStatus === 'granted' && videoEnabled ? (
             <video 
               ref={videoRef} 
               autoPlay 
               muted 
               playsInline 
               className="w-full h-full object-cover scale-x-[-1] brightness-110 contrast-110"
             />
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center space-y-8 bg-black">
                <div className="relative">
                   <div className="w-48 h-48 hexagon border-4 border-yellow-400/20 bg-neutral-900 flex items-center justify-center shadow-[0_0_100px_rgba(250,204,21,0.1)] relative z-10">
                      <i className="fa-solid fa-user text-6xl text-gray-700"></i>
                   </div>
                   <div className="absolute inset-0 bg-yellow-400/10 hexagon blur-3xl animate-pulse"></div>
                </div>
                <div className="text-center space-y-2">
                   <p className="text-xl font-black uppercase italic tracking-tighter text-white">Transmission Halted</p>
                   <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">Video Node Offline</p>
                </div>
             </div>
           )}

           {/* Call Overlays */}
           <div className="absolute bottom-8 left-8 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-yellow-400/20 flex items-center space-x-3">
              <i className="fa-solid fa-signal text-green-500 text-xs"></i>
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Operative Profile</span>
           </div>

           {/* Waveform Visualization (Futuristic Touch) */}
           {!isMuted && (
             <div className="absolute top-1/2 right-12 -translate-y-1/2 flex flex-col space-y-1 opacity-40">
                {[...Array(12)].map((_, i) => (
                   <div key={i} className="h-1 bg-yellow-400 rounded-full transition-all duration-100" style={{ width: `${10 + Math.random() * 40}px`, animationDelay: `${i * 0.1}s` }}></div>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* FOOTER: HEXAGONAL CONTROLS */}
      <div className="h-32 bg-gradient-to-t from-black to-transparent px-10 flex items-center justify-center relative z-50">
        <div className="flex items-center space-x-6">
           {/* Mic Toggle */}
           <div className="relative group">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`w-16 h-16 hexagon flex items-center justify-center transition-all border-2 ${isMuted ? 'bg-red-600 border-red-400 text-white' : 'bg-neutral-900 border-yellow-400/40 text-yellow-400 hover:border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.1)]'}`}
              >
                <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-xl`}></i>
              </button>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-3 py-1 rounded-lg text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Audio</span>
           </div>

           {/* Video Toggle */}
           <div className="relative group">
              <button 
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`w-16 h-16 hexagon flex items-center justify-center transition-all border-2 ${!videoEnabled ? 'bg-red-600 border-red-400 text-white' : 'bg-neutral-900 border-yellow-400/40 text-yellow-400 hover:border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.1)]'}`}
              >
                <i className={`fa-solid ${videoEnabled ? 'fa-video' : 'fa-video-slash'} text-xl`}></i>
              </button>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-3 py-1 rounded-lg text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Visual</span>
           </div>

           {/* END CALL: PROMINENT CENTRAL CONTROL */}
           <div className="relative group mx-4">
              <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full animate-pulse group-hover:bg-red-600/40 transition-all"></div>
              <button 
                onClick={onEndCall}
                className="w-24 h-20 hexagon bg-red-600 hover:bg-red-500 transition-all flex items-center justify-center relative z-10 border-4 border-black/20 group-hover:scale-110 active:scale-95 shadow-[0_20px_60px_rgba(220,38,38,0.4)]"
              >
                <i className="fa-solid fa-phone-slash text-3xl text-white"></i>
              </button>
              <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-red-500 opacity-0 group-hover:opacity-100 transition-all">Abort Signal</p>
           </div>

           {/* Screen Share Placeholder */}
           <div className="relative group">
              <button className="w-16 h-16 hexagon bg-neutral-900 border-2 border-yellow-400/40 text-yellow-400 hover:border-yellow-400 flex items-center justify-center transition-all">
                <i className="fa-solid fa-up-right-from-square text-xl"></i>
              </button>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-3 py-1 rounded-lg text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Stream</span>
           </div>

           {/* Settings Placeholder */}
           <div className="relative group">
              <button className="w-16 h-16 hexagon bg-neutral-900 border-2 border-yellow-400/40 text-yellow-400 hover:border-yellow-400 flex items-center justify-center transition-all">
                <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
              </button>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-3 py-1 rounded-lg text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Menu</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CallingView;
