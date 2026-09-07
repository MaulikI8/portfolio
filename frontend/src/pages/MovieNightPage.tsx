import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Film, Tv, Mic, MicOff, Share2, Square, MessageCircle, Send, Maximize, Minimize, PhoneCall, PhoneOff } from 'lucide-react';
import { useCall } from '../contexts/CallContext';
import { useAuth } from '../contexts/AuthContext';
import { getSocketInstance } from '../hooks/useSocket';

export function MovieNightPage() {
  const { partner } = useAuth();
  const myRole = partner?.role || 'boyfriend';
  const partnerName = myRole === 'boyfriend' ? 'Seema' : 'Maulik';
  const myName = partner?.name || (myRole === 'boyfriend' ? 'Maulik' : 'Seema');
  const { activeCall, incomingCall, callSession, isAudioMuted, localStream, remoteStream, startCall, acceptCall, endCall, toggleMuteAudio } = useCall();
  const location = useLocation();

  useEffect(() => {
    if (activeCall || callSession?.status === 'connecting' || callSession?.status === 'active') return;
    if (location.state?.autoAcceptCall) { acceptCall(location.state.autoAcceptCall); window.history.replaceState({}, document.title); }
    else if (incomingCall?.callType === 'screenshare') acceptCall(incomingCall);
  }, [location.state, incomingCall, activeCall, callSession?.status, acceptCall]);

  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const [whispers, setWhispers] = useState<{ id: number; sender: string; text: string; time: string }[]>([]);
  const [inputWhisper, setInputWhisper] = useState('');
  const [cinemaReactions, setCinemaReactions] = useState<{ id: number; icon: string; left: number }[]>([]);

  useEffect(() => {
    const videoEl = videoElementRef.current; if (!videoEl) return;
    const bindStream = () => {
      if (activeCall?.isOutgoing && localStream) { videoEl.srcObject = localStream; videoEl.muted = true; videoEl.play().catch(() => {}); }
      else if (remoteStream) { videoEl.srcObject = remoteStream; videoEl.muted = false; videoEl.play().catch(() => {}); }
      else videoEl.srcObject = null;
    };
    bindStream();
    const unlockPlay = () => { if (videoEl && videoEl.paused && videoEl.srcObject) videoEl.play().catch(() => {}); };
    window.addEventListener('click', unlockPlay); window.addEventListener('touchstart', unlockPlay);
    if (remoteStream) { remoteStream.onaddtrack = bindStream; remoteStream.onremovetrack = bindStream; }
    return () => {
      window.removeEventListener('click', unlockPlay); window.removeEventListener('touchstart', unlockPlay);
      if (remoteStream) { remoteStream.onaddtrack = null; remoteStream.onremovetrack = null; }
    };
  }, [activeCall, localStream, remoteStream]);

  useEffect(() => {
    const socket = getSocketInstance();
    const handleMovieWhisper = (msg: any) => setWhispers((p) => [...p, msg]);
    const handleMovieReaction = (rx: any) => { setCinemaReactions((p) => [...p, rx]); setTimeout(() => setCinemaReactions((p) => p.filter((i) => i.id !== rx.id)), 2800); };
    socket.on('movie_whisper', handleMovieWhisper); socket.on('movie_reaction', handleMovieReaction);
    return () => { socket.off('movie_whisper', handleMovieWhisper); socket.off('movie_reaction', handleMovieReaction); };
  }, []);

  const handleSendWhisper = (e: React.FormEvent) => {
    e.preventDefault(); if (!inputWhisper.trim()) return;
    const msg = { id: Date.now(), sender: myName, text: inputWhisper.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setWhispers((p) => [...p, msg]); getSocketInstance().emit('movie_whisper', { text: inputWhisper.trim() }); setInputWhisper('');
  };

  const triggerReaction = (iconStr: string) => {
    const rx = { id: Date.now() + Math.random(), icon: iconStr, left: 15 + Math.random() * 70 };
    setCinemaReactions((p) => [...p, rx]); getSocketInstance().emit('movie_reaction', rx);
    setTimeout(() => setCinemaReactions((p) => p.filter((i) => i.id !== rx.id)), 2800);
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) videoContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    else document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
  };

  const isStreamActive = !!(localStream || remoteStream || activeCall?.status === 'connected');

  return (
    <div style={{ padding: '0.5rem 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--coral-soft)', color: 'var(--coral-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Film size={26} /></div>
          <div><h1 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--ink-deep)', fontWeight: 700 }}>Movie Night Cinema</h1><p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>Watch together live with {partnerName}</p></div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => activeCall ? endCall() : startCall('audio')} style={{ padding: '0.65rem 1.25rem', borderRadius: '99px', background: activeCall ? '#EF4444' : 'var(--coral-soft)', color: activeCall ? '#FFF' : 'var(--coral-primary)', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>{activeCall ? <PhoneOff size={18} /> : <PhoneCall size={18} />}<span>{activeCall ? 'End Call' : 'Voice Chat'}</span></button>
          <button onClick={() => startCall('screenshare')} style={{ padding: '0.65rem 1.25rem', borderRadius: '99px', background: 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--magenta-deep) 100%)', color: '#FFF', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Share2 size={18} /><span>Share Screen</span></button>
        </div>
      </div>

      {/* Main Screen Player View */}
      <div ref={videoContainerRef} style={{ width: '100%', aspectRatio: '16/9', background: '#0D0B14', borderRadius: '24px', border: '2px solid var(--border-strong)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video ref={videoElementRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'contain', display: isStreamActive ? 'block' : 'none' }} />
        {!isStreamActive && (
          <div style={{ textAlign: 'center', color: '#FFF', padding: '2rem' }}>
            <Tv size={64} color="var(--strawberry-500)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>No Active Stream</h3>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1.5rem' }}>Click Share Screen to stream Netflix, YouTube or Movies live to {partnerName}!</p>
            <button onClick={() => startCall('screenshare')} style={{ padding: '0.85rem 2rem', borderRadius: '99px', background: 'var(--strawberry-500)', color: '#FFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Start Streaming Screen</button>
          </div>
        )}

        {/* Floating Reactions Overlay */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, overflow: 'hidden' }}>
          {cinemaReactions.map((rx) => (
            <div key={rx.id} style={{ position: 'absolute', bottom: '60px', left: `${rx.left}%`, fontSize: '2.5rem', animation: 'floatRx 2.6s ease-out forwards' }}>{rx.icon}</div>
          ))}
        </div>

        {/* Floating Controls Overlay */}
        <div style={{ position: 'absolute', bottom: '16px', right: '16px', zIndex: 20, display: 'flex', gap: '8px' }}>
          <button onClick={() => toggleMuteAudio()} style={{ padding: '8px 14px', borderRadius: '99px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.3)', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>{isAudioMuted ? <MicOff size={16} color="#EF4444" /> : <Mic size={16} color="#10B981" />}</button>
          <button onClick={toggleFullscreen} style={{ padding: '8px 14px', borderRadius: '99px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.3)', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>{isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}</button>
        </div>
      </div>

      {/* Cinema Reactions & Whispers Dock */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>
        <div className="card-surface" style={{ padding: '1.25rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontWeight: 700, color: 'var(--ink-deep)', fontSize: '0.95rem' }}>Cinema Quick Reactions</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['❤️', '🍿', '😂', '😱', '🥹', '🔥', '😭', '👏'].map((emoji) => (
              <button key={emoji} onClick={() => triggerReaction(emoji)} style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '0.65rem 1rem', fontSize: '1.5rem', cursor: 'pointer' }}>{emoji}</button>
            ))}
          </div>
        </div>

        <div className="card-surface" style={{ padding: '1.25rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', height: '240px' }}>
          <div style={{ fontWeight: 700, color: 'var(--ink-deep)', fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}><MessageCircle size={16} color="var(--strawberry-500)" /> Live Cinema Whispers</div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '0.75rem' }}>
            {whispers.map((w) => (
              <div key={w.id} style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem', borderRadius: '12px', background: 'var(--surface-hover)', color: 'var(--ink-deep)' }}><strong>{w.sender}:</strong> {w.text}</div>
            ))}
          </div>
          <form onSubmit={handleSendWhisper} style={{ display: 'flex', gap: '6px' }}>
            <input value={inputWhisper} onChange={(e) => setInputWhisper(e.target.value)} placeholder="Whisper during movie..." style={{ flex: 1, padding: '0.5rem 0.85rem', borderRadius: '99px', border: '1px solid var(--border-subtle)', background: 'var(--surface-card)', color: 'var(--ink-deep)', outline: 'none', fontSize: '0.82rem' }} />
            <button type="submit" style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--strawberry-500)', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Send size={14} /></button>
          </form>
        </div>
      </div>
    </div>
  );
}
