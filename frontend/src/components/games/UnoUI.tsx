import { useState } from 'react';

interface Props {
  gameState?: any;
  myRole: 'boyfriend' | 'girlfriend';
  isMyTurn: boolean;
  onMakeMove: (payload: any) => void;
}

interface UnoCard {
  id: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'wild';
  value: string;
}

const COLORS: ('red' | 'blue' | 'green' | 'yellow')[] = ['red', 'blue', 'green', 'yellow'];
const VALUES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+2', 'Skip'];

function generateInitialDeck(): UnoCard[] {
  const deck: UnoCard[] = [];
  let idCounter = 1;

  COLORS.forEach((color) => {
    VALUES.forEach((val) => {
      deck.push({ id: `c_${idCounter++}`, color, value: val });
    });
  });

  // Wild Cards
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `w_${idCounter++}`, color: 'wild', value: 'Wild' });
  }

  // Shuffle
  return deck.sort(() => Math.random() - 0.5);
}

export function UnoUI({ myRole, isMyTurn, onMakeMove }: Props) {
  const [deck, setDeck] = useState<UnoCard[]>(() => generateInitialDeck());
  const [myHand, setMyHand] = useState<UnoCard[]>(() => deck.slice(0, 7));
  const [partnerHandCount] = useState(7);
  const [discardPile, setDiscardPile] = useState<UnoCard[]>([
    { id: 'start_1', color: 'red', value: '7' },
  ]);
  const [activeColor, setActiveColor] = useState<'red' | 'blue' | 'green' | 'yellow'>('red');
  const [showWildPicker, setShowWildPicker] = useState(false);
  const [selectedWildCard, setSelectedWildCard] = useState<UnoCard | null>(null);
  const [unoSaid, setUnoSaid] = useState(false);

  const topCard = discardPile[discardPile.length - 1];

  const getColorHex = (c: string) => {
    switch (c) {
      case 'red':
        return '#DF4C5C';
      case 'blue':
        return '#3A86FF';
      case 'green':
        return '#38B000';
      case 'yellow':
        return '#FFBE0B';
      default:
        return '#C66F86';
    }
  };

  const isCardPlayable = (card: UnoCard) => {
    if (card.color === 'wild') return true;
    if (card.color === activeColor) return true;
    if (card.value === topCard.value) return true;
    return false;
  };

  const handlePlayCard = (card: UnoCard) => {
    if (!isMyTurn || !isCardPlayable(card)) return;

    if (card.color === 'wild') {
      setSelectedWildCard(card);
      setShowWildPicker(true);
      return;
    }

    executePlay(card, card.color as any);
  };

  const executePlay = (card: UnoCard, chosenColor: 'red' | 'blue' | 'green' | 'yellow') => {
    const newHand = myHand.filter((c) => c.id !== card.id);
    setMyHand(newHand);
    setDiscardPile([...discardPile, card]);
    setActiveColor(chosenColor);
    setShowWildPicker(false);
    setSelectedWildCard(null);

    if (newHand.length === 1) {
      setUnoSaid(true);
    }

    if (newHand.length === 0) {
      onMakeMove({ type: 'win', role: myRole });
      return;
    }

    onMakeMove({ type: 'playCard', card, chosenColor });
  };

  const handleDrawCard = () => {
    if (!isMyTurn || deck.length === 0) return;
    const drawn = deck[0];
    setDeck(deck.slice(1));
    setMyHand([...myHand, drawn]);
    onMakeMove({ type: 'drawCard' });
  };

  return (
    <div style={{ width: '100%', maxWidth: '850px', background: '#09070B', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(198,111,134,0.3)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', color: '#FFF5EF', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Info Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#FFF5EF', margin: 0 }}>
            UNO Classic — Sanctuary Deck
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#F0BAC6', fontStyle: 'italic' }}>
            Match color or number. First to 0 cards wins!
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#140A12', padding: '0.4rem 0.8rem', borderRadius: '99px', border: '1px solid rgba(198,111,134,0.2)', fontSize: '0.82rem' }}>
            <span>Active Color:</span>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: getColorHex(activeColor), boxShadow: `0 0 10px ${getColorHex(activeColor)}` }} />
          </div>
          {unoSaid && (
            <div style={{ background: '#DF4C5C', color: '#FFF5EF', fontWeight: 800, padding: '0.4rem 0.8rem', borderRadius: '99px', fontSize: '0.85rem', letterSpacing: '1px', animation: 'pulse 1s infinite' }}>
              UNO!
            </div>
          )}
        </div>
      </div>

      {/* Partner Hand Cards Representation */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
        <span style={{ fontSize: '0.78rem', color: '#A99FB0' }}>Partner's Hand ({partnerHandCount} cards)</span>
        <div style={{ display: 'flex', gap: '-10px', justifyContent: 'center' }}>
          {Array.from({ length: partnerHandCount }).map((_, i) => (
            <div key={i} style={{ width: '38px', height: '56px', borderRadius: '8px', background: '#21101B', border: '1px solid rgba(198,111,134,0.4)', marginLeft: i > 0 ? '-12px' : 0, boxShadow: '0 4px 10px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#C66F86', fontWeight: 'bold' }}>UNO</span>
            </div>
          ))}
        </div>
      </div>

      {/* Center Discard & Draw Tabletop */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', margin: '0.5rem 0' }}>
        
        {/* Draw Deck Stack */}
        <div onClick={handleDrawCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: isMyTurn ? 'pointer' : 'not-allowed' }}>
          <div style={{ width: '80px', height: '116px', borderRadius: '14px', background: '#21101B', border: '2px solid #C66F86', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', transition: 'transform 0.2s' }}>
            <span style={{ fontSize: '0.85rem', color: '#FFF5EF', fontWeight: 'bold' }}>DECK</span>
            <span style={{ fontSize: '0.7rem', color: '#F0BAC6', fontWeight: 600 }}>DRAW</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#A99FB0', marginTop: '0.4rem' }}>({deck.length} remaining)</span>
        </div>

        {/* Center Discard Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '116px', borderRadius: '14px', background: getColorHex(topCard.color), border: '2px solid #FFF5EF', boxShadow: `0 10px 30px ${getColorHex(topCard.color)}66`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', position: 'relative' }}>
            <span style={{ fontSize: '0.7rem', color: '#FFF5EF', position: 'absolute', top: '6px', left: '8px', fontWeight: 'bold' }}>{topCard.value}</span>
            <span style={{ fontSize: '1.8rem', color: '#FFF5EF', fontWeight: 800 }}>{topCard.value}</span>
            <span style={{ fontSize: '0.7rem', color: '#FFF5EF', position: 'absolute', bottom: '6px', right: '8px', fontWeight: 'bold' }}>{topCard.value}</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#F0BAC6', marginTop: '0.4rem', fontWeight: 600 }}>DISCARD PILE</span>
        </div>

      </div>

      {/* Wild Color Picker Modal */}
      {showWildPicker && selectedWildCard && (
        <div style={{ background: '#140A12', padding: '1rem', borderRadius: '16px', border: '1px solid #C66F86', textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#FFF5EF', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>
            Choose a new color for the Wild Card:
          </span>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => executePlay(selectedWildCard, c)}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: getColorHex(c),
                  border: '2px solid #FFF5EF',
                  cursor: 'pointer',
                  boxShadow: `0 0 12px ${getColorHex(c)}`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Player Hand Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#FFF5EF', fontWeight: 600 }}>
            Your Cards ({myHand.length})
          </span>
          {isMyTurn && (
            <span style={{ fontSize: '0.8rem', color: '#C66F86', fontStyle: 'italic', animation: 'pulse 1.5s infinite' }}>
              Your turn — select a card to play
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', width: '100%', padding: '0.5rem 0.2rem', justifyContent: 'center' }}>
          {myHand.map((card) => {
            const playable = isMyTurn && isCardPlayable(card);
            const cardBg = getColorHex(card.color);

            return (
              <div
                key={card.id}
                onClick={() => handlePlayCard(card)}
                style={{
                  minWidth: '72px',
                  height: '108px',
                  borderRadius: '12px',
                  background: cardBg,
                  border: playable ? '2px solid #FFF5EF' : '1px solid rgba(255,255,255,0.2)',
                  boxShadow: playable ? `0 8px 20px ${cardBg}88` : '0 4px 10px rgba(0,0,0,0.4)',
                  cursor: playable ? 'pointer' : 'not-allowed',
                  opacity: playable ? 1 : 0.6,
                  transform: playable ? 'translateY(-4px)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px',
                  position: 'relative',
                  userSelect: 'none',
                }}
              >
                <span style={{ fontSize: '0.65rem', color: '#FFF5EF', alignSelf: 'flex-start', fontWeight: 'bold' }}>{card.value}</span>
                <span style={{ fontSize: '1.4rem', color: '#FFF5EF', fontWeight: 800 }}>{card.value}</span>
                <span style={{ fontSize: '0.65rem', color: '#FFF5EF', alignSelf: 'flex-end', fontWeight: 'bold' }}>{card.value}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

