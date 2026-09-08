import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { usePresenceSocket } from '../hooks/useSocket';
import { Heart, Sparkles, Flame, Calendar, Gamepad2, Play, MessageSquare, Plus, Check } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const { partner } = useAuth();
  const myRole = partner?.role || 'boyfriend';
  const partnerName = myRole === 'boyfriend' ? 'Seema' : 'Maulik';
  const myName = partner?.name || (myRole === 'boyfriend' ? 'Maulik' : 'Seema');

  const { partnerOnline } = usePresenceSocket(partner?.role || null);
  const { data: streak } = useFetch<any>('/api/social/streak');
  const { data: notes } = useFetch<any[]>('/api/social/notes');
  const { data: memories } = useFetch<any[]>('/api/social/memories');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const streakDays = streak?.current ?? streak?.current_length ?? 0;

  const notify = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  return (
    <div style={{ padding: '0.5rem 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {toastMsg && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, var(--coral-primary) 0%, var(--magenta-deep) 100%)', color: '#FFF', padding: '0.75rem 1.5rem', borderRadius: '99px', fontWeight: 700, fontSize: '0.92rem', zIndex: 9999 }}>
          {toastMsg}
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="card-surface" style={{ padding: '2rem 1.5rem', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(255,94,142,0.15) 0%, var(--surface-card) 100%)', border: '2px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.35rem 0.85rem', borderRadius: '99px', background: partnerOnline ? '#ECFDF5' : 'var(--surface-hover)', border: `1px solid ${partnerOnline ? '#10B981' : 'var(--border-subtle)'}`, color: partnerOnline ? '#10B981' : 'var(--ink-muted)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: partnerOnline ? '#10B981' : '#9CA3AF' }} />
            <span>{partnerName} is {partnerOnline ? 'Online Now' : 'Away'}</span>
          </div>
          <h1 className="font-serif" style={{ fontSize: '2.2rem', color: 'var(--ink-deep)', fontWeight: 800, margin: '0 0 0.4rem' }}>
            Welcome Back, {myName} 💕
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--ink-muted)', margin: 0, fontWeight: 500 }}>
            Your private sanctuary with {partnerName}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem' }}>
          <button onClick={() => navigate('/games/uno')} style={{ padding: '0.85rem 1.5rem', borderRadius: '99px', background: 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--magenta-deep) 100%)', color: '#FFF', border: 'none', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-glow)' }}>
            <Play size={18} fill="#FFF" /> Play UNO Now
          </button>
        </div>
      </div>

      {/* Quick Action Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {/* Streak Counter */}
        <div className="card-surface" style={{ padding: '1.5rem', borderRadius: '24px', border: '1.5px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '18px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={28} fill="#EF4444" />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink-deep)', fontFamily: 'var(--font-display)' }}>{streakDays} Days</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', fontWeight: 600 }}>Daily Play Streak 🔥</div>
          </div>
        </div>

        {/* Play Ludo */}
        <div onClick={() => navigate('/games/ludo')} className="card-surface card-interactive" style={{ padding: '1.5rem', borderRadius: '24px', border: '1.5px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '18px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gamepad2 size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ink-deep)', fontFamily: 'var(--font-serif)' }}>Ludo Classic</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', fontWeight: 600 }}>2-Player Dice Showdown 🎲</div>
          </div>
        </div>

        {/* Chat */}
        <div onClick={() => navigate('/chat')} className="card-surface card-interactive" style={{ padding: '1.5rem', borderRadius: '24px', border: '1.5px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '18px', background: 'var(--coral-soft)', color: 'var(--coral-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ink-deep)', fontFamily: 'var(--font-serif)' }}>Live Chat</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', fontWeight: 600 }}>Text, GIFs & Voice 💬</div>
          </div>
        </div>
      </div>

      {/* Love Notes Section */}
      <div style={{ width: '100%' }}>
        <div className="card-surface" style={{ padding: '1.5rem', borderRadius: '24px', border: '1.5px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={20} color="var(--strawberry-500)" fill="var(--strawberry-500)" />
              <h3 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink-deep)', margin: 0 }}>Love Notes</h3>
            </div>
            <button onClick={() => navigate('/notes')} style={{ background: 'none', border: 'none', color: 'var(--strawberry-500)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>View All →</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(!notes || notes.length === 0) ? (
              <div style={{ fontStyle: 'italic', color: 'var(--ink-muted)', fontSize: '0.85rem' }}>No notes yet. Send {partnerName} a love note!</div>
            ) : (
              notes.slice(0, 3).map((note: any) => (
                <div key={note.id} style={{ padding: '0.85rem 1rem', borderRadius: '16px', background: 'var(--surface-hover)', fontSize: '0.88rem', color: 'var(--ink-deep)', border: '1px solid var(--border-subtle)' }}>
                  "{note.content || note.text}"
                  <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginTop: '4px', textAlign: 'right' }}>— {note.sender_name || partnerName}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
