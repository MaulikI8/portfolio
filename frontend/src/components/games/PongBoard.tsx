interface BoardProps {
  state: any;
  onMove: (payload: any) => void;
}

export function PongBoard({ state, onMove }: BoardProps) {
  const ball = state?.ball || { x: 50, y: 50 };

  return (
    <div
      onMouseMove={(e) => onMove({ type: 'paddle_move', y: e.clientY })}
      style={{ width: '100%', height: '200px', background: 'var(--ink)', borderRadius: 'var(--radius-card)', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: `${ball.y}%`, left: `${ball.x}%`, width: '12px', height: '12px', background: 'var(--pink-primary)', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
      <span style={{ position: 'absolute', bottom: '10px', right: '10px', color: '#fff', fontSize: '0.75rem', opacity: 0.6 }}>Move cursor to control paddle</span>
    </div>
  );
}
