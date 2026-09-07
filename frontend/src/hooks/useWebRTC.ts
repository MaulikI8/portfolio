import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocketInstance } from './useSocket';

export type CallType = 'audio' | 'video' | 'screenshare';
export interface IncomingCall { from: string; fromName: string; offer: RTCSessionDescriptionInit; callType: CallType; }

const rawTurnUrls = import.meta.env.VITE_TURN_URLS;
const TURN_URLS: string[] = rawTurnUrls ? rawTurnUrls.split(',').map((u: string) => u.trim()) : [
  'turn:openrelay.metered.ca:80?transport=udp',
  'turn:openrelay.metered.ca:80?transport=tcp',
  'turn:openrelay.metered.ca:443?transport=tcp',
  'turns:openrelay.metered.ca:443?transport=tcp',
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
        'stun:global.stun.twilio.com:3478'
      ]
    },
    {
      urls: TURN_URLS,
      username: import.meta.env.VITE_TURN_USERNAME || 'openrelayproject',
      credential: import.meta.env.VITE_TURN_CREDENTIAL || 'openrelayproject'
    }
  ],
  iceCandidatePoolSize: 10,
};

function boostSDPBitrate(sdp: string): string {
  if (!sdp || sdp.includes('b=AS:8000')) return sdp;
  let opusPt: string | null = null;
  const lines = sdp.split('\r\n'), modified: string[] = [];
  lines.forEach(l => { const m = l.match(/^a=rtpmap:(\d+)\s+opus\/48000/i); if (m) opusPt = m[1]; });
  let inVideo = false;
  lines.forEach(l => {
    if (l.startsWith('m=video')) { inVideo = true; modified.push(l, 'b=AS:8000', 'b=TIAS:8000000'); return; }
    if (l.startsWith('m=')) inVideo = false;
    if (opusPt && l.startsWith(`a=fmtp:${opusPt}`)) modified.push(l.includes('stereo=1') ? l : `${l};stereo=1;sprop-stereo=1;maxaveragebitrate=128000;useinbandfec=1`);
    else if (inVideo && l.startsWith('a=fmtp:')) modified.push(`${l};x-google-min-bitrate=300;x-google-start-bitrate=2500;x-google-max-bitrate=8000`);
    else modified.push(l);
  });
  return modified.join('\r\n');
}

async function applySenderOptimization(pc: RTCPeerConnection) {
  const videoSender = pc.getSenders().find(s => s.track?.kind === 'video');
  if (!videoSender) return;
  try {
    const params = videoSender.getParameters();
    if (!params.encodings || !params.encodings.length) params.encodings = [{}];
    params.encodings[0].maxBitrate = 8000000; params.encodings[0].maxFramerate = 60; params.encodings[0].scaleResolutionDownBy = 1.0;
    if ('degradationPreference' in params) (params as any).degradationPreference = 'maintain-framerate';
    await videoSender.setParameters(params);
  } catch (e) { console.log('[WebRTC] Sender optimization notice:', e); }
}

export function useWebRTC(myRole: string) {
  const [activeCall, setActiveCall] = useState<{ type: CallType; isOutgoing: boolean; partnerName: string; status: 'calling' | 'connected' | 'ended'; } | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false), [isVideoMuted, setIsVideoMuted] = useState(false), [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null), [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null), localStreamRef = useRef<MediaStream | null>(null), remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null), remoteVideoRef = useRef<HTMLVideoElement | null>(null), remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const partnerName = myRole === 'boyfriend' ? 'Seema' : 'Maulik';

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

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteStream.getAudioTracks().forEach(t => t.enabled = true);
      remoteAudioRef.current.srcObject = remoteStream; remoteAudioRef.current.muted = false; remoteAudioRef.current.volume = 1.0;
      remoteAudioRef.current.play().catch(e => console.warn('[WebRTC] Dedicated remote audio error:', e));
    }
  }, [remoteStream]);

  const cleanupCall = useCallback(() => {
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
    if (peerConnectionRef.current) { peerConnectionRef.current.close(); peerConnectionRef.current = null; }
    remoteStreamRef.current = null; pendingIceCandidatesRef.current = [];
    setLocalStream(null); setRemoteStream(null); setActiveCall(null); setIncomingCall(null); setIsAudioMuted(false); setIsVideoMuted(false); setIsScreenSharing(false);
  }, []);

  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    const pc = new RTCPeerConnection(ICE_SERVERS), socket = getSocketInstance();
    pc.onicecandidate = (e) => { if (e.candidate) socket.emit('ice_candidate', { candidate: e.candidate, role: myRole }); };
    pc.ontrack = (e) => {
      e.track.enabled = true;
      if (!remoteStreamRef.current) remoteStreamRef.current = new MediaStream();
      if (!remoteStreamRef.current.getTracks().some(t => t.id === e.track.id)) remoteStreamRef.current.addTrack(e.track);
      if (e.streams && e.streams[0]) e.streams[0].getTracks().forEach(t => { t.enabled = true; if (!remoteStreamRef.current?.getTracks().some(x => x.id === t.id)) remoteStreamRef.current?.addTrack(t); });
      const fresh = new MediaStream(remoteStreamRef.current.getTracks());
      setRemoteStream(fresh);
      if (remoteVideoRef.current) { remoteVideoRef.current.srcObject = fresh; remoteVideoRef.current.play().catch(() => {}); }
      if (remoteAudioRef.current) { remoteAudioRef.current.srcObject = fresh; remoteAudioRef.current.muted = false; remoteAudioRef.current.volume = 1.0; remoteAudioRef.current.play().catch(() => {}); }
    };
    peerConnectionRef.current = pc; return pc;
  }, [myRole]);

  const endCall = useCallback(() => { getSocketInstance().emit('end_call', { role: myRole }); cleanupCall(); }, [cleanupCall, myRole]);
  const rejectCall = useCallback(() => { getSocketInstance().emit('reject_call', { role: myRole }); setIncomingCall(null); }, [myRole]);

  const startCall = useCallback(async (type: CallType) => {
    cleanupCall(); const socket = getSocketInstance();
    try {
      let stream: MediaStream;
      if (type === 'screenshare') {
        try { stream = await navigator.mediaDevices.getDisplayMedia({ video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60 } }, audio: true }); }
        catch { stream = await navigator.mediaDevices.getDisplayMedia({ video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60 } } }); }
        try { const mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); mic.getAudioTracks().forEach(t => stream.addTrack(t)); } catch {}
        setIsScreenSharing(true);
        if (stream.getVideoTracks()[0]) stream.getVideoTracks()[0].onended = () => endCall();
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: type === 'video' ? { width: { ideal: 1920 }, height: { ideal: 1080 } } : false });
      }
      localStreamRef.current = stream; setLocalStream(stream);
      if (localVideoRef.current) { localVideoRef.current.srcObject = stream; localVideoRef.current.play().catch(() => {}); }
      const pc = createPeerConnection(); stream.getTracks().forEach(t => pc.addTrack(t, stream));
      const offer = await pc.createOffer(), boostedOffer = { type: offer.type, sdp: boostSDPBitrate(offer.sdp || '') };
      await pc.setLocalDescription(boostedOffer); await applySenderOptimization(pc);
      setActiveCall({ type, isOutgoing: true, partnerName, status: 'calling' });
      socket.emit('identify', { role: myRole }); socket.emit('call_user', { offer: boostedOffer, callType: type, role: myRole });
    } catch (err) { console.error('Failed to start call:', err); cleanupCall(); }
  }, [cleanupCall, createPeerConnection, partnerName, myRole, endCall]);

  const acceptCall = useCallback(async (customIncomingCall?: IncomingCall) => {
    const targetCall = customIncomingCall || incomingCall; if (!targetCall) return;
    const socket = getSocketInstance();
    try {
      let stream: MediaStream | null = null;
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: targetCall.callType === 'video' ? { width: { ideal: 1920 }, height: { ideal: 1080 } } : false }); } catch {}
      if (stream) { localStreamRef.current = stream; setLocalStream(stream); if (localVideoRef.current) { localVideoRef.current.srcObject = stream; localVideoRef.current.play().catch(() => {}); } }
      const pc = createPeerConnection(); if (stream) stream.getTracks().forEach(t => pc.addTrack(t, stream!));
      const boostedOffer = { type: targetCall.offer.type, sdp: boostSDPBitrate(targetCall.offer.sdp || '') };
      await pc.setRemoteDescription(new RTCSessionDescription(boostedOffer));
      for (const candidate of pendingIceCandidatesRef.current) await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      pendingIceCandidatesRef.current = [];
      const answer = await pc.createAnswer(), boostedAnswer = { type: answer.type, sdp: boostSDPBitrate(answer.sdp || '') };
      await pc.setLocalDescription(boostedAnswer); await applySenderOptimization(pc);
      setActiveCall({ type: targetCall.callType, isOutgoing: false, partnerName: targetCall.fromName, status: 'connected' }); setIncomingCall(null);
      socket.emit('identify', { role: myRole }); socket.emit('answer_call', { answer: boostedAnswer, role: myRole });
    } catch (err) { console.error('Failed to accept call:', err); cleanupCall(); }
  }, [incomingCall, cleanupCall, createPeerConnection, myRole]);

  const toggleMuteAudio = useCallback(() => {
    if (localStreamRef.current) { const t = localStreamRef.current.getAudioTracks(); if (t.length) { const next = !t[0].enabled; t.forEach(x => x.enabled = next); setIsAudioMuted(!next); } }
  }, []);

  const toggleMuteVideo = useCallback(() => {
    if (localStreamRef.current) { const v = localStreamRef.current.getVideoTracks()[0]; if (v) { v.enabled = !v.enabled; setIsVideoMuted(!v.enabled); } }
  }, []);

  useEffect(() => {
    const socket = getSocketInstance(); if (myRole) socket.emit('identify', { role: myRole });
    const handleIncomingCall = (data: IncomingCall) => setIncomingCall(data);
    const handleCallAccepted = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      if (peerConnectionRef.current) {
        const boosted = { type: answer.type, sdp: boostSDPBitrate(answer.sdp || '') };
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(boosted));
        await applySenderOptimization(peerConnectionRef.current);
        for (const candidate of pendingIceCandidatesRef.current) await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        pendingIceCandidatesRef.current = []; setActiveCall(p => p ? { ...p, status: 'connected' } : null);
      }
    };
    const handleIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (!candidate) return;
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      } else {
        pendingIceCandidatesRef.current.push(candidate);
      }
    };
    socket.on('incoming_call', handleIncomingCall); socket.on('call_accepted', handleCallAccepted); socket.on('call_rejected', cleanupCall); socket.on('ice_candidate', handleIceCandidate); socket.on('end_call', cleanupCall);
    return () => { socket.off('incoming_call', handleIncomingCall); socket.off('call_accepted', handleCallAccepted); socket.off('call_rejected', cleanupCall); socket.off('ice_candidate', handleIceCandidate); socket.off('end_call', cleanupCall); };
  }, [cleanupCall, myRole]);

  return { activeCall, incomingCall, isAudioMuted, isVideoMuted, isScreenSharing, localStream, remoteStream, localVideoRef, remoteVideoRef, startCall, acceptCall, rejectCall, endCall, toggleMuteAudio, toggleMuteVideo };
}


