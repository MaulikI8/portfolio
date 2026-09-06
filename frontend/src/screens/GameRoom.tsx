import { useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { Avatar } from '../components/Avatar';
import { UnoBoard } from '../components/games/UnoBoard';
import { LudoBoard } from '../components/games/LudoBoard';
import { OBUS3DUI } from '../components/games/OBUS3DUI';
import { IframeGameUI } from '../components/games/IframeGameUI';
import { HeartIcon, CandleIcon, FlameIcon, LaughIcon, ClapIcon, RefreshIcon } from '../components/Icons';
import './GameRoom.css';

interface FloatingReaction {
  id: number;
  iconName: string;
  sender: string;
  left: number;
}

export function GameRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { partner } = useAuth();

  const externalGame = location.state?.game;

  const [gameState, setGameState] = useState<any>(null);
  const [turn, setTurn] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('waiting');
  const [winner, setWinner] = useState<string | null>(null);
  const [gameType, setGameType] = useState<string>('tictactoe');
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [rematchRequested, setRematchRequested] = useState(false);
  const [isSoloDevMode, setIsSoloDevMode] = useState<boolean>(true);

  const wsUrl = partner && roomId !== 'external'
    ? `/ws/room/${roomId}/?partner_id=${partner.id}`
    : '';

  const renderReactionIcon = (iconName: string, size = 32) => {
    switch (iconName) {
      case 'heart': return <HeartIcon size={size} color="var(--muted-rose)" fill="var(--muted-rose)" />;
      case 'candle': return <CandleIcon size={size} color="var(--candlelight-amber)" />;
      case 'flame': return <FlameIcon size={size} color="var(--candlelight-amber)" />;
      case 'laugh': return <LaughIcon size={size} color="var(--candlelight-amber)" />;
      case 'clap': return <ClapIcon size={size} color="var(--parchment)" />;
      default: return <HeartIcon size={size} color="var(--muted-rose)" fill="var(--muted-rose)" />;
    }
  };

  const handleMessage = useCallback((data: any) => {
    if (data.type === 'init' || data.type === 'state_update') {
      setGameState(data.state);
      setTurn(data.turn);
      setStatus(data.status);
      setWinner(data.winner);
      if (data.game_type) setGameType(data.game_type);
      setRematchRequested(false);
    } else if (data.type === 'reaction') {
      triggerFloatingReaction(data.iconName || 'heart', data.sender);
    } else if (data.type === 'rematch_requested') {
      setRematchRequested(true);
    }
  }, []);

  const { sendMessage, status: wsStatus } = useWebSocket({
    url: wsUrl,
    onMessage: handleMessage,
  });

  const triggerFloatingReaction = (iconName: string, sender: string) => {
    const newReaction: FloatingReaction = {
      id: Date.now() + Math.random(),
      iconName,
      sender,
      left: Math.floor(Math.random() * 80) + 10,
    };
    setReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2500);
  };

  const sendReaction = (iconName: string) => {
    if (!partner) return;
    triggerFloatingReaction(iconName, partner.name);
    if (roomId !== 'external') {
      sendMessage({ type: 'reaction', iconName });
    }
  };

  const myRole = partner?.role || 'boyfriend';
  const opponentRole = myRole === 'boyfriend' ? 'girlfriend' : 'boyfriend';
  const isMyTurn = isSoloDevMode || (turn === myRole && (status === 'active' || status === 'waiting' || status === 'playing'));

  const handleMakeMove = (payload: any) => {
    sendMessage({
      type: 'move',
      payload: {
        ...payload,
        solo_dev: isSoloDevMode,
        as_role: isSoloDevMode ? (turn || myRole) : myRole,
      },
    });
  };

  const handleRematch = () => {
    sendMessage({ type: 'rematch' });
  };

  // External Game rendering
  if (roomId === 'external' && externalGame) {
    return (
      <div className="gameroom-container">
        <header className="gameroom-header">
          <button className="back-btn" onClick={() => navigate('/games')}>
            ← Leave Arcade
          </button>
          <h2>{externalGame.title}</h2>
          <div className="reaction-bar">
            {['heart', 'candle', 'flame', 'laugh', 'clap'].map((iconName) => (
              <button key={iconName} className="reaction-btn" onClick={() => sendReaction(iconName)}>
                {renderReactionIcon(iconName, 20)}
              </button>
            ))}
          </div>
        </header>

        <main className="gameroom-main">
          <IframeGameUI gameUrl={externalGame.url} title={externalGame.title} />
        </main>
      </div>
    );
  }

  return (
    <div className="gameroom-container">
      {/* Floating Reaction Animation Overlay */}
      <div className="floating-reactions-overlay">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="floating-reaction"
            style={{ left: `${r.left}%` }}
          >
            {renderReactionIcon(r.iconName, 36)}
            <small>{r.sender}</small>
          </div>
        ))}
      </div>

      <header className="gameroom-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Exit Room
        </button>
        <div className="gameroom-title-group">
          <h2>Room #{roomId} — {gameType.toUpperCase()}</h2>
          <div className="ws-indicator">
            <button
              className={`btn-solo-toggle ${isSoloDevMode ? 'btn-solo-toggle--active' : ''}`}
              onClick={() => setIsSoloDevMode(!isSoloDevMode)}
              title="Toggle Solo Developer Testing Mode"
            >
              Solo Testing: {isSoloDevMode ? 'ON' : 'OFF'}
            </button>
            <span className={`ws-dot ws-dot--${wsStatus}`} />
            {wsStatus === 'open' ? 'Live Syncing' : 'Connecting...'}
          </div>
        </div>
      </header>

      {/* Players Header */}
      <div className="gameroom-players">
        <div className={`player-seat ${turn === myRole ? 'player-seat--active' : ''}`}>
          <Avatar name={partner?.name || 'You'} size="md" />
          <div className="player-seat__info">
            <strong>You ({myRole})</strong>
            {(isMyTurn || isSoloDevMode) && <span className="turn-tag">YOUR TURN!</span>}
          </div>
        </div>

        <div className="players-vs">VS</div>

        <div className={`player-seat ${turn === opponentRole ? 'player-seat--active' : ''}`}>
          <Avatar name={opponentRole === 'girlfriend' ? 'Seema' : 'Maulik'} size="md" />
          <div className="player-seat__info">
            <strong>Partner ({opponentRole})</strong>
            {turn === opponentRole && !isSoloDevMode && <span className="turn-tag">Thinking...</span>}
          </div>
        </div>
      </div>

      {/* Main Game Stage */}
      <main className="gameroom-main">
        {status === 'finished' && (
          <div className="game-over-banner">
            <h3>
              {winner === 'draw'
                ? "It's a Tie!"
                : winner === myRole
                ? 'Victory is Yours!'
                : 'Partner Won this Round!'}
            </h3>
            <div className="game-over-actions">
              <button className="btn btn--primary" onClick={handleRematch}>
                <RefreshIcon size={16} color="var(--plum-900)" style={{ marginRight: 6 }} />
                {rematchRequested ? 'Partner wants Rematch! Accept' : 'Request Rematch'}
              </button>
              <button className="btn btn--secondary" onClick={() => navigate('/games')}>
                Choose Another Game
              </button>
            </div>
          </div>
        )}

        {gameState && (
          <div className="game-engine-stage">
            {gameType === 'uno' && (
              <UnoBoard
                state={gameState}
                myRole={myRole}
                isMyTurn={isMyTurn}
                onMove={handleMakeMove}
              />
            )}
            {gameType === 'ludo' && (
              <LudoBoard
                state={gameState}
                myRole={myRole}
                isMyTurn={isMyTurn}
                onMove={handleMakeMove}
              />
            )}
            {(gameType === 'obus' || gameType === 'obus_3d') && (
              <OBUS3DUI
                gameState={gameState}
                myRole={myRole}
                isMyTurn={isMyTurn}
                onMakeMove={handleMakeMove}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Reaction Bar */}
      <footer className="gameroom-footer">
        <div className="reaction-bar">
          {['heart', 'candle', 'flame', 'laugh', 'clap'].map((iconName) => (
            <button
              key={iconName}
              className="reaction-btn"
              onClick={() => sendReaction(iconName)}
            >
              {renderReactionIcon(iconName, 22)}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
