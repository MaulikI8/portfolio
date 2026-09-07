// Authoritative Server-Side UNO Engine (Node.js)
const CARD_COLORS = ['red', 'blue', 'green', 'yellow'];
const CARD_VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', '+2'];

class IllegalMoveError extends Error {
  constructor(message) {
    super(message);
    this.name = 'IllegalMoveError';
  }
}

function buildDeck() {
  const deck = [];
  let cid = 1;
  CARD_COLORS.forEach((color) => {
    CARD_VALUES.forEach((value) => {
      deck.push({ id: `c_${cid++}`, color, value });
      if (value !== '0') {
        deck.push({ id: `c_${cid++}`, color, value });
      }
    });
  });

  for (let i = 0; i < 4; i++) {
    deck.push({ id: `c_${cid++}`, color: 'wild', value: 'Wild' });
    deck.push({ id: `c_${cid++}`, color: 'wild', value: '+4' });
  }

  // Fisher-Yates Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

function newGame() {
  const deck = buildDeck();
  const hands = {
    boyfriend: deck.slice(0, 7),
    girlfriend: deck.slice(7, 14),
  };
  const drawPile = deck.slice(14);

  let topCardIdx = drawPile.findIndex((c) => c.color !== 'wild');
  if (topCardIdx === -1) topCardIdx = 0;
  const topCard = drawPile.splice(topCardIdx, 1)[0];

  return {
    drawPile,
    hands,
    discardPile: [topCard],
    currentColor: topCard.color,
    turn: 'boyfriend',
    pendingDraw: 0,
    isGameActive: true,
    unoCalled: { boyfriend: false, girlfriend: false },
  };
}

function isPlayable(card, state) {
  if (!card) return false;
  if (state.pendingDraw > 0) {
    const top = state.discardPile[state.discardPile.length - 1];
    if (card.value === '+2') return top && top.value === '+2';
    if (card.value === '+4') return top && top.value === '+4';
    return false;
  }
  const top = state.discardPile[state.discardPile.length - 1];
  if (card.color === 'wild') return true;
  if (card.color === state.currentColor) return true;
  if (top && card.value === top.value) return true;
  return false;
}

function applyMove(state, role, move) {
  if (!state.isGameActive) {
    if (state.hands && ((state.hands.boyfriend && state.hands.boyfriend.length > 0) || (state.hands.girlfriend && state.hands.girlfriend.length > 0))) {
      state.isGameActive = true;
    } else {
      throw new IllegalMoveError('Game is not active');
    }
  }

  if (!state.unoCalled) {
    state.unoCalled = { boyfriend: false, girlfriend: false };
  }

  const action = move.action || move.type;
  const opponent = role === 'boyfriend' ? 'girlfriend' : 'boyfriend';

  // 1. CALL UNO ACTION
  if (action === 'call_uno' || action === 'callUno') {
    if (state.hands[role].length !== 1) {
      throw new IllegalMoveError('Can only call UNO when you have exactly 1 card');
    }
    state.unoCalled[role] = true;
    return { state, winner: null };
  }

  // 2. CALL OUT ACTION
  if (action === 'call_out' || action === 'callOut') {
    const targetRole = move.targetRole || opponent;
    const targetHand = state.hands[targetRole];
    const forgotToCall = targetHand && targetHand.length === 1 && !state.unoCalled[targetRole];
    if (forgotToCall) {
      for (let i = 0; i < 2; i++) {
        if (state.drawPile.length === 0) {
          const top = state.discardPile.pop();
          state.drawPile = state.discardPile.reverse();
          state.discardPile = [top];
        }
        if (state.drawPile.length > 0) {
          targetHand.push(state.drawPile.shift());
        }
      }
      state.unoCalled[targetRole] = false;
    } else {
      throw new IllegalMoveError('That call-out was not valid — target already called UNO or does not have 1 card');
    }
    return { state, winner: null };
  }

  // 3. JUMP IN ACTION (can steal turn out-of-turn if exact card color & value matches top discard)
  if (action === 'jump_in' || action === 'jumpIn') {
    const hand = state.hands[role];
    const cardId = move.card_id || move.cardId || (move.card && move.card.id);
    let cardIdx = hand.findIndex((c) => c.id === cardId);
    if (cardIdx === -1 && move.card) {
      cardIdx = hand.findIndex((c) => c.color === move.card.color && c.value === move.card.value);
    }
    if (cardIdx === -1) {
      throw new IllegalMoveError('Card not in hand for Jump-In');
    }
    const card = hand[cardIdx];
    const top = state.discardPile[state.discardPile.length - 1];
    if (!top || card.color !== top.color || card.value !== top.value) {
      throw new IllegalMoveError('Jump-In card must match top discard color and value exactly');
    }

    hand.splice(cardIdx, 1);
    state.discardPile.push(card);
    state.currentColor = card.color;
    state.turn = role; // Jump-In steals the current turn

    if (hand.length !== 1) {
      state.unoCalled[role] = false;
    }

    if (hand.length === 0) {
      state.isGameActive = false;
      return { state, winner: role };
    }
    return { state, winner: null };
  }

  // STANDARD MOVE TURN CHECK
  if (state.turn !== role) {
    throw new IllegalMoveError(`Not your turn (current turn: ${state.turn})`);
  }

  if (action === 'play_card' || action === 'playCard') {
    const hand = state.hands[role];
    const cardId = move.card_id || (move.cards && move.cards[0] && move.cards[0].id) || move.cardId;
    let cardIdx = hand.findIndex((c) => c.id === cardId);
    if (cardIdx === -1 && (move.card || (move.cards && move.cards[0]))) {
      const target = move.card || move.cards[0];
      cardIdx = hand.findIndex((c) => c.color === target.color && c.value === target.value);
    }
    if (cardIdx === -1) {
      cardIdx = hand.findIndex((c) => isPlayable(c, state));
    }
    if (cardIdx === -1) {
      throw new IllegalMoveError('Card not in hand');
    }
    const card = hand[cardIdx];
    if (!isPlayable(card, state)) {
      throw new IllegalMoveError(`Card ${card.color} ${card.value} is not playable`);
    }

    hand.splice(cardIdx, 1);
    state.discardPile.push(card);

    if (card.color === 'wild') {
      const chosenColor = move.chosenColor || move.chosen_color || 'red';
      state.currentColor = chosenColor;
    } else {
      state.currentColor = card.color;
    }

    if (hand.length !== 1) {
      state.unoCalled[role] = false;
    }

    // Win condition check
    if (hand.length === 0) {
      state.isGameActive = false;
      return { state, winner: role };
    }

    // Action cards
    if (card.value === '+2') {
      state.pendingDraw += 2;
    } else if (card.value === '+4') {
      state.pendingDraw += 4;
    }

    if (card.value === 'Skip' || card.value === 'Reverse') {
      // 2-player rule: Skip or Reverse gives another turn to the active player
      state.turn = role;
    } else {
      state.turn = opponent;
    }

    return { state, winner: null };
  }

  if (action === 'pass_turn' || action === 'passTurn') {
    state.turn = opponent;
    return { state, winner: null };
  }

  if (action === 'draw_card' || action === 'drawCard') {
    const count = state.pendingDraw > 0 ? state.pendingDraw : 1;
    const drawn = [];

    for (let i = 0; i < count; i++) {
      if (state.drawPile.length === 0) {
        // Reshuffle discard pile into draw pile
        const top = state.discardPile.pop();
        state.drawPile = state.discardPile.reverse();
        state.discardPile = [top];
      }
      if (state.drawPile.length > 0) {
        drawn.push(state.drawPile.shift());
      }
    }

    state.hands[role].push(...drawn);
    state.pendingDraw = 0;

    if (state.hands[role].length !== 1) {
      state.unoCalled[role] = false;
    }

    const lastDrawn = drawn[drawn.length - 1];
    const playable = count === 1 && lastDrawn && isPlayable(lastDrawn, state);

    if (!playable) {
      state.turn = opponent;
    }

    return { state, winner: null, drawnCard: count === 1 ? lastDrawn : null, isDrawnPlayable: playable };
  }

  throw new IllegalMoveError(`Unknown action ${action}`);
}

function filterStateForRole(state, role) {
  const opponent = role === 'boyfriend' ? 'girlfriend' : 'boyfriend';
  const topDiscard = state.discardPile[state.discardPile.length - 1] || null;
  return {
    myHand: state.hands[role] || [],
    opponentHandCount: (state.hands[opponent] || []).length,
    topDiscard,
    activeColor: state.currentColor,
    currentTurn: state.turn,
    pendingDraw: state.pendingDraw,
    isGameActive: state.isGameActive,
    deckCount: state.drawPile.length,
  };
}

module.exports = {
  IllegalMoveError,
  buildDeck,
  newGame,
  isPlayable,
  applyMove,
  filterStateForRole,
};
