import { useState, useEffect } from 'react';
import { Heart, Sparkles, RotateCcw, X, Scroll } from 'lucide-react';

const MASTER_REASONS = [
  "That we met in a random Instagram group, of all places, and somehow that turned into this.",
  "The way our late-night calls turn into 2am conversations.",
  "How you can make even a boring day feel like an event just by calling.",
  "Your voice, especially when you're half asleep on a call and still don't want to hang up.",
  "The way you laugh, like it takes over your whole face, not just a sound.",
  "When you sing even when you don't think anyone's listening.",
  "How you baby me when I need it most.",
  "The way you get genuinely, fully happy over little things. It's contagious.",
  "How competitive you get playing Uno with me.",
  "That you want to watch a movie with me even when we can't be in the same room.",
  "The specific way you react during a movie.",
  "How a call with you at midnight fixes a day that felt unfixable at noon.",
  "That you have a whole different, softer voice for late-night calls than daytime ones.",
  "The way you get playful and freaky sometimes and completely catch me off guard.",
  "How your laugh is different depending on whether it's a real laugh or a \"you're not funny but I'll laugh anyway\" laugh, and I can tell which is which now.",
  "That falling asleep on a call with you counts as one of my favorite ways to fall asleep.",
  "How you go from soft and babying me to fully unhinged competitive during Uno in about two seconds.",
  "The way you say goodnight like you actually mean it every single time.",
  "That somehow a random Instagram group turned into the person I talk to every day.",
  "How you sing along to songs you clearly don't fully know the words to, with full confidence.",
  "The way you get happy for me over things that don't even matter that much, just because they matter to me.",
  "How you can turn \"I'm bored\" into a two hour phone call like it's nothing.",
  "That your voice is the last thing I want to hear before I sleep more nights than not.",
  "How you're soft with me one minute and absolutely feral over an Uno win the next.",
  "That out of an entire random group chat, it was you."
];

interface LoveJarProps {
  role?: 'boyfriend' | 'girlfriend' | string;
}

export function LoveJar({ role = 'girlfriend' }: LoveJarProps) {
  const isGirlfriend = role === 'girlfriend';
  const STORAGE_KEY = 'seema_love_jar_drawn_indices';

  const [drawnIndices, setDrawnIndices] = useState<number[]>([]);
  const [currentReason, setCurrentReason] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [justRefilled, setJustRefilled] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setDrawnIndices(JSON.parse(saved));
      }
    } catch {
      setDrawnIndices([]);
    }
  }, []);

  const availableIndices = MASTER_REASONS.map((_, idx) => idx).filter(
    (idx) => !drawnIndices.includes(idx)
  );

  const drawNewReason = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    let pool = availableIndices;

    if (pool.length === 0) {
      if (isGirlfriend) {
        // For girlfriend (Seema), if jar is empty, do NOT auto-refill. Prompt that Maulik will refill it!
        alert("The jar is currently empty! Maulik will refill it for you soon 💕");
        return;
      } else {
        // Maulik drawing when empty auto-refills
        pool = MASTER_REASONS.map((_, idx) => idx);
        setDrawnIndices([]);
        localStorage.removeItem(STORAGE_KEY);
        setJustRefilled(true);
        setTimeout(() => setJustRefilled(false), 4000);
      }
    }

    const randomIndex = pool[Math.floor(Math.random() * pool.length)];
    const newDrawn = [...drawnIndices, randomIndex];

    setDrawnIndices(newDrawn);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDrawn));
    setCurrentReason(MASTER_REASONS[randomIndex]);
    setIsRevealed(true);
  };

  const remainingCount = MASTER_REASONS.length - drawnIndices.length;

  return (
    <div
      className="card-surface"
      style={{
        padding: '1.5rem 1.75rem',
        borderRadius: '24px',
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, var(--surface-card) 0%, rgba(232, 86, 125, 0.08) 100%)',
        border: '1.5px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-level-1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes jarShake {
          0% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(-8deg) scale(1.05); }
          40% { transform: rotate(8deg) scale(1.05); }
          60% { transform: rotate(-6deg) scale(1.03); }
          80% { transform: rotate(6deg) scale(1.03); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes noteUnfold {
          0% { transform: scale(0.7) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 200px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '16px',
              background: 'var(--strawberry-500-15)',
              border: '1px solid rgba(232, 86, 125, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Scroll size={22} color="var(--strawberry-500)" />
          </div>
          <div>
            <h3 className="font-serif" style={{ fontSize: 'clamp(1.05rem, 4vw, 1.35rem)', fontWeight: 700, color: 'var(--ink-deep)', margin: 0 }}>
              Reasons I Love You Jar
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 500 }}>
              {remainingCount} / {MASTER_REASONS.length} notes remaining before refill
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: 'var(--strawberry-500)',
            background: 'var(--strawberry-500-15)',
            padding: '0.25rem 0.75rem',
            borderRadius: '99px',
            border: '1px solid rgba(232, 86, 125, 0.25)',
            whiteSpace: 'nowrap',
          }}
        >
          {isGirlfriend ? "Seema's Jar 💌" : 'Written for Seema ❤️'}
        </span>
      </div>

      {justRefilled && (
        <div
          style={{
            background: 'var(--strawberry-500)',
            color: '#FFFFFF',
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '1rem',
            textAlign: 'center',
          }}
        >
          ✨ Jar refilled with all 25 notes of love!
        </div>
      )}

      {/* Main Interactive Container */}
      {isGirlfriend ? (
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          {/* Glass Jar SVG Visual Representation */}
          <div
            onClick={drawNewReason}
            className={isShaking ? 'animate-jar-shake' : ''}
            style={{
              cursor: remainingCount > 0 ? 'pointer' : 'default',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              animation: isShaking ? 'jarShake 0.5s ease-in-out' : 'none',
              transition: 'transform 0.2s ease',
              marginBottom: '1rem',
            }}
            title="Tap to draw a reason!"
          >
            <div
              style={{
                width: '100px',
                height: '120px',
                borderRadius: '20px 20px 28px 28px',
                border: '3px solid var(--strawberry-500)',
                background: 'rgba(232, 86, 125, 0.08)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(232, 86, 125, 0.25)',
              }}
            >
              {/* Wooden Jar Lid */}
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  width: '76px',
                  height: '14px',
                  background: '#D6A85A',
                  borderRadius: '6px',
                  border: '2px solid #8A6020',
                }}
              />
              {/* Floating Hearts inside Jar */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', padding: '10px' }}>
                {Array.from({ length: Math.min(6, Math.max(1, remainingCount)) }).map((_, i) => (
                  <Heart
                    key={i}
                    size={16 + (i % 3) * 4}
                    fill="var(--strawberry-500)"
                    color="var(--strawberry-500)"
                    style={{ opacity: 0.75 + (i % 3) * 0.1 }}
                  />
                ))}
              </div>
            </div>
            <span
              style={{
                marginTop: '0.65rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: 'var(--strawberry-500)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {remainingCount > 0 ? (
                <>
                  <Sparkles size={16} /> Tap jar to draw a note
                </>
              ) : (
                <>
                  <Heart size={16} color="var(--strawberry-500)" /> Jar empty — Maulik will refill soon!
                </>
              )}
            </span>
          </div>

          <button
            className="btn-primary"
            onClick={drawNewReason}
            disabled={remainingCount === 0}
            style={{
              width: '100%',
              maxWidth: '280px',
              padding: '0.75rem',
              borderRadius: '99px',
              background: remainingCount > 0
                ? 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--strawberry-600) 100%)'
                : 'var(--surface-muted, rgba(255,255,255,0.12))',
              color: remainingCount > 0 ? '#FFFFFF' : 'var(--ink-muted)',
              fontWeight: 700,
              fontSize: '0.92rem',
              border: 'none',
              cursor: remainingCount > 0 ? 'pointer' : 'not-allowed',
              boxShadow: remainingCount > 0 ? 'var(--shadow-cta-strawberry)' : 'none',
            }}
          >
            {remainingCount > 0 ? '💌 Draw a Reason' : 'Jar Empty (Maulik Will Refill 💕)'}
          </button>
        </div>
      ) : (
        /* Boyfriend Seat (Maulik View) */
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-deep)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
            Seema can tap this jar on her home screen to draw non-repeating pre-written notes of why you love her!
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={drawNewReason}
              className="btn-secondary"
              style={{
                flex: '1 1 130px',
                padding: '0.65rem 1rem',
                borderRadius: '99px',
                border: '1px solid var(--border-subtle)',
                color: 'var(--ink-deep)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Preview Note
            </button>
            <button
              onClick={() => {
                setDrawnIndices([]);
                localStorage.removeItem(STORAGE_KEY);
                alert('Jar refilled for Seema!');
              }}
              className="btn-quiet"
              style={{
                flex: '1 1 130px',
                padding: '0.65rem 1rem',
                borderRadius: '99px',
                color: 'var(--strawberry-500)',
                background: 'var(--strawberry-500-15)',
                border: '1px solid rgba(232, 86, 125, 0.3)',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <RotateCcw size={15} /> Refill Jar
            </button>
          </div>
        </div>
      )}

      {/* REVEAL NOTE MODAL */}
      {isRevealed && currentReason && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 5, 18, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setIsRevealed(false)}
        >
          <div
            className="card-surface"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '380px',
              background: 'var(--surface-card)',
              border: '2px solid var(--strawberry-500)',
              borderRadius: '28px',
              padding: '2rem 1.75rem',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              animation: 'noteUnfold 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setIsRevealed(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--surface-muted, rgba(255,255,255,0.08))',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--ink-muted)',
              }}
            >
              <X size={18} />
            </button>

            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--strawberry-600) 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                boxShadow: '0 6px 18px rgba(232, 86, 125, 0.4)',
              }}
            >
              <Heart size={28} fill="#FFFFFF" />
            </div>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--strawberry-500)',
                letterSpacing: '0.05em',
              }}
            >
              Reason Why I Love You
            </span>

            <p
              className="font-serif"
              style={{
                fontSize: '1.25rem',
                lineHeight: 1.5,
                color: 'var(--ink-deep)',
                margin: '1rem 0 1.5rem',
                fontWeight: 600,
              }}
            >
              "{currentReason}"
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                className="btn-primary"
                onClick={drawNewReason}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '99px',
                  background: 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--strawberry-600) 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-cta-strawberry)',
                }}
              >
                Draw Another Reason 💌
              </button>
              <button
                className="btn-quiet"
                onClick={() => setIsRevealed(false)}
                style={{ color: 'var(--ink-muted)', fontWeight: 600, fontSize: '0.85rem' }}
              >
                Keep in my heart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
