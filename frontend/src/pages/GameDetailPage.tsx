import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGameRoomSocket } from '../hooks/useGameRoomSocket';
import { GAME_REGISTRY } from '../components/games';
import { getSocketInstance } from '../hooks/useSocket';
import { X, AlertTriangle } from 'lucide-react';

export function GameDetailPage() {
  const { gameSlug } = useParams<{ gameSlug: string }>();
  const navigate = useNavigate();
  const { partner } = useAuth();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const slug = gameSlug || 'uno';
  const BoardComponent = GAME_REGISTRY[slug] || GAME_REGISTRY['uno'];

  const roomId = `room-${slug}`;
  const { state, turn, sendMove } = useGameRoomSocket(roomId);

  const myRole = partner?.role || 'boyfriend';
  const isMyTurn = turn === myRole;

  const handleConfirmExit = () => {
    const socket = getSocketInstance();
    if (slug === 'uno') {
      socket.emit('uno_terminate');
      socket.emit('uno_leave');
    }
    setShowExitConfirm(false);
    navigate('/games');
  };

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
        onClick={() => setShowExitConfirm(true)}
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

      {/* Confirmation Modal when clicking Exit (X) */}
      {showExitConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(10, 8, 20, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              background: '#FFF9F2',
              border: '3px solid #2D152B',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '6px 6px 0px #2D152B',
              textAlign: 'center',
              color: '#2D152B',
              fontFamily: 'Fredoka, sans-serif',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#FF3547',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '3px 3px 0px #2D152B',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0', color: '#2D152B' }}>
              Exit Game Match?
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#6B5B6E', margin: '0 0 24px 0', fontWeight: 600, lineHeight: 1.4 }}>
              Are you sure you want to exit? Leaving will terminate the active match session for both players.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '99px',
                  border: '2px solid #2D152B',
                  background: '#FFF',
                  color: '#2D152B',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Resume Match
              </button>
              <button
                onClick={handleConfirmExit}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '99px',
                  border: '2.5px solid #2D152B',
                  background: '#FF3547',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0px #2D152B',
                }}
              >
                Exit & Terminate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Game Board Component (Fills 100% of Screen) */}
      <div style={{ width: '100%', height: '100%', flex: 1, display: 'flex' }}>
        <BoardComponent state={state} myRole={myRole} isMyTurn={isMyTurn} onMove={sendMove} />
      </div>
    </div>
  );
}
