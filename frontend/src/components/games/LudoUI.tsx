import { useState } from 'react';
import { Dices } from 'lucide-react';

interface Props {
  gameState?: any;
  myRole: 'boyfriend' | 'girlfriend';
  isMyTurn: boolean;
  onMakeMove: (payload: any) => void;
}

interface Pawn {
  id: number;
  owner: 'boyfriend' | 'girlfriend';
  position: number; // -1 = Base, 0..27 = Track, 28 = Home Goal
}

const INITIAL_PAWNS: Pawn[] = [
  { id: 1, owner: 'boyfriend', position: -1 },
  { id: 2, owner: 'boyfriend', position: -1 },
  { id: 3, owner: 'boyfriend', position: -1 },
  { id: 4, owner: 'boyfriend', position: -1 },
  { id: 5, owner: 'girlfriend', position: -1 },
  { id: 6, owner: 'girlfriend', position: -1 },
  { id: 7, owner: 'girlfriend', position: -1 },
  { id: 8, owner: 'girlfriend', position: -1 },
];

export function LudoUI({ myRole, isMyTurn, onMakeMove }: Props) {
  const [pawns, setPawns] = useState<Pawn[]>(INITIAL_PAWNS);
  const [diceVal, setDiceVal] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [mustMovePawn, setMustMovePawn] = useState(false);

  const handleRollDice = () => {
    if (!isMyTurn || isRolling || mustMovePawn) return;
    setIsRolling(true);

    setTimeout(() => {
      const rolled = Math.floor(Math.random() * 6) + 1;
      setDiceVal(rolled);
      setIsRolling(false);

      // Check if any pawn can move
      const myPawns = pawns.filter((p) => p.owner === myRole);
      const canMove = myPawns.some((p) => (p.position === -1 && rolled === 6) || (p.position >= 0 && p.position + rolled <= 28));

      if (canMove) {
        setMustMovePawn(true);
      } else {
        // No moves possible -> next turn
        setMustMovePawn(false);
        onMakeMove({ type: 'passTurn' });
      }
    }, 600);
  };

  const handleMovePawn = (pawn: Pawn) => {
    if (!mustMovePawn || pawn.owner !== myRole || diceVal === null) return;

    let newPos = pawn.position;

    if (pawn.position === -1 && diceVal === 6) {
      newPos = 0; // Exit base to start tile
    } else if (pawn.position >= 0) {
      newPos = Math.min(28, pawn.position + diceVal);
    } else {
      return; // Cannot move this pawn
    }

    const updatedPawns = pawns.map((p) => {
      if (p.id === pawn.id) return { ...p, position: newPos };
      // Capture opponent pawn if landing on same position (except start or home)
      if (p.owner !== myRole && p.position === newPos && newPos > 0 && newPos < 28) {
        return { ...p, position: -1 };
      }
      return p;
    });

    setPawns(updatedPawns);
    setMustMovePawn(false);
    setDiceVal(null);

    // Check Win Condition (All 4 pawns at home goal 28)
    const myHomePawns = updatedPawns.filter((p) => p.owner === myRole && p.position === 28);
    if (myHomePawns.length === 4) {
      onMakeMove({ type: 'win', role: myRole });
      return;
    }

    onMakeMove({ type: 'movePawn', pawnId: pawn.id, newPos });
  };

  return (
    <div style={{ width: '100%', maxWidth: '850px', background: '#09070B', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(198,111,134,0.3)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', color: '#FFF5EF', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Info Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#FFF5EF', margin: 0 }}>
            Ludo Sanctuary — 2-Player Track
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#F0BAC6', fontStyle: 'italic' }}>
            Roll 6 to exit home base! Bring 4 pawns home to win
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#140A12', padding: '0.4rem 0.8rem', borderRadius: '99px', border: '1px solid rgba(198,111,134,0.2)', fontSize: '0.82rem' }}>
            <span style={{ color: '#C66F86', fontWeight: 600 }}>● Maulik (Rose)</span>
            <span style={{ color: '#A99FB0' }}>vs</span>
            <span style={{ color: '#E8A94C', fontWeight: 600 }}>● Seema (Gold)</span>
          </div>
        </div>
      </div>

      {/* Main Track & Stage Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'center' }}>
        
        {/* Left Side: Animated Physical Dice Roller */}
        <div style={{ background: '#140A12', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(198,111,134,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          
          <span style={{ fontSize: '0.85rem', color: '#FFF5EF', fontWeight: 600 }}>
            {isMyTurn ? (mustMovePawn ? 'Select Pawn to Move' : 'Roll the Dice!') : "Partner's Turn..."}
          </span>

          {/* 3D Dice Graphic */}
          <div style={{ width: '84px', height: '84px', background: '#FFF5EF', borderRadius: '18px', border: '3px solid #C66F86', boxShadow: '0 10px 25px rgba(198,111,134,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: '#391724', transform: isRolling ? 'rotate(360deg) scale(0.9)' : 'none', transition: 'transform 0.5s' }}>
            {isRolling ? <Dices size={36} color="#391724" /> : diceVal !== null ? diceVal : <Dices size={36} color="#391724" />}
          </div>

          <button
            disabled={!isMyTurn || isRolling || mustMovePawn}
            onClick={handleRollDice}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '99px',
              background: isMyTurn && !mustMovePawn ? '#C66F86' : '#21101B',
              border: 'none',
              color: '#FFF5EF',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: isMyTurn && !mustMovePawn ? 'pointer' : 'not-allowed',
              boxShadow: isMyTurn && !mustMovePawn ? '0 6px 20px rgba(198,111,134,0.5)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isRolling ? 'Rolling...' : mustMovePawn ? 'Move Pawn →' : <>ROLL DICE <Dices size={18} /></>}
          </button>
        </div>

        {/* Right Side: Track Grid & Pawn Base */}
        <div style={{ background: '#140A12', padding: '1.25rem', borderRadius: '20px', border: '1px solid rgba(198,111,134,0.3)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Bases Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0D090F', padding: '1rem', borderRadius: '14px' }}>
            {/* Maulik Base (Rose) */}
            <div>
              <span style={{ fontSize: '0.78rem', color: '#C66F86', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Maulik's Base</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {pawns.filter((p) => p.owner === 'boyfriend').map((p) => (
                  <button
                    key={p.id}
                    disabled={!mustMovePawn || myRole !== 'boyfriend' || (p.position === -1 && diceVal !== 6)}
                    onClick={() => handleMovePawn(p)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: p.position === 28 ? '#4CAF50' : p.position >= 0 ? '#C66F86' : '#86465C',
                      border: '2px solid #FFF5EF',
                      color: '#FFF5EF',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: p.position >= 0 ? '0 0 10px #C66F86' : 'none',
                    }}
                  >
                    {p.position === -1 ? 'BASE' : p.position === 28 ? 'HOME' : `S${p.position}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Seema Base (Gold) */}
            <div>
              <span style={{ fontSize: '0.78rem', color: '#E8A94C', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Seema's Base</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {pawns.filter((p) => p.owner === 'girlfriend').map((p) => (
                  <button
                    key={p.id}
                    disabled={!mustMovePawn || myRole !== 'girlfriend' || (p.position === -1 && diceVal !== 6)}
                    onClick={() => handleMovePawn(p)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: p.position === 28 ? '#4CAF50' : p.position >= 0 ? '#E8A94C' : '#9E681E',
                      border: '2px solid #FFF5EF',
                      color: '#FFF5EF',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: p.position >= 0 ? '0 0 10px #E8A94C' : 'none',
                    }}
                  >
                    {p.position === -1 ? 'BASE' : p.position === 28 ? 'HOME' : `S${p.position}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Track Progress Bar */}
          <div style={{ background: '#21101B', padding: '1rem', borderRadius: '14px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#F0BAC6', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
              Track Step Progress (0 → 28 Goal)
            </span>
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '0.4rem' }}>
              {Array.from({ length: 29 }).map((_, step) => {
                const pawnsHere = pawns.filter((p) => p.position === step);

                return (
                  <div key={step} style={{ minWidth: '24px', height: '36px', borderRadius: '6px', background: step === 0 ? '#C66F86' : step === 28 ? '#4CAF50' : '#140A12', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.55rem', color: '#A99FB0' }}>{step}</span>
                    {pawnsHere.length > 0 && (
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: pawnsHere[0].owner === 'boyfriend' ? '#FFF5EF' : '#E8A94C' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
