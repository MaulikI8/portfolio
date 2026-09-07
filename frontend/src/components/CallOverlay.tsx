import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Radio } from 'lucide-react';
import { useCall } from '../contexts/CallContext';

export type CallType = 'audio' | 'video' | 'screenshare';
interface CallOverlayProps {
  activeCall: { type: CallType; isOutgoing: boolean; partnerName: string; status: 'calling' | 'connected' | 'ended'; };
  isAudioMuted: boolean; isVideoMuted: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement>; remoteVideoRef: React.RefObject<HTMLVideoElement>;
  onToggleMuteAudio: () => void; onToggleMuteVideo: () => void; onEndCall: () => void;
}

function fmtSecs(s: number) { return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`; }

export function CallOverlay({ activeCall, isAudioMuted, isVideoMuted, localVideoRef, remoteVideoRef, onToggleMuteAudio, onToggleMuteVideo, onEndCall }: CallOverlayProps) {
  const [sec, setSec] = useState(0);
  const { remoteStream, localStream } = useCall();

  useEffect(() => {
    let t: any = null;
    if (activeCall.status === 'connected') t = setInterval(() => setSec(p => p + 1), 1000); else setSec(0);
    return () => { if (t) clearInterval(t); };
  }, [activeCall.status]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(e => console.warn('[CallOverlay] Remote video play:', e));
    }
  }, [remoteVideoRef, remoteStream, activeCall.status]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(e => console.warn('[CallOverlay] Local video play:', e));
    }
  }, [localVideoRef, localStream, activeCall.status]);

  const isAudio = activeCall.type === 'audio';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, background: 'rgba(9, 4, 12, 0.94)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '2.5rem 1.25rem 90px', boxSizing: 'border-box' }}>
      <style>{`@keyframes pulseR { 0%{transform:scale(0.95);opacity:0.8;} 70%{transform:scale(1.25);opacity:0.1;} 100%{transform:scale(1.3);opacity:0;} } @keyframes eqB { 0%,100%{height:8px;} 50%{height:28px;} }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '0.35rem 1rem', borderRadius: '99px' }}>
          <Radio size={15} color={activeCall.status === 'connected' ? '#10B981' : '#FF4D6D'} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#E2E8F0' }}>{activeCall.type.toUpperCase()} CALL • {activeCall.status === 'connected' ? 'CONNECTED' : 'RINGING...'}</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 800, color: '#FFF', margin: '0.3rem 0 0 0' }}>{activeCall.partnerName}</h2>
        <span style={{ fontSize: '1rem', fontWeight: 600, color: '#FF758F' }}>{activeCall.status === 'connected' ? fmtSecs(sec) : 'Calling...'}</span>
      </div>

      {isAudio ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2.5rem', margin: 'auto 0', position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255, 77, 109, 0.25)', animation: 'pulseR 2.2s ease-out infinite' }} />
            <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF4D6D 0%, #FF758F 100%)', border: '4px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 0 50px rgba(255, 77, 109, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 800, color: '#FFF', zIndex: 2 }}>
              {activeCall.partnerName ? activeCall.partnerName[0] : '💕'}
            </div>
          </div>
          {activeCall.status === 'connected' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '32px' }}>
              {[0, 1, 2, 3, 4, 5, 6].map(i => <div key={i} style={{ width: '5px', borderRadius: '99px', background: 'linear-gradient(180deg, #FF4D6D 0%, #FF758F 100%)', animation: `eqB ${0.6 + (i % 3) * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />)}
            </div>
          )}
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%', maxWidth: '850px', height: '52vh', borderRadius: '28px', overflow: 'hidden', background: '#120A14', border: '2px solid rgba(255, 77, 109, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem 0' }}>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '120px', height: '160px', borderRadius: '20px', overflow: 'hidden', background: '#1E1028', border: '2px solid rgba(255, 255, 255, 0.3)', display: isVideoMuted ? 'none' : 'block' }}>
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(255, 255, 255, 0.25)', padding: '0.9rem 2rem', borderRadius: '99px', zIndex: 20 }}>
        <button onClick={onToggleMuteAudio} style={{ width: '54px', height: '54px', borderRadius: '50%', background: isAudioMuted ? '#FF3547' : 'rgba(255, 255, 255, 0.2)', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          {isAudioMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        {!isAudio && (
          <button onClick={onToggleMuteVideo} style={{ width: '54px', height: '54px', borderRadius: '50%', background: isVideoMuted ? '#FF3547' : 'rgba(255, 255, 255, 0.2)', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {isVideoMuted ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
        )}
        <button onClick={onEndCall} style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF3547 0%, #D81B60 100%)', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <PhoneOff size={28} />
        </button>
      </div>
    </div>
  );
}
