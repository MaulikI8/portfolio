import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Grid, Layers, Dices, Swords, CircleDot, Grid3x3, Ship, Fish, Heart, Play } from 'lucide-react';

const ICON_MAP: Record<string, any> = { Grid, Layers, Dices, Swords, CircleDot, Grid3x3, Ship, Fish };

export function GamesIndexPage() {
  const navigate = useNavigate(), [toast, setToast] = useState<string | null>(null);

  const playable = [
    { slug: 'uno', name: 'UNO Classic', hook: 'Draw cards, wild colors and call UNO!', icon: Layers, isUno: true },
    { slug: 'ludo', name: 'Ludo Classic', hook: '4-token race to home base!', icon: Dices, isUno: false },
  ];
  const upcoming = [
    { name: 'Tic-Tac-Toe', icon: Grid }, { name: 'Chess', icon: Swords }, { name: 'Checkers', icon: CircleDot },
    { name: 'Connect 4', icon: Grid3x3 }, { name: 'Battleship', icon: Ship }, { name: 'Go Fish', icon: Fish },
  ];

  return (
    <div style={{ padding: '0.5rem 0 2.5rem', position: 'relative' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, var(--coral-primary) 0%, var(--magenta-deep) 100%)', color: '#FFF', padding: '0.75rem 1.5rem', borderRadius: '99px', fontWeight: 700, fontSize: '0.92rem', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Heart size={18} fill="#FFF" /><span>{toast}</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--coral-soft)', color: 'var(--coral-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Gamepad2 size={26} /></div>
        <h1 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--ink-deep)', fontWeight: 700, margin: 0 }}>Couple Games</h1>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Play size={18} color="var(--coral-primary)" fill="var(--coral-primary)" />
          <h2 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--ink-deep)', fontWeight: 700, margin: 0 }}>Ready to Play</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {playable.map(game => {
            const Icon = game.icon;
            return (
              <div key={game.slug} onClick={() => navigate(`/games/${game.slug}`)} className="card-surface card-interactive" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '24px', border: '2px solid var(--border-strong)', background: game.isUno ? 'linear-gradient(135deg, rgba(255, 94, 142, 0.12) 0%, var(--surface-card) 100%)' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, var(--surface-card) 100%)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: game.isUno ? 'var(--coral-soft)' : '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={26} color={game.isUno ? 'var(--coral-primary)' : '#10B981'} /></div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#10B981', background: '#ECFDF5', padding: '0.3rem 0.85rem', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '4px' }}><Play size={12} fill="#10B981" /> PLAY NOW</span>
                </div>
                <div><h3 className="font-serif" style={{ fontSize: '1.3rem', color: 'var(--ink-deep)', fontWeight: 700, margin: '0 0 0.25rem' }}>{game.name}</h3><p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', margin: 0 }}>{game.hook}</p></div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Heart size={18} color="var(--magenta-deep)" fill="var(--magenta-deep)" />
          <h2 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--ink-deep)', fontWeight: 700, margin: 0 }}>Coming Soon My Love</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
          {upcoming.map((g, i) => {
            const Icon = g.icon;
            return (
              <div key={i} onClick={() => { setToast('Coming soon my love! 💖'); setTimeout(() => setToast(null), 3000); }} className="card-surface card-interactive" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderRadius: '20px', border: '1px dashed var(--border-subtle)', background: 'var(--surface-card)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--coral-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={18} color="var(--coral-primary)" /></div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--magenta-deep)', background: 'rgba(255, 94, 142, 0.12)', padding: '0.2rem 0.55rem', borderRadius: '99px' }}>Coming soon</span>
                </div>
                <div><h3 className="font-serif" style={{ fontSize: '1.05rem', color: 'var(--ink-deep)', fontWeight: 700, margin: '0 0 0.15rem' }}>{g.name}</h3><p style={{ fontSize: '0.78rem', color: 'var(--magenta-deep)', margin: 0 }}>Coming soon my love</p></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

