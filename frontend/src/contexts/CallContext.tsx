import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { getSocketInstance } from '../hooks/useSocket';
import { useAuth } from './AuthContext';

export type CallType = 'audio' | 'video' | 'screenshare';
export interface IncomingCall { from: string; fromName: string; offer: RTCSessionDescriptionInit; callType: CallType; }
export interface ServerCallSession { id: string; type: CallType; callerRole: 'boyfriend' | 'girlfriend'; calleeRole: 'boyfriend' | 'girlfriend'; status: 'ringing' | 'connecting' | 'active' | 'ended'; offer: RTCSessionDescriptionInit; answer: RTCSessionDescriptionInit | null; startedAt: number; endReason?: string; }

export interface CallContextType {
  activeCall: { type: CallType; isOutgoing: boolean; partnerName: string; status: 'calling' | 'connected' | 'ended'; } | null;
  incomingCall: IncomingCall | null;
  callSession: ServerCallSession | null;
  isAudioMuted: boolean; isVideoMuted: boolean; isScreenSharing: boolean;
  localStream: MediaStream | null; remoteStream: MediaStream | null;
  localVideoRef: React.RefObject<HTMLVideoElement>; remoteVideoRef: React.RefObject<HTMLVideoElement>;
  startCall: (type: CallType) => Promise<void>; acceptCall: (customIncomingCall?: IncomingCall) => Promise<void>;
  rejectCall: () => void; endCall: () => void; toggleMuteAudio: () => void; toggleMuteVideo: () => void;
}

const rawTurnUrls = import.meta.env.VITE_TURN_URLS;
const TURN_URLS: string[] = rawTurnUrls ? rawTurnUrls.split(',').map((u: string) => u.trim()) : [
  'turn:openrelay.metered.ca:80?transport=udp',
  'turn:openrelay.metered.ca:80?transport=tcp',
  'turn:openrelay.metered.ca:443?transport=tcp',
  'turns:openrelay.metered.ca:443?transport=tcp',
  'turn:relay.metered.ca:80?transport=udp',
  'turn:relay.metered.ca:443?transport=tcp',
];
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302',
        'stun:stun.services.mozilla.com',
        'stun:global.stun.twilio.com:3478',
      ],
    },
    {
      urls: TURN_URLS,
      username: import.meta.env.VITE_TURN_USERNAME || 'openrelayproject',
      credential: import.meta.env.VITE_TURN_CREDENTIAL || 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
};

function boostSDPBitrate(sdp: string): string {
  if (!sdp || sdp.includes('b=AS:2500')) return sdp;
  let opusPt: string | null = null;
  const lines = sdp.split('\r\n'), modified: string[] = [];
  lines.forEach(l => { const m = l.match(/^a=rtpmap:(\d+)\s+opus\/48000/i); if (m) opusPt = m[1]; });
  lines.forEach(l => {
    if (l.startsWith('m=video')) { modified.push(l, 'b=AS:2500', 'b=TIAS:2500000'); return; }
    if (opusPt && l.startsWith(`a=fmtp:${opusPt}`)) modified.push(l.includes('stereo=1') ? l : `${l};stereo=1;sprop-stereo=1;useinbandfec=1`);
    else modified.push(l);
  });
  return modified.join('\r\n');
}

function createMixedAudioTrack(stream: MediaStream): MediaStreamTrack | null {
  const audioTracks = stream.getAudioTracks();
  if (audioTracks.length === 0) return null;
  if (audioTracks.length === 1) return audioTracks[0];
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return audioTracks[0];
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const dest = ctx.createMediaStreamDestination();
    audioTracks.forEach(track => {
      try {
        const src = ctx.createMediaStreamSource(new MediaStream([track]));
        src.connect(dest);
      } catch (e) {
        console.warn('[WebRTC] Track mix connect notice:', e);
      }
    });
    const mixed = dest.stream.getAudioTracks()[0];
    return mixed || audioTracks[0];
  } catch {
    return audioTracks[0];
  }
}

async function applySenderOptimization(pc: RTCPeerConnection) {
  const videoSender = pc.getSenders().find(s => s.track?.kind === 'video');
  if (!videoSender) return;
  try {
    const params = videoSender.getParameters();
    if (!params.encodings || !params.encodings.length) params.encodings = [{}];
    params.encodings[0].maxBitrate = 2500000; params.encodings[0].maxFramerate = 60; params.encodings[0].scaleResolutionDownBy = 1.0;
    if ('degradationPreference' in params) (params as any).degradationPreference = 'maintain-framerate';
    await videoSender.setParameters(params);
  } catch (e) { console.log('[WebRTC] Sender optimization notice:', e); }
}

const CallContext = createContext<CallContextType | null>(null);

export function CallProvider({ children }: { children: ReactNode }) {
  const { partner } = useAuth();
  const myRole = partner?.role || 'boyfriend', partnerName = myRole === 'boyfriend' ? 'Seema' : 'Maulik';
  const [callSession, setCallSession] = useState<ServerCallSession | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false), [isVideoMuted, setIsVideoMuted] = useState(false), [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null), [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null), localStreamRef = useRef<MediaStream | null>(null), remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null), remoteVideoRef = useRef<HTMLVideoElement | null>(null), remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const activeCall = React.useMemo(() => {
    if (!callSession || callSession.status === 'ended') return null;
    if (callSession.status === 'ringing') return myRole === callSession.callerRole ? { type: callSession.type, isOutgoing: true, partnerName, status: 'calling' as const } : null;
    return { type: callSession.type, isOutgoing: myRole === callSession.callerRole, partnerName, status: callSession.status === 'active' ? 'connected' as const : 'calling' as const };
  }, [callSession, myRole, partnerName]);

  const incomingCall = React.useMemo<IncomingCall | null>(() => {
    return (callSession && callSession.status === 'ringing' && myRole === callSession.calleeRole)
      ? { from: callSession.callerRole, fromName: partnerName, offer: callSession.offer, callType: callSession.type } : null;
  }, [callSession, myRole, partnerName]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    let a = remoteAudioRef.current;
    if (!a) {
      a = document.createElement('audio'); a.id = 'webrtc-remote-audio-player'; a.autoplay = true; a.muted = false; a.volume = 1.0; (a as any).playsInline = true; a.style.display = 'none';
      document.body.appendChild(a); remoteAudioRef.current = a;
    }
    const unlock = () => { if (remoteAudioRef.current) { remoteAudioRef.current.muted = false; remoteAudioRef.current.volume = 1.0; if (remoteAudioRef.current.paused && remoteAudioRef.current.srcObject) remoteAudioRef.current.play().catch(() => {}); } };
    window.addEventListener('click', unlock); window.addEventListener('touchstart', unlock);
    return () => { window.removeEventListener('click', unlock); window.removeEventListener('touchstart', unlock); };
  }, []);

  // Reactive effect for remote media binding to elements whenever remoteStream or call status changes
  useEffect(() => {
    if (remoteStream) {
      remoteStream.getAudioTracks().forEach(t => { t.enabled = true; });
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream; remoteAudioRef.current.muted = false; remoteAudioRef.current.volume = 1.0;
        remoteAudioRef.current.play().catch(e => console.warn('[WebRTC Context] Audio play notice:', e));
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch(() => {});
      }
    }
  }, [remoteStream, activeCall?.status]);

  // Reactive effect for local media binding
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, activeCall?.status]);

  const cleanupCall = useCallback(() => {
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
    if (peerConnectionRef.current) { peerConnectionRef.current.close(); peerConnectionRef.current = null; }
    remoteStreamRef.current = null; pendingIceCandidatesRef.current = [];
    setLocalStream(null); setRemoteStream(null); setIsAudioMuted(false); setIsVideoMuted(false); setIsScreenSharing(false);
  }, []);

  const drainPendingIceCandidates = useCallback(async (pc: RTCPeerConnection) => {
    if (!pc || !pc.remoteDescription) return;
    const candidates = [...pendingIceCandidatesRef.current];
    pendingIceCandidatesRef.current = [];
    for (const c of candidates) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (e) { console.warn('[WebRTC] ICE candidate drain error:', e); }
    }
  }, []);

  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    const pc = new RTCPeerConnection(ICE_SERVERS), socket = getSocketInstance();
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('call_ice_candidate', { candidate: e.candidate });
        socket.emit('ice_candidate', { candidate: e.candidate, role: myRole });
      }
    };
    pc.oniceconnectionstatechange = async () => {
      console.log('[WebRTC Context] ICE Connection State:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        socket.emit('call_connected');
      } else if (pc.iceConnectionState === 'failed') {
        try {
          pc.restartIce();
          const offer = await pc.createOffer({ iceRestart: true });
          const boosted = { type: offer.type, sdp: boostSDPBitrate(offer.sdp || '') };
          await pc.setLocalDescription(boosted);
          socket.emit('call_initiate', { callType: activeCall?.type || 'video', offer: boosted });
          socket.emit('call_user', { offer: boosted, callType: activeCall?.type || 'video', role: myRole });
        } catch (e) {
          console.warn('[WebRTC] ICE restart error:', e);
        }
      }
    };
    pc.onconnectionstatechange = () => {
      console.log('[WebRTC Context] Peer Connection State:', pc.connectionState);
      if (pc.connectionState === 'connected') socket.emit('call_connected');
      else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') cleanupCall();
    };
    pc.ontrack = (e) => {
      e.track.enabled = true;
      if (!remoteStreamRef.current) remoteStreamRef.current = new MediaStream();
      if (!remoteStreamRef.current.getTracks().some(t => t.id === e.track.id)) remoteStreamRef.current.addTrack(e.track);
      if (e.streams && e.streams[0]) e.streams[0].getTracks().forEach(t => { t.enabled = true; if (!remoteStreamRef.current?.getTracks().some(x => x.id === t.id)) remoteStreamRef.current?.addTrack(t); });
      const fresh = new MediaStream(remoteStreamRef.current.getTracks());
      setRemoteStream(fresh);
    };
    peerConnectionRef.current = pc; return pc;
  }, [myRole, cleanupCall, activeCall?.type]);

  const endCall = useCallback(() => { const s = getSocketInstance(); s.emit('call_hangup'); s.emit('end_call', { role: myRole }); cleanupCall(); }, [cleanupCall, myRole]);
  const rejectCall = useCallback(() => { const s = getSocketInstance(); s.emit('call_reject'); s.emit('reject_call', { role: myRole }); }, [myRole]);

  const startCall = useCallback(async (type: CallType) => {
    cleanupCall(); const socket = getSocketInstance();
    try {
      let stream: MediaStream;
      if (type === 'screenshare') {
        try { stream = await navigator.mediaDevices.getDisplayMedia({ video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60 } }, audio: true }); }
        catch { stream = await navigator.mediaDevices.getDisplayMedia({ video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60 } } }); }
        try { const mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); mic.getAudioTracks().forEach(t => stream.addTrack(t)); } catch {}
        const mixedTrack = createMixedAudioTrack(stream);
        const videoTrack = stream.getVideoTracks()[0];
        const cleanStream = new MediaStream();
        if (videoTrack) cleanStream.addTrack(videoTrack);
        if (mixedTrack) cleanStream.addTrack(mixedTrack);
        stream = cleanStream;
        setIsScreenSharing(true);
        if (stream.getVideoTracks()[0]) stream.getVideoTracks()[0].onended = () => endCall();
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: type === 'video' ? { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60 } } : false });
      }
      localStreamRef.current = stream; setLocalStream(stream);
      const pc = createPeerConnection(); stream.getTracks().forEach(t => pc.addTrack(t, stream));
      const offer = await pc.createOffer(), boosted = { type: offer.type, sdp: boostSDPBitrate(offer.sdp || '') };
      await pc.setLocalDescription(boosted); await applySenderOptimization(pc);
      socket.emit('identify', { role: myRole }); socket.emit('call_initiate', { callType: type, offer: boosted }); socket.emit('call_user', { offer: boosted, callType: type, role: myRole });
    } catch (err) { console.error('[WebRTC Context] Failed to start call:', err); cleanupCall(); }
  }, [cleanupCall, createPeerConnection, myRole, endCall]);

  const acceptCall = useCallback(async (customCall?: IncomingCall) => {
    if (callSession?.status === 'connecting' || callSession?.status === 'active') return;
    const offerToUse = customCall?.offer || callSession?.offer, callTypeToUse = customCall?.callType || callSession?.type || 'video';
    if (!offerToUse) return;
    const socket = getSocketInstance();
    try {
      let stream: MediaStream | null = null;
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: callTypeToUse === 'video' ? { width: { ideal: 1920 }, height: { ideal: 1080 } } : false }); } catch {}
      if (stream) { localStreamRef.current = stream; setLocalStream(stream); }
      const pc = createPeerConnection(); if (stream) stream.getTracks().forEach(t => pc.addTrack(t, stream!));
      const boostedOffer = { type: offerToUse.type, sdp: boostSDPBitrate(offerToUse.sdp || '') };
      await pc.setRemoteDescription(new RTCSessionDescription(boostedOffer));
      await drainPendingIceCandidates(pc);
      const answer = await pc.createAnswer(), boostedAnswer = { type: answer.type, sdp: boostSDPBitrate(answer.sdp || '') };
      await pc.setLocalDescription(boostedAnswer); await applySenderOptimization(pc);
      socket.emit('identify', { role: myRole }); socket.emit('call_accept', { answer: boostedAnswer }); socket.emit('answer_call', { answer: boostedAnswer, role: myRole });
    } catch (err) { console.error('[WebRTC Context] Failed to accept call:', err); cleanupCall(); }
  }, [callSession, cleanupCall, createPeerConnection, myRole, drainPendingIceCandidates]);

  const toggleMuteAudio = useCallback(() => {
    if (localStreamRef.current) {
      const tracks = localStreamRef.current.getAudioTracks();
      if (tracks.length > 0) { const next = !tracks[0].enabled; tracks.forEach(t => t.enabled = next); setIsAudioMuted(!next); }
    }
  }, []);

  const toggleMuteVideo = useCallback(() => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) { track.enabled = !track.enabled; setIsVideoMuted(!track.enabled); }
    }
  }, []);

  useEffect(() => {
    const socket = getSocketInstance(); if (myRole) socket.emit('identify', { role: myRole });
    
    const handleAnswerSDP = async (answer: RTCSessionDescriptionInit) => {
      const pc = peerConnectionRef.current;
      if (pc && !pc.remoteDescription) {
        const boosted = { type: answer.type, sdp: boostSDPBitrate(answer.sdp || '') };
        await pc.setRemoteDescription(new RTCSessionDescription(boosted)).catch(e => console.error(e));
        await applySenderOptimization(pc);
        await drainPendingIceCandidates(pc);
      }
    };

    const handleCallState = async (session: ServerCallSession | null) => {
      setCallSession(session);
      if (!session || session.status === 'ended') { cleanupCall(); return; }
      if (session.status === 'connecting' && myRole === session.callerRole && session.answer) {
        await handleAnswerSDP(session.answer);
      }
    };

    const handleCallAccepted = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      if (answer) await handleAnswerSDP(answer);
    };

    const handleIce = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (!candidate) return;
      const pc = peerConnectionRef.current;
      if (pc && pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.warn(e));
      } else {
        pendingIceCandidatesRef.current.push(candidate);
      }
    };

    socket.on('call_state', handleCallState);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_accept', handleCallAccepted);
    socket.on('call_ice_candidate', handleIce);
    socket.on('ice_candidate', handleIce);
    socket.on('call_rejected', cleanupCall);
    socket.on('end_call', cleanupCall);
    socket.on('call_hangup', cleanupCall);

    return () => {
      socket.off('call_state', handleCallState);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('call_accept', handleCallAccepted);
      socket.off('call_ice_candidate', handleIce);
      socket.off('ice_candidate', handleIce);
      socket.off('call_rejected', cleanupCall);
      socket.off('end_call', cleanupCall);
      socket.off('call_hangup', cleanupCall);
    };
  }, [cleanupCall, myRole, drainPendingIceCandidates]);

  return (
    <CallContext.Provider value={{ activeCall, incomingCall, callSession, isAudioMuted, isVideoMuted, isScreenSharing, localStream, remoteStream, localVideoRef, remoteVideoRef, startCall, acceptCall, rejectCall, endCall, toggleMuteAudio, toggleMuteVideo }}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() { const ctx = useContext(CallContext); if (!ctx) throw new Error('useCall must be inside CallProvider'); return ctx; }
