
import React, { useEffect, useState, useRef } from 'react';

interface CallingViewProps {
  onEndCall: () => void;
}

const CallingView: React.FC<CallingViewProps> = ({ onEndCall }) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [permissionStatus, setPermissionStatus] = useState<'requesting' | 'granted' | 'denied'>('requesting');
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-50 flex flex-col font-sans select-none overflow-hidden">
      
      {/* Participant Grid (Main View) */}
      <div className="flex-1 relative p-4 lg:p-6 grid grid-cols-1 gap-4 items-center justify-center">
        <div className="relative w-full h-full max-w-6xl mx-auto bg-neutral-900/50 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
          {permissionStatus === 'granted' && videoEnabled ? (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-6 bg-black">
               <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-full bg-neutral-800 flex items-center justify-center text-5xl font-black text-yellow-400 border-4 border-yellow-400/20 shadow-[0_0_50px_rgba(250,204,21,0.1)]">
                  N
               </div>
               <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">Video Terminal Offline</p>
            </div>
          )}
          
          {/* Participant Name Label (Bottom Left of Video) */}
          <div className="absolute bottom-6 left-6 flex items-center space-x-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
             <i className="fa-solid fa-microphone-slash text-red-500 text-xs"></i>
             <span className="text-xs font-bold text-white uppercase tracking-wider">Operative (You)</span>
          </div>

          {/* Secure Handshake Indicator (Top Right) */}
          <div className="absolute top-6 right-6">
             <div className="flex items-center space-x-3 bg-yellow-400 text-black px-4 py-1.5 rounded-full shadow-lg">
                <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest">E2EE ACTIVE</span>
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar Container */}
      <div className="h-24 px-8 flex items-center justify-between z-20">
        
        {/* Left Side: Time & Meeting ID */}
        <div className="flex items-center space-x-4 min-w-[240px]">
           <div className="text-sm font-bold text-white/90">
             {formatTime(currentTime)} | <span className="font-mono text-gray-400 lowercase tracking-tight">nib-sec-hq-01</span>
           </div>
        </div>

        {/* Center: Controls (Google Meet Style) */}
        <div className="flex items-center space-x-3">
           {/* Mic */}
           <button 
             onClick={() => setIsMuted(!isMuted)}
             className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-neutral-800 text-white hover:bg-neutral-700'}`}
           >
             <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
           </button>

           {/* Video */}
           <button 
             onClick={() => setVideoEnabled(!videoEnabled)}
             className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${!videoEnabled ? 'bg-red-500 text-white' : 'bg-neutral-800 text-white hover:bg-neutral-700'}`}
           >
             <i className={`fa-solid ${videoEnabled ? 'fa-video' : 'fa-video-slash'}`}></i>
           </button>

           {/* Captions */}
           <button className="w-11 h-11 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 flex items-center justify-center transition-all">
             <i className="fa-solid fa-closed-captioning"></i>
           </button>

           {/* Reactions */}
           <button className="w-11 h-11 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 flex items-center justify-center transition-all">
             <i className="fa-regular fa-face-smile"></i>
           </button>

           {/* Present */}
           <button 
             onClick={() => setIsPresenting(!isPresenting)}
             className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${isPresenting ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.4)]' : 'bg-neutral-800 text-white hover:bg-neutral-700'}`}
           >
             <i className="fa-solid fa-arrow-up-from-bracket"></i>
           </button>

           {/* Raise Hand */}
           <button 
             onClick={() => setIsHandRaised(!isHandRaised)}
             className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${isHandRaised ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.4)]' : 'bg-neutral-800 text-white hover:bg-neutral-700'}`}
           >
             <i className="fa-solid fa-hand"></i>
           </button>

           {/* More Options */}
           <button className="w-11 h-11 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 flex items-center justify-center transition-all">
             <i className="fa-solid fa-ellipsis-vertical"></i>
           </button>

           {/* End Call (Red) */}
           <button 
             onClick={onEndCall}
             className="w-14 h-11 bg-red-600 hover:bg-red-500 text-white rounded-[2rem] flex items-center justify-center transition-all ml-4"
           >
             <i className="fa-solid fa-phone-flip rotate-[135deg] text-xl"></i>
           </button>
        </div>

        {/* Right Side: Utilities */}
        <div className="flex items-center space-x-2 min-w-[240px] justify-end">
           <button className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-yellow-400 hover:bg-white/5 rounded-full transition-all">
              <i className="fa-solid fa-circle-info"></i>
           </button>
           <button className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-yellow-400 hover:bg-white/5 rounded-full transition-all">
              <i className="fa-solid fa-user-group text-sm"></i>
           </button>
           <button className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-yellow-400 hover:bg-white/5 rounded-full transition-all">
              <i className="fa-solid fa-message text-sm"></i>
           </button>
           <button className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-yellow-400 hover:bg-white/5 rounded-full transition-all">
              <i className="fa-solid fa-shapes text-sm"></i>
           </button>
           <button className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-yellow-400 hover:bg-white/5 rounded-full transition-all">
              <i className="fa-solid fa-lock text-sm"></i>
           </button>
        </div>
      </div>

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-400 rounded-full blur-[200px] opacity-20"></div>
      </div>
    </div>
  );
};

export default CallingView;
