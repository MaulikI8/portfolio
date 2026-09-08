import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { getSocketInstance } from '../hooks/useSocket';
import { useAuth } from './AuthContext';
import api from '../api/client';

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
  toggleScreenShare: () => Promise<void>;
}

function logDebug(step: string, details: string, expectedNext: string, mustNotHappen: string) {
  console.log(
    `%c[WebRTC Debug] ${step}\n` +
    `%c  Details: ${details}\n` +
    `%c  ✅ SHOULD HAPPEN NEXT: ${expectedNext}\n` +
    `%c  ❌ MUST NOT HAPPEN: ${mustNotHappen}`,
    'color: #00e676; font-weight: bold; font-size: 12px;',
    'color: #e0e0e0; font-size: 11px;',
    'color: #00b0ff; font-weight: bold; font-size: 11px;',
    'color: #ff5252; font-weight: bold; font-size: 11px;'
  );
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
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    ...TURN_URLS.map(url => ({
      urls: url,
      username: import.meta.env.VITE_TURN_USERNAME || 'openrelayproject',
      credential: import.meta.env.VITE_TURN_CREDENTIAL || 'openrelayproject',
    })),
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
};

const HIGH_QUALITY_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: { ideal: true },
  noiseSuppression: { ideal: true },
  autoGainControl: { ideal: true },
  channelCount: { ideal: 2 },
  sampleRate: { ideal: 48000 },
  sampleSize: { ideal: 16 },
  googEchoCancellation: true,
  googAutoGainControl: true,
  googNoiseSuppression: true,
  googHighpassFilter: true,
  googTypingNoiseDetection: true,
  googAudioMirroring: false,
} as any;

function optimizeAudioSDP(sdp: string): string {
  if (!sdp) return sdp;
  return sdp.replace(/a=fmtp:(\d+)\s+(.+)/g, (match, pt, fmtp) => {
    if (fmtp.includes('maxplaybackrate') || fmtp.includes('useinbandfec') || fmtp.includes('stereo') || match.toLowerCase().includes('opus')) {
      let newFmtp = fmtp;
      if (!newFmtp.includes('stereo=')) newFmtp += ';stereo=1';
      if (!newFmtp.includes('sprop-stereo=')) newFmtp += ';sprop-stereo=1';
      if (!newFmtp.includes('maxaveragebitrate=')) newFmtp += ';maxaveragebitrate=510000';
      if (!newFmtp.includes('useinbandfec=')) newFmtp += ';useinbandfec=1';
      if (!newFmtp.includes('usedtx=')) newFmtp += ';usedtx=0';
      if (!newFmtp.includes('minptime=')) newFmtp += ';minptime=10';
      if (!newFmtp.includes('maxplaybackrate=')) newFmtp += ';maxplaybackrate=48000;sprop-maxcapturerate=48000';
      return `a=fmtp:${pt} ${newFmtp}`;
    }
    return match;
  });
}

async function applySenderOptimization(pc: RTCPeerConnection) {
  const audioSender = pc.getSenders().find(s => s.track?.kind === 'audio');
  if (audioSender) {
    try {
      const params = audioSender.getParameters();
      if (!params.encodings || !params.encodings.length) params.encodings = [{}];
      params.encodings[0].maxBitrate = 510000;
      if ('degradationPreference' in params) (params as any).degradationPreference = 'maintain-framerate';
      await audioSender.setParameters(params);
      console.log('[WebRTC] Studio HD Audio Sender Optimization applied (510 kbps Opus).');
    } catch (e) {
      console.log('[WebRTC] Audio Sender optimization notice:', e);
    }
  }

  const videoSender = pc.getSenders().find(s => s.track?.kind === 'video');
  if (videoSender) {
    try {
      const params = videoSender.getParameters();
      if (!params.encodings || !params.encodings.length) params.encodings = [{}];
      params.encodings[0].maxBitrate = 3500000;
      params.encodings[0].maxFramerate = 60;
      params.encodings[0].scaleResolutionDownBy = 1.0;
      if ('degradationPreference' in params) (params as any).degradationPreference = 'maintain-framerate';
      await videoSender.setParameters(params);
      console.log('[WebRTC] HD Video Sender Optimization applied (3.5 Mbps 60fps).');
    } catch (e) {
      console.log('[WebRTC] Video Sender optimization notice:', e);
    }
  }
}

const CallContext = createContext<CallContextType | null>(null);

export function CallProvider({ children }: { children: ReactNode }) {
  const { partner } = useAuth();
  const savedRole = (typeof window !== 'undefined' ? (sessionStorage.getItem('icecream_local_role') || localStorage.getItem('icecream_local_role')) : null) as 'boyfriend' | 'girlfriend' | null;
  const myRole = partner?.role || savedRole || 'boyfriend', partnerName = myRole === 'boyfriend' ? 'Seema' : 'Maulik';
  const [callSession, setCallSession] = useState<ServerCallSession | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false), [isVideoMuted, setIsVideoMuted] = useState(false), [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null), [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null), localStreamRef = useRef<MediaStream | null>(null), remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null), remoteVideoRef = useRef<HTMLVideoElement | null>(null), remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const currentCallTypeRef = useRef<CallType>('video');
  const isStartingRef = useRef(false);
  const isAcceptingRef = useRef(false);
  const iceFailureCountRef = useRef(0);
  const lastIceFailureTimeRef = useRef(0);
  const gatheredCandidateTypesRef = useRef<{ host: number; srflx: number; prflx: number; relay: number }>({ host: 0, srflx: 0, prflx: 0, relay: 0 });
  const callSessionRef = useRef<ServerCallSession | null>(null);

  useEffect(() => {
    callSessionRef.current = callSession;
  }, [callSession]);

  // Single Source of Truth: Derived completely from server's callSession broadcast
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
    const unlock = () => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.muted = false; remoteAudioRef.current.volume = 1.0;
        if (remoteAudioRef.current.paused && remoteAudioRef.current.srcObject) remoteAudioRef.current.play().catch(() => {});
      }
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
        if (remoteVideoRef.current.paused) remoteVideoRef.current.play().catch(() => {});
      }
    };
    window.addEventListener('click', unlock); window.addEventListener('touchstart', unlock);
    return () => { window.removeEventListener('click', unlock); window.removeEventListener('touchstart', unlock); };
  }, []);

  // Reactive effect for remote media binding whenever remoteStream or activeCall changes
  useEffect(() => {
    if (remoteStream) {
      remoteStream.getAudioTracks().forEach(t => { t.enabled = true; });
      remoteStream.getVideoTracks().forEach(t => { t.enabled = true; });
      if (remoteAudioRef.current) {
        if (remoteAudioRef.current.srcObject !== remoteStream) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.volume = 1.0;
        if (remoteAudioRef.current.paused) {
          remoteAudioRef.current.play().catch(e => console.warn('[WebRTC Context] Audio play notice:', e));
        }
      }
      if (remoteVideoRef.current) {
        if (remoteVideoRef.current.srcObject !== remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        if (remoteVideoRef.current.paused) {
          remoteVideoRef.current.play().catch(() => {});
        }
      }
    }
  }, [remoteStream, activeCall?.status]);

  // Reactive effect for local media binding
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localStream.getVideoTracks().forEach(t => { t.enabled = true; });
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, activeCall?.status]);

  const cleanupCall = useCallback(() => {
    logDebug('Cleaning Up Call Session', 'Stopping media tracks and closing RTCPeerConnection.', 'Local and remote state reset to null.', 'Memory leak or orphan peer connection.');
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => {
        try { t.stop(); t.enabled = false; } catch {}
      });
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(t => {
        try { t.stop(); t.enabled = false; } catch {}
      });
      remoteStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.getSenders().forEach(s => {
          if (s.track) { try { s.track.stop(); s.track.enabled = false; } catch {} }
        });
        peerConnectionRef.current.getReceivers().forEach(r => {
          if (r.track) { try { r.track.stop(); r.track.enabled = false; } catch {} }
        });
        peerConnectionRef.current.close();
      } catch {}
      peerConnectionRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) {
      try { remoteAudioRef.current.pause(); } catch {}
      remoteAudioRef.current.srcObject = null;
    }
    pendingIceCandidatesRef.current = [];
    isStartingRef.current = false;
    isAcceptingRef.current = false;
    iceFailureCountRef.current = 0;
    lastIceFailureTimeRef.current = 0;
    setLocalStream(null);
    setRemoteStream(null);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    setIsScreenSharing(false);
  }, []);

  const addCandidateToPC = useCallback(async (pc: RTCPeerConnection, cand: RTCIceCandidateInit) => {
    if (!cand) return;
    try {
      await pc.addIceCandidate(new RTCIceCandidate(cand));
    } catch (e) {
      console.warn('[WebRTC] ICE Candidate add notice:', e);
    }
  }, []);

  const drainPendingIceCandidates = useCallback(async (pc: RTCPeerConnection) => {
    if (!pc || !pc.remoteDescription) return;
    const candidates = [...pendingIceCandidatesRef.current];
    pendingIceCandidatesRef.current = [];
    logDebug('Draining Pending ICE Candidates', `Processing ${candidates.length} queued ICE candidates...`, 'Candidates added to peer connection successfully.', 'Failed candidates or missing remote description.');
    for (const c of candidates) {
      await addCandidateToPC(pc, c);
    }
  }, [addCandidateToPC]);

  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    logDebug('Creating RTCPeerConnection', 'Initializing WebRTC Peer Connection with STUN/TURN servers.', 'Gathering ICE candidates & listening for remote tracks.', 'PeerConnection failed to initialize.');
    const pc = new RTCPeerConnection(ICE_SERVERS), socket = getSocketInstance();
    console.log('[WebRTC Configured ICE Servers]:', pc.getConfiguration().iceServers);
    gatheredCandidateTypesRef.current = { host: 0, srflx: 0, prflx: 0, relay: 0 };

    setTimeout(() => {
      if (peerConnectionRef.current === pc) {
        console.log('[WebRTC Candidate Summary (5s)] Gathered:', gatheredCandidateTypesRef.current);
      }
    }, 5000);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        const type = (e.candidate.type || 'unknown') as keyof typeof gatheredCandidateTypesRef.current;
        if (gatheredCandidateTypesRef.current[type] !== undefined) {
          gatheredCandidateTypesRef.current[type]++;
        }
        console.log(`[WebRTC Candidate] 📡 New candidate gathered (${e.candidate.protocol} ${e.candidate.type}):`, e.candidate.candidate);
        socket.emit('call_ice_candidate', { candidate: e.candidate, role: myRole });
      }
    };
    pc.oniceconnectionstatechange = async () => {
      logDebug(
        `ICE Connection State Change: ${pc.iceConnectionState.toUpperCase()}`,
        `Current connection status: '${pc.iceConnectionState}'`,
        pc.iceConnectionState === 'connected' ? '🎉 CONNECTION ESTABLISHED! Media flowing live.' : pc.iceConnectionState === 'checking' ? '⏳ Testing NAT/relay candidate pairs between devices...' : 'Transition to connected or restart.',
        pc.iceConnectionState === 'failed' ? '❌ ICE Connection Failed across networks!' : 'Stuck in checking forever.'
      );
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        socket.emit('call_connected');
      } else if (pc.iceConnectionState === 'failed') {
        const now = Date.now();
        if (now - lastIceFailureTimeRef.current < 15000) {
          iceFailureCountRef.current += 1;
        } else {
          iceFailureCountRef.current = 1;
        }
        lastIceFailureTimeRef.current = now;

        if (iceFailureCountRef.current > 3) {
          console.warn('[WebRTC] ICE failure loop detected (>3 failures within 15s). Aborting renegotiation and ending call.');
          endCall();
          return;
        }

        try {
          logDebug('Triggering Lightweight ICE Restart', 'ICE Connection failed, creating renegotiation offer...', 'Lightweight renegotiation offer sent to partner.', 'Session status untouched.');
          pc.restartIce();
          const offer = await pc.createOffer({ iceRestart: true });
          await pc.setLocalDescription(offer);
          socket.emit('call_renegotiate', { offer, role: myRole });
        } catch (e) {
          console.warn('[WebRTC] ICE restart error:', e);
        }
      }
    };
    pc.onconnectionstatechange = () => {
      console.log('[WebRTC Context] Peer Connection State:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        socket.emit('call_connected');
      } else if (pc.connectionState === 'failed') {
        console.warn('[WebRTC Context] Peer Connection state: failed. Deferring recovery to ICE renegotiation.');
      } else if (pc.connectionState === 'closed') {
        endCall();
      }
    };
    pc.ontrack = (e) => {
      logDebug(
        'Remote Media Track Received',
        `Kind: ${e.track.kind}, ID: ${e.track.id}, ReadyState: ${e.track.readyState}`,
        'Track added to remoteStream and rendered on screen.',
        'Track muted or not bound to video element.'
      );
      e.track.enabled = true;
      let streamToUse = (e.streams && e.streams[0]) ? e.streams[0] : remoteStreamRef.current;
      if (!streamToUse) streamToUse = new MediaStream();
      if (!streamToUse.getTracks().some(t => t.id === e.track.id)) {
        streamToUse.addTrack(e.track);
      }
      remoteStreamRef.current = streamToUse;
      setRemoteStream(new MediaStream(streamToUse.getTracks()));
    };
    peerConnectionRef.current = pc; return pc;
  }, [myRole, cleanupCall]);

  const endCall = useCallback(() => { logDebug('Ending Call', 'Emitting call_hangup to server...', 'Server clears callSession and resets both clients.', 'Session hanging on server.'); const s = getSocketInstance(); s.emit('call_hangup', { role: myRole }); cleanupCall(); }, [cleanupCall, myRole]);
  const rejectCall = useCallback(() => { logDebug('Rejecting Call', 'Emitting call_reject to server...', 'Server sets callSession status to ended.', 'Call continuing to ring.'); const s = getSocketInstance(); s.emit('call_reject', { role: myRole }); }, [myRole]);

  const startCall = useCallback(async (type: CallType) => {
    if (isStartingRef.current) {
      logDebug('Call Start Blocked', 'startCall already in progress, ignoring duplicate trigger.', 'Proceed with single media request.', 'Duplicate getDisplayMedia or getUserMedia prompt.');
      return;
    }
    isStartingRef.current = true;
    logDebug('STEP 1: Starting Call Request', `Call type: '${type}'. Cleaning up previous session...`, 'Browser displays permission/selection prompt EXACTLY ONCE.', 'Prompting twice or throwing NotAllowedError.');
    cleanupCall(); const socket = getSocketInstance(); currentCallTypeRef.current = type;
    try {
      let stream: MediaStream;
      if (type === 'screenshare') {
        let displayStream: MediaStream;
        try {
          logDebug('STEP 2: Requesting Display Media', 'Executing navigator.mediaDevices.getDisplayMedia...', 'User selects tab/screen and clicks Share.', 'Prompting twice or throwing error.');
          displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
            audio: true
          });
        } catch (err: any) {
          console.warn('[WebRTC] Standard getDisplayMedia with audio failed, retrying video only...', err);
          try {
            displayStream = await navigator.mediaDevices.getDisplayMedia({
              video: true,
              audio: false
            });
          } catch (err2: any) {
            logDebug('Screen Share Selection Cancelled/Failed', `Error name: ${err2?.name || 'Unknown'}, message: ${err2?.message || ''}`, 'Clean abort without triggering second prompt.', 'Opening second prompt after user cancelled.');
            endCall();
            return;
          }
        }

        stream = displayStream;
        setIsScreenSharing(true);
        if (stream.getVideoTracks()[0]) stream.getVideoTracks()[0].onended = () => endCall();
      } else if (type === 'video') {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: HIGH_QUALITY_AUDIO_CONSTRAINTS,
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }
          });
        } catch (e) {
          console.warn('[WebRTC] Standard video getUserMedia failed, trying fallback video...', e);
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: HIGH_QUALITY_AUDIO_CONSTRAINTS, video: true });
          } catch (err) {
            console.warn('[WebRTC] Video getUserMedia failed completely, falling back to audio only...', err);
            stream = await navigator.mediaDevices.getUserMedia({ audio: HIGH_QUALITY_AUDIO_CONSTRAINTS, video: false });
          }
        }
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: HIGH_QUALITY_AUDIO_CONSTRAINTS,
          video: false
        });
      }
      localStreamRef.current = stream; setLocalStream(stream);
      logDebug('STEP 3: Creating Local Offer', `Captured ${stream.getTracks().length} local tracks. Creating SDP offer...`, 'Offer created, set as local description, and sent to server.', 'SDP creation failure.');
      const pc = createPeerConnection(); stream.getTracks().forEach(t => pc.addTrack(t, stream));
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      const hdOfferSDP = optimizeAudioSDP(offer.sdp || '');
      const finalOffer = new RTCSessionDescription({ type: offer.type, sdp: hdOfferSDP });
      await pc.setLocalDescription(finalOffer); await applySenderOptimization(pc);
      logDebug('STEP 4: Emitting Offer to Server', `Sending call_initiate offer to server for ${myRole}...`, 'Server broadcasts call_state ringing to partner.', 'Server dropping call_initiate.');
      socket.emit('call_initiate', { callType: type, offer: finalOffer, role: myRole });
    } catch (err: any) {
      logDebug('Failed to Start Call', `Error: ${err?.message || err}`, 'Call cleaned up safely.', 'Uncaught exception.');
      endCall();
    } finally {
      isStartingRef.current = false;
    }
  }, [cleanupCall, createPeerConnection, myRole, endCall]);

  const acceptCall = useCallback(async (customCall?: IncomingCall) => {
    if (isAcceptingRef.current || callSessionRef.current?.status === 'connecting' || callSessionRef.current?.status === 'active') return;
    const currentSess = callSessionRef.current;
    const offerToUse = customCall?.offer || currentSess?.offer;
    const callTypeToUse = customCall?.callType || currentSess?.type || 'video';
    if (!offerToUse) return;
    isAcceptingRef.current = true;
    currentCallTypeRef.current = callTypeToUse;
    logDebug('STEP 1 (Callee): Accepting Incoming Call', `Accepting call type '${callTypeToUse}' from offer...`, 'Local media captured, remote offer set, SDP answer created.', 'Duplicate acceptCall execution.');
    const socket = getSocketInstance();
    try {
      let stream: MediaStream | null = null;
      try {
        if (callTypeToUse === 'video') {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: HIGH_QUALITY_AUDIO_CONSTRAINTS,
              video: { width: { ideal: 1280 }, height: { ideal: 720 } }
            });
          } catch {
            stream = await navigator.mediaDevices.getUserMedia({ audio: HIGH_QUALITY_AUDIO_CONSTRAINTS, video: true });
          }
        } else {
          stream = await navigator.mediaDevices.getUserMedia({ audio: HIGH_QUALITY_AUDIO_CONSTRAINTS, video: false });
        }
      } catch (e) {
        console.warn('[WebRTC] Callee getUserMedia fallback notice:', e);
      }
      const pc = createPeerConnection();
      if (stream) {
        localStreamRef.current = stream;
        setLocalStream(stream);
        stream.getTracks().forEach(t => pc.addTrack(t, stream!));
      }
      logDebug('STEP 2 (Callee): Setting Remote Offer & Creating Answer', 'Setting remote SDP description from caller offer...', 'Answer set as local description and emitted to server.', 'Remote description rejection.');
      await pc.setRemoteDescription(new RTCSessionDescription(offerToUse));
      await drainPendingIceCandidates(pc);
      
      const activeSess = callSessionRef.current;
      if (activeSess?.callerCandidates && Array.isArray(activeSess.callerCandidates)) {
        for (const cand of activeSess.callerCandidates) {
          await addCandidateToPC(pc, cand);
        }
      }
      const answer = await pc.createAnswer();
      const hdAnswerSDP = optimizeAudioSDP(answer.sdp || '');
      const finalAnswer = new RTCSessionDescription({ type: answer.type, sdp: hdAnswerSDP });
      await pc.setLocalDescription(finalAnswer); await applySenderOptimization(pc);
      logDebug('STEP 3 (Callee): Emitting Answer to Server', 'Sending call_accept answer to server...', 'Caller receives answer and ICE candidate verification begins.', 'Server dropping answer.');
      socket.emit('call_accept', { answer: finalAnswer, role: myRole });
    } catch (err) {
      logDebug('Failed to Accept Call', `Error: ${err}`, 'Call cleaned up safely.', 'Uncaught exception.');
      rejectCall();
    } finally {
      isAcceptingRef.current = false;
    }
  }, [cleanupCall, createPeerConnection, myRole, drainPendingIceCandidates, addCandidateToPC, rejectCall]);

  const toggleMuteAudio = useCallback(() => {
    if (localStreamRef.current) {
      const tracks = localStreamRef.current.getAudioTracks();
      if (tracks.length > 0) {
        const nextState = !tracks[0].enabled;
        tracks.forEach(t => t.enabled = nextState);
        const isMuted = !nextState;
        setIsAudioMuted(isMuted);
        getSocketInstance().emit('toggle_mute', { role: myRole, isMuted });
      }
    }
  }, [myRole]);

  const toggleMuteVideo = useCallback(() => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) { track.enabled = !track.enabled; setIsVideoMuted(!track.enabled); }
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      logDebug('Stopping Screen Share', 'Stopping active screen share track...', 'Restoring default stream.', 'Track error.');
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(t => {
          try { t.stop(); } catch {}
        });
      }
      setIsScreenSharing(false);
      if (peerConnectionRef.current) {
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          try { await sender.replaceTrack(null); } catch {}
        }
      }
      getSocketInstance().emit('call_type_change', { role: myRole, type: 'video' });
    } else {
      logDebug('Initiating Screen Share', 'Prompting getDisplayMedia...', 'Screen share track attached to peer connection.', 'User cancelled picker.');
      try {
        let displayStream: MediaStream;
        try {
          displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
            audio: true
          });
        } catch (e) {
          displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        }

        const screenTrack = displayStream.getVideoTracks()[0];
        if (!screenTrack) return;

        screenTrack.onended = () => {
          console.log('[WebRTC Context] Screen share ended via browser bar.');
          setIsScreenSharing(false);
          getSocketInstance().emit('call_type_change', { role: myRole, type: 'video' });
        };

        setIsScreenSharing(true);

        const currentAudio = localStreamRef.current ? localStreamRef.current.getAudioTracks() : [];
        const newStream = new MediaStream([...currentAudio, screenTrack]);
        localStreamRef.current = newStream;
        setLocalStream(newStream);

        const pc = peerConnectionRef.current;
        if (pc) {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(screenTrack);
          } else {
            pc.addTrack(screenTrack, newStream);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            getSocketInstance().emit('call_renegotiate', { offer, role: myRole });
          }
        } else {
          startCall('screenshare');
          return;
        }

        getSocketInstance().emit('call_type_change', { role: myRole, type: 'screenshare' });
      } catch (err: any) {
        console.warn('[WebRTC Context] Screen share prompt cancelled or error:', err);
        setIsScreenSharing(false);
      }
    }
  }, [isScreenSharing, myRole, startCall]);

  useEffect(() => {
    const socket = getSocketInstance(); if (myRole) socket.emit('identify', { role: myRole });
    
    const handleAnswerSDP = async (answer: RTCSessionDescriptionInit, candidates?: RTCIceCandidateInit[]) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;
      if (!pc.remoteDescription) {
        logDebug('Setting Remote SDP Answer', 'Applying caller remote description from answer...', 'ICE candidates drained and peer connection connecting.', 'Failed setting remote description.');
        await pc.setRemoteDescription(new RTCSessionDescription(answer)).catch(e => console.error('[WebRTC] setRemoteDescription error:', e));
        await applySenderOptimization(pc);
        await drainPendingIceCandidates(pc);
      }
      if (candidates && Array.isArray(candidates)) {
        for (const cand of candidates) {
          await addCandidateToPC(pc, cand);
        }
      }
      const activeSess = callSessionRef.current;
      if (activeSess) {
        const serverCandidates = myRole === activeSess.callerRole ? activeSess.calleeCandidates : activeSess.callerCandidates;
        if (serverCandidates && Array.isArray(serverCandidates)) {
          for (const cand of serverCandidates) {
            await addCandidateToPC(pc, cand);
          }
        }
      }
    };

    const handleCallState = async (session: ServerCallSession | null) => {
      logDebug('Server Call State Received', `Status: '${session?.status || 'null'}', Type: '${session?.type || 'none'}'`, 'UI updates activeCall/incomingCall accordingly.', 'Client state diverging from server state.');
      setCallSession(session);
      callSessionRef.current = session;
      if (!session || session.status === 'ended') {
        if (!isStartingRef.current && !isAcceptingRef.current) {
          cleanupCall();
        }
        return;
      }
      if (session.status === 'connecting' && myRole === session.callerRole && session.answer) {
        await handleAnswerSDP(session.answer);
      }
    };

    const syncServerCallSession = () => {
      api.get('/api/call/session')
        .then(res => {
          const session = res.data;
          if (session && session.status) {
            logDebug('Synced Server Call Session via REST', `Session status: ${session.status}`, 'Syncing state with server.', 'State mismatch.');
            handleCallState(session);
          }
        })
        .catch(() => {});
    };

    syncServerCallSession();
    socket.on('connect', syncServerCallSession);

    const handleCallAccepted = async ({ answer, candidates }: { answer: RTCSessionDescriptionInit; candidates?: RTCIceCandidateInit[] }) => {
      if (answer) await handleAnswerSDP(answer, candidates);
    };

    const handleIce = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (!candidate) return;
      const pc = peerConnectionRef.current;
      if (pc && pc.remoteDescription) {
        await addCandidateToPC(pc, candidate);
      } else {
        pendingIceCandidatesRef.current.push(candidate);
      }
    };

    const handleCallRenegotiate = async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
      const pc = peerConnectionRef.current;
      if (!pc || !offer) return;
      try {
        logDebug('Receiving Lightweight ICE Renegotiation Offer', 'Applying remote description for ICE restart...', 'Answer created and returned.', 'Session status untouched.');
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await drainPendingIceCandidates(pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('call_renegotiate_answer', { answer, role: myRole });
      } catch (e) {
        console.warn('[WebRTC] Error handling call_renegotiate:', e);
      }
    };

    const handleCallRenegotiateAnswer = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnectionRef.current;
      if (!pc || !answer) return;
      try {
        logDebug('Receiving Lightweight ICE Renegotiation Answer', 'Applying remote answer for ICE restart...', 'Media stream re-established quietly.', 'Session status untouched.');
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await drainPendingIceCandidates(pc);
      } catch (e) {
        console.warn('[WebRTC] Error handling call_renegotiate_answer:', e);
      }
    };

    const handleCallError = ({ message }: { message: string }) => {
      console.warn('[WebRTC Call Error]:', message);
    };

    socket.on('call_state', handleCallState);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_accept', handleCallAccepted);
    socket.on('call_ice_candidate', handleIce);
    socket.on('ice_candidate', handleIce);
    socket.on('call_rejected', cleanupCall);
    socket.on('end_call', cleanupCall);
    socket.on('call_hangup', cleanupCall);
    socket.on('call_renegotiate', handleCallRenegotiate);
    socket.on('call_renegotiate_answer', handleCallRenegotiateAnswer);
    socket.on('call_error', handleCallError);

    return () => {
      socket.off('call_state', handleCallState);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('call_accept', handleCallAccepted);
      socket.off('call_ice_candidate', handleIce);
      socket.off('ice_candidate', handleIce);
      socket.off('call_rejected', cleanupCall);
      socket.off('end_call', cleanupCall);
      socket.off('call_hangup', cleanupCall);
      socket.off('call_renegotiate', handleCallRenegotiate);
      socket.off('call_renegotiate_answer', handleCallRenegotiateAnswer);
      socket.off('call_error', handleCallError);
    };
  }, [cleanupCall, myRole, drainPendingIceCandidates, addCandidateToPC]);

  return (
    <CallContext.Provider value={{ activeCall, incomingCall, callSession, isAudioMuted, isVideoMuted, isScreenSharing, localStream, remoteStream, localVideoRef, remoteVideoRef, startCall, acceptCall, rejectCall, endCall, toggleMuteAudio, toggleMuteVideo, toggleScreenShare }}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() { const ctx = useContext(CallContext); if (!ctx) throw new Error('useCall must be inside CallProvider'); return ctx; }
