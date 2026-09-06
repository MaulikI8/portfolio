import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { getSocketInstance } from '../hooks/useSocket';
import { useAuth } from './AuthContext';

export type CallType = 'audio' | 'video' | 'screenshare';

export interface IncomingCall {
  from: string;
  fromName: string;
  offer: RTCSessionDescriptionInit;
  callType: CallType;
}

export interface CallContextType {
  activeCall: {
    type: CallType;
    isOutgoing: boolean;
    partnerName: string;
    status: 'calling' | 'connected' | 'ended';
  } | null;
  incomingCall: IncomingCall | null;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  startCall: (type: CallType) => Promise<void>;
  acceptCall: (customIncomingCall?: IncomingCall) => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMuteAudio: () => void;
  toggleMuteVideo: () => void;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    // Standard Public Google STUN Servers
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    
    // Free Open Relay TURN Servers (Relays traffic when NAT / mobile data blocks P2P)
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turns:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
};

function boostSDPBitrate(sdp: string): string {
  if (!sdp) return sdp;
  const lines = sdp.split('\r\n');
  const modified: string[] = [];
  let inVideo = false;
  let opusPayloadType: string | null = null;

  for (const line of lines) {
    const match = line.match(/^a=rtpmap:(\d+)\s+opus\/48000/i);
    if (match) {
      opusPayloadType = match[1];
      break;
    }
  }

  for (const line of lines) {
    if (line.startsWith('m=video')) {
      inVideo = true;
      modified.push(line);
      modified.push('b=AS:8000');
      modified.push('b=TIAS:8000000');
      continue;
    } else if (line.startsWith('m=')) {
      inVideo = false;
    }

    if (opusPayloadType && line.startsWith(`a=fmtp:${opusPayloadType}`)) {
      if (!line.includes('stereo=1')) {
        modified.push(`${line};stereo=1;sprop-stereo=1;maxaveragebitrate=128000;useinbandfec=1`);
      } else {
        modified.push(line);
      }
    } else if (inVideo && line.startsWith('a=fmtp:')) {
      modified.push(`${line};x-google-min-bitrate=300;x-google-start-bitrate=2500;x-google-max-bitrate=8000`);
    } else {
      modified.push(line);
    }
  }
  return modified.join('\r\n');
}

async function applySenderOptimization(pc: RTCPeerConnection) {
  const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
  if (!videoSender) return;

  try {
    const parameters = videoSender.getParameters();
    if (!parameters.encodings || parameters.encodings.length === 0) {
      parameters.encodings = [{}];
    }

    parameters.encodings[0].maxBitrate = 8000000;
    parameters.encodings[0].maxFramerate = 60;
    parameters.encodings[0].scaleResolutionDownBy = 1.0;
    
    if ('degradationPreference' in parameters) {
      (parameters as any).degradationPreference = 'maintain-framerate';
    }

    await videoSender.setParameters(parameters);
  } catch (e) {
    console.log('[WebRTC] Sender optimization notice:', e);
  }
}

const CallContext = createContext<CallContextType | null>(null);

export function CallProvider({ children }: { children: ReactNode }) {
  const { partner } = useAuth();
  const myRole = partner?.role || 'boyfriend';
  const partnerName = myRole === 'boyfriend' ? 'Seema' : 'Maulik';

  const [activeCall, setActiveCall] = useState<{
    type: CallType;
    isOutgoing: boolean;
    partnerName: string;
    status: 'calling' | 'connected' | 'ended';
  } | null>(null);

  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // Dedicated HTML audio element attached to document.body for 100% reliable audio playback
  useEffect(() => {
    if (typeof document === 'undefined') return;

    let audioEl = remoteAudioRef.current;
    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.id = 'webrtc-remote-audio-player';
      audioEl.autoplay = true;
      audioEl.muted = false;
      audioEl.volume = 1.0;
      (audioEl as any).playsInline = true;
      audioEl.style.display = 'none';
      document.body.appendChild(audioEl);
      remoteAudioRef.current = audioEl;
    }

    const unlockAudio = () => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.volume = 1.0;
        if (remoteAudioRef.current.paused && remoteAudioRef.current.srcObject) {
          remoteAudioRef.current.play().catch(() => {});
        }
      }
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // Update audio element whenever remoteStream changes
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      const audioTracks = remoteStream.getAudioTracks();
      console.log('[WebRTC Context] Attaching remoteStream to DOM audio player:', audioTracks.length, 'audio tracks');
      
      audioTracks.forEach((t) => {
        t.enabled = true;
      });

      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.muted = false;
      remoteAudioRef.current.volume = 1.0;
      remoteAudioRef.current.play().catch((err) => {
        console.warn('[WebRTC Context] Remote audio play notice:', err);
      });
    }
  }, [remoteStream]);

  const cleanupCall = useCallback(() => {
    console.log('[WebRTC Context] Cleaning up active call');
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    remoteStreamRef.current = null;
    pendingIceCandidatesRef.current = [];
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    setIncomingCall(null);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    setIsScreenSharing(false);
  }, []);

  // Create Peer Connection with detailed ICE connection state monitoring & TURN server fallback
  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    console.log('[WebRTC Context] Creating RTCPeerConnection with STUN + TURN servers');
    const pc = new RTCPeerConnection(ICE_SERVERS);
    const socket = getSocketInstance();

    // ICE Candidate Gathering
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC Context] Generated ICE Candidate:', event.candidate.type || event.candidate.candidate);
        socket.emit('ice_candidate', { candidate: event.candidate, role: myRole });
      }
    };

    // ICE Connection State Monitoring Diagnostics
    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC Context] ICE Connection State Changed:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
      } else if (pc.iceConnectionState === 'failed') {
        console.warn('[WebRTC Context] ICE Connection Failed! Attempting ICE restart...');
        pc.restartIce();
      } else if (pc.iceConnectionState === 'disconnected') {
        console.warn('[WebRTC Context] ICE Connection Disconnected');
      }
    };

    // Peer Connection Overall State Monitoring
    pc.onconnectionstatechange = () => {
      console.log('[WebRTC Context] Peer Connection State:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        cleanupCall();
      }
    };

    // Incoming Remote Track Handling
    pc.ontrack = (event) => {
      console.log('[WebRTC Context] Received remote track:', event.track.kind, 'id:', event.track.id);
      event.track.enabled = true;
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }

      if (!remoteStreamRef.current.getTracks().some((t) => t.id === event.track.id)) {
        remoteStreamRef.current.addTrack(event.track);
      }

      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach((t) => {
          t.enabled = true;
          if (!remoteStreamRef.current?.getTracks().some((existing) => existing.id === t.id)) {
            remoteStreamRef.current?.addTrack(t);
          }
        });
      }

      const freshStream = new MediaStream(remoteStreamRef.current.getTracks());
      setRemoteStream(freshStream);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = freshStream;
        remoteVideoRef.current.play().catch(() => {});
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = freshStream;
        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.volume = 1.0;
        remoteAudioRef.current.play().catch(() => {});
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [myRole, cleanupCall]);

  const endCall = useCallback(() => {
    console.log('[WebRTC Context] Ending call');
    const socket = getSocketInstance();
    socket.emit('end_call', { role: myRole });
    cleanupCall();
  }, [cleanupCall, myRole]);

  const rejectCall = useCallback(() => {
    console.log('[WebRTC Context] Rejecting incoming call');
    const socket = getSocketInstance();
    socket.emit('reject_call', { role: myRole });
    setIncomingCall(null);
  }, [myRole]);

  const startCall = useCallback(
    async (type: CallType) => {
      cleanupCall();
      const socket = getSocketInstance();

      try {
        let stream: MediaStream;
        if (type === 'screenshare') {
          try {
            stream = await navigator.mediaDevices.getDisplayMedia({
              video: {
                width: { ideal: 1920, max: 3840 },
                height: { ideal: 1080, max: 2160 },
                frameRate: { ideal: 60, max: 60 },
              },
              audio: true,
            });
          } catch (e) {
            console.warn('[WebRTC Context] getDisplayMedia audio fallback:', e);
            stream = await navigator.mediaDevices.getDisplayMedia({
              video: {
                width: { ideal: 1920, max: 3840 },
                height: { ideal: 1080, max: 2160 },
                frameRate: { ideal: 60, max: 60 },
              },
            });
          }

          try {
            const micStream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            });
            micStream.getAudioTracks().forEach((track) => {
              track.enabled = true;
              stream.addTrack(track);
            });
            console.log('[WebRTC Context] Added microphone track to screen share');
          } catch (micErr) {
            console.warn('[WebRTC Context] Microphone stream attach notice:', micErr);
          }

          const videoTrack = stream.getVideoTracks()[0];
          if (videoTrack && 'contentHint' in videoTrack) {
            (videoTrack as any).contentHint = 'detail';
          }

          setIsScreenSharing(true);

          if (stream.getVideoTracks()[0]) {
            stream.getVideoTracks()[0].onended = () => {
              endCall();
            };
          }
        } else {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
              video: type === 'video' ? {
                width: { ideal: 1920, max: 1920 },
                height: { ideal: 1080, max: 1080 },
                frameRate: { ideal: 60, max: 60 },
              } : false,
            });
          } catch (err) {
            console.warn('[WebRTC Context] Constraints fallback, trying basic getUserMedia:', err);
            stream = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: type === 'video',
            });
          }

          const videoTrack = stream.getVideoTracks()[0];
          if (videoTrack && 'contentHint' in videoTrack) {
            (videoTrack as any).contentHint = 'motion';
          }
        }

        localStreamRef.current = stream;
        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }

        const pc = createPeerConnection();
        stream.getTracks().forEach((track) => {
          track.enabled = true;
          pc.addTrack(track, stream);
        });

        if (remoteAudioRef.current) {
          remoteAudioRef.current.muted = false;
          remoteAudioRef.current.volume = 1.0;
          remoteAudioRef.current.play().catch(() => {});
        }

        const offer = await pc.createOffer();
        const boostedOffer = {
          type: offer.type,
          sdp: boostSDPBitrate(offer.sdp || ''),
        };

        await pc.setLocalDescription(boostedOffer);
        await applySenderOptimization(pc);

        setActiveCall({
          type,
          isOutgoing: true,
          partnerName,
          status: 'calling',
        });

        socket.emit('identify', { role: myRole });
        socket.emit('call_user', { offer: boostedOffer, callType: type, role: myRole });
      } catch (err) {
        console.error('[WebRTC Context] Failed to start call:', err);
        cleanupCall();
      }
    },
    [cleanupCall, createPeerConnection, partnerName, myRole, endCall]
  );

  const acceptCall = useCallback(
    async (customIncomingCall?: IncomingCall) => {
      const targetCall = customIncomingCall || incomingCall;
      if (!targetCall) return;
      const socket = getSocketInstance();

      try {
        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
            video: targetCall.callType === 'video' ? {
              width: { ideal: 1920, max: 1920 },
              height: { ideal: 1080, max: 1080 },
              frameRate: { ideal: 60, max: 60 },
            } : false,
          });
        } catch (err) {
          console.warn('[WebRTC Context] Accept call getUserMedia fallback:', err);
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: targetCall.callType === 'video',
            });
          } catch (micErr) {
            console.error('[WebRTC Context] Mic permission notice on accept:', micErr);
          }
        }

        if (stream) {
          localStreamRef.current = stream;
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play().catch(() => {});
          }
        }

        const pc = createPeerConnection();
        if (stream) {
          stream.getTracks().forEach((track) => {
            track.enabled = true;
            pc.addTrack(track, stream!);
          });
        }

        if (remoteAudioRef.current) {
          remoteAudioRef.current.muted = false;
          remoteAudioRef.current.volume = 1.0;
          remoteAudioRef.current.play().catch(() => {});
        }

        const boostedRemoteOffer = {
          type: targetCall.offer.type,
          sdp: boostSDPBitrate(targetCall.offer.sdp || ''),
        };
        await pc.setRemoteDescription(new RTCSessionDescription(boostedRemoteOffer));
        
        for (const candidate of pendingIceCandidatesRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        }
        pendingIceCandidatesRef.current = [];

        const answer = await pc.createAnswer();
        const boostedAnswer = {
          type: answer.type,
          sdp: boostSDPBitrate(answer.sdp || ''),
        };

        await pc.setLocalDescription(boostedAnswer);
        await applySenderOptimization(pc);

        setActiveCall({
          type: targetCall.callType,
          isOutgoing: false,
          partnerName: targetCall.fromName,
          status: 'connected',
        });
        setIncomingCall(null);

        socket.emit('identify', { role: myRole });
        socket.emit('answer_call', { answer: boostedAnswer, role: myRole });
      } catch (err) {
        console.error('[WebRTC Context] Failed to accept call:', err);
        cleanupCall();
      }
    },
    [incomingCall, cleanupCall, createPeerConnection, myRole]
  );

  const toggleMuteAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !audioTracks[0].enabled;
        audioTracks.forEach((t) => {
          t.enabled = nextState;
        });
        setIsAudioMuted(!nextState);
      }
    }
  }, []);

  const toggleMuteVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  }, []);

  // Global Real-time Signaling Socket Listeners (Single Source of Truth)
  useEffect(() => {
    const socket = getSocketInstance();
    if (myRole) {
      socket.emit('identify', { role: myRole });
    }

    const handleIncomingCall = (data: IncomingCall) => {
      console.log('[WebRTC Context] Global incoming call received:', data);
      setIncomingCall(data);
    };

    const handleCallAccepted = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      console.log('[WebRTC Context] Call accepted by partner');
      if (peerConnectionRef.current) {
        const boostedAnswer = {
          type: answer.type,
          sdp: boostSDPBitrate(answer.sdp || ''),
        };
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(boostedAnswer));
        await applySenderOptimization(peerConnectionRef.current);

        for (const candidate of pendingIceCandidatesRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        }
        pendingIceCandidatesRef.current = [];
        setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
      }
    };

    const handleCallRejected = () => {
      console.log('[WebRTC Context] Call rejected by partner');
      cleanupCall();
    };

    const handleIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (peerConnectionRef.current && candidate) {
        if (peerConnectionRef.current.remoteDescription) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        } else {
          pendingIceCandidatesRef.current.push(candidate);
        }
      }
    };

    const handleEndCall = () => {
      console.log('[WebRTC Context] Remote partner ended call');
      cleanupCall();
    };

    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_rejected', handleCallRejected);
    socket.on('ice_candidate', handleIceCandidate);
    socket.on('end_call', handleEndCall);

    return () => {
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('call_rejected', handleCallRejected);
      socket.off('ice_candidate', handleIceCandidate);
      socket.off('end_call', handleEndCall);
    };
  }, [cleanupCall, myRole]);

  return (
    <CallContext.Provider
      value={{
        activeCall,
        incomingCall,
        isAudioMuted,
        isVideoMuted,
        isScreenSharing,
        localStream,
        remoteStream,
        localVideoRef,
        remoteVideoRef,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMuteAudio,
        toggleMuteVideo,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return ctx;
}
