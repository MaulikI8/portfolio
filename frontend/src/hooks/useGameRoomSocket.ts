import { useState, useEffect, useCallback } from 'react';
import { getSocketInstance } from './useSocket';

export interface GameRoomSocketOptions {
  roomId: string;
  initialState?: any;
}

export function useGameRoomSocket(roomId: string, initialState: any = null) {
  const [state, setState] = useState<any>(initialState);
  const [turn, setTurn] = useState<string>('boyfriend');
  const [status, setStatus] = useState<'waiting' | 'active' | 'finished'>('waiting');
  const [recentReaction, setRecentReaction] = useState<{ sender: string; emoji: string } | null>(null);

  useEffect(() => {
    const socket = getSocketInstance();
    const handleGameMessage = (data: any) => {
      if (!data) return;
      if (data.type === 'state_update' || data.type === 'game_state') {
        if (data.state) setState(data.state);
        if (data.turn) setTurn(data.turn);
        if (data.status) setStatus(data.status);
      } else if (data.type === 'reaction') {
        setRecentReaction({ sender: data.sender, emoji: data.emoji });
      }
    };

    socket.on('game_message', handleGameMessage);
    return () => {
      socket.off('game_message', handleGameMessage);
    };
  }, []);

  const sendMove = useCallback(
    (moveData: any) => {
      const socket = getSocketInstance();
      socket.emit('game_move', { roomId, payload: moveData });
    },
    [roomId]
  );

  const sendReaction = useCallback(
    (emoji: string) => {
      const socket = getSocketInstance();
      socket.emit('game_reaction', { roomId, emoji });
    },
    [roomId]
  );

  return {
    state,
    turn,
    status,
    recentReaction,
    sendMove,
    sendReaction,
    isConnected: true,
    isReconnecting: false,
  };
}

