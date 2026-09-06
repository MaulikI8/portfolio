import { Target } from 'lucide-react';

interface BoardProps {
  state: any;
  myRole: string;
  isMyTurn: boolean;
  onMove: (payload: any) => void;
}

export function BattleshipBoard({ state, isMyTurn, onMove }: BoardProps) {
  const phase = state?.phase || 'battle';
  const shots = state?.shots?.mine || [];

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
        {phase === 'setup' ? 'Place your ships on the grid' : 'Tap opponent grid to fire'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px', maxWidth: '280px', margin: '0 auto' }}>
        {Array.from({ length: 64 }).map((_, idx) => {
          const x = idx % 8;
          const y = Math.floor(idx / 8);
          const fired = shots.some((s: any) => s.x === x && s.y === y);

          return (
            <button
              key={idx}
              disabled={!isMyTurn || fired}
              onClick={() => onMove({ type: 'fire', x, y })}
              style={{
                aspectRatio: '1',
                borderRadius: '4px',
                border: '1px solid var(--pink-soft)',
                background: fired ? 'var(--pink-primary)' : 'var(--surface-card)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isMyTurn && !fired ? 'pointer' : 'default',
              }}
            >
              {fired ? <Target size={14} color="#ffffff" /> : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}

