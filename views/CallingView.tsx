
import React, { useEffect, useState, useRef } from 'react';
import { Chat, CallRecord } from '../types';

interface CallingViewProps {
  contact: Chat | null;
  onEndCall: () => void;
}

const CallingView: React.FC<CallingViewProps> = ({ contact, onEndCall }) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState<'establishing' | 'connected' | 'error'>('establishing');
  const [signalStrength, setSignalStrength] = useState(98);
  const [showArchives, setShowArchives] = useState(false);
  const [history, setHistory] = useState<CallRecord[]>(() => {
    const saved = localStorage.getItem('nib_sec_call_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const durationRef = useRef(0);

  useEffect(() => {
    durationRef.current = callDuration;
  }, [callDuration]);

  useEffect(() => {
    let timer: any;
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });
        streamRef.current = stream;
        
        setTimeout(() => {
          setCallStatus('connected');
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          timer = window.setInterval(() => setCallDuration(d => d + 1), 1000);
        }, 2500);

        const sigInv = setInterval(() => {
          setSignalStrength(85 + Math.floor(Math.random() * 15));
        }, 3000);

        return () => {
           clearInterval(sigInv);
           if (timer) clearInterval(timer);
        };
      } catch (err) {
        console.error("Neural link handshake failed:", err);
        setCallStatus('error');
      }
    };

    startMedia();

    return () => {
      if (timer) clearInterval(timer);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => track.enabled = !isMuted);
      streamRef.current.getVideoTracks().forEach(track => track.enabled = videoEnabled);
    }
  }, [isMuted, videoEnabled]);

  const handleArchiveTransmission = () => {
    const newRecord: CallRecord = {
      id: 'call-' + Date.now(),
      contactName: contact?.name || 'Unknown Signal',
      avatar: contact?.avatar || 'https://i.ibb.co/3ykXF4K/nib-logo.png',
      timestamp: Date.now(),
      duration: durationRef.current
    };
    const updatedHistory = [newRecord, ...history].slice(0, 50);
    setHistory(updatedHistory);
    localStorage.setItem('nib_sec_call_history', JSON.stringify(updatedHistory));
    onEndCall();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (callStatus === 'establishing') {
    return (
      <div className="fixed inset-0 bg-black z-[2000] flex flex-col items-center justify-center p-12 space-y-12">
        <div className="relative">
          <div className="w-48 h-48 hexagon bg-yellow-400/5 border-2 border-yellow-400 flex items-center justify-center animate-pulse">
            <i className="fa-solid fa-satellite-dish text-6xl text-yellow-400 animate-bounce"></i>
          </div>
          <div className="absolute inset-0 bg-yellow-400/20 hexagon blur-3xl animate-ping"></div>
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black italic uppercase text-white tracking-widest">Establishing Neural Link</h2>
          <div className="flex justify-center space-x-1">
             {[...Array(5)].map((_, i) => (
               <div key={i} className="w-2 h-8 bg-yellow-400/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
             ))}
          </div>
          <p className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.5em]">Synchronizing Cipher Suite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[1000] flex flex-col font-sans select-none overflow-hidden honeycomb-bg">
      {/* HISTORY ARCHIVE DRAWER */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-black/60 backdrop-blur-3xl border-l border-yellow-400/10 z-[1500] transition-transform duration-500 shadow-2xl ${showArchives ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-8 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black uppercase italic text-yellow-400 tracking-tighter">Neural Archives</h3>
            <button onClick={() => setShowArchives(false)} className="text-gray-600 hover:text-white transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
            {history.map(record => (
              <div key={record.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center space-x-4">
                <div className="w-10 h-10 hexagon bg-yellow-400/20 p-0.5"><img src={record.avatar} className="w-full h-full hexagon object-cover" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase text-white truncate">{record.contactName}</p>
                  <div className="flex justify-between text-[8px] font-mono text-gray-600 uppercase">
                    <span>{new Date(record.timestamp).toLocaleDateString()}</span>
                    <span className="text-yellow-400">{formatDuration(record.duration)}</span>
                  </div>
                </div>
              </div>
            ))}
            {history.length === 0 && <div className="text-center py-20 opacity-20 text-[9px] uppercase font-black tracking-widest">No Archived Signals</div>}
          </div>
        </div>
      </div>

      {/* HUD OVERLAYS */}
      <div className="absolute top-8 left-10 z-50 pointer-events-none">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 hexagon bg-yellow-400 flex items-center justify-center text-black shadow-[0_0_20px_rgba(250,204,21,0.4)]">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white">Target Node: {contact?.name || 'Cipher'}</h2>
            <p className="text-[9px] text-yellow-400 font-mono">ENCRYPTION: AES-4096-BEE</p>
          </div>
        </div>
      </div>

      <div className="absolute top-8 right-10 z-50 pointer-events-none text-right flex items-center space-x-6">
        <button onClick={() => setShowArchives(true)} className="pointer-events-auto w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all shadow-md"><i className="fa-solid fa-clock-rotate-left"></i></button>
        <div className="space-y-1">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Signal Strength</p>
          <div className="flex items-center justify-end space-x-2">
            <span className="text-lg font-black font-mono text-yellow-400">{signalStrength}%</span>
          </div>
        </div>
      </div>

      {/* VIDEO VIEWPORT */}
      <div className="flex-1 relative flex items-center justify-center p-6">
        <div className="relative w-full h-full max-w-7xl bg-[#080808] border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl">
          {videoEnabled ? (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover scale-x-[-1] opacity-90 contrast-125 saturate-150"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black relative">
               <div className="relative z-10 w-40 h-40 hexagon border-4 border-yellow-400 flex items-center justify-center animate-spin-slow">
                 <i className="fa-solid fa-bee text-6xl text-yellow-400"></i>
               </div>
               <p className="mt-8 text-xs font-black uppercase tracking-[1em] text-yellow-400/50">Transmission Only</p>
            </div>
          )}

          <div className="absolute bottom-10 left-10 p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl space-y-2">
             <div className="flex items-center space-x-3 text-green-500">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               <span className="text-[10px] font-black uppercase tracking-widest">Locked Signal</span>
             </div>
             <p className="text-3xl font-black font-mono text-white tracking-tighter">{formatDuration(callDuration)}</p>
          </div>

          <div className="absolute top-1/2 right-12 -translate-y-1/2 flex flex-col space-y-1 opacity-40">
             {[...Array(12)].map((_, i) => (
                <div key={i} className="h-1 bg-yellow-400 rounded-full transition-all duration-300" style={{ width: `${10 + Math.random() * 40}px`, opacity: 0.2 + Math.random() * 0.8 }}></div>
             ))}
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="h-40 bg-gradient-to-t from-black to-transparent flex items-center justify-center space-x-8 pb-10 z-50">
        <button onClick={() => setIsMuted(!isMuted)} className={`w-16 h-16 hexagon flex items-center justify-center transition-all border-2 ${isMuted ? 'bg-red-600 border-red-400 text-white' : 'bg-neutral-900 border-yellow-400/40 text-yellow-400 hover:border-yellow-400'}`}>
          <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-xl`}></i>
        </button>
        <div className="relative group mx-4">
           <div className="absolute inset-0 bg-red-600/30 blur-3xl animate-pulse"></div>
           <button onClick={handleArchiveTransmission} className="w-28 h-20 hexagon bg-red-600 hover:bg-red-500 border-4 border-black/20 transition-all flex items-center justify-center relative z-10 shadow-2xl hover:scale-110 active:scale-95 shadow-[0_20px_60px_rgba(220,38,38,0.4)]">
             <i className="fa-solid fa-phone-slash text-3xl text-white"></i>
           </button>
        </div>
        <button onClick={() => setVideoEnabled(!videoEnabled)} className={`w-16 h-16 hexagon flex items-center justify-center transition-all border-2 ${!videoEnabled ? 'bg-red-600 border-red-400 text-white' : 'bg-neutral-900 border-yellow-400/40 text-yellow-400 hover:border-yellow-400'}`}>
          <i className={`fa-solid ${videoEnabled ? 'fa-video' : 'fa-video-slash'} text-xl`}></i>
        </button>
      </div>

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .honeycomb-bg { background-image: radial-gradient(circle at 2px 2px, rgba(250,204,21,0.05) 1px, transparent 0); background-size: 24px 24px; }
      `}</style>
    </div>
  );
};

export default CallingView;
