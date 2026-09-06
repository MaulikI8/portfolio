import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { chatAPI, gamesAPI } from '../api/client';
import { Avatar } from '../components/Avatar';
import { Navbar } from '../components/Navbar';
import { HeartIcon, GamepadIcon, MailIcon, CandleIcon } from '../components/Icons';
import type { ChatMessage } from '../api/types';
import './ChatScreen.css';

export function ChatScreen() {
  const { partner } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myRole = partner?.role || 'boyfriend';
  const opponentRole = myRole === 'boyfriend' ? 'girlfriend' : 'boyfriend';
  const opponentName = opponentRole === 'girlfriend' ? 'Seema' : 'Maulik';

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await chatAPI.getMessages();
      setMessages(data);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const handleMessage = useCallback((data: any) => {
    if (data.type === 'message') {
      setMessages((prev) => [...prev, data.message]);
      scrollToBottom();
    } else if (data.type === 'typing') {
      if (data.sender_role !== myRole) {
        setIsTyping(data.is_typing);
      }
    }
  }, [myRole]);

  const wsUrl = partner ? `/ws/chat/?partner_id=${partner.id}` : '';
  const { sendMessage, status } = useWebSocket({
    url: wsUrl,
    onMessage: handleMessage,
  });

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    sendMessage({ type: 'message', content: text.trim() });
    setText('');
    sendMessage({ type: 'typing', is_typing: false });
  };

  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    sendMessage({ type: 'typing', is_typing: e.target.value.length > 0 });
  };

  const handleQuickInvite = async (gameType: string) => {
    try {
      const res = await gamesAPI.createRoom(gameType);
      const roomId = res.data.id;
      const inviteMsg = `Let's play ${gameType.toUpperCase()} together! Tap here to join: /room/${roomId}`;
      sendMessage({ type: 'message', content: inviteMsg });
    } catch (err) {
      console.error('Failed to create invite:', err);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="chat-header__partner">
          <Avatar name={opponentName} size="sm" isOnline />
          <div className="chat-header__info">
            <h2>
              {opponentName} <HeartIcon size={16} color="var(--muted-rose)" fill="var(--muted-rose)" />
            </h2>
            <small>{status === 'open' ? 'Live Connected' : 'Connecting...'}</small>
          </div>
        </div>

        <div className="quick-game-dropdown">
          <button className="btn btn--secondary btn--sm" onClick={() => handleQuickInvite('tictactoe')}>
            <GamepadIcon size={16} color="var(--parchment)" style={{ marginRight: 4 }} />
            Invite Tic-Tac-Toe
          </button>
        </div>
      </header>

      <main className="chat-messages-area">
        {messages.map((msg) => {
          const isMine = msg.sender_role === myRole;
          const isRoomInvite = msg.content.includes('/room/');

          return (
            <div
              key={msg.id}
              className={`chat-bubble-wrapper ${isMine ? 'chat-bubble-wrapper--mine' : ''}`}
            >
              <div className={`chat-bubble ${isMine ? 'chat-bubble--mine' : ''}`}>
                <p className="chat-bubble__content">{msg.content}</p>

                {isRoomInvite && (
                  <button
                    className="btn btn--primary btn--sm invite-join-btn"
                    onClick={() => {
                      const match = msg.content.match(/\/room\/(\d+)/);
                      if (match) navigate(`/room/${match[1]}`);
                    }}
                  >
                    <CandleIcon size={16} color="var(--plum-900)" style={{ marginRight: 4 }} />
                    Join Game Room
                  </button>
                )}

                <span className="chat-bubble__time">{msg.created_at}</span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="typing-indicator">
            <span>{opponentName} is typing</span>
            <div className="typing-dots">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <form onSubmit={handleSend} className="chat-input-bar">
        <input
          type="text"
          className="input chat-input"
          placeholder={`Message ${opponentName}...`}
          value={text}
          onChange={handleTypingChange}
        />
        <button type="submit" className="btn btn--primary send-msg-btn" disabled={!text.trim()}>
          <MailIcon size={16} color="var(--plum-900)" style={{ marginRight: 4 }} />
          Send
        </button>
      </form>

      <Navbar />
    </div>
  );
}
