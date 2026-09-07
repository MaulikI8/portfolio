import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `http://${window.location.hostname}:8000`;
    }
  }
  return 'https://portfolio-w7uw.onrender.com';
};


const SOCKET_URL = getSocketUrl();

// Singleton socket instance — shared across all hooks
let globalSocket: Socket | null = null;

function getSocket(): Socket {
  if (!globalSocket) {
    globalSocket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      transports: ['polling', 'websocket'],
    });
  }
  return globalSocket;
}

/**
 * Primary hook — call once at app level with the current user's role.
 * This identifies the socket to the server so all events route correctly.
 */
export function useSocketConnection(role: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);

  useEffect(() => {
    if (!role) return;

    const socket = getSocket();

    const onConnect = () => {
      setIsConnected(true);
      socket.emit('identify', { role });
    };
    const onDisconnect = () => setIsConnected(false);
    const onPresence = (data: { boyfriend: boolean; girlfriend: boolean }) => {
      const other = role === 'boyfriend' ? 'girlfriend' : 'boyfriend';
      setPartnerOnline(data[other]);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('presence', onPresence);

    // If already connected, identify immediately
    if (socket.connected) {
      socket.emit('identify', { role });
      setIsConnected(true);
    } else {
      socket.connect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('presence', onPresence);
    };
  }, [role]);

  return { isConnected, partnerOnline };
}

export function usePresenceSocket(role: string | null) {
  return useSocketConnection(role);
}

/**
 * Chat-specific hook — handles sending/receiving messages, typing indicators
 */
export function useChatSocket() {
  const [partnerTyping, setPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendMessage = useCallback((msg: {
    text?: string;
    message_type?: string;
    media_url?: string;
    sticker_id?: string;
    sticker_emoji?: string;
  }) => {
    const socket = getSocket();
    socket.emit('chat_message', msg);
  }, []);

  const sendTyping = useCallback((isTyping: boolean) => {
    const socket = getSocket();
    socket.emit('typing', { isTyping });
  }, []);

  const onMessage = useCallback((handler: (msg: any) => void) => {
    const socket = getSocket();
    socket.on('chat_message', handler);
    return () => { socket.off('chat_message', handler); };
  }, []);

  const markSeen = useCallback(() => {
    const socket = getSocket();
    socket.emit('mark_seen');
  }, []);

  const onMessagesSeen = useCallback((handler: (data: any) => void) => {
    const socket = getSocket();
    socket.on('messages_seen', handler);
    return () => { socket.off('messages_seen', handler); };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const handlePartnerTyping = ({ isTyping }: { role: string; isTyping: boolean }) => {
      setPartnerTyping(isTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 3000);
      }
    };
    socket.on('partner_typing', handlePartnerTyping);
    return () => { socket.off('partner_typing', handlePartnerTyping); };
  }, []);

  return { sendMessage, sendTyping, markSeen, onMessage, onMessagesSeen, partnerTyping };
}

/**
 * Nudge hook — send and receive nudges
 */
export function useNudgeSocket() {
  const sendNudge = useCallback((emoji: string, label: string) => {
    const socket = getSocket();
    socket.emit('nudge', { emoji, label });
  }, []);

  const onNudge = useCallback((handler: (data: { from: string; fromName: string; emoji: string; label: string }) => void) => {
    const socket = getSocket();
    socket.on('nudge', handler);
    return () => { socket.off('nudge', handler); };
  }, []);

  return { sendNudge, onNudge };
}

/**
 * Notification hook — receive real-time notifications from partner
 */
export function useNotificationSocket() {
  const sendNotification = useCallback((notif: { kind?: string; title: string; body: string }) => {
    const socket = getSocket();
    socket.emit('notification', notif);
  }, []);

  const onNotification = useCallback((handler: (data: any) => void) => {
    const socket = getSocket();
    socket.on('notification', handler);
    return () => { socket.off('notification', handler); };
  }, []);

  return { sendNotification, onNotification };
}

/**
 * Reaction hook — floating emoji reactions
 */
export function useReactionSocket() {
  const sendReaction = useCallback((emoji: string) => {
    const socket = getSocket();
    socket.emit('reaction', { emoji });
  }, []);

  const onReaction = useCallback((handler: (data: { from: string; fromName: string; emoji: string }) => void) => {
    const socket = getSocket();
    socket.on('reaction', handler);
    return () => { socket.off('reaction', handler); };
  }, []);

  return { sendReaction, onReaction };
}

/**
 * Love note hook
 */
export function useLoveNoteSocket() {
  const sendLoveNote = useCallback((message: string) => {
    const socket = getSocket();
    socket.emit('love_note', { message });
  }, []);

  const onLoveNote = useCallback((handler: (data: any) => void) => {
    const socket = getSocket();
    socket.on('love_note', handler);
    return () => { socket.off('love_note', handler); };
  }, []);

  return { sendLoveNote, onLoveNote };
}

/**
 * Get the raw socket instance for advanced usage (e.g., UNO game events)
 */
export function getSocketInstance(): Socket {
  return getSocket();
}
