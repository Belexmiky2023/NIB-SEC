
import React, { useEffect, useState, useRef } from 'react';

interface CallingViewProps {
  onEndCall: () => void;
}

const CallingView: React.FC<CallingViewProps> = ({ onEndCall }) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<'requesting' | 'granted' | 'denied'>('requesting');
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    
    // Request actual browser permissions
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
      // Clean up media tracks on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle Mute/Unmute
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  // Handle Video Toggle
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = videoEnabled;
      });
    }
  }, [videoEnabled]);

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
            <div className="w-48 h-48 hexagon bg-neutral-900 border-4 border-yellow-400 p-2 animate-pulse shadow-[0_0_50px_rgba(250,204,21,0.2)] overflow-hidden">
              {permissionStatus === 'granted' && videoEnabled ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full hexagon object-cover grayscale brightness-110"
                />
              ) : (
                <img src="https://picsum.photos/300" className="w-full h-full hexagon object-cover grayscale opacity-50" />
              )}
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
              <span>SECURE LINE</span>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Operation Queen</h2>
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="flex items-center space-x-2 text-yellow-400 font-mono text-sm">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                <span className="font-black">{formatTime(callDuration)}</span>
              </div>
              {permissionStatus === 'denied' && (
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Encryption Leak: Permission Denied</p>
              )}
              {permissionStatus === 'requesting' && (
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Handshaking Devices...</p>
              )}
            </div>
          </div>
        </div>

        {/* Waveform Visualizer */}
        <div className="w-full max-w-md h-32 flex items-center justify-center space-x-1.5">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 bg-yellow-400 rounded-full transition-all duration-300 ${isMuted ? 'opacity-20 scale-y-25' : ''}`}
              style={{
                height: isMuted ? '4px' : `${20 + Math.random() * 80}%`,
                animation: !isMuted ? `pulse ${0.5 + Math.random()}s infinite ease-in-out` : 'none'
              }}
            ></div>
          ))}
        </div>

        {/* Call Controls */}
        <div className="flex items-center space-x-6 lg:space-x-10">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-16 h-16 lg:w-20 lg:h-20 hexagon flex items-center justify-center text-xl transition-all shadow-xl active:scale-90 ${
              isMuted ? 'bg-red-500 text-white border-none' : 'bg-neutral-800 border border-white/10 text-white hover:bg-neutral-700'
            }`}
          >
            <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
          </button>
          
          <button 
            onClick={onEndCall}
            className="w-20 h-20 lg:w-24 lg:h-24 hexagon bg-red-600 text-white flex items-center justify-center text-3xl hover:bg-red-700 transition-all hover:scale-110 active:scale-95 shadow-[0_0_50px_rgba(220,38,38,0.5)] border-4 border-red-500/20"
          >
            <i className="fa-solid fa-phone-slash"></i>
          </button>

          <button 
            onClick={() => setVideoEnabled(!videoEnabled)}
            className={`w-16 h-16 lg:w-20 lg:h-20 hexagon flex items-center justify-center text-xl transition-all shadow-xl active:scale-90 ${
              !videoEnabled ? 'bg-neutral-900 border-2 border-red-500 text-red-500' : 'bg-neutral-800 border border-white/10 text-white hover:bg-neutral-700'
            }`}
          >
            <i className={`fa-solid ${videoEnabled ? 'fa-video' : 'fa-video-slash'}`}></i>
          </button>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <div className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black">
            PROTOCOL: V-SEC-9-QUANTUM
          </div>
          <div className="flex space-x-2">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping delay-75"></div>
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping delay-150"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallingView;
