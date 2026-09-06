import { Heart, Gamepad2, Flame, Trophy } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';

const RELATIONSHIP_START_DATE = '2026-04-09';

function calculateRelationshipDays(startDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const difference = today.getTime() - start.getTime();
  return Math.max(1, Math.floor(difference / 86400000) + 1);
}

const IceCreamIcon = ({ size = 22, color = 'var(--strawberry-500)' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7 11 4.18 9.29a2 2 0 0 0 3.64 0L19 11" />
    <path d="M5.14 11a4.5 4.5 0 1 1 7.72-3.17A4.5 4.5 0 0 1 18.86 11Z" />
  </svg>
);

export function ContentFooter() {
  const { data: streakData } = useFetch<any>('/api/social/streak');
  const { data: gamesHistory } = useFetch<any[]>('/api/games/history');

  const daysTogether = calculateRelationshipDays(RELATIONSHIP_START_DATE);
  const gamesPlayed = gamesHistory?.length ?? 0;
  const dayStreak = streakData?.current ?? streakData?.current_length ?? 0;
  const bestRecord = streakData?.longest ?? streakData?.longest_length ?? dayStreak;

  return (
    <footer
      className="card-surface"
      style={{
        marginTop: '2.5rem',
        padding: '1.5rem',
        background: 'var(--surface-card)',
        border: '2px solid var(--border-strong)',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-soft)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Brand Badge */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <IceCreamIcon size={22} color="var(--strawberry-500)" />
          <h2 className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--ink-deep)', fontWeight: 700, margin: 0 }}>
            Ice Cream
          </h2>
        </div>
      </div>

      {/* Relationship Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        <div
          style={{
            background: 'var(--coral-soft)',
            border: '1.5px solid rgba(255, 94, 142, 0.3)',
            borderRadius: '16px',
            padding: '0.85rem 0.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Heart size={14} color="var(--coral-primary)" fill="var(--coral-primary)" />
            <span className="us-display" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--coral-primary)' }}>
              {daysTogether}
            </span>
          </div>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--ink-muted)', letterSpacing: '0.04em' }}>DAYS TOGETHER</p>
        </div>

        <div
          style={{
            background: 'rgba(255, 174, 99, 0.15)',
            border: '1.5px solid rgba(255, 174, 99, 0.3)',
            borderRadius: '16px',
            padding: '0.85rem 0.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Gamepad2 size={16} color="var(--peach-accent)" />
            <span className="us-display" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--peach-accent)' }}>
              {gamesPlayed}
            </span>
          </div>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--ink-muted)', letterSpacing: '0.04em' }}>GAMES PLAYED</p>
        </div>

        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1.5px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '0.85rem 0.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Flame size={16} color="#EF4444" fill="#EF4444" />
            <span className="us-display" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#EF4444' }}>
              {dayStreak}
            </span>
          </div>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--ink-muted)', letterSpacing: '0.04em' }}>DAY STREAK</p>
        </div>

        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1.5px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            padding: '0.85rem 0.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Trophy size={15} color="var(--pistachio-emerald)" />
            <span className="us-display" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--pistachio-emerald)' }}>
              {bestRecord}
            </span>
          </div>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--ink-muted)', letterSpacing: '0.04em' }}>BEST RECORD</p>
        </div>
      </div>
    </footer>
  );
}

