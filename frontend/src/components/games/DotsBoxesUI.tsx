import React from 'react';
import { CrossIcon, CircleIcon } from '../Icons';
import '../../SinglePageApp.css';

interface Props {
  gameState: {
    grid_size: number;
    h_lines: boolean[][];
    v_lines: boolean[][];
    boxes: (string | null)[][];
    scores: { boyfriend: number; girlfriend: number };
  };
  myRole: 'boyfriend' | 'girlfriend';
  isMyTurn: boolean;
  onMakeMove: (payload: any) => void;
}

export function DotsBoxesUI({ gameState, isMyTurn, onMakeMove }: Props) {
  const gridSize = gameState.grid_size || 4;
  const hLines = gameState.h_lines || Array(gridSize).fill(Array(gridSize - 1).fill(false));
  const vLines = gameState.v_lines || Array(gridSize - 1).fill(Array(gridSize).fill(false));
  const boxes = gameState.boxes || Array(gridSize - 1).fill(Array(gridSize - 1).fill(null));

  return (
    <div className="dots-container">
      <div className="dots-board">
        {Array(gridSize).fill(0).map((_, r) => (
          <React.Fragment key={r}>
            {/* Dot Row */}
            <div className="dots-row">
              {Array(gridSize).fill(0).map((_, c) => (
                <React.Fragment key={c}>
                  <div className="dot" />
                  {c < gridSize - 1 && (
                    <button
                      className={`hline ${hLines[r]?.[c] ? 'hline--active' : ''}`}
                      disabled={!isMyTurn || hLines[r]?.[c]}
                      onClick={() => onMakeMove({ type: 'h', row: r, col: c })}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Vertical Lines + Boxes Row */}
            {r < gridSize - 1 && (
              <div className="dots-vrow">
                {Array(gridSize).fill(0).map((_, c) => (
                  <React.Fragment key={c}>
                    <button
                      className={`vline ${vLines[r]?.[c] ? 'vline--active' : ''}`}
                      disabled={!isMyTurn || vLines[r]?.[c]}
                      onClick={() => onMakeMove({ type: 'v', row: r, col: c })}
                    />
                    {c < gridSize - 1 && (
                      <div className={`box ${boxes[r]?.[c] ? `box--${boxes[r][c]}` : ''}`}>
                        {boxes[r]?.[c] === 'boyfriend' && <CrossIcon size={24} color="#E8A94C" />}
                        {boxes[r]?.[c] === 'girlfriend' && <CircleIcon size={24} color="#C97B84" />}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
