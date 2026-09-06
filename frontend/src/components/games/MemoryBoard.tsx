import { Image, HelpCircle } from 'lucide-react';

interface BoardProps {
  state: any;
  isMyTurn: boolean;
  onMove: (payload: any) => void;
}

export function MemoryBoard({ state, isMyTurn, onMove }: BoardProps) {
  const cards = state?.cards || Array(8).fill({ flipped: false, matched: false });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', width: '220px', margin: '0 auto' }}>
      {cards.map((card: any, idx: number) => (
        <button
          key={idx}
          disabled={!isMyTurn || card.flipped || card.matched}
          onClick={() => onMove({ type: 'flip_card', index: idx })}
          style={{
            height: '60px',
            borderRadius: 'var(--radius-card)',
            background: card.flipped || card.matched ? 'var(--pink-pale)' : 'var(--pink-primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: isMyTurn ? 'pointer' : 'default',
          }}
        >
          {card.flipped || card.matched ? <Image size={24} color="var(--pink-primary)" /> : <HelpCircle size={24} color="#ffffff" />}
        </button>
      ))}
    </div>
  );
}

