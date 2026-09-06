import { useState } from 'react';
import { Palette } from 'lucide-react';

interface BoardProps {
  state: any;
  myRole: string;
  onMove: (payload: any) => void;
}

export function DrawGuessBoard({ state, myRole, onMove }: BoardProps) {
  const isDrawer = state?.drawer === myRole;
  const [guess, setGuess] = useState('');

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;
    onMove({ type: 'guess', text: guess.trim() });
    setGuess('');
  };

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
        {isDrawer ? `Draw the secret word: ${state?.word || 'SUNFLOWER'}` : 'Guess what your partner is drawing!'}
      </p>

      {/* Canvas Placeholder */}
      <div style={{ width: '100%', height: '180px', background: '#FFFFFF', border: '1.5px solid var(--pink-soft)', borderRadius: 'var(--radius-card)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--muted)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Palette size={18} color="var(--pink-primary)" /> Real-time Canvas
        </span>
      </div>

      {!isDrawer && (
        <form onSubmit={handleGuessSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="text" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Type your guess..." className="input-field" />
          <button type="submit" className="btn-primary">Guess</button>
        </form>
      )}
    </div>
  );
}

