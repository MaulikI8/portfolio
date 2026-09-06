interface BoardProps {
  state: any;
  onMove: (payload: any) => void;
}

export function WouldYouRatherBoard({ state, onMove }: BoardProps) {
  const prompt = state?.prompt || {
    a: 'Travel the world forever together',
    b: 'Build a cozy dream house in the mountains',
  };

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>Would You Rather...</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button className="btn-secondary" onClick={() => onMove({ type: 'pick', option: 'A' })} style={{ padding: '1rem', borderRadius: 'var(--radius-card)' }}>
          A. {prompt.a}
        </button>
        <button className="btn-secondary" onClick={() => onMove({ type: 'pick', option: 'B' })} style={{ padding: '1rem', borderRadius: 'var(--radius-card)' }}>
          B. {prompt.b}
        </button>
      </div>
    </div>
  );
}
