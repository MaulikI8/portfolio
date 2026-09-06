import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Radio, Volume2, Sparkles } from 'lucide-react';

export type CallType = 'audio' | 'video' | 'screenshare';

interface CallOverlayProps {
  activeCall: {
    type: CallType;
    isOutgoing: boolean;
    partnerName: string;
    status: 'calling' | 'connected' | 'ended';
  };
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  onToggleMuteAudio: () => void;
  onToggleMuteVideo: () => void;
  onEndCall: () => void;
}

function formatCallDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function CallOverlay({
  activeCall,
  isAudioMuted,
  isVideoMuted,
  localVideoRef,
  remoteVideoRef,
  onToggleMuteAudio,
  onToggleMuteVideo,
  onEndCall,
}: CallOverlayProps) {
  const [callDuration, setCallDuration] = useState(0);

  // Live call timer effect
  useEffect(() => {
    let timer: any = null;
    if (activeCall.status === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeCall.status]);

  const isAudioCall = activeCall.type === 'audio';

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(9, 4, 12, 0.94)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '2.5rem 1.25rem calc(80px + env(safe-area-inset-bottom, 20px))',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(0.95); opacity: 0.8; box-shadow: 0 0 0 0 rgba(255, 77, 109, 0.6); }
          70% { transform: scale(1.25); opacity: 0.1; box-shadow: 0 0 0 40px rgba(255, 77, 109, 0); }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes equalizerBar {
          0%, 100% { height: 8px; }
          50% { height: 28px; }
        }
      `}</style>

      {/* HEADER CALL STATUS BADGE */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem',
          marginTop: '0.5rem',
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '0.35rem 1rem',
            borderRadius: '99px',
          }}
        >
          <Radio size={15} color={activeCall.status === 'connected' ? '#10B981' : '#FF4D6D'} className="animate-pulse" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#E2E8F0', letterSpacing: '0.03em' }}>
            {activeCall.type.toUpperCase()} CALL • {activeCall.status === 'connected' ? 'CONNECTED' : 'RINGING...'}
          </span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#FFFFFF',
            margin: '0.3rem 0 0 0',
          }}
        >
          {activeCall.partnerName}
        </h2>

        <span style={{ fontSize: '1rem', fontWeight: 600, color: '#FF758F' }}>
          {activeCall.status === 'connected' ? formatCallDuration(callDuration) : 'Calling...'}
        </span>
      </div>

      {/* CENTER DYNAMIC DISPLAY (AUDIO DANCER VS VIDEO CONTAINER) */}
      {isAudioCall ? (
        /* DYNAMIC AUDIO CALL ANIMATED STAGE */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2.5rem',
            margin: 'auto 0',
            position: 'relative',
          }}
        >
          {/* Concentric Animated Soundwave Pulsing Rings */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                position: 'absolute',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'rgba(255, 77, 109, 0.25)',
                animation: 'pulseRing 2.2s ease-out infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: '230px',
                height: '230px',
                borderRadius: '50%',
                background: 'rgba(255, 77, 109, 0.15)',
                animation: 'pulseRing 2.2s ease-out infinite 0.7s',
              }}
            />

            {/* Avatar Circle */}
            <div
              style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF4D6D 0%, #FF758F 100%)',
                border: '4px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 0 50px rgba(255, 77, 109, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                fontWeight: 800,
                color: '#FFFFFF',
                zIndex: 2,
              }}
            >
              {activeCall.partnerName ? activeCall.partnerName[0] : '💕'}
            </div>
          </div>

          {/* Dancing Audio Equalizer Visualizer */}
          {activeCall.status === 'connected' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '32px' }}>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '5px',
                    borderRadius: '99px',
                    background: 'linear-gradient(180deg, #FF4D6D 0%, #FF758F 100%)',
                    animation: `equalizerBar ${0.6 + (i % 3) * 0.2}s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* DYNAMIC VIDEO & SCREEN SHARE STAGE */
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '850px',
            height: '52vh',
            borderRadius: '28px',
            overflow: 'hidden',
            background: '#120A14',
            border: '2px solid rgba(255, 77, 109, 0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '1rem 0',
          }}
        >
          {/* Main Remote Video Stream */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
          />

          {/* Presenter Local Video Mini PiP */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              width: '120px',
              height: '160px',
              borderRadius: '20px',
              overflow: 'hidden',
              background: '#1E1028',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              display: isVideoMuted ? 'none' : 'block',
            }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      )}

      {/* DYNAMIC ACTION CONTROL DOCK */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
          padding: '0.9rem 2rem',
          borderRadius: '99px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(255, 77, 109, 0.2)',
          zIndex: 20,
        }}
      >
        <style>{`
          .call-tactile-btn {
            transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, background 0.2s ease !important;
          }
          .call-tactile-btn:hover {
            transform: translateY(-3px) scale(1.06) !important;
          }
          .call-tactile-btn:active {
            transform: translateY(2px) scale(0.94) !important;
          }
        `}</style>

        {/* Toggle Mic Audio */}
        <button
          onClick={onToggleMuteAudio}
          className="call-tactile-btn"
          title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: isAudioMuted ? '#FF3547' : 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: isAudioMuted ? '0 0 20px rgba(255, 53, 71, 0.6)' : 'none',
          }}
        >
          {isAudioMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        {/* Toggle Video Camera (Only if Video/Screenshare) */}
        {!isAudioCall && (
          <button
            onClick={onToggleMuteVideo}
            className="call-tactile-btn"
            title={isVideoMuted ? 'Turn On Camera' : 'Turn Off Camera'}
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: isVideoMuted ? '#FF3547' : 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isVideoMuted ? '0 0 20px rgba(255, 53, 71, 0.6)' : 'none',
            }}
          >
            {isVideoMuted ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
        )}

        {/* Hang Up End Call */}
        <button
          onClick={onEndCall}
          className="call-tactile-btn"
          title="End Call"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF3547 0%, #D81B60 100%)',
            border: 'none',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(255, 53, 71, 0.6), 0 0 20px rgba(255, 53, 71, 0.4)',
          }}
        >
          <PhoneOff size={28} />
        </button>
      </div>
    </div>
  );
}
