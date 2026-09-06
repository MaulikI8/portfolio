import { DownArrowIcon, DiscIcon } from '../Icons';
import '../../SinglePageApp.css';

interface Props {
  gameState: {
    board: (string | null)[][];
  };
  myRole: 'boyfriend' | 'girlfriend';
  isMyTurn: boolean;
  onMakeMove: (payload: any) => void;
}

export function Connect4UI({ gameState, isMyTurn, onMakeMove }: Props) {
  const board = gameState.board || Array(6).fill(Array(7).fill(null));

  return (
    <div className="connect4-container">
      <div className="connect4-column-pickers">
        {[0, 1, 2, 3, 4, 5, 6].map((col) => (
          <button
            key={col}
            className="connect4-picker-btn"
            disabled={!isMyTurn}
            onClick={() => onMakeMove({ column: col })}
          >
            <DownArrowIcon size={20} color="var(--candlelight-amber)" />
          </button>
        ))}
      </div>

      <div className="connect4-grid">
        {board.slice().reverse().map((row, rIdx) => (
          <div key={rIdx} className="connect4-row">
            {row.map((cell: string | null, cIdx: number) => (
              <div
                key={cIdx}
                className={`connect4-slot ${cell ? `connect4-slot--${cell}` : ''}`}
              >
                {cell === 'boyfriend' && <DiscIcon size={32} color="#E8A94C" fill="#E8A94C" />}
                {cell === 'girlfriend' && <DiscIcon size={32} color="#C97B84" fill="#C97B84" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
