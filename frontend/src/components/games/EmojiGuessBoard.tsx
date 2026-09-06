import { useState } from 'react';
import { Lightbulb } from 'lucide-react';

interface BoardProps {
  state: any;
  onMove: (payload: any) => void;
}

export function EmojiGuessBoard({ state, onMove }: BoardProps) {
  const [input, setInput] = useState('');
  const hintPhrase = state?.hint || 'Movie Night & Popcorn';

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--pink-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <Lightbulb size={24} color="var(--gold)" /> Hint: {hintPhrase}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Guess the phrase..."
          className="input-field"
        />
        <button className="btn-primary" onClick={() => { onMove({ type: 'guess', text: input }); setInput(''); }}>
          Guess
        </button>
      </div>
    </div>
  );
}

