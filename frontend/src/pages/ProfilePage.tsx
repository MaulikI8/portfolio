import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { Settings, Flame, Heart, Sparkles } from 'lucide-react';

export function ProfilePage() {
  const navigate = useNavigate(), { partner, updateAvatar } = useAuth();
  const { data: streak, loading: sL } = useFetch<any>('/api/streak');
  const { data: results, loading: rL } = useFetch<any>('/api/games/results');
  const { data: memories, loading: mL } = useFetch<any[]>('/api/memories');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = sL || rL || mL;
  const myName = partner?.name || (partner?.role === 'boyfriend' ? 'Maulik' : 'Seema');
  const avatarUrl = partner?.avatar_url || partner?.avatar || localStorage.getItem(`icecream_avatar_${partner?.role}`);
  const upcomingMemory = memories?.find((m: any) => !m.is_past), pastMemories = memories?.filter((m: any) => m.is_past) || [];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 8 * 1024 * 1024) { alert("Photo is over 8MB!"); return; }
    const reader = new FileReader();
    reader.onload = () => { if (reader.result) updateAvatar(reader.result as string); };
    reader.readAsDataURL(file);
  };

  if (isLoading) return <div style={{ padding: '1rem' }}><div className="skeleton" style={{ height: '120px', marginBottom: '1rem' }} /><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '80px' }} />)}</div></div>;

  return (
    <div style={{ padding: '1rem 0' }}>
      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
      <div className="card-surface" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div onClick={() => fileInputRef.current?.click()} style={{ width: '62px', height: '62px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--strawberry-600) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700, cursor: 'pointer', overflow: 'hidden' }}>
            {avatarUrl ? <img src={avatarUrl} alt={myName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : myName[0]}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--ink-deep)', fontWeight: 700, margin: 0 }}>{myName}</h2>
            <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--strawberry-500)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>📷 Change Picture</button>
          </div>
        </div>
        <button className="btn-quiet" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/profile/settings')}><Settings size={16} /> Settings</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="card-surface" style={{ textAlign: 'center', padding: '0.85rem 0.5rem' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--pink-primary)' }}>{results?.total_count ?? 0}</span>
          <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Games together</p>
        </div>
        <div className="card-surface" style={{ textAlign: 'center', padding: '0.85rem 0.5rem' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Flame size={20} fill="var(--gold)" color="var(--gold)" /> {streak?.current ?? 0}</span>
          <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Current streak</p>
        </div>
        <div className="card-surface" style={{ textAlign: 'center', padding: '0.85rem 0.5rem' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--magenta-accent)' }}>{streak?.longest ?? 0}</span>
          <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Longest streak</p>
        </div>
      </div>

      <div className="card-surface" style={{ padding: '1.25rem', marginBottom: '1.25rem', background: 'var(--pink-pale)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--pink-deep)', textTransform: 'uppercase' }}>NEXT DATE MEMORY</span>
        {upcomingMemory ? (
          <div style={{ marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--ink)', fontWeight: 700 }}>{upcomingMemory.title}</h3>
            <p style={{ fontSize: '2.25rem', color: 'var(--pink-primary)', fontWeight: 700 }}>{upcomingMemory.days_remaining} <span style={{ fontSize: '1rem' }}>days to go</span></p>
          </div>
        ) : (
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>Add your next date together <Heart size={16} fill="var(--coral)" color="var(--coral)" /></p>
        )}
      </div>

      <ScoreboardSection />

      <div className="card-surface" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>Past Memories <Sparkles size={18} color="var(--pink-primary)" /></h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {pastMemories.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink)' }}>{m.title}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{m.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreboardSection() {
  const { data: uno } = useFetch<any>('/api/games/scoreboard/uno');
  const { data: ludo } = useFetch<any>('/api/games/scoreboard/ludo');
  const games = [{ key: 'uno', name: 'UNO Battle', data: uno }, { key: 'ludo', name: 'Ludo Classic', data: ludo }];

  return (
    <div style={{ background: 'var(--cream-bg, #FFF9F2)', border: '3px solid #2D152B', borderRadius: '20px', padding: '1.25rem', boxShadow: '5px 5px 0px #2D152B', marginBottom: '1.25rem' }}>
      <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#2D152B', marginBottom: '1rem' }}>Overall Scoreboard</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {games.map(g => {
          const wins = g.data?.wins || { Maulik: 0, Seema: 0 }, leader = g.data?.leader || null, total = g.data?.total_games || 0;
          return (
            <div key={g.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: '#FFF', border: '2px solid #2D152B', borderRadius: '14px', boxShadow: '3px 3px 0px #2D152B' }}>
              <div><span style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: '1rem', color: '#2D152B' }}>{g.name}</span><span style={{ fontSize: '0.75rem', color: '#6B5B6E' }}>{total} total played</span></div>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: '1.15rem', color: leader === 'Maulik' ? '#FF6B6B' : '#2D152B' }}>Maulik {wins.Maulik || 0}</div>{leader === 'Maulik' && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#FF6B6B', textTransform: 'uppercase' }}>leading</span>}</div>
                <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: '#6B5B6E' }}>—</div>
                <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: '1.15rem', color: leader === 'Seema' ? '#FF6B6B' : '#2D152B' }}>Seema {wins.Seema || 0}</div>{leader === 'Seema' && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#FF6B6B', textTransform: 'uppercase' }}>leading</span>}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


