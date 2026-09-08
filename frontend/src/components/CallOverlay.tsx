import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Radio, Monitor, MonitorOff, Maximize2, Minimize2, LayoutGrid } from 'lucide-react';
import { useCall } from '../contexts/CallContext';

export type CallType = 'audio' | 'video' | 'screenshare';

export interface CallOverlayProps {
  activeCall: {
    type: CallType;
    isOutgoing: boolean;
    partnerName: string;
    status: 'calling' | 'connected' | 'ended';
  };
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing?: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  onToggleMuteAudio: () => void;
  onToggleMuteVideo: () => void;
  onToggleScreenShare?: () => void;
  onEndCall: () => void;
}

function fmtSecs(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

export function CallOverlay({
  activeCall,
  isAudioMuted,
  isVideoMuted,
  isScreenSharing = false,
  localVideoRef,
  remoteVideoRef,
  onToggleMuteAudio,
  onToggleMuteVideo,
  onToggleScreenShare,
  onEndCall,
}: CallOverlayProps) {
  const [sec, setSec] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { remoteStream, localStream } = useCall();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let t: any = null;
    if (activeCall.status === 'connected') {
      t = setInterval(() => setSec(p => p + 1), 1000);
    } else {
      setSec(0);
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [activeCall.status]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(e => console.warn('[Discord CallOverlay] Remote video play:', e));
    }
  }, [remoteVideoRef, remoteStream, activeCall.status]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(e => console.warn('[Discord CallOverlay] Local video play:', e));
    }
  }, [localVideoRef, localStream, activeCall.status]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const isMediaActive = activeCall.type === 'screenshare' || isScreenSharing || activeCall.type === 'video' || !!(remoteStream && remoteStream.getVideoTracks().length > 0);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: '#111214',
        color: '#F2F3F5',
        fontFamily: 'gg sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes discordLivePulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes discordVoicePulse {
          0% { box-shadow: 0 0 0 0 rgba(35, 165, 90, 0.6); }
          70% { box-shadow: 0 0 0 16px rgba(35, 165, 90, 0); }
          100% { box-shadow: 0 0 0 0 rgba(35, 165, 90, 0); }
        }
        @keyframes discordEqBar {
          0%, 100% { height: 6px; }
          50% { height: 24px; }
        }
        .discord-btn {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
          outline: none;
        }
        .discord-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.15);
        }
        .discord-btn:active {
          transform: translateY(0);
        }
      `}</style>

      {/* Discord Header Bar */}
      <div
        style={{
          width: '100%',
          height: '52px',
          background: '#111214',
          borderBottom: '1px solid #1F2023',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Discord LIVE Badge */}
          <div
            style={{
              background: '#F23F43',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              letterSpacing: '0.5px',
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#FFF',
                animation: 'discordLivePulse 1.4s infinite ease-in-out',
              }}
            />
            LIVE
          </div>

          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F2F3F5', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isScreenSharing ? "Your Screen" : `${activeCall.partnerName}'s Screen`}
          </h3>

          <div style={{ width: '1px', height: '16px', background: '#2E3035', margin: '0 4px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#23A55A', fontSize: '0.8rem', fontWeight: 600 }}>
            <Radio size={14} color="#23A55A" />
            <span>VOICE CONNECTED</span>
            <span style={{ color: '#949BA4', marginLeft: '4px' }}>
              • {activeCall.status === 'connected' ? fmtSecs(sec) : 'Calling...'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#B5BAC1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '4px',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F2F3F5')}
            onMouseLeave={e => (e.currentTarget.style.color = '#B5BAC1')}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Main Stream Canvas */}
      <div
        style={{
          flex: 1,
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 16px 90px',
          boxSizing: 'border-box',
        }}
      >
        {isMediaActive ? (
          /* Discord Screen Share / Video Frame */
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              maxWidth: '1280px',
              maxHeight: 'calc(100vh - 160px)',
              aspectRatio: '16/9',
              background: '#000000',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #1E1F22',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Connecting Overlay for cross-network streams */}
            {!isScreenSharing && (!remoteStream || remoteStream.getVideoTracks().length === 0) && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#111214',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '14px',
                  zIndex: 15,
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: '3px solid #23A55A',
                    borderTopColor: 'transparent',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F2F3F5' }}>
                  Connecting Screen Share from {activeCall.partnerName}...
                </span>
                <span style={{ fontSize: '0.8rem', color: '#949BA4' }}>
                  Establishing WebRTC cross-network TURN connection
                </span>
              </div>
            )}

            {/* Main Video Element */}
            {isScreenSharing ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
              />
            ) : (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
              />
            )}

            {/* Stream Tag Overlay (Top-Left inside video) */}
            <div
              style={{
                position: 'absolute',
                top: '14px',
                left: '14px',
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 10,
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#F23F43',
                  animation: 'discordLivePulse 1.4s infinite ease-in-out',
                }}
              />
              <span>{isScreenSharing ? 'You are sharing your screen' : `${activeCall.partnerName}'s Screen`}</span>
            </div>

            {/* PIP Thumbnail (Bottom-Right inside video) */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                width: '180px',
                height: '108px',
                borderRadius: '12px',
                background: '#1E1F22',
                border: '2px solid #2B2D31',
                boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
                overflow: 'hidden',
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isScreenSharing ? (
                /* When user is sharing screen, show partner's camera video in PIP */
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : isVideoMuted ? (
                /* Avatar when camera is muted */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FF4D6D 0%, #FF758F 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: '#FFF',
                    }}
                  >
                    {activeCall.partnerName ? activeCall.partnerName[0] : '💕'}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#949BA4' }}>Camera Off</span>
                </div>
              ) : (
                /* Local camera video */
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}

              {/* Mute indicator inside thumbnail */}
              {isAudioMuted && (
                <div
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: '#F23F43',
                    borderRadius: '50%',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MicOff size={12} color="#FFF" />
                </div>
              )}

              {/* Tag inside thumbnail */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '6px',
                  left: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#F2F3F5',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                }}
              >
                {isScreenSharing ? activeCall.partnerName : 'You'}
              </div>
            </div>
          </div>
        ) : (
          /* Discord Voice Call Audio Tile */
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              aspectRatio: '16/10',
              background: '#1E1F22',
              borderRadius: '16px',
              border: '1px solid #2B2D31',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              padding: '24px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF4D6D 0%, #FF758F 100%)',
                  border: '3px solid #23A55A',
                  animation: activeCall.status === 'connected' ? 'discordVoicePulse 2s infinite' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: '#FFF',
                }}
              >
                {activeCall.partnerName ? activeCall.partnerName[0] : '💕'}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F2F3F5', margin: '0 0 4px' }}>
                {activeCall.partnerName}
              </h2>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#23A55A' }}>
                {activeCall.status === 'connected' ? `Voice Connected • ${fmtSecs(sec)}` : 'Calling...'}
              </span>
            </div>

            {activeCall.status === 'connected' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '24px' }}>
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    style={{
                      width: '4px',
                      borderRadius: '4px',
                      background: '#23A55A',
                      animation: `discordEqBar ${0.5 + (i % 3) * 0.25}s ease-in-out infinite`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Discord Floating Bottom Dock Controls */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: '#1E1F22',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Mic Control */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={onToggleMuteAudio}
            className="discord-btn"
            style={{
              background: isAudioMuted ? '#F23F43' : '#2B2D31',
              color: isAudioMuted ? '#FFFFFF' : '#DBDEE1',
            }}
            title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isAudioMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#949BA4' }}>
            {isAudioMuted ? 'Unmute' : 'Mute'}
          </span>
        </div>

        {/* Camera Control */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={onToggleMuteVideo}
            className="discord-btn"
            style={{
              background: isVideoMuted ? '#F23F43' : '#2B2D31',
              color: isVideoMuted ? '#FFFFFF' : '#DBDEE1',
            }}
            title={isVideoMuted ? 'Turn On Camera' : 'Turn Off Camera'}
          >
            {isVideoMuted ? <VideoOff size={22} /> : <Video size={22} />}
          </button>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#949BA4' }}>
            {isVideoMuted ? 'Start Video' : 'Stop Video'}
          </span>
        </div>

        {/* Screen Share Control (THE REQUESTED FEATURE) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={onToggleScreenShare}
            className="discord-btn"
            style={{
              background: isScreenSharing ? '#23A55A' : '#2B2D31',
              color: isScreenSharing ? '#FFFFFF' : '#DBDEE1',
              boxShadow: isScreenSharing ? '0 0 16px rgba(35, 165, 90, 0.6)' : 'none',
            }}
            title={isScreenSharing ? 'Stop Sharing Screen' : 'Share Your Screen'}
          >
            {isScreenSharing ? <MonitorOff size={22} /> : <Monitor size={22} />}
          </button>
          <span style={{ fontSize: '11px', fontWeight: 600, color: isScreenSharing ? '#23A55A' : '#949BA4' }}>
            {isScreenSharing ? 'Stop Share' : 'Share Screen'}
          </span>
        </div>

        {/* Disconnect Control */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={onEndCall}
            className="discord-btn"
            style={{
              background: '#F23F43',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(242, 63, 67, 0.4)',
            }}
            title="Disconnect Call"
          >
            <PhoneOff size={22} />
          </button>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#F23F43' }}>
            Disconnect
          </span>
        </div>
      </div>
    </div>
  );
}
