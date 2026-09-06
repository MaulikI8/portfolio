import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getSocketInstance } from '../../hooks/useSocket';
import {
  Clock,
  Signal,
  Sparkles,
  Bell,
  Trophy,
  RotateCw,
} from 'lucide-react';
import { Dice3D } from '../Dice3D';

interface BoardProps {
  state?: any;
  myRole?: string;
  isMyTurn?: boolean;
  onMove?: (payload: any) => void;
}

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export interface Pawn {
  id: number;
  color: PlayerColor;
  pos: number; // -1 = Home yard, 0..50 = Main circuit track, 51..55 = Home stretch, 56 = Finished
}

// 52 Main Circuit Track Grid Coordinates [row, col] (1-indexed for CSS grid)
export const MAIN_TRACK_COORDS: [number, number][] = [
  [7, 2],  [7, 3],  [7, 4],  [7, 5],  [7, 6],  [6, 7],  [5, 7],  [4, 7],  [3, 7],  [2, 7],  [1, 7],  [1, 8],  [1, 9], // 0-12 (Red start at index 0 [7,2])
  [2, 9],  [3, 9],  [4, 9],  [5, 9],  [6, 9],  [7, 10], [7, 11], [7, 12], [7, 13], [7, 14], [7, 15], [8, 15],         // 13-24 (Green start at index 13 [2,9])
  [9, 15], [9, 14], [9, 13], [9, 12], [9, 11], [9, 10], [10, 9], [11, 9], [12, 9], [13, 9], [14, 9], [15, 9], [15, 8], // 25-37 (Yellow start at index 26 [9,14])
  [15, 7], [14, 7], [13, 7], [12, 7], [11, 7], [10, 7], [9, 6],  [9, 5],  [9, 4],  [9, 3],  [9, 2],  [9, 1],  [8, 1], [7, 1]  // 38-51 (Blue start at index 39 [14,7])
];

// Color Start Track Indices
export const START_INDICES: Record<PlayerColor, number> = {
  red: 0,     // [7, 2]
  green: 13,  // [2, 9]
  yellow: 26, // [9, 14]
  blue: 39,   // [14, 7]
};

// Safe Spot Indices on Main Track (8 Safe Squares)
export const SAFE_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// Home Stretch Coordinates per color [row, col]
export const HOME_STRETCH_COORDS: Record<PlayerColor, [number, number][]> = {
  red:    [[8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7]],
  green:  [[2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8]],
  yellow: [[8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9]],
  blue:   [[14, 8], [13, 8], [12, 8], [11, 8], [10, 8], [9, 8]],
};

export const COLOR_HEX: Record<PlayerColor, string> = {
  red: '#FF4D6D',
  green: '#10B981',
  yellow: '#F59E0B',
  blue: '#3B82F6',
};

export const PAWN_GRADIENTS: Record<PlayerColor, string> = {
  red: 'radial-gradient(circle at 35% 35%, #FF758F 0%, #FF4D6D 55%, #A71D31 100%)',
  green: 'radial-gradient(circle at 35% 35%, #34D399 0%, #10B981 55%, #065F46 100%)',
  yellow: 'radial-gradient(circle at 35% 35%, #FBBF24 0%, #F59E0B 55%, #B45309 100%)',
  blue: 'radial-gradient(circle at 35% 35%, #60A5FA 0%, #3B82F6 55%, #1E40AF 100%)',
};

const ALL_COLORS: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

export function LudoBoard({ state, onMove }: BoardProps) {
  const { partner } = useAuth();
  const partnerName = partner?.role === 'boyfriend' ? 'Seema' : 'Maulik';
  const myName = partner?.name || (partner?.role === 'boyfriend' ? 'Maulik' : 'Seema');
  const myRole = partner?.role || 'boyfriend';
  const myColor: PlayerColor = myRole === 'boyfriend' ? 'red' : 'yellow';

  // Lobby state
  const [isWaitingForPartner, setIsWaitingForPartner] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Player Color Selection (2 Player Game: Red = Boyfriend/Maulik, Yellow = Girlfriend/Seema)
  const [player1Color, setPlayer1Color] = useState<PlayerColor>('red');
  const [player2Color, setPlayer2Color] = useState<PlayerColor>('yellow');

  // Active 2 Player colors
  const activeColors: PlayerColor[] = [player1Color, player2Color];

  const [activeTurn, setActiveTurn] = useState<PlayerColor>('red');
  const [diceVal, setDiceVal] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [hasRolled, setHasRolled] = useState<boolean>(state?.hasRolled || false);
  const [sixesCount, setSixesCount] = useState<number>(0);
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [alertMsg, setAlertMsg] = useState<string>('Roll 3D dice to start!');

  // Animation States
  const [animatingPawnKey, setAnimatingPawnKey] = useState<string | null>(null);
  const [animType, setAnimType] = useState<'unlock' | 'hop' | null>(null);

  // Timer Ref for reliable roll resolution
  const settleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Strategic game history for dice manipulation
  const [blunderState, setBlunderState] = useState<Record<PlayerColor, boolean>>({
    red: false, green: false, yellow: false, blue: false,
  });

  const [pawns, setPawns] = useState<Pawn[]>(() => {
    const initialPawns: Pawn[] = [];
    ALL_COLORS.forEach((color) => {
      for (let i = 0; i < 4; i++) {
        initialPawns.push({ id: i, color, pos: -1 });
      }
    });
    return initialPawns;
  });

  // Socket.IO Real-Time Synchronization for Ludo
  useEffect(() => {
    const socket = getSocketInstance();
    socket.emit('ludo_join', { role: myRole });

    const handleLudoAction = (data: any) => {
      if (data.fromRole === myRole) return;

      if (data.type === 'roll_dice') {
        setDiceVal(data.dice);
        setHasRolled(true);
        setIsRolling(false);
        setIsWaitingForPartner(false);
      } else if (data.type === 'move_pawn') {
        setPawns((prev) =>
          prev.map((p) => (p.id === data.pawnId && p.color === data.color ? { ...p, pos: data.newPos } : p))
        );
        setIsWaitingForPartner(false);
      } else if (data.type === 'pass_turn') {
        setActiveTurn(data.nextTurn);
        setHasRolled(false);
        setSixesCount(0);
        setDiceVal(1);
        setAlertMsg(`Turn passed to ${data.nextTurn.toUpperCase()}! Roll 3D dice.`);
        setIsWaitingForPartner(false);
      }
    };

    const handlePlayerJoined = () => {
      setIsWaitingForPartner(false);
    };

    socket.on('ludo_action', handleLudoAction);
    socket.on('ludo_player_joined', handlePlayerJoined);

    return () => {
      socket.off('ludo_action', handleLudoAction);
      socket.off('ludo_player_joined', handlePlayerJoined);
    };
  }, [myRole]);

  // Re-initialize active turn when active colors change
  useEffect(() => {
    if (!state?.pawns) {
      const initialPawns: Pawn[] = [];
      ALL_COLORS.forEach((color) => {
        for (let i = 0; i < 4; i++) {
          initialPawns.push({ id: i, color, pos: -1 });
        }
      });
      setPawns(initialPawns);
    }
  }, []);

  useEffect(() => {
    if (state?.pawns) setPawns(state.pawns);
    if (state?.activeTurn) setActiveTurn(state.activeTurn);
    if (state?.dice !== undefined && state?.dice !== null) setDiceVal(state.dice);
  }, [state]);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const isMyTurnColor = activeTurn === myColor;
  const canRoll = isMyTurnColor && !hasRolled && !isWaitingForPartner && !winner && !animatingPawnKey;

  // ----------------------------------------------------
  // BALANCED REALISTIC DICE LOGIC ENGINE
  // Fair & fun game play: 50% unbiased random, 50% subtle strategic assistance
  // ----------------------------------------------------
  const calculateStrategicDiceRoll = (color: PlayerColor): number => {
    // 50% chance of 100% pure random roll (unbiased)
    if (Math.random() < 0.5) {
      return Math.floor(Math.random() * 6) + 1;
    }

    const currentPawns = pawns.filter((p) => p.color === color);
    const opponentColor = activeColors.find((c) => c !== color) || player2Color;
    const opponentPawns = pawns.filter((p) => p.color === opponentColor);

    const allInYard = currentPawns.every((p) => p.pos === -1);

    // 1. Yard Stuck: 35% chance to roll a 6 if all pawns are stuck in yard
    if (allInYard) {
      if (Math.random() < 0.35) return 6;
    }

    // 2. Capture Opportunity: 30% chance for exact capture roll if opponent is within 6 spaces
    for (const p of currentPawns) {
      if (p.pos >= 0 && p.pos <= 50) {
        const myTrackIdx = (START_INDICES[p.color] + p.pos) % 52;
        for (const oppP of opponentPawns) {
          if (oppP.pos >= 0 && oppP.pos <= 50) {
            const oppTrackIdx = (START_INDICES[oppP.color] + oppP.pos) % 52;
            const dist = (oppTrackIdx - myTrackIdx + 52) % 52;
            if (dist >= 1 && dist <= 6 && !SAFE_INDICES.has(oppTrackIdx)) {
              if (!blunderState[color] && Math.random() < 0.3) {
                return dist;
              }
            }
          }
        }
      }
    }

    // 3. Fallback: Unbiased random roll 1-6
    return Math.floor(Math.random() * 6) + 1;
  };

  const handleRollDice = () => {
    if (isRolling || hasRolled || !canRoll || winner || animatingPawnKey) return;
    setIsRolling(true);
    setAlertMsg('Rolling 3D dice...');

    const rolled = calculateStrategicDiceRoll(activeTurn);
    setDiceVal(rolled);

    // Reliable fallback timer for instant response
    if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
    settleTimeoutRef.current = setTimeout(() => {
      handleDiceSettled(rolled);
    }, 750);
  };

  // Called when 3D Dice finishes its tumbling animation & settles on face
  const handleDiceSettled = (rolledVal: number) => {
    if (settleTimeoutRef.current) {
      clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = null;
    }
    setIsRolling(false);
    setHasRolled(true);

    // 1. Three-Sixes Rule Check
    if (rolledVal === 6) {
      const nextSixes = sixesCount + 1;
      setSixesCount(nextSixes);
      if (nextSixes >= 3) {
        setSixesCount(0);
        setAlertMsg('Rolled 3 sixes in a row! Turn forfeited.');
        notify('🎲 Rolled 3 sixes in a row! Turn passes.');
        setTimeout(() => passTurn(), 1400);
        return;
      }
    } else {
      setSixesCount(0);
    }

    // 2. Check Legal Moves for Active Player
    const currentPawns = pawns.filter((p) => p.color === activeTurn);
    const canMoveAny = currentPawns.some((p) => canPawnMove(p, rolledVal));

    if (!canMoveAny) {
      const isStuckInYard = currentPawns.every((p) => p.pos === -1);
      if (isStuckInYard) {
        setAlertMsg(`Rolled ${rolledVal}! Need a 6 to exit yard — passing turn...`);
      } else {
        setAlertMsg(`Rolled ${rolledVal}! No legal move available — passing turn...`);
      }
      notify(`Rolled ${rolledVal} — Turn passes automatically.`);
      setTimeout(() => passTurn(), 1300);
    } else {
      if (rolledVal === 6) {
        setAlertMsg(`Rolled 6! Click a glowing token to unlock or move (Bonus Roll!)`);
      } else {
        setAlertMsg(`Rolled ${rolledVal}! Click a glowing token to move.`);
      }
    }

    if (onMove) {
      onMove({ type: 'roll_dice', dice: rolledVal });
    }
    getSocketInstance().emit('ludo_action', { type: 'roll_dice', dice: rolledVal });
  };

  const canPawnMove = (pawn: Pawn, roll: number): boolean => {
    if (!pawn || pawn.color !== myColor || !isMyTurnColor) return false;
    const pos = pawn.pos ?? -1;
    if (pos === 56) return false; // Already home
    if (pos === -1) return roll === 6; // Must roll 6 to exit yard
    return pos + roll <= 56; // Exact count requirement
  };

  const handlePawnClick = (pawn: Pawn) => {
    if (!hasRolled || !diceVal || isRolling || winner || animatingPawnKey) return;
    if (!canPawnMove(pawn, diceVal)) return;

    const pawnKey = `${pawn.color}_${pawn.id}`;
    const isUnlocking = pawn.pos === -1;
    const targetPos = isUnlocking ? 0 : pawn.pos + diceVal;
    const currentRoll = diceVal;

    // Lock interaction while token is moving with animation
    setHasRolled(false);
    setAnimatingPawnKey(pawnKey);

    if (isUnlocking) {
      // 1. UNLOCK FROM YARD (Glides smoothly out of yard to start spot)
      setAnimType('unlock');

      setTimeout(() => {
        setPawns((prev) =>
          prev.map((p) => (p.color === pawn.color && p.id === pawn.id ? { ...p, pos: 0 } : p))
        );
      }, 200);

      setTimeout(() => {
        setAnimatingPawnKey(null);
        setAnimType(null);
        finalizeMoveDestination(pawn, 0, currentRoll);
      }, 650);
    } else {
      // 2. STEP-BY-STEP JUMPING HOP FORWARD ON TRACK
      setAnimType('hop');
      let currentStepPos = pawn.pos;
      const stepsToTake = currentRoll;
      let stepCount = 0;

      const stepInterval = setInterval(() => {
        stepCount++;
        currentStepPos++;

        setPawns((prev) =>
          prev.map((p) => (p.color === pawn.color && p.id === pawn.id ? { ...p, pos: currentStepPos } : p))
        );

        if (stepCount >= stepsToTake) {
          clearInterval(stepInterval);
          setAnimatingPawnKey(null);
          setAnimType(null);

          // Resolve captures and win conditions at final destination
          finalizeMoveDestination(pawn, targetPos, currentRoll);
        }
      }, 200);
    }
  };

  const finalizeMoveDestination = (pawn: Pawn, newPos: number, rolledVal: number) => {
    let capturedOpponent = false;
    const opponentColor = activeColors.find((c) => c !== pawn.color) || player2Color;
    const opponentPawns = pawns.filter((p) => p.color === opponentColor);

    let isBlunder = false;
    if (newPos >= 0 && newPos <= 50) {
      const newTrackIdx = (START_INDICES[pawn.color] + newPos) % 52;
      // If landed on non-safe spot with opponent 1-6 steps behind, mark as blunder!
      if (!SAFE_INDICES.has(newTrackIdx)) {
        for (const oppP of opponentPawns) {
          if (oppP.pos >= 0 && oppP.pos <= 50) {
            const oppTrackIdx = (START_INDICES[oppP.color] + oppP.pos) % 52;
            const dist = (newTrackIdx - oppTrackIdx + 52) % 52;
            if (dist >= 1 && dist <= 6) {
              isBlunder = true;
            }
          }
        }
      }
    }

    setBlunderState((prev) => ({ ...prev, [pawn.color]: isBlunder }));

    const updatedPawns = pawns.map((p) => {
      if (p.color === pawn.color && p.id === pawn.id) {
        return { ...p, pos: newPos };
      }
      
      if (
        newPos >= 0 &&
        newPos <= 50 &&
        p.color !== pawn.color &&
        activeColors.includes(p.color) &&
        p.pos >= 0 &&
        p.pos <= 50
      ) {
        const pawnTrackIdx = (START_INDICES[pawn.color] + newPos) % 52;
        const opponentTrackIdx = (START_INDICES[p.color] + p.pos) % 52;
        
        if (pawnTrackIdx === opponentTrackIdx && !SAFE_INDICES.has(pawnTrackIdx)) {
          capturedOpponent = true;
          return { ...p, pos: -1 };
        }
      }
      return p;
    });

    setPawns(updatedPawns);

    // Win Condition Check (All 4 tokens reached home center pos 56)
    const homeCount = updatedPawns.filter((p) => p.color === pawn.color && p.pos === 56).length;
    if (homeCount === 4) {
      setWinner(pawn.color);
      setAlertMsg(`🏆 ${pawn.color.toUpperCase()} HAS WON THE MATCH! 🎉`);
      notify(`🏆 ${pawn.color.toUpperCase()} brought all 4 tokens home!`);
      return;
    }

    if (capturedOpponent) {
      setAlertMsg(`💥 CAPTURED ${opponentColor.toUpperCase()} TOKEN! Roll again!`);
      notify(`💥 Captured opponent token! Bonus roll earned!`);
      setBlunderState((prev) => ({ ...prev, [opponentColor]: false }));
      return;
    }

    if (rolledVal === 6) {
      setAlertMsg(`🎲 Rolled a 6! Roll again!`);
      return;
    }

    passTurn();

    if (onMove) {
      onMove({ type: 'move_pawn', pawnId: pawn.id, color: pawn.color, newPos });
    }
    getSocketInstance().emit('ludo_action', { type: 'move_pawn', pawnId: pawn.id, color: pawn.color, newPos });
  };

  const passTurn = (manualNextTurn?: PlayerColor) => {
    setHasRolled(false);
    setSixesCount(0);
    const currentIndex = activeColors.indexOf(activeTurn);
    const nextPlayer = manualNextTurn || activeColors[(currentIndex + 1) % activeColors.length];
    setActiveTurn(nextPlayer);
    setAlertMsg(`Turn passed to ${nextPlayer.toUpperCase()}! Roll 3D dice.`);

    getSocketInstance().emit('ludo_action', { type: 'pass_turn', nextTurn: nextPlayer, fromRole: myRole });
  };

  // Convert pawn to cell key or yard slot
  const getPawnLocation = (pawn: Pawn): { type: 'track' | 'yard'; key: string } => {
    if (pawn.pos === -1) {
      return { type: 'yard', key: `yard_${pawn.color}_${pawn.id}` };
    }
    if (pawn.pos >= 0 && pawn.pos <= 50) {
      const globalIdx = (START_INDICES[pawn.color] + pawn.pos) % 52;
      const [r, c] = MAIN_TRACK_COORDS[globalIdx];
      return { type: 'track', key: `${r}_${c}` };
    }
    if (pawn.pos >= 51 && pawn.pos <= 56) {
      const idx = Math.min(pawn.pos - 51, 5);
      const [r, c] = HOME_STRETCH_COORDS[pawn.color][idx];
      return { type: 'track', key: `${r}_${c}` };
    }
    return { type: 'track', key: '8_8' };
  };

  // Group pawns by track cell key
  const pawnsOnTrack: Record<string, Pawn[]> = {};
  pawns.forEach((p) => {
    const loc = getPawnLocation(p);
    if (loc.type === 'track') {
      if (!pawnsOnTrack[loc.key]) pawnsOnTrack[loc.key] = [];
      pawnsOnTrack[loc.key].push(p);
    }
  });

  const getYardPawn = (color: PlayerColor, slotIdx: number) => {
    return pawns.find((p) => p.color === color && p.id === slotIdx && p.pos === -1);
  };

  const renderPawn = (pawn: Pawn) => {
    const pawnKey = `${pawn.color}_${pawn.id}`;
    const isAnimating = animatingPawnKey === pawnKey;

    const isClickable =
      hasRolled &&
      diceVal !== null &&
      pawn.color === activeTurn &&
      canPawnMove(pawn, diceVal) &&
      !winner &&
      !animatingPawnKey;

    return (
      <div
        key={pawnKey}
        className={`ludo-pawn ${isClickable ? 'pawn-active' : ''} ${isAnimating && animType === 'unlock' ? 'pawn-unlocking' : ''} ${isAnimating && animType === 'hop' ? 'pawn-stepping' : ''}`}
        style={{
          background: PAWN_GRADIENTS[pawn.color],
          width: '92%',
          height: '92%',
          borderRadius: '50%',
          border: '3px solid #FFFFFF',
          boxShadow: isClickable
            ? '0 0 24px #FFD700, 0 8px 18px rgba(0,0,0,0.6)'
            : '0 6px 14px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isClickable ? 'pointer' : 'default',
          transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: isClickable || isAnimating ? 60 : 10,
          position: 'relative',
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isClickable) handlePawnClick(pawn);
        }}
      >
        {isClickable && (
          <div
            style={{
              position: 'absolute',
              top: '-18px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '1rem',
              pointerEvents: 'none',
              animation: 'pointerBounce 0.8s infinite ease-in-out',
              zIndex: 70,
            }}
          >
            ✨
          </div>
        )}

        <div
          className="pawn-inner"
          style={{
            width: '46%',
            height: '46%',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.9)',
          }}
        />
      </div>
    );
  };

  // Render 4 6x6 Yard Corners (Inactive 2 corners are grayed out)
  const renderYard = (color: PlayerColor, gridRow: string, gridCol: string) => {
    const isActiveYard = activeColors.includes(color);

    return (
      <div
        className={`yard-${color}`}
        style={{
          gridRow,
          gridColumn: gridCol,
          padding: '10%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isActiveYard ? 1 : 0.4,
          filter: isActiveYard ? 'none' : 'grayscale(0.7)',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.18), inset 0 2px 6px rgba(0,0,0,0.1)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            padding: '12%',
            gap: '12%',
          }}
        >
          {isActiveYard ? (
            [0, 1, 2, 3].map((slotIdx) => {
              const yardPawn = getYardPawn(color, slotIdx);
              return (
                <div
                  key={slotIdx}
                  style={{
                    background: '#F1F5F9',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.25), 0 1px 2px rgba(255,255,255,0.8)',
                    border: '1.5px solid #CBD5E1',
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  {yardPawn && renderPawn(yardPawn)}
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: '1 / 3', gridRow: '1 / 3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Empty Seat
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTrackCell = (r: number, c: number) => {
    const key = `${r}_${c}`;
    let cellStyle: React.CSSProperties = {};
    let cellContent: React.ReactNode = null;

    // Home Stretches
    if (r === 8 && c >= 2 && c <= 6) cellStyle.background = '#FF8FA3';
    if (c === 8 && r >= 2 && r <= 6) cellStyle.background = '#6EE7B7';
    if (r === 8 && c >= 10 && c <= 14) cellStyle.background = '#FCD34D';
    if (c === 8 && r >= 10 && r <= 14) cellStyle.background = '#93C5FD';

    // Start spots
    if (r === 7 && c === 2) cellStyle.background = '#FF4D6D';
    if (r === 2 && c === 9) cellStyle.background = '#10B981';
    if (r === 9 && c === 14) cellStyle.background = '#F59E0B';
    if (r === 14 && c === 7) cellStyle.background = '#3B82F6';

    const trackIdx = MAIN_TRACK_COORDS.findIndex(([tr, tc]) => tr === r && tc === c);
    if (trackIdx !== -1 && SAFE_INDICES.has(trackIdx)) {
      cellContent = <span className="star-icon">⭐</span>;
    }

    const pawnsHere = pawnsOnTrack[key] || [];

    return (
      <div
        key={key}
        className="ludo-cell"
        style={{ gridRow: r, gridColumn: c, ...cellStyle }}
      >
        {cellContent}
        {pawnsHere.length > 0 && (
          <div className="pawn-container" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {pawnsHere.map((p, idx) => (
              <div
                key={`${p.color}_${p.id}`}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform:
                    pawnsHere.length > 1
                      ? `translate(${idx * 3 - 3}px, ${idx * 3 - 3}px) scale(0.85)`
                      : 'none',
                }}
              >
                {renderPawn(p)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const trackCells: [number, number][] = [];
  for (let r = 1; r <= 6; r++) for (let c = 7; c <= 9; c++) trackCells.push([r, c]);
  for (let r = 10; r <= 15; r++) for (let c = 7; c <= 9; c++) trackCells.push([r, c]);
  for (let r = 7; r <= 9; r++) for (let c = 1; c <= 6; c++) trackCells.push([r, c]);
  for (let r = 7; r <= 9; r++) for (let c = 10; c <= 15; c++) trackCells.push([r, c]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'var(--bg-app, #0d0b14)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'max(0.4rem, 1vh) max(0.75rem, 1.5vw)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <style>{`
        @keyframes pawnGlowPulse {
          0% { transform: scale(1); box-shadow: 0 0 12px #FFD700, 0 0 24px rgba(255, 215, 0, 0.8); }
          50% { transform: scale(1.15); box-shadow: 0 0 24px #FFD700, 0 0 40px rgba(255, 215, 0, 1); }
          100% { transform: scale(1); box-shadow: 0 0 12px #FFD700, 0 0 24px rgba(255, 215, 0, 0.8); }
        }

        @keyframes pawnUnlockGlide {
          0% { transform: scale(0.6) translateY(-24px); opacity: 0.5; }
          50% { transform: scale(1.3) translateY(-40px); opacity: 1; filter: drop-shadow(0 16px 24px rgba(0,0,0,0.5)); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        @keyframes pawnStepHop {
          0% { transform: translateY(0) scale(1); }
          40% { transform: translateY(-24px) scale(1.26); filter: drop-shadow(0 14px 20px rgba(0,0,0,0.5)); }
          70% { transform: translateY(-10px) scale(1.1); }
          100% { transform: translateY(0) scale(1); }
        }

        @keyframes pointerBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .pawn-active {
          animation: pawnGlowPulse 1.2s infinite cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .pawn-unlocking {
          animation: pawnUnlockGlide 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
        }

        .pawn-stepping {
          animation: pawnStepHop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
        }
      `}</style>

      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, var(--coral-primary) 0%, var(--magenta-deep) 100%)',
            color: '#FFFFFF',
            padding: '0.65rem 1.25rem',
            borderRadius: '99px',
            fontWeight: 700,
            fontSize: '0.88rem',
            boxShadow: 'var(--shadow-glow)',
            zIndex: 999999,
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* WINNER OVERLAY */}
      {winner && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 6, 14, 0.88)',
            backdropFilter: 'blur(16px)',
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              maxWidth: '420px',
              width: '100%',
              background: 'var(--surface-card)',
              borderRadius: '28px',
              border: `3px solid ${COLOR_HEX[winner]}`,
              padding: '2.25rem 1.75rem',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: COLOR_HEX[winner], display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 30px ${COLOR_HEX[winner]}` }}>
              <Trophy size={36} color="#FFFFFF" />
            </div>

            <div>
              <h2 className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ink-deep)' }}>
                {winner.toUpperCase()} VICTORIOUS!
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', marginTop: '0.35rem', fontWeight: 500 }}>
                All 4 tokens reached home safely!
              </p>
            </div>

            <button
              className="btn-primary"
              onClick={() => {
                const initialPawns: Pawn[] = [];
                ALL_COLORS.forEach((color) => {
                  for (let i = 0; i < 4; i++) {
                    initialPawns.push({ id: i, color, pos: -1 });
                  }
                });
                setPawns(initialPawns);
                setWinner(null);
                setHasRolled(false);
                setSixesCount(0);
                setActiveTurn(player1Color);
                setAlertMsg('New game started! Roll 3D dice to begin.');
              }}
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: '99px',
                background: `linear-gradient(135deg, ${COLOR_HEX[winner]} 0%, #1A0E24 100%)`,
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* WAITING LOBBY OVERLAY & COLOR SELECTION */}
      {isWaitingForPartner && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 6, 14, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '1.25rem',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div
            style={{
              maxWidth: '460px',
              width: '100%',
              background: 'var(--surface-card)',
              borderRadius: '28px',
              border: '2.5px solid var(--border-strong)',
              padding: '2rem 1.75rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--coral-primary) 0%, var(--peach-accent) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(255, 94, 142, 0.4)' }}>
              <Clock size={32} color="#FFFFFF" />
            </div>

            <div>
              <h2 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink-deep)' }}>
                Waiting for another player...
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '0.3rem', fontWeight: 500 }}>
                Match will automatically start when {partnerName} joins the table!
              </p>
            </div>

            {/* COLOR SELECTION FOR 2 PLAYERS */}
            <div style={{ width: '100%', background: 'var(--coral-soft)', borderRadius: '20px', padding: '1rem', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--coral-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Choose Your Colors (2 Players)
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {/* Player 1 Color */}
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    {myName} (Player 1)
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                    {ALL_COLORS.map((c) => (
                      <button
                        key={c}
                        disabled={c === player2Color}
                        onClick={() => setPlayer1Color(c)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: COLOR_HEX[c],
                          border: player1Color === c ? '3px solid #FFFFFF' : 'none',
                          boxShadow: player1Color === c ? `0 0 12px ${COLOR_HEX[c]}` : 'none',
                          opacity: c === player2Color ? 0.3 : 1,
                          cursor: c === player2Color ? 'not-allowed' : 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Player 2 Color */}
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    {partnerName} (Player 2)
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                    {ALL_COLORS.map((c) => (
                      <button
                        key={c}
                        disabled={c === player1Color}
                        onClick={() => setPlayer2Color(c)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: COLOR_HEX[c],
                          border: player2Color === c ? '3px solid #FFFFFF' : 'none',
                          boxShadow: player2Color === c ? `0 0 12px ${COLOR_HEX[c]}` : 'none',
                          opacity: c === player1Color ? 0.3 : 1,
                          cursor: c === player1Color ? 'not-allowed' : 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--coral-soft)', padding: '0.65rem 1.15rem', borderRadius: '16px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.65rem', width: '100%', justifyContent: 'center' }}>
              <Signal size={16} color="var(--coral-primary)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--coral-primary)' }}>
                Room Status: 1 / 2 Players Connected
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%' }}>
              <button
                className="btn-primary"
                onClick={() => {
                  setIsWaitingForPartner(false);
                  notify('Match started! Roll the 3D dice to race home!');
                }}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '99px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.98rem', background: 'linear-gradient(135deg, var(--coral-primary) 0%, var(--magenta-deep) 100%)', color: '#FFFFFF', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(255,94,142,0.35)' }}
              >
                <Sparkles size={18} />
                <span>Start Match (Both Players Joined)</span>
              </button>

              <button
                onClick={() => {
                  notify(`Notified ${partnerName}! Waiting for them to join table 💖`);
                }}
                style={{ width: '100%', padding: '0.72rem', borderRadius: '99px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.88rem', background: 'var(--surface-card)', border: '1.5px solid var(--border-subtle)', color: 'var(--ink-deep)', cursor: 'pointer' }}
              >
                <Bell size={16} color="var(--coral-primary)" />
                <span>Notify {partnerName}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER STATUS BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '540px',
          background: 'var(--surface-card)',
          border: '1.5px solid var(--border-subtle)',
          padding: '0.65rem 1.1rem',
          borderRadius: '99px',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div className="active-turn-badge" style={{ borderColor: COLOR_HEX[activeTurn] }}>
          <span className="turn-dot" style={{ background: COLOR_HEX[activeTurn] }} />
          Turn: <strong style={{ color: COLOR_HEX[activeTurn] }}>{activeTurn.toUpperCase()}</strong>
        </div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink-deep)' }}>
          {alertMsg}
        </div>
      </div>

      {/* CENTER RESPONSIVE 15x15 LUDO BOARD */}
      <div
        style={{
          width: 'min(88vw, 64vh)',
          height: 'min(88vw, 64vh)',
          aspectRatio: '1 / 1',
          background: '#FFFFFF',
          border: '4px solid var(--ink-deep)',
          borderRadius: '24px',
          boxShadow: '0 16px 45px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          padding: '3px',
          boxSizing: 'border-box',
          margin: 'auto 0',
        }}
      >
        <div className="ludo-grid">
          {/* 4 Corner Yards */}
          {renderYard('red', '1 / 7', '1 / 7')}
          {renderYard('green', '1 / 7', '10 / 16')}
          {renderYard('blue', '10 / 16', '1 / 7')}
          {renderYard('yellow', '10 / 16', '10 / 16')}

          {/* Center 3x3 Home Finish Area */}
          <div className="center-home" style={{ gridRow: '7 / 10', gridColumn: '7 / 10' }}>
            <Trophy size={28} color="#FFD700" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }} />
          </div>

          {/* Track Arm Cells */}
          {trackCells.map(([r, c]) => renderTrackCell(r, c))}
        </div>
      </div>

      {/* BOTTOM CONTROLS: REAL 3D DICE & ROLL BUTTON */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          marginBottom: 'max(0.4rem, 0.8vh)',
        }}
      >
        {/* PROMINENT 3D CUBE DICE */}
        <div
          onClick={handleRollDice}
          style={{
            cursor: canRoll && !hasRolled && !isRolling && !winner ? 'pointer' : 'default',
            position: 'relative',
            borderRadius: '20px',
            transition: 'transform 0.2s ease',
          }}
          title={canRoll && !hasRolled && !isRolling && !winner ? 'Click to roll 3D dice' : undefined}
          onMouseEnter={(e) => {
            if (canRoll && !hasRolled && !isRolling && !winner) {
              e.currentTarget.style.transform = 'scale(1.06)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Dice3D
            rolling={isRolling}
            result={diceVal}
            onSettled={handleDiceSettled}
            size={135}
          />
        </div>

        {/* ROLL DICE BUTTON */}
        <button
          disabled={!canRoll || hasRolled || isRolling || !!winner}
          onClick={handleRollDice}
          style={{
            padding: '0.85rem 1.85rem',
            borderRadius: '99px',
            background: `linear-gradient(135deg, ${COLOR_HEX[activeTurn]} 0%, #1A0E24 100%)`,
            color: '#FFFFFF',
            border: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: canRoll && !hasRolled && !isRolling && !winner ? 'pointer' : 'not-allowed',
            boxShadow: `0 8px 24px ${COLOR_HEX[activeTurn]}40`,
            opacity: canRoll && !hasRolled && !isRolling && !winner ? 1 : 0.6,
            transition: 'transform 0.2s ease, opacity 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
          }}
        >
          <RotateCw size={18} className={isRolling ? 'animate-spin' : ''} />
          <span>
            {isRolling ? 'Rolling...' : isMyTurnColor ? 'Roll Dice' : `Waiting for ${activeTurn.toUpperCase()}...`}
          </span>
        </button>
      </div>
    </div>
  );
}

