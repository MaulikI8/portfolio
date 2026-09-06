import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { useChatSocket } from '../hooks/useSocket';
import { useWebRTC } from '../hooks/useWebRTC';
import {
  ArrowLeft,
  Image as ImageIcon,
  Smile,
  Send,
  X,
  Search,
  CheckCheck,
  Phone,
  Video,
  Monitor,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
} from 'lucide-react';

interface ChatMsg {
  id: string;
  sender: string; // 'boyfriend' | 'girlfriend'
  message_type?: 'text' | 'gif' | 'sticker' | 'image';
  text?: string;
  media_url?: string;
  sticker_id?: string;
  sticker_emoji?: string;
  timestamp: string;
  time_str?: string;
  date_str?: string;
  reactions?: string[];
  is_seen?: boolean;
}

const COUPLE_STICKERS = [
  { id: 'kiss', name: 'Kiss', emoji: '💋' },
  { id: 'hug', name: 'Warm Hug', emoji: '🤗' },
  { id: 'heart_glow', name: 'Heart Glow', emoji: '💖' },
  { id: 'popcorn', name: 'Popcorn', emoji: '🍿' },
  { id: 'coffee', name: 'Coffee', emoji: '☕' },
  { id: 'cheers', name: 'Cheers', emoji: '🥂' },
  { id: 'sleepy', name: 'Sleepy', emoji: '😴' },
  { id: 'blush', name: 'Blush', emoji: '🥰' },
  { id: 'fire', name: 'On Fire', emoji: '🔥' },
  { id: 'party', name: 'Party', emoji: '🎉' },
  { id: 'sparkles', name: 'Sparkles', emoji: '✨' },
  { id: 'strawberry', name: 'Strawberry', emoji: '🍓' },
  { id: 'together', name: 'Together', emoji: '👩‍❤️‍👨' },
  { id: 'laugh', name: 'Laughing', emoji: '😂' },
  { id: 'cat', name: 'Cute Cat', emoji: '🐱' },
  { id: 'puppy', name: 'Puppy Love', emoji: '🐶' },
];

const CURATED_FALLBACK_GIFS = [
  { id: '1', title: 'Romantic Hug', url: 'https://media.tenor.com/gB39R0298B0AAAAC/hug-cuddle.gif', category: 'hug' },
  { id: '2', title: 'Sweet Kiss', url: 'https://media.tenor.com/bC82eBfD-SgAAAAC/kiss-love.gif', category: 'kiss' },
  { id: '3', title: 'Heart Love', url: 'https://media.tenor.com/tH9a8-eA-rQAAAAC/cute-love.gif', category: 'love' },
  { id: '4', title: 'Popcorn Eating', url: 'https://media.tenor.com/gK612N5-s1sAAAAC/popcorn-eating.gif', category: 'popcorn' },
  { id: '5', title: 'Cute Cuddle', url: 'https://media.tenor.com/U4W1aG9iY2sAAAAC/cat-cute.gif', category: 'cuddle' },
  { id: '6', title: 'Happy Dance', url: 'https://media.tenor.com/39p68J5O3kIAAAAC/dance-happy.gif', category: 'dance' },
  { id: '7', title: 'Waving Hi', url: 'https://media.tenor.com/6E-Q8O1lFm8AAAAC/wave-hello.gif', category: 'wave' },
  { id: '8', title: 'Goodnight Sleep', url: 'https://media.tenor.com/8Q0N97G36QMAAAAC/sleep-goodnight.gif', category: 'sleep' },
  { id: '9', title: 'Blushing Smile', url: 'https://media.tenor.com/E2m766J1N8AAAAAC/blush-smile.gif', category: 'blush' },
];

function formatMessageDateGroup(dateStr?: string): string {
  if (!dateStr) return 'Today';
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return 'Today';

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (dateObj.toDateString() === today.toDateString()) return 'Today';
  if (dateObj.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ChatPage() {
  const navigate = useNavigate();
  const { partner } = useAuth();
  const { data: history, loading, error, refetch } = useFetch<any[]>('/api/chat/history');
  
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showStickers, setShowStickers] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState('');
  const [gifResults, setGifResults] = useState<{ id: string; title: string; url: string }[]>(CURATED_FALLBACK_GIFS);
  const [gifLoading, setGifLoading] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const myRole = partner?.role || 'boyfriend';
  const partnerName = myRole === 'boyfriend' ? 'Seema' : 'Maulik';

  // Socket.IO real-time chat
  const { sendMessage: socketSendMsg, onMessage, onMessagesSeen, markSeen, partnerTyping, sendTyping } = useChatSocket();
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mark incoming messages as seen when page mounts or new message arrives
  useEffect(() => {
    markSeen();
  }, [messages.length, markSeen]);

  // Listen for messages_seen event from partner
  useEffect(() => {
    const cleanupSeen = onMessagesSeen(() => {
      setMessages((prev) =>
        prev.map((m) => (m.sender === myRole ? { ...m, is_seen: true } : m))
      );
    });
    return cleanupSeen;
  }, [onMessagesSeen, myRole]);

  // Listen for incoming messages from partner via Socket.IO
  useEffect(() => {
    const cleanup = onMessage((msg: ChatMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (msg.sender !== myRole) {
        markSeen();
      }
    });
    return cleanup;
  }, [onMessage, markSeen, myRole]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    sendTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2500);
  };

  // Live GIF search integration with 350ms debounce (Tenor v2 API + GIPHY API + Fallback)
  useEffect(() => {
    if (!showGifPicker) return;

    setGifLoading(true);
    const timer = setTimeout(async () => {
      const q = gifSearch.trim() || 'love couple';
      let fetched = false;

      // 1. Try Tenor API v2
      try {
        const res = await fetch(
          `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=LIVDSRZULEF3&client_key=icecream_app&limit=20`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const items = data.results.map((item: any) => ({
              id: item.id,
              title: item.title || item.content_description || 'GIF',
              url: item.media_formats?.tinygif?.url || item.media_formats?.gif?.url || item.media_formats?.nanogif?.url,
            })).filter((g: any) => g.url);
            if (items.length > 0) {
              setGifResults(items);
              fetched = true;
            }
          }
        }
      } catch {
        // Fallback
      }

      // 2. Try GIPHY Public Search API if Tenor failed
      if (!fetched) {
        try {
          const res = await fetch(
            `https://api.giphy.com/v1/gifs/search?api_key=gft6jY8Hk05465223049&q=${encodeURIComponent(q)}&limit=20&rating=g`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.data && data.data.length > 0) {
              const items = data.data.map((item: any) => ({
                id: item.id,
                title: item.title || 'GIF',
                url: item.images?.fixed_height_small?.url || item.images?.fixed_height?.url || item.images?.original?.url,
              })).filter((g: any) => g.url);
              if (items.length > 0) {
                setGifResults(items);
                fetched = true;
              }
            }
          }
        } catch {
          // Fallback
        }
      }

      // 3. Unblocked Curated Fallback GIFs if network APIs fail or query filters local list
      if (!fetched) {
        const matched = CURATED_FALLBACK_GIFS.filter(g =>
          g.title.toLowerCase().includes(q.toLowerCase()) ||
          g.category.toLowerCase().includes(q.toLowerCase())
        );
        setGifResults(matched.length > 0 ? matched : CURATED_FALLBACK_GIFS);
      }

      setGifLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [gifSearch, showGifPicker]);

  useEffect(() => {
    if (history && history.length > 0) {
      setMessages(history);
    } else {
      // Default initial warm chat state if history is empty
      setMessages([
        {
          id: '1',
          sender: partnerName === 'Seema' ? 'girlfriend' : 'boyfriend',
          message_type: 'text',
          text: `Hey! Can't wait for our movie night tonight 🍿✨`,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          time_str: '10:15 AM',
          date_str: new Date().toISOString().split('T')[0],
          reactions: ['💖'],
        },
        {
          id: '2',
          sender: myRole,
          message_type: 'text',
          text: `Setting everything up right now! Ready when you are 💖`,
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          time_str: '10:45 AM',
          date_str: new Date().toISOString().split('T')[0],
          reactions: [],
        },
      ]);
    }
  }, [history, partnerName, myRole]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showStickers, showGifPicker]);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const msgPayload = {
      text: input.trim(),
      message_type: 'text',
    };

    // Send via Socket.IO — the server will broadcast and we'll receive it back
    socketSendMsg(msgPayload);
    setInput('');
    sendTyping(false);
  };

  const handleSendSticker = (sticker: { id: string; emoji: string }) => {
    socketSendMsg({
      message_type: 'sticker',
      sticker_id: sticker.id,
      sticker_emoji: sticker.emoji,
    });
    setShowStickers(false);
  };

  const handleSendGif = (gifUrl: string) => {
    socketSendMsg({
      message_type: 'gif',
      media_url: gifUrl,
    });
    setShowGifPicker(false);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      notify("That photo's a bit large — try one under 8MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;
      socketSendMsg({
        message_type: 'image',
        media_url: imageUrl,
      });
    };
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddReaction = (msgId: string, emojiStr: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          const currentRx = m.reactions || [];
          const hasRx = currentRx.includes(emojiStr);
          const updated = hasRx ? currentRx.filter((r) => r !== emojiStr) : [...currentRx, emojiStr];
          return { ...m, reactions: updated };
        }
        return m;
      })
    );
    setHoveredMsgId(null);
  };

  // Group messages by Date
  const groupedMessages: { date: string; msgs: ChatMsg[] }[] = [];
  messages.forEach((msg) => {
    const groupDate = formatMessageDateGroup(msg.date_str || msg.timestamp);
    const existingGroup = groupedMessages.find((g) => g.date === groupDate);
    if (existingGroup) {
      existingGroup.msgs.push(msg);
    } else {
      groupedMessages.push({ date: groupDate, msgs: [msg] });
    }
  });

  // WebRTC Audio, Video & Screen Share Calling
  const {
    activeCall,
    incomingCall,
    isAudioMuted,
    isVideoMuted,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMuteAudio,
    toggleMuteVideo,
  } = useWebRTC(myRole);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        maxHeight: '100vh',
        position: 'relative',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
      }}
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--strawberry-500)',
            color: '#FFFFFF',
            padding: '0.65rem 1.25rem',
            borderRadius: '99px',
            fontWeight: 700,
            fontSize: '0.88rem',
            boxShadow: 'var(--shadow-cta-strawberry)',
            zIndex: 999999,
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX PHOTO VIEWER */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            cursor: 'zoom-out',
          }}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={22} />
          </button>
          <img
            src={lightboxUrl}
            alt="Enlarged photo"
            style={{
              maxWidth: '94vw',
              maxHeight: '88vh',
              borderRadius: '16px',
              objectFit: 'contain',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            }}
          />
        </div>
      )}
      {/* INCOMING CALL OVERLAY MODAL */}
      {incomingCall && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="card-surface animate-bounce-in"
            style={{
              background: 'var(--surface-card)',
              borderRadius: '28px',
              padding: '2rem',
              textAlign: 'center',
              maxWidth: '340px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
              border: '2px solid var(--strawberry-500)',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'var(--strawberry-500-15)',
                color: 'var(--strawberry-500)',
                fontSize: '1.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              {incomingCall.fromName ? incomingCall.fromName[0] : '💕'}
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--ink-deep)' }}>Incoming {incomingCall.callType.toUpperCase()} Call</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
              {incomingCall.fromName} is calling you...
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
              <button
                onClick={rejectCall}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  border: 'none',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)',
                }}
              >
                <PhoneOff size={24} />
              </button>
              <button
                onClick={() => acceptCall()}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#10B981',
                  border: 'none',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
                }}
              >
                <Phone size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE CALL FULLSCREEN OVERLAY MODAL */}
      {activeCall && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999998,
            background: '#0F172A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem 1rem',
          }}
        >
          {/* Header info */}
          <div style={{ textAlign: 'center', color: '#fff', zIndex: 10 }}>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.3rem' }}>{activeCall.partnerName}</h3>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              {activeCall.status === 'calling' ? 'Ringing...' : 'Connected'} • {activeCall.type.toUpperCase()}
            </span>
          </div>

          {/* Main Remote Video Stream */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '70vh',
              maxWidth: '800px',
              borderRadius: '24px',
              overflow: 'hidden',
              background: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Local Video Mini PiP */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                width: '110px',
                height: '150px',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#334155',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              }}
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              padding: '0.75rem 1.5rem',
              borderRadius: '99px',
            }}
          >
            <button
              onClick={toggleMuteAudio}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: isAudioMuted ? '#EF4444' : 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button
              onClick={toggleMuteVideo}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: isVideoMuted ? '#EF4444' : 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
            </button>

            <button
              onClick={endCall}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#EF4444',
                border: 'none',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)',
              }}
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      )}

      {/* COMPACT CHAT HEADER WITH CALL BUTTONS */}
      <div
        className="card-surface"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          borderRadius: '20px',
          background: 'var(--surface-card)',
          border: '1.5px solid var(--border-subtle)',
          marginBottom: '0.75rem',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="btn-quiet"
            onClick={() => navigate('/')}
            style={{ padding: '6px', borderRadius: '50%', background: 'var(--surface-muted, rgba(255,255,255,0.06))', border: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft size={18} color="var(--ink-deep)" />
          </button>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--ink-deep)', fontWeight: 700, margin: 0 }}>
              {partnerName}
            </h3>
            <span style={{ fontSize: '0.75rem', color: partnerTyping ? 'var(--strawberry-500)' : '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: partnerTyping ? 'var(--strawberry-500)' : '#10B981' }} />
              {partnerTyping ? 'Typing...' : 'Online now'}
            </span>
          </div>
        </div>

        {/* Real WebRTC Call Actions: Audio, Video & Screen Share */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => startCall('audio')}
            title="Start Audio Call"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--surface-hover)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--strawberry-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Phone size={17} />
          </button>

          <button
            onClick={() => startCall('video')}
            title="Start Video Call"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--surface-hover)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--strawberry-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Video size={17} />
          </button>

          <button
            onClick={() => startCall('screenshare')}
            title="Share Screen"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--surface-hover)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--strawberry-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Monitor size={17} />
          </button>
        </div>
      </div>

      {/* 2. CHAT MESSAGES AREA (Flex End Anchored to Bottom) */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.5rem 0.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: '1rem',
        }}
      >
        {loading && <p style={{ textAlign: 'center', color: 'var(--ink-muted)' }}>Loading chat...</p>}
        {error && (
          <div style={{ background: 'var(--surface-card)', padding: '0.75rem', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--strawberry-500)' }}>Failed to load chat history. </span>
            <button className="btn-quiet" onClick={() => refetch()} style={{ color: 'var(--strawberry-500)', fontWeight: 700 }}>Retry</button>
          </div>
        )}

        {/* Render Grouped Messages with Date Dividers */}
        {groupedMessages.map((group) => (
          <div key={group.date} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Centered Session Date Divider */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.5rem 0' }}>
              <span
                style={{
                  background: 'var(--surface-muted, rgba(255,255,255,0.08))',
                  color: 'var(--ink-muted)',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.25rem 0.85rem',
                  borderRadius: '99px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                {group.date}
              </span>
            </div>

            {group.msgs.map((m) => {
              const isMe = m.sender === myRole;
              const isSticker = m.message_type === 'sticker';
              const isImage = m.message_type === 'image';
              const isGif = m.message_type === 'gif';
              const isHovered = hoveredMsgId === m.id;

              return (
                <div
                  key={m.id}
                  onMouseEnter={() => setHoveredMsgId(m.id)}
                  onMouseLeave={() => setHoveredMsgId(null)}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: isSticker ? '140px' : '78%',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                  }}
                >
                  {/* Reaction Toolbar Overlay on Long Press / Hover */}
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-32px',
                        right: isMe ? '0' : 'auto',
                        left: isMe ? 'auto' : '0',
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '99px',
                        padding: '0.2rem 0.5rem',
                        display: 'flex',
                        gap: '0.35rem',
                        boxShadow: 'var(--shadow-soft)',
                        zIndex: 30,
                      }}
                    >
                      {['❤️', '😂', '😮', '🔥', '👍', '💋'].map((emojiStr) => (
                        <button
                          key={emojiStr}
                          onClick={() => handleAddReaction(m.id, emojiStr)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.3)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                          {emojiStr}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 1. BARE STICKER (NO BUBBLE CONTAINER) */}
                  {isSticker ? (
                    <div style={{ padding: '0.2rem', cursor: 'pointer', fontSize: '4.5rem', userSelect: 'none' }}>
                      {m.sticker_emoji || '💖'}
                    </div>
                  ) : isGif ? (
                    /* 2. GIF EDGE-TO-EDGE BUBBLE */
                    <div
                      style={{
                        borderRadius: '20px',
                        overflow: 'hidden',
                        maxWidth: '240px',
                        border: isMe ? '1.5px solid rgba(232, 86, 125, 0.4)' : '1.5px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-soft)',
                        background: 'var(--surface-card)',
                      }}
                    >
                      <img
                        src={m.media_url}
                        alt="GIF"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://media.tenor.com/39p68J5O3kIAAAAC/dance-happy.gif';
                        }}
                      />
                    </div>
                  ) : isImage ? (
                    /* 3. PHOTO ATTACHMENT BUBBLE (EDGE-TO-EDGE WITH LIGHTBOX CLICK) */
                    <div
                      onClick={() => m.media_url && setLightboxUrl(m.media_url)}
                      style={{
                        borderRadius: '20px',
                        overflow: 'hidden',
                        maxWidth: '240px',
                        border: isMe ? '1.5px solid rgba(232, 86, 125, 0.4)' : '1.5px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-soft)',
                        cursor: 'pointer',
                        background: 'var(--surface-card)',
                      }}
                    >
                      <img src={m.media_url} alt="Shared Photo" style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </div>
                  ) : (
                    /* 4. STANDARD TEXT BUBBLE (STRAWBERRY ME vs DARK SURFACE PARTNER) */
                    <div
                      style={{
                        background: isMe
                          ? 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--strawberry-600) 100%)'
                          : 'var(--surface-card)',
                        color: isMe ? 'var(--vanilla-50, #FBF3E7)' : 'var(--ink-deep)',
                        borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        padding: '0.75rem 1.1rem',
                        border: isMe ? 'none' : '1.5px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-soft)',
                        fontSize: '0.94rem',
                        lineHeight: 1.45,
                        fontWeight: 500,
                      }}
                    >
                      {m.text}
                    </div>
                  )}

                  {/* Reaction Pills on Bubble */}
                  {m.reactions && m.reactions.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '2px',
                        marginTop: '0.2rem',
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '99px',
                        padding: '0.1rem 0.4rem',
                        fontSize: '0.72rem',
                      }}
                    >
                      {m.reactions.map((rx, idx) => (
                        <span key={idx}>{rx}</span>
                      ))}
                    </div>
                  )}

                  {/* Message Timestamp & Double-Check Seen Status Indicator */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '0.2rem',
                      fontSize: '0.68rem',
                      color: 'var(--ink-muted)',
                      fontWeight: 500,
                    }}
                  >
                    <span>{m.time_str || 'Just now'}</span>
                    {isMe && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCheck size={14} color={m.is_seen ? '#3B82F6' : 'var(--ink-muted)'} />
                        {m.is_seen && <span style={{ fontSize: '0.65rem', color: '#3B82F6', fontWeight: 700 }}>Seen</span>}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 3. STICKER PICKER OVERLAY SHEET */}
      {showStickers && (
        <div
          className="card-surface"
          style={{
            position: 'absolute',
            bottom: '76px',
            left: '0',
            right: '0',
            background: 'var(--surface-card)',
            border: '2px solid var(--border-strong)',
            borderRadius: '24px',
            padding: '1rem',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
            zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-deep)' }}>Couple Reaction Stickers</span>
            <button onClick={() => setShowStickers(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)' }}>
              <X size={18} />
            </button>
          </div>

          <div className="no-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
            {COUPLE_STICKERS.map((st) => (
              <button
                key={st.id}
                onClick={() => handleSendSticker(st)}
                style={{
                  background: 'var(--surface-muted, rgba(255,255,255,0.06))',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '0.5rem',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span>{st.emoji}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--ink-muted)', fontWeight: 600 }}>{st.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. GIF PICKER OVERLAY SHEET */}
      {showGifPicker && (
        <div
          className="card-surface"
          style={{
            position: 'absolute',
            bottom: '76px',
            left: '0',
            right: '0',
            background: 'var(--surface-card)',
            border: '2px solid var(--border-strong)',
            borderRadius: '24px',
            padding: '1rem',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
            zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-deep)' }}>Search Couple GIFs</span>
            <button onClick={() => setShowGifPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-muted, rgba(255,255,255,0.06))', border: '1px solid var(--border-subtle)', borderRadius: '99px', padding: '0.4rem 0.85rem', marginBottom: '0.75rem' }}>
            <Search size={16} color="var(--ink-muted)" />
            <input
              type="text"
              placeholder="Search GIFs..."
              value={gifSearch}
              onChange={(e) => setGifSearch(e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--ink-deep)', fontSize: '0.85rem' }}
            />
          </div>

          {gifLoading ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--ink-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
              Searching GIFs...
            </div>
          ) : gifResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--ink-muted)', fontSize: '0.85rem' }}>
              No GIFs found for "{gifSearch}"
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', maxHeight: '180px', overflowY: 'auto' }}>
              {gifResults.map((g) => (
                <div
                  key={g.id}
                  onClick={() => handleSendGif(g.url)}
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    height: '85px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--surface-muted, rgba(255,255,255,0.06))',
                  }}
                >
                  <img
                    src={g.url}
                    alt={g.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      // Fallback if an image link fails to load
                      e.currentTarget.src = 'https://media.tenor.com/gB39R0298B0AAAAC/hug-cuddle.gif';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input for Photos */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handlePhotoSelect}
        style={{ display: 'none' }}
      />

      {/* 5. RICH MEDIA COMPOSE BAR */}
      <form
        onSubmit={handleSendText}
        className="card-surface"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.55rem 0.85rem',
          borderRadius: '99px',
          background: 'var(--surface-card)',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-soft)',
          zIndex: 40,
        }}
      >
        {/* Media Action Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {/* Photo Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--strawberry-500)', display: 'flex', alignItems: 'center', padding: '4px' }}
            title="Attach Photo"
          >
            <ImageIcon size={20} />
          </button>

          {/* Sticker Button */}
          <button
            type="button"
            onClick={() => {
              setShowStickers(!showStickers);
              setShowGifPicker(false);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pistachio-accent, #8FAE7E)', display: 'flex', alignItems: 'center', padding: '4px' }}
            title="Stickers"
          >
            <Smile size={20} />
          </button>

          {/* GIF Badge Button */}
          <button
            type="button"
            onClick={() => {
              setShowGifPicker(!showGifPicker);
              setShowStickers(false);
            }}
            style={{
              background: 'var(--strawberry-500-15)',
              color: 'var(--strawberry-500)',
              border: '1px solid rgba(232, 86, 125, 0.3)',
              borderRadius: '8px',
              padding: '0.2rem 0.45rem',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
            title="GIFs"
          >
            GIF
          </button>
        </div>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder={`Type a message to ${partnerName}...`}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--ink-deep)',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        />

        {/* Send Button */}
        <button
          type="submit"
          className="btn-primary"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--strawberry-600) 100%)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(232, 86, 125, 0.35)',
          }}
        >
          <Send size={16} color="#FFFFFF" />
        </button>
      </form>
    </div>
  );
}


