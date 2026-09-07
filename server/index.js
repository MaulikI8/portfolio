const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const { newGame: createUnoEngineGame, applyMove: applyUnoMove, IllegalMoveError } = require('./unoEngine');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true },
  pingInterval: 10000,
  pingTimeout: 5000,
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

// ── Data Store ──────────────────────────────────────────────────────────────
const DATA_FILE = path.join(__dirname, 'data.json');

const INITIAL_DATA = {
  partners: {
    boyfriend: {
      id: 1, role: 'boyfriend', name: 'Maulik',
      avatar: null, avatar_url: null, halo_color: '#E8567D',
      is_online: false, last_seen: new Date().toISOString(), pin: '6767',
    },
    girlfriend: {
      id: 2, role: 'girlfriend', name: 'Seema',
      avatar: null, avatar_url: null, halo_color: '#F59E0B',
      is_online: false, last_seen: new Date().toISOString(), pin: '6767',
    },
  },
  activeUserRole: 'boyfriend',
  streak: { current: 0, longest: 0, last_played_on: null, streak_active: false },
  notes: [],
  memories: [],
  chat: [],
  activeRoom: { id: 101, game_type: 'uno', game_type_display: 'UNO Battle', state: {}, status: 'active', created_by: 'boyfriend', turn: 1, created_at: new Date().toISOString() },
  gamesHistory: [],
  scoreboard: [],
  notifications: [],
  unoSessionScores: { boyfriend: 0, girlfriend: 0, totalGames: 0 },
};


function loadData() {
  try { if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); } catch {}
  return INITIAL_DATA;
}

function saveData(data) {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8'); } catch {}
  syncCloudSave(data);
}

// Cloud persistence sync (Upstash Redis Cloud DB)
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || 'https://better-katydid-109297.upstash.io';
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || 'gQAAAAAAarxAAIgcDI4OThkHzQOMGI1ZTg0ZDFKYTi5NTUxy2I5NjU5OTY2Nw';

async function syncCloudSave(data) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return;
  try {
    await fetch(`${UPSTASH_URL}/set/seema_app_data`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      body: JSON.stringify(data),
    });
  } catch (e) {
    console.error('[Cloud DB] Save error:', e.message);
  }
}

async function syncCloudLoad() {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return;
  try {
    const res = await fetch(`${UPSTASH_URL}/get/seema_app_data`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    });
    const json = await res.json();
    if (json && json.result) {
      const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
      store = { ...store, ...parsed };
      try { fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8'); } catch {}
      console.log('[Cloud DB] Data restored successfully from cloud database');
    }
  } catch (e) {
    console.error('[Cloud DB] Load error:', e.message);
  }
}

let store = loadData();
syncCloudLoad();

// ── Connected sockets tracker ───────────────────────────────────────────────
// Map<socketId, { role, name }>
const connectedUsers = new Map();

function getPartnerSocket(forRole) {
  const otherRole = forRole === 'boyfriend' ? 'girlfriend' : 'boyfriend';
  for (const [sid, info] of connectedUsers.entries()) {
    if (info.role === otherRole) return io.sockets.sockets.get(sid);
  }
  return null;
}

function broadcastPresence() {
  const roles = {};
  for (const [, info] of connectedUsers) roles[info.role] = true;
  io.emit('presence', {
    boyfriend: !!roles.boyfriend,
    girlfriend: !!roles.girlfriend,
  });
}

// ── Socket.IO ───────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // Identify which role this socket belongs to
  socket.on('identify', ({ role }) => {
    if (role !== 'boyfriend' && role !== 'girlfriend') return;
    connectedUsers.set(socket.id, { role, name: role === 'boyfriend' ? 'Maulik' : 'Seema' });
    store.partners[role].is_online = true;
    store.partners[role].last_seen = new Date().toISOString();
    saveData(store);
    broadcastPresence();
    console.log(`[Socket] Identified: ${socket.id} → ${role}`);
  });

  // ── Chat Messages ──────────────────────────────────────────────────────
  socket.on('chat_message', (msg) => {
    const info = connectedUsers.get(socket.id);
    if (!info) return;
    const newMsg = {
      id: Date.now().toString(),
      sender: info.role,
      message_type: msg.message_type || 'text',
      text: msg.text || msg.content || '',
      media_url: msg.media_url,
      sticker_id: msg.sticker_id,
      sticker_emoji: msg.sticker_emoji,
      timestamp: new Date().toISOString(),
      time_str: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date_str: new Date().toISOString().split('T')[0],
      reactions: [],
      is_seen: false,
    };
    store.chat.push(newMsg);
    saveData(store);
    // Send to ALL connected sockets (including sender for confirmation)
    io.emit('chat_message', newMsg);
  });

  // ── Mark Messages as Seen ──────────────────────────────────────────────
  socket.on('mark_seen', () => {
    const info = connectedUsers.get(socket.id);
    if (!info) return;
    let updated = false;
    store.chat.forEach((m) => {
      if (m.sender !== info.role && !m.is_seen) {
        m.is_seen = true;
        updated = true;
      }
    });
    if (updated) {
      saveData(store);
      io.emit('messages_seen', { seenBy: info.role });
    }
  });

  // ── Typing Indicator ───────────────────────────────────────────────────
  socket.on('typing', ({ isTyping }) => {
    const info = connectedUsers.get(socket.id);
    if (!info) return;
    socket.broadcast.emit('partner_typing', { role: info.role, isTyping });
  });

  // ── Nudge / Thinking-of-you ────────────────────────────────────────────
  socket.on('nudge', ({ emoji, label }) => {
    const info = connectedUsers.get(socket.id);
    if (!info) return;
    socket.broadcast.emit('nudge', { from: info.role, fromName: info.name, emoji, label });
  });

  // ── Social Reactions (floating emoji) ──────────────────────────────────
  socket.on('reaction', ({ emoji }) => {
    const info = connectedUsers.get(socket.id);
    if (!info) return;
    socket.broadcast.emit('reaction', { from: info.role, fromName: info.name, emoji });
  });

  // ── Love Note ──────────────────────────────────────────────────────────
  socket.on('love_note', ({ message }) => {
    const info = connectedUsers.get(socket.id);
    if (!info) return;
    const newNote = {
      id: Date.now(),
      sender_role: info.role,
      sender_name: info.name,
      recipient_role: info.role === 'boyfriend' ? 'girlfriend' : 'boyfriend',
      content: message || 'Thinking of you! ❤️',
      created_at: new Date().toISOString(),
      is_seen: false,
    };
    store.notes.unshift(newNote);
    saveData(store);
    io.emit('love_note', newNote);
  });

  // ── Notification push ──────────────────────────────────────────────────
  socket.on('notification', (notif) => {
    const info = connectedUsers.get(socket.id);
    if (!info) return;
    const newNotif = {
      id: Date.now(),
      kind: notif.kind || 'general',
      title: notif.title || 'Notification',
      body: notif.body || '',
      created_at: new Date().toISOString(),
      read: false,
      from: info.role,
    };
    store.notifications.push(newNotif);
    saveData(store);
    socket.broadcast.emit('notification', newNotif);
  });

  // ── WebRTC Video / Audio Calling & Screen Share Signaling ────────────────
  socket.on('call_user', ({ offer, callType, role }) => {
    let info = connectedUsers.get(socket.id);
    if (!info && role) {
      info = { role, name: role === 'boyfriend' ? 'Maulik' : 'Seema' };
      connectedUsers.set(socket.id, info);
    }
    const fromRole = info ? info.role : (role || 'boyfriend');
    const fromName = info ? info.name : (fromRole === 'boyfriend' ? 'Maulik' : 'Seema');

    socket.broadcast.emit('incoming_call', {
      from: fromRole,
      fromName,
      offer,
      callType: callType || 'video',
    });
    console.log(`[Socket] Call initiated by ${fromName} (${callType})`);
  });

  socket.on('answer_call', ({ answer, role }) => {
    let info = connectedUsers.get(socket.id);
    if (!info && role) {
      info = { role, name: role === 'boyfriend' ? 'Maulik' : 'Seema' };
      connectedUsers.set(socket.id, info);
    }
    const fromRole = info ? info.role : (role || 'girlfriend');
    socket.broadcast.emit('call_accepted', {
      from: fromRole,
      answer,
    });
    console.log(`[Socket] Call accepted by ${fromRole}`);
  });

  socket.on('reject_call', (data) => {
    const info = connectedUsers.get(socket.id);
    const fromRole = info ? info.role : (data?.role || 'boyfriend');
    socket.broadcast.emit('call_rejected', { from: fromRole });
  });

  socket.on('ice_candidate', ({ candidate, role }) => {
    const info = connectedUsers.get(socket.id);
    const fromRole = info ? info.role : (role || 'boyfriend');
    socket.broadcast.emit('ice_candidate', { from: fromRole, candidate });
  });

  socket.on('end_call', (data) => {
    const info = connectedUsers.get(socket.id);
    const fromRole = info ? info.role : (data?.role || 'boyfriend');
    socket.broadcast.emit('end_call', { from: fromRole });
    console.log(`[Socket] Call ended by ${fromRole}`);
  });


  socket.on('movie_whisper', (data) => {
    const info = connectedUsers.get(socket.id);
    if (!info) return;
    socket.broadcast.emit('movie_whisper', {
      id: Date.now(),
      sender: info.name,
      text: data.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  });

  socket.on('movie_reaction', (data) => {
    socket.broadcast.emit('movie_reaction', data);
  });

// ── Server-Side Authoritative UNO Engine ─────────────────────────────────
const COLORS = ['red', 'blue', 'green', 'yellow'];
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ACTIONS = ['Skip', 'Reverse', '+2'];

function calculateHandPoints(hand) {
  if (!Array.isArray(hand)) return 0;
  return hand.reduce((total, card) => {
    if (!card || !card.value) return total;
    const val = card.value;
    if (val >= '0' && val <= '9') {
      return total + parseInt(val, 10);
    }
    if (val === 'Skip' || val === 'Reverse' || val === 'Discard All') {
      return total + 20;
    }
    if (val === '+2') {
      return total + 30;
    }
    if (val === 'Wild' || val === '+4') {
      return total + 50;
    }
    return total;
  }, 0);
}

function createUnoDeck() {
  const deck = [];
  let cardId = 1;

  COLORS.forEach((color) => {
    deck.push({ id: `card_${cardId++}`, color, value: '0' });
    NUMBERS.slice(1).forEach((val) => {
      deck.push({ id: `card_${cardId++}`, color, value: val });
      deck.push({ id: `card_${cardId++}`, color, value: val });
    });
    ACTIONS.forEach((val) => {
      deck.push({ id: `card_${cardId++}`, color, value: val });
      deck.push({ id: `card_${cardId++}`, color, value: val });
    });
  });

  for (let i = 0; i < 4; i++) {
    deck.push({ id: `card_${cardId++}`, color: 'wild', value: 'Wild' });
    deck.push({ id: `card_${cardId++}`, color: 'wild', value: '+4' });
  }

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

let unoRoomRoles = new Map(); // role -> socketId
let unoReadyRoles = new Set(); // roles ready to play again
let unoMatchTimer = null;
const MATCH_DURATION_SEC = 300; // Universal 5 minutes

let unoSessionScores = (store && store.unoSessionScores) ? store.unoSessionScores : { boyfriend: 0, girlfriend: 0, totalGames: 0 };

let unoRoomState = (store && store.unoRoomState && Array.isArray(store.unoRoomState.boyfriendHand) && store.unoRoomState.boyfriendHand.length > 0)
  ? store.unoRoomState
  : {
      isGameActive: false,
      boyfriendHand: [],
      girlfriendHand: [],
      deck: [],
      discardPile: [],
      activeColor: 'red',
      currentTurn: 'boyfriend',
      pendingDraw: 0,
      matchEndTime: 0,
    };

function persistUnoState() {
  if (store) {
    store.unoRoomState = unoRoomState;
    saveData(store);
  }
}

function getPresentUnoRoles() {
  return Array.from(unoRoomRoles.keys());
}

function sendUnoSyncToRoom(extraPayload = {}) {
  const presentRoles = getPresentUnoRoles();
  const isWaitingForPartner = presentRoles.length < 2 && !unoRoomState.isGameActive;
  const matchTimeLeft = unoRoomState.matchEndTime ? Math.max(0, Math.floor((unoRoomState.matchEndTime - Date.now()) / 1000)) : 300;

  for (const [socketId, s] of io.sockets.sockets.entries()) {
    let info = connectedUsers.get(socketId);
    if (!info) {
      for (const [r, sid] of unoRoomRoles.entries()) {
        if (sid === socketId) {
          info = { role: r, name: r === 'boyfriend' ? 'Maulik' : 'Seema' };
          connectedUsers.set(socketId, info);
          break;
        }
      }
    }
    if (!info) continue;

    const isBoyfriend = info.role === 'boyfriend';
    const myHand = isBoyfriend ? unoRoomState.boyfriendHand : unoRoomState.girlfriendHand;
    const opponentHandCount = isBoyfriend ? unoRoomState.girlfriendHand.length : unoRoomState.boyfriendHand.length;
    const topDiscard = unoRoomState.discardPile[unoRoomState.discardPile.length - 1] || null;

    const drawnPlayableCard = (extraPayload.isDrawnPlayable && extraPayload.actionRole === info.role) ? extraPayload.drawnCard : null;

    const statePayload = {
      my_hand: myHand,
      myHand,
      opponent_hand_count: opponentHandCount,
      opponentHandCount,
      discard_pile: unoRoomState.discardPile,
      top_discard: topDiscard,
      topDiscard,
      current_color: unoRoomState.activeColor,
      activeColor: unoRoomState.activeColor,
      turn: unoRoomState.currentTurn,
      currentTurn: unoRoomState.currentTurn,
      pending_draw: unoRoomState.pendingDraw,
      pendingDraw: unoRoomState.pendingDraw,
      matchTimeLeft,
      isGameActive: unoRoomState.isGameActive,
      is_game_active: unoRoomState.isGameActive,
      drawnPlayableCard,
      unoCalled: unoRoomState.unoCalled || { boyfriend: false, girlfriend: false },
    };

    s.emit('game_message', {
      type: 'state_update',
      state: statePayload,
      turn: unoRoomState.currentTurn,
      status: unoRoomState.isGameActive ? 'active' : 'waiting',
    });

    s.emit('uno_sync', {
      isGameActive: unoRoomState.isGameActive,
      isWaitingForPartner,
      connectedRoles: presentRoles,
      readyRoles: Array.from(unoReadyRoles),
      myHand,
      opponentHandCount,
      topDiscard,
      activeColor: unoRoomState.activeColor,
      currentTurn: unoRoomState.currentTurn,
      pendingDraw: unoRoomState.pendingDraw,
      deckCount: unoRoomState.deck.length,
      matchTimeLeft,
      drawnPlayableCard,
      unoCalled: unoRoomState.unoCalled || { boyfriend: false, girlfriend: false },
    });
  }
}

function startUnoGame() {
  if (unoMatchTimer) clearInterval(unoMatchTimer);

  const engineState = createUnoEngineGame();
  const matchEndTime = Date.now() + MATCH_DURATION_SEC * 1000;

  unoRoomState = {
    isGameActive: true,
    boyfriendHand: engineState.hands.boyfriend,
    girlfriendHand: engineState.hands.girlfriend,
    deck: engineState.drawPile,
    discardPile: engineState.discardPile,
    activeColor: engineState.currentColor,
    currentTurn: engineState.turn,
    pendingDraw: engineState.pendingDraw,
    matchEndTime,
    unoCalled: engineState.unoCalled || { boyfriend: false, girlfriend: false },
  };
  unoReadyRoles.clear();
  persistUnoState();
  sendUnoSyncToRoom();

  unoMatchTimer = setInterval(() => {
    if (unoRoomState.matchEndTime && Date.now() >= unoRoomState.matchEndTime) {
      clearInterval(unoMatchTimer);
      unoMatchTimer = null;
      unoRoomState.isGameActive = false;

      const bfPts = calculateHandPoints(unoRoomState.boyfriendHand);
      const gfPts = calculateHandPoints(unoRoomState.girlfriendHand);
      let winnerRole = 'tie';
      let winnerName = 'Tie';
      if (bfPts < gfPts) {
        winnerRole = 'boyfriend';
        winnerName = 'Maulik';
      } else if (gfPoints < bfPoints) {
        winnerRole = 'girlfriend';
        winnerName = 'Seema';
      }

      const record = {
        id: Date.now(),
        game_type: 'uno',
        winner: winnerName,
        played_at: new Date().toISOString(),
        reason: 'timer_expired',
        boyfriendPoints: bfPoints,
        girlfriendPoints: gfPoints,
      };
      if (winnerRole && unoSessionScores[winnerRole] !== undefined) {
        unoSessionScores[winnerRole]++;
        unoSessionScores.totalGames++;
        store.unoSessionScores = unoSessionScores;
      }
      store.gamesHistory.unshift(record);
      saveData(store);

      io.to('uno_room').emit('uno_game_over', {
        winnerRole,
        winnerName,
        reason: 'timer_expired',
        boyfriendHandPoints: bfPoints,
        girlfriendHandPoints: gfPoints,
        sessionScores: unoSessionScores,
      });
      sendUnoSyncToRoom();

    }
  }, 1000);
}

  // ── Authoritative Real-Time UNO Game Handlers ───────────────────────────
  socket.on('uno_join', (data) => {
    let info = connectedUsers.get(socket.id);
    if (!info && data?.role) {
      info = { role: data.role, name: data.role === 'boyfriend' ? 'Maulik' : 'Seema' };
      connectedUsers.set(socket.id, info);
    }
    if (!info) return;

    socket.join('uno_room');
    unoRoomRoles.set(info.role, socket.id);

    const presentRoles = getPresentUnoRoles();

    if (unoRoomState.isGameActive) {
      sendUnoSyncToRoom();
    } else {
      if (presentRoles.length >= 2) {
        startUnoGame();
      } else {
        sendUnoSyncToRoom();
      }
    }
  });

  socket.on('uno_leave', () => {
    const info = connectedUsers.get(socket.id);
    if (info && unoRoomRoles.get(info.role) === socket.id) {
      unoRoomRoles.delete(info.role);
    }
    sendUnoSyncToRoom();
  });

  socket.on('uno_nudge', () => {
    const info = connectedUsers.get(socket.id);
    if (!info) return;
    const partnerRole = info.role === 'boyfriend' ? 'girlfriend' : 'boyfriend';
    for (const [sId, uInfo] of connectedUsers.entries()) {
      if (uInfo.role === partnerRole) {
        io.to(sId).emit('game_invite_modal', {
          senderName: info.name,
          gameType: 'UNO',
          gameSlug: 'uno',
          message: `${info.name} sent you a game invite for UNO!`
        });
        io.to(sId).emit('game_nudge_toast', {
          senderName: info.name,
          gameType: 'UNO',
          message: `${info.name} is waiting for you in UNO!`
        });
      }
    }
  });

  socket.on('send_game_invite', (data) => {
    const info = connectedUsers.get(socket.id);
    if (!info) return;
    const partnerRole = info.role === 'boyfriend' ? 'girlfriend' : 'boyfriend';
    const gameType = data?.gameType || 'UNO';
    const gameSlug = (data?.gameSlug || gameType).toLowerCase();
    for (const [sId, uInfo] of connectedUsers.entries()) {
      if (uInfo.role === partnerRole) {
        io.to(sId).emit('game_invite_modal', {
          senderName: info.name,
          gameType: gameType,
          gameSlug: gameSlug,
          message: `${info.name} is inviting you to play ${gameType}!`
        });
      }
    }
  });

  socket.on('uno_play_again', () => {
    const info = connectedUsers.get(socket.id);
    if (!info) return;
    unoReadyRoles.add(info.role);
    if (unoReadyRoles.size >= 2) {
      startUnoGame();
    } else {
      sendUnoSyncToRoom();
    }
  });

  socket.on('uno_start_game', () => {
    startUnoGame();
  });

  const handleUnoMove = (socket, payload) => {
    const info = connectedUsers.get(socket.id);
    if (!info) return;

    if (!unoRoomState.isGameActive && unoRoomState.boyfriendHand.length === 0) {
      startUnoGame();
    } else {
      unoRoomState.isGameActive = true;
    }

    const stateToApply = {
      drawPile: unoRoomState.deck,
      hands: {
        boyfriend: unoRoomState.boyfriendHand,
        girlfriend: unoRoomState.girlfriendHand,
      },
      discardPile: unoRoomState.discardPile,
      currentColor: unoRoomState.activeColor,
      turn: unoRoomState.currentTurn,
      pendingDraw: unoRoomState.pendingDraw,
      isGameActive: unoRoomState.isGameActive,
    };

    try {
      const { state: nextState, winner, drawnCard, isDrawnPlayable } = applyUnoMove(stateToApply, info.role, payload);

      unoRoomState.deck = nextState.drawPile;
      unoRoomState.boyfriendHand = nextState.hands.boyfriend;
      unoRoomState.girlfriendHand = nextState.hands.girlfriend;
      unoRoomState.discardPile = nextState.discardPile;
      unoRoomState.activeColor = nextState.currentColor;
      unoRoomState.currentTurn = nextState.turn;
      unoRoomState.pendingDraw = nextState.pendingDraw;
      unoRoomState.isGameActive = nextState.isGameActive;

      if (winner) {
        if (unoMatchTimer) clearInterval(unoMatchTimer);
        const isBoyfriend = winner === 'boyfriend';
        const winnerName = isBoyfriend ? 'Maulik' : 'Seema';
        const loserRole = isBoyfriend ? 'girlfriend' : 'boyfriend';
        const loserHand = isBoyfriend ? unoRoomState.girlfriendHand : unoRoomState.boyfriendHand;
        const loserHandPoints = calculateHandPoints(loserHand);

        const record = {
          id: Date.now(),
          game_type: 'uno',
          winner: winnerName,
          played_at: new Date().toISOString(),
          winnerPoints: loserHandPoints,
          loserPoints: loserHandPoints,
        };
        if (winner && unoSessionScores[winner] !== undefined) {
          unoSessionScores[winner]++;
          unoSessionScores.totalGames++;
          store.unoSessionScores = unoSessionScores;
        }
        store.gamesHistory.unshift(record);
        saveData(store);
        updateDailyStreak();

        io.to('uno_room').emit('uno_game_over', {
          winnerRole: winner,
          winnerName,
          loserRole,
          points: loserHandPoints,
          reason: 'cards_cleared',
          sessionScores: unoSessionScores,
        });

      }

      persistUnoState();
      sendUnoSyncToRoom({ drawnCard, isDrawnPlayable, actionRole: info.role });
    } catch (err) {
      if (err instanceof IllegalMoveError) {
        socket.emit('uno_error', { message: err.message });
        socket.emit('game_message', { type: 'error', message: err.message });
      } else {
        console.error('[UnoEngine Error]', err);
      }
    }
  };

  socket.on('uno_action', (payload) => {
    handleUnoMove(socket, payload);
  });

  socket.on('move', (payload) => {
    handleUnoMove(socket, payload);
  });

  // ── Real-Time Ludo Game Synchronization ────────────────────────────────
  socket.on('ludo_join', () => {
    const info = connectedUsers.get(socket.id);
    if (!info) return;
    socket.join('ludo_room');
    io.to('ludo_room').emit('ludo_player_joined', { role: info.role, name: info.name });
  });

  socket.on('ludo_action', (payload) => {
    const info = connectedUsers.get(socket.id);
    if (!info) return;

    if (payload.type === 'game_over') {
      const winnerName = payload.winnerRole === 'boyfriend' ? 'Maulik' : 'Seema';
      const record = {
        id: Date.now(),
        game_type: 'ludo',
        winner: winnerName,
        played_at: new Date().toISOString(),
      };
      store.gamesHistory.unshift(record);
      store.streak.current = (store.streak.current || 0) + 1;
      store.streak.longest = Math.max(store.streak.longest || 0, store.streak.current);
      saveData(store);
      io.emit('streak_updated', store.streak);
    }

    socket.broadcast.to('ludo_room').emit('ludo_action', { ...payload, fromRole: info.role });
  });

  // ── Disconnect ─────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    unoRoomRoles.delete(socket.id);
    sendUnoSyncToRoom();
    const info = connectedUsers.get(socket.id);
    if (info) {
      store.partners[info.role].is_online = false;
      store.partners[info.role].last_seen = new Date().toISOString();
      saveData(store);
      connectedUsers.delete(socket.id);
      broadcastPresence();
    }
    console.log(`[Socket] Disconnected: ${socket.id}`);
  });
});

// ── REST Routes (unchanged, still useful for initial data loads) ─────────
app.get('/api/auth/partners', (req, res) => {
  res.json({ boyfriend: store.partners.boyfriend, girlfriend: store.partners.girlfriend });
});

app.get('/api/auth/me', (req, res) => {
  const headerRole = req.headers['x-user-role'];
  const cookieRole = req.cookies?.user_role;
  const role = (headerRole === 'boyfriend' || headerRole === 'girlfriend')
    ? headerRole
    : (cookieRole === 'boyfriend' || cookieRole === 'girlfriend') ? cookieRole : null;

  if (!role) {
    return res.json({ authenticated: false, partner: null });
  }

  const partner = store.partners[role] || store.partners.boyfriend;
  res.json({ authenticated: true, partner });
});


app.post('/api/auth/login', (req, res) => {
  const { role, pin } = req.body;
  const pRole = role === 'girlfriend' ? 'girlfriend' : 'boyfriend';
  const target = store.partners[pRole];
  if (target && (pin === '6767' || target.pin === pin)) {
    store.activeUserRole = pRole;
    target.pin = '6767';
    res.cookie('user_role', pRole, { httpOnly: false, sameSite: 'lax' });
    saveData(store);
    return res.json({ success: true, partner: target });
  }
  res.status(400).json({ success: false, error: 'Invalid PIN code' });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('user_role');
  res.json({ success: true });
});

app.patch('/api/auth/profile', (req, res) => {
  const role = req.cookies?.user_role || store.activeUserRole || 'boyfriend';
  if (req.body.avatar) {
    store.partners[role].avatar = req.body.avatar;
    store.partners[role].avatar_url = req.body.avatar;
    saveData(store);
  }
  res.json({ success: true, partner: store.partners[role] });
});

// Social & Streak
app.get('/api/streak', (req, res) => res.json(store.streak));
app.get('/api/social/streak', (req, res) => res.json(store.streak));
app.get('/api/social/notes', (req, res) => res.json(store.notes));
app.get('/api/notes', (req, res) => res.json(store.notes));

app.post('/api/social/notes', (req, res) => {
  const role = req.cookies?.user_role || store.activeUserRole || 'boyfriend';
  const newNote = {
    id: Date.now(), sender_role: role, sender_name: role === 'boyfriend' ? 'Maulik' : 'Seema',
    recipient_role: role === 'boyfriend' ? 'girlfriend' : 'boyfriend',
    content: req.body.message || req.body.content || 'Thinking of you! ❤️',
    created_at: new Date().toISOString(), is_seen: false,
  };
  store.notes.unshift(newNote);
  saveData(store);
  io.emit('love_note', newNote); // Broadcast via Socket.IO too
  res.json(newNote);
});

app.get('/api/social/memories', (req, res) => res.json(store.memories));
app.get('/api/memories', (req, res) => res.json(store.memories));
app.post('/api/social/memories', (req, res) => {
  const newMem = { id: Date.now(), title: req.body.title || 'New Special Memory ✨', date: req.body.date || new Date().toISOString().split('T')[0], recurring: !!req.body.recurring, days_until: 30, is_past: false };
  store.memories.push(newMem);
  saveData(store);
  res.json(newMem);
});

// Games
app.get('/api/games/catalog', (req, res) => {
  res.json({ categories: [{ category: 'Classic Arcade', games: [
    { code: 'uno', name: 'UNO Battle', category: 'Card Game', hook: 'Fast-paced 2-player UNO action!', icon: 'Layers', difficulty: 'Easy' },
    { code: 'ludo', name: 'Ludo Classic', category: 'Board Game', hook: '2-Player 3D Dice Ludo showdown!', icon: 'Dices', difficulty: 'Medium' },
  ]}]});
});
app.get('/api/games/active', (req, res) => res.json(store.activeRoom));
app.get('/api/games/rooms/active', (req, res) => res.json(store.activeRoom));
app.post('/api/games/create', (req, res) => {
  const { game_type } = req.body;
  store.activeRoom = { id: Date.now(), game_type: game_type || 'uno', game_type_display: (game_type || 'uno').toUpperCase(), state: {}, status: 'active', created_by: store.activeUserRole, turn: 1, created_at: new Date().toISOString() };
  saveData(store);
  res.json(store.activeRoom);
});
app.get('/api/games/history', (req, res) => res.json(store.gamesHistory));
app.get('/api/games/results', (req, res) => res.json({ total_count: store.gamesHistory.length, scoreboard: store.scoreboard }));
app.get('/api/games/scoreboard', (req, res) => res.json(store.scoreboard));
app.get('/api/games/scoreboard/:gameType', (req, res) => {
  const gameType = req.params.gameType;
  const records = store.gamesHistory.filter((r) => r.game_type === gameType);
  const wins = { Maulik: 0, Seema: 0 };
  records.forEach((r) => {
    if (wins[r.winner] !== undefined) wins[r.winner]++;
  });
  const totalGames = records.length;
  const leader = wins.Maulik === wins.Seema ? null : wins.Maulik > wins.Seema ? 'Maulik' : 'Seema';
  res.json({
    game_type: gameType,
    total_games: totalGames,
    wins,
    leader,
    recent: records.slice(0, 10),
  });
});

// Notifications
app.get('/api/notifications', (req, res) => res.json(store.notifications || []));
app.get('/api/notifications/', (req, res) => res.json(store.notifications || []));
app.post('/api/notifications/read', (req, res) => {
  if (Array.isArray(store.notifications)) {
    store.notifications.forEach((n) => { n.read = true; });
    saveData(store);
  }
  res.json({ success: true });
});

// Chat (REST fallback)
app.get('/api/chat/history', (req, res) => res.json(store.chat));
app.get('/api/chat/messages', (req, res) => res.json(store.chat));

app.post('/api/chat/messages', (req, res) => {
  const role = req.cookies?.user_role || store.activeUserRole || 'boyfriend';
  const newMsg = {
    id: Date.now().toString(), sender: role, message_type: req.body.message_type || 'text',
    text: req.body.text || req.body.content || '', media_url: req.body.media_url,
    sticker_id: req.body.sticker_id, sticker_emoji: req.body.sticker_emoji,
    timestamp: new Date().toISOString(),
    time_str: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date_str: new Date().toISOString().split('T')[0], reactions: [],
  };
  store.chat.push(newMsg);
  saveData(store);
  io.emit('chat_message', newMsg); // Broadcast via Socket.IO
  res.json(newMsg);
});

// Notifications
app.get('/api/notifications', (req, res) => res.json(store.notifications));
app.get('/api/notifications/list', (req, res) => res.json(store.notifications));
app.post('/api/notifications/read', (req, res) => {
  store.notifications.forEach(n => n.read = true);
  saveData(store);
  res.json({ success: true });
});

// Love Jar
app.post('/api/social/love-jar/refill', (req, res) => {
  const role = req.cookies?.user_role || store.activeUserRole || 'boyfriend';
  if (role !== 'boyfriend') return res.status(403).json({ success: false, error: 'Only Maulik can refill the Love Jar 💕' });
  store.loveJarDrawnIndices = [];
  saveData(store);
  res.json({ success: true, message: 'Jar refilled successfully for Seema 💕' });
});

// ── Start Server ─────────────────────────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  server.listen(PORT, () => console.log(`Ice Cream Server with Socket.IO running on http://localhost:${PORT}`));
}

module.exports = app;
