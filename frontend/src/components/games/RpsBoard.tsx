import { Hand, FileText, Scissors } from 'lucide-react';

interface BoardProps {
  state: any;
  onMove: (payload: any) => void;
}

export function RpsBoard({ onMove }: BoardProps) {
  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>Choose your gesture:</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        {[
          { choice: 'rock', icon: <Hand size={28} />, label: 'Rock' },
          { choice: 'paper', icon: <FileText size={28} />, label: 'Paper' },
          { choice: 'scissors', icon: <Scissors size={28} />, label: 'Scissors' },
        ].map((item) => (
          <button
            key={item.choice}
            onClick={() => onMove({ type: 'pick', choice: item.choice })}
            className="btn-secondary"
            style={{ padding: '1rem 1.25rem', flexDirection: 'column', gap: '0.4rem', alignItems: 'center', display: 'flex' }}
          >
            <span>{item.icon}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

