/**
 * ScreenVoiceRoom.jsx - React Thin-Client for Voice & Screen Sharing System
 * Architectural Pattern: "Thick Server, Thin Client" using mediasoup-client & Socket.io
 */

import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';

const SERVER_URL = process.env.VITE_SFU_SERVER_URL || 'http://localhost:5000';

export default function ScreenVoiceRoom({ roomId = 'discord-lounge', username = 'Maulik' }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Server-driven state maps for UI rendering
  const [participants, setParticipants] = useState({});
  const [screenStreams, setScreenStreams] = useState({}); // socketId -> { stream, username, producerId }

  const socketRef = useRef(null);
  const deviceRef = useRef(null);
  const sendTransportRef = useRef(null);
  const recvTransportRef = useRef(null);

  const micProducerRef = useRef(null);
  const screenProducerRef = useRef(null);

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Signaling] Connected to SFU Server with ID:', socket.id);
      joinChannel(roomId, username);
    });

    // Handle new stream broadcast from server
    socket.on('new_producer_available', async ({ producerId, producerSocketId, username, kind, source }) => {
      await consumeTrack(producerId, producerSocketId, username, kind, source);
    });

    // Handle screen share stop notification from server
    socket.on('screen_share_ended', ({ socketId }) => {
      setScreenStreams((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    });

    // Handle server-enforced mute updates
    socket.on('user_mute_state_changed', ({ socketId, isMuted }) => {
      setParticipants((prev) => ({
        ...prev,
        [socketId]: { ...prev[socketId], isMuted },
      }));
    });

    socket.on('user_left', ({ socketId }) => {
      setParticipants((prev) => { const n = { ...prev }; delete n[socketId]; return n; });
      setScreenStreams((prev) => { const n = { ...prev }; delete n[socketId]; return n; });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [roomId, username]);

  // Helper for server-authoritative transport creation
  const createTransportOnServer = (direction) => {
    return new Promise((resolve, reject) => {
      socketRef.current.emit('create_webrtc_transport', { direction }, (res) => {
        if (res.success) resolve(res.params);
        else reject(new Error(res.error));
      });
    });
  };

  // -------------------------------------------------------------
  // STEP 1: Handshake Lifecycle (join_channel & Device Init)
  // -------------------------------------------------------------
  const joinChannel = async (roomId, username) => {
    socketRef.current.emit('join_channel', { roomId, username }, async (res) => {
      if (!res.success) return console.error('[Client] Join channel failed:', res.error);

      // 1. Initialize mediasoup Device with server RTP capabilities
      const device = new mediasoupClient.Device();
      await device.load({ routerRtpCapabilities: res.routerRtpCapabilities });
      deviceRef.current = device;

      // 2. Create Send Transport (For local mic + screen share)
      const sendParams = await createTransportOnServer('send');
      const sendTransport = device.createSendTransport(sendParams);
      sendTransportRef.current = sendTransport;

      sendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
        socketRef.current.emit('connect_transport', { transportId: sendTransport.id, dtlsParameters }, (r) => {
          if (r.success) callback(); else errback(new Error(r.error));
        });
      });

      sendTransport.on('produce', ({ kind, rtpParameters, appData }, callback, errback) => {
        socketRef.current.emit('produce_track', { transportId: sendTransport.id, kind, rtpParameters, appData }, (r) => {
          if (r.error) errback(new Error(r.error)); else callback({ id: r.id });
        });
      });

      // 3. Create Recv Transport (For consuming room tracks)
      const recvParams = await createTransportOnServer('recv');
      const recvTransport = device.createRecvTransport(recvParams);
      recvTransportRef.current = recvTransport;

      recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
        socketRef.current.emit('connect_transport', { transportId: recvTransport.id, dtlsParameters }, (r) => {
          if (r.success) callback(); else errback(new Error(r.error));
        });
      });

      // 4. Capture Local Microphone Track
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const micTrack = micStream.getAudioTracks()[0];
        micProducerRef.current = await sendTransport.produce({ track: micTrack, appData: { source: 'mic' } });
      } catch (err) {
        console.warn('[Client] Could not capture microphone:', err);
      }

      setIsConnected(true);

      // 5. Consume existing active producers in room
      for (const p of res.existingProducers) {
        await consumeTrack(p.producerId, p.producerSocketId, p.username, p.kind, p.source);
      }
    });
  };

  // -------------------------------------------------------------
  // STEP 2: Consume Track Flow (Pipe SFU Audio/Video to DOM)
  // -------------------------------------------------------------
  const consumeTrack = async (producerId, producerSocketId, peerUsername, kind, source) => {
    socketRef.current.emit(
      'consume_track',
      {
        recvTransportId: recvTransportRef.current.id,
        producerId,
        rtpCapabilities: deviceRef.current.rtpCapabilities,
      },
      async (res) => {
        if (res.error) return console.error('[Client] Consume error:', res.error);

        const consumer = await recvTransportRef.current.consume({
          id: res.id,
          producerId: res.producerId,
          kind: res.kind,
          rtpParameters: res.rtpParameters,
        });

        const stream = new MediaStream([consumer.track]);

        if (source === 'mic') {
          const audioEl = new Audio();
          audioEl.srcObject = stream;
          audioEl.autoplay = true;
          audioEl.play().catch(() => {});
          setParticipants((prev) => ({ ...prev, [producerSocketId]: { username: peerUsername, isMuted: false } }));
        } else if (source === 'screen') {
          setScreenStreams((prev) => ({
            ...prev,
            [producerSocketId]: { stream, username: peerUsername, producerId },
          }));
        }
      }
    );
  };

  // -------------------------------------------------------------
  // STEP 3: Screen Share Intent & Native Floating Bar `onended`
  // -------------------------------------------------------------
  const handleStartScreenShare = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: true,
      });

      const videoTrack = displayStream.getVideoTracks()[0];

      // Native browser trigger: Fires when user clicks Chrome/Edge floating "Stop Sharing" bar
      videoTrack.onended = () => {
        handleStopScreenShare();
      };

      screenProducerRef.current = await sendTransportRef.current.produce({
        track: videoTrack,
        appData: { source: 'screen' },
      });

      setIsScreenSharing(true);
    } catch (err) {
      console.warn('[Client] Screen share cancelled or rejected:', err);
    }
  };

  const handleStopScreenShare = () => {
    if (screenProducerRef.current) {
      const producerId = screenProducerRef.current.id;
      screenProducerRef.current.close();
      screenProducerRef.current = null;
      socketRef.current.emit('close_producer', { producerId });
    }
    setIsScreenSharing(false);
  };

  // -------------------------------------------------------------
  // STEP 4: Server-Enforced Mute Toggle
  // -------------------------------------------------------------
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    socketRef.current.emit('toggle_mute', { isMuted: nextMute }, (res) => {
      if (res.success) setIsMuted(nextMute);
    });
  };

  return (
    <div style={{ padding: '2rem', background: '#111214', color: '#f2f3f5', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid #2b2d31', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>🎧 Voice Channel: #{roomId}</h2>
          <span style={{ fontSize: '0.88rem', color: isConnected ? '#23a55a' : '#f0b232', fontWeight: 600 }}>
            {isConnected ? '● Connected to SFU Server' : '○ Connecting to SFU Signaling...'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleToggleMute}
            disabled={!isConnected}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              background: isMuted ? '#da373c' : '#2b2d31',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isMuted ? '🔇 Unmute' : '🎙️ Mute'}
          </button>

          <button
            onClick={isScreenSharing ? handleStopScreenShare : handleStartScreenShare}
            disabled={!isConnected}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              background: isScreenSharing ? '#da373c' : '#5865f2',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isScreenSharing ? '🛑 Stop Screen Share' : '🖥️ Share Screen'}
          </button>
        </div>
      </header>

      {/* Screen Share Video Tiles */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#949ba4', marginBottom: '1rem' }}>ACTIVE SCREEN SHARES</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(520px, 1fr))', gap: '1.5rem' }}>
          {Object.entries(screenStreams).length === 0 && (
            <div style={{ padding: '3rem', background: '#1e1f22', borderRadius: '12px', border: '1px dashed #35363c', textAlign: 'center', color: '#949ba4' }}>
              No active screen shares in this channel. Click "Share Screen" above to stream your display!
            </div>
          )}
          {Object.entries(screenStreams).map(([socketId, { stream, username }]) => (
            <div key={socketId} style={{ background: '#1e1f22', borderRadius: '12px', overflow: 'hidden', border: '1px solid #2b2d31' }}>
              <div style={{ padding: '0.65rem 1rem', background: '#2b2d31', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#23a55a' }} />
                {username}'s Screen
              </div>
              <video
                ref={(el) => { if (el && stream) el.srcObject = stream; }}
                autoPlay
                playsInline
                controls={false}
                style={{ width: '100%', height: '340px', objectFit: 'contain', background: '#000' }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Voice Members List */}
      <section>
        <h3 style={{ fontSize: '1.1rem', color: '#949ba4', marginBottom: '1rem' }}>CHANNEL MEMBERS</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {Object.entries(participants).map(([id, info]) => (
            <div key={id} style={{ background: '#1e1f22', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #2b2d31', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>{info.username}</span>
              <span style={{ fontSize: '0.82rem', color: info.isMuted ? '#da373c' : '#23a55a', fontWeight: 700 }}>
                {info.isMuted ? 'MUTED' : 'SPEAKING'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
