import { useState } from 'react';
import { ShipIcon, ExplosionIcon, WaveIcon } from '../Icons';
import '../../SinglePageApp.css';

interface Props {
  gameState: {
    phase: 'placement' | 'battle' | 'finished';
    boards: any;
    ships_placed: { boyfriend: boolean; girlfriend: boolean };
  };
  myRole: 'boyfriend' | 'girlfriend';
  isMyTurn: boolean;
  onMakeMove: (payload: any) => void;
}

export function BattleshipUI({ gameState, myRole, isMyTurn, onMakeMove }: Props) {
  const opponentRole = myRole === 'boyfriend' ? 'girlfriend' : 'boyfriend';
  const oppBoardData = gameState.boards?.[opponentRole] || { hits: [], misses: [] };
  const hasPlaced = gameState.ships_placed?.[myRole];

  // Placement state
  const [ships] = useState<any[]>([
    { size: 3, row: 0, col: 0, orientation: 'H' },
    { size: 2, row: 2, col: 1, orientation: 'V' },
  ]);

  const handlePlaceSubmit = () => {
    onMakeMove({ action: 'place_ships', ships });
  };

  if (gameState.phase === 'placement') {
    return (
      <div className="battleship-placement">
        <h3>
          <ShipIcon size={24} color="var(--candlelight-amber)" /> Deploy Your Ships
        </h3>
        <p className="battleship-desc">
          {hasPlaced ? 'Waiting for partner to finish ship placement...' : 'Arrange your fleet on the 6x6 grid!'}
        </p>

        {!hasPlaced && (
          <div className="battleship-controls">
            <button className="btn btn--primary" onClick={handlePlaceSubmit}>
              Confirm Fleet Placement
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="battleship-battle">
      <div className="battleship-grid-container">
        <h4>Target Partner Grid</h4>
        <div className="battleship-grid">
          {Array(6).fill(0).map((_, r) => (
            <div key={r} className="battleship-row">
              {Array(6).fill(0).map((_, c) => {
                const isHit = oppBoardData.hits?.some(([hr, hc]: any) => hr === r && hc === c);
                const isMiss = oppBoardData.misses?.some(([mr, mc]: any) => mr === r && mc === c);
                return (
                  <button
                    key={c}
                    className={`battleship-cell ${isHit ? 'battleship-cell--hit' : isMiss ? 'battleship-cell--miss' : ''}`}
                    disabled={!isMyTurn || isHit || isMiss}
                    onClick={() => onMakeMove({ action: 'fire', row: r, col: c })}
                  >
                    {isHit && <ExplosionIcon size={22} color="var(--muted-rose)" />}
                    {isMiss && <WaveIcon size={20} color="var(--grey-muted)" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
