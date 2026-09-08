import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { getSocketInstance } from '../hooks/useSocket';
import { useAuth } from './AuthContext';
import api from '../api/client';

export type CallType = 'audio' | 'video' | 'screenshare';
export interface IncomingCall { from: string; fromName: string; offer: RTCSessionDescriptionInit; callType: CallType; }
export interface ServerCallSession { id: string; type: CallType; callerRole: 'boyfriend' | 'girlfriend'; calleeRole: 'boyfriend' | 'girlfriend'; status: 'ringing' | 'connecting' | 'active' | 'ended'; offer: RTCSessionDescriptionInit; answer: RTCSessionDescriptionInit | null; startedAt: number; endReason?: string; callerCandidates?: RTCIceCandidateInit[]; calleeCandidates?: RTCIceCandidateInit[]; }

export interface WebRTCDiagnostics {
  callId: string;
  myRole: string;
  partnerRole: string;
  callState: string;
  connectionState: string;
  iceConnectionState: string;
  iceGatheringState: string;
  signalingState: string;
  localTracks: { kind: string; label: string; enabled: boolean; readyState: string }[];
  remoteTracks: { kind: string; label: string; enabled: boolean; readyState: string }[];
  candidatesGathered: { host: number; srflx: number; prflx: number; relay: number };
  logs: string[];
}

export interface CallContextType {
  activeCall: { type: CallType; isOutgoing: boolean; partnerName: string; status: 'calling' | 'connecting' | 'connected' | 'ended'; } | null;
  incomingCall: IncomingCall | null;
  callSession: ServerCallSession | null;
  isAudioMuted: boolean; isVideoMuted: boolean; isScreenSharing: boolean;
  localStream: MediaStream | null; remoteStream: MediaStream | null;
  localVideoRef: React.RefObject<HTMLVideoElement>; remoteVideoRef: React.RefObject<HTMLVideoElement>;
  diagnostics: WebRTCDiagnostics;
  showDebugPanel: boolean;
  setShowDebugPanel: (show: boolean) => void;
  connectionTimeoutPhase: 'normal' | 'warning' | 'failed';
  retryConnection: () => Promise<void>;
  startCall: (type: CallType) => Promise<void>; acceptCall: (customIncomingCall?: IncomingCall) => Promise<void>;
  rejectCall: () => void; endCall: () => void; toggleMuteAudio: () => void; toggleMuteVideo: () => void;
  toggleScreenShare: () => Promise<void>;
}

function logTrace(
  role: string,
  callId: string,
  category: 'CALL' | 'SDP' | 'ICE' | 'MEDIA',
  action: string,
  details?: any,
  logSink?: (msg: string) => void
) {
  const time = new Date().toISOString().substring(11, 23);
  const text = `[WEBRTC][${role.toUpperCase()}][${callId || 'no-id'}][${time}][${category}] ${action}`;
  if (details !== undefined) {
    console.log(text, details);
  } else {
    console.log(text);
  }
  if (logSink) {
    let detailStr = '';
    if (details !== undefined) {
      try {
        detailStr = typeof details === 'string' ? details : JSON.stringify(details);
        if (detailStr.length > 120) detailStr = detailStr.substring(0, 120) + '...';
      } catch { detailStr = ''; }
    }
    logSink(`${time} [${category}] ${action} ${detailStr}`);
  }
}

const turnDomain = import.meta.env.VITE_TURN_DOMAIN || 'relay.metered.ca';
const rawTurnUrls = import.meta.env.VITE_TURN_URLS;
const turnUsername = import.meta.env.VITE_TURN_USERNAME || '71c0cb6740b0a18b4f7d5ee8';
const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL || 'zy5POPV84577FN4f';

const turnUrlList: string[] = rawTurnUrls
  ? rawTurnUrls.split(',').map((u: string) => u.trim())
  : [
      `turn:${turnDomain}:80?transport=udp`,
      `turn:${turnDomain}:80?transport=tcp`,
      `turn:${turnDomain}:443?transport=tcp`,
      `turns:${turnDomain}:443?transport=tcp`
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
        'stun:stun.cloudflare.com:3478',
        'stun:stun.services.mozilla.com:3478',
        'stun:global.stun.twilio.com:3478',
        'stun:stun.nextcloud.com:443',
        `stun:${turnDomain}:80`,
        'stun:openrelay.metered.ca:80'
      ]
    },
    {
      urls: turnUrlList,
      username: turnUsername,
      credential: turnCredential,
    },
    {
      urls: [
        'turn:openrelay.metered.ca:80?transport=udp',
        'turn:openrelay.metered.ca:80?transport=tcp',
        'turn:openrelay.metered.ca:443?transport=tcp',
        'turns:openrelay.metered.ca:443?transport=tcp'
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
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
  channelCount: { ideal: 1 },
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
    if (fmtp.includes('maxplaybackrate') || fmtp.includes('useinbandfec') || match.toLowerCase().includes('opus')) {
      let newFmtp = fmtp;
      if (!newFmtp.includes('maxaveragebitrate=')) newFmtp += ';maxaveragebitrate=128000';
      if (!newFmtp.includes('useinbandfec=')) newFmtp += ';useinbandfec=1';
      if (!newFmtp.includes('usedtx=')) newFmtp += ';usedtx=0';
      if (!newFmtp.includes('minptime=')) newFmtp += ';minptime=10';
      if (!newFmtp.includes('maxplaybackrate=')) newFmtp += ';maxplaybackrate=48000';
      if (!newFmtp.includes('cbr=')) newFmtp += ';cbr=1';
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
      params.encodings[0].maxBitrate = 128000;
      if ('degradationPreference' in params) (params as any).degradationPreference = 'maintain-framerate';
      await audioSender.setParameters(params);
    } catch {}
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
    } catch {}
  }
}

const CallContext = createContext<CallContextType | null>(null);

export function CallProvider({ children }: { children: ReactNode }) {
  const { partner } = useAuth();
  const savedRole = (typeof window !== 'undefined' ? (sessionStorage.getItem('icecream_local_role') || localStorage.getItem('icecream_local_role')) : null) as 'boyfriend' | 'girlfriend' | null;
  const myRole = partner?.role || savedRole || 'boyfriend', partnerName = myRole === 'boyfriend' ? 'Seema' : 'Maulik';
  const partnerRole = myRole === 'boyfriend' ? 'girlfriend' : 'boyfriend';

  const [callSession, setCallSession] = useState<ServerCallSession | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false), [isVideoMuted, setIsVideoMuted] = useState(false), [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null), [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [connectionTimeoutPhase, setConnectionTimeoutPhase] = useState<'normal' | 'warning' | 'failed'>('normal');

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null), localStreamRef = useRef<MediaStream | null>(null), remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null), remoteVideoRef = useRef<HTMLVideoElement | null>(null), remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pendingIceCandidatesByCallIdRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const currentCallTypeRef = useRef<CallType>('video');
  const isStartingRef = useRef(false);
  const isAcceptingRef = useRef(false);
  const iceFailureCountRef = useRef(0);
  const lastIceFailureTimeRef = useRef(0);
  const gatheredCandidateTypesRef = useRef<{ host: number; srflx: number; prflx: number; relay: number }>({ host: 0, srflx: 0, prflx: 0, relay: 0 });
  const callSessionRef = useRef<ServerCallSession | null>(null);
  const dynamicIceServersRef = useRef<RTCConfiguration>(ICE_SERVERS);

  const connectingWarningTimerRef = useRef<any>(null);
  const connectingFailureTimerRef = useRef<any>(null);

  const [diagnostics, setDiagnostics] = useState<WebRTCDiagnostics>({
    callId: '',
    myRole,
    partnerRole,
    callState: 'idle',
    connectionState: 'new',
    iceConnectionState: 'new',
    iceGatheringState: 'new',
    signalingState: 'stable',
    localTracks: [],
    remoteTracks: [],
    candidatesGathered: { host: 0, srflx: 0, prflx: 0, relay: 0 },
    logs: []
  });

  const appendLog = useCallback((msg: string) => {
    setDiagnostics(prev => ({
      ...prev,
      logs: [msg, ...prev.logs].slice(0, 30)
    }));
  }, []);

  const updateDiagnosticsFromPC = useCallback((pc: RTCPeerConnection | null, currentCallId: string) => {
    if (!pc) {
      setDiagnostics(prev => ({
        ...prev,
        callId: currentCallId || prev.callId,
        connectionState: 'closed',
        iceConnectionState: 'closed',
        signalingState: 'closed',
        localTracks: [],
        remoteTracks: [],
      }));
      return;
    }

    const localTracks = pc.getSenders().map(s => s.track).filter(Boolean).map(t => ({
      kind: t!.kind,
      label: t!.label || 'Local Track',
      enabled: t!.enabled,
      readyState: t!.readyState
    }));

    const remoteTracks = pc.getReceivers().map(r => r.track).filter(Boolean).map(t => ({
      kind: t!.kind,
      label: t!.label || 'Remote Track',
      enabled: t!.enabled,
      readyState: t!.readyState
    }));

    setDiagnostics(prev => ({
      ...prev,
      callId: currentCallId || prev.callId,
      myRole,
      partnerRole,
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      iceGatheringState: pc.iceGatheringState,
      signalingState: pc.signalingState,
      localTracks,
      remoteTracks,
      candidatesGathered: { ...gatheredCandidateTypesRef.current }
    }));
  }, [myRole, partnerRole]);

  useEffect(() => {
    api.get('/api/call/ice-servers')
      .then(res => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          dynamicIceServersRef.current = {
            iceServers: res.data,
            iceCandidatePoolSize: 10,
            iceTransportPolicy: 'all',
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require',
          };
          logTrace(myRole, callSessionRef.current?.id || '', 'ICE', 'Dynamic ICE servers loaded from server API.', undefined, appendLog);
        }
      })
      .catch(err => logTrace(myRole, callSessionRef.current?.id || '', 'ICE', 'Dynamic ICE server fetch error', err?.message, appendLog));
  }, [myRole, appendLog]);

  useEffect(() => {
    callSessionRef.current = callSession;
    setDiagnostics(prev => ({
      ...prev,
      callId: callSession?.id || prev.callId,
      callState: callSession?.status || 'idle'
    }));
  }, [callSession]);

  const activeCall = React.useMemo(() => {
    if (!callSession || callSession.status === 'ended') return null;
    if (callSession.status === 'ringing') {
      return myRole === callSession.callerRole ? { type: callSession.type, isOutgoing: true, partnerName, status: 'calling' as const } : null;
    }
    if (callSession.status === 'connecting') {
      return { type: callSession.type, isOutgoing: myRole === callSession.callerRole, partnerName, status: 'connecting' as const };
    }
    return { type: callSession.type, isOutgoing: myRole === callSession.callerRole, partnerName, status: 'connected' as const };
  }, [callSession, myRole, partnerName]);

  const incomingCall = React.useMemo<IncomingCall | null>(() => {
    return (callSession && callSession.status === 'ringing' && myRole === callSession.calleeRole)
      ? { from: callSession.callerRole, fromName: partnerName, offer: callSession.offer, callType: callSession.type } : null;
  }, [callSession, myRole, partnerName]);

  // Connection timeout monitoring
  useEffect(() => {
    if (connectingWarningTimerRef.current) { clearTimeout(connectingWarningTimerRef.current); connectingWarningTimerRef.current = null; }
    if (connectingFailureTimerRef.current) { clearTimeout(connectingFailureTimerRef.current); connectingFailureTimerRef.current = null; }

    if (activeCall?.status === 'connecting') {
      setConnectionTimeoutPhase('normal');
      connectingWarningTimerRef.current = setTimeout(() => {
        logTrace(myRole, callSessionRef.current?.id || '', 'CALL', 'Connecting phase threshold 20s reached -> warning', undefined, appendLog);
        setConnectionTimeoutPhase('warning');
      }, 20000);

      connectingFailureTimerRef.current = setTimeout(() => {
        logTrace(myRole, callSessionRef.current?.id || '', 'CALL', 'Connecting phase threshold 30s reached -> failure', undefined, appendLog);
        setConnectionTimeoutPhase('failed');
      }, 30000);
    } else {
      setConnectionTimeoutPhase('normal');
    }

    return () => {
      if (connectingWarningTimerRef.current) clearTimeout(connectingWarningTimerRef.current);
      if (connectingFailureTimerRef.current) clearTimeout(connectingFailureTimerRef.current);
    };
  }, [activeCall?.status, myRole, appendLog]);

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
        if (remoteAudioRef.current.paused && remoteAudioRef.current.srcObject) {
          remoteAudioRef.current.play().catch(e => logTrace(myRole, callSessionRef.current?.id || '', 'MEDIA', 'Audio unlock play notice', e?.message, appendLog));
        }
      }
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
        if (remoteVideoRef.current.paused) {
          remoteVideoRef.current.play().catch(e => logTrace(myRole, callSessionRef.current?.id || '', 'MEDIA', 'Video unlock play notice', e?.message, appendLog));
        }
      }
    };
    window.addEventListener('click', unlock); window.addEventListener('touchstart', unlock);
    return () => { window.removeEventListener('click', unlock); window.removeEventListener('touchstart', unlock); };
  }, [myRole, appendLog]);

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
          remoteAudioRef.current.play().catch(e => logTrace(myRole, callSessionRef.current?.id || '', 'MEDIA', 'remoteAudioRef.play() blocked', e?.message, appendLog));
        }
      }
      if (remoteVideoRef.current) {
        if (remoteVideoRef.current.srcObject !== remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        if (remoteVideoRef.current.paused) {
          remoteVideoRef.current.play().catch(e => logTrace(myRole, callSessionRef.current?.id || '', 'MEDIA', 'remoteVideoRef.play() blocked', e?.message, appendLog));
        }
      }
    }
  }, [remoteStream, activeCall?.status, myRole, appendLog]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localStream.getVideoTracks().forEach(t => { t.enabled = true; });
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(e => logTrace(myRole, callSessionRef.current?.id || '', 'MEDIA', 'localVideoRef.play() blocked', e?.message, appendLog));
    }
  }, [localStream, activeCall?.status, myRole, appendLog]);

  const cleanupCall = useCallback(() => {
    const cid = callSessionRef.current?.id || '';
    logTrace(myRole, cid, 'CALL', 'Cleaning up call session and stopping media tracks.', undefined, appendLog);
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
    pendingIceCandidatesByCallIdRef.current.clear();
    isStartingRef.current = false;
    isAcceptingRef.current = false;
    iceFailureCountRef.current = 0;
    lastIceFailureTimeRef.current = 0;
    setLocalStream(null);
    setRemoteStream(null);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    setIsScreenSharing(false);
    setConnectionTimeoutPhase('normal');
    updateDiagnosticsFromPC(null, cid);
  }, [myRole, appendLog, updateDiagnosticsFromPC]);

  const addCandidateToPC = useCallback(async (pc: RTCPeerConnection, cand: RTCIceCandidateInit, callId: string) => {
    if (!cand) return;
    try {
      await pc.addIceCandidate(new RTCIceCandidate(cand));
      logTrace(myRole, callId, 'ICE', 'addIceCandidate success', { candidate: cand.candidate?.substring(0, 40) }, appendLog);
    } catch (e: any) {
      logTrace(myRole, callId, 'ICE', 'addIceCandidate FAILED', { candidate: cand.candidate?.substring(0, 40), error: e?.message || e }, appendLog);
    }
  }, [myRole, appendLog]);

  const drainPendingIceCandidates = useCallback(async (pc: RTCPeerConnection, callId: string) => {
    if (!pc || !pc.remoteDescription) return;
    const candidates = pendingIceCandidatesByCallIdRef.current.get(callId) || [];
    pendingIceCandidatesByCallIdRef.current.delete(callId);
    logTrace(myRole, callId, 'ICE', `Flushing ${candidates.length} queued ICE candidates after setRemoteDescription`, undefined, appendLog);
    for (const c of candidates) {
      await addCandidateToPC(pc, c, callId);
    }
  }, [myRole, appendLog, addCandidateToPC]);

  const createPeerConnection = useCallback((callId: string) => {
    if (peerConnectionRef.current) {
      logTrace(myRole, callId, 'CALL', 'Closing existing RTCPeerConnection before creating new one', undefined, appendLog);
      peerConnectionRef.current.close();
    }
    logTrace(myRole, callId, 'CALL', 'Creating RTCPeerConnection with STUN/TURN configuration', undefined, appendLog);
    const configToUse = dynamicIceServersRef.current || ICE_SERVERS;
    const pc = new RTCPeerConnection(configToUse), socket = getSocketInstance();
    logTrace(myRole, callId, 'ICE', 'pc.getConfiguration().iceServers', pc.getConfiguration().iceServers, appendLog);

    gatheredCandidateTypesRef.current = { host: 0, srflx: 0, prflx: 0, relay: 0 };
    updateDiagnosticsFromPC(pc, callId);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        const type = (e.candidate.type || 'unknown') as keyof typeof gatheredCandidateTypesRef.current;
        if (gatheredCandidateTypesRef.current[type] !== undefined) {
          gatheredCandidateTypesRef.current[type]++;
        }
        logTrace(myRole, callId, 'ICE', `onicecandidate gathered [${e.candidate.type}/${e.candidate.protocol}]`, e.candidate.candidate, appendLog);
        socket.emit('call_ice_candidate', { candidate: e.candidate, role: myRole, callId });
        updateDiagnosticsFromPC(pc, callId);
      }
    };

    pc.oniceconnectionstatechange = async () => {
      logTrace(myRole, callId, 'ICE', `iceConnectionState changed to: ${pc.iceConnectionState}`, undefined, appendLog);
      updateDiagnosticsFromPC(pc, callId);

      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        logTrace(myRole, callId, 'ICE', '🎉 ICE connection reached connected/completed! Emitting call_connected to server.', undefined, appendLog);
        socket.emit('call_connected');
      } else if (pc.iceConnectionState === 'failed') {
        logTrace(myRole, callId, 'ICE', '❌ ICE connection failed! Triggering ICE restart once...', undefined, appendLog);
        const now = Date.now();
        if (now - lastIceFailureTimeRef.current < 15000) {
          iceFailureCountRef.current += 1;
        } else {
          iceFailureCountRef.current = 1;
        }
        lastIceFailureTimeRef.current = now;

        if (iceFailureCountRef.current > 3) {
          logTrace(myRole, callId, 'ICE', 'ICE failure loop detected (>3 failures in 15s). Aborting and ending call.', undefined, appendLog);
          cleanupCall();
          return;
        }

        try {
          pc.restartIce();
          const offer = await pc.createOffer({ iceRestart: true });
          await pc.setLocalDescription(offer);
          socket.emit('call_renegotiate', { offer, role: myRole, callId });
        } catch (e: any) {
          logTrace(myRole, callId, 'ICE', 'ICE restart offer creation failed', e?.message, appendLog);
        }
      }
    };

    pc.onconnectionstatechange = () => {
      logTrace(myRole, callId, 'ICE', `connectionState changed to: ${pc.connectionState}`, undefined, appendLog);
      updateDiagnosticsFromPC(pc, callId);
      if (pc.connectionState === 'connected') {
        logTrace(myRole, callId, 'ICE', '🎉 RTCPeerConnection reached connected! Emitting call_connected to server.', undefined, appendLog);
        socket.emit('call_connected');
      } else if (pc.connectionState === 'closed') {
        cleanupCall();
      }
    };

    pc.onsignalingstatechange = () => {
      logTrace(myRole, callId, 'SDP', `signalingState changed to: ${pc.signalingState}`, undefined, appendLog);
      updateDiagnosticsFromPC(pc, callId);
    };

    pc.onicegatheringstatechange = () => {
      logTrace(myRole, callId, 'ICE', `iceGatheringState changed to: ${pc.iceGatheringState}`, undefined, appendLog);
      updateDiagnosticsFromPC(pc, callId);
    };

    pc.ontrack = (e) => {
      logTrace(myRole, callId, 'MEDIA', `ontrack received: kind=${e.track.kind}, id=${e.track.id}, streamIds=${e.streams.map(s => s.id)}`, undefined, appendLog);
      e.track.enabled = true;
      let streamToUse = (e.streams && e.streams[0]) ? e.streams[0] : remoteStreamRef.current;
      if (!streamToUse) streamToUse = new MediaStream();
      if (!streamToUse.getTracks().some(t => t.id === e.track.id)) {
        streamToUse.addTrack(e.track);
      }
      remoteStreamRef.current = streamToUse;
      setRemoteStream(new MediaStream(streamToUse.getTracks()));
      updateDiagnosticsFromPC(pc, callId);
      socket.emit('call_connected');
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [myRole, appendLog, cleanupCall, updateDiagnosticsFromPC]);

  const endCall = useCallback(() => {
    const cid = callSessionRef.current?.id || '';
    logTrace(myRole, cid, 'CALL', 'Ending call. Emitting call_hangup to server.', undefined, appendLog);
    const s = getSocketInstance();
    s.emit('call_hangup', { role: myRole, callId: cid });
    cleanupCall();
  }, [cleanupCall, myRole, appendLog]);

  const rejectCall = useCallback(() => {
    const cid = callSessionRef.current?.id || '';
    logTrace(myRole, cid, 'CALL', 'Rejecting call. Emitting call_reject to server.', undefined, appendLog);
    const s = getSocketInstance();
    s.emit('call_reject', { role: myRole, callId: cid });
  }, [myRole, appendLog]);

  const retryConnection = useCallback(async () => {
    const pc = peerConnectionRef.current;
    const cid = callSessionRef.current?.id || '';
    logTrace(myRole, cid, 'CALL', 'Manual connection retry requested by user. Triggering ICE restart...', undefined, appendLog);
    if (pc) {
      try {
        pc.restartIce();
        const offer = await pc.createOffer({ iceRestart: true });
        await pc.setLocalDescription(offer);
        getSocketInstance().emit('call_renegotiate', { offer, role: myRole, callId: cid });
      } catch (e: any) {
        logTrace(myRole, cid, 'CALL', 'Manual retry error', e?.message, appendLog);
      }
    }
  }, [myRole, appendLog]);

  const startCall = useCallback(async (type: CallType) => {
    if (isStartingRef.current) {
      logTrace(myRole, '', 'CALL', 'startCall already in progress, ignoring duplicate trigger.', undefined, appendLog);
      return;
    }
    isStartingRef.current = true;
    const targetCallId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    logTrace(myRole, targetCallId, 'CALL', `Initiating startCall type '${type}'`, undefined, appendLog);
    cleanupCall();
    const socket = getSocketInstance();
    currentCallTypeRef.current = type;

    try {
      let stream: MediaStream;
      if (type === 'screenshare') {
        try {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
            audio: true
          });
          logTrace(myRole, targetCallId, 'MEDIA', 'getDisplayMedia success (with audio track option)', undefined, appendLog);
        } catch (err: any) {
          logTrace(myRole, targetCallId, 'MEDIA', 'getDisplayMedia with audio failed, retrying video only...', err?.message, appendLog);
          try {
            stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            logTrace(myRole, targetCallId, 'MEDIA', 'getDisplayMedia success (video only)', undefined, appendLog);
          } catch (err2: any) {
            logTrace(myRole, targetCallId, 'MEDIA', 'getDisplayMedia failed completely, falling back to camera getUserMedia', err2?.message, appendLog);
            stream = await navigator.mediaDevices.getUserMedia({ audio: HIGH_QUALITY_AUDIO_CONSTRAINTS, video: true });
          }
        }
        setIsScreenSharing(true);
        if (stream.getVideoTracks()[0]) {
          stream.getVideoTracks()[0].onended = () => {
            logTrace(myRole, targetCallId, 'MEDIA', 'Screen share track ended via browser UI', undefined, appendLog);
            endCall();
          };
        }
      } else if (type === 'video') {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: HIGH_QUALITY_AUDIO_CONSTRAINTS,
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }
          });
          logTrace(myRole, targetCallId, 'MEDIA', 'getUserMedia video success (720p 30fps)', undefined, appendLog);
        } catch (e: any) {
          logTrace(myRole, targetCallId, 'MEDIA', 'getUserMedia 720p failed, falling back to basic video', e?.message, appendLog);
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: HIGH_QUALITY_AUDIO_CONSTRAINTS, video: true });
          } catch (err: any) {
            logTrace(myRole, targetCallId, 'MEDIA', 'getUserMedia video failed, falling back to audio only', err?.message, appendLog);
            stream = await navigator.mediaDevices.getUserMedia({ audio: HIGH_QUALITY_AUDIO_CONSTRAINTS, video: false });
          }
        }
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: HIGH_QUALITY_AUDIO_CONSTRAINTS,
          video: false
        });
        logTrace(myRole, targetCallId, 'MEDIA', 'getUserMedia audio success', undefined, appendLog);
      }

      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = createPeerConnection(targetCallId);
      logTrace(myRole, targetCallId, 'MEDIA', `Adding ${stream.getTracks().length} local tracks to RTCPeerConnection BEFORE createOffer`, undefined, appendLog);
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      logTrace(myRole, targetCallId, 'SDP', 'createOffer start', undefined, appendLog);
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      const hdOfferSDP = optimizeAudioSDP(offer.sdp || '');
      const finalOffer = new RTCSessionDescription({ type: offer.type, sdp: hdOfferSDP });

      logTrace(myRole, targetCallId, 'SDP', 'setLocalDescription offer start', { sdpType: finalOffer.type }, appendLog);
      await pc.setLocalDescription(finalOffer);
      await applySenderOptimization(pc);

      logTrace(myRole, targetCallId, 'SDP', 'Emitting call_initiate offer to server', undefined, appendLog);
      socket.emit('call_initiate', { callType: type, offer: finalOffer, role: myRole, callId: targetCallId });
    } catch (err: any) {
      logTrace(myRole, targetCallId, 'CALL', 'startCall failed completely', err?.message, appendLog);
      endCall();
    } finally {
      isStartingRef.current = false;
    }
  }, [cleanupCall, createPeerConnection, myRole, endCall, appendLog]);

  const acceptCall = useCallback(async (customCall?: IncomingCall) => {
    if (isAcceptingRef.current) {
      logTrace(myRole, '', 'CALL', 'acceptCall already in progress, ignoring duplicate click', undefined, appendLog);
      return;
    }
    const currentSess = callSessionRef.current;
    const offerToUse = customCall?.offer || currentSess?.offer;
    const callTypeToUse = customCall?.callType || currentSess?.type || 'video';
    const targetCallId = currentSess?.id || Date.now().toString(36);
    if (!offerToUse) {
      logTrace(myRole, targetCallId, 'CALL', 'acceptCall aborted: missing offer SDP', undefined, appendLog);
      return;
    }

    isAcceptingRef.current = true;
    currentCallTypeRef.current = callTypeToUse;
    logTrace(myRole, targetCallId, 'CALL', `Callee accepting call type '${callTypeToUse}'`, undefined, appendLog);

    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = false;
      remoteAudioRef.current.volume = 1.0;
      if (remoteAudioRef.current.paused && remoteAudioRef.current.srcObject) {
        remoteAudioRef.current.play().catch(() => {});
      }
    }

    const socket = getSocketInstance();
    try {
      let stream: MediaStream | null = null;
      const mobileSafeAudio = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };

      if (callTypeToUse === 'video') {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: HIGH_QUALITY_AUDIO_CONSTRAINTS,
            video: { width: { ideal: 1280 }, height: { ideal: 720 } }
          });
          logTrace(myRole, targetCallId, 'MEDIA', 'acceptCall getUserMedia video success', undefined, appendLog);
        } catch (e1: any) {
          logTrace(myRole, targetCallId, 'MEDIA', 'acceptCall high quality video failed, trying mobile safe video', e1?.message, appendLog);
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: mobileSafeAudio, video: { facingMode: 'user' } });
          } catch (e2: any) {
            logTrace(myRole, targetCallId, 'MEDIA', 'acceptCall mobile video failed, trying basic video', e2?.message, appendLog);
            try {
              stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            } catch (e3: any) {
              logTrace(myRole, targetCallId, 'MEDIA', 'acceptCall video failed completely, trying audio only fallback', e3?.message, appendLog);
              try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: mobileSafeAudio });
              } catch (e4) {
                try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e5) {
                  logTrace(myRole, targetCallId, 'MEDIA', 'All getUserMedia attempts failed on callee (joining receive-only)', undefined, appendLog);
                }
              }
            }
          }
        }
      } else {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: HIGH_QUALITY_AUDIO_CONSTRAINTS, video: false });
          logTrace(myRole, targetCallId, 'MEDIA', 'acceptCall getUserMedia audio success', undefined, appendLog);
        } catch (e1: any) {
          logTrace(myRole, targetCallId, 'MEDIA', 'acceptCall audio failed, trying mobile safe audio', e1?.message, appendLog);
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: mobileSafeAudio, video: false });
          } catch (e2) {
            try { stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); } catch (e3) {
              logTrace(myRole, targetCallId, 'MEDIA', 'Audio getUserMedia failed on callee (joining receive-only)', undefined, appendLog);
            }
          }
        }
      }

      const pc = createPeerConnection(targetCallId);
      if (stream) {
        localStreamRef.current = stream;
        setLocalStream(stream);
        logTrace(myRole, targetCallId, 'MEDIA', `Adding ${stream.getTracks().length} callee local tracks BEFORE createAnswer`, undefined, appendLog);
        stream.getTracks().forEach(t => pc.addTrack(t, stream!));
      }

      logTrace(myRole, targetCallId, 'SDP', 'callee setRemoteDescription offer start', { type: offerToUse.type }, appendLog);
      await pc.setRemoteDescription(new RTCSessionDescription(offerToUse));

      await drainPendingIceCandidates(pc, targetCallId);
      const activeSess = callSessionRef.current;
      if (activeSess?.callerCandidates && Array.isArray(activeSess.callerCandidates)) {
        for (const cand of activeSess.callerCandidates) {
          await addCandidateToPC(pc, cand, targetCallId);
        }
      }

      logTrace(myRole, targetCallId, 'SDP', 'callee createAnswer start', undefined, appendLog);
      const answer = await pc.createAnswer();
      const hdAnswerSDP = optimizeAudioSDP(answer.sdp || '');
      const finalAnswer = new RTCSessionDescription({ type: answer.type, sdp: hdAnswerSDP });

      logTrace(myRole, targetCallId, 'SDP', 'callee setLocalDescription answer start', { type: finalAnswer.type }, appendLog);
      await pc.setLocalDescription(finalAnswer);
      await applySenderOptimization(pc);

      logTrace(myRole, targetCallId, 'SDP', 'Emitting call_accept answer to server', undefined, appendLog);
      socket.emit('call_accept', { answer: finalAnswer, role: myRole, callId: targetCallId });
    } catch (err: any) {
      logTrace(myRole, targetCallId, 'CALL', 'Error during acceptCall execution', err?.message, appendLog);
    } finally {
      isAcceptingRef.current = false;
    }
  }, [createPeerConnection, myRole, drainPendingIceCandidates, addCandidateToPC, appendLog]);

  const toggleMuteAudio = useCallback(() => {
    if (localStreamRef.current) {
      const tracks = localStreamRef.current.getAudioTracks();
      if (tracks.length > 0) {
        const nextState = !tracks[0].enabled;
        tracks.forEach(t => t.enabled = nextState);
        const isMuted = !nextState;
        setIsAudioMuted(isMuted);
        logTrace(myRole, callSessionRef.current?.id || '', 'MEDIA', `Audio mute toggled: isMuted=${isMuted}`, undefined, appendLog);
        getSocketInstance().emit('toggle_mute', { role: myRole, isMuted });
      }
    }
  }, [myRole, appendLog]);

  const toggleMuteVideo = useCallback(() => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsVideoMuted(!track.enabled);
        logTrace(myRole, callSessionRef.current?.id || '', 'MEDIA', `Video mute toggled: isVideoMuted=${!track.enabled}`, undefined, appendLog);
      }
    }
  }, [myRole, appendLog]);

  const toggleScreenShare = useCallback(async () => {
    const cid = callSessionRef.current?.id || '';
    if (isScreenSharing) {
      logTrace(myRole, cid, 'MEDIA', 'Stopping active screen share track...', undefined, appendLog);
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
      getSocketInstance().emit('call_type_change', { role: myRole, type: 'video', callId: cid });
    } else {
      logTrace(myRole, cid, 'MEDIA', 'Initiating getDisplayMedia for screen share...', undefined, appendLog);
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
          logTrace(myRole, cid, 'MEDIA', 'Screen share track ended via browser UI bar', undefined, appendLog);
          setIsScreenSharing(false);
          getSocketInstance().emit('call_type_change', { role: myRole, type: 'video', callId: cid });
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
          }
          const offer = await pc.createOffer();
          const hdOfferSDP = optimizeAudioSDP(offer.sdp || '');
          const finalOffer = new RTCSessionDescription({ type: offer.type, sdp: hdOfferSDP });
          await pc.setLocalDescription(finalOffer);
          await applySenderOptimization(pc);
          getSocketInstance().emit('call_renegotiate', { offer: finalOffer, role: myRole, callId: cid });
        } else {
          startCall('screenshare');
          return;
        }

        getSocketInstance().emit('call_type_change', { role: myRole, type: 'screenshare', callId: cid });
      } catch (err: any) {
        logTrace(myRole, cid, 'MEDIA', 'Screen share prompt cancelled or failed', err?.message, appendLog);
        setIsScreenSharing(false);
      }
    }
  }, [isScreenSharing, myRole, startCall, appendLog]);

  useEffect(() => {
    const socket = getSocketInstance();
    if (myRole) socket.emit('identify', { role: myRole });

    const handleAnswerSDP = async (answer: RTCSessionDescriptionInit, candidates?: RTCIceCandidateInit[], incomingCallId?: string) => {
      const pc = peerConnectionRef.current;
      const cid = incomingCallId || callSessionRef.current?.id || '';
      if (!pc) {
        logTrace(myRole, cid, 'SDP', 'handleAnswerSDP ignored: RTCPeerConnection is null', undefined, appendLog);
        return;
      }
      if (pc.signalingState !== 'have-local-offer') {
        logTrace(myRole, cid, 'SDP', `handleAnswerSDP ignored: signalingState is '${pc.signalingState}', not 'have-local-offer'`, undefined, appendLog);
        return;
      }

      logTrace(myRole, cid, 'SDP', 'Caller applying setRemoteDescription answer', { type: answer.type }, appendLog);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await applySenderOptimization(pc);
        await drainPendingIceCandidates(pc, cid);
      } catch (e: any) {
        logTrace(myRole, cid, 'SDP', 'Caller setRemoteDescription answer error', e?.message, appendLog);
      }

      if (candidates && Array.isArray(candidates)) {
        for (const cand of candidates) {
          await addCandidateToPC(pc, cand, cid);
        }
      }
      const activeSess = callSessionRef.current;
      if (activeSess) {
        const serverCandidates = myRole === activeSess.callerRole ? activeSess.calleeCandidates : activeSess.callerCandidates;
        if (serverCandidates && Array.isArray(serverCandidates)) {
          for (const cand of serverCandidates) {
            await addCandidateToPC(pc, cand, cid);
          }
        }
      }
    };

    const handleCallState = async (session: ServerCallSession | null) => {
      const cid = session?.id || '';
      logTrace(myRole, cid, 'CALL', `Server Call State Received: status='${session?.status || 'null'}'`, undefined, appendLog);
      setCallSession(session);
      callSessionRef.current = session;

      if (!session || session.status === 'ended') {
        if (!isStartingRef.current && !isAcceptingRef.current) {
          cleanupCall();
        }
        return;
      }

      if ((session.status === 'connecting' || session.status === 'active') && !peerConnectionRef.current && !isStartingRef.current && !isAcceptingRef.current) {
        logTrace(myRole, cid, 'CALL', `Re-establishing peer connection after page refresh for ${session.status} session`, undefined, appendLog);
        if (myRole === session.calleeRole && session.offer) {
          acceptCall({ from: session.callerRole, fromName: partnerName, offer: session.offer, callType: session.type });
        } else if (myRole === session.callerRole) {
          startCall(session.type);
        }
        return;
      }

      if ((session.status === 'connecting' || session.status === 'active') && myRole === session.callerRole && session.answer) {
        await handleAnswerSDP(session.answer, undefined, cid);
      }
    };

    const syncServerCallSession = () => {
      api.get('/api/call/session')
        .then(res => {
          const session = res.data;
          if (session && session.status) {
            handleCallState(session);
          }
        })
        .catch(() => {});
    };

    syncServerCallSession();
    socket.on('connect', syncServerCallSession);

    const handleCallAccepted = async ({ answer, candidates, callId }: { answer: RTCSessionDescriptionInit; candidates?: RTCIceCandidateInit[]; callId?: string }) => {
      logTrace(myRole, callId || callSessionRef.current?.id || '', 'SDP', 'call_accepted event received from callee', undefined, appendLog);
      if (answer) await handleAnswerSDP(answer, candidates, callId);
    };

    const handleIce = async ({ candidate, callId }: { candidate: RTCIceCandidateInit; callId?: string }) => {
      if (!candidate) return;
      const cid = callId || callSessionRef.current?.id || '';
      const pc = peerConnectionRef.current;
      if (pc && pc.remoteDescription) {
        await addCandidateToPC(pc, candidate, cid);
      } else {
        logTrace(myRole, cid, 'ICE', 'Queueing remote candidate (remoteDescription not yet set)', { candidate: candidate.candidate?.substring(0, 40) }, appendLog);
        const list = pendingIceCandidatesByCallIdRef.current.get(cid) || [];
        list.push(candidate);
        pendingIceCandidatesByCallIdRef.current.set(cid, list);
      }
    };

    const handleCallRenegotiate = async ({ offer, callId }: { offer: RTCSessionDescriptionInit; callId?: string }) => {
      const pc = peerConnectionRef.current;
      const cid = callId || callSessionRef.current?.id || '';
      if (!pc || !offer) return;
      try {
        logTrace(myRole, cid, 'SDP', 'Receiving ICE renegotiation offer', { type: offer.type }, appendLog);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await drainPendingIceCandidates(pc, cid);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('call_renegotiate_answer', { answer, role: myRole, callId: cid });
      } catch (e: any) {
        logTrace(myRole, cid, 'SDP', 'Error handling call_renegotiate', e?.message, appendLog);
      }
    };

    const handleCallRenegotiateAnswer = async ({ answer, callId }: { answer: RTCSessionDescriptionInit; callId?: string }) => {
      const pc = peerConnectionRef.current;
      const cid = callId || callSessionRef.current?.id || '';
      if (!pc || !answer) return;
      try {
        logTrace(myRole, cid, 'SDP', 'Receiving ICE renegotiation answer', { type: answer.type }, appendLog);
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await drainPendingIceCandidates(pc, cid);
      } catch (e: any) {
        logTrace(myRole, cid, 'SDP', 'Error handling call_renegotiate_answer', e?.message, appendLog);
      }
    };

    const handleCallError = ({ message }: { message: string }) => {
      logTrace(myRole, callSessionRef.current?.id || '', 'CALL', `Call Error from server: ${message}`, undefined, appendLog);
    };

    socket.on('call_state', handleCallState);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_accept', handleCallAccepted);
    socket.on('call_answer', handleCallAccepted);
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
      socket.off('call_answer', handleCallAccepted);
      socket.off('call_ice_candidate', handleIce);
      socket.off('ice_candidate', handleIce);
      socket.off('call_rejected', cleanupCall);
      socket.off('end_call', cleanupCall);
      socket.off('call_hangup', cleanupCall);
      socket.off('call_renegotiate', handleCallRenegotiate);
      socket.off('call_renegotiate_answer', handleCallRenegotiateAnswer);
      socket.off('call_error', handleCallError);
    };
  }, [cleanupCall, myRole, drainPendingIceCandidates, addCandidateToPC, partnerName, acceptCall, startCall, appendLog]);

  return (
    <CallContext.Provider
      value={{
        activeCall,
        incomingCall,
        callSession,
        isAudioMuted,
        isVideoMuted,
        isScreenSharing,
        localStream,
        remoteStream,
        localVideoRef,
        remoteVideoRef,
        diagnostics,
        showDebugPanel,
        setShowDebugPanel,
        connectionTimeoutPhase,
        retryConnection,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMuteAudio,
        toggleMuteVideo,
        toggleScreenShare
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() { const ctx = useContext(CallContext); if (!ctx) throw new Error('useCall must be inside CallProvider'); return ctx; }
