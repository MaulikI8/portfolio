import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getSocketInstance } from '../../hooks/useSocket';
import { Clock, Signal, Sparkles, Bell, Trophy, RotateCw } from 'lucide-react';
import { Dice3D } from '../Dice3D';

interface BoardProps { state?: any; myRole?: string; isMyTurn?: boolean; onMove?: (payload: any) => void; }
export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';
export interface Pawn { id: number; color: PlayerColor; pos: number; }

export const MAIN_TRACK_COORDS: [number, number][] = [
  [7, 2],  [7, 3],  [7, 4],  [7, 5],  [7, 6],  [6, 7],  [5, 7],  [4, 7],  [3, 7],  [2, 7],  [1, 7],  [1, 8],  [1, 9],
  [2, 9],  [3, 9],  [4, 9],  [5, 9],  [6, 9],  [7, 10], [7, 11], [7, 12], [7, 13], [7, 14], [7, 15], [8, 15],
  [9, 15], [9, 14], [9, 13], [9, 12], [9, 11], [9, 10], [10, 9], [11, 9], [12, 9], [13, 9], [14, 9], [15, 9], [15, 8],
  [15, 7], [14, 7], [13, 7], [12, 7], [11, 7], [10, 7], [9, 6],  [9, 5],  [9, 4],  [9, 3],  [9, 2],  [9, 1],  [8, 1], [7, 1]
];

export const START_INDICES: Record<PlayerColor, number> = { red: 0, green: 13, yellow: 26, blue: 39 };
export const SAFE_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export const HOME_STRETCH_COORDS: Record<PlayerColor, [number, number][]> = {
  red:    [[8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7]],
  green:  [[2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8]],
  yellow: [[8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9]],
  blue:   [[14, 8], [13, 8], [12, 8], [11, 8], [10, 8], [9, 8]],
};

export const COLOR_HEX: Record<PlayerColor, string> = { red: '#FF4D6D', green: '#10B981', yellow: '#F59E0B', blue: '#3B82F6' };
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

  const [isWaitingForPartner, setIsWaitingForPartner] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [player1Color, setPlayer1Color] = useState<PlayerColor>('red');
  const [player2Color, setPlayer2Color] = useState<PlayerColor>('yellow');
  const activeColors: PlayerColor[] = [player1Color, player2Color];

  const [activeTurn, setActiveTurn] = useState<PlayerColor>('red');
  const [diceVal, setDiceVal] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [hasRolled, setHasRolled] = useState<boolean>(state?.hasRolled || false);
  const [sixesCount, setSixesCount] = useState<number>(0);
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [alertMsg, setAlertMsg] = useState<string>('Roll 3D dice to start!');
  const [animatingPawnKey, setAnimatingPawnKey] = useState<string | null>(null);
  const [animType, setAnimType] = useState<'unlock' | 'hop' | null>(null);
  const settleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [blunderState, setBlunderState] = useState<Record<PlayerColor, boolean>>({ red: false, green: false, yellow: false, blue: false });

  const [pawns, setPawns] = useState<Pawn[]>(() => {
    const initial: Pawn[] = []; ALL_COLORS.forEach((color) => { for (let i = 0; i < 4; i++) initial.push({ id: i, color, pos: -1 }); }); return initial;
  });

  useEffect(() => {
    const socket = getSocketInstance(); socket.emit('ludo_join', { role: myRole });
    const handleLudoAction = (data: any) => {
      if (data.fromRole === myRole) return;
      if (data.type === 'roll_dice') { setDiceVal(data.dice); setHasRolled(true); setIsRolling(false); setIsWaitingForPartner(false); }
      else if (data.type === 'move_pawn') { setPawns((prev) => prev.map((p) => (p.id === data.pawnId && p.color === data.color ? { ...p, pos: data.newPos } : p))); setIsWaitingForPartner(false); }
      else if (data.type === 'pass_turn') { setActiveTurn(data.nextTurn); setHasRolled(false); setSixesCount(0); setDiceVal(1); setAlertMsg(`Turn passed to ${data.nextTurn.toUpperCase()}!`); setIsWaitingForPartner(false); }
    };
    const handlePlayerJoined = () => setIsWaitingForPartner(false);
    socket.on('ludo_action', handleLudoAction); socket.on('ludo_player_joined', handlePlayerJoined);
    return () => { socket.off('ludo_action', handleLudoAction); socket.off('ludo_player_joined', handlePlayerJoined); };
  }, [myRole]);

  useEffect(() => { if (state?.pawns) setPawns(state.pawns); if (state?.activeTurn) setActiveTurn(state.activeTurn); if (state?.dice !== undefined) setDiceVal(state.dice); }, [state]);

  const notify = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3200); };
  const isMyTurnColor = activeTurn === myColor;
  const canRoll = isMyTurnColor && !hasRolled && !isWaitingForPartner && !winner && !animatingPawnKey;

  const calculateStrategicDiceRoll = (color: PlayerColor): number => {
    if (Math.random() < 0.5) return Math.floor(Math.random() * 6) + 1;
    const currentPawns = pawns.filter((p) => p.color === color);
    const opponentColor = activeColors.find((c) => c !== color) || player2Color;
    const opponentPawns = pawns.filter((p) => p.color === opponentColor);
    if (currentPawns.every((p) => p.pos === -1) && Math.random() < 0.35) return 6;
    for (const p of currentPawns) {
      if (p.pos >= 0 && p.pos <= 50) {
        const myTrackIdx = (START_INDICES[p.color] + p.pos) % 52;
        for (const oppP of opponentPawns) {
          if (oppP.pos >= 0 && oppP.pos <= 50) {
            const oppTrackIdx = (START_INDICES[oppP.color] + oppP.pos) % 52;
            const dist = (oppTrackIdx - myTrackIdx + 52) % 52;
            if (dist >= 1 && dist <= 6 && !SAFE_INDICES.has(oppTrackIdx) && !blunderState[color] && Math.random() < 0.3) return dist;
          }
        }
      }
    }
    return Math.floor(Math.random() * 6) + 1;
  };

  const handleRollDice = () => {
    if (isRolling || hasRolled || !canRoll || winner || animatingPawnKey) return;
    setIsRolling(true); setAlertMsg('Rolling 3D dice...');
    const rolled = calculateStrategicDiceRoll(activeTurn); setDiceVal(rolled);
    if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
    settleTimeoutRef.current = setTimeout(() => handleDiceSettled(rolled), 750);
  };

  const handleDiceSettled = (rolledVal: number) => {
    if (settleTimeoutRef.current) { clearTimeout(settleTimeoutRef.current); settleTimeoutRef.current = null; }
    setIsRolling(false); setHasRolled(true);
    if (rolledVal === 6) {
      const nextSixes = sixesCount + 1; setSixesCount(nextSixes);
      if (nextSixes >= 3) { setSixesCount(0); setAlertMsg('Rolled 3 sixes! Turn forfeited.'); setTimeout(() => passTurn(), 1400); return; }
    } else setSixesCount(0);

    const currentPawns = pawns.filter((p) => p.color === activeTurn);
    if (!currentPawns.some((p) => canPawnMove(p, rolledVal))) {
      setAlertMsg(`Rolled ${rolledVal}! No legal move — passing turn...`);
      setTimeout(() => passTurn(), 1300);
    } else {
      setAlertMsg(rolledVal === 6 ? `Rolled 6! Click token to unlock/move (Bonus Roll!)` : `Rolled ${rolledVal}! Click token to move.`);
    }
    if (onMove) onMove({ type: 'roll_dice', dice: rolledVal });
    getSocketInstance().emit('ludo_action', { type: 'roll_dice', dice: rolledVal });
  };

  const canPawnMove = (pawn: Pawn, roll: number): boolean => {
    if (!pawn || pawn.color !== myColor || !isMyTurnColor) return false;
    if (pawn.pos === 56) return false;
    if (pawn.pos === -1) return roll === 6;
    return pawn.pos + roll <= 56;
  };

  const handlePawnClick = (pawn: Pawn) => {
    if (!hasRolled || !diceVal || isRolling || winner || animatingPawnKey || !canPawnMove(pawn, diceVal)) return;
    const pawnKey = `${pawn.color}_${pawn.id}`; const isUnlocking = pawn.pos === -1;
    const targetPos = isUnlocking ? 0 : pawn.pos + diceVal; const currentRoll = diceVal;
    setHasRolled(false); setAnimatingPawnKey(pawnKey);

    if (isUnlocking) {
      setAnimType('unlock');
      setTimeout(() => setPawns((prev) => prev.map((p) => (p.color === pawn.color && p.id === pawn.id ? { ...p, pos: 0 } : p))), 200);
      setTimeout(() => { setAnimatingPawnKey(null); setAnimType(null); finalizeMoveDestination(pawn, 0, currentRoll); }, 650);
    } else {
      setAnimType('hop'); let currentStepPos = pawn.pos; let stepCount = 0;
      const stepInterval = setInterval(() => {
        stepCount++; currentStepPos++;
        setPawns((prev) => prev.map((p) => (p.color === pawn.color && p.id === pawn.id ? { ...p, pos: currentStepPos } : p)));
        if (stepCount >= currentRoll) { clearInterval(stepInterval); setAnimatingPawnKey(null); setAnimType(null); finalizeMoveDestination(pawn, targetPos, currentRoll); }
      }, 200);
    }
  };

  const finalizeMoveDestination = (pawn: Pawn, newPos: number, rolledVal: number) => {
    let capturedOpponent = false; const opponentColor = activeColors.find((c) => c !== pawn.color) || player2Color;
    const updatedPawns = pawns.map((p) => {
      if (p.color === pawn.color && p.id === pawn.id) return { ...p, pos: newPos };
      if (newPos >= 0 && newPos <= 50 && p.color !== pawn.color && activeColors.includes(p.color) && p.pos >= 0 && p.pos <= 50) {
        const pTrackIdx = (START_INDICES[pawn.color] + newPos) % 52; const oppTrackIdx = (START_INDICES[p.color] + p.pos) % 52;
        if (pTrackIdx === oppTrackIdx && !SAFE_INDICES.has(pTrackIdx)) { capturedOpponent = true; return { ...p, pos: -1 }; }
      }
      return p;
    });
    setPawns(updatedPawns);
    if (updatedPawns.filter((p) => p.color === pawn.color && p.pos === 56).length === 4) {
      setWinner(pawn.color); setAlertMsg(`🏆 ${pawn.color.toUpperCase()} HAS WON! 🎉`); return;
    }
    if (capturedOpponent) { setAlertMsg(`💥 CAPTURED ${opponentColor.toUpperCase()} TOKEN! Roll again!`); return; }
    if (rolledVal === 6) { setAlertMsg(`🎲 Rolled a 6! Roll again!`); return; }
    passTurn();
    if (onMove) onMove({ type: 'move_pawn', pawnId: pawn.id, color: pawn.color, newPos });
    getSocketInstance().emit('ludo_action', { type: 'move_pawn', pawnId: pawn.id, color: pawn.color, newPos });
  };

  const passTurn = (manualNextTurn?: PlayerColor) => {
    setHasRolled(false); setSixesCount(0); const nextPlayer = manualNextTurn || activeColors[(activeColors.indexOf(activeTurn) + 1) % activeColors.length];
    setActiveTurn(nextPlayer); setAlertMsg(`Turn passed to ${nextPlayer.toUpperCase()}!`);
    getSocketInstance().emit('ludo_action', { type: 'pass_turn', nextTurn: nextPlayer, fromRole: myRole });
  };

  const getPawnLocation = (pawn: Pawn) => {
    if (pawn.pos === -1) return { type: 'yard', key: `yard_${pawn.color}_${pawn.id}` };
    if (pawn.pos >= 0 && pawn.pos <= 50) { const [r, c] = MAIN_TRACK_COORDS[(START_INDICES[pawn.color] + pawn.pos) % 52]; return { type: 'track', key: `${r}_${c}` }; }
    if (pawn.pos >= 51 && pawn.pos <= 56) { const [r, c] = HOME_STRETCH_COORDS[pawn.color][Math.min(pawn.pos - 51, 5)]; return { type: 'track', key: `${r}_${c}` }; }
    return { type: 'track', key: '8_8' };
  };

  const pawnsOnTrack: Record<string, Pawn[]> = {};
  pawns.forEach((p) => { const loc = getPawnLocation(p); if (loc.type === 'track') { if (!pawnsOnTrack[loc.key]) pawnsOnTrack[loc.key] = []; pawnsOnTrack[loc.key].push(p); } });

  const renderPawn = (pawn: Pawn) => {
    const pawnKey = `${pawn.color}_${pawn.id}`; const isAnimating = animatingPawnKey === pawnKey;
    const isClickable = hasRolled && diceVal !== null && pawn.color === activeTurn && canPawnMove(pawn, diceVal) && !winner && !animatingPawnKey;
    return (
      <div key={pawnKey} className={`ludo-pawn ${isClickable ? 'pawn-active' : ''}`} style={{ background: PAWN_GRADIENTS[pawn.color], width: '92%', height: '92%', borderRadius: '50%', border: '3px solid #FFF', boxShadow: isClickable ? '0 0 24px #FFD700' : '0 6px 14px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isClickable ? 'pointer' : 'default', zIndex: isClickable || isAnimating ? 60 : 10, position: 'relative' }} onClick={(e) => { e.stopPropagation(); if (isClickable) handlePawnClick(pawn); }}>
        {isClickable && <div style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '1rem', animation: 'pointerBounce 0.8s infinite ease-in-out' }}>✨</div>}
        <div style={{ width: '46%', height: '46%', borderRadius: '50%', background: '#FFF' }} />
      </div>
    );
  };

  const renderYard = (color: PlayerColor, gridRow: string, gridCol: string) => {
    const isActiveYard = activeColors.includes(color);
    return (
      <div style={{ gridRow, gridColumn: gridCol, padding: '10%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isActiveYard ? 1 : 0.4 }}>
        <div style={{ width: '100%', height: '100%', background: '#FFF', borderRadius: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', padding: '12%', gap: '12%' }}>
          {isActiveYard ? [0, 1, 2, 3].map((slotIdx) => {
            const yardPawn = pawns.find((p) => p.color === color && p.id === slotIdx && p.pos === -1);
            return <div key={slotIdx} style={{ background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #CBD5E1', position: 'relative' }}>{yardPawn && renderPawn(yardPawn)}</div>;
          }) : <div style={{ gridColumn: '1 / 3', gridRow: '1 / 3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '0.72rem', fontWeight: 700 }}>Empty</div>}
        </div>
      </div>
    );
  };

  const renderTrackCell = (r: number, c: number) => {
    const key = `${r}_${c}`; let cellStyle: React.CSSProperties = {}; let cellContent: React.ReactNode = null;
    if (r === 8 && c >= 2 && c <= 6) cellStyle.background = '#FF8FA3'; if (c === 8 && r >= 2 && r <= 6) cellStyle.background = '#6EE7B7';
    if (r === 8 && c >= 10 && c <= 14) cellStyle.background = '#FCD34D'; if (c === 8 && r >= 10 && r <= 14) cellStyle.background = '#93C5FD';
    if (r === 7 && c === 2) cellStyle.background = '#FF4D6D'; if (r === 2 && c === 9) cellStyle.background = '#10B981';
    if (r === 9 && c === 14) cellStyle.background = '#F59E0B'; if (r === 14 && c === 7) cellStyle.background = '#3B82F6';
    const trackIdx = MAIN_TRACK_COORDS.findIndex(([tr, tc]) => tr === r && tc === c);
    if (trackIdx !== -1 && SAFE_INDICES.has(trackIdx)) cellContent = <span className="star-icon">⭐</span>;
    const pawnsHere = pawnsOnTrack[key] || [];

    return (
      <div key={key} className="ludo-cell" style={{ gridRow: r, gridColumn: c, ...cellStyle }}>
        {cellContent}
        {pawnsHere.length > 0 && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {pawnsHere.map((p, idx) => (
              <div key={`${p.color}_${p.id}`} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: pawnsHere.length > 1 ? `translate(${idx * 3 - 3}px, ${idx * 3 - 3}px) scale(0.85)` : 'none' }}>
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
    <div style={{ width: '100vw', height: '100vh', background: 'var(--bg-app, #0d0b14)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: 'max(0.4rem, 1vh) max(0.75rem, 1.5vw)', boxSizing: 'border-box', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes pawnGlowPulse { 0% { transform: scale(1); box-shadow: 0 0 12px #FFD700; } 50% { transform: scale(1.15); box-shadow: 0 0 24px #FFD700; } 100% { transform: scale(1); box-shadow: 0 0 12px #FFD700; } }
        @keyframes pointerBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .pawn-active { animation: pawnGlowPulse 1.2s infinite ease-in-out !important; }
      `}</style>

      {toastMsg && <div style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, var(--coral-primary) 0%, var(--magenta-deep) 100%)', color: '#FFF', padding: '0.65rem 1.25rem', borderRadius: '99px', fontWeight: 700, fontSize: '0.88rem', zIndex: 999999 }}>{toastMsg}</div>}

      {winner && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 6, 14, 0.88)', padding: '1.25rem' }}>
          <div style={{ maxWidth: '420px', width: '100%', background: 'var(--surface-card)', borderRadius: '28px', border: `3px solid ${COLOR_HEX[winner]}`, padding: '2.25rem 1.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: COLOR_HEX[winner], display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trophy size={36} color="#FFF" /></div>
            <h2>{winner.toUpperCase()} VICTORIOUS!</h2>
            <button className="btn-primary" onClick={() => { const initial: Pawn[] = []; ALL_COLORS.forEach((color) => { for (let i = 0; i < 4; i++) initial.push({ id: i, color, pos: -1 }); }); setPawns(initial); setWinner(null); setHasRolled(false); setActiveTurn(player1Color); }} style={{ width: '100%', padding: '0.9rem', borderRadius: '99px', background: COLOR_HEX[winner], color: '#FFF', border: 'none', fontWeight: 700 }}>Play Again</button>
          </div>
        </div>
      )}

      {isWaitingForPartner && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 6, 14, 0.88)', padding: '1.25rem' }}>
          <div style={{ maxWidth: '460px', width: '100%', background: 'var(--surface-card)', borderRadius: '28px', padding: '2rem 1.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <Clock size={32} color="var(--coral-primary)" />
            <h2>Waiting for partner...</h2>
            <button className="btn-primary" onClick={() => setIsWaitingForPartner(false)} style={{ width: '100%', padding: '0.85rem', borderRadius: '99px', background: 'var(--coral-primary)', color: '#FFF', border: 'none', fontWeight: 700 }}>Start Match</button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '540px', background: 'var(--surface-card)', padding: '0.65rem 1.1rem', borderRadius: '99px' }}>
        <div>Turn: <strong style={{ color: COLOR_HEX[activeTurn] }}>{activeTurn.toUpperCase()}</strong></div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{alertMsg}</div>
      </div>

      {/* Ludo Board 15x15 */}
      <div style={{ width: 'min(88vw, 64vh)', height: 'min(88vw, 64vh)', aspectRatio: '1 / 1', background: '#FFF', border: '4px solid var(--ink-deep)', borderRadius: '24px', overflow: 'hidden', padding: '3px', boxSizing: 'border-box' }}>
        <div className="ludo-grid">
          {renderYard('red', '1 / 7', '1 / 7')} {renderYard('green', '1 / 7', '10 / 16')}
          {renderYard('blue', '10 / 16', '1 / 7')} {renderYard('yellow', '10 / 16', '10 / 16')}
          <div className="center-home" style={{ gridRow: '7 / 10', gridColumn: '7 / 10' }}><Trophy size={28} color="#FFD700" /></div>
          {trackCells.map(([r, c]) => renderTrackCell(r, c))}
        </div>
      </div>

      {/* 3D Dice and Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
        <div onClick={handleRollDice} style={{ cursor: canRoll && !hasRolled && !isRolling && !winner ? 'pointer' : 'default' }}>
          <Dice3D rolling={isRolling} result={diceVal} onSettled={handleDiceSettled} size={135} />
        </div>
        <button disabled={!canRoll || hasRolled || isRolling || !!winner} onClick={handleRollDice} style={{ padding: '0.85rem 1.85rem', borderRadius: '99px', background: `linear-gradient(135deg, ${COLOR_HEX[activeTurn]} 0%, #1A0E24 100%)`, color: '#FFF', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: canRoll && !hasRolled && !isRolling && !winner ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <RotateCw size={18} className={isRolling ? 'animate-spin' : ''} />
          <span>{isRolling ? 'Rolling...' : isMyTurnColor ? 'Roll Dice' : `Waiting for ${activeTurn.toUpperCase()}...`}</span>
        </button>
      </div>
    </div>
  );
}
