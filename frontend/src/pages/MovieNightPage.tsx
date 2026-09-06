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
        style={{
          padding: '1.25rem 1.6rem',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(30, 16, 40, 0.85) 0%, rgba(18, 9, 28, 0.85) 100%)',
          backdropFilter: 'blur(16px)',
          color: '#FFFFFF',
          border: '1.5px solid rgba(255, 105, 180, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #FF4D6D 0%, #D81B60 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(255, 77, 109, 0.5)',
            }}
          >
            <Tv size={26} color="#FFFFFF" />
          </div>
          <div>
            <h1 className="font-serif" style={{ fontSize: '1.55rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
              Movie Night Cinema
            </h1>
            <p style={{ fontSize: '0.83rem', color: '#CBD5E1', fontWeight: 500, margin: '2px 0 0' }}>
              Live Screen Sharing & Voice Chat for <span style={{ color: '#FF758F', fontWeight: 700 }}>{myName}</span> & <span style={{ color: '#FFD166', fontWeight: 700 }}>{partnerName}</span>
            </p>
          </div>
        </div>

        {/* Voice Call & Audio Controls Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {activeCall ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                padding: '0.4rem 1rem',
                borderRadius: '99px',
                border: '1.5px solid rgba(16, 185, 129, 0.4)',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Radio size={16} color="#10B981" className="animate-pulse" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#10B981', letterSpacing: '0.02em' }}>
                  {activeCall.status === 'connected' ? 'CONNECTED' : 'CONNECTING...'}
                </span>
              </div>

              <button
                onClick={toggleMuteAudio}
                className="tactile-btn"
                style={{
                  background: isAudioMuted ? '#FF3547' : 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#FFFFFF',
                  boxShadow: isAudioMuted ? '0 0 15px rgba(255, 53, 71, 0.6)' : 'none',
                  transition: 'all 0.15s ease',
                }}
                title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isAudioMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <button
                onClick={endCall}
                className="tactile-btn"
                style={{
                  background: 'linear-gradient(135deg, #FF3547 0%, #D81B60 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '99px',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 4px 15px rgba(255, 53, 71, 0.4)',
                }}
              >
                <PhoneOff size={14} />
                <span>Leave</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleToggleVoiceCall}
              className="tactile-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: 'linear-gradient(135deg, #FF4D6D 0%, #D81B60 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.65rem 1.3rem',
                borderRadius: '99px',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(255, 77, 109, 0.45), 0 0 15px rgba(255, 77, 109, 0.3)',
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Mic size={17} />
              <span>Join Voice Call (Mic Audio)</span>
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
          minHeight: '400px',
          height: isFullscreen ? '100vh' : '62vh',
          background: '#07030A',
          borderRadius: isFullscreen ? '0px' : '28px',
          border: isFullscreen ? 'none' : '2.5px solid rgba(255, 77, 109, 0.35)',
          boxShadow: isFullscreen
            ? 'none'
            : '0 25px 70px rgba(0, 0, 0, 0.8), 0 0 60px rgba(255, 77, 109, 0.2), inset 0 0 100px rgba(0, 0, 0, 0.9)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.25s ease',
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
                bottom: '12%',
                fontSize: '2.5rem',
                filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.6))',
                animation: 'floatReactionUp 2.8s cubic-bezier(0.25, 1, 0.5, 1) forwards',
              }}
            >
              {rx.icon}
            </div>
          ))}
        </div>

        <style>{`
          @keyframes floatReactionUp {
            0% { transform: translateY(0) scale(0.5); opacity: 0; }
            15% { opacity: 1; transform: translateY(-40px) scale(1.3); }
            100% { transform: translateY(-300px) scale(1.5); opacity: 0; }
          }
          .tactile-btn {
            transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, background 0.2s ease !important;
          }
          .tactile-btn:hover {
            transform: translateY(-2px) scale(1.04) !important;
          }
          .tactile-btn:active {
            transform: translateY(1px) scale(0.95) !important;
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
              padding: '2.5rem 1.5rem',
              gap: '1.4rem',
            }}
          >
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255, 77, 109, 0.2) 0%, rgba(216, 27, 96, 0.2) 100%)',
                border: '2px dashed #FF4D6D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 45px rgba(255, 77, 109, 0.35)',
              }}
            >
              <Film size={44} color="#FF4D6D" className="animate-pulse" />
            </div>

            <div>
              <h2 className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.4rem' }}>
                Ready for Cinema Stream? 🍿
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.75)', maxWidth: '440px', lineHeight: 1.5, margin: 0 }}>
                Share your browser tab or screen window to stream movies, YouTube, or Netflix together with crisp audio & 1080p 60fps video!
              </p>
            </div>

            <button
              onClick={handleStartScreenShare}
              className="tactile-btn"
              style={{
                padding: '1rem 2.2rem',
                borderRadius: '99px',
                background: 'linear-gradient(135deg, #FF4D6D 0%, #D81B60 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '1.05rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 12px 35px rgba(255, 77, 109, 0.5), 0 0 20px rgba(255, 77, 109, 0.3)',
              }}
            >
              <Share2 size={22} />
              <span>Start Screen Share Now</span>
            </button>
          </div>
        )}

        {/* Floating Screen Share Control Bar & Fullscreen Toggle */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(12, 6, 16, 0.88)',
            backdropFilter: 'blur(16px)',
            padding: '0.7rem 1.4rem',
            borderRadius: '99px',
            border: '1.5px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 40,
            boxShadow: '0 15px 40px rgba(0,0,0,0.7), 0 0 20px rgba(255, 77, 109, 0.25)',
          }}
        >
          {isStreamActive ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontSize: '0.85rem', fontWeight: 800 }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
                <span>{activeCall?.isOutgoing ? 'PRESENTER (LIVE SCREEN SHARE)' : 'VIEWER (LIVE CINEMA STREAM)'}</span>
              </div>

              <button
                onClick={endCall}
                className="tactile-btn"
                style={{
                  background: '#FF3547',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '99px',
                  padding: '0.45rem 1.1rem',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px rgba(255, 53, 71, 0.4)',
                }}
              >
                <Square size={14} fill="#FFFFFF" />
                <span>Stop Sharing</span>
              </button>
            </>
          ) : (
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
              Movie Night Cinema
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className="tactile-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      {/* 3. CINEMA REACTION DOCK & WHISPERS SIDEBAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.4rem' }}>
        
        {/* Quick Romantic Emoji Reactions Dock */}
        <div
          style={{
            padding: '1.4rem',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(28, 14, 38, 0.85) 0%, rgba(16, 8, 24, 0.85) 100%)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#FFFFFF', fontWeight: 800, fontSize: '1rem' }}>
            <Sparkles size={20} color="#FF4D6D" />
            <span>Movie Night Reactions</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {['❤️', '🍿', '🎬', '😮', '😂', '💋', '😱', '🥳'].map((emojiStr) => (
              <button
                key={emojiStr}
                onClick={() => triggerReaction(emojiStr)}
                className="tactile-btn"
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                }}
              >
                {emojiStr}
              </button>
            ))}
          </div>
        </div>

        {/* Live Movie Whispers Chat Box */}
        <div
          style={{
            padding: '1.4rem',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(28, 14, 38, 0.85) 0%, rgba(16, 8, 24, 0.85) 100%)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#FFFFFF', fontWeight: 800, fontSize: '1rem' }}>
            <MessageCircle size={20} color="#FF4D6D" />
            <span>Movie Whispers</span>
          </div>

          {/* Whispers Feed */}
          <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minHeight: '90px', maxHeight: '150px', overflowY: 'auto' }}>
            {whispers.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', padding: '1.2rem 0' }}>
                No whispers yet. Send a live message during movie night! ✨
              </div>
            ) : (
              whispers.map((w) => (
                <div
                  key={w.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: w.sender === myName ? 'rgba(255, 77, 109, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    border: w.sender === myName ? '1px solid rgba(255, 77, 109, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '0.6rem 0.95rem',
                    borderRadius: '16px',
                    fontSize: '0.88rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#FFFFFF', fontSize: '0.78rem' }}>
                    <span style={{ color: w.sender === myName ? '#FF758F' : '#FFD166' }}>{w.sender}</span>
                    <span style={{ color: '#94A3B8', fontWeight: 500 }}>{w.time}</span>
                  </div>
                  <div style={{ color: '#F1F5F9', marginTop: '0.15rem', fontWeight: 500 }}>{w.text}</div>
                </div>
              ))
            )}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendWhisper} style={{ display: 'flex', gap: '0.6rem' }}>
            <input
              type="text"
              placeholder="Whisper something..."
              value={inputWhisper}
              onChange={(e) => setInputWhisper(e.target.value)}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: '99px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                outline: 'none',
                fontSize: '0.88rem',
                fontWeight: 500,
              }}
            />
            <button
              type="submit"
              className="tactile-btn"
              style={{
                padding: '0.65rem 1.1rem',
                borderRadius: '99px',
                background: 'linear-gradient(135deg, #FF4D6D 0%, #D81B60 100%)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(255, 77, 109, 0.4)',
              }}
            >
              <Send size={16} color="#FFFFFF" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
