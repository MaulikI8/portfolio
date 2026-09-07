const CARD_COLORS = ['red', 'blue', 'green', 'yellow'];
const CARD_VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', '+2'];

class IllegalMoveError extends Error {
  constructor(message) { super(message); this.name = 'IllegalMoveError'; }
}

function buildDeck() {
  const deck = []; let cid = 1;
  CARD_COLORS.forEach((color) => {
    CARD_VALUES.forEach((value) => {
      deck.push({ id: `c_${cid++}`, color, value });
      if (value !== '0') deck.push({ id: `c_${cid++}`, color, value });
    });
  });
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `c_${cid++}`, color: 'wild', value: 'Wild' });
    deck.push({ id: `c_${cid++}`, color: 'wild', value: '+4' });
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function newGame() {
  const deck = buildDeck();
  const hands = { boyfriend: deck.slice(0, 7), girlfriend: deck.slice(7, 14) };
  const drawPile = deck.slice(14);
  let topIdx = drawPile.findIndex((c) => c.color !== 'wild' && !['Skip', 'Reverse', '+2', '+4'].includes(c.value));
  if (topIdx === -1) topIdx = 0;
  const topCard = drawPile.splice(topIdx, 1)[0];
  return { drawPile, hands, discardPile: [topCard], currentColor: topCard.color, turn: 'boyfriend', pendingDraw: 0, isGameActive: true, hasDrawnThisTurn: false, unoCalled: { boyfriend: false, girlfriend: false }, unoWindow: { role: null, expiresAt: 0 } };
}

function drawCardFromState(state) {
  if (!state.drawPile) state.drawPile = [];
  if (!state.discardPile) state.discardPile = [];
  if (state.drawPile.length === 0) {
    if (state.discardPile.length <= 1) return null;
    const top = state.discardPile.pop();
    const recycled = state.discardPile.slice();
    for (let i = recycled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [recycled[i], recycled[j]] = [recycled[j], recycled[i]];
    }
    state.drawPile = recycled;
    state.discardPile = [top];
  }
  const drawn = state.drawPile.length > 0 ? state.drawPile.shift() : null;
  return drawn || null;
}

function isPlayable(card, state) {
  if (!card || !card.color || !card.value) return false;
  const top = state.discardPile ? state.discardPile[state.discardPile.length - 1] : null;
  if (state.pendingDraw > 0) return (card.value === '+2' && top?.value === '+2') || (card.value === '+4' && top?.value === '+4');
  return card.color === 'wild' || card.color === state.currentColor || (top && card.value === top.value);
}

function applyMove(state, role, move) {
  if (!state.isGameActive) {
    if (state.hands && ((state.hands.boyfriend?.length > 0) || (state.hands.girlfriend?.length > 0))) state.isGameActive = true;
    else throw new IllegalMoveError('Game is not active');
  }
  if (!state.unoCalled) state.unoCalled = { boyfriend: false, girlfriend: false };
  if (!state.unoWindow) state.unoWindow = { role: null, expiresAt: 0 };
  const action = move.action || move.type; const opponent = role === 'boyfriend' ? 'girlfriend' : 'boyfriend';

  if (action === 'call_uno' || action === 'callUno') {
    if (state.hands[role].length !== 1) throw new IllegalMoveError('Can only call UNO when you have exactly 1 card in hand');
    state.unoCalled[role] = true; state.unoWindow = { role: null, expiresAt: 0 }; return { state, winner: null };
  }

  if (action === 'call_out' || action === 'callOut') {
    const targetRole = move.targetRole || opponent; const targetHand = state.hands[targetRole];
    const isWindowActive = state.unoWindow.role === targetRole && Date.now() <= state.unoWindow.expiresAt;
    if (targetHand && targetHand.length === 1 && !state.unoCalled[targetRole] && (isWindowActive || state.unoWindow.role === targetRole)) {
      for (let i = 0; i < 2; i++) { const drawn = drawCardFromState(state); if (drawn) targetHand.push(drawn); }
      state.unoCalled[targetRole] = false; state.unoWindow = { role: null, expiresAt: 0 };
    } else throw new IllegalMoveError('Invalid call-out: Target already called UNO or not in penalty window');
    return { state, winner: null };
  }

  if (action === 'jump_in' || action === 'jumpIn') {
    if (state.pendingDraw > 0) throw new IllegalMoveError('Cannot Jump-In while draw stack active');
    const hand = state.hands[role]; const cardId = move.card_id || move.cardId || move.card?.id;
    let cardIdx = hand.findIndex((c) => c.id === cardId || (c.color === move.card?.color && c.value === move.card?.value));
    if (cardIdx === -1) throw new IllegalMoveError('Card not in hand for Jump-In');
    const card = hand[cardIdx]; const top = state.discardPile[state.discardPile.length - 1];
    if (!top || card.color !== top.color || card.value !== top.value) throw new IllegalMoveError('Jump-In card must match top discard color and value exactly');
    hand.splice(cardIdx, 1); state.discardPile.push(card); state.currentColor = card.color; state.turn = role;
    if (hand.length === 1 && !state.unoCalled[role]) state.unoWindow = { role, expiresAt: Date.now() + 3000 };
    else { state.unoCalled[role] = false; state.unoWindow = { role: null, expiresAt: 0 }; }
    if (hand.length === 0) { state.isGameActive = false; return { state, winner: role }; }
    return { state, winner: null };
  }

  if (state.turn !== role) throw new IllegalMoveError(`Not your turn (current turn: ${state.turn})`);

  if (action === 'play_card' || action === 'playCard') {
    const hand = state.hands[role]; const cardId = move.card_id || move.cards?.[0]?.id || move.cardId || move.card?.id;
    let cardIdx = hand.findIndex((c) => c.id === cardId || (c.color === (move.card || move.cards?.[0])?.color && c.value === (move.card || move.cards?.[0])?.value));
    if (cardIdx === -1) throw new IllegalMoveError('Specified card is not in your hand');
    const card = hand[cardIdx];
    if (!isPlayable(card, state)) throw new IllegalMoveError(`Card ${card.color} ${card.value} is not playable`);
    if (card.color === 'wild') {
      const chosenColor = move.chosenColor || move.chosen_color;
      if (!chosenColor || !CARD_COLORS.includes(chosenColor)) throw new IllegalMoveError('Must choose valid color when playing Wild');
      state.currentColor = chosenColor;
    } else state.currentColor = card.color;
    hand.splice(cardIdx, 1); state.discardPile.push(card); state.hasDrawnThisTurn = false;
    if (hand.length === 1 && !state.unoCalled[role]) state.unoWindow = { role, expiresAt: Date.now() + 3000 };
    else { state.unoCalled[role] = false; state.unoWindow = { role: null, expiresAt: 0 }; }
    if (hand.length === 0) { state.isGameActive = false; return { state, winner: role }; }
    if (card.value === '+2') state.pendingDraw += 2;
    else if (card.value === '+4') state.pendingDraw += 4;
    state.turn = ['Skip', 'Reverse'].includes(card.value) ? role : opponent;
    return { state, winner: null };
  }

  if (action === 'pass_turn' || action === 'passTurn') {
    if (!state.hasDrawnThisTurn) throw new IllegalMoveError('Cannot pass turn without drawing first');
    state.hasDrawnThisTurn = false; state.turn = opponent; return { state, winner: null };
  }

  if (action === 'draw_card' || action === 'drawCard') {
    const count = state.pendingDraw > 0 ? state.pendingDraw : 1; const drawn = [];
    for (let i = 0; i < count; i++) { const c = drawCardFromState(state); if (c) drawn.push(c); }
    state.hands[role].push(...drawn); state.pendingDraw = 0;
    if (state.hands[role].length !== 1) { state.unoCalled[role] = false; state.unoWindow = { role: null, expiresAt: 0 }; }
    const lastDrawn = drawn[drawn.length - 1]; const playable = count === 1 && lastDrawn && isPlayable(lastDrawn, state);
    if (playable) state.hasDrawnThisTurn = true;
    else { state.hasDrawnThisTurn = false; state.turn = opponent; }
    return { state, winner: null, drawnCard: count === 1 ? lastDrawn : null, isDrawnPlayable: playable };
  }

  throw new IllegalMoveError(`Unknown action ${action}`);
}

function filterStateForRole(state, role) {
  const opponent = role === 'boyfriend' ? 'girlfriend' : 'boyfriend';
  return { myHand: state.hands[role] || [], opponentHandCount: (state.hands[opponent] || []).length, topDiscard: state.discardPile[state.discardPile.length - 1] || null, activeColor: state.currentColor, currentTurn: state.turn, pendingDraw: state.pendingDraw, isGameActive: state.isGameActive, deckCount: state.drawPile.length, unoWindow: state.unoWindow || { role: null, expiresAt: 0 } };
}

module.exports = { IllegalMoveError, buildDeck, newGame, isPlayable, applyMove, filterStateForRole };
