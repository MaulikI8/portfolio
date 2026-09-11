import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Radio, Monitor, MonitorOff, Maximize2, Minimize2, LayoutGrid } from 'lucide-react';
import { useCall } from '../contexts/CallContext';

export type CallType = 'audio' | 'video' | 'screenshare';

export interface CallOverlayProps {
  activeCall: {
    type: CallType;
    isOutgoing: boolean;
    partnerName: string;
    status: 'calling' | 'connecting' | 'connected' | 'ended';
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
  const {
    remoteStream,
    localStream,
    diagnostics,
    localAudioLevel,
    remoteAudioLevel,
    showDebugPanel,
    setShowDebugPanel,
    connectionTimeoutPhase,
    retryConnection
  } = useCall();
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
    const videoEl = remoteVideoRef.current;
    if (!videoEl || !remoteStream) return;

    const currentSrcObject = videoEl.srcObject as MediaStream | null;
    const currentTrackIds = currentSrcObject ? currentSrcObject.getTracks().map(t => t.id).join(',') : '';
    const newTrackIds = remoteStream.getTracks().map(t => t.id).join(',');

    if (!currentSrcObject || currentTrackIds !== newTrackIds) {
      console.log('[Discord CallOverlay] Binding new remoteStream to video element (track change detected)');
      videoEl.srcObject = remoteStream;
    }

    if (videoEl.paused) {
      videoEl.play().catch(e => console.warn('[Discord CallOverlay] Remote video play:', e));
    }
  }, [remoteVideoRef, remoteStream, activeCall.status]);

  useEffect(() => {
    const videoEl = localVideoRef.current;
    if (!videoEl || !localStream) return;

    const currentSrcObject = videoEl.srcObject as MediaStream | null;
    const currentTrackIds = currentSrcObject ? currentSrcObject.getTracks().map(t => t.id).join(',') : '';
    const newTrackIds = localStream.getTracks().map(t => t.id).join(',');

    if (!currentSrcObject || currentTrackIds !== newTrackIds) {
      videoEl.srcObject = localStream;
    }

    if (videoEl.paused) {
      videoEl.play().catch(e => console.warn('[Discord CallOverlay] Local video play:', e));
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: activeCall.status === 'connected' ? '#23A55A' : '#F59E0B', fontSize: '0.8rem', fontWeight: 600 }}>
            <Radio size={14} color={activeCall.status === 'connected' ? '#23A55A' : '#F59E0B'} />
            <span>{activeCall.status === 'connected' ? 'VOICE CONNECTED' : activeCall.status === 'connecting' ? 'CONNECTING RELAY' : 'CALLING'}</span>
            <span style={{ color: '#949BA4', marginLeft: '4px' }}>
              • {activeCall.status === 'connected' ? fmtSecs(sec) : connectionTimeoutPhase === 'warning' ? 'Trying to connect...' : activeCall.status === 'connecting' ? 'Connecting WebRTC...' : 'Calling...'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Developer WebRTC Debug Panel Toggle Button */}
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            style={{
              background: showDebugPanel ? '#5865F2' : '#2B2D31',
              color: '#FFF',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'background 0.15s ease',
            }}
            title="Toggle WebRTC Developer Diagnostics Panel"
          >
            ⚡ WebRTC Debug
          </button>

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

      {/* Connection Timeout Warning Banner */}
      {activeCall.status === 'connecting' && connectionTimeoutPhase === 'warning' && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#F59E0B',
            color: '#000',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 700,
            fontSize: '12px',
            zIndex: 99,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Trying to connect… Testing WebRTC TURN relay candidates</span>
        </div>
      )}

      {/* Connection Failure Dialog (30s timeout) */}
      {connectionTimeoutPhase === 'failed' && activeCall.status !== 'connected' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            zIndex: 99999,
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: '#1E1F22',
              border: '1px solid #F23F43',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '420px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
            }}
          >
            <h3 style={{ margin: 0, color: '#F23F43', fontSize: '1.2rem', fontWeight: 800 }}>
              Unable to establish call connection
            </h3>
            <p style={{ margin: 0, color: '#DBDEE1', fontSize: '0.88rem', lineHeight: '1.4' }}>
              The WebRTC peer connection timed out after 30 seconds across networks.
            </p>
            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
              <button
                onClick={retryConnection}
                style={{
                  flex: 1,
                  background: '#23A55A',
                  color: '#FFF',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Retry Connection
              </button>
              <button
                onClick={onEndCall}
                style={{
                  flex: 1,
                  background: '#F23F43',
                  color: '#FFF',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Developer WebRTC Diagnostics Panel Overlay */}
      {showDebugPanel && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '20px',
            width: '360px',
            maxHeight: 'calc(100vh - 140px)',
            background: 'rgba(15, 15, 18, 0.95)',
            border: '1px solid #5865F2',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.9)',
            zIndex: 9999,
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            overflowY: 'auto',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#E0E0E0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '6px' }}>
            <span style={{ fontWeight: 800, color: '#5865F2' }}>WEBRTC DEBUG PANEL</span>
            <button
              onClick={() => setShowDebugPanel(false)}
              style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>

          <div><strong>Call ID:</strong> <span style={{ color: '#00E676' }}>{diagnostics.callId || 'none'}</span></div>
          <div><strong>Role:</strong> {diagnostics.myRole} ↔ {diagnostics.partnerRole}</div>
          <div><strong>Server Call State:</strong> <span style={{ color: '#FFB74D' }}>{diagnostics.callState}</span></div>
          <div><strong>Peer Connection:</strong> <span style={{ color: diagnostics.connectionState === 'connected' ? '#00E676' : '#FF5252' }}>{diagnostics.connectionState}</span></div>
          <div><strong>ICE Connection:</strong> <span style={{ color: diagnostics.iceConnectionState === 'connected' ? '#00E676' : '#FFB74D' }}>{diagnostics.iceConnectionState}</span></div>
          <div><strong>ICE Gathering:</strong> {diagnostics.iceGatheringState}</div>
          <div><strong>Signaling State:</strong> {diagnostics.signalingState}</div>

          <div style={{ background: '#18181C', padding: '6px', borderRadius: '4px', marginTop: '4px' }}>
            <strong style={{ color: '#00B0FF' }}>Local Tracks ({diagnostics.localTracks.length}):</strong>
            {diagnostics.localTracks.length === 0 ? <div style={{ color: '#777' }}>None</div> : (
              diagnostics.localTracks.map((t, idx) => (
                <div key={idx}>• {t.kind} ({t.label}) [{t.readyState}] enabled={t.enabled ? '✓' : '✗'}</div>
              ))
            )}
          </div>

          <div style={{ background: '#18181C', padding: '6px', borderRadius: '4px' }}>
            <strong style={{ color: '#00B0FF' }}>Remote Tracks ({diagnostics.remoteTracks.length}):</strong>
            {diagnostics.remoteTracks.length === 0 ? <div style={{ color: '#777' }}>None</div> : (
              diagnostics.remoteTracks.map((t, idx) => (
                <div key={idx}>• {t.kind} ({t.label}) [{t.readyState}] enabled={t.enabled ? '✓' : '✗'}</div>
              ))
            )}
          </div>

          <div style={{ background: '#141419', border: '1px solid #00E676', padding: '8px', borderRadius: '6px', marginTop: '4px' }}>
            <strong style={{ color: '#00E676' }}>🔊 SOUNDWAVE AUDIO LISTENER:</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>🎙️ Local Mic Input:</span>
                  <span style={{ color: localAudioLevel > 5 ? '#00E676' : '#888', fontWeight: 'bold' }}>
                    {localAudioLevel > 5 ? `${localAudioLevel}% (Speaking)` : '0% (Silent)'}
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${localAudioLevel}%`, height: '100%', background: 'linear-gradient(90deg, #00B0FF, #00E676)', transition: 'width 0.1s ease' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>🔊 Remote Audio Output:</span>
                  <span style={{ color: remoteAudioLevel > 5 ? '#00E676' : '#888', fontWeight: 'bold' }}>
                    {remoteAudioLevel > 5 ? `${remoteAudioLevel}% (Sound Received)` : '0% (Silent)'}
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${remoteAudioLevel}%`, height: '100%', background: 'linear-gradient(90deg, #FF9800, #00E676)', transition: 'width 0.1s ease' }} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <strong>Candidates Gathered:</strong>
            <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
              <span>host: {diagnostics.candidatesGathered.host}</span>
              <span>srflx: {diagnostics.candidatesGathered.srflx}</span>
              <span>relay: <strong style={{ color: diagnostics.candidatesGathered.relay > 0 ? '#00E676' : '#FF5252' }}>{diagnostics.candidatesGathered.relay}</strong></span>
            </div>
          </div>

          <div style={{ marginTop: '6px' }}>
            <strong style={{ color: '#FFB74D' }}>Recent Event Ticker:</strong>
            <div style={{ maxHeight: '120px', overflowY: 'auto', background: '#0D0D10', padding: '6px', borderRadius: '4px', fontSize: '10px', marginTop: '4px' }}>
              {diagnostics.logs.length === 0 ? <div style={{ color: '#666' }}>No events logged yet</div> : (
                diagnostics.logs.map((l, i) => (
                  <div key={i} style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{l}</div>
                ))
              )}
            </div>
          </div>
        </div>
      )}


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
                {...({ 'webkit-playsinline': 'true', 'x5-playsinline': 'true' } as any)}
                muted
                onLoadedMetadata={e => e.currentTarget.play().catch(() => {})}
                onCanPlay={e => e.currentTarget.play().catch(() => {})}
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
              />
            ) : (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                {...({ 'webkit-playsinline': 'true', 'x5-playsinline': 'true' } as any)}
                muted
                onLoadedMetadata={e => e.currentTarget.play().catch(() => {})}
                onCanPlay={e => e.currentTarget.play().catch(() => {})}
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
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: activeCall.status === 'connected' ? '#23A55A' : activeCall.status === 'connecting' ? '#F59E0B' : '#B5BAC1' }}>
                {activeCall.status === 'connected' ? `Voice Connected • ${fmtSecs(sec)}` : activeCall.status === 'connecting' ? 'Connecting WebRTC Relay...' : 'Calling...'}
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
