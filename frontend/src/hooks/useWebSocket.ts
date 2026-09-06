import { useRef, useEffect, useCallback, useState } from 'react';

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

interface UseWebSocketOptions {
  url: string;
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (event: Event) => void;
  autoReconnect?: boolean;
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  autoReconnect = true,
}: UseWebSocketOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (!url) return;

    const fullUrl = url.startsWith('ws://') || url.startsWith('wss://')
      ? url
      : `${WS_BASE}${url.startsWith('/') ? url : '/' + url}`;

    try {
      const ws = new WebSocket(fullUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setIsReconnecting(false);
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch {
          onMessage?.(event.data);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        onClose?.();

        if (autoReconnect) {
          setIsReconnecting(true);
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      ws.onerror = (event) => {
        onError?.(event);
      };

      socketRef.current = ws;
    } catch (err) {
      console.error('WebSocket connection error:', err);
    }
  }, [url, onMessage, onOpen, onClose, onError, autoReconnect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      socketRef.current.send(payload);
    } else {
      console.warn('WebSocket is not open. Message not sent:', data);
    }
  }, []);

  const status = isConnected ? 'open' : isReconnecting ? 'reconnecting' : 'closed';

  return { sendMessage, isConnected, isReconnecting, status };
}
