interface BoardProps {
  state: any;
  isMyTurn: boolean;
  onMove: (payload: any) => void;
}

export function TriviaDuelBoard({ state, onMove }: BoardProps) {
  const question = state?.current_q || {
    text: 'What was our first movie date together?',
    options: ['Inception', 'La La Land', 'Interstellar', 'The Notebook'],
  };

  return (
    <div style={{ padding: '1rem', textAlign: 'center', width: '100%' }}>
      <h3 style={{ fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1.25rem', fontFamily: 'var(--font-display)' }}>
        {question.text}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        {question.options.map((opt: string, idx: number) => (
          <button
            key={idx}
            onClick={() => onMove({ type: 'answer', option_index: idx })}
            className="btn-secondary"
            style={{ padding: '0.85rem', textAlign: 'center', borderRadius: 'var(--radius-card)' }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
