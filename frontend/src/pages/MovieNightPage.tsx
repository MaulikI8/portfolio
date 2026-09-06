import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Film,
  Tv,
  Mic,
  MicOff,
  Share2,
  Square,
  Sparkles,
  MessageCircle,
  Radio,
  Send,
  Maximize,
  Minimize,
  PhoneCall,
  PhoneOff,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWebRTC } from '../hooks/useWebRTC';
import { getSocketInstance } from '../hooks/useSocket';

export function MovieNightPage() {
  const { partner } = useAuth();
  const myRole = partner?.role || 'boyfriend';
  const partnerName = myRole === 'boyfriend' ? 'Seema' : 'Maulik';
  const myName = partner?.name || (myRole === 'boyfriend' ? 'Maulik' : 'Seema');

  // WebRTC Hook Integration
  const {
    activeCall,
    incomingCall,
    isAudioMuted,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMuteAudio,
  } = useWebRTC(myRole);

  const location = useLocation();

  // Auto-accept screen share call if passed in navigation state from AppLayout global call modal
  useEffect(() => {
    if (location.state?.autoAcceptCall) {
      const invite = location.state.autoAcceptCall;
      console.log('[MovieNightPage] Auto-accepting call from location state:', invite);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      acceptCall(invite);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, acceptCall]);

  // Fullscreen Container Ref
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Live Cinema Whispers & Reactions State
  const [whispers, setWhispers] = useState<{ id: number; sender: string; text: string; time: string }[]>([]);
  const [inputWhisper, setInputWhisper] = useState('');
  const [cinemaReactions, setCinemaReactions] = useState<{ id: number; icon: string; left: number }[]>([]);

  // Bind video stream whenever localStream or remoteStream changes
  useEffect(() => {
    const videoEl = videoElementRef.current;
    if (!videoEl) return;

    const bindStream = () => {
      if (activeCall?.isOutgoing && localStream) {
        console.log('[MovieNight] Playing local presenter stream');
        videoEl.srcObject = localStream;
        videoEl.muted = true; // Mute presenter's local preview to prevent audio echo
        videoEl.onloadedmetadata = () => videoEl.play().catch(() => {});
        videoEl.play().catch(() => {});
      } else if (remoteStream) {
        console.log('[MovieNight] Playing remote viewer stream', remoteStream.getTracks());
        videoEl.srcObject = remoteStream;
        videoEl.muted = false; // Unmute remote viewer so they hear the movie stream
        videoEl.onloadedmetadata = () => videoEl.play().catch((err) => console.warn('[MovieNight] Video play error:', err));
        videoEl.play().catch((err) => console.warn('[MovieNight] Video play error:', err));
      } else {
        videoEl.srcObject = null;
      }
    };

    bindStream();

    if (remoteStream) {
      remoteStream.onaddtrack = bindStream;
      remoteStream.onremovetrack = bindStream;
    }

    return () => {
      if (remoteStream) {
        remoteStream.onaddtrack = null;
        remoteStream.onremovetrack = null;
      }
    };
  }, [activeCall, localStream, remoteStream]);

  // Listen for real-time whispers & reactions via Socket.IO
  useEffect(() => {
    const socket = getSocketInstance();

    const handleMovieWhisper = (msg: { id: number; sender: string; text: string; time: string }) => {
      setWhispers((prev) => [...prev, msg]);
    };

    const handleMovieReaction = (rx: { id: number; icon: string; left: number }) => {
      setCinemaReactions((prev) => [...prev, rx]);
      setTimeout(() => {
        setCinemaReactions((prev) => prev.filter((item) => item.id !== rx.id));
      }, 2800);
    };

    socket.on('movie_whisper', handleMovieWhisper);
    socket.on('movie_reaction', handleMovieReaction);

    return () => {
      socket.off('movie_whisper', handleMovieWhisper);
      socket.off('movie_reaction', handleMovieReaction);
    };
  }, []);

  const handleStartScreenShare = () => {
    startCall('screenshare');
  };

  const handleToggleVoiceCall = () => {
    if (activeCall) {
      endCall();
    } else {
      startCall('audio');
    }
  };

  const handleSendWhisper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputWhisper.trim()) return;

    const newWhisper = {
      id: Date.now(),
      sender: myName,
      text: inputWhisper.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setWhispers((prev) => [...prev, newWhisper]);
    getSocketInstance().emit('movie_whisper', { text: inputWhisper.trim() });
    setInputWhisper('');
  };

  const triggerReaction = (iconStr: string) => {
    const rx = {
      id: Date.now() + Math.random(),
      icon: iconStr,
      left: 15 + Math.random() * 70,
    };
    setCinemaReactions((prev) => [...prev, rx]);
    getSocketInstance().emit('movie_reaction', rx);
    setTimeout(() => {
      setCinemaReactions((prev) => prev.filter((item) => item.id !== rx.id));
    }, 2800);
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.log('Fullscreen failed:', err));
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.log('Exit fullscreen failed:', err));
    }
  };

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const isStreamActive = !!(localStream || remoteStream || (activeCall && activeCall.status === 'connected'));

  return (
    <div style={{ padding: '0.5rem 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* INCOMING CALL / SCREENSHARE PROMINENT BANNER */}
      {incomingCall && (
        <div
          className="animate-slide-down"
          style={{
            background: 'linear-gradient(135deg, #1e1028 0%, #2a1735 100%)',
            border: '2px solid var(--strawberry-500)',
            borderRadius: '24px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 15px 40px rgba(232, 86, 125, 0.4)',
            color: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF4D6D 0%, #FF758F 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(255, 77, 109, 0.6)',
              }}
            >
              <PhoneCall size={24} color="#FFF" className="animate-bounce" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFF' }}>
                📺 {incomingCall.fromName} is sharing Movie Screen!
              </div>
              <div style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>
                Tap Accept to view the live movie stream together
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                acceptCall();
              }}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: '99px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFF',
                fontWeight: 800,
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={16} />
              <span>Accept & Join Stream</span>
            </button>

            <button
              onClick={rejectCall}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '99px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#CBD5E1',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
              }}
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* 1. CINEMA HEADER & ROOM STATUS */}
      <div
        className="card-surface"
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '24px',
          background: 'var(--surface-card)',
          color: 'var(--ink-deep)',
          border: '1.5px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--strawberry-600) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(232, 86, 125, 0.3)' }}>
            <Tv size={24} color="#FFFFFF" />
          </div>
          <div>
            <h1 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink-deep)' }}>
              Movie Night Cinema
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', fontWeight: 500 }}>
              Live Screen Share & Audio Call for {myName} & {partnerName}
            </p>
          </div>
        </div>

        {/* Voice Call & Audio Controls Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {activeCall ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'var(--surface-muted, rgba(255,255,255,0.08))', padding: '0.35rem 0.85rem', borderRadius: '99px', border: '1px solid rgba(232, 86, 125, 0.4)' }}>
              <Radio size={16} color="#10B981" className="animate-pulse" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10B981' }}>
                {activeCall.status === 'connected' ? 'Connected' : 'Connecting...'}
              </span>

              <button
                onClick={toggleMuteAudio}
                style={{
                  background: isAudioMuted ? '#FF3547' : 'var(--surface-muted, rgba(255,255,255,0.15))',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--ink-deep)',
                  marginLeft: '0.2rem',
                }}
                title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isAudioMuted ? <MicOff size={15} /> : <Mic size={15} />}
              </button>

              <button
                onClick={endCall}
                style={{
                  background: 'var(--strawberry-600)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '99px',
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <PhoneOff size={14} />
                <span>Leave</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleToggleVoiceCall}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--strawberry-600) 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.55rem 1.1rem',
                borderRadius: '99px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(232, 86, 125, 0.35)',
              }}
            >
              <Mic size={16} />
              <span>Join Voice Call (Audio)</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN SCREEN SHARE CINEMA DISPLAY PLAYER */}
      <div
        ref={videoContainerRef}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '380px',
          height: isFullscreen ? '100vh' : '55vh',
          background: '#09040A',
          borderRadius: isFullscreen ? '0px' : '28px',
          border: isFullscreen ? 'none' : '3px solid rgba(232, 86, 125, 0.35)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 0 80px rgba(0,0,0,0.9)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Floating Reactions Overflow Container */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 30 }}>
          {cinemaReactions.map((rx) => (
            <div
              key={rx.id}
              style={{
                position: 'absolute',
                left: `${rx.left}%`,
                bottom: '10%',
                fontSize: '2rem',
                animation: 'floatReactionUp 2.8s ease-out forwards',
              }}
            >
              {rx.icon}
            </div>
          ))}
        </div>

        <style>{`
          @keyframes floatReactionUp {
            0% { transform: translateY(0) scale(0.6); opacity: 0; }
            20% { opacity: 1; transform: translateY(-40px) scale(1.2); }
            100% { transform: translateY(-260px) scale(1.4); opacity: 0; }
          }
        `}</style>

        {/* Live Screen Video Element */}
        <video
          ref={videoElementRef}
          autoPlay
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: isStreamActive ? 'block' : 'none',
            background: '#000000',
          }}
        />

        {/* Screen Share Idle Screen Placeholder */}
        {!isStreamActive && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '2rem',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(232, 86, 125, 0.12)',
                border: '2px dashed var(--strawberry-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 35px rgba(232, 86, 125, 0.25)',
              }}
            >
              <Film size={38} color="var(--strawberry-500)" />
            </div>

            <div>
              <h2 className="font-serif" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.4rem' }}>
                Ready for Movie Night?
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', maxWidth: '420px', lineHeight: 1.45 }}>
                Share your browser tab or desktop screen to stream Netflix, YouTube, or videos together in real-time!
              </p>
            </div>

            <button
              onClick={handleStartScreenShare}
              style={{
                padding: '0.9rem 1.75rem',
                borderRadius: '99px',
                background: 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--strawberry-600) 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                boxShadow: '0 10px 25px rgba(232, 86, 125, 0.4)',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Share2 size={20} />
              <span>Start Screen Share</span>
            </button>
          </div>
        )}

        {/* Floating Screen Share Control Bar & Fullscreen Toggle */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 6, 14, 0.88)',
            backdropFilter: 'blur(12px)',
            padding: '0.6rem 1.25rem',
            borderRadius: '99px',
            border: '1.5px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            zIndex: 40,
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          }}
        >
          {isStreamActive ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10B981', fontSize: '0.82rem', fontWeight: 700 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                <span>{activeCall?.isOutgoing ? 'PRESENTER (LIVE SCREEN SHARE)' : 'VIEWER (LIVE CINEMA STREAM)'}</span>
              </div>

              <button
                onClick={endCall}
                style={{
                  background: '#FF3547',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '99px',
                  padding: '0.4rem 1rem',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Square size={14} fill="#FFFFFF" />
                <span>Stop Sharing</span>
              </button>
            </>
          ) : (
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
              Movie Night Cinema
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* 3. CINEMA REACTION DOCK & WHISPERS SIDEBAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        
        {/* Quick Romantic Emoji Reactions Dock */}
        <div
          className="card-surface"
          style={{
            padding: '1.25rem',
            borderRadius: '20px',
            background: 'var(--surface-card)',
            border: '1.5px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink-deep)', fontWeight: 700, fontSize: '0.95rem' }}>
            <Sparkles size={18} color="var(--strawberry-500)" />
            <span>Movie Night Reactions</span>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            {['❤️', '🍿', '🎬', '😮', '😂', '💋', '😱', '🥳'].map((emojiStr) => (
              <button
                key={emojiStr}
                onClick={() => triggerReaction(emojiStr)}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'var(--surface-muted, rgba(255, 255, 255, 0.06))',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {emojiStr}
              </button>
            ))}
          </div>
        </div>

        {/* Live Movie Whispers Chat Box */}
        <div
          className="card-surface"
          style={{
            padding: '1.25rem',
            borderRadius: '20px',
            background: 'var(--surface-card)',
            border: '1.5px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink-deep)', fontWeight: 700, fontSize: '0.95rem' }}>
            <MessageCircle size={18} color="var(--strawberry-500)" />
            <span>Movie Whispers</span>
          </div>

          {/* Whispers Feed */}
          <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minHeight: '80px', maxHeight: '140px', overflowY: 'auto' }}>
            {whispers.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', fontStyle: 'italic', textAlign: 'center', padding: '1rem 0' }}>
                No whispers yet. Send a live message during movie night! ✨
              </div>
            ) : (
              whispers.map((w) => (
                <div
                  key={w.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: w.sender === myName ? 'var(--strawberry-500-15, rgba(232, 86, 125, 0.15))' : 'var(--surface-muted, rgba(255, 255, 255, 0.08))',
                    border: w.sender === myName ? '1px solid rgba(232, 86, 125, 0.3)' : '1px solid var(--border-subtle)',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '14px',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--ink-deep)', fontSize: '0.75rem' }}>
                    <span>{w.sender}</span>
                    <span style={{ color: 'var(--ink-muted)', fontWeight: 500 }}>{w.time}</span>
                  </div>
                  <div style={{ color: 'var(--ink-deep)', marginTop: '0.1rem', fontWeight: 500 }}>{w.text}</div>
                </div>
              ))
            )}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendWhisper} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Whisper something..."
              value={inputWhisper}
              onChange={(e) => setInputWhisper(e.target.value)}
              style={{
                flex: 1,
                padding: '0.55rem 0.85rem',
                borderRadius: '99px',
                background: 'var(--surface-muted, rgba(255, 255, 255, 0.06))',
                color: 'var(--ink-deep)',
                border: '1px solid var(--border-subtle)',
                outline: 'none',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: '0.55rem 0.95rem',
                borderRadius: '99px',
                background: 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--strawberry-600) 100%)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={15} color="#FFFFFF" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
