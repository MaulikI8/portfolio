import { CrossIcon, CircleIcon } from '../Icons';
import '../../SinglePageApp.css';

interface Props {
  gameState: {
    board: (string | null)[];
    winning_line?: number[] | null;
  };
  myRole: 'boyfriend' | 'girlfriend';
  isMyTurn: boolean;
  onMakeMove: (payload: any) => void;
}

export function TicTacToeUI({ gameState, isMyTurn, onMakeMove }: Props) {
  const board = gameState.board || Array(9).fill(null);
  const winningLine = gameState.winning_line || [];

  return (
    <div className="tictactoe-board">
      {board.map((cell, idx) => {
        const isWinningCell = winningLine.includes(idx);
        return (
          <button
            key={idx}
            className={`tictactoe-cell ${isWinningCell ? 'tictactoe-cell--winner' : ''}`}
            disabled={!isMyTurn || cell !== null}
            onClick={() => onMakeMove({ position: idx })}
          >
            {cell === 'boyfriend' && <CrossIcon size={44} color="#E8A94C" />}
            {cell === 'girlfriend' && <CircleIcon size={44} color="#C97B84" />}
          </button>
        );
      })}
    </div>
  );
}
