import type { Game } from 'boardgame.io';

// ============================================================================
// PURE ENGINE MOVES & EVALUATORS
// ============================================================================

export interface TicTacToeState {
  cells: (string | null)[];
  winningLine: number[] | null;
}

export const clickCellMove = (G: TicTacToeState, playerID: string, id: number) => {
  if (G.cells[id] === null) {
    G.cells[id] = playerID;
  }
};

export const checkTicTacToeWinner = (G: TicTacToeState) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  for (const line of lines) {
    const [a, b, c] = line;
    if (G.cells[a] && G.cells[a] === G.cells[b] && G.cells[a] === G.cells[c]) {
      G.winningLine = line;
      return { winner: G.cells[a] };
    }
  }

  if (G.cells.every((cell) => cell !== null)) {
    return { draw: true };
  }
  return null;
};

export const TicTacToeEngine: Game<TicTacToeState> = {
  name: 'tictactoe',
  setup: () => ({
    cells: Array(9).fill(null),
    winningLine: null,
  }),
  moves: {
    clickCell: ({ G, playerID }, id: number) => {
      clickCellMove(G, playerID, id);
    },
  },
  turn: {
    minMoves: 1,
    maxMoves: 1,
  },
  endIf: ({ G }) => checkTicTacToeWinner(G) || undefined,
};

// ============================================================================
// CONNECT 4
// ============================================================================
export interface Connect4State {
  board: (string | null)[][];
}

export const dropDiscMove = (G: Connect4State, playerID: string, col: number) => {
  for (let r = 5; r >= 0; r--) {
    if (!G.board[r][col]) {
      G.board[r][col] = playerID;
      break;
    }
  }
};

export const checkConnect4Winner = (G: Connect4State) => {
  const rows = 6;
  const cols = 7;
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const player = G.board[r][c];
      if (!player) continue;

      for (const [dr, dc] of directions) {
        let count = 1;
        for (let step = 1; step < 4; step++) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && G.board[nr][nc] === player) {
            count++;
          } else {
            break;
          }
        }
        if (count >= 4) {
          return { winner: player };
        }
      }
    }
  }

  const isFull = G.board.every((row) => row.every((cell) => cell !== null));
  if (isFull) return { draw: true };
  return null;
};

export const Connect4Engine: Game<Connect4State> = {
  name: 'connect4',
  setup: () => ({
    board: Array(6).fill(null).map(() => Array(7).fill(null)),
  }),
  moves: {
    dropDisc: ({ G, playerID }, col: number) => {
      dropDiscMove(G, playerID, col);
    },
  },
  turn: {
    minMoves: 1,
    maxMoves: 1,
  },
  endIf: ({ G }) => checkConnect4Winner(G) || undefined,
};

// ============================================================================
// DOTS & BOXES
// ============================================================================
export interface DotsBoxesState {
  gridSize: number;
  hLines: Record<string, string>;
  vLines: Record<string, string>;
  boxes: Record<string, string>;
  scores: Record<string, number>;
}

export const claimLineMove = (G: DotsBoxesState, playerID: string, type: 'h' | 'v', r: number, c: number) => {
  const key = `${type}_${r}_${c}`;
  if (type === 'h' && !G.hLines[key]) {
    G.hLines[key] = playerID;
  } else if (type === 'v' && !G.vLines[key]) {
    G.vLines[key] = playerID;
  }

  for (let row = 0; row < G.gridSize; row++) {
    for (let col = 0; col < G.gridSize; col++) {
      const boxKey = `${row}_${col}`;
      if (!G.boxes[boxKey]) {
        const top = G.hLines[`h_${row}_${col}`];
        const bottom = G.hLines[`h_${row + 1}_${col}`];
        const left = G.vLines[`v_${row}_${col}`];
        const right = G.vLines[`v_${row}_${col + 1}`];

        if (top && bottom && left && right) {
          G.boxes[boxKey] = playerID;
          G.scores[playerID] = (G.scores[playerID] || 0) + 1;
        }
      }
    }
  }
};

export const checkDotsBoxesWinner = (G: DotsBoxesState) => {
  const totalBoxes = G.gridSize * G.gridSize;
  const completed = Object.keys(G.boxes).length;
  if (completed >= totalBoxes) {
    const p0 = G.scores['boyfriend'] || G.scores['0'] || 0;
    const p1 = G.scores['girlfriend'] || G.scores['1'] || 0;
    if (p0 > p1) return { winner: 'boyfriend' };
    if (p1 > p0) return { winner: 'girlfriend' };
    return { draw: true };
  }
  return null;
};

export const DotsBoxesEngine: Game<DotsBoxesState> = {
  name: 'dots_boxes',
  setup: () => ({
    gridSize: 3,
    hLines: {},
    vLines: {},
    boxes: {},
    scores: { '0': 0, '1': 0 },
  }),
  moves: {
    claimLine: ({ G, playerID }, type: 'h' | 'v', r: number, c: number) => {
      claimLineMove(G, playerID, type, r, c);
    },
  },
  endIf: ({ G }) => checkDotsBoxesWinner(G) || undefined,
};

// ============================================================================
// CHECKERS / DRAUGHTS
// ============================================================================
export interface CheckersState {
  board: (string | null)[][];
}

export const INITIAL_CHECKERS_BOARD = [
  [null, 'b', null, 'b', null, 'b', null, 'b'],
  ['b', null, 'b', null, 'b', null, 'b', null],
  [null, 'b', null, 'b', null, 'b', null, 'b'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['r', null, 'r', null, 'r', null, 'r', null],
  [null, 'r', null, 'r', null, 'r', null, 'r'],
  ['r', null, 'r', null, 'r', null, 'r', null],
];

export const checkCheckersWinner = (G: CheckersState) => {
  let redCount = 0;
  let blackCount = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = G.board[r][c];
      if (piece === 'r' || piece === 'R') redCount++;
      if (piece === 'b' || piece === 'B') blackCount++;
    }
  }
  if (redCount === 0) return { winner: 'girlfriend' };
  if (blackCount === 0) return { winner: 'boyfriend' };
  return null;
};

export const CheckersEngine: Game<CheckersState> = {
  name: 'checkers',
  setup: () => ({
    board: INITIAL_CHECKERS_BOARD.map((row) => [...row]),
  }),
  moves: {
    movePiece: ({ G }, from: [number, number], to: [number, number]) => {
      const [fr, fc] = from;
      const [tr, tc] = to;
      const piece = G.board[fr][fc];
      G.board[fr][fc] = null;
      G.board[tr][tc] = piece;

      // Simple jump capture evaluation
      if (Math.abs(tr - fr) === 2 && Math.abs(tc - fc) === 2) {
        const jr = (fr + tr) / 2;
        const jc = (fc + tc) / 2;
        G.board[jr][jc] = null;
      }
    },
  },
  endIf: ({ G }) => checkCheckersWinner(G) || undefined,
};

