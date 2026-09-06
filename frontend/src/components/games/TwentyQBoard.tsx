import { useState } from 'react';

interface BoardProps {
  state: any;
  myRole: string;
  onMove: (payload: any) => void;
}

export function TwentyQBoard({ state, myRole, onMove }: BoardProps) {
  const isAsker = state?.asker === myRole;
  const [qText, setQText] = useState('');

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
        Questions left: {state?.questions_left ?? 20}
      </p>

      {isAsker ? (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder="Ask a Yes/No question..."
            className="input-field"
          />
          <button className="btn-primary" onClick={() => { onMove({ type: 'ask', text: qText }); setQText(''); }}>
            Ask
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          {['Yes', 'No', 'Sometimes'].map((val) => (
            <button key={val} className="btn-secondary" onClick={() => onMove({ type: 'answer', value: val })}>
              {val}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
