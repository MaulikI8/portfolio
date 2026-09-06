interface BoardProps {
  state: any;
  isMyTurn: boolean;
  onMove: (payload: any) => void;
}

export function DotsBoxesBoard({ state, isMyTurn, onMove }: BoardProps) {
  const size = state?.grid_size || 4;
  const hLines = state?.h_lines || {};

  return (
    <div style={{ padding: '1rem', textAlign: 'center' }}>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>Connect dots to claim boxes</p>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)`, gap: '1rem', maxWidth: '240px', margin: '0 auto' }}>
        {Array.from({ length: size * size }).map((_, idx) => {
          const row = Math.floor(idx / size);
          const col = idx % size;
          const claimed = hLines[`${row}-${col}`];

          return (
            <button
              key={idx}
              disabled={!isMyTurn}
              onClick={() => onMove({ type: 'claim_line', orientation: 'h', row, col })}
              style={{
                height: '40px',
                borderRadius: 'var(--radius-card)',
                background: claimed ? 'var(--pink-primary)' : 'var(--pink-pale)',
                border: '1.5px solid var(--pink-soft)',
                cursor: isMyTurn ? 'pointer' : 'default',
              }}
            >
              •
            </button>
          );
        })}
      </div>
    </div>
  );
}
