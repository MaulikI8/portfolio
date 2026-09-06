import { useState } from 'react';

interface BoardProps {
  state: any;
  onMove: (payload: any) => void;
}

export function CoinFlipBoard({ state, onMove }: BoardProps) {
  const [flipping, setFlipping] = useState(false);
  const result = state?.result || 'HEADS';

  const handleFlip = () => {
    setFlipping(true);
    setTimeout(() => {
      setFlipping(false);
      onMove({ type: 'flip' });
    }, 600);
  };

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--gold) 0%, #D49A3E 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          fontSize: '1.2rem',
          fontWeight: 700,
          boxShadow: 'var(--shadow-card)',
          transform: flipping ? 'rotateY(720deg)' : 'none',
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {flipping ? '🪙' : result}
      </div>

      <button className="btn-primary" onClick={handleFlip} disabled={flipping}>
        Flip Coin 🪙
      </button>
    </div>
  );
}
