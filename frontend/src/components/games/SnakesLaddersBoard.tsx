import { Dices } from 'lucide-react';

interface BoardProps {
  state: any;
  isMyTurn: boolean;
  onMove: (payload: any) => void;
}

export function SnakesLaddersBoard({ state, isMyTurn, onMove }: BoardProps) {
  const positions = state?.positions || { mine: 1, theirs: 1 };

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
        You: Square {positions.mine} | Partner: Square {positions.theirs}
      </p>
      <button className="btn-primary" disabled={!isMyTurn} onClick={() => onMove({ type: 'roll_dice' })} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <Dices size={18} /> Roll Dice
      </button>
    </div>
  );
}

