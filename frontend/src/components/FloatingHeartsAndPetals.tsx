import React from 'react';

// Floating 3D Rose Petals Component
const RosePetalSVG = ({ id }: { id: string }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: 'drop-shadow(0 4px 12px rgba(232, 86, 125, 0.45))' }}>
    <defs>
      <linearGradient id={`iceCreamPetalGrad_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F9DCE4" stopOpacity="0.95" />
        <stop offset="40%" stopColor="#E8567D" stopOpacity="0.9" />
        <stop offset="85%" stopColor="#C43F63" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#8A2843" stopOpacity="0.98" />
      </linearGradient>
    </defs>
    <path
      d="M50 5 C68 20, 95 38, 90 68 C85 92, 55 98, 50 95 C45 98, 15 92, 10 68 C5 38, 32 20, 50 5 Z"
      fill={`url(#iceCreamPetalGrad_${id})`}
    />
  </svg>
);

const HeartSVG = ({ id }: { id: string }) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" style={{ filter: 'drop-shadow(0 4px 10px rgba(245, 158, 11, 0.4))' }}>
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="url(#heartGrad)"
    />
    <defs>
      <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF758F" />
        <stop offset="100%" stopColor="#FF4D6D" />
      </linearGradient>
    </defs>
  </svg>
);

export function FloatingHeartsAndPetals() {
  const ITEMS = [
    { id: 'p1', type: 'petal', left: '5%', size: 28, speed: 16, delay: 0, rot: 20 },
    { id: 'h1', type: 'heart', left: '15%', size: 22, speed: 19, delay: 2, rot: -15 },
    { id: 'p2', type: 'petal', left: '28%', size: 32, speed: 14, delay: 5, rot: 45 },
    { id: 'h2', type: 'heart', left: '42%', size: 24, speed: 21, delay: 1, rot: -30 },
    { id: 'p3', type: 'petal', left: '56%', size: 30, speed: 17, delay: 7, rot: 35 },
    { id: 'h3', type: 'heart', left: '68%', size: 20, speed: 18, delay: 4, rot: 10 },
    { id: 'p4', type: 'petal', left: '80%', size: 26, speed: 20, delay: 3, rot: -25 },
    { id: 'h4', type: 'heart', left: '92%', size: 25, speed: 15, delay: 8, rot: 25 },
  ];

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
        opacity: 0.9,
      }}
    >
      <style>{`
        @keyframes floatUpPolished {
          0% {
            transform: translateY(105vh) rotate(0deg) scale(0.85);
            opacity: 0;
          }
          15% {
            opacity: 0.85;
          }
          85% {
            opacity: 0.85;
          }
          100% {
            transform: translateY(-15vh) rotate(360deg) scale(1.15);
            opacity: 0;
          }
        }
      `}</style>

      {/* Floating 3D Rose Petals & Glowing Hearts */}
      {ITEMS.map((item) => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            left: item.left,
            bottom: '-40px',
            width: `${item.size}px`,
            height: `${item.size}px`,
            animation: `floatUpPolished ${item.speed}s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
            animationDelay: `${item.delay}s`,
          }}
        >
          {item.type === 'petal' ? <RosePetalSVG id={item.id} /> : <HeartSVG id={item.id} />}
        </div>
      ))}
    </div>
  );
}
