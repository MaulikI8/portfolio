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
const io = new Server(server, { cors: { origin: true, credentials: true }, pingInterval: 10000, pingTimeout: 5000 });

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

const DATA_FILE = path.join(__dirname, 'data.json');
const INITIAL_DATA = {
  partners: {
    boyfriend: { id: 1, role: 'boyfriend', name: 'Maulik', avatar: null, avatar_url: null, halo_color: '#E8567D', is_online: false, last_seen: new Date().toISOString(), pin: '6767' },
    girlfriend: { id: 2, role: 'girlfriend', name: 'Seema', avatar: null, avatar_url: null, halo_color: '#FF758F', is_online: false, last_seen: new Date().toISOString(), pin: '6767' },
  },
  activeUserRole: 'boyfriend', streak: { current: 0, longest: 0, last_played_on: null, streak_active: false },
  notes: [], memories: [], chat: [],
  activeRoom: { id: 101, game_type: 'uno', game_type_display: 'UNO Battle', state: {}, status: 'active', created_by: 'boyfriend', turn: 1, created_at: new Date().toISOString() },
  gamesHistory: [], scoreboard: [], notifications: [], unoSessionScores: { boyfriend: 0, girlfriend: 0, totalGames: 0 },
};

function loadData() { try { if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); } catch {} return INITIAL_DATA; }
function saveData(data) { try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8'); } catch {} syncCloudSave(data); }

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || 'https://better-katydid-109297.upstash.io';
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || 'gQAAAAAAarxAAIgcDI4OThkHzQOMGI1ZTg0ZDFKYTi5NTUxy2I5NjU5OTY2Nw';

async function syncCloudSave(data) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return;
  try { await fetch(`${UPSTASH_URL}/set/seema_app_data`, { method: 'POST', headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }, body: JSON.stringify(data) }); } catch (e) { console.error('[Cloud DB] Save error:', e.message); }
}

async function syncCloudLoad() {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return;
  try {
    const res = await fetch(`${UPSTASH_URL}/get/seema_app_data`, { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } });
    const json = await res.json();
    if (json?.result) {
      const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
      store = { ...store, ...parsed };
      try { fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8'); } catch {}
    }
  } catch (e) { console.error('[Cloud DB] Load error:', e.message); }
}

let store = loadData();
syncCloudLoad();

const connectedUsers = new Map();
const RING_TIMEOUT_MS = 30000;
let callSession = null;

function getCleanCallSession() { if (!callSession) return null; const { ringTimeout, ...clean } = callSession; return clean; }
function broadcastCallState() { const cleanState = getCleanCallSession(); for (const [sid] of connectedUsers.entries()) io.sockets.sockets.get(sid)?.emit('call_state', cleanState); }
function broadcastPresence() { const roles = {}; for (const [, info] of connectedUsers) roles[info.role] = true; io.emit('presence', { boyfriend: !!roles.boyfriend, girlfriend: !!roles.girlfriend }); }

let unoRoomRoles = new Map();
let unoReadyRoles = new Set();
let unoSessionScores = store?.unoSessionScores || { boyfriend: 0, girlfriend: 0, totalGames: 0 };
let unoRoomState = store?.unoRoomState?.boyfriendHand?.length > 0 ? store.unoRoomState : { isGameActive: false, boyfriendHand: [], girlfriendHand: [], deck: [], discardPile: [], activeColor: 'red', currentTurn: 'boyfriend', pendingDraw: 0, startedAt: Date.now() };

function calculateHandPoints(hand) {
  if (!Array.isArray(hand)) return 0;
  return hand.reduce((tot, card) => {
    if (!card?.value) return tot; const val = card.value;
    if (val >= '0' && val <= '9') return tot + parseInt(val, 10);
    if (['Skip', 'Reverse', 'Discard All'].includes(val)) return tot + 20;
    if (val === '+2') return tot + 30;
    if (['Wild', '+4'].includes(val)) return tot + 50;
    return tot;
  }, 0);
}

function updateStreakOnWin(store) {
  const today = new Date().toISOString().slice(0, 10);
  if (!store.streak) { store.streak = { current: 1, longest: 1, last_played_on: today, streak_active: true }; return; }
  const lastPlayed = store.streak.last_played_on;
  if (!lastPlayed) { store.streak.current = 1; store.streak.longest = Math.max(store.streak.longest || 1, 1); }
  else if (lastPlayed !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    store.streak.current = (lastPlayed === yesterday) ? (store.streak.current || 0) + 1 : 1;
    store.streak.longest = Math.max(store.streak.longest || 1, store.streak.current);
  }
  store.streak.last_played_on = today; store.streak.streak_active = true;
}

function persistUnoState() {
  if (!store) return;
  store.unoRoomState = unoRoomState;
  store.activeRoom = { id: 101, game_type: 'uno', game_type_display: 'UNO Battle', state: { isGameActive: unoRoomState.isGameActive, currentTurn: unoRoomState.currentTurn, activeColor: unoRoomState.activeColor, pendingDraw: unoRoomState.pendingDraw, topDiscard: unoRoomState.discardPile[unoRoomState.discardPile.length - 1] || null, boyfriendHandCount: unoRoomState.boyfriendHand.length, girlfriendHandCount: unoRoomState.girlfriendHand.length }, status: unoRoomState.isGameActive ? 'active' : 'waiting', created_by: 'boyfriend', turn: unoRoomState.currentTurn, created_at: new Date().toISOString() };
  saveData(store);
}

function sendUnoSyncToRoom(extraPayload = {}) {
  const presentRoles = Array.from(unoRoomRoles.keys());
  const isWaitingForPartner = presentRoles.length < 2 && !unoRoomState.isGameActive;
  for (const [socketId, s] of io.sockets.sockets.entries()) {
    let info = connectedUsers.get(socketId);
    if (!info) { for (const [r, sid] of unoRoomRoles.entries()) if (sid === socketId) { info = { role: r, name: r === 'boyfriend' ? 'Maulik' : 'Seema' }; connectedUsers.set(socketId, info); break; } }
    if (!info) continue;
    const isBf = info.role === 'boyfriend';
    const myHand = isBf ? unoRoomState.boyfriendHand : unoRoomState.girlfriendHand;
    const oppCount = isBf ? unoRoomState.girlfriendHand.length : unoRoomState.boyfriendHand.length;
    const topDiscard = unoRoomState.discardPile[unoRoomState.discardPile.length - 1] || null;
    const drawnCard = (extraPayload.isDrawnPlayable && extraPayload.actionRole === info.role) ? extraPayload.drawnCard : null;
    const payload = { my_hand: myHand, myHand, opponent_hand_count: oppCount, opponentHandCount: oppCount, discard_pile: topDiscard ? [topDiscard] : [], top_discard: topDiscard, topDiscard, current_color: unoRoomState.activeColor, activeColor: unoRoomState.activeColor, turn: unoRoomState.currentTurn, currentTurn: unoRoomState.currentTurn, pending_draw: unoRoomState.pendingDraw, pendingDraw: unoRoomState.pendingDraw, isGameActive: unoRoomState.isGameActive, is_game_active: unoRoomState.isGameActive, drawnPlayableCard: drawnCard, unoCalled: unoRoomState.unoCalled || { boyfriend: false, girlfriend: false } };
    s.emit('game_message', { type: 'state_update', state: payload, turn: unoRoomState.currentTurn, status: unoRoomState.isGameActive ? 'active' : 'waiting' });
    s.emit('uno_sync', { isGameActive: unoRoomState.isGameActive, isWaitingForPartner, connectedRoles: presentRoles, readyRoles: Array.from(unoReadyRoles), myHand, opponentHandCount: oppCount, topDiscard, activeColor: unoRoomState.activeColor, currentTurn: unoRoomState.currentTurn, pendingDraw: unoRoomState.pendingDraw, deckCount: unoRoomState.deck.length, drawnPlayableCard: drawnCard, unoCalled: unoRoomState.unoCalled || { boyfriend: false, girlfriend: false } });
  }
}

function startUnoGame() {
  const engineState = createUnoEngineGame();
  unoRoomState = { isGameActive: true, boyfriendHand: engineState.hands.boyfriend, girlfriendHand: engineState.hands.girlfriend, deck: engineState.drawPile, discardPile: engineState.discardPile, activeColor: engineState.currentColor, currentTurn: engineState.turn, pendingDraw: engineState.pendingDraw, startedAt: Date.now(), unoCalled: engineState.unoCalled || { boyfriend: false, girlfriend: false } };
  unoReadyRoles.clear(); persistUnoState(); sendUnoSyncToRoom();
}

io.on('connection', (socket) => {
  socket.on('identify', ({ role }) => {
    if (role !== 'boyfriend' && role !== 'girlfriend') return;
    connectedUsers.set(socket.id, { role, name: role === 'boyfriend' ? 'Maulik' : 'Seema' });
    store.partners[role].is_online = true; store.partners[role].last_seen = new Date().toISOString();
    saveData(store); broadcastPresence(); if (callSession) socket.emit('call_state', getCleanCallSession());
  });

  socket.on('chat_message', (msg) => {
    const info = connectedUsers.get(socket.id); if (!info) return;
    const newMsg = { id: Date.now().toString(), sender: info.role, message_type: msg.message_type || 'text', text: msg.text || msg.content || '', media_url: msg.media_url, sticker_id: msg.sticker_id, sticker_emoji: msg.sticker_emoji, timestamp: new Date().toISOString(), time_str: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), date_str: new Date().toISOString().split('T')[0], reactions: [], is_seen: false };
    store.chat.push(newMsg); saveData(store); io.emit('chat_message', newMsg);
  });

  socket.on('mark_seen', () => {
    const info = connectedUsers.get(socket.id); if (!info) return; let updated = false;
    store.chat.forEach((m) => { if (m.sender !== info.role && !m.is_seen) { m.is_seen = true; updated = true; } });
    if (updated) { saveData(store); io.emit('messages_seen', { seenBy: info.role }); }
  });

  socket.on('typing', ({ isTyping }) => { const info = connectedUsers.get(socket.id); if (info) socket.broadcast.emit('partner_typing', { role: info.role, isTyping }); });
  socket.on('nudge', ({ emoji, label }) => { const info = connectedUsers.get(socket.id); if (info) socket.broadcast.emit('nudge', { from: info.role, fromName: info.name, emoji, label }); });
  socket.on('reaction', ({ emoji }) => { const info = connectedUsers.get(socket.id); if (info) socket.broadcast.emit('reaction', { from: info.role, fromName: info.name, emoji }); });

  socket.on('love_note', ({ message }) => {
    const info = connectedUsers.get(socket.id); if (!info) return;
    const newNote = { id: Date.now(), sender_role: info.role, sender_name: info.name, recipient_role: info.role === 'boyfriend' ? 'girlfriend' : 'boyfriend', content: message || 'Thinking of you! ❤️', created_at: new Date().toISOString(), is_seen: false };
    store.notes.unshift(newNote); saveData(store); io.emit('love_note', newNote);
  });

  socket.on('notification', (notif) => {
    const info = connectedUsers.get(socket.id); if (!info) return;
    const newNotif = { id: Date.now(), kind: notif.kind || 'general', title: notif.title || 'Notification', body: notif.body || '', created_at: new Date().toISOString(), read: false, from: info.role };
    store.notifications.push(newNotif); saveData(store); socket.broadcast.emit('notification', newNotif);
  });

  const getOrSetSocketInfo = (payload) => {
    let info = connectedUsers.get(socket.id);
    const role = payload?.role || payload?.from || (payload?.callerRole) || info?.role;
    if (!info && (role === 'boyfriend' || role === 'girlfriend')) {
      info = { role, name: role === 'boyfriend' ? 'Maulik' : 'Seema' };
      connectedUsers.set(socket.id, info);
    }
    return info;
  };

  const handleCallInitiate = (payload = {}) => {
    const info = getOrSetSocketInfo(payload);
    if (!info) return;
    const { callType, offer } = payload;
    if (callSession?.ringTimeout) clearTimeout(callSession.ringTimeout);
    callSession = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
      type: callType || 'video',
      callerRole: info.role,
      calleeRole: info.role === 'boyfriend' ? 'girlfriend' : 'boyfriend',
      status: 'ringing',
      offer,
      answer: null,
      startedAt: Date.now(),
      callerCandidates: [],
      calleeCandidates: [],
    };
    console.log(`[Server Call Session] Initiated by ${info.role} (Type: ${callSession.type})`);
    callSession.ringTimeout = setTimeout(() => {
      if (callSession?.status === 'ringing') {
        callSession.status = 'ended';
        callSession.endReason = 'missed';
        console.log('[Server Call Session] Call missed - timeout');
        broadcastCallState();
        setTimeout(() => { if (callSession?.status === 'ended') { callSession = null; broadcastCallState(); } }, 3000);
      }
    }, RING_TIMEOUT_MS);
    broadcastCallState();
    const otherRole = info.role === 'boyfriend' ? 'girlfriend' : 'boyfriend';
    let count = 0;
    for (const [sid, i] of connectedUsers.entries()) if (i.role === otherRole) {
      io.to(sid).emit('incoming_call', { from: info.role, fromName: info.name, offer, callType: callSession.type });
      count++;
    }
    if (count === 0) socket.broadcast.emit('incoming_call', { from: info.role, fromName: info.name, offer, callType: callSession.type });
  };

  const handleCallAccept = (payload = {}) => {
    const info = getOrSetSocketInfo(payload);
    const answer = payload?.answer || payload;
    if (callSession && callSession.ringTimeout) { clearTimeout(callSession.ringTimeout); callSession.ringTimeout = null; }
    if (callSession) {
      callSession.status = 'connecting';
      callSession.answer = answer;
    }
    console.log(`[Server Call Session] Accepted by ${info?.role || 'partner'}`);
    broadcastCallState();
    const callerRole = callSession?.callerRole || (info?.role === 'boyfriend' ? 'girlfriend' : 'boyfriend');
    let count = 0;
    for (const [sid, i] of connectedUsers.entries()) if (i.role === callerRole) {
      io.to(sid).emit('call_accepted', { answer, candidates: callSession?.calleeCandidates || [] });
      count++;
    }
    if (count === 0) {
      socket.broadcast.emit('call_accepted', { answer, candidates: callSession?.calleeCandidates || [] });
    }
  };

  const handleCallConnected = () => {
    if (callSession && callSession.status !== 'active') {
      callSession.status = 'active';
      console.log('[Server Call Session] Connection established live (Active)');
      broadcastCallState();
    }
  };
  const handleCallReject = (payload = {}) => {
    const info = getOrSetSocketInfo(payload);
    console.log(`[Server Call Session] Rejected by ${info?.role || 'partner'}`);
    if (callSession?.ringTimeout) { clearTimeout(callSession.ringTimeout); callSession.ringTimeout = null; }
    if (callSession) { callSession.status = 'ended'; callSession.endReason = 'rejected'; }
    broadcastCallState();
    setTimeout(() => { if (callSession?.status === 'ended') { callSession = null; broadcastCallState(); } }, 3000);
  };
  const handleCallHangup = (payload = {}) => {
    const info = getOrSetSocketInfo(payload);
    console.log(`[Server Call Session] Ended by ${info?.role || 'partner'}`);
    if (callSession?.ringTimeout) { clearTimeout(callSession.ringTimeout); callSession.ringTimeout = null; }
    if (callSession) { callSession.status = 'ended'; callSession.endReason = 'hangup'; }
    broadcastCallState();
    setTimeout(() => { if (callSession?.status === 'ended') { callSession = null; broadcastCallState(); } }, 3000);
  };

  const handleCallIceCandidate = (payload = {}) => {
    const info = getOrSetSocketInfo(payload);
    const candidate = payload?.candidate;
    if (!candidate) return;
    const senderRole = info ? info.role : payload?.role;
    if (callSession) {
      if (senderRole === callSession.callerRole) callSession.callerCandidates.push(candidate);
      else callSession.calleeCandidates.push(candidate);
    }
    const otherRole = senderRole === 'boyfriend' ? 'girlfriend' : 'boyfriend';
    let count = 0;
    for (const [sid, i] of connectedUsers.entries()) if (i.role === otherRole) {
      io.to(sid).emit('call_ice_candidate', { candidate });
      count++;
    }
    if (count === 0) {
      socket.broadcast.emit('call_ice_candidate', { candidate });
    }
  };

  const handleToggleMute = (payload = {}) => {
    const info = getOrSetSocketInfo(payload);
    if (!info || !callSession) return;
    if (!callSession.mutedRoles) callSession.mutedRoles = { boyfriend: false, girlfriend: false };
    callSession.mutedRoles[info.role] = !!payload.isMuted;
    console.log(`[Server Call Session] Mute state updated: ${info.role} -> ${callSession.mutedRoles[info.role]}`);
    broadcastCallState();
    const otherRole = info.role === 'boyfriend' ? 'girlfriend' : 'boyfriend';
    for (const [sid, i] of connectedUsers.entries()) if (i.role === otherRole) {
      io.to(sid).emit('user_mute_state_changed', { role: info.role, isMuted: !!payload.isMuted });
    }
  };

  const handleCallRenegotiate = (payload = {}) => {
    const info = getOrSetSocketInfo(payload);
    if (!info || !callSession || (callSession.status !== 'active' && callSession.status !== 'connecting')) return;
    console.log(`[Server Call Session] Lightweight ICE renegotiate requested by ${info.role}`);
    const otherRole = info.role === 'boyfriend' ? 'girlfriend' : 'boyfriend';
    for (const [sid, i] of connectedUsers.entries()) {
      if (i.role === otherRole) {
        io.to(sid).emit('call_renegotiate', { offer: payload.offer, role: info.role });
      }
    }
  };

  const handleCallRenegotiateAnswer = (payload = {}) => {
    const info = getOrSetSocketInfo(payload);
    if (!info || !callSession || (callSession.status !== 'active' && callSession.status !== 'connecting')) return;
    console.log(`[Server Call Session] Lightweight ICE renegotiate answer from ${info.role}`);
    const otherRole = info.role === 'boyfriend' ? 'girlfriend' : 'boyfriend';
    for (const [sid, i] of connectedUsers.entries()) {
      if (i.role === otherRole) {
        io.to(sid).emit('call_renegotiate_answer', { answer: payload.answer, role: info.role });
      }
    }
  };

  socket.on('call_initiate', handleCallInitiate);
  socket.on('call_accept', handleCallAccept);
  socket.on('call_connected', handleCallConnected);
  socket.on('call_reject', handleCallReject);
  socket.on('call_hangup', handleCallHangup);
  socket.on('call_ice_candidate', handleCallIceCandidate);
  socket.on('toggle_mute', handleToggleMute);
  socket.on('call_renegotiate', handleCallRenegotiate);
  socket.on('call_renegotiate_answer', handleCallRenegotiateAnswer);

  socket.on('movie_whisper', (data) => { const info = connectedUsers.get(socket.id); if (info) socket.broadcast.emit('movie_whisper', { id: Date.now(), sender: info.name, text: data.text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }); });
  socket.on('movie_reaction', (data) => socket.broadcast.emit('movie_reaction', data));

  socket.on('uno_join', (data) => {
    let info = connectedUsers.get(socket.id); if (!info && data?.role) { info = { role: data.role, name: data.role === 'boyfriend' ? 'Maulik' : 'Seema' }; connectedUsers.set(socket.id, info); }
    if (!info) return; socket.join('uno_room'); unoRoomRoles.set(info.role, socket.id);
    const presentRoles = Array.from(unoRoomRoles.keys());
    if (presentRoles.length < 2) { unoRoomState.isGameActive = false; sendUnoSyncToRoom(); }
    else if (unoRoomState.isGameActive && unoRoomState.boyfriendHand.length > 0 && unoRoomState.girlfriendHand.length > 0) sendUnoSyncToRoom();
    else startUnoGame();
  });
  socket.on('uno_leave', () => { const info = connectedUsers.get(socket.id); if (info && unoRoomRoles.get(info.role) === socket.id) unoRoomRoles.delete(info.role); sendUnoSyncToRoom(); });
  socket.on('uno_terminate', () => {
    const info = connectedUsers.get(socket.id); unoRoomState.isGameActive = false; unoRoomState.boyfriendHand = []; unoRoomState.girlfriendHand = []; unoRoomState.discardPile = []; unoRoomState.deck = []; unoRoomState.unoCalled = { boyfriend: false, girlfriend: false }; unoReadyRoles.clear(); persistUnoState();
    if (info) io.to('uno_room').emit('game_message', { type: 'toast', message: `${info.name} exited and terminated the match.` });
    sendUnoSyncToRoom();
  });
  socket.on('uno_nudge', () => {
    const info = connectedUsers.get(socket.id); if (!info) return; const partnerRole = info.role === 'boyfriend' ? 'girlfriend' : 'boyfriend';
    for (const [sId, uInfo] of connectedUsers.entries()) if (uInfo.role === partnerRole) { io.to(sId).emit('game_invite_modal', { senderName: info.name, gameType: 'UNO', gameSlug: 'uno', message: `${info.name} sent you a game invite for UNO!` }); io.to(sId).emit('game_nudge_toast', { senderName: info.name, gameType: 'UNO', message: `${info.name} is waiting for you in UNO!` }); }
  });
  socket.on('send_game_invite', (data) => {
    const info = connectedUsers.get(socket.id); if (!info) return; const partnerRole = info.role === 'boyfriend' ? 'girlfriend' : 'boyfriend'; const gType = data?.gameType || 'UNO'; const gSlug = (data?.gameSlug || gType).toLowerCase();
    for (const [sId, uInfo] of connectedUsers.entries()) if (uInfo.role === partnerRole) io.to(sId).emit('game_invite_modal', { senderName: info.name, gameType: gType, gameSlug: gSlug, message: `${info.name} is inviting you to play ${gType}!` });
  });
  socket.on('uno_play_again', () => { const info = connectedUsers.get(socket.id); if (!info) return; unoReadyRoles.add(info.role); if (unoReadyRoles.size >= 2) startUnoGame(); else sendUnoSyncToRoom(); });
  socket.on('uno_start_game', () => startUnoGame());

  const handleUnoMove = (s, payload) => {
    const info = connectedUsers.get(s.id); if (!info) return;
    if (!unoRoomState.isGameActive && (!unoRoomState.boyfriendHand || unoRoomState.boyfriendHand.length === 0)) startUnoGame(); else unoRoomState.isGameActive = true;
    const stateToApply = { drawPile: unoRoomState.deck || [], hands: { boyfriend: unoRoomState.boyfriendHand || [], girlfriend: unoRoomState.girlfriendHand || [] }, discardPile: unoRoomState.discardPile || [], currentColor: unoRoomState.activeColor || 'red', turn: unoRoomState.currentTurn || 'boyfriend', pendingDraw: unoRoomState.pendingDraw || 0, isGameActive: unoRoomState.isGameActive };
    try {
      const { state: nextState, winner, drawnCard, isDrawnPlayable } = applyUnoMove(stateToApply, info.role, payload);
      unoRoomState.deck = nextState.drawPile; unoRoomState.boyfriendHand = nextState.hands.boyfriend; unoRoomState.girlfriendHand = nextState.hands.girlfriend; unoRoomState.discardPile = nextState.discardPile; unoRoomState.activeColor = nextState.currentColor; unoRoomState.currentTurn = nextState.turn; unoRoomState.pendingDraw = nextState.pendingDraw; unoRoomState.isGameActive = nextState.isGameActive;
      if (winner) {
        const isBf = winner === 'boyfriend'; const winnerName = isBf ? 'Maulik' : 'Seema'; const loserRole = isBf ? 'girlfriend' : 'boyfriend'; const loserHand = isBf ? unoRoomState.girlfriendHand : unoRoomState.boyfriendHand; const loserPoints = calculateHandPoints(loserHand);
        const record = { id: Date.now(), game_type: 'uno', winner: winnerName, played_at: new Date().toISOString(), winnerPoints: loserPoints, loserPoints };
        if (unoSessionScores[winner] !== undefined) { unoSessionScores[winner]++; unoSessionScores.totalGames++; store.unoSessionScores = unoSessionScores; }
        store.gamesHistory.unshift(record);
        updateStreakOnWin(store);
        io.to('uno_room').emit('uno_game_over', { winnerRole: winner, winnerName, loserRole, points: loserPoints, reason: 'cards_cleared', sessionScores: unoSessionScores });
      }
      const actionType = payload.action || payload.type;
      let actionCount = 1;
      if (actionType === 'draw_card' || actionType === 'drawCard') {
        actionCount = payload.count || (stateToApply.pendingDraw > 0 ? stateToApply.pendingDraw : 1);
      } else if (payload.cards && Array.isArray(payload.cards)) {
        actionCount = payload.cards.length;
      }
      persistUnoState(); sendUnoSyncToRoom({ drawnCard, isDrawnPlayable, actionRole: info.role, actionType, actionCount, actionCard: nextState.discardPile[nextState.discardPile.length - 1] || null });
    } catch (err) {
      if (err instanceof IllegalMoveError) { s.emit('uno_error', { message: err.message }); s.emit('game_message', { type: 'error', message: err.message }); }
    }
  };

  socket.on('uno_action', (payload) => handleUnoMove(socket, payload));
  socket.on('move', (payload) => handleUnoMove(socket, payload));

  socket.on('ludo_join', () => { const info = connectedUsers.get(socket.id); if (info) { socket.join('ludo_room'); io.to('ludo_room').emit('ludo_player_joined', { role: info.role, name: info.name }); } });
  socket.on('ludo_action', (payload) => {
    const info = connectedUsers.get(socket.id); if (!info) return;
    if (payload.type === 'game_over') {
      const winnerName = payload.winnerRole === 'boyfriend' ? 'Maulik' : 'Seema';
      store.gamesHistory.unshift({ id: Date.now(), game_type: 'ludo', winner: winnerName, played_at: new Date().toISOString() });
      updateStreakOnWin(store);
      saveData(store); io.emit('streak_updated', store.streak);
    }
    socket.broadcast.to('ludo_room').emit('ludo_action', { ...payload, fromRole: info.role });
  });

  socket.on('disconnect', () => {
    const info = connectedUsers.get(socket.id);
    if (info && unoRoomRoles.get(info.role) === socket.id) unoRoomRoles.delete(info.role);
    sendUnoSyncToRoom();
    if (info) {
      if (callSession && ['ringing', 'connecting', 'active'].includes(callSession.status) && (info.role === callSession.callerRole || info.role === callSession.calleeRole)) {
        if (callSession.ringTimeout) clearTimeout(callSession.ringTimeout);
        callSession.status = 'ended'; callSession.endReason = 'disconnected'; broadcastCallState();
        setTimeout(() => { if (callSession?.status === 'ended') { callSession = null; broadcastCallState(); } }, 3000);
      }
      store.partners[info.role].is_online = false; store.partners[info.role].last_seen = new Date().toISOString(); saveData(store);
      connectedUsers.delete(socket.id); broadcastPresence();
    }
  });
});

app.get('/api/call/session', (req, res) => res.json(getCleanCallSession()));
app.get('/api/auth/partners', (req, res) => res.json({ boyfriend: store.partners.boyfriend, girlfriend: store.partners.girlfriend }));
app.get('/api/auth/me', (req, res) => {
  const role = req.headers['x-user-role'] || req.cookies?.user_role;
  if (!role || !store.partners[role]) return res.json({ authenticated: false, partner: null });
  res.json({ authenticated: true, partner: store.partners[role] });
});
app.post('/api/auth/login', (req, res) => {
  const pRole = req.body.role === 'girlfriend' ? 'girlfriend' : 'boyfriend'; const target = store.partners[pRole];
  if (target && (req.body.pin === '6767' || target.pin === req.body.pin)) {
    store.activeUserRole = pRole; target.pin = '6767'; res.cookie('user_role', pRole, { httpOnly: false, sameSite: 'lax' }); saveData(store);
    return res.json({ success: true, partner: target });
  }
  res.status(400).json({ success: false, error: 'Invalid PIN code' });
});
app.post('/api/auth/logout', (req, res) => { res.clearCookie('user_role'); res.json({ success: true }); });
app.patch('/api/auth/profile', (req, res) => {
  const role = req.cookies?.user_role || store.activeUserRole || 'boyfriend';
  if (req.body.avatar) { store.partners[role].avatar = req.body.avatar; store.partners[role].avatar_url = req.body.avatar; saveData(store); }
  res.json({ success: true, partner: store.partners[role] });
});

app.get('/api/streak', (req, res) => res.json(store.streak));
app.get('/api/social/streak', (req, res) => res.json(store.streak));
app.get('/api/social/notes', (req, res) => res.json(store.notes));
app.get('/api/notes', (req, res) => res.json(store.notes));
app.post('/api/social/notes', (req, res) => {
  const role = req.cookies?.user_role || store.activeUserRole || 'boyfriend';
  const newNote = { id: Date.now(), sender_role: role, sender_name: role === 'boyfriend' ? 'Maulik' : 'Seema', recipient_role: role === 'boyfriend' ? 'girlfriend' : 'boyfriend', content: req.body.message || req.body.content || 'Thinking of you! ❤️', created_at: new Date().toISOString(), is_seen: false };
  store.notes.unshift(newNote); saveData(store); io.emit('love_note', newNote); res.json(newNote);
});

app.get('/api/social/memories', (req, res) => res.json(store.memories));
app.get('/api/memories', (req, res) => res.json(store.memories));
app.post('/api/social/memories', (req, res) => {
  const newMem = { id: Date.now(), title: req.body.title || 'New Special Memory ✨', date: req.body.date || new Date().toISOString().split('T')[0], recurring: !!req.body.recurring, days_until: 30, is_past: false };
  store.memories.push(newMem); saveData(store); res.json(newMem);
});

app.get('/api/games/catalog', (req, res) => res.json({ categories: [{ category: 'Classic Arcade', games: [{ code: 'uno', name: 'UNO Battle', category: 'Card Game', hook: 'Fast-paced 2-player UNO action!', icon: 'Layers', difficulty: 'Easy' }, { code: 'ludo', name: 'Ludo Classic', category: 'Board Game', hook: '2-Player 3D Dice Ludo showdown!', icon: 'Dices', difficulty: 'Medium' }] }] }));
app.get('/api/games/active', (req, res) => res.json(store.activeRoom));
app.get('/api/games/rooms/active', (req, res) => res.json(store.activeRoom));
app.post('/api/games/create', (req, res) => { store.activeRoom = { id: Date.now(), game_type: req.body.game_type || 'uno', game_type_display: (req.body.game_type || 'uno').toUpperCase(), state: {}, status: 'active', created_by: store.activeUserRole, turn: 1, created_at: new Date().toISOString() }; saveData(store); res.json(store.activeRoom); });
app.get('/api/games/history', (req, res) => res.json(store.gamesHistory));
app.get('/api/games/results', (req, res) => res.json({ total_count: store.gamesHistory.length, scoreboard: store.scoreboard }));
app.get('/api/games/scoreboard', (req, res) => res.json(store.scoreboard));
app.get('/api/games/scoreboard/:gameType', (req, res) => {
  const records = store.gamesHistory.filter((r) => r.game_type === req.params.gameType);
  const wins = { Maulik: 0, Seema: 0 }; records.forEach((r) => { if (wins[r.winner] !== undefined) wins[r.winner]++; });
  const leader = wins.Maulik === wins.Seema ? null : wins.Maulik > wins.Seema ? 'Maulik' : 'Seema';
  res.json({ game_type: req.params.gameType, total_games: records.length, wins, leader, recent: records.slice(0, 10) });
});

app.get('/api/notifications', (req, res) => res.json(store.notifications || []));
app.get('/api/notifications/list', (req, res) => res.json(store.notifications || []));
app.post('/api/notifications/read', (req, res) => { if (Array.isArray(store.notifications)) store.notifications.forEach((n) => n.read = true); saveData(store); res.json({ success: true }); });

app.get('/api/chat/history', (req, res) => res.json(store.chat));
app.get('/api/chat/messages', (req, res) => res.json(store.chat));
app.post('/api/chat/messages', (req, res) => {
  const role = req.cookies?.user_role || store.activeUserRole || 'boyfriend';
  const newMsg = { id: Date.now().toString(), sender: role, message_type: req.body.message_type || 'text', text: req.body.text || req.body.content || '', media_url: req.body.media_url, sticker_id: req.body.sticker_id, sticker_emoji: req.body.sticker_emoji, timestamp: new Date().toISOString(), time_str: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), date_str: new Date().toISOString().split('T')[0], reactions: [] };
  store.chat.push(newMsg); saveData(store); io.emit('chat_message', newMsg); res.json(newMsg);
});

app.post('/api/social/love-jar/refill', (req, res) => {
  const role = req.cookies?.user_role || store.activeUserRole || 'boyfriend';
  if (role !== 'boyfriend') return res.status(403).json({ success: false, error: 'Only Maulik can refill the Love Jar 💕' });
  store.loveJarDrawnIndices = []; saveData(store); res.json({ success: true, message: 'Jar refilled successfully for Seema 💕' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  server.listen(PORT, () => console.log(`Ice Cream Server with Socket.IO running on http://localhost:${PORT}`));
}
module.exports = app;
