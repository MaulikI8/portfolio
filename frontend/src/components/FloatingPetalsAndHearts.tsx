// Floating 3D Rose Petals Component

const RosePetalSVG = ({ id }: { id: string }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: 'drop-shadow(0 4px 10px rgba(232, 86, 125, 0.35))' }}>
    <defs>
      <linearGradient id={`iceCreamPetalGrad_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F9DCE4" stopOpacity="0.9" />
        <stop offset="40%" stopColor="#E8567D" stopOpacity="0.85" />
        <stop offset="85%" stopColor="#C43F63" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#8A2843" stopOpacity="0.95" />
      </linearGradient>
    </defs>
    <path
      d="M50 5 C68 20, 95 38, 90 68 C85 92, 55 98, 50 95 C45 98, 15 92, 10 68 C5 38, 32 20, 50 5 Z"
      fill={`url(#iceCreamPetalGrad_${id})`}
    />
  </svg>
);

export function FloatingPetalsAndHearts() {
  const PETALS = [
    { id: 'p1', left: '6%', size: 28, speed: 18, delay: 0, rot: 20 },
    { id: 'p2', left: '22%', size: 22, speed: 22, delay: 3, rot: -30 },
    { id: 'p3', left: '38%', size: 32, speed: 16, delay: 6, rot: 45 },
    { id: 'p4', left: '55%', size: 24, speed: 20, delay: 1, rot: -15 },
    { id: 'p5', left: '72%', size: 30, speed: 17, delay: 8, rot: 35 },
    { id: 'p6', left: '88%', size: 26, speed: 21, delay: 4, rot: -25 },
  ];

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
        opacity: 0.85,
      }}
    >
      <style>{`
        @keyframes floatUpPolished {
          0% {
            transform: translateY(105vh) rotate(0deg) scale(0.85);
            opacity: 0;
          }
          15% {
            opacity: 0.65;
          }
          85% {
            opacity: 0.65;
          }
          100% {
            transform: translateY(-15vh) rotate(360deg) scale(1.1);
            opacity: 0;
          }
        }
      `}</style>

      {/* Floating 3D Rose Petals Layer */}
      {PETALS.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            bottom: '-40px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `floatUpPolished ${p.speed}s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <RosePetalSVG id={p.id} />
        </div>
      ))}
    </div>
  );
}
