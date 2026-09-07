import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Sparkles, Check, RotateCw, Clock, Signal, Crown, Award, Zap, Sliders, ShieldAlert, Smartphone, Volume2, VolumeX, Download, Bell, Heart, Trophy, Swords, RotateCcw, Home } from 'lucide-react';
import { requestMobileNotificationPermission, sendMobileNotification, triggerDeviceVibration } from '../../utils/mobileNotifications';
import { getSocketInstance } from '../../hooks/useSocket';
import { useFetch } from '../../hooks/useFetch';

interface BoardProps {
  state: any;
  myRole: string;
  isMyTurn: boolean;
  onMove: (payload: any) => void;
}

interface UnoCard {
  id: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'wild';
  value: string; // '0'-'9', 'Skip', 'Reverse', '+2', 'Wild', '+4', 'Discard All'
}

interface GameRules {
  stacking: boolean;
  progressiveDraw: boolean;
  multipleCardPlay: boolean;
  jumpIn: boolean;
  discardAll: boolean;
}

interface FloatingReaction {
  id: number;
  emoji: string;
  from: string;
  left: number;
}

interface SessionScore {
  boyfriend: number;
  girlfriend: number;
  totalGames: number;
}

interface GameRecord {
  gameNumber: number;
  winner: 'boyfriend' | 'girlfriend';
  winnerName: string;
  timestamp: Date;
}

interface FlyingCardItem {
  id: string;
  card: UnoCard;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isBack?: boolean;
}

const CARD_PALETTE: Record<string, { bg: string; ovalText: string; glow: string }> = {
  red: { bg: '#FF6B6B', ovalText: '#FF6B6B', glow: 'rgba(0,0,0,0.15)' },
  blue: { bg: '#4D96FF', ovalText: '#4D96FF', glow: 'rgba(0,0,0,0.15)' },
  green: { bg: '#6BCB77', ovalText: '#6BCB77', glow: 'rgba(0,0,0,0.15)' },
  yellow: { bg: '#FFD93D', ovalText: '#D4AC0D', glow: 'rgba(0,0,0,0.15)' },
  wild: { bg: '#2D152B', ovalText: '#2D152B', glow: 'rgba(0,0,0,0.15)' },
};

function renderCardSymbol(value: string, size: 'large' | 'small' = 'large') {
  if (value === 'Skip') {
    const iconSize = size === 'large' ? 24 : 13;
    return (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.8" />
        <line x1="5.63" y1="5.63" x2="18.37" y2="18.37" stroke="currentColor" strokeWidth="2.8" />
      </svg>
    );
  }

  if (value === 'Reverse') {
    const iconSize = size === 'large' ? 24 : 13;
    return (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M4 12a8 8 0 0 1 14-5.3L21 9M3 15l3 2.3A8 8 0 0 0 20 12" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M21 4v5h-5M3 20v-5h5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (value === 'Wild') {
    const iconSize = size === 'large' ? 26 : 14;
    return (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M 12 12 L 12 2 A 10 10 0 0 1 22 12 Z" fill="#FF6B6B" />
        <path d="M 12 12 L 22 12 A 10 10 0 0 1 12 22 Z" fill="#4D96FF" />
        <path d="M 12 12 L 12 22 A 10 10 0 0 1 2 12 Z" fill="#6BCB77" />
        <path d="M 12 12 L 2 12 A 10 10 0 0 1 12 2 Z" fill="#FFD93D" />
      </svg>
    );
  }

  return value;
}

const COLOR_SORT_ORDER: Record<string, number> = {
  red: 1,
  blue: 2,
  green: 3,
  yellow: 4,
  wild: 5,
};

export function sortUnoCards(cards: UnoCard[]): UnoCard[] {
  return [...cards].sort((a, b) => {
    const colorDiff = (COLOR_SORT_ORDER[a.color] || 99) - (COLOR_SORT_ORDER[b.color] || 99);
    if (colorDiff !== 0) return colorDiff;
    return a.value.localeCompare(b.value, undefined, { numeric: true });
  });
}

const RosePetal = ({ size = 32, rot = 0, opacity = 0.85 }: { size?: number; rot?: number; opacity?: number }) => (
  <div
    style={{
      width: `${size}px`,
      height: `${size}px`,
      transform: `rotate(${rot}deg)`,
      filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.75))',
      opacity,
      pointerEvents: 'none',
      display: 'inline-block',
      animation: 'floatPetal 4s ease-in-out infinite alternate',
    }}
  >
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id={`petalGrad_${rot}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5E8E" />
          <stop offset="45%" stopColor="#FF3547" />
          <stop offset="85%" stopColor="#D81B60" />
          <stop offset="100%" stopColor="#880E4F" />
        </linearGradient>
      </defs>
      <path
        d="M50 5 C68 20, 95 38, 90 68 C85 92, 55 98, 50 95 C45 98, 15 92, 10 68 C5 38, 32 20, 50 5 Z"
        fill={`url(#petalGrad_${rot})`}
      />
    </svg>
  </div>
);

function build108Deck(): UnoCard[] {
  const deck: UnoCard[] = [];
  let id = 1;
  const colors: ('red' | 'blue' | 'green' | 'yellow')[] = ['red', 'blue', 'green', 'yellow'];
  const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', '+2', 'Discard All'];

  colors.forEach((color) => {
    values.forEach((val) => {
      deck.push({ id: `card_${id++}`, color, value: val });
      if (val !== '0' && val !== 'Discard All') deck.push({ id: `card_${id++}`, color, value: val });
    });
  });

  for (let i = 0; i < 4; i++) {
    deck.push({ id: `card_${id++}`, color: 'wild', value: 'Wild' });
    deck.push({ id: `card_${id++}`, color: 'wild', value: '+4' });
  }

  return deck.sort(() => Math.random() - 0.5);
}

export function UnoBoard({ myRole, onMove }: BoardProps) {
  const navigate = useNavigate();
  const { data: roomScore, refetch: refetchRoomScore } = useFetch<any>('/api/games/scoreboard/uno');
  // Configurable House Rules
  const [gameRules, setGameRules] = useState<GameRules>({
    stacking: true,
    progressiveDraw: true,
    multipleCardPlay: true,
    jumpIn: false,
    discardAll: true,
  });
  const [showRulesDrawer, setShowRulesDrawer] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Deck & Hand State
  const [deck, setDeck] = useState<UnoCard[]>([]);
  const [deckCount, setDeckCount] = useState<number>(92);
  const [playerHand, setPlayerHand] = useState<UnoCard[]>([]);
  const [opponentHand, setOpponentHand] = useState<UnoCard[]>([]);
  const [discardPile, setDiscardPile] = useState<UnoCard[]>([]);
  const [activeColor, setActiveColor] = useState<'red' | 'blue' | 'green' | 'yellow'>('red');
  const [currentTurn, setCurrentTurn] = useState<'boyfriend' | 'girlfriend'>('boyfriend');
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(false);
  void hasDrawnThisTurn;

  // Drag & Flying Card Animations State
  const [flyingCards, setFlyingCards] = useState<FlyingCardItem[]>([]);
  const [flyingCardProgress, setFlyingCardProgress] = useState<boolean>(false);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);

  // Element DOM Refs for Exact Screen Positions
  const discardRef = useRef<HTMLDivElement>(null);
  const drawDeckRef = useRef<HTMLButtonElement>(null);
  const opponentSeatRef = useRef<HTMLDivElement>(null);
  const playerHandRef = useRef<HTMLDivElement>(null);
  const cardElementRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const animateCardFlight = useCallback((items: FlyingCardItem[], onComplete: () => void) => {
    setFlyingCards(items);
    setFlyingCardProgress(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlyingCardProgress(true);
      });
    });

    setTimeout(() => {
      onComplete();
      setFlyingCards([]);
      setFlyingCardProgress(false);
    }, 380);
  }, []);

  // Stacking & Draw Penalty State
  const [pendingDraw, setPendingDraw] = useState<number>(0);

  // Wild Card Modal
  const [selectedWildCard, setSelectedWildCard] = useState<UnoCard | null>(null);
  const [showWildModal, setShowWildModal] = useState(false);

  // Multiple Card Selection Mode
  const [selectedMultiIds, setSelectedMultiIds] = useState<string[]>([]);
  const [invalidCardShakeId, setInvalidCardShakeId] = useState<string | null>(null);

  // UNO & Call-Out Mechanics State
  const [unoCalled, setUnoCalled] = useState<{ boyfriend: boolean; girlfriend: boolean }>({ boyfriend: false, girlfriend: false });
  const [unoTimerActive, setUnoTimerActive] = useState<boolean>(false);
  const [unoCountdown, setUnoCountdown] = useState<number | null>(null);

  // Social Floating Reactions
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);

  // FX & Overlay State
  const [banner, setBanner] = useState<string | null>(null);
  const [actionPopup, setActionPopup] = useState<string | null>(null);
  const [screenShaking, setScreenShaking] = useState(false);
  const [redLightingPulse, setRedLightingPulse] = useState(false);
  const [winnerRole, setWinnerRole] = useState<string | null>(null);

  // Draw-and-choose: card drawn this turn that is playable (player picks Keep or Play)
  const [drawnPlayableCard, setDrawnPlayableCard] = useState<UnoCard | null>(null);

  // Session Leaderboard State
  const [sessionScores, setSessionScores] = useState<SessionScore>({ boyfriend: 0, girlfriend: 0, totalGames: 0 });
  const [gameHistory, setGameHistory] = useState<GameRecord[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isWaitingForPartner, setIsWaitingForPartner] = useState<boolean>(true);
  const [connectedRoles, setConnectedRoles] = useState<string[]>([]);
  const [readyRoles, setReadyRoles] = useState<string[]>([]);
  const [isAiMode, setIsAiMode] = useState<boolean>(false);
  const [nudgeSent, setNudgeSent] = useState<boolean>(false);
  const [isDealingCards, setIsDealingCards] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState(300);
  const [ping, setPing] = useState<number>(24);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const opponentRole = myRole === 'boyfriend' ? 'girlfriend' : 'boyfriend';
  const partnerName = myRole === 'boyfriend' ? 'Seema' : 'Maulik';
  const myName = myRole === 'boyfriend' ? 'Maulik' : 'Seema';

  const isMyTurn = currentTurn === myRole && !winnerRole;
  const topDiscard = discardPile[discardPile.length - 1] || { id: 'start', color: 'red', value: '7' };
  const previousDiscards = discardPile.slice(-4, -1); // Last 3 cards for history stack

  const handleNudgePartner = () => {
    const socket = getSocketInstance();
    socket.emit('uno_nudge');
    setNudgeSent(true);
    setTimeout(() => setNudgeSent(false), 5000);
  };

  const handlePlayAgainClick = () => {
    const socket = getSocketInstance();
    socket.emit('uno_play_again');
  };

  // Socket.IO Real-Time Synchronization for Authoritative Multiplayer UNO
  useEffect(() => {
    const socket = getSocketInstance();
    const doJoin = () => {
      socket.emit('uno_join', { role: myRole });
    };

    doJoin();
    socket.on('connect', doJoin);

    const handleUnoSync = (data: any) => {
      if (data.isWaitingForPartner !== undefined) {
        setIsWaitingForPartner(data.isWaitingForPartner);
      }
      if (data.connectedRoles) {
        setConnectedRoles(data.connectedRoles);
      }
      if (data.readyRoles) {
        setReadyRoles(data.readyRoles);
      }
      if (data.myHand) {
        setPlayerHand(data.myHand);
      }
      if (data.opponentHandCount !== undefined) {
        setOpponentHand(
          Array.from({ length: data.opponentHandCount }, (_, i) => ({ id: `op_back_${i}_${Date.now()}`, color: 'red', value: '0' }))
        );
      }
      if (data.topDiscard) {
        setDiscardPile([data.topDiscard]);
      }
      if (data.activeColor) {
        setActiveColor(data.activeColor);
      }
      if (data.currentTurn) {
        setCurrentTurn(data.currentTurn);
      }
      if (data.pendingDraw !== undefined) {
        setPendingDraw(data.pendingDraw);
      }
      if (data.deckCount !== undefined) {
        setDeckCount(data.deckCount);
      }
      if (data.matchTimeLeft !== undefined) {
        setTimeLeft(data.matchTimeLeft);
      }
      if (data.drawnPlayableCard !== undefined) {
        setDrawnPlayableCard(data.drawnPlayableCard);
      }
      if (data.unoCalled) {
        setUnoCalled(data.unoCalled);
      }
      if (data.isGameActive !== undefined && data.isGameActive) {
        setIsWaitingForPartner(false);
        setIsDealingCards(false);
        setShowLeaderboard(false);
        setWinnerRole(null);
      }
    };

    const handleGameMessage = (msg: any) => {
      if (msg && msg.type === 'state_update' && msg.state) {
        const s = msg.state;
        if (s.myHand) setPlayerHand(s.myHand);
        if (s.opponentHandCount !== undefined) {
          setOpponentHand(
            Array.from({ length: s.opponentHandCount }, (_, i) => ({ id: `op_back_${i}_${Date.now()}`, color: 'red', value: '0' }))
          );
        }
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
      if (data.sessionScores) {
        setSessionScores(data.sessionScores);
      }
      refetchRoomScore();
      if (data.winnerRole === myRole) {
        playSound('win');
      } else {
        playSound('penalty');
      }
    };


    const handleUnoError = (data: any) => {
      if (data && data.message) {
        playSound('error');
        notify(`⚠️ ${data.message}`);
      }
    };

    socket.on('uno_sync', handleUnoSync);
    socket.on('game_message', handleGameMessage);
    socket.on('uno_game_over', handleUnoGameOver);
    socket.on('uno_error', handleUnoError);

    return () => {
      socket.off('connect', doJoin);
      socket.emit('uno_leave');
      socket.off('uno_sync', handleUnoSync);
      socket.off('game_message', handleGameMessage);
      socket.off('uno_game_over', handleUnoGameOver);
      socket.off('uno_error', handleUnoError);
    };
  }, [myRole]);

  useEffect(() => {
    setHasDrawnThisTurn(false);
  }, [currentTurn]);

  // Web Audio API Sound Generator Synthesizer
  const playSound = useCallback(
    (type: 'cardPlay' | 'cardDraw' | 'error' | 'uno' | 'win' | 'penalty') => {
      triggerDeviceVibration([40]);
      if (isMuted) return;
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'cardPlay') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
        } else if (type === 'cardDraw') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.07);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.07);
          osc.start(now);
          osc.stop(now + 0.07);
        } else if (type === 'error') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.setValueAtTime(120, now + 0.1);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
        } else if (type === 'uno') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.1);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
        } else if (type === 'win') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.12);
          osc.frequency.setValueAtTime(783.99, now + 0.24);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.45);
          osc.start(now);
          osc.stop(now + 0.45);
        } else if (type === 'penalty') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
        }
      } catch (e) {
        console.error('Audio play error:', e);
      }
    },
    [isMuted]
  );

  // Dynamic Ping measurement
  useEffect(() => {
    const pingInterval = setInterval(() => {
      setPing(Math.floor(18 + Math.random() * 10));
    }, 2500);
    return () => clearInterval(pingInterval);
  }, []);

  // Timer is driven by server's matchTimeLeft in uno_sync — no local countdown needed

  const formatTimer = (seconds: number) => {
    if (!seconds && isWaitingForPartner) return '05:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const notify = (msg: string) => {
    setBanner(msg);
    setTimeout(() => setBanner(null), 2800);
  };

  const triggerActionPopup = (text: string, heavy: boolean = false) => {
    setActionPopup(text);
    if (heavy) {
      setScreenShaking(true);
      setRedLightingPulse(true);
      playSound('penalty');
      setTimeout(() => {
        setScreenShaking(false);
        setRedLightingPulse(false);
      }, 900);
    }
    setTimeout(() => setActionPopup(null), 2000);
  };

  // Social Floating Reaction Handler
  const sendSocialReaction = (emojiStr: string) => {
    const rx: FloatingReaction = {
      id: Date.now() + Math.random(),
      emoji: emojiStr,
      from: myName,
      left: 20 + Math.random() * 60,
    };
    setFloatingReactions((prev) => [...prev, rx]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((item) => item.id !== rx.id));
    }, 2600);
    playSound('cardDraw');
  };

  // Start / Reset Game
  const initGame = useCallback(() => {
    const freshDeck = build108Deck();
    const pHand = freshDeck.splice(0, 7);
    const oHand = freshDeck.splice(0, 7);

    let startDiscard = freshDeck.pop()!;
    while (startDiscard.color === 'wild' || startDiscard.value === 'Discard All') {
      freshDeck.unshift(startDiscard);
      startDiscard = freshDeck.pop()!;
    }

    setIsDealingCards(true);
    playSound('cardDraw');

    setDeck(freshDeck);
    setPlayerHand(pHand);
    setOpponentHand(oHand);
    setDiscardPile([startDiscard]);
    setActiveColor(startDiscard.color as any);
    setCurrentTurn('boyfriend');
    setHasDrawnThisTurn(false);
    setPendingDraw(0);
    setUnoCalled({ boyfriend: false, girlfriend: false });
    setUnoTimerActive(false);
    setUnoCountdown(null);
    setWinnerRole(null);
    setSelectedMultiIds([]);
    notify('7 Cards Dealt to Each Player');

    setTimeout(() => {
      setIsDealingCards(false);
    }, 1200);
  }, [playSound]);

  // Only auto-init for AI/solo mode; multiplayer waits for server sync
  useEffect(() => {
    if (isAiMode) {
      initGame();
    }
  }, [initGame, isAiMode]);

  // UNO 3-Second Reaction Timer logic
  useEffect(() => {
    if (!unoTimerActive || unoCountdown === null) return;
    if (unoCountdown <= 0) {
      setUnoTimerActive(false);
      setUnoCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setUnoCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [unoTimerActive, unoCountdown]);

  // Check Playability of single card
  // Real UNO rule: +2 can ONLY stack on +2; +4 can ONLY stack on +4 — never cross-stack
  const isCardPlayable = (card: UnoCard) => {
    if (pendingDraw > 0) {
      if (!gameRules.stacking) return false;
      if (card.value === '+2') return topDiscard.value === '+2'; // +2 only on +2
      if (card.value === '+4') return topDiscard.value === '+4'; // +4 only on +4
      return false;
    }

    if (card.color === 'wild') return true;
    if (card.color === activeColor) return true;
    if (card.value === topDiscard.value) return true;
    return false;
  };

  // Pointer Drag Handlers for Physical Throw to Play
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, card: UnoCard) => {
    if (!isMyTurn) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
    setDraggedCardId(card.id);
    setDragOffset({ x: 0, y: 0 });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>, card: UnoCard) => {
    if (draggedCardId !== card.id) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    if (Math.hypot(dx, dy) > 8) {
      isDraggingRef.current = true;
    }
    setDragOffset({ x: dx, y: dy });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>, card: UnoCard) => {
    if (draggedCardId !== card.id) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) { }

    const dy = dragOffset.y;
    const dx = dragOffset.x;
    const wasDragging = isDraggingRef.current;

    const elem = cardElementRefs.current.get(card.id);
    const rect = elem?.getBoundingClientRect();
    const startX = rect ? rect.left + dx : e.clientX - 40;
    const startY = rect ? rect.top + dy : e.clientY - 60;

    setDraggedCardId(null);
    setDragOffset({ x: 0, y: 0 });
    isDraggingRef.current = false;

    if (wasDragging && dy < -65) {
      // Dragged Upwards onto Table Discard Area!
      if (isCardPlayable(card)) {
        if (card.color === 'wild') {
          setSelectedWildCard(card);
          setShowWildModal(true);
        } else {
          executePlay([card], card.color as any, startX, startY);
        }
      } else {
        setInvalidCardShakeId(card.id);
        playSound('error');
        setTimeout(() => setInvalidCardShakeId(null), 500);
        notify(`Cannot play ${card.color.toUpperCase()} ${card.value}!`);
      }
    } else {
      // Tap or Click without dragging far
      handleCardClick(card, startX, startY);
    }
  };

  // Card Play Handler with Invalid Play Shake
  // Card Play Handler: Direct Throw on Click/Tap
  const handleCardClick = (card: UnoCard, customStartX?: number, customStartY?: number) => {
    if (!isMyTurn) return;

    if (!isCardPlayable(card) && !selectedMultiIds.includes(card.id)) {
      setInvalidCardShakeId(card.id);
      playSound('error');
      setTimeout(() => setInvalidCardShakeId(null), 500);
      notify(`Cannot play ${card.color.toUpperCase()} ${card.value}! Color or Number must match.`);
      return;
    }

    if (gameRules.multipleCardPlay && selectedMultiIds.length > 0) {
      if (selectedMultiIds.includes(card.id)) {
        const nextSelected = selectedMultiIds.filter((id) => id !== card.id);
        setSelectedMultiIds(nextSelected);
      } else {
        const currentSelected = playerHand.filter((c) => selectedMultiIds.includes(c.id));
        const first = currentSelected[0];
        if (first && first.value === card.value) {
          setSelectedMultiIds((prev) => [...prev, card.id]);
        } else {
          playSound('error');
          notify('Multiple cards played together must share the same Number or Action!');
        }
      }
    } else {
      // Direct Single Card Play — AUTOMATICALLY THROW!
      handleSinglePlay(card, customStartX, customStartY);
    }
  };

  const handleSinglePlay = (card: UnoCard, customStartX?: number, customStartY?: number) => {
    if (!isMyTurn || !isCardPlayable(card)) return;

    if (card.color === 'wild') {
      setSelectedWildCard(card);
      setShowWildModal(true);
      return;
    }

    executePlay([card], card.color as any, customStartX, customStartY);
  };

  const handlePlaySelectedMultiple = () => {
    if (selectedMultiIds.length === 0) return;
    const cardsToPlay = playerHand.filter((c) => selectedMultiIds.includes(c.id));
    const first = cardsToPlay[0];

    if (first.color === 'wild') {
      setSelectedWildCard(first);
      setShowWildModal(true);
      return;
    }

    executePlay(cardsToPlay, first.color as any);
  };

  // Core Play Execution Engine with 3D Throw Flight Animation
  const executePlay = (
    cards: UnoCard[],
    chosenColor: 'red' | 'blue' | 'green' | 'yellow',
    customStartX?: number,
    customStartY?: number
  ) => {
    playSound('cardPlay');

    // Calculate Discard Pile Screen Coordinates
    const discardRect = discardRef.current?.getBoundingClientRect();
    const endX = discardRect ? discardRect.left : window.innerWidth / 2 - 50;
    const endY = discardRect ? discardRect.top : window.innerHeight / 2 - 70;

    const flyItems: FlyingCardItem[] = cards.map((c, idx) => {
      let sX = customStartX;
      let sY = customStartY;
      if (sX === undefined || sY === undefined) {
        const elem = cardElementRefs.current.get(c.id);
        const rect = elem?.getBoundingClientRect();
        sX = rect ? rect.left : window.innerWidth / 2 - 40;
        sY = rect ? rect.top : window.innerHeight - 140;
      }
      return {
        id: `${c.id}_fly_${Date.now()}_${idx}`,
        card: c,
        startX: sX + idx * 12,
        startY: sY,
        endX: endX + (idx % 2 === 0 ? 4 : -4),
        endY: endY + (idx % 2 === 0 ? -4 : 4),
      };
    });

    setShowWildModal(false);
    setSelectedWildCard(null);
    setSelectedMultiIds([]);

    animateCardFlight(flyItems, () => {
      // Flight animation complete — game state is synced authoritatively from server via uno_sync
    });

    getSocketInstance().emit('uno_action', {
      action: 'play_card',
      cards,
      card: cards[0],
      card_id: cards[0].id,
      chosenColor,
    });
  };

  const handleCallUno = () => {
    if (playerHand.length === 1) {
      getSocketInstance().emit('uno_action', { action: 'call_uno' });
      setUnoCalled((prev) => ({ ...prev, [myRole]: true }));
      setUnoTimerActive(false);
      setUnoCountdown(null);
      triggerActionPopup('UNO CALLED!');
      playSound('uno');
      notify('UNO CALLED SAFELY! 1 Card Remaining!');
    }
  };

  const handleCallOutOpponent = () => {
    getSocketInstance().emit('uno_action', { action: 'call_out', targetRole: opponentRole });
    triggerActionPopup('ACCUSING FORGOT UNO!');
    playSound('uno');
  };

  const handleJumpIn = (card: UnoCard) => {
    if (!gameRules.jumpIn) return;
    if (topDiscard && card.color === topDiscard.color && card.value === topDiscard.value) {
      playSound('cardPlay');
      getSocketInstance().emit('uno_action', {
        action: 'jump_in',
        card_id: card.id,
        card,
      });
      triggerActionPopup('⚡ JUMP IN!', true);
      notify(`JUMP IN! Playing ${card.color.toUpperCase()} ${card.value}...`);
    }
  };

  const hasDefendCard = playerHand.some((c) => {
    if (!gameRules.stacking) return false;
    if (c.value === '+2') return topDiscard.value === '+2'; // +2 only defends +2
    if (c.value === '+4') return topDiscard.value === '+4'; // +4 only defends +4
    return false;
  });

  const handleDrawStackCards = () => {
    if (!isMyTurn) {
      playSound('error');
      notify('Not your turn!');
      return;
    }

    if (pendingDraw > 0) {
      if (hasDefendCard) {
        playSound('error');
        notify(`You have a +2 or +4 card! You MUST throw your card to defend!`);
        return;
      }

      playSound('cardDraw');
      getSocketInstance().emit('uno_action', { action: 'draw_card', type: 'drawCard', count: pendingDraw, nextTurn: opponentRole });
      notify(`Drew +${pendingDraw} penalty cards!`);
      setPendingDraw(0);
      setHasDrawnThisTurn(false);
      if (onMove) onMove({ type: 'drawCard' });
      return;
    }

    playSound('cardDraw');
    getSocketInstance().emit('uno_action', { action: 'draw_card', type: 'drawCard', count: 1 });
    notify('Drawing card from deck...');
    setHasDrawnThisTurn(true);
    if (onMove) onMove({ type: 'drawCard' });
  };

  // Auto-draw when player is target of draw stack (+2/+4) and holds no defense cards
  useEffect(() => {
    if (isMyTurn && pendingDraw > 0 && !hasDefendCard && flyingCards.length === 0 && !winnerRole) {
      const autoDrawTimer = setTimeout(() => {
        handleDrawStackCards();
      }, 800);
      return () => clearTimeout(autoDrawTimer);
    }
  }, [isMyTurn, pendingDraw, hasDefendCard, flyingCards.length, winnerRole]);

  // Bot Turn with Animated Card Flights
  useEffect(() => {
    // Disabled in real-time multiplayer: Opponent plays over Socket.IO
    return;

    const botTimer = setTimeout(() => {
      if (pendingDraw > 0) {
        const stackableIdx = opponentHand.findIndex((c) => {
          if (!gameRules.stacking) return false;
          if (c.value === '+2') return topDiscard.value === '+2'; // +2 only on +2
          if (c.value === '+4') return topDiscard.value === '+4'; // +4 only on +4
          return false;
        });

        if (stackableIdx !== -1) {
          const cardToPlay = opponentHand[stackableIdx];
          const newOpponentHand = opponentHand.filter((_, idx) => idx !== stackableIdx);
          const addCount = cardToPlay.value === '+2' ? 2 : 4;
          const newTotal = pendingDraw + addCount;

          const oppRect = opponentSeatRef.current?.getBoundingClientRect();
          const discardRect = discardRef.current?.getBoundingClientRect();
          const startX = oppRect ? oppRect.left + 20 : window.innerWidth / 2 - 30;
          const startY = oppRect ? oppRect.top + 20 : 60;
          const endX = discardRect ? discardRect.left : window.innerWidth / 2 - 50;
          const endY = discardRect ? discardRect.top : window.innerHeight / 2 - 70;

          const flyItem: FlyingCardItem[] = [
            {
              id: `opp_stack_${cardToPlay.id}_${Date.now()}`,
              card: cardToPlay,
              startX,
              startY,
              endX,
              endY,
            },
          ];

          animateCardFlight(flyItem, () => {
            playSound('cardPlay');
            setOpponentHand(newOpponentHand);
            setDiscardPile((prev) => [...prev, cardToPlay]);
            setPendingDraw(newTotal);
            triggerActionPopup(`+${newTotal}!`, true);
            notify(`${partnerName} stacked ${cardToPlay.value}! Total: +${newTotal}!`);

            if (newOpponentHand.length === 1) setUnoStateForPlayer(opponentRole);
            setCurrentTurn(myRole as any);
          });
          return;
        } else {
          playSound('cardDraw');
          const drawRect = drawDeckRef.current?.getBoundingClientRect();
          const oppRect = opponentSeatRef.current?.getBoundingClientRect();
          const startX = drawRect ? drawRect.left : window.innerWidth / 2 - 120;
          const startY = drawRect ? drawRect.top : window.innerHeight / 2 - 70;
          const endX = oppRect ? oppRect.left + 20 : window.innerWidth / 2 - 30;
          const endY = oppRect ? oppRect.top + 20 : 60;

          const drawnCards = deck.slice(0, pendingDraw);
          const flyItems: FlyingCardItem[] = drawnCards.map((c, i) => ({
            id: `opp_draw_pen_${c.id}_${i}`,
            card: c,
            startX: startX + i * 6,
            startY: startY + i * 4,
            endX,
            endY,
            isBack: true,
          }));

          animateCardFlight(flyItems, () => {
            setDeck((prevDeck) => prevDeck.slice(pendingDraw));
            setOpponentHand((prev) => [...prev, ...drawnCards]);
            notify(`${partnerName} could not stack & drew +${pendingDraw} cards!`);
            setPendingDraw(0);
            setCurrentTurn(myRole as any);
          });
          return;
        }
      }

      const playableIdx = opponentHand.findIndex(
        (c) => c.color === 'wild' || c.color === activeColor || c.value === topDiscard.value
      );

      if (playableIdx !== -1) {
        const cardToPlay = opponentHand[playableIdx];
        const newOpponentHand = opponentHand.filter((_, idx) => idx !== playableIdx);

        let chosenCol: 'red' | 'blue' | 'green' | 'yellow' = activeColor;
        if (cardToPlay.color === 'wild') {
          chosenCol = 'red';
        } else {
          chosenCol = cardToPlay.color as any;
        }

        const oppRect = opponentSeatRef.current?.getBoundingClientRect();
        const discardRect = discardRef.current?.getBoundingClientRect();
        const startX = oppRect ? oppRect.left + 20 : window.innerWidth / 2 - 30;
        const startY = oppRect ? oppRect.top + 20 : 60;
        const endX = discardRect ? discardRect.left : window.innerWidth / 2 - 50;
        const endY = discardRect ? discardRect.top : window.innerHeight / 2 - 70;

        const flyItem: FlyingCardItem[] = [
          {
            id: `opp_throw_${cardToPlay.id}_${Date.now()}`,
            card: cardToPlay,
            startX,
            startY,
            endX,
            endY,
          },
        ];

        animateCardFlight(flyItem, () => {
          playSound('cardPlay');
          setOpponentHand(newOpponentHand);
          setDiscardPile((prev) => [...prev, cardToPlay]);
          setActiveColor(chosenCol);

          if (newOpponentHand.length === 0) {
            setWinnerRole(opponentRole);
            triggerActionPopup('DEFEAT', true);
            playSound('penalty');
            notify(`${partnerName} won the match!`);
            // Record session score
            setSessionScores((prev) => ({
              ...prev,
              [opponentRole]: prev[opponentRole as keyof SessionScore] as number + 1,
              totalGames: prev.totalGames + 1,
            }));
            setGameHistory((prev) => [
              ...prev,
              { gameNumber: prev.length + 1, winner: opponentRole as any, winnerName: partnerName, timestamp: new Date() },
            ]);
            setTimeout(() => setShowLeaderboard(true), 2000);
            return;
          }

          if (newOpponentHand.length === 1) {
            const callsUno = Math.random() > 0.1;
            if (callsUno) {
              setUnoCalled((prev) => ({ ...prev, [opponentRole]: true }));
              triggerActionPopup(`${partnerName.toUpperCase()} CALLED UNO!`);
              playSound('uno');
              notify(`${partnerName} called UNO! 1 Card remaining!`);
            } else {
              setUnoCalled((prev) => ({ ...prev, [opponentRole]: false }));
              notify(`⚠️ ${partnerName} FORGOT TO CALL UNO! Press CALL OUT!`);
            }
          }

          const val = cardToPlay.value;
          if (val === 'Skip' || val === 'Reverse') {
            triggerActionPopup('SKIPPED!');
            notify(`${partnerName} played ${val}! Extra turn for ${partnerName}!`);
          } else if (val === '+2') {
            if (gameRules.stacking) {
              setPendingDraw(2);
              triggerActionPopup('+2!');
              notify(`${partnerName} played +2! Stack +2 or Draw!`);
            } else {
              triggerActionPopup('+2!');
              drawPenaltyCardsForPlayer(2, () => {
                notify(`${partnerName} played +2! You draw 2 cards!`);
              });
            }
            setCurrentTurn(myRole as any);
          } else if (val === '+4') {
            if (gameRules.stacking) {
              setPendingDraw(4);
              triggerActionPopup('+4!', true);
              notify(`${partnerName} played Wild +4! Stack +4 or Draw!`);
            } else {
              triggerActionPopup('+4!', true);
              drawPenaltyCardsForPlayer(4, () => {
                notify(`${partnerName} played Wild +4! You draw 4 cards!`);
              });
            }
            setCurrentTurn(myRole as any);
          } else {
            notify(`${partnerName} played ${cardToPlay.color.toUpperCase()} ${cardToPlay.value}! Your turn.`);
            setCurrentTurn(myRole as any);
            setHasDrawnThisTurn(false);
          }
        });
      } else {
        if (deck.length > 0) {
          const drawn = deck[0];
          const drawRect = drawDeckRef.current?.getBoundingClientRect();
          const oppRect = opponentSeatRef.current?.getBoundingClientRect();
          const startX = drawRect ? drawRect.left : window.innerWidth / 2 - 120;
          const startY = drawRect ? drawRect.top : window.innerHeight / 2 - 70;
          const endX = oppRect ? oppRect.left + 20 : window.innerWidth / 2 - 30;
          const endY = oppRect ? oppRect.top + 20 : 60;

          const flyItem: FlyingCardItem[] = [
            {
              id: `opp_draw_${drawn.id}_${Date.now()}`,
              card: drawn,
              startX,
              startY,
              endX,
              endY,
              isBack: true,
            },
          ];

          animateCardFlight(flyItem, () => {
            playSound('cardDraw');
            const newDeck = deck.slice(1);
            setDeck(newDeck);

            if (drawn.color === 'wild' || drawn.color === activeColor || drawn.value === topDiscard.value) {
              setDiscardPile((prev) => [...prev, drawn]);
              setActiveColor(drawn.color === 'wild' ? 'blue' : (drawn.color as any));
              notify(`${partnerName} drew & played ${drawn.value}! Your turn.`);
            } else {
              setOpponentHand((prev) => [...prev, drawn]);
              notify(`${partnerName} drew 1 card. Your turn!`);
            }
            setCurrentTurn(myRole as any);
            setHasDrawnThisTurn(false);
          });
        } else {
          setCurrentTurn(myRole as any);
          setHasDrawnThisTurn(false);
        }
      }
    }, 1300);

    return () => clearTimeout(botTimer);
  }, [currentTurn, opponentRole, opponentHand, activeColor, topDiscard, deck, myRole, winnerRole, partnerName, pendingDraw, gameRules, playSound, animateCardFlight]);

  const getSymbolDisplay = (val: string) => {
    if (val === 'Skip') return '⊘';
    if (val === 'Reverse') return '⇄';
    if (val === 'Wild') return 'W';
    if (val === 'Discard All') return 'ALL';
    return val;
  };

  const jumpInCard = playerHand.find(
    (c) => c.color === topDiscard.color && c.value === topDiscard.value && currentTurn !== myRole
  );

  const myScore = sessionScores[myRole as keyof SessionScore] as number;
  const partnerScore = sessionScores[opponentRole as keyof SessionScore] as number;
  const sessionLeader = myScore > partnerScore ? myName : partnerScore > myScore ? partnerName : null;

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#1C120C', overflow: 'hidden', position: 'relative' }}>

      {/* Styles for Cozy Wood Tabletop, 3D Perspective & Motion */}
      <style>{`
        .uno-hand-fan::-webkit-scrollbar { display: none; }
        
        @keyframes rotateCw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes actionPopupFly {
          0% { opacity: 0; transform: translate(-50%, -40%) scale(0.3); }
          40% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          100% { opacity: 0; transform: translate(-50%, -60%) scale(1.5); }
        }

        @keyframes pulseSphere {
          0%, 100% { transform: scale(1) rotate(-10deg); box-shadow: 0 10px 30px rgba(255, 53, 71, 0.7), 0 0 20px #FFD700; }
          50% { transform: scale(1.12) rotate(-6deg); box-shadow: 0 0 50px rgba(255, 53, 71, 1), 0 0 35px #FFD700; }
        }

        @keyframes cardInvalidShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px) rotate(-6deg); }
          40% { transform: translateX(10px) rotate(6deg); }
          60% { transform: translateX(-8px) rotate(-4deg); }
          80% { transform: translateX(8px) rotate(4deg); }
        }

        @keyframes floatRx {
          0% { opacity: 0; transform: translateY(0) scale(0.6); }
          20% { opacity: 1; transform: translateY(-30px) scale(1.2); }
          80% { opacity: 1; transform: translateY(-120px) scale(1); }
          100% { opacity: 0; transform: translateY(-160px) scale(0.8); }
        }

        @keyframes screenShake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(-6px, 4px) rotate(-1deg); }
          40% { transform: translate(6px, -4px) rotate(1deg); }
          60% { transform: translate(-4px, -2px) rotate(-0.5deg); }
          80% { transform: translate(4px, 2px) rotate(0.5deg); }
        }

        @keyframes floatBokeh {
          0% { transform: translateY(0px) scale(0.9); opacity: 0.3; }
          100% { transform: translateY(-25px) scale(1.15); opacity: 0.7; }
        }

        @keyframes floatPetal {
          0% { transform: translateY(0px) rotate(0deg) scale(0.95); }
          50% { transform: translateY(-12px) rotate(10deg) scale(1.05); }
          100% { transform: translateY(0px) rotate(0deg) scale(0.95); }
        }

        @keyframes floatHeartGlow {
          0% { transform: translateY(0px) scale(0.85); opacity: 0.35; filter: drop-shadow(0 0 6px #FF3547); }
          50% { transform: translateY(-25px) scale(1.18); opacity: 0.9; filter: drop-shadow(0 0 16px #FF5E8E); }
          100% { transform: translateY(-50px) scale(0.8); opacity: 0.2; filter: drop-shadow(0 0 4px #FF3547); }
        }
      `}</style>

      {/* Floating Social Reaction Emojis Overlay */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 120, overflow: 'hidden' }}>
        {floatingReactions.map((rx) => (
          <div
            key={rx.id}
            style={{
              position: 'absolute',
              bottom: '140px',
              left: `${rx.left}%`,
              fontSize: '2.5rem',
              animation: 'floatRx 2.6s ease-out forwards',
              filter: 'drop-shadow(0 6px 15px rgba(0,0,0,0.6))',
            }}
          >
            {rx.emoji}
          </div>
        ))}
      </div>

      {/* FLYING ANIMATED CARDS THROW & DRAW OVERLAY */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 300 }}>
        {flyingCards.map((fCard) => {
          const currentX = flyingCardProgress ? fCard.endX : fCard.startX;
          const currentY = flyingCardProgress ? fCard.endY : fCard.startY;
          const currentRot = flyingCardProgress ? 8 : -18;
          const currentScale = flyingCardProgress ? 1 : 1.22;
          const styleInfo = CARD_PALETTE[fCard.card.color] || CARD_PALETTE.red;

          return (
            <div
              key={fCard.id}
              style={{
                position: 'fixed',
                left: `${currentX}px`,
                top: `${currentY}px`,
                width: '100px',
                height: '144px',
                borderRadius: '16px',
                background: fCard.isBack ? 'linear-gradient(135deg, #1C1A24 0%, #2E1A2B 100%)' : styleInfo.bg,
                border: '4px solid #FFFFFF',
                boxShadow: `0 20px 50px ${styleInfo.glow || 'rgba(0,0,0,0.8)'}, 0 0 30px #FFD700`,
                pointerEvents: 'none',
                transform: `rotate(${currentRot}deg) scale(${currentScale})`,
                transition: 'all 0.38s cubic-bezier(0.25, 0.8, 0.25, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 6px',
              }}
            >
              {fCard.isBack ? (
                <div style={{ width: '74px', height: '114px', border: '3.5px solid #FF3547', borderRadius: '12px', background: '#D81B60', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 900 }}>
                  <span style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', transform: 'rotate(-25deg)', fontStyle: 'italic', letterSpacing: '1px' }}>
                    UNO
                  </span>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 900, alignSelf: 'flex-start', lineHeight: 1 }}>
                    {getSymbolDisplay(fCard.card.value)}
                  </span>
                  <div
                    style={{
                      width: '50px',
                      height: '76px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      transform: 'rotate(-25deg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 900,
                        color: styleInfo.ovalText,
                        fontFamily: 'var(--font-display)',
                        transform: 'rotate(25deg)',
                      }}
                    >
                      {getSymbolDisplay(fCard.card.value)}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 900, alignSelf: 'flex-end', lineHeight: 1 }}>
                    {getSymbolDisplay(fCard.card.value)}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Toast Notification Banner */}
      {banner && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            background: 'linear-gradient(135deg, #FF3547 0%, #D81B60 100%)',
            color: '#FFFFFF',
            padding: '8px 24px',
            borderRadius: '99px',
            textAlign: 'center',
            fontWeight: 800,
            fontSize: '0.9rem',
            boxShadow: '0 8px 25px rgba(255, 53, 71, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={16} /> {banner}
        </div>
      )}

      {/* Mobile Orientation Hint Banner */}
      <div
        style={{
          display: 'none',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          background: '#FFD700',
          color: '#2A1706',
          padding: '4px',
          textAlign: 'center',
          fontWeight: 900,
          fontSize: '0.75rem',
          zIndex: 101,
        }}
      >
        <Smartphone size={14} style={{ display: 'inline', marginRight: '4px' }} /> For best gameplay on mobile, rotate screen to Landscape Mode!
      </div>

      {/* PHYSICAL WARM WOODEN TABLETOP GAME ENVIRONMENT (100vw x 100vh) */}
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: redLightingPulse
            ? 'radial-gradient(ellipse at 50% 50%, #7A1C1C 0%, #3D0C0C 60%, #1A0505 100%)'
            : 'radial-gradient(ellipse at 50% 45%, #1E5C38 0%, #133D24 55%, #0B2415 100%)',
          padding: '12px 16px',
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.85)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          animation: screenShaking ? 'screenShake 0.6s ease-in-out' : 'none',
          transition: 'background 0.5s ease',
        }}
      >


        {/* ================================================================
             KEEP / PLAY DRAWN CARD CHOICE OVERLAY
             ================================================================ */}
        {drawnPlayableCard && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 88888,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              paddingBottom: '120px',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(160deg, #1E0E28 0%, #2A1030 100%)',
                border: '2px solid rgba(255,215,0,0.45)',
                borderRadius: '24px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                maxWidth: '340px',
                width: '90%',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.8), 0 0 30px rgba(255,215,0,0.2)',
                animation: 'lbSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              {/* Drawn card preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '52px',
                    height: '76px',
                    borderRadius: '10px',
                    background: CARD_PALETTE[drawnPlayableCard.color]?.bg || '#444',
                    border: '3px solid rgba(255,215,0,0.6)',
                    boxShadow: `0 6px 20px ${CARD_PALETTE[drawnPlayableCard.color]?.glow || 'rgba(0,0,0,0.6)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: '1rem', fontFamily: 'var(--font-display)', textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
                    {drawnPlayableCard.value === 'Skip' ? '⊘' : drawnPlayableCard.value === 'Reverse' ? '⇄' : drawnPlayableCard.value}
                  </span>
                </div>
                <div>
                  <div style={{ color: '#FFD700', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800 }}>
                    You drew a playable card!
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, marginTop: '2px' }}>
                    {drawnPlayableCard.color.toUpperCase()} {drawnPlayableCard.value} — what do you want to do?
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.65rem', width: '100%' }}>
                {/* Keep button — pass turn without playing */}
                <button
                  onClick={() => {
                    setDrawnPlayableCard(null);
                    getSocketInstance().emit('uno_action', { action: 'pass_turn', type: 'passTurn' });
                    notify('Kept the card. Turn passes to ' + partnerName + '.');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem 0',
                    borderRadius: '99px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                >
                  ✋ Keep
                </button>

                {/* Play button — play the drawn card immediately */}
                <button
                  onClick={() => {
                    const card = drawnPlayableCard;
                    setDrawnPlayableCard(null);
                    if (card.color === 'wild') {
                      setSelectedWildCard(card);
                      setShowWildModal(true);
                    } else {
                      executePlay([card], card.color as any);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem 0',
                    borderRadius: '99px',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                    border: 'none',
                    color: '#1A0820',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 6px 18px rgba(255,215,0,0.4)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(255,215,0,0.55)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(255,215,0,0.4)'; }}
                >
                  🃏 Play It
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
             SESSION LEADERBOARD END-GAME OVERLAY
             ================================================================ */}
        {showLeaderboard && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 199999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(10, 4, 14, 0.92)',
              backdropFilter: 'blur(8px)',
              padding: '1rem',
              overflowY: 'auto',
            }}
          >
            <style>{`
              @keyframes lbSlideUp {
                0% { opacity: 0; transform: translateY(60px) scale(0.9); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes lbGlow {
                0%, 100% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.4), 0 20px 60px rgba(0,0,0,0.9); }
                50% { box-shadow: 0 0 60px rgba(255, 215, 0, 0.7), 0 20px 60px rgba(0,0,0,0.9); }
              }
              @keyframes crownBounce {
                0%, 100% { transform: translateY(0) rotate(-8deg); }
                50% { transform: translateY(-10px) rotate(8deg); }
              }
              @keyframes starSpin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes confettiFall {
                0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100px) rotate(360deg); opacity: 0; }
              }
            `}</style>

            <div
              style={{
                maxWidth: '480px',
                width: '100%',
                background: 'linear-gradient(160deg, #1E0E28 0%, #2A1030 50%, #1A0820 100%)',
                border: '2.5px solid rgba(255, 215, 0, 0.5)',
                borderRadius: '28px',
                padding: '2rem 1.5rem 1.75rem',
                boxShadow: '0 0 40px rgba(255, 215, 0, 0.3), 0 24px 80px rgba(0,0,0,0.95)',
                animation: 'lbSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Background shimmer decoration */}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,94,142,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

              {/* Header: Match Result */}
              <div style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '0.25rem', animation: 'crownBounce 2s ease-in-out infinite' }}>
                  {winnerRole === myRole ? '🏆' : '💜'}
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.8rem',
                    fontWeight: 900,
                    color: winnerRole === myRole ? '#FFD700' : '#FF5E8E',
                    textShadow: winnerRole === myRole ? '0 0 20px rgba(255,215,0,0.6)' : '0 0 20px rgba(255,94,142,0.6)',
                    letterSpacing: '1px',
                    marginBottom: '0.2rem',
                  }}
                >
                  {winnerRole === myRole ? 'You Won! 🎉' : `${partnerName} Won! 💪`}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', fontWeight: 600 }}>
                  Game #{sessionScores.totalGames} • Session Stats
                </p>
              </div>

              {/* Score Scoreboard */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1.5px solid rgba(255,215,0,0.2)',
                  borderRadius: '20px',
                  padding: '1.25rem 1rem',
                }}
              >
                {/* My Score */}
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: myScore >= partnerScore
                        ? 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)'
                        : 'rgba(255,255,255,0.1)',
                      border: myScore >= partnerScore ? '2.5px solid #FFD700' : '2px solid rgba(255,255,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.5rem',
                      boxShadow: myScore >= partnerScore ? '0 0 20px rgba(255,215,0,0.5)' : 'none',
                      fontSize: '1.4rem',
                      fontWeight: 900,
                      color: myScore >= partnerScore ? '#1A0820' : '#FFFFFF',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {myScore}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: myScore >= partnerScore ? '#FFD700' : 'rgba(255,255,255,0.6)' }}>
                    {myName}
                  </div>
                  {myScore >= partnerScore && myScore > 0 && (
                    <div style={{ fontSize: '0.7rem', color: '#FFD700', fontWeight: 700, marginTop: '2px' }}>👑 Leading</div>
                  )}
                </div>

                {/* VS Divider */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <Swords size={22} color="rgba(255,215,0,0.7)" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,215,0,0.6)', letterSpacing: '2px' }}>VS</span>
                </div>

                {/* Partner Score */}
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: partnerScore > myScore
                        ? 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)'
                        : 'rgba(255,255,255,0.1)',
                      border: partnerScore > myScore ? '2.5px solid #FFD700' : '2px solid rgba(255,255,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.5rem',
                      boxShadow: partnerScore > myScore ? '0 0 20px rgba(255,215,0,0.5)' : 'none',
                      fontSize: '1.4rem',
                      fontWeight: 900,
                      color: partnerScore > myScore ? '#1A0820' : '#FFFFFF',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {partnerScore}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: partnerScore > myScore ? '#FFD700' : 'rgba(255,255,255,0.6)' }}>
                    {partnerName}
                  </div>
                  {partnerScore > myScore && (
                    <div style={{ fontSize: '0.7rem', color: '#FFD700', fontWeight: 700, marginTop: '2px' }}>👑 Leading</div>
                  )}
                </div>
              </div>

              {/* Session Summary Pill */}
              {sessionLeader && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,94,142,0.1) 100%)',
                    border: '1px solid rgba(255,215,0,0.3)',
                    borderRadius: '12px',
                    padding: '0.6rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Trophy size={16} color="#FFD700" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFD700' }}>
                    {sessionLeader} is leading the session!
                  </span>
                </div>
              )}
              {!sessionLeader && sessionScores.totalGames > 0 && (
                <div
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    padding: '0.6rem 1rem',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>🤝 It's a tie!</span>
                </div>
              )}

              {/* Game History */}
              {gameHistory.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Match History
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                    {[...gameHistory].reverse().map((g) => (
                      <div
                        key={g.gameNumber}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: g.winner === myRole
                            ? 'rgba(255,215,0,0.08)'
                            : 'rgba(255,94,142,0.07)',
                          border: `1px solid ${g.winner === myRole ? 'rgba(255,215,0,0.2)' : 'rgba(255,94,142,0.18)'
                            }`,
                          borderRadius: '10px',
                          padding: '0.45rem 0.85rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>#{g.gameNumber}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: g.winner === myRole ? '#FFD700' : '#FF5E8E' }}>
                            {g.winnerName} won
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {g.winner === myRole ? (
                            <Crown size={13} color="#FFD700" />
                          ) : (
                            <Heart size={13} color="#FF5E8E" fill="#FF5E8E" />
                          )}
                          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                            {g.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  onClick={handlePlayAgainClick}
                  disabled={readyRoles.includes(myRole)}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    borderRadius: '99px',
                    background: readyRoles.includes(myRole) ? 'rgba(255,215,0,0.3)' : 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                    border: 'none',
                    color: readyRoles.includes(myRole) ? '#FFD700' : '#1A0820',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    cursor: readyRoles.includes(myRole) ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: readyRoles.includes(myRole) ? 'none' : '0 8px 24px rgba(255,215,0,0.4)',
                    letterSpacing: '0.5px',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  <RotateCcw size={20} />
                  {readyRoles.includes(myRole) ? `Waiting for ${partnerName} to click Play Again...` : 'Play Again'}
                </button>

                <button
                  onClick={() => window.history.back()}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '99px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1.5px solid rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                >
                  <Home size={16} />
                  Go Back to Games
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Vignette Shadow Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.75) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Ambient Floating Dust, Golden Bokeh & Glowing Romantic Hearts */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 8 }}>
          {/* Drifting Bokeh Particles */}
          {[12, 32, 58, 78, 88].map((xPos, idx) => (
            <div
              key={`bokeh_${idx}`}
              style={{
                position: 'absolute',
                left: `${xPos}%`,
                top: `${15 + idx * 16}%`,
                width: `${18 + idx * 8}px`,
                height: `${18 + idx * 8}px`,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 215, 0, 0.22) 0%, rgba(255, 215, 0, 0) 70%)',
                animation: `floatBokeh ${3.5 + idx}s ease-in-out infinite alternate`,
              }}
            />
          ))}

          {/* Floating Glowing Romantic Hearts */}
          {[
            { left: '8%', top: '25%', size: 22, delay: 0 },
            { left: '22%', top: '65%', size: 28, delay: 1 },
            { left: '44%', top: '15%', size: 20, delay: 2 },
            { left: '68%', top: '75%', size: 26, delay: 0.5 },
            { left: '84%', top: '30%', size: 30, delay: 1.5 },
            { left: '92%', top: '60%', size: 24, delay: 2.5 },
          ].map((h, idx) => (
            <div
              key={`heart_${idx}`}
              style={{
                position: 'absolute',
                left: h.left,
                top: h.top,
                animation: `floatHeartGlow ${4 + idx}s ease-in-out ${h.delay}s infinite alternate`,
              }}
            >
              <Heart size={h.size} fill="#FF3547" color="#FF5E8E" style={{ opacity: 0.85 }} />
            </div>
          ))}

          {/* Scattered Romantic Rose Petals Lying on Table */}
          {[
            { left: '3%', top: '6%', rot: -28, size: 38 },
            { right: '4%', top: '8%', rot: 42, size: 40 },
            { left: '4%', bottom: '12%', rot: 18, size: 36 },
            { right: '5%', bottom: '14%', rot: -35, size: 34 },
            { left: '2%', top: '48%', rot: 75, size: 32 },
            { right: '2%', top: '52%', rot: -60, size: 36 },
            { left: '18%', top: '10%', rot: 12, size: 28 },
            { right: '22%', bottom: '16%', rot: -22, size: 30 },
          ].map((p, idx) => (
            <div
              key={`petal_${idx}`}
              style={{
                position: 'absolute',
                left: p.left,
                right: p.right,
                top: p.top,
                bottom: p.bottom,
              }}
            >
              <RosePetal size={p.size} rot={p.rot} />
            </div>
          ))}
        </div>

        {/* MULTIPLAYER UNO LOBBY WAITING OVERLAY */}
        {isWaitingForPartner && !isAiMode && !winnerRole && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(12, 10, 18, 0.92)',
              backdropFilter: 'blur(18px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
              color: '#FFF',
            }}
          >
            <div
              style={{
                maxWidth: '440px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.07)',
                border: '2px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '28px',
                padding: '36px 28px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 35px rgba(255,215,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.2rem',
                  boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
                }}
              >
                🎮
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  color: '#FFD700',
                  margin: 0,
                  textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                }}
              >
                UNO Battle Lobby
              </h2>

              <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.98rem', margin: 0, lineHeight: 1.5 }}>
                Waiting for <strong>{partnerName}</strong> to enter the game...
              </p>

              {/* Player Seats Status */}
              <div style={{ display: 'flex', gap: '14px', margin: '8px 0', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    borderRadius: '20px',
                    background: 'rgba(74, 222, 128, 0.2)',
                    border: '1.5px solid #4ADE80',
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4ADE80' }}></span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>{myName} (Connected)</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    borderRadius: '20px',
                    background: connectedRoles.includes(opponentRole) ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 183, 77, 0.15)',
                    border: connectedRoles.includes(opponentRole) ? '1.5px solid #4ADE80' : '1.5px dashed #FFB74D',
                  }}
                >
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: connectedRoles.includes(opponentRole) ? '#4ADE80' : '#FFB74D',
                    }}
                  ></span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>
                    {partnerName} {connectedRoles.includes(opponentRole) ? '(Joined)' : '(Waiting)'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '6px' }}>
                {connectedRoles.includes(opponentRole) && (
                  <button
                    onClick={() => {
                      getSocketInstance().emit('uno_start_game');
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: '#FFF',
                      fontWeight: 900,
                      fontSize: '1.05rem',
                      fontFamily: 'var(--font-display)',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 8px 25px rgba(16, 185, 129, 0.5)',
                    }}
                  >
                    ⚡ Start Match Now ({partnerName} Joined!)
                  </button>
                )}
                <button
                  onClick={handleNudgePartner}
                  disabled={nudgeSent}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '16px',
                    background: nudgeSent
                      ? 'rgba(255,255,255,0.2)'
                      : 'linear-gradient(135deg, #FF5E8E 0%, #E91E63 100%)',
                    color: '#FFF',
                    fontWeight: 900,
                    fontSize: '1rem',
                    fontFamily: 'var(--font-display)',
                    border: 'none',
                    cursor: nudgeSent ? 'default' : 'pointer',
                    boxShadow: nudgeSent ? 'none' : '0 8px 25px rgba(233, 30, 99, 0.4)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {nudgeSent ? `💌 Invite Sent to ${partnerName}!` : `💌 Send Invite to ${partnerName}`}
                </button>

                <button
                  onClick={() => setIsAiMode(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1.5px solid rgba(255, 255, 255, 0.2)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  🤖 Play vs AI (Solo Practice Mode)
                </button>

                <button
                  onClick={() => {
                    const socket = getSocketInstance();
                    socket.emit('uno_leave');
                    window.location.href = '/games';
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '16px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1.5px solid rgba(239, 68, 68, 0.4)',
                    color: '#FF6B6B',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  ✖ Cancel & Exit Lobby
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full-Screen Edge-to-Edge UNO Felt Table Surface */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(ellipse at 50% 40%, #1E5C38 0%, #133D24 55%, #0B2415 100%)',
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.85)',
            pointerEvents: 'none',
          }}
        >
          {/* Inner Golden Dashed Trim Ring */}
          <div
            style={{
              position: 'absolute',
              inset: '16px',
              borderRadius: '24px',
              border: '2px dashed rgba(255, 215, 0, 0.3)',
            }}
          />
        </div>

        {/* TOP HUD BAR (Timer, Sound Mute, Ping, Deck, Settings) */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, paddingLeft: '50px' }}>

          {/* Gold Timer Badge & Compact Overall Scoreboard Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #FFB300 0%, #F57F17 100%)',
                border: '3px solid #FFF8E1',
                padding: '6px 16px',
                borderRadius: '99px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.6)',
                color: '#FFFFFF',
                fontWeight: 900,
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                letterSpacing: '1px',
              }}
            >
              <Clock size={20} color="#FFFFFF" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            <div
              style={{
                background: '#FFF9F2',
                border: '2.5px solid #2D152B',
                borderRadius: '99px',
                padding: '6px 16px',
                boxShadow: '3px 3px 0px #2D152B',
                fontFamily: 'Fredoka, sans-serif',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: '#2D152B',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Maulik {roomScore?.wins?.Maulik || 0}</span>
              <span style={{ color: '#6B5B6E' }}>—</span>
              <span>{roomScore?.wins?.Seema || 0} Seema</span>
            </div>
          </div>

          {/* Right Status Controls (Sound Mute, Ping, Deck, Settings) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Audio Mute Toggle Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              style={{
                background: 'rgba(0,0,0,0.5)',
                padding: '6px 12px',
                borderRadius: '99px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1.5px solid rgba(255,255,255,0.3)',
                color: isMuted ? '#FF5E8E' : '#00FFCC',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {isMuted ? <VolumeX size={16} color="#FF5E8E" /> : <Volume2 size={16} color="#00FFCC" />}
              <span>{isMuted ? 'Muted' : 'Audio On'}</span>
            </button>

            {/* Mobile Push Notification Activation Button */}
            <button
              onClick={async () => {
                const res = await requestMobileNotificationPermission();
                if (res === 'granted') {
                  playSound('uno');
                  notify('📱 Push Notifications active on iOS & Android!');
                  sendMobileNotification('Us. Sanctuary UNO', 'Mobile push notifications active for Maulik & Seema!');
                } else {
                  playSound('error');
                  notify('⚠️ Notification permission required in browser settings.');
                }
              }}
              title="Enable Mobile Push Notifications"
              style={{
                background: 'rgba(0,0,0,0.5)',
                padding: '6px 12px',
                borderRadius: '99px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1.5px solid rgba(255,215,0,0.4)',
                color: '#FFD700',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Bell size={16} color="#FFD700" />
              <span>Alerts</span>
            </button>

            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '6px', border: '1.5px solid rgba(255,255,255,0.3)', color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 800 }}>
              <Signal size={16} color="#00FFCC" />
              <span>{ping}ms</span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '6px', border: '1.5px solid rgba(255,255,255,0.3)', color: '#FFD700', fontSize: '0.8rem', fontWeight: 800 }}>
              <Layers size={16} color="#FFD700" />
              <span>{deckCount || deck.length || 0} Cards</span>
            </div>

            <button
              onClick={() => setShowRulesDrawer(!showRulesDrawer)}
              title="Game Rules Settings"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFB300 0%, #F57F17 100%)',
                border: '2px solid #FFFFFF',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#FFFFFF',
                opacity: 1,
              }}
            >
              <Sliders size={20} />
            </button>
          </div>

        </div>

        {/* GAME RULES CONFIGURATION DRAWER */}
        {showRulesDrawer && (
          <div
            style={{
              position: 'absolute',
              top: '70px',
              right: '20px',
              zIndex: 60,
              background: 'rgba(20, 10, 30, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '3.5px solid #FFD700',
              borderRadius: '24px',
              padding: '18px 22px',
              width: '320px',
              boxShadow: '0 15px 40px rgba(0,0,0,0.8)',
              color: '#FFFFFF',
            }}
          >
            <div style={{ fontWeight: 900, fontSize: '1.1rem', fontFamily: 'var(--font-display)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#FFD700' }}>
              <Sliders size={18} /> Advanced UNO Rules
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', fontWeight: 800 }}>
              {Object.keys(gameRules).map((ruleKey) => {
                const key = ruleKey as keyof GameRules;
                return (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                    <input
                      type="checkbox"
                      checked={gameRules[key]}
                      onChange={(e) => setGameRules((prev) => ({ ...prev, [key]: e.target.checked }))}
                      style={{ width: '18px', height: '18px', accentColor: '#FF3547', cursor: 'pointer' }}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* TOP OPPONENT SEAT (Seema Avatar, Presence Pulse & Deck Backs) */}
        <div ref={opponentSeatRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 10, marginTop: '-6px' }}>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Thinking / Reaction Mood Bubble */}
            {currentTurn === opponentRole && (
              <div
                style={{
                  position: 'absolute',
                  right: '-140px',
                  top: '0',
                  background: '#FFFFFF',
                  color: '#FF3547',
                  padding: '6px 14px',
                  borderRadius: '16px',
                  border: '2.5px solid #FF3547',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: 1,
                  fontFamily: 'var(--font-display)',
                }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00FFCC', boxShadow: '0 0 8px #00FFCC' }} />
                <span>{pendingDraw > 0 ? `DEFEND +${pendingDraw}!` : `${partnerName} is thinking...`}</span>
              </div>
            )}

            {/* CALL OUT BUTTON */}
            {opponentHand.length === 1 && !unoCalled[opponentRole] && (
              <button
                onClick={handleCallOutOpponent}
                style={{
                  position: 'absolute',
                  left: '-150px',
                  top: '0',
                  background: 'linear-gradient(135deg, #FF3547 0%, #D81B60 100%)',
                  color: '#FFD700',
                  padding: '8px 16px',
                  borderRadius: '99px',
                  border: '3px solid #FFD700',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-display)',
                  boxShadow: '0 0 25px #FF3547',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  animation: 'pulseSphere 1s infinite',
                  opacity: 1,
                }}
              >
                <ShieldAlert size={18} /> CALL OUT!
              </button>
            )}

            {/* CRISP PERFECTLY ROUND AVATAR BADGE */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                aspectRatio: '1 / 1',
                flexShrink: 0,
                background: 'linear-gradient(135deg, #FF8A65 0%, #E64A19 100%)',
                border: currentTurn === opponentRole ? '4px solid #00FFCC' : '4px solid #FFD700',
                boxShadow: currentTurn === opponentRole ? '0 0 25px #00FFCC' : '0 6px 20px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                color: '#FFFFFF',
                fontSize: '1.8rem',
                position: 'relative',
                opacity: 1,
                transition: 'border 0.3s ease',
              }}
            >
              {partnerName[0]}

              <div
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#29B6F6',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Award size={13} color="#FFFFFF" />
              </div>
            </div>

            {/* Red Username Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.9rem',
                padding: '3px 18px',
                borderRadius: '99px',
                border: '2px solid #FFD700',
                boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                marginTop: '-10px',
                opacity: 1,
              }}
            >
              {partnerName} ({opponentHand.length})
            </div>

          </div>

          {/* Opponent Card Back Fan (Faded Depth Perspective) */}
          <div style={{ display: 'flex', justifyContent: 'center', height: '54px', filter: 'blur(0.3px)' }}>
            {Array.from({ length: Math.min(10, opponentHand.length) }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '42px',
                  height: '58px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1C1A24 0%, #2E1A2B 100%)',
                  border: '2px solid #FFFFFF',
                  marginLeft: i > 0 ? '-22px' : '0',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                  transform: `rotate(${Math.min(15, Math.max(-15, (i - 4) * 4))}deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 1,
                }}
              >
                <div style={{ width: '28px', height: '42px', border: '2px solid #FF3547', borderRadius: '4px', background: '#D81B60', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 900, fontSize: '0.55rem' }}>
                  UNO
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* PROMINENT DYNAMIC TURN BANNER */}
        <div style={{ zIndex: 12, marginTop: '-10px' }}>
          {isMyTurn ? (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.95) 0%, rgba(30, 130, 76, 0.95) 100%)',
                color: '#FFFFFF',
                padding: '6px 26px',
                borderRadius: '99px',
                border: '2.5px solid #FFD700',
                boxShadow: '0 0 25px rgba(39, 174, 96, 0.8), 0 4px 12px rgba(0,0,0,0.5)',
                fontWeight: 900,
                fontSize: '0.92rem',
                fontFamily: 'var(--font-display)',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Sparkles size={16} color="#FFD700" /> YOUR TURN — Drag or Tap a Card to Play
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.75)',
                color: '#FFD700',
                padding: '5px 22px',
                borderRadius: '99px',
                border: '1.5px solid rgba(255, 215, 0, 0.4)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                fontWeight: 800,
                fontSize: '0.85rem',
                fontFamily: 'var(--font-display)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Clock size={15} color="#FFD700" /> {partnerName} is playing...
            </div>
          )}
        </div>

        {/* 3D ACTION POPUP FX OVERLAY (+36 / +4 / SKIPPED / UNO!) */}
        {actionPopup && (
          <div
            style={{
              position: 'absolute',
              top: '48%',
              left: '50%',
              zIndex: 40,
              fontFamily: 'var(--font-display)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'actionPopupFly 2s ease-out forwards',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 53, 71, 0.95) 0%, rgba(255, 143, 0, 0.5) 60%, transparent 80%)',
                filter: 'blur(12px)',
              }}
            />
            <div
              style={{
                fontSize: '4.5rem',
                fontWeight: 900,
                color: '#FF3547',
                WebkitTextStroke: '3.5px #FFFFFF',
                textShadow: '0 10px 35px rgba(0,0,0,0.9), 0 0 45px #FFD700',
                letterSpacing: '2px',
                fontStyle: 'italic',
              }}
            >
              {actionPopup}
            </div>
          </div>
        )}

        {/* WILD COLOR SELECTION PINWHEEL MODAL */}
        {showWildModal && selectedWildCard && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 50,
              background: '#FFF9F2',
              border: '3px solid #2D152B',
              borderRadius: '24px',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '6px 6px 0px #2D152B',
            }}
          >
            <div style={{ color: '#2D152B', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'Fredoka, sans-serif' }}>
              Select Wild Color
            </div>
            <div
              style={{
                position: 'relative',
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                border: '3px solid #2D152B',
                boxShadow: '4px 4px 0px #2D152B',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => executePlay([selectedWildCard], 'red')}
                title="Red"
                style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '50%', background: '#FF6B6B', border: 'none', cursor: 'pointer' }}
              />
              <button
                onClick={() => executePlay([selectedWildCard], 'blue')}
                title="Blue"
                style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '50%', background: '#4D96FF', border: 'none', cursor: 'pointer' }}
              />
              <button
                onClick={() => executePlay([selectedWildCard], 'green')}
                title="Green"
                style={{ position: 'absolute', bottom: 0, left: 0, width: '50%', height: '50%', background: '#6BCB77', border: 'none', cursor: 'pointer' }}
              />
              <button
                onClick={() => executePlay([selectedWildCard], 'yellow')}
                title="Yellow"
                style={{ position: 'absolute', bottom: 0, right: 0, width: '50%', height: '50%', background: '#FFD93D', border: 'none', cursor: 'pointer' }}
              />
            </div>
          </div>
        )}

        {/* CENTER PLAYFIELD: Draw Deck, Rotating Direction Arrows & Discard Stack Trail */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '70px', zIndex: 10, margin: '4px 0' }}>

          {/* Rotating Direction Circle */}
          <div
            style={{
              position: 'absolute',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              border: '4px dashed rgba(45, 21, 43, 0.4)',
              animation: 'rotateCw 18s linear infinite',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RotateCw size={300} color="rgba(45, 21, 43, 0.25)" />
          </div>

          {/* Draw Deck Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 11 }}>
            <button
              ref={drawDeckRef}
              onClick={handleDrawStackCards}
              disabled={!isMyTurn}
              style={{
                width: '100px',
                height: '144px',
                borderRadius: '16px',
                border: '3px solid #2D152B',
                background: '#2D152B',
                boxShadow: isMyTurn ? '4px 4px 0px #FF6B6B' : '3px 3px 0px #2D152B',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isMyTurn ? 'pointer' : 'not-allowed',
                opacity: 1,
                filter: isMyTurn ? 'none' : 'brightness(0.85)',
                transform: 'rotate(-3deg)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ width: '74px', height: '114px', border: '2px solid #FFF9F2', borderRadius: '12px', background: '#FF6B6B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFF9F2', fontWeight: 900 }}>
                <span style={{ fontSize: '1.4rem', fontFamily: 'Fredoka, sans-serif', transform: 'rotate(-25deg)', fontStyle: 'italic', letterSpacing: '1px' }}>
                  {pendingDraw > 0 ? `+${pendingDraw}` : 'UNO'}
                </span>
              </div>
            </button>
          </div>

          {/* CENTER DISCARD STACK WITH NEAT TRAIL */}
          <div ref={discardRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 11, position: 'relative' }}>

            {/* Flat Hard Offset Shadow History Trail Stack */}
            {previousDiscards.map((prevCard, hIdx) => {
              const offsetPx = (hIdx - previousDiscards.length) * 4;
              const rotDeg = (hIdx % 2 === 0 ? -3 : 2) * (hIdx + 1);
              return (
                <div
                  key={`hist_${prevCard.id}_${hIdx}`}
                  style={{
                    position: 'absolute',
                    top: `${offsetPx}px`,
                    left: `${offsetPx}px`,
                    width: '102px',
                    height: '146px',
                    borderRadius: '16px',
                    border: '3px solid #2D152B',
                    background: CARD_PALETTE[prevCard.color]?.bg || CARD_PALETTE.red.bg,
                    transform: `rotate(${rotDeg}deg)`,
                    opacity: 0.6 + hIdx * 0.15,
                    pointerEvents: 'none',
                    boxShadow: '3px 3px 0px #2D152B',
                  }}
                />
              );
            })}

            {/* Active Discard Top Card */}
            <div
              style={{
                width: '102px',
                height: '146px',
                borderRadius: '16px',
                border: '3px solid #2D152B',
                background: CARD_PALETTE[topDiscard.color]?.bg || CARD_PALETTE.red.bg,
                boxShadow: '4px 4px 0px #2D152B',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 8px',
                transform: 'rotate(2deg)',
                position: 'relative',
                opacity: 1,
              }}
            >
              <span style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 800, alignSelf: 'flex-start', lineHeight: 1, fontFamily: 'Fredoka, sans-serif' }}>
                {renderCardSymbol(topDiscard.value, 'small')}
              </span>

              {/* Center White Oval */}
              <div
                style={{
                  width: '68px',
                  height: '96px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '2px solid #2D152B',
                  transform: 'rotate(-25deg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '2px 2px 0px rgba(0,0,0,0.15)',
                }}
              >
                <span
                  style={{
                    fontSize: topDiscard.value.length > 2 ? '1.4rem' : '2.2rem',
                    fontWeight: 900,
                    color: CARD_PALETTE[topDiscard.color]?.ovalText || '#FF6B6B',
                    fontFamily: 'Fredoka, sans-serif',
                    transform: 'rotate(25deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {renderCardSymbol(topDiscard.value, 'large')}
                </span>
              </div>

              <span style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 800, alignSelf: 'flex-end', lineHeight: 1, fontFamily: 'Fredoka, sans-serif', transform: 'rotate(180deg)' }}>
                {renderCardSymbol(topDiscard.value, 'small')}
              </span>
            </div>

            {/* Active Color Indicator Ring */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '12px',
                background: 'rgba(0, 0, 0, 0.85)',
                padding: '6px 18px',
                borderRadius: '99px',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
                opacity: 1,
              }}
            >
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: CARD_PALETTE[activeColor]?.bg || '#FF3547', boxShadow: `0 0 10px ${CARD_PALETTE[activeColor]?.bg}` }} />
              <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Color: {activeColor}
              </span>
            </div>
          </div>

        </div>

        {/* MID ACTION BUTTONS */}
        <div style={{ zIndex: 12, display: 'flex', gap: '14px', alignItems: 'center' }}>
          {jumpInCard && (
            <button
              onClick={() => handleJumpIn(jumpInCard)}
              style={{
                padding: '8px 20px',
                fontSize: '0.9rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #FFD700 0%, #FF8F00 100%)',
                color: '#2A1706',
                border: '3px solid #FFFFFF',
                borderRadius: '99px',
                boxShadow: '0 0 25px #FFD700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: 1,
              }}
            >
              <Zap size={18} /> JUMP IN! ({jumpInCard.value})
            </button>
          )}

          {selectedMultiIds.length > 1 && isMyTurn && (
            <button
              onClick={handlePlaySelectedMultiple}
              style={{
                padding: '8px 22px',
                fontSize: '0.9rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #27AE60 0%, #1E824C 100%)',
                color: '#FFFFFF',
                border: '3px solid #FFFFFF',
                borderRadius: '99px',
                boxShadow: '0 0 20px #27AE60',
                cursor: 'pointer',
                opacity: 1,
              }}
            >
              PLAY {selectedMultiIds.length} CARDS
            </button>
          )}

          {pendingDraw > 0 && isMyTurn && (
            hasDefendCard ? (
              <div
                style={{
                  padding: '8px 22px',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #FF8F00 0%, #E65100 100%)',
                  color: '#FFFFFF',
                  border: '3px solid #FFD700',
                  borderRadius: '99px',
                  boxShadow: '0 0 25px #FF8F00',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: 1,
                  animation: 'pulseSphere 1.2s infinite',
                }}
              >
                <ShieldAlert size={18} /> THROW YOUR +2 OR +4 CARD!
              </div>
            ) : (
              <div
                style={{
                  padding: '8px 22px',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
                  color: '#FFFFFF',
                  border: '3px solid #FFFFFF',
                  borderRadius: '99px',
                  boxShadow: '0 0 25px #D32F2F',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: 1,
                }}
              >
                <Download size={18} /> TAKING +{pendingDraw} CARDS...
              </div>
            )
          )}
        </div>

        {/* BOTTOM SEAT ROW: Player Avatar, Reaction Dock, Hand Fan, Giant 3D UNO Sphere */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 10, padding: '0 12px' }}>

          {/* Maulik Avatar Badge & Social Reaction Dock */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>

            {/* Quick Couple Reaction Emoji Dock */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '99px', border: '1.5px solid rgba(255,255,255,0.3)' }}>
              {['❤️', '🔥', '😂', '😈', '😤'].map((emojiStr) => (
                <button
                  key={emojiStr}
                  onClick={() => sendSocialReaction(emojiStr)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.15rem',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                    padding: '2px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.3)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {emojiStr}
                </button>
              ))}
            </div>

            {/* CRISP PERFECTLY ROUND UN-DISTORTED AVATAR BADGE */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  aspectRatio: '1 / 1',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
                  border: isMyTurn ? '4px solid #00FFCC' : '4px solid #FFFFFF',
                  boxShadow: isMyTurn ? '0 0 25px #00FFCC' : '0 6px 20px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  fontSize: '1.8rem',
                  opacity: 1,
                  transition: 'border 0.3s ease',
                }}
              >
                {myName[0]}

                {/* Un-stretched Golden Crown Overlay Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#FFD700',
                    color: '#B71C1C',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    border: '2px solid #FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Crown size={14} color="#B71C1C" />
                </div>
              </div>

              {/* Red Username Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  padding: '3px 18px',
                  borderRadius: '99px',
                  border: '2px solid #FFD700',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                  marginTop: '-10px',
                  opacity: 1,
                }}
              >
                {myName}
              </div>
            </div>

          </div>

          {/* PHYSICAL CARDS HAND FAN CONTAINER (Spans across table with generous padding) */}
          <div
            ref={playerHandRef}
            className="uno-hand-fan"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              padding: '35px 35px 12px 35px',
              overflowX: 'auto',
              overflowY: 'visible',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              maxWidth: '85%',
              width: '100%',
              flex: 1,
              margin: '0 10px',
            }}
          >
            {sortUnoCards(playerHand).map((card, idx) => {
              const playable = isMyTurn && isCardPlayable(card);
              const isSelectedMulti = selectedMultiIds.includes(card.id);
              const isShaking = invalidCardShakeId === card.id;
              const isDraggingThis = draggedCardId === card.id;
              const styleInfo = CARD_PALETTE[card.color] || CARD_PALETTE.red;
              const angle = Math.min(18, Math.max(-18, (idx - (playerHand.length - 1) / 2) * 3));
              const offsetMargin = idx > 0 ? (playerHand.length > 12 ? '-26px' : playerHand.length > 8 ? '-18px' : '-12px') : '0';

              const currentTransform = isDraggingThis
                ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0px) scale(1.18) rotate(0deg)`
                : isSelectedMulti
                  ? 'translateY(-28px) rotate(0deg) scale(1.18)'
                  : `rotate(${angle}deg)`;

              return (
                <div
                  key={card.id}
                  ref={(el) => {
                    if (el) cardElementRefs.current.set(card.id, el);
                    else cardElementRefs.current.delete(card.id);
                  }}
                  onPointerDown={(e) => handlePointerDown(e, card)}
                  onPointerMove={(e) => handlePointerMove(e, card)}
                  onPointerUp={(e) => handlePointerUp(e, card)}
                  style={{
                    minWidth: '82px',
                    height: '122px',
                    borderRadius: '16px',
                    background: styleInfo.bg,
                    border: isShaking
                      ? '4px solid #FF3547'
                      : isSelectedMulti
                        ? '4px solid #FFD700'
                        : playable
                          ? '4px solid #FFFFFF'
                          : '2.5px solid rgba(255,255,255,0.6)',
                    boxShadow: isShaking
                      ? '0 0 35px #FF3547'
                      : isSelectedMulti
                        ? '0 0 35px #FFD700'
                        : playable
                          ? `0 14px 35px ${styleInfo.glow}, 0 0 25px #FFFFFF`
                          : '0 6px 16px rgba(0,0,0,0.5)',
                    marginLeft: offsetMargin,
                    cursor: isMyTurn ? 'grab' : 'not-allowed',
                    touchAction: 'none',
                    opacity: 1,
                    filter: playable || isSelectedMulti ? 'none' : 'brightness(0.78)',
                    transform: currentTransform,
                    zIndex: isDraggingThis ? 300 : isSelectedMulti ? 150 : idx + 1,
                    transition: isDraggingThis ? 'none' : 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.2s ease',
                    animation: isDealingCards
                      ? `cardDealFlyIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${idx * 90}ms both`
                      : isShaking
                        ? 'cardInvalidShake 0.4s ease-in-out'
                        : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 6px',
                    userSelect: 'none',
                    position: 'relative',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.zIndex = '150';
                    if (playable && !isSelectedMulti && !draggedCardId) {
                      e.currentTarget.style.transform = `translateY(-26px) rotate(0deg) scale(1.16)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.zIndex = `${isSelectedMulti ? 150 : idx + 1}`;
                    if (!isSelectedMulti && !draggedCardId) {
                      e.currentTarget.style.transform = `rotate(${angle}deg) translateY(0) scale(1)`;
                    }
                  }}
                >
                  {/* Glossy Card Sheen Sweep Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      right: '0',
                      height: '45%',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
                      borderRadius: '12px 12px 0 0',
                      pointerEvents: 'none',
                    }}
                  />

                  <span style={{ fontSize: '0.78rem', color: '#FFFFFF', fontWeight: 800, alignSelf: 'flex-start', lineHeight: 1, fontFamily: 'Fredoka, sans-serif' }}>
                    {renderCardSymbol(card.value, 'small')}
                  </span>

                  {/* Center White Oval */}
                  <div
                    style={{
                      width: '48px',
                      height: '72px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: '2px solid #2D152B',
                      transform: 'rotate(-25deg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '2px 2px 0px rgba(0,0,0,0.15)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: card.value.length > 2 ? '1.15rem' : '1.75rem',
                        fontWeight: 900,
                        color: styleInfo.ovalText,
                        fontFamily: 'Fredoka, sans-serif',
                        transform: 'rotate(25deg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {renderCardSymbol(card.value, 'large')}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.78rem', color: '#FFFFFF', fontWeight: 800, alignSelf: 'flex-end', lineHeight: 1, fontFamily: 'Fredoka, sans-serif', transform: 'rotate(180deg)' }}>
                    {renderCardSymbol(card.value, 'small')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* GIANT GLOSSY 3D UNO SPHERE BUTTON WITH 3-SECOND TIMER */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {unoCountdown !== null && (
              <span style={{ color: '#FFD700', fontWeight: 900, fontSize: '0.85rem', textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
                CALL UNO: {unoCountdown}s
              </span>
            )}
            <button
              onClick={handleCallUno}
              disabled={playerHand.length !== 1}
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #FF5E8E 0%, #FF3547 45%, #D81B60 70%, #880E4F 100%)',
                border: '5px solid #FFD700',
                boxShadow: playerHand.length === 1 ? '0 0 50px #FF3547, 0 0 30px #FFD700' : '0 12px 30px rgba(0,0,0,0.7)',
                color: '#FFD700',
                fontFamily: 'var(--font-display)',
                fontSize: '1.6rem',
                fontWeight: 900,
                fontStyle: 'italic',
                cursor: playerHand.length === 1 ? 'pointer' : 'not-allowed',
                opacity: 1,
                filter: playerHand.length === 1 ? 'none' : 'brightness(0.7)',
                animation: playerHand.length === 1 ? 'pulseSphere 1s infinite' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textShadow: '0 3px 10px rgba(0,0,0,0.9), 0 0 10px #FF3547',
                transform: 'rotate(-10deg)',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              UNO!
            </button>
          </div>

        </div>

        <style>{`
          @keyframes cardDealFlyIn {
            0% {
              transform: translateY(-50vh) scale(0.2) rotate(45deg);
              opacity: 0;
            }
            60% {
              transform: translateY(12px) scale(1.1);
              opacity: 1;
            }
            100% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          @keyframes cardDealFlyInTop {
            0% {
              transform: translateY(40vh) scale(0.2) rotate(-45deg);
              opacity: 0;
            }
            60% {
              transform: translateY(-8px) scale(1.05);
              opacity: 1;
            }
            100% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>

      {/* FLAT CLEAN GAME OVER BANNER */}
      {winnerRole && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(45, 21, 43, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              background: '#FFF9F2',
              border: '3px solid #2D152B',
              borderRadius: '24px',
              padding: '28px 24px',
              boxShadow: '6px 6px 0px #2D152B',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <h2
              style={{
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '1.6rem',
                fontWeight: 700,
                color: '#2D152B',
                margin: 0,
              }}
            >
              {winnerRole === 'tie'
                ? '🤝 Match Tied!'
                : winnerRole === myRole
                  ? '🎉 You Won!'
                  : `🎉 ${partnerName} Won!`}
            </h2>
            <p style={{ color: '#6B5B6E', fontSize: '0.9rem', margin: 0, fontFamily: 'Fredoka, sans-serif' }}>
              Match completed cleanly. Scores synced to scoreboard.
            </p>

            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
              <button
                onClick={() => {
                  setWinnerRole(null);
                  getSocketInstance().emit('uno_start_game');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '14px',
                  background: '#6BCB77',
                  color: '#2D152B',
                  border: '2px solid #2D152B',
                  fontFamily: 'Fredoka, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0px #2D152B',
                }}
              >
                Play Again
              </button>
              <button
                onClick={() => navigate('/profile')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '14px',
                  background: '#FFF',
                  color: '#2D152B',
                  border: '2px solid #2D152B',
                  fontFamily: 'Fredoka, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0px #2D152B',
                }}
              >
                Scoreboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );

}
