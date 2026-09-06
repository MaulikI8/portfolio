interface BoardProps {
  state: any;
  onMove: (payload: any) => void;
}

export function TwoTruthsBoard({ state, onMove }: BoardProps) {
  const statements = state?.statements || [
    'I love coffee over tea',
    'I have visited 10 countries',
    'My favorite color is pink',
  ];

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>Spot the lie among the three statements:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {statements.map((stmt: string, idx: number) => (
          <button key={idx} className="btn-secondary" onClick={() => onMove({ type: 'guess', index: idx })} style={{ textAlign: 'left', padding: '0.85rem', borderRadius: 'var(--radius-card)' }}>
            {idx + 1}. {stmt}
          </button>
        ))}
      </div>
    </div>
  );
}
