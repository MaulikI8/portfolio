import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGameRoomSocket } from '../hooks/useGameRoomSocket';
import { GAME_REGISTRY } from '../components/games';
import { X } from 'lucide-react';

export function GameDetailPage() {
  const { gameSlug } = useParams<{ gameSlug: string }>();
  const navigate = useNavigate();
  const { partner } = useAuth();

  const slug = gameSlug || 'uno';
  const BoardComponent = GAME_REGISTRY[slug] || GAME_REGISTRY['uno'];

  const roomId = `room-${slug}`;
  const { state, turn, sendMove } = useGameRoomSocket(roomId);

  const myRole = partner?.role || 'boyfriend';
  const isMyTurn = turn === myRole;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: '#111118',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Floating Exit Button (X) */}
      <button
        onClick={() => navigate('/')}
        title="Exit Game"
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.75)',
          color: '#FFFFFF',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <X size={22} color="#FFFFFF" />
      </button>

      {/* Dynamic Game Board Component (Fills 100% of Screen) */}
      <div style={{ width: '100%', height: '100%', flex: 1, display: 'flex' }}>
        <BoardComponent state={state} myRole={myRole} isMyTurn={isMyTurn} onMove={sendMove} />
      </div>
    </div>
  );
}
