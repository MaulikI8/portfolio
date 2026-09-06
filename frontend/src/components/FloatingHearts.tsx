import { useMemo } from 'react';

interface Particle {
  id: number;
  left: string;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  drift: number;
  color: string;
}

const COLORS = ['#FF5C8A', '#FFD6E4', '#C93B8F'];

export function FloatingHearts() {
  const particles = useMemo<Particle[]>(() => {
    const list: Particle[] = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const size = Math.floor(14 + Math.random() * 22); // 14px to 36px
      const opacity = Number((0.06 + Math.random() * 0.12).toFixed(3)); // 0.06 to 0.18
      const duration = Number((14 + Math.random() * 12).toFixed(1)); // 14s to 26s
      const delay = Number((Math.random() * 14).toFixed(1));
      const drift = Math.floor(-40 + Math.random() * 80); // -40px to 40px
      const left = `${Math.floor(Math.random() * 96)}%`;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      list.push({ id: i, left, size, opacity, duration, delay, drift, color });
    }
    return list;
  }, []);

  return (
    <div className="floating-hearts-layer" aria-hidden="true">
      {particles.map((p) => (
        <svg
          key={p.id}
          viewBox="0 0 24 24"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            fill: p.color,
            animation: `floatUp ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            ['--drift' as any]: `${p.drift}px`,
          }}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ))}
    </div>
  );
}
