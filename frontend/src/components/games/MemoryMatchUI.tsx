import { QuestionIcon, SparklesIcon, HeartIcon, CandleIcon, FlameIcon, LightningIcon, CrownIcon, FlowerIcon } from '../Icons';
import '../../SinglePageApp.css';

interface Props {
  gameState: {
    cards: { id: number; emoji: string; flipped: boolean; matched: boolean }[];
    scores: { boyfriend: number; girlfriend: number };
  };
  myRole: 'boyfriend' | 'girlfriend';
  isMyTurn: boolean;
  onMakeMove: (payload: any) => void;
}

export function MemoryMatchUI({ gameState, isMyTurn, onMakeMove }: Props) {
  const cards = gameState.cards || [];

  const getCardIcon = (id: number) => {
    const icons = [
      <HeartIcon key={1} size={28} color="var(--muted-rose)" fill="var(--muted-rose)" />,
      <CandleIcon key={2} size={28} color="var(--candlelight-amber)" />,
      <FlameIcon key={3} size={28} color="var(--candlelight-amber)" />,
      <LightningIcon key={4} size={28} color="#E8A94C" />,
      <CrownIcon key={5} size={28} color="var(--candlelight-amber)" />,
      <FlowerIcon key={6} size={28} color="var(--muted-rose)" />,
      <SparklesIcon key={7} size={28} color="var(--candlelight-amber)" />,
    ];
    return icons[id % icons.length];
  };

  return (
    <div className="memory-container">
      <div className="memory-grid">
        {cards.map((card, idx) => (
          <button
            key={card.id}
            className={`memory-card ${card.flipped || card.matched ? 'memory-card--flipped' : ''}`}
            disabled={!isMyTurn || card.flipped || card.matched}
            onClick={() => onMakeMove({ card_index: idx })}
          >
            {card.flipped || card.matched ? getCardIcon(card.id) : <QuestionIcon size={24} color="var(--grey-muted)" />}
          </button>
        ))}
      </div>
    </div>
  );
}
