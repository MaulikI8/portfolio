interface BoardProps {
  state: any;
  isMyTurn: boolean;
  onMove: (payload: any) => void;
}

export function Connect4Board({ state, isMyTurn, onMove }: BoardProps) {
  const grid = state?.grid || Array(42).fill(null);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', maxWidth: '260px', margin: '0 auto', background: 'var(--pink-soft)', padding: '6px', borderRadius: 'var(--radius-card)' }}>
        {grid.map((cell: string | null, idx: number) => {
          const col = idx % 7;
          return (
            <button
              key={idx}
              disabled={!isMyTurn}
              onClick={() => onMove({ type: 'drop_disc', column: col })}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: cell === 'boyfriend' ? 'var(--pink-primary)' : cell === 'girlfriend' ? 'var(--gold)' : '#FFFFFF',
                border: 'none',
                cursor: isMyTurn ? 'pointer' : 'default',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
