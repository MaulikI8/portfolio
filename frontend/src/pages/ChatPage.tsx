import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { useChatSocket } from '../hooks/useSocket';
import { useCall } from '../contexts/CallContext';
import { ArrowLeft, Phone, Video, Monitor, CheckCheck, Search, Image as ImageIcon, Smile, Send, Sparkles } from 'lucide-react';
import api from '../api/client';

interface ChatMsg {
  id: string; sender: string; message_type?: 'text' | 'gif' | 'sticker' | 'image'; text?: string; media_url?: string;
  sticker_id?: string; sticker_emoji?: string; timestamp: string; time_str?: string; date_str?: string; reactions?: string[]; is_seen?: boolean;
}

const COUPLE_STICKERS = [
  { id: 'kiss', name: 'Kiss', emoji: '💋' }, { id: 'hug', name: 'Warm Hug', emoji: '🤗' }, { id: 'heart_glow', name: 'Heart Glow', emoji: '💖' },
  { id: 'popcorn', name: 'Popcorn', emoji: '🍿' }, { id: 'coffee', name: 'Coffee', emoji: '☕' }, { id: 'cheers', name: 'Cheers', emoji: '🥂' },
  { id: 'sleepy', name: 'Sleepy', emoji: '😴' }, { id: 'blush', name: 'Blush', emoji: '🥰' }, { id: 'fire', name: 'On Fire', emoji: '🔥' },
  { id: 'party', name: 'Party', emoji: '🎉' }, { id: 'sparkles', name: 'Sparkles', emoji: '✨' }, { id: 'strawberry', name: 'Strawberry', emoji: '🍓' },
  { id: 'together', name: 'Together', emoji: '👩‍❤️‍👨' }, { id: 'laugh', name: 'Laughing', emoji: '😂' }, { id: 'cat', name: 'Cute Cat', emoji: '🐱' }, { id: 'puppy', name: 'Puppy Love', emoji: '🐶' }
];

const CURATED_FALLBACK_GIFS = [
  { id: '1', title: 'Romantic Hug', url: 'https://media.tenor.com/gB39R0298B0AAAAC/hug-cuddle.gif' },
  { id: '2', title: 'Sweet Kiss', url: 'https://media.tenor.com/bC82eBfD-SgAAAAC/kiss-love.gif' },
  { id: '3', title: 'Heart Love', url: 'https://media.tenor.com/tH9a8-eA-rQAAAAC/cute-love.gif' },
  { id: '4', title: 'Popcorn Eating', url: 'https://media.tenor.com/gK612N5-s1sAAAAC/popcorn-eating.gif' },
  { id: '5', title: 'Cute Cuddle', url: 'https://media.tenor.com/U4W1aG9iY2sAAAAC/cat-cute.gif' },
  { id: '6', title: 'Happy Dance', url: 'https://media.tenor.com/39p68J5O3kIAAAAC/dance-happy.gif' },
  { id: '7', title: 'Waving Hi', url: 'https://media.tenor.com/6E-Q8O1lFm8AAAAC/wave-hello.gif' },
  { id: '8', title: 'Goodnight Sleep', url: 'https://media.tenor.com/8Q0N97G36QMAAAAC/sleep-goodnight.gif' },
  { id: '9', title: 'Blushing Smile', url: 'https://media.tenor.com/E2m766J1N8AAAAAC/blush-smile.gif' }
];

function formatMessageDateGroup(dateStr?: string): string {
  if (!dateStr) return 'Today';
  const d = new Date(dateStr); if (isNaN(d.getTime())) return 'Today';
  const today = new Date(); const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatMsgLocalTime(timestamp?: string, timeStrFallback?: string): string {
  if (timestamp) { const d = new Date(timestamp); if (!isNaN(d.getTime())) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  return timeStrFallback || 'Just now';
}

export function ChatPage() {
  const navigate = useNavigate(); const { partner } = useAuth();
  const { data: history } = useFetch<any[]>('/api/chat/history');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showStickers, setShowStickers] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState('');
  const [gifResults, setGifResults] = useState(CURATED_FALLBACK_GIFS);
  const [gifLoading, setGifLoading] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const myRole = partner?.role || 'boyfriend';
  const partnerName = myRole === 'boyfriend' ? 'Seema' : 'Maulik';

  const { sendMessage: socketSendMsg, onMessage, onMessagesSeen, markSeen, partnerTyping, sendTyping } = useChatSocket();
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { startCall, acceptCall } = useCall();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.autoAcceptCall) { acceptCall(location.state.autoAcceptCall); window.history.replaceState({}, document.title); }
  }, [location.state, acceptCall]);

  useEffect(() => { markSeen(); }, [messages.length, markSeen]);
  useEffect(() => { const cleanup = onMessagesSeen(() => setMessages((p) => p.map((m) => (m.sender === myRole ? { ...m, is_seen: true } : m)))); return cleanup; }, [onMessagesSeen, myRole]);
  useEffect(() => { const cleanup = onMessage((msg: ChatMsg) => { setMessages((p) => (p.some((m) => m.id === msg.id) ? p : [...p, msg])); if (msg.sender !== myRole) markSeen(); }); return cleanup; }, [onMessage, markSeen, myRole]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value); sendTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => sendTyping(false), 2500);
  };

  useEffect(() => {
    if (!showGifPicker) return; setGifLoading(true);
    const timer = setTimeout(async () => {
      const q = gifSearch.trim() || 'love couple';
      try {
        const res = await fetch(`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=LIVDSRZULEF3&client_key=icecream_app&limit=20`);
        if (res.ok) {
          const data = await res.json();
          if (data.results?.length > 0) {
            setGifResults(data.results.map((item: any) => ({ id: item.id, title: item.title || 'GIF', url: item.media_formats.gif.url })));
            setGifLoading(false); return;
          }
        }
      } catch {}
      setGifResults(CURATED_FALLBACK_GIFS.filter((g) => g.title.toLowerCase().includes(q.toLowerCase()))); setGifLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [gifSearch, showGifPicker]);

  useEffect(() => {
    if (history && Array.isArray(history)) {
      setMessages(history.map((item: any) => ({ id: item.id || Date.now().toString(), sender: item.sender || 'boyfriend', message_type: item.message_type || 'text', text: item.text || item.content || '', media_url: item.media_url, sticker_id: item.sticker_id, sticker_emoji: item.sticker_emoji, timestamp: item.timestamp || new Date().toISOString(), time_str: item.time_str, date_str: item.date_str, reactions: item.reactions || [], is_seen: item.is_seen || false })));
    }
  }, [history]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendText = async () => {
    const text = input.trim(); if (!text) return;
    const tempId = Date.now().toString();
    const tempMsg: ChatMsg = {
      id: tempId, sender: myRole, message_type: 'text', text,
      timestamp: new Date().toISOString(), time_str: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), date_str: new Date().toISOString().split('T')[0], reactions: [], is_seen: false
    };
    setMessages(prev => prev.some(m => m.id === tempId) ? prev : [...prev, tempMsg]);
    setInput(''); sendTyping(false);
    socketSendMsg({ text, message_type: 'text', role: myRole, sender: myRole });
    try { await api.post('/api/chat/messages', { text, message_type: 'text', role: myRole }); } catch {}
  };

  const handleSendSticker = async (st: typeof COUPLE_STICKERS[0]) => {
    const tempId = Date.now().toString();
    const tempMsg: ChatMsg = {
      id: tempId, sender: myRole, message_type: 'sticker', sticker_id: st.id, sticker_emoji: st.emoji, text: `[Sticker: ${st.name}]`,
      timestamp: new Date().toISOString(), time_str: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), date_str: new Date().toISOString().split('T')[0], reactions: [], is_seen: false
    };
    setMessages(prev => prev.some(m => m.id === tempId) ? prev : [...prev, tempMsg]);
    setShowStickers(false);
    socketSendMsg({ message_type: 'sticker', sticker_id: st.id, sticker_emoji: st.emoji, text: `[Sticker: ${st.name}]`, role: myRole, sender: myRole });
    try { await api.post('/api/chat/messages', { message_type: 'sticker', sticker_id: st.id, sticker_emoji: st.emoji, text: `[Sticker: ${st.name}]`, role: myRole }); } catch {}
  };

  const handleSendGif = async (gif: { url: string; title: string }) => {
    const tempId = Date.now().toString();
    const tempMsg: ChatMsg = {
      id: tempId, sender: myRole, message_type: 'gif', media_url: gif.url, text: `[GIF: ${gif.title}]`,
      timestamp: new Date().toISOString(), time_str: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), date_str: new Date().toISOString().split('T')[0], reactions: [], is_seen: false
    };
    setMessages(prev => prev.some(m => m.id === tempId) ? prev : [...prev, tempMsg]);
    setShowGifPicker(false);
    socketSendMsg({ message_type: 'gif', media_url: gif.url, text: `[GIF: ${gif.title}]`, role: myRole, sender: myRole });
    try { await api.post('/api/chat/messages', { message_type: 'gif', media_url: gif.url, text: `[GIF: ${gif.title}]`, role: myRole }); } catch {}
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const media_url = reader.result as string;
      const tempId = Date.now().toString();
      const tempMsg: ChatMsg = {
        id: tempId, sender: myRole, message_type: 'image', media_url, text: '[Image]',
        timestamp: new Date().toISOString(), time_str: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), date_str: new Date().toISOString().split('T')[0], reactions: [], is_seen: false
      };
      setMessages(prev => prev.some(m => m.id === tempId) ? prev : [...prev, tempMsg]);
      socketSendMsg({ message_type: 'image', media_url, text: '[Image]', role: myRole, sender: myRole });
      try { await api.post('/api/chat/messages', { message_type: 'image', media_url, text: '[Image]', role: myRole }); } catch {}
    };
    reader.readAsDataURL(file);
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    setMessages((prev) => prev.map((m) => {
      if (m.id !== msgId) return m;
      const cur = m.reactions || []; const hasIt = cur.includes(emoji);
      return { ...m, reactions: hasIt ? cur.filter((r) => r !== emoji) : [...cur, emoji] };
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 170px)', maxHeight: 'calc(100dvh - 170px)', background: 'var(--surface-card)', borderRadius: '24px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-soft)', overflow: 'hidden' }}>
      {lightboxUrl && <div onClick={() => setLightboxUrl(null)} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={lightboxUrl} alt="Enlarged" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '16px' }} /></div>}

      {/* Chat Header */}
      <header style={{ padding: '0.85rem 1.25rem', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer' }}><ArrowLeft size={20} /></button>
          <div>
            <h2 className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink-deep)' }}>Chat with {partnerName} 💕</h2>
            <div style={{ fontSize: '0.75rem', color: partnerTyping ? 'var(--strawberry-500)' : 'var(--pistachio-accent)', fontWeight: 600 }}>{partnerTyping ? `${partnerName} is typing...` : 'Active Now'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => startCall('audio')} style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--strawberry-500-15)', border: 'none', color: 'var(--strawberry-500)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Voice Call"><Phone size={18} /></button>
          <button onClick={() => startCall('video')} style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--strawberry-500-15)', border: 'none', color: 'var(--strawberry-500)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Video Call"><Video size={18} /></button>
        </div>
      </header>

      {/* Messages List */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {messages.map((m) => {
          const isMine = m.sender === myRole;
          return (
            <div key={m.id} onMouseEnter={() => setHoveredMsgId(m.id)} onMouseLeave={() => setHoveredMsgId(null)} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '75%', position: 'relative' }}>
              <div style={{ background: isMine ? 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--magenta-deep) 100%)' : 'var(--bg-app)', color: isMine ? '#FFF' : 'var(--ink-deep)', padding: '0.75rem 1rem', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px', border: isMine ? 'none' : '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-soft)' }}>
                {m.message_type === 'image' && m.media_url && <img src={m.media_url} onClick={() => setLightboxUrl(m.media_url!)} alt="Upload" style={{ width: '100%', borderRadius: '12px', cursor: 'pointer', marginBottom: '4px' }} />}
                {m.message_type === 'gif' && m.media_url && <img src={m.media_url} alt="GIF" style={{ width: '100%', borderRadius: '12px', marginBottom: '4px' }} />}
                {m.message_type === 'sticker' && <div style={{ fontSize: '3rem', textAlign: 'center' }}>{m.sticker_emoji}</div>}
                {m.text && m.message_type === 'text' && <div style={{ fontSize: '0.92rem', lineHeight: 1.45 }}>{m.text}</div>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px', fontSize: '0.68rem', opacity: 0.8 }}>
                  <span>{formatMsgLocalTime(m.timestamp, m.time_str)}</span>
                  {isMine && <CheckCheck size={14} color={m.is_seen ? '#FFD700' : 'rgba(255,255,255,0.7)'} />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Stickers & GIF Drawers */}
      {showStickers && (
        <div style={{ padding: '0.85rem', background: 'var(--bg-app)', borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px' }}>
          {COUPLE_STICKERS.map((st) => <button key={st.id} onClick={() => handleSendSticker(st)} style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer' }}>{st.emoji}</button>)}
        </div>
      )}

      {/* Input Bar */}
      <footer style={{ padding: '0.75rem 1rem', background: 'var(--bg-app)', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
        <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer' }}><ImageIcon size={20} /></button>
        <button onClick={() => setShowStickers(!showStickers)} style={{ background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer' }}><Smile size={20} /></button>
        <input value={input} onChange={handleInputChange} onKeyDown={(e) => e.key === 'Enter' && handleSendText()} placeholder={`Message ${partnerName}...`} style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '99px', border: '1px solid var(--border-subtle)', background: 'var(--surface-card)', color: 'var(--ink-deep)', outline: 'none' }} />
        <button onClick={handleSendText} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--strawberry-500)', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Send size={18} /></button>
      </footer>
    </div>
  );
}
