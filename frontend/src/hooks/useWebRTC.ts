import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocketInstance } from './useSocket';

export type CallType = 'audio' | 'video' | 'screenshare';

export interface IncomingCall {
  from: string;
  fromName: string;
  offer: RTCSessionDescriptionInit;
  callType: CallType;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
};

// Munge SDP string to force 1080p high bitrate & eliminate initial WebRTC probing latency
function boostSDPBitrate(sdp: string): string {
  if (!sdp) return sdp;
  const lines = sdp.split('\r\n');
  const modified: string[] = [];
  let inVideo = false;

  for (const line of lines) {
    if (line.startsWith('m=video')) {
      inVideo = true;
      modified.push(line);
      modified.push('b=AS:15000');
      modified.push('b=TIAS:15000000');
      continue;
    } else if (line.startsWith('m=')) {
      inVideo = false;
    }

    if (inVideo && line.startsWith('a=fmtp:')) {
      modified.push(`${line};x-google-min-bitrate=6000;x-google-start-bitrate=12000;x-google-max-bitrate=15000`);
    } else {
      modified.push(line);
    }
  }
  return modified.join('\r\n');
}

// Optimize WebRTC sender parameters for maximum 60fps framerate & crisp 1080p resolution
async function applySenderOptimization(pc: RTCPeerConnection) {
  const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
  if (!videoSender) return;

  try {
    const parameters = videoSender.getParameters();
    if (!parameters.encodings || parameters.encodings.length === 0) {
      parameters.encodings = [{}];
    }

    parameters.encodings[0].maxBitrate = 15000000; // 15 Mbps Ultra HD
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

// Prioritize hardware-accelerated H264 video codec over software VP8/VP9 to prevent stuttering
function prioritizeH264Codec(pc: RTCPeerConnection) {
  if (typeof RTCRtpSender.getCapabilities === 'function') {
    try {
      const capabilities = RTCRtpSender.getCapabilities('video');
      if (capabilities && capabilities.codecs) {
        const h264Codecs = capabilities.codecs.filter((c) => c.mimeType.toLowerCase() === 'video/h264');
        const otherCodecs = capabilities.codecs.filter((c) => c.mimeType.toLowerCase() !== 'video/h264');
        const sortedCodecs = [...h264Codecs, ...otherCodecs];

        pc.getTransceivers().forEach((transceiver) => {
          if (transceiver.sender.track?.kind === 'video' || transceiver.receiver.track?.kind === 'video') {
            if (typeof transceiver.setCodecPreferences === 'function') {
              transceiver.setCodecPreferences(sortedCodecs);
            }
          }
        });
      }
    } catch (e) {
      console.log('[WebRTC] Codec preferences notice:', e);
    }
  }
}

export function useWebRTC(myRole: string) {
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
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const partnerName = myRole === 'boyfriend' ? 'Seema' : 'Maulik';

  const cleanupCall = useCallback(() => {
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

  // Initialize Peer Connection
  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    const socket = getSocketInstance();

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice_candidate', { candidate: event.candidate, role: myRole });
      }
    };


    pc.ontrack = (event) => {
      console.log('[WebRTC] Received remote track:', event.track.kind);
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }
      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach((t) => {
          if (!remoteStreamRef.current?.getTracks().some((existing) => existing.id === t.id)) {
            remoteStreamRef.current?.addTrack(t);
          }
        });
      } else {
        if (!remoteStreamRef.current.getTracks().some((t) => t.id === event.track.id)) {
          remoteStreamRef.current.addTrack(event.track);
        }
      }
      setRemoteStream(remoteStreamRef.current);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.play().catch(() => {});
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, []);

  // Start Outgoing Call
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
            console.warn('[WebRTC] getDisplayMedia with audio failed, falling back to video-only stream:', e);
            stream = await navigator.mediaDevices.getDisplayMedia({
              video: {
                width: { ideal: 1920, max: 3840 },
                height: { ideal: 1080, max: 2160 },
                frameRate: { ideal: 60, max: 60 },
              },
            });
          }

          const videoTrack = stream.getVideoTracks()[0];
          if (videoTrack && 'contentHint' in videoTrack) {
            (videoTrack as any).contentHint = 'detail';
          }

          setIsScreenSharing(true);

          stream.getVideoTracks()[0].onended = () => {
            endCall();
          };
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: type === 'video' ? {
              width: { ideal: 1920, max: 1920 },
              height: { ideal: 1080, max: 1080 },
              frameRate: { ideal: 60, max: 60 },
            } : false,
          });

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
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        prioritizeH264Codec(pc);

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
        console.error('Failed to start call:', err);
        cleanupCall();
      }
    },
    [cleanupCall, createPeerConnection, partnerName, myRole]
  );

  // Accept Incoming Call
  const acceptCall = useCallback(
    async (customIncomingCall?: IncomingCall) => {
      const targetCall = customIncomingCall || incomingCall;
      if (!targetCall) return;
      const socket = getSocketInstance();

      try {
        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: targetCall.callType === 'video' ? {
              width: { ideal: 1920, max: 1920 },
              height: { ideal: 1080, max: 1080 },
              frameRate: { ideal: 60, max: 60 },
            } : false,
          });
        } catch {
          // Mic permission denied or unavailable — proceed audio-less
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
          stream.getTracks().forEach((track) => pc.addTrack(track, stream!));
        }

        prioritizeH264Codec(pc);

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
        console.error('Failed to accept call:', err);
        cleanupCall();
      }
    },
    [incomingCall, cleanupCall, createPeerConnection, myRole]
  );

  // Reject Incoming Call
  const rejectCall = useCallback(() => {
    const socket = getSocketInstance();
    socket.emit('reject_call', { role: myRole });
    setIncomingCall(null);
  }, [myRole]);

  // End Current Call
  const endCall = useCallback(() => {
    const socket = getSocketInstance();
    socket.emit('end_call', { role: myRole });
    cleanupCall();
  }, [cleanupCall, myRole]);


  // Toggle Mute Audio
  const toggleMuteAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // Toggle Camera Video
  const toggleMuteVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  }, []);

  // Listen to Socket Signaling Events
  useEffect(() => {
    const socket = getSocketInstance();
    if (myRole) {
      socket.emit('identify', { role: myRole });
    }


    const handleIncomingCall = (data: IncomingCall) => {
      console.log('[WebRTC] Incoming call:', data);
      setIncomingCall(data);
    };

    const handleCallAccepted = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      console.log('[WebRTC] Call accepted by partner');
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
  }, [cleanupCall]);

  return {
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
  };
}
