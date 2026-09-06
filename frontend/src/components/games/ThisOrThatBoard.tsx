interface BoardProps {
  state: any;
  onMove: (payload: any) => void;
}

export function ThisOrThatBoard({ state, onMove }: BoardProps) {
  const index = state?.index || 0;
  const prompts = state?.prompts || [
    { a: 'Coffee', b: 'Tea' },
    { a: 'Beach', b: 'Mountains' },
    { a: 'Night Owl', b: 'Early Bird' },
  ];
  const current = prompts[index % prompts.length];

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>
        Question {index + 1} of {prompts.length}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button className="btn-primary" onClick={() => onMove({ type: 'pick', prompt_index: index, choice: 'A' })}>
          {current.a}
        </button>
        <button className="btn-secondary" onClick={() => onMove({ type: 'pick', prompt_index: index, choice: 'B' })}>
          {current.b}
        </button>
      </div>
    </div>
  );
}
