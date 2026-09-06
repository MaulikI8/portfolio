import { X, Circle } from 'lucide-react';

interface BoardProps {
  state: any;
  myRole: string;
  isMyTurn: boolean;
  onMove: (payload: any) => void;
}

export function TicTacToeBoard({ state, isMyTurn, onMove }: BoardProps) {
  const grid: (string | null)[] = state?.grid || Array(9).fill(null);
  const winningLine: number[] | null = state?.winning_line || null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', width: '220px', margin: '0 auto' }}>
      {grid.map((cell, idx) => {
        const isWinningCell = winningLine?.includes(idx);

        return (
          <button
            key={idx}
            disabled={!isMyTurn || cell !== null}
            onClick={() => onMove({ type: 'clickCell', index: idx })}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-card)',
              border: isWinningCell ? '2px solid var(--pink-primary)' : '1.5px solid var(--pink-soft)',
              background: isWinningCell ? 'var(--pink-pale)' : 'var(--surface-card)',
              cursor: isMyTurn && cell === null ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {cell === 'boyfriend' ? (
              <X size={32} color="var(--pink-primary)" strokeWidth={3} />
            ) : cell === 'girlfriend' ? (
              <Circle size={28} color="var(--gold)" strokeWidth={3} />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

