/**
 * mediasoup-sfu-server.js - Discord-Style Voice & Screen Sharing SFU Engine
 * Stack: Node.js, mediasoup (v3), Express, Socket.io
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mediasoup = require('mediasoup');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// ------------------------------------------------------------------
// 1. MEDIASOUP ENGINE CONFIGURATION (Codecs: Opus, VP8, H264)
// ------------------------------------------------------------------
const MEDIASOUP_CONFIG = {
  worker: {
    logLevel: 'warn',
    rtcMinPort: 40000,
    rtcMaxPort: 49999,
  },
  router: {
    mediaCodecs: [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: { 'x-google-start-bitrate': 1000 },
      },
      {
        kind: 'video',
        mimeType: 'video/h264',
        clockRate: 90000,
        parameters: {
          'packetization-mode': 1,
          'profile-level-id': '42e01f',
          'level-asymmetry-allowed': 1,
        },
      },
    ],
  },
  webRtcTransport: {
    listenIps: [
      {
        ip: process.env.MEDIASOUP_LISTEN_IP || '127.0.0.1',
        announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP || null,
      },
    ],
    initialAvailableOutgoingBitrate: 3000000, // 3 Mbps bitrate for 1080p screen share
  },
};

// Global Server State (Thick Server Pattern)
let worker;
const rooms = new Map(); // roomId -> { router, peers: Map<socketId, PeerState> }

/**
 * PeerState in Room:
 * {
 *   id: socketId,
 *   username: string,
 *   isMuted: boolean,
 *   transports: Map<transportId, WebRtcTransport>,
 *   producers: Map<producerId, Producer>,
 *   consumers: Map<consumerId, Consumer>
 * }
 */

async function startMediasoupWorker() {
  worker = await mediasoup.createWorker(MEDIASOUP_CONFIG.worker);
  worker.on('died', () => {
    console.error('[mediasoup] Worker died, terminating server process...');
    process.exit(1);
  });
  console.log('[mediasoup] SFU Worker process initialized successfully.');
}
startMediasoupWorker();

async function getOrCreateRoom(roomId) {
  if (rooms.has(roomId)) return rooms.get(roomId);
  const router = await worker.createRouter({ mediaCodecs: MEDIASOUP_CONFIG.router.mediaCodecs });
  const room = { id: roomId, router, peers: new Map() };
  rooms.set(roomId, room);
  console.log(`[Room Manager] Created router for room: ${roomId}`);
  return room;
}

async function createWebRtcTransport(router) {
  const transport = await router.createWebRtcTransport(MEDIASOUP_CONFIG.webRtcTransport);
  return {
    transport,
    params: {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    },
  };
}

// ------------------------------------------------------------------
// 2. SOCKET.IO SIGNALING & EVENT LIFECYCLE
// ------------------------------------------------------------------
io.on('connection', (socket) => {
  let currentRoomId = null;

  // EVENT 1: join_channel
  socket.on('join_channel', async ({ roomId, username }, callback) => {
    try {
      currentRoomId = roomId;
      const room = await getOrCreateRoom(roomId);

      const peerState = {
        id: socket.id,
        username: username || `User_${socket.id.substring(0, 4)}`,
        isMuted: false,
        transports: new Map(),
        producers: new Map(),
        consumers: new Map(),
      };

      room.peers.set(socket.id, peerState);
      socket.join(roomId);

      // Collect active producers in the room to inform new joiner
      const existingProducers = [];
      for (const [pId, peer] of room.peers.entries()) {
        if (pId === socket.id) continue;
        for (const [producerId, producer] of peer.producers.entries()) {
          existingProducers.push({
            producerId,
            producerSocketId: pId,
            username: peer.username,
            kind: producer.kind,
            source: producer.appData?.source || 'mic',
            isMuted: peer.isMuted,
          });
        }
      }

      callback({
        success: true,
        routerRtpCapabilities: room.router.rtpCapabilities,
        existingProducers,
      });

      console.log(`[Join Channel] ${peerState.username} (${socket.id}) joined ${roomId}`);
    } catch (err) {
      console.error('[join_channel] Error:', err);
      callback({ success: false, error: err.message });
    }
  });

  // EVENT 2: create_webrtc_transport
  socket.on('create_webrtc_transport', async ({ direction }, callback) => {
    try {
      const room = rooms.get(currentRoomId);
      const peer = room?.peers.get(socket.id);
      if (!room || !peer) throw new Error('Peer or room state missing.');

      const { transport, params } = await createWebRtcTransport(room.router);
      peer.transports.set(transport.id, transport);

      callback({ success: true, params });
      console.log(`[Transport] Created ${direction} transport ${transport.id} for ${peer.username}`);
    } catch (err) {
      console.error('[create_webrtc_transport] Error:', err);
      callback({ success: false, error: err.message });
    }
  });

  // EVENT 3: connect_transport (DTLS Handshake)
  socket.on('connect_transport', async ({ transportId, dtlsParameters }, callback) => {
    try {
      const room = rooms.get(currentRoomId);
      const peer = room?.peers.get(socket.id);
      const transport = peer?.transports.get(transportId);

      if (!transport) throw new Error(`Transport ${transportId} not found.`);

      await transport.connect({ dtlsParameters });
      callback({ success: true });
      console.log(`[DTLS] Transport ${transportId} connected successfully.`);
    } catch (err) {
      console.error('[connect_transport] Error:', err);
      callback({ success: false, error: err.message });
    }
  });

  // EVENT 4: produce_track (Microphone OR Screen Share)
  socket.on('produce_track', async ({ transportId, kind, rtpParameters, appData }, callback) => {
    try {
      const room = rooms.get(currentRoomId);
      const peer = room?.peers.get(socket.id);
      const transport = peer?.transports.get(transportId);
      const source = appData?.source || 'mic';

      if (!transport) throw new Error('Transport not found.');

      // Permission Constraint: Only 1 active screen share allowed per user at a time
      if (source === 'screen') {
        for (const [pId, existingProducer] of peer.producers.entries()) {
          if (existingProducer.appData?.source === 'screen') {
            existingProducer.close();
            peer.producers.delete(pId);
            socket.to(currentRoomId).emit('screen_share_ended', { producerId: pId, socketId: socket.id });
          }
        }
      }

      const producer = await transport.produce({ kind, rtpParameters, appData: { source } });
      peer.producers.set(producer.id, producer);

      if (source === 'mic' && peer.isMuted) {
        await producer.pause();
      }

      callback({ id: producer.id });

      if (source === 'screen') {
        socket.to(currentRoomId).emit('screen_share_started', {
          producerId: producer.id,
          userId: socket.id,
          username: peer.username,
        });
      }

      socket.to(currentRoomId).emit('new_producer_available', {
        producerId: producer.id,
        producerSocketId: socket.id,
        username: peer.username,
        kind,
        source,
      });

      console.log(`[Producer] Created ${source} producer (${kind}) ID: ${producer.id}`);
    } catch (err) {
      console.error('[produce_track] Error:', err);
      callback({ error: err.message });
    }
  });

  // EVENT 5: consume_track
  socket.on('consume_track', async ({ recvTransportId, producerId, rtpCapabilities }, callback) => {
    try {
      const room = rooms.get(currentRoomId);
      const peer = room?.peers.get(socket.id);
      const recvTransport = peer?.transports.get(recvTransportId);

      if (!room.router.canConsume({ producerId, rtpCapabilities })) {
        return callback({ error: 'Router cannot consume producer with client capabilities.' });
      }

      const consumer = await recvTransport.consume({
        producerId,
        rtpCapabilities,
        paused: false,
      });

      peer.consumers.set(consumer.id, consumer);

      consumer.on('transportclose', () => peer.consumers.delete(consumer.id));
      consumer.on('producerclose', () => {
        peer.consumers.delete(consumer.id);
        socket.emit('consumer_closed', { consumerId: consumer.id });
      });

      callback({
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      });
      console.log(`[Consumer] Piped consumer ${consumer.id} for producer ${producerId}`);
    } catch (err) {
      console.error('[consume_track] Error:', err);
      callback({ error: err.message });
    }
  });

  // EVENT 6: close_producer (Explicit Stop Mic / Screen Share)
  socket.on('close_producer', async ({ producerId }, callback) => {
    try {
      const room = rooms.get(currentRoomId);
      const peer = room?.peers.get(socket.id);
      const producer = peer?.producers.get(producerId);

      if (producer) {
        const source = producer.appData?.source;
        producer.close();
        peer.producers.delete(producerId);

        if (source === 'screen') {
          socket.to(currentRoomId).emit('screen_share_ended', { producerId, socketId: socket.id });
        }
      }

      if (callback) callback({ success: true });
    } catch (err) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // EVENT 7: toggle_mute (Server-Enforced Stream Pause)
  socket.on('toggle_mute', async ({ isMuted }, callback) => {
    try {
      const room = rooms.get(currentRoomId);
      const peer = room?.peers.get(socket.id);
      if (!peer) return;

      peer.isMuted = isMuted;

      for (const [, producer] of peer.producers.entries()) {
        if (producer.appData?.source === 'mic') {
          if (isMuted) await producer.pause();
          else await producer.resume();
        }
      }

      io.to(currentRoomId).emit('user_mute_state_changed', { socketId: socket.id, isMuted });
      callback({ success: true, isMuted });
    } catch (err) {
      callback({ success: false, error: err.message });
    }
  });

  // EVENT 8: leave_channel / disconnect
  const handleLeaveChannel = () => {
    if (currentRoomId && rooms.has(currentRoomId)) {
      const room = rooms.get(currentRoomId);
      const peer = room.peers.get(socket.id);
      if (peer) {
        peer.transports.forEach((t) => t.close());
        room.peers.delete(socket.id);
        io.to(currentRoomId).emit('user_left', { socketId: socket.id });
      }
      if (room.peers.size === 0) {
        room.router.close();
        rooms.delete(currentRoomId);
        console.log(`[Room Manager] Closed empty room: ${currentRoomId}`);
      }
    }
  };

  socket.on('leave_channel', handleLeaveChannel);
  socket.on('disconnect', handleLeaveChannel);
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 mediasoup SFU Server running on http://localhost:${PORT}`));
