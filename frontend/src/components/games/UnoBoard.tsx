import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Sparkles, Clock, Signal, Crown, Award, Zap, Sliders, ShieldAlert, Smartphone, Volume2, VolumeX, Download, Bell, Heart, Trophy, Swords, RotateCcw, Home } from 'lucide-react';
import { requestMobileNotificationPermission, sendMobileNotification, triggerDeviceVibration } from '../../utils/mobileNotifications';
import { getSocketInstance } from '../../hooks/useSocket';
import { useFetch } from '../../hooks/useFetch';

interface BoardProps { state: any; myRole: string; isMyTurn: boolean; onMove: (payload: any) => void; }
interface UnoCard { id: string; color: 'red' | 'blue' | 'green' | 'yellow' | 'wild'; value: string; }
interface GameRules { stacking: boolean; progressiveDraw: boolean; multipleCardPlay: boolean; jumpIn: boolean; discardAll: boolean; }
interface FloatingReaction { id: number; emoji: string; from: string; left: number; }
interface SessionScore { boyfriend: number; girlfriend: number; totalGames: number; }
interface GameRecord { gameNumber: number; winner: 'boyfriend' | 'girlfriend'; winnerName: string; timestamp: Date; }
interface FlyingCardItem { id: string; card: UnoCard; startX: number; startY: number; endX: number; endY: number; isBack?: boolean; }

const CARD_PALETTE: Record<string, { bg: string; ovalText: string; glow: string }> = {
  red: { bg: '#FF6B6B', ovalText: '#FF6B6B', glow: 'rgba(0,0,0,0.15)' },
  blue: { bg: '#4D96FF', ovalText: '#4D96FF', glow: 'rgba(0,0,0,0.15)' },
  green: { bg: '#6BCB77', ovalText: '#6BCB77', glow: 'rgba(0,0,0,0.15)' },
  yellow: { bg: '#FFD93D', ovalText: '#D4AC0D', glow: 'rgba(0,0,0,0.15)' },
  wild: { bg: '#2D152B', ovalText: '#2D152B', glow: 'rgba(0,0,0,0.15)' },
};

function renderCardSymbol(value: string, size: 'large' | 'small' = 'large') {
  const isL = size === 'large';
  if (value === 'Skip') return <svg width={isL ? 24 : 13} height={isL ? 24 : 13} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.8" /><line x1="5.63" y1="5.63" x2="18.37" y2="18.37" stroke="currentColor" strokeWidth="2.8" /></svg>;
  if (value === 'Reverse') return <svg width={isL ? 24 : 13} height={isL ? 24 : 13} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M4 12a8 8 0 0 1 14-5.3L21 9M3 15l3 2.3A8 8 0 0 0 20 12" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" /><path d="M21 4v5h-5M3 20v-5h5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (value === 'Wild') return <svg width={isL ? 26 : 14} height={isL ? 26 : 14} viewBox="0 0 24 24" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M 12 12 L 12 2 A 10 10 0 0 1 22 12 Z" fill="#FF6B6B" /><path d="M 12 12 L 22 12 A 10 10 0 0 1 12 22 Z" fill="#4D96FF" /><path d="M 12 12 L 12 22 A 10 10 0 0 1 2 12 Z" fill="#6BCB77" /><path d="M 12 12 L 2 12 A 10 10 0 0 1 12 2 Z" fill="#FFD93D" /></svg>;
  return value;
}

const COLOR_SORT_ORDER: Record<string, number> = { red: 1, blue: 2, green: 3, yellow: 4, wild: 5 };
export function sortUnoCards(cards: UnoCard[]): UnoCard[] {
  if (!Array.isArray(cards)) return [];
  return cards
    .filter((c): c is UnoCard => Boolean(c && c.color && c.value))
    .sort((a, b) => (COLOR_SORT_ORDER[a.color] || 99) - (COLOR_SORT_ORDER[b.color] || 99) || (a.value || '').localeCompare(b.value || '', undefined, { numeric: true }));
}

const RosePetal = ({ size = 32, rot = 0, opacity = 0.85 }: { size?: number; rot?: number; opacity?: number }) => (
  <div style={{ width: `${size}px`, height: `${size}px`, transform: `rotate(${rot}deg)`, filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.75))', opacity, pointerEvents: 'none', display: 'inline-block', animation: 'floatPetal 4s ease-in-out infinite alternate' }}>
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs><linearGradient id={`petalGrad_${rot}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF5E8E" /><stop offset="45%" stopColor="#FF3547" /><stop offset="85%" stopColor="#D81B60" /><stop offset="100%" stopColor="#880E4F" /></linearGradient></defs>
      <path d="M50 5 C68 20, 95 38, 90 68 C85 92, 55 98, 50 95 C45 98, 15 92, 10 68 C5 38, 32 20, 50 5 Z" fill={`url(#petalGrad_${rot})`} />
    </svg>
  </div>
);

export function UnoBoard({ myRole, onMove }: BoardProps) {
  const navigate = useNavigate(); void navigate;
  const { data: roomScore, refetch: refetchRoomScore } = useFetch<any>('/api/games/scoreboard/uno');
  const [gameRules, setGameRules] = useState<GameRules>({ stacking: true, progressiveDraw: true, multipleCardPlay: true, jumpIn: false, discardAll: true });
  const [showRulesDrawer, setShowRulesDrawer] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [deck, setDeck] = useState<UnoCard[]>([]);
  const [deckCount, setDeckCount] = useState<number>(92);
  const [playerHand, setPlayerHand] = useState<UnoCard[]>([]);
  const [opponentHand, setOpponentHand] = useState<UnoCard[]>([]);
  const [discardPile, setDiscardPile] = useState<UnoCard[]>([]);
  const [activeColor, setActiveColor] = useState<'red' | 'blue' | 'green' | 'yellow'>('red');
  const [currentTurn, setCurrentTurn] = useState<'boyfriend' | 'girlfriend'>('boyfriend');
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(false); void hasDrawnThisTurn;
  const [flyingCards, setFlyingCards] = useState<FlyingCardItem[]>([]);
  const [flyingCardProgress, setFlyingCardProgress] = useState<boolean>(false);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const discardRef = useRef<HTMLDivElement>(null);
  const drawDeckRef = useRef<HTMLButtonElement>(null);
  const opponentSeatRef = useRef<HTMLDivElement>(null);
  const playerHandRef = useRef<HTMLDivElement>(null);
  const cardElementRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const playSound = useCallback((type: 'cardPlay' | 'cardDraw' | 'error' | 'uno' | 'win' | 'penalty') => {
    triggerDeviceVibration([40]); if (isMuted) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current; if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination); const now = ctx.currentTime;
      if (type === 'cardPlay') { osc.type = 'triangle'; osc.frequency.setValueAtTime(440, now); osc.frequency.exponentialRampToValueAtTime(220, now + 0.08); gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.08); osc.start(now); osc.stop(now + 0.08); }
      else if (type === 'cardDraw') { osc.type = 'sine'; osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(600, now + 0.07); gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.07); osc.start(now); osc.stop(now + 0.07); }
      else if (type === 'error') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.setValueAtTime(120, now + 0.1); gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.2); osc.start(now); osc.stop(now + 0.2); }
      else if (type === 'uno') { osc.type = 'square'; osc.frequency.setValueAtTime(523.25, now); osc.frequency.setValueAtTime(659.25, now + 0.1); gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.25); osc.start(now); osc.stop(now + 0.25); }
      else if (type === 'win') { osc.type = 'triangle'; osc.frequency.setValueAtTime(523.25, now); osc.frequency.setValueAtTime(659.25, now + 0.12); osc.frequency.setValueAtTime(783.99, now + 0.24); gain.gain.setValueAtTime(0.4, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.45); osc.start(now); osc.stop(now + 0.45); }
      else if (type === 'penalty') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(80, now + 0.3); gain.gain.setValueAtTime(0.4, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.3); osc.start(now); osc.stop(now + 0.3); }
    } catch {}
  }, [isMuted]);

  const animateCardFlight = useCallback((items: FlyingCardItem[], onComplete: () => void) => {
    setFlyingCards((prev) => [...prev, ...items]);
    setFlyingCardProgress(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setFlyingCardProgress(true)));
    setTimeout(() => {
      onComplete();
      setFlyingCards((prev) => prev.filter((f) => !items.some((it) => it.id === f.id)));
      setFlyingCardProgress(false);
    }, 420);
  }, []);

  const [pendingDraw, setPendingDraw] = useState<number>(0);
  const [selectedWildCard, setSelectedWildCard] = useState<UnoCard | null>(null);
  const [showWildModal, setShowWildModal] = useState(false);
  const [selectedMultiIds, setSelectedMultiIds] = useState<string[]>([]);
  const [invalidCardShakeId, setInvalidCardShakeId] = useState<string | null>(null);
  const [unoCalled, setUnoCalled] = useState<{ boyfriend: boolean; girlfriend: boolean }>({ boyfriend: false, girlfriend: false });
  const [unoTimerActive, setUnoTimerActive] = useState<boolean>(false);
  const [unoCountdown, setUnoCountdown] = useState<number | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [banner, setBanner] = useState<string | null>(null);
  const [actionPopup, setActionPopup] = useState<string | null>(null);
  const [screenShaking, setScreenShaking] = useState(false);
  const [redLightingPulse, setRedLightingPulse] = useState(false);
  const [winnerRole, setWinnerRole] = useState<string | null>(null);
  const [drawnPlayableCard, setDrawnPlayableCard] = useState<UnoCard | null>(null);
  const [sessionScores, setSessionScores] = useState<SessionScore>({ boyfriend: 0, girlfriend: 0, totalGames: 0 });
  const [gameHistory, setGameHistory] = useState<GameRecord[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isWaitingForPartner, setIsWaitingForPartner] = useState<boolean>(true);
  const [connectedRoles, setConnectedRoles] = useState<string[]>([]);
  const [readyRoles, setReadyRoles] = useState<string[]>([]);
  const [isAiMode, setIsAiMode] = useState<boolean>(false);
  const [nudgeSent, setNudgeSent] = useState<boolean>(false);
  const [isDealingCards, setIsDealingCards] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState(300); void timeLeft; void setTimeLeft;
  const [ping, setPing] = useState<number>(24);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const opponentRole = myRole === 'boyfriend' ? 'girlfriend' : 'boyfriend';
  const partnerName = myRole === 'boyfriend' ? 'Seema' : 'Maulik';
  const myName = myRole === 'boyfriend' ? 'Maulik' : 'Seema';
  const isMyTurn = currentTurn === myRole && !winnerRole;
  const topDiscard = discardPile[discardPile.length - 1] || { id: 'start', color: 'red', value: '7' };
  const previousDiscards = discardPile.slice(-4, -1);

  const triggerActionAnimation = useCallback((data: any) => {
    if (!data) return;
    const actionRole = data.actionRole;
    const actionType = data.actionType;
    const actionCount = data.actionCount || 1;
    const actionCard = data.actionCard || data.topDiscard;
    if (!actionRole || !actionType) return;

    const opRect = opponentSeatRef.current?.getBoundingClientRect();
    const discardRect = discardRef.current?.getBoundingClientRect();
    const drawRect = drawDeckRef.current?.getBoundingClientRect();
    const myHandRect = playerHandRef.current?.getBoundingClientRect();

    const opX = opRect ? opRect.left + opRect.width / 2 - 40 : window.innerWidth / 2 - 40;
    const opY = opRect ? opRect.top + 20 : 60;
    const discardX = discardRect ? discardRect.left : window.innerWidth / 2 - 50;
    const discardY = discardRect ? discardRect.top : window.innerHeight / 2 - 70;
    const drawX = drawRect ? drawRect.left : window.innerWidth / 2 - 120;
    const drawY = drawRect ? drawRect.top : window.innerHeight / 2 - 70;
    const myX = myHandRect ? myHandRect.left + myHandRect.width / 2 - 40 : window.innerWidth / 2 - 40;
    const myY = myHandRect ? myHandRect.top : window.innerHeight - 140;

    if (actionRole !== myRole && (actionType === 'play_card' || actionType === 'playCard')) {
      const cardToFly: UnoCard = actionCard || { id: 'op_card', color: 'red', value: '7' };
      const flyItem: FlyingCardItem = {
        id: `op_play_${Date.now()}_${Math.random()}`,
        card: cardToFly,
        startX: opX,
        startY: opY,
        endX: discardX,
        endY: discardY,
        isBack: false
      };
      animateCardFlight([flyItem], () => {});
      playSound('cardPlay');
    }

    if (actionType === 'draw_card' || actionType === 'drawCard') {
      const isMyDraw = actionRole === myRole;
      const targetX = isMyDraw ? myX : opX;
      const targetY = isMyDraw ? myY : opY;

      for (let i = 0; i < actionCount; i++) {
        setTimeout(() => {
          const cardToFly: UnoCard = (isMyDraw && data.drawnPlayableCard) ? data.drawnPlayableCard : { id: `draw_${i}`, color: 'red', value: '0' };
          const flyItem: FlyingCardItem = {
            id: `draw_fly_${Date.now()}_${i}_${Math.random()}`,
            card: cardToFly,
            startX: drawX,
            startY: drawY,
            endX: targetX + (i % 2 === 0 ? 8 : -8),
            endY: targetY,
            isBack: !isMyDraw
          };
          animateCardFlight([flyItem], () => {});
          playSound('cardDraw');
        }, i * 180);
      }
    }
  }, [myRole, animateCardFlight, playSound]);

  const handleNudgePartner = () => { getSocketInstance().emit('uno_nudge'); setNudgeSent(true); setTimeout(() => setNudgeSent(false), 5000); };
  const handlePlayAgainClick = () => getSocketInstance().emit('uno_play_again');

  useEffect(() => {
    const socket = getSocketInstance();
    const doJoin = () => socket.emit('uno_join', { role: myRole });
    doJoin(); socket.on('connect', doJoin);
    const handleUnoSync = (data: any) => {
      if (data.isWaitingForPartner !== undefined) setIsWaitingForPartner(data.isWaitingForPartner);
      if (data.connectedRoles) setConnectedRoles(data.connectedRoles);
      if (data.readyRoles) setReadyRoles(data.readyRoles);
      if (data.myHand) setPlayerHand(data.myHand);
      if (data.opponentHandCount !== undefined) setOpponentHand(Array.from({ length: data.opponentHandCount }, (_, i) => ({ id: `op_back_${i}_${Date.now()}`, color: 'red', value: '0' })));
      if (data.topDiscard) setDiscardPile([data.topDiscard]);
      if (data.activeColor) setActiveColor(data.activeColor);
      if (data.currentTurn) setCurrentTurn(data.currentTurn);
      if (data.pendingDraw !== undefined) setPendingDraw(data.pendingDraw);
      if (data.deckCount !== undefined) setDeckCount(data.deckCount);
      if (data.drawnPlayableCard !== undefined) setDrawnPlayableCard(data.drawnPlayableCard);
      if (data.unoCalled) setUnoCalled(data.unoCalled);
      if (data.isGameActive) { setIsWaitingForPartner(false); setIsDealingCards(false); setShowLeaderboard(false); setWinnerRole(null); }
      triggerActionAnimation(data);
    };
    const handleGameMessage = (msg: any) => {
      if (msg?.type === 'state_update' && msg.state) {
        const s = msg.state;
        if (s.myHand) setPlayerHand(s.myHand);
        if (s.opponentHandCount !== undefined) setOpponentHand(Array.from({ length: s.opponentHandCount }, (_, i) => ({ id: `op_back_${i}_${Date.now()}`, color: 'red', value: '0' })));
        if (s.topDiscard) setDiscardPile([s.topDiscard]);
        if (s.activeColor) setActiveColor(s.activeColor);
        if (s.currentTurn) setCurrentTurn(s.currentTurn);
        if (s.pendingDraw !== undefined) setPendingDraw(s.pendingDraw);
        if (s.deckCount !== undefined) setDeckCount(s.deckCount);
        if (s.drawnPlayableCard !== undefined) setDrawnPlayableCard(s.drawnPlayableCard);
        if (s.unoCalled) setUnoCalled(s.unoCalled);
      }
    };
    const handleUnoGameOver = (data: any) => {
      setWinnerRole(data.winnerRole);
      if (data.sessionScores) setSessionScores(data.sessionScores);
      refetchRoomScore();
      playSound(data.winnerRole === myRole ? 'win' : 'penalty');
    };
    const handleUnoError = (data: any) => { if (data?.message) { playSound('error'); notify(`⚠️ ${data.message}`); } };

    socket.on('uno_sync', handleUnoSync); socket.on('game_message', handleGameMessage);
    socket.on('uno_game_over', handleUnoGameOver); socket.on('uno_error', handleUnoError);
    return () => { socket.off('connect', doJoin); socket.emit('uno_leave'); socket.off('uno_sync', handleUnoSync); socket.off('game_message', handleGameMessage); socket.off('uno_game_over', handleUnoGameOver); socket.off('uno_error', handleUnoError); };
  }, [myRole, triggerActionAnimation]);

  useEffect(() => { setHasDrawnThisTurn(false); }, [currentTurn]);



  useEffect(() => { const i = setInterval(() => setPing(Math.floor(18 + Math.random() * 10)), 2500); return () => clearInterval(i); }, []);
  const [matchElapsedSec, setMatchElapsedSec] = useState<number>(0);
  useEffect(() => { if (isWaitingForPartner || winnerRole) { setMatchElapsedSec(0); return; } const t = setInterval(() => setMatchElapsedSec((p) => p + 1), 1000); return () => clearInterval(t); }, [isWaitingForPartner, winnerRole]);
  const formatTimer = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const notify = (msg: string) => { setBanner(msg); setTimeout(() => setBanner(null), 2800); };
  const triggerActionPopup = (text: string, heavy = false) => {
    setActionPopup(text);
    if (heavy) { setScreenShaking(true); setRedLightingPulse(true); playSound('penalty'); setTimeout(() => { setScreenShaking(false); setRedLightingPulse(false); }, 900); }
    setTimeout(() => setActionPopup(null), 2000);
  };

  const sendSocialReaction = (emojiStr: string) => {
    const rx: FloatingReaction = { id: Date.now() + Math.random(), emoji: emojiStr, from: myName, left: 20 + Math.random() * 60 };
    setFloatingReactions((p) => [...p, rx]);
    setTimeout(() => setFloatingReactions((p) => p.filter((i) => i.id !== rx.id)), 2600); playSound('cardDraw');
  };

  const initGame = useCallback(() => {
    setIsDealingCards(true); playSound('cardDraw'); setHasDrawnThisTurn(false); setPendingDraw(0); setUnoCalled({ boyfriend: false, girlfriend: false });
    setUnoTimerActive(false); setUnoCountdown(null); setWinnerRole(null); setSelectedMultiIds([]); notify('7 Cards Dealt');
    setTimeout(() => setIsDealingCards(false), 1200);
  }, [playSound]);

  useEffect(() => { if (isAiMode) initGame(); }, [initGame, isAiMode]);
  useEffect(() => {
    if (!unoTimerActive || unoCountdown === null) return;
    if (unoCountdown <= 0) { setUnoTimerActive(false); setUnoCountdown(null); return; }
    const t = setTimeout(() => setUnoCountdown((p) => (p !== null ? p - 1 : null)), 1000); return () => clearTimeout(t);
  }, [unoTimerActive, unoCountdown]);

  const isCardPlayable = (card: UnoCard) => {
    if (!card || !card.color || !card.value) return false;
    if (pendingDraw > 0) {
      if (!gameRules.stacking) return false;
      if (card.value === '+2') return topDiscard?.value === '+2';
      if (card.value === '+4') return topDiscard?.value === '+4';
      return false;
    }
    return card.color === 'wild' || card.color === activeColor || card.value === topDiscard?.value;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, card: UnoCard) => {
    if (!isMyTurn) return; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStartPos.current = { x: e.clientX, y: e.clientY }; isDraggingRef.current = false; setDraggedCardId(card.id); setDragOffset({ x: 0, y: 0 });
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>, card: UnoCard) => {
    if (draggedCardId !== card.id) return; const dx = e.clientX - dragStartPos.current.x; const dy = e.clientY - dragStartPos.current.y;
    if (Math.hypot(dx, dy) > 8) isDraggingRef.current = true; setDragOffset({ x: dx, y: dy });
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>, card: UnoCard) => {
    if (draggedCardId !== card.id) return; try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    const dy = dragOffset.y; const dx = dragOffset.x; const wasDragging = isDraggingRef.current;
    const elem = cardElementRefs.current.get(card.id); const rect = elem?.getBoundingClientRect();
    const startX = rect ? rect.left + dx : e.clientX - 40; const startY = rect ? rect.top + dy : e.clientY - 60;
    setDraggedCardId(null); setDragOffset({ x: 0, y: 0 }); isDraggingRef.current = false;
    if (wasDragging && dy < -65) {
      if (isCardPlayable(card)) { card.color === 'wild' ? (setSelectedWildCard(card), setShowWildModal(true)) : executePlay([card], card.color as any, startX, startY); }
      else { setInvalidCardShakeId(card.id); playSound('error'); setTimeout(() => setInvalidCardShakeId(null), 500); notify(`Cannot play ${card.color.toUpperCase()} ${card.value}!`); }
    } else handleCardClick(card, startX, startY);
  };

  const handleCardClick = (card: UnoCard, customStartX?: number, customStartY?: number) => {
    if (!isMyTurn) return;
    if (!isCardPlayable(card) && !selectedMultiIds.includes(card.id)) {
      setInvalidCardShakeId(card.id); playSound('error'); setTimeout(() => setInvalidCardShakeId(null), 500);
      notify(pendingDraw > 0 ? `⚠️ +${pendingDraw} penalty active! Play +2/+4 to stack, or tap Draw Deck.` : `Cannot play ${card.color.toUpperCase()} ${card.value}! Color or Number must match.`);
      return;
    }
    if (gameRules.multipleCardPlay && selectedMultiIds.length > 0) {
      if (selectedMultiIds.includes(card.id)) setSelectedMultiIds((p) => p.filter((id) => id !== card.id));
      else {
        const first = playerHand.find((c) => selectedMultiIds.includes(c.id));
        if (first && first.value === card.value) setSelectedMultiIds((p) => [...p, card.id]);
        else { playSound('error'); notify('Multiple cards played together must share the same Number or Action!'); }
      }
    } else handleSinglePlay(card, customStartX, customStartY);
  };

  const handleSinglePlay = (card: UnoCard, customStartX?: number, customStartY?: number) => {
    if (!isMyTurn || !isCardPlayable(card)) return;
    if (card.color === 'wild') { setSelectedWildCard(card); setShowWildModal(true); return; }
    executePlay([card], card.color as any, customStartX, customStartY);
  };

  const handlePlaySelectedMultiple = () => {
    if (selectedMultiIds.length === 0) return;
    const cardsToPlay = playerHand.filter((c) => selectedMultiIds.includes(c.id)); const first = cardsToPlay[0];
    if (first.color === 'wild') { setSelectedWildCard(first); setShowWildModal(true); return; }
    executePlay(cardsToPlay, first.color as any);
  };

  const executePlay = (cards: UnoCard[], chosenColor: 'red' | 'blue' | 'green' | 'yellow', customStartX?: number, customStartY?: number) => {
    playSound('cardPlay'); const discardRect = discardRef.current?.getBoundingClientRect();
    const endX = discardRect ? discardRect.left : window.innerWidth / 2 - 50; const endY = discardRect ? discardRect.top : window.innerHeight / 2 - 70;
    const flyItems: FlyingCardItem[] = cards.map((c, idx) => {
      let sX = customStartX; let sY = customStartY;
      if (sX === undefined || sY === undefined) {
        const elem = cardElementRefs.current.get(c.id); const rect = elem?.getBoundingClientRect();
        sX = rect ? rect.left : window.innerWidth / 2 - 40; sY = rect ? rect.top : window.innerHeight - 140;
      }
      return { id: `${c.id}_fly_${Date.now()}_${idx}`, card: c, startX: sX + idx * 12, startY: sY, endX: endX + (idx % 2 === 0 ? 4 : -4), endY: endY + (idx % 2 === 0 ? -4 : 4) };
    });
    setShowWildModal(false); setSelectedWildCard(null); setSelectedMultiIds([]);
    animateCardFlight(flyItems, () => {});
    getSocketInstance().emit('uno_action', { role: myRole, action: 'play_card', cards, card: cards[0], card_id: cards[0].id, chosenColor });
  };

  const handleCallUno = () => {
    if (playerHand.length === 1) {
      getSocketInstance().emit('uno_action', { action: 'call_uno' });
      setUnoCalled((p) => ({ ...p, [myRole]: true })); setUnoTimerActive(false); setUnoCountdown(null);
      triggerActionPopup('UNO CALLED!'); playSound('uno'); notify('UNO CALLED SAFELY! 1 Card Remaining!');
    }
  };

  const handleCallOutOpponent = () => { getSocketInstance().emit('uno_action', { action: 'call_out', targetRole: opponentRole }); triggerActionPopup('ACCUSING FORGOT UNO!'); playSound('uno'); };
  const handleJumpIn = (card: UnoCard) => {
    if (!gameRules.jumpIn) return;
    if (topDiscard && card.color === topDiscard.color && card.value === topDiscard.value) {
      playSound('cardPlay'); getSocketInstance().emit('uno_action', { action: 'jump_in', card_id: card.id, card });
      triggerActionPopup('⚡ JUMP IN!', true); notify(`JUMP IN! Playing ${card.color.toUpperCase()} ${card.value}...`);
    }
  };

  const hasDefendCard = playerHand.some((c) => gameRules.stacking && ((c.value === '+2' && topDiscard.value === '+2') || (c.value === '+4' && topDiscard.value === '+4')));
  const handleDrawStackCards = () => {
    if (!isMyTurn) { playSound('error'); notify('Not your turn!'); return; }
    if (pendingDraw > 0) {
      if (hasDefendCard) { playSound('error'); notify(`You have a +2 or +4 card! You MUST throw your card to defend!`); return; }
      playSound('cardDraw'); getSocketInstance().emit('uno_action', { action: 'draw_card', type: 'drawCard', count: pendingDraw, nextTurn: opponentRole });
      notify(`Drew +${pendingDraw} penalty cards!`); setPendingDraw(0); setHasDrawnThisTurn(false); if (onMove) onMove({ type: 'drawCard' }); return;
    }
    playSound('cardDraw'); getSocketInstance().emit('uno_action', { action: 'draw_card', type: 'drawCard', count: 1 });
    notify('Drawing card from deck...'); setHasDrawnThisTurn(true); if (onMove) onMove({ type: 'drawCard' });
  };

  useEffect(() => {
    if (isMyTurn && pendingDraw > 0 && !hasDefendCard && flyingCards.length === 0 && !winnerRole) {
      const timer = setTimeout(() => handleDrawStackCards(), 800); return () => clearTimeout(timer);
    }
  }, [isMyTurn, pendingDraw, hasDefendCard, flyingCards.length, winnerRole]);

  const getSymbolDisplay = (val: string) => val === 'Skip' ? '⊘' : val === 'Reverse' ? '⇄' : val === 'Wild' ? 'W' : val === 'Discard All' ? 'ALL' : val;
  const jumpInCard = playerHand.find((c) => c.color === topDiscard.color && c.value === topDiscard.value && currentTurn !== myRole);
  const myScore = sessionScores[myRole as keyof SessionScore] as number;
  const partnerScore = sessionScores[opponentRole as keyof SessionScore] as number;
  const sessionLeader = myScore > partnerScore ? myName : partnerScore > myScore ? partnerName : null;

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#1C120C', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        .uno-hand-fan::-webkit-scrollbar { display: none; }
        @keyframes rotateCw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes actionPopupFly { 0% { opacity: 0; transform: translate(-50%, -40%) scale(0.3); } 40% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); } 80% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); } 100% { opacity: 0; transform: translate(-50%, -60%) scale(1.5); } }
        @keyframes pulseSphere { 0%, 100% { transform: scale(1) rotate(-10deg); box-shadow: 0 10px 30px rgba(255, 53, 71, 0.7), 0 0 20px #FFD700; } 50% { transform: scale(1.12) rotate(-6deg); box-shadow: 0 0 50px rgba(255, 53, 71, 1), 0 0 35px #FFD700; } }
        @keyframes cardInvalidShake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-10px) rotate(-6deg); } 40% { transform: translateX(10px) rotate(6deg); } 60% { transform: translateX(-8px) rotate(-4deg); } 80% { transform: translateX(8px) rotate(4deg); } }
        @keyframes floatRx { 0% { opacity: 0; transform: translateY(0) scale(0.6); } 20% { opacity: 1; transform: translateY(-30px) scale(1.2); } 80% { opacity: 1; transform: translateY(-120px) scale(1); } 100% { opacity: 0; transform: translateY(-160px) scale(0.8); } }
        @keyframes screenShake { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 20% { transform: translate(-6px, 4px) rotate(-1deg); } 40% { transform: translate(6px, -4px) rotate(1deg); } 60% { transform: translate(-4px, -2px) rotate(-0.5deg); } 80% { transform: translate(4px, 2px) rotate(0.5deg); } }
        @keyframes floatBokeh { 0% { transform: translateY(0px) scale(0.9); opacity: 0.3; } 100% { transform: translateY(-25px) scale(1.15); opacity: 0.7; } }
        @keyframes floatPetal { 0% { transform: translateY(0px) rotate(0deg) scale(0.95); } 50% { transform: translateY(-12px) rotate(10deg) scale(1.05); } 100% { transform: translateY(0px) rotate(0deg) scale(0.95); } }
        @keyframes floatHeartGlow { 0% { transform: translateY(0px) scale(0.85); opacity: 0.35; filter: drop-shadow(0 0 6px #FF3547); } 50% { transform: translateY(-25px) scale(1.18); opacity: 0.9; filter: drop-shadow(0 0 16px #FF5E8E); } 100% { transform: translateY(-50px) scale(0.8); opacity: 0.2; filter: drop-shadow(0 0 4px #FF3547); } }
        @keyframes lbSlideUp { 0% { opacity: 0; transform: translateY(60px) scale(0.9); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes crownBounce { 0%, 100% { transform: translateY(0) rotate(-8deg); } 50% { transform: translateY(-10px) rotate(8deg); } }
        @keyframes cardDealFlyIn { 0% { transform: translateY(-50vh) scale(0.2) rotate(45deg); opacity: 0; } 60% { transform: translateY(12px) scale(1.1); opacity: 1; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>

      {/* Floating Social Reactions */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 120, overflow: 'hidden' }}>
        {floatingReactions.map((rx) => (
          <div key={rx.id} style={{ position: 'absolute', bottom: '140px', left: `${rx.left}%`, fontSize: '2.5rem', animation: 'floatRx 2.6s ease-out forwards', filter: 'drop-shadow(0 6px 15px rgba(0,0,0,0.6))' }}>
            {rx.emoji}
          </div>
        ))}
      </div>

      {/* Flying Cards Overlay */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 300 }}>
        {flyingCards.map((fCard) => {
          const currentX = flyingCardProgress ? fCard.endX : fCard.startX; const currentY = flyingCardProgress ? fCard.endY : fCard.startY;
          const styleInfo = CARD_PALETTE[fCard.card.color] || CARD_PALETTE.red;
          return (
            <div key={fCard.id} style={{ position: 'fixed', left: `${currentX}px`, top: `${currentY}px`, width: '100px', height: '144px', borderRadius: '16px', background: fCard.isBack ? 'linear-gradient(135deg, #1C1A24 0%, #2E1A2B 100%)' : styleInfo.bg, border: '4px solid #FFFFFF', boxShadow: `0 20px 50px ${styleInfo.glow || 'rgba(0,0,0,0.8)'}, 0 0 30px #FFD700`, pointerEvents: 'none', transform: `rotate(${flyingCardProgress ? 8 : -18}deg) scale(${flyingCardProgress ? 1 : 1.22})`, transition: 'all 0.38s cubic-bezier(0.25, 0.8, 0.25, 1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '8px 6px' }}>
              {fCard.isBack ? (
                <div style={{ width: '74px', height: '114px', border: '3.5px solid #FF3547', borderRadius: '12px', background: '#D81B60', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 900 }}>
                  <span style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', transform: 'rotate(-25deg)', fontStyle: 'italic' }}>UNO</span>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 900, alignSelf: 'flex-start' }}>{getSymbolDisplay(fCard.card.value)}</span>
                  <div style={{ width: '50px', height: '76px', borderRadius: '50%', background: '#FFFFFF', transform: 'rotate(-25deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 900, color: styleInfo.ovalText, fontFamily: 'var(--font-display)', transform: 'rotate(25deg)' }}>{getSymbolDisplay(fCard.card.value)}</span>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 900, alignSelf: 'flex-end' }}>{getSymbolDisplay(fCard.card.value)}</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {banner && <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: 'linear-gradient(135deg, #FF3547 0%, #D81B60 100%)', color: '#FFFFFF', padding: '8px 24px', borderRadius: '99px', fontWeight: 800, fontSize: '0.9rem', boxShadow: '0 8px 25px rgba(255, 53, 71, 0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={16} /> {banner}</div>}

      {/* Main Game Surface */}
      <div style={{ width: '100vw', height: '100vh', background: redLightingPulse ? 'radial-gradient(ellipse at 50% 50%, #7A1C1C 0%, #3D0C0C 60%, #1A0505 100%)' : 'radial-gradient(ellipse at 50% 45%, #1E5C38 0%, #133D24 55%, #0B2415 100%)', padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden', animation: screenShaking ? 'screenShake 0.6s ease-in-out' : 'none' }}>

        {/* Keep/Play Drawn Card Choice Overlay */}
        {drawnPlayableCard && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 88888, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', paddingBottom: '120px' }}>
            <div style={{ background: 'linear-gradient(160deg, #1E0E28 0%, #2A1030 100%)', border: '2px solid rgba(255,215,0,0.45)', borderRadius: '24px', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', maxWidth: '340px', width: '90%', boxShadow: '0 -8px 40px rgba(0,0,0,0.8)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '52px', height: '76px', borderRadius: '10px', background: CARD_PALETTE[drawnPlayableCard.color]?.bg || '#444', border: '3px solid rgba(255,215,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: '1rem' }}>{getSymbolDisplay(drawnPlayableCard.value)}</span>
                </div>
                <div>
                  <div style={{ color: '#FFD700', fontSize: '1rem', fontWeight: 800 }}>Playable Card Drawn!</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{drawnPlayableCard.color.toUpperCase()} {drawnPlayableCard.value}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', width: '100%' }}>
                <button onClick={() => { setDrawnPlayableCard(null); getSocketInstance().emit('uno_action', { action: 'pass_turn', type: 'passTurn' }); notify(`Kept card. Turn passes to ${partnerName}.`); }} style={{ flex: 1, padding: '0.75rem 0', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.2)', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>✋ Keep</button>
                <button onClick={() => { const card = drawnPlayableCard; setDrawnPlayableCard(null); card.color === 'wild' ? (setSelectedWildCard(card), setShowWildModal(true)) : executePlay([card], card.color as any); }} style={{ flex: 1, padding: '0.75rem 0', borderRadius: '99px', background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)', border: 'none', color: '#1A0820', fontWeight: 800, cursor: 'pointer' }}>🃏 Play It</button>
              </div>
            </div>
          </div>
        )}

        {/* End Game Session Leaderboard Modal */}
        {showLeaderboard && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 199999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10, 4, 14, 0.92)', backdropFilter: 'blur(8px)', padding: '1rem' }}>
            <div style={{ maxWidth: '480px', width: '100%', background: 'linear-gradient(160deg, #1E0E28 0%, #2A1030 50%, #1A0820 100%)', border: '2.5px solid rgba(255, 215, 0, 0.5)', borderRadius: '28px', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'lbSlideUp 0.5s ease-out' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '0.25rem', animation: 'crownBounce 2s ease-in-out infinite' }}>{winnerRole === myRole ? '🏆' : '💜'}</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: winnerRole === myRole ? '#FFD700' : '#FF5E8E' }}>{winnerRole === myRole ? 'You Won! 🎉' : `${partnerName} Won! 💪`}</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>Game #{sessionScores.totalGames} • Session Stats</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,215,0,0.2)', borderRadius: '20px', padding: '1.25rem 1rem' }}>
                <div style={{ textAlign: 'center' }}><div style={{ width: '56px', height: '56px', borderRadius: '50%', background: myScore >= partnerScore ? '#FFD700' : 'rgba(255,255,255,0.1)', color: myScore >= partnerScore ? '#1A0820' : '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '1.4rem', fontWeight: 900 }}>{myScore}</div><div style={{ fontSize: '0.82rem', fontWeight: 700, marginTop: '4px', color: '#FFF' }}>{myName}</div></div>
                <Swords size={22} color="rgba(255,215,0,0.7)" />
                <div style={{ textAlign: 'center' }}><div style={{ width: '56px', height: '56px', borderRadius: '50%', background: partnerScore > myScore ? '#FFD700' : 'rgba(255,255,255,0.1)', color: partnerScore > myScore ? '#1A0820' : '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '1.4rem', fontWeight: 900 }}>{partnerScore}</div><div style={{ fontSize: '0.82rem', fontWeight: 700, marginTop: '4px', color: '#FFF' }}>{partnerName}</div></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button onClick={handlePlayAgainClick} disabled={readyRoles.includes(myRole)} style={{ width: '100%', padding: '0.9rem', borderRadius: '99px', background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)', border: 'none', color: '#1A0820', fontSize: '1.1rem', fontWeight: 900, cursor: 'pointer' }}>{readyRoles.includes(myRole) ? `Waiting for ${partnerName}...` : 'Play Again'}</button>
                <button onClick={() => window.history.back()} style={{ width: '100%', padding: '0.75rem', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.15)', color: '#FFF', fontWeight: 700, cursor: 'pointer' }}>Go Back</button>
              </div>
            </div>
          </div>
        )}

        {/* Ambient Decorative Layer */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 8 }}>
          {[
            { left: '3%', top: '6%', rot: -28, size: 38 }, { right: '4%', top: '8%', rot: 42, size: 40 },
            { left: '4%', bottom: '12%', rot: 18, size: 36 }, { right: '5%', bottom: '14%', rot: -35, size: 34 },
          ].map((p, idx) => <div key={`p_${idx}`} style={{ position: 'absolute', left: p.left, right: p.right, top: p.top, bottom: p.bottom }}><RosePetal size={p.size} rot={p.rot} /></div>)}
        </div>

        {/* Lobby Waiting Overlay */}
        {isWaitingForPartner && !isAiMode && !winnerRole && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 9999, background: 'rgba(12, 10, 18, 0.92)', backdropFilter: 'blur(18px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', color: '#FFF' }}>
            <div style={{ maxWidth: '440px', width: '100%', background: 'rgba(255, 255, 255, 0.07)', border: '2px solid rgba(255, 215, 0, 0.3)', borderRadius: '28px', padding: '36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>🎮</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFD700', margin: 0 }}>UNO Battle Lobby</h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.98rem', margin: 0 }}>Waiting for <strong>{partnerName}</strong> to enter...</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                {connectedRoles.includes(opponentRole) && <button onClick={() => getSocketInstance().emit('uno_start_game')} style={{ width: '100%', padding: '14px', borderRadius: '16px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFF', fontWeight: 900, border: 'none', cursor: 'pointer' }}>⚡ Start Match Now</button>}
                <button onClick={handleNudgePartner} disabled={nudgeSent} style={{ width: '100%', padding: '14px', borderRadius: '16px', background: nudgeSent ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #FF5E8E 0%, #E91E63 100%)', color: '#FFF', fontWeight: 900, border: 'none', cursor: nudgeSent ? 'default' : 'pointer' }}>{nudgeSent ? `💌 Invite Sent!` : `💌 Send Invite to ${partnerName}`}</button>
                <button onClick={() => setIsAiMode(true)} style={{ width: '100%', padding: '12px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.08)', border: '1.5px solid rgba(255, 255, 255, 0.2)', color: '#FFF', fontWeight: 700, cursor: 'pointer' }}>🤖 Play vs AI (Solo Mode)</button>
              </div>
            </div>
          </div>
        )}

        {/* Top HUD */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, paddingLeft: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #FFB300 0%, #F57F17 100%)', border: '3px solid #FFF8E1', padding: '6px 16px', borderRadius: '99px', color: '#FFFFFF', fontWeight: 900, fontSize: '1.1rem' }}><Clock size={20} /><span>{formatTimer(matchElapsedSec)}</span></div>
            <div style={{ background: '#FFF9F2', border: '2.5px solid #2D152B', borderRadius: '99px', padding: '6px 16px', fontWeight: 700, fontSize: '0.9rem', color: '#2D152B' }}>Maulik {roomScore?.wins?.Maulik || 0} — {roomScore?.wins?.Seema || 0} Seema</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setIsMuted(!isMuted)} style={{ background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '6px', border: '1.5px solid rgba(255,255,255,0.3)', color: isMuted ? '#FF5E8E' : '#00FFCC', fontWeight: 800, cursor: 'pointer' }}>{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}<span>{isMuted ? 'Muted' : 'Audio'}</span></button>
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '6px', border: '1.5px solid rgba(255,255,255,0.3)', color: '#00FFCC', fontWeight: 800 }}><Signal size={16} /><span>{ping}ms</span></div>
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '6px', border: '1.5px solid rgba(255,255,255,0.3)', color: '#FFD700', fontWeight: 800 }}><Layers size={16} /><span>{deckCount || deck.length || 0}</span></div>
          </div>
        </div>

        {/* Opponent Seat */}
        <div ref={opponentSeatRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 10, marginTop: '-6px' }}>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {opponentHand.length === 1 && !unoCalled[opponentRole] && (
              <button onClick={handleCallOutOpponent} style={{ position: 'absolute', left: '-150px', top: '0', background: 'linear-gradient(135deg, #FF3547 0%, #D81B60 100%)', color: '#FFD700', padding: '8px 16px', borderRadius: '99px', border: '3px solid #FFD700', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', animation: 'pulseSphere 1s infinite' }}><ShieldAlert size={18} /> CALL OUT!</button>
            )}
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF8A65 0%, #E64A19 100%)', border: currentTurn === opponentRole ? '4px solid #00FFCC' : '4px solid #FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#FFF', fontSize: '1.8rem' }}>{partnerName[0]}</div>
            <div style={{ background: 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)', color: '#FFF', fontWeight: 900, fontSize: '0.9rem', padding: '3px 18px', borderRadius: '99px', border: '2px solid #FFD700', marginTop: '-10px' }}>{partnerName} ({opponentHand.length})</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', height: '54px' }}>
            {Array.from({ length: Math.min(10, opponentHand.length) }).map((_, i) => (
              <div key={i} style={{ width: '42px', height: '58px', borderRadius: '8px', background: 'linear-gradient(135deg, #1C1A24 0%, #2E1A2B 100%)', border: '2px solid #FFF', marginLeft: i > 0 ? '-22px' : '0', transform: `rotate(${Math.min(15, Math.max(-15, (i - 4) * 4))}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '28px', height: '42px', border: '2px solid #FF3547', borderRadius: '4px', background: '#D81B60', color: '#FFF', fontWeight: 900, fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>UNO</div>
              </div>
            ))}
          </div>
        </div>

        {/* Turn Status Banner */}
        <div style={{ zIndex: 12, marginTop: '-10px' }}>
          <div style={{ background: isMyTurn ? (pendingDraw > 0 ? 'linear-gradient(135deg, #FF3547 0%, #D81B60 100%)' : 'linear-gradient(135deg, #27AE60 0%, #1E824C 100%)') : 'rgba(0, 0, 0, 0.75)', color: isMyTurn ? '#FFF' : '#FFD700', padding: '6px 26px', borderRadius: '99px', border: '2.5px solid #FFD700', fontWeight: 900, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isMyTurn ? (pendingDraw > 0 ? <><ShieldAlert size={18} color="#FFD700" /><span>+${pendingDraw} STACK ACTIVE</span></> : <><Sparkles size={16} color="#FFD700" /><span>YOUR TURN</span></>) : <><Clock size={15} color="#FFD700" /><span>{partnerName} is playing...</span></>}
          </div>
        </div>

        {actionPopup && <div style={{ position: 'absolute', top: '48%', left: '50%', zIndex: 40, animation: 'actionPopupFly 2s ease-out forwards', pointerEvents: 'none' }}><div style={{ fontSize: '4.5rem', fontWeight: 900, color: '#FF3547', textShadow: '0 10px 35px rgba(0,0,0,0.9), 0 0 45px #FFD700' }}>{actionPopup}</div></div>}

        {/* Wild Color Selection Pinwheel Modal */}
        {showWildModal && selectedWildCard && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50, background: '#FFF9F2', border: '3px solid #2D152B', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ color: '#2D152B', fontWeight: 700, fontSize: '1.1rem' }}>Select Wild Color</div>
            <div style={{ position: 'relative', width: '140px', height: '140px', borderRadius: '50%', border: '3px solid #2D152B', overflow: 'hidden' }}>
              <button onClick={() => executePlay([selectedWildCard], 'red')} style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '50%', background: '#FF6B6B', border: 'none', cursor: 'pointer' }} />
              <button onClick={() => executePlay([selectedWildCard], 'blue')} style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '50%', background: '#4D96FF', border: 'none', cursor: 'pointer' }} />
              <button onClick={() => executePlay([selectedWildCard], 'green')} style={{ position: 'absolute', bottom: 0, left: 0, width: '50%', height: '50%', background: '#6BCB77', border: 'none', cursor: 'pointer' }} />
              <button onClick={() => executePlay([selectedWildCard], 'yellow')} style={{ position: 'absolute', bottom: 0, right: 0, width: '50%', height: '50%', background: '#FFD93D', border: 'none', cursor: 'pointer' }} />
            </div>
          </div>
        )}

        {/* Center Playfield (Deck & Discard Stack) */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '70px', zIndex: 11, margin: '4px 0' }}>
          <button ref={drawDeckRef} onClick={handleDrawStackCards} disabled={!isMyTurn} style={{ width: '100px', height: '144px', borderRadius: '16px', border: '3px solid #2D152B', background: '#2D152B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isMyTurn ? 'pointer' : 'not-allowed' }}>
            <div style={{ width: '74px', height: '114px', border: '2px solid #FFF9F2', borderRadius: '12px', background: '#FF6B6B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF9F2', fontWeight: 900, fontSize: '1.4rem' }}>{pendingDraw > 0 ? `+${pendingDraw}` : 'UNO'}</div>
          </button>
          <div ref={discardRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{ width: '102px', height: '146px', borderRadius: '16px', border: '3px solid #2D152B', background: CARD_PALETTE[topDiscard.color]?.bg || CARD_PALETTE.red.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px', transform: 'rotate(2deg)' }}>
              <span style={{ fontSize: '0.85rem', color: '#FFF', fontWeight: 800, alignSelf: 'flex-start' }}>{renderCardSymbol(topDiscard.value, 'small')}</span>
              <div style={{ width: '68px', height: '96px', borderRadius: '50%', background: '#FFF', border: '2px solid #2D152B', transform: 'rotate(-25deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 900, color: CARD_PALETTE[topDiscard.color]?.ovalText || '#FF6B6B', transform: 'rotate(25deg)' }}>{renderCardSymbol(topDiscard.value, 'large')}</span>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#FFF', fontWeight: 800, alignSelf: 'flex-end', transform: 'rotate(180deg)' }}>{renderCardSymbol(topDiscard.value, 'small')}</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '12px', background: 'rgba(0,0,0,0.85)', padding: '6px 18px', borderRadius: '99px', border: '2px solid rgba(255,255,255,0.4)', color: '#FFF', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.82rem' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: CARD_PALETTE[activeColor]?.bg || '#FF3547' }} />Color: {activeColor}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ zIndex: 12, display: 'flex', gap: '14px', alignItems: 'center' }}>
          {jumpInCard && <button onClick={() => handleJumpIn(jumpInCard)} style={{ padding: '8px 20px', fontWeight: 900, background: 'linear-gradient(135deg, #FFD700 0%, #FF8F00 100%)', color: '#2A1706', border: '3px solid #FFF', borderRadius: '99px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={18} /> JUMP IN!</button>}
          {selectedMultiIds.length > 1 && isMyTurn && <button onClick={handlePlaySelectedMultiple} style={{ padding: '8px 22px', fontWeight: 900, background: 'linear-gradient(135deg, #27AE60 0%, #1E824C 100%)', color: '#FFF', border: '3px solid #FFF', borderRadius: '99px', cursor: 'pointer' }}>PLAY {selectedMultiIds.length} CARDS</button>}
        </div>

        {/* Bottom Seat & Player Hand Fan */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 10, padding: '0 12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '99px', border: '1.5px solid rgba(255,255,255,0.3)' }}>
              {['❤️', '🔥', '😂', '😈', '😤'].map((e) => <button key={e} onClick={() => sendSocialReaction(e)} style={{ background: 'transparent', border: 'none', fontSize: '1.15rem', cursor: 'pointer' }}>{e}</button>)}
            </div>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)', border: isMyTurn ? '4px solid #00FFCC' : '4px solid #FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#FFF', fontSize: '1.8rem' }}>{myName[0]}</div>
            <div style={{ background: 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)', color: '#FFF', fontWeight: 900, fontSize: '0.88rem', padding: '3px 18px', borderRadius: '99px', border: '2px solid #FFD700', marginTop: '-10px' }}>{myName}</div>
          </div>

          <div ref={playerHandRef} className="uno-hand-fan" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', padding: '35px 35px 12px 35px', overflowX: 'auto', maxWidth: '85%', width: '100%', flex: 1, margin: '0 10px' }}>
            {sortUnoCards(playerHand).map((card, idx) => {
              const playable = isMyTurn && isCardPlayable(card); const isSelectedMulti = selectedMultiIds.includes(card.id);
              const styleInfo = CARD_PALETTE[card.color] || CARD_PALETTE.red;
              const angle = Math.min(18, Math.max(-18, (idx - (playerHand.length - 1) / 2) * 3));
              return (
                <div key={card.id} ref={(el) => { if (el) cardElementRefs.current.set(card.id, el); else cardElementRefs.current.delete(card.id); }} onPointerDown={(e) => handlePointerDown(e, card)} onPointerMove={(e) => handlePointerMove(e, card)} onPointerUp={(e) => handlePointerUp(e, card)} style={{ minWidth: '82px', height: '122px', borderRadius: '16px', background: styleInfo.bg, border: isSelectedMulti ? '4px solid #FFD700' : playable ? '4px solid #FFF' : '2.5px solid rgba(255,255,255,0.6)', marginLeft: idx > 0 ? '-18px' : '0', cursor: isMyTurn ? 'grab' : 'not-allowed', filter: playable || isSelectedMulti ? 'none' : 'brightness(0.78)', transform: draggedCardId === card.id ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0px) scale(1.18)` : isSelectedMulti ? 'translateY(-28px) scale(1.18)' : `rotate(${angle}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '8px 6px', userSelect: 'none' }}>
                  <span style={{ fontSize: '0.78rem', color: '#FFF', fontWeight: 800, alignSelf: 'flex-start' }}>{renderCardSymbol(card.value, 'small')}</span>
                  <div style={{ width: '48px', height: '72px', borderRadius: '50%', background: '#FFF', border: '2px solid #2D152B', transform: 'rotate(-25deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: card.value.length > 2 ? '1.15rem' : '1.75rem', fontWeight: 900, color: styleInfo.ovalText, transform: 'rotate(25deg)' }}>{renderCardSymbol(card.value, 'large')}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#FFF', fontWeight: 800, alignSelf: 'flex-end', transform: 'rotate(180deg)' }}>{renderCardSymbol(card.value, 'small')}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <button onClick={handleCallUno} disabled={playerHand.length !== 1} style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #FF5E8E 0%, #FF3547 45%, #D81B60 70%, #880E4F 100%)', border: '5px solid #FFD700', color: '#FFD700', fontSize: '1.6rem', fontWeight: 900, cursor: playerHand.length === 1 ? 'pointer' : 'not-allowed', filter: playerHand.length === 1 ? 'none' : 'brightness(0.7)', animation: playerHand.length === 1 ? 'pulseSphere 1s infinite' : 'none' }}>UNO!</button>
          </div>
        </div>
      </div>

      {/* Game Over Banner Overlay */}
      {winnerRole && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(45, 21, 43, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '380px', background: '#FFF9F2', border: '3px solid #2D152B', borderRadius: '24px', padding: '28px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2D152B', margin: 0 }}>{winnerRole === 'tie' ? '🤝 Match Tied!' : winnerRole === myRole ? '🎉 You Won!' : `🎉 ${partnerName} Won!`}</h2>
            <button onClick={() => { setWinnerRole(null); getSocketInstance().emit('uno_start_game'); }} style={{ width: '100%', padding: '12px', borderRadius: '14px', background: '#6BCB77', color: '#2D152B', border: '2px solid #2D152B', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}
