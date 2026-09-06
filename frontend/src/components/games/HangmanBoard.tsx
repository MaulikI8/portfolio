interface BoardProps {
  state: any;
  isMyTurn: boolean;
  onMove: (payload: any) => void;
}

export function HangmanBoard({ state, isMyTurn, onMove }: BoardProps) {
  const guessed = state?.guessed_letters || ['A', 'E'];

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <div style={{ fontSize: '1.75rem', letterSpacing: '0.5rem', fontFamily: 'monospace', marginBottom: '1.25rem', color: 'var(--ink)' }}>
        H _ N G M _ N
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', justifyContent: 'center', maxWidth: '280px', margin: '0 auto' }}>
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => {
          const isUsed = guessed.includes(letter);
          return (
            <button
              key={letter}
              disabled={!isMyTurn || isUsed}
              onClick={() => onMove({ type: 'guess_letter', letter })}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '4px',
                border: '1px solid var(--pink-soft)',
                background: isUsed ? 'var(--pink-pale)' : 'var(--surface-card)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: isMyTurn && !isUsed ? 'pointer' : 'default',
              }}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
