import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Mail, Gamepad2, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface GirlfriendWelcomeModalProps {
  isOpen?: boolean; onClose?: () => void; onPlayUno?: () => void;
}

export function GirlfriendWelcomeModal({ isOpen: externalIsOpen, onClose: externalOnClose, onPlayUno: externalOnPlayUno }: GirlfriendWelcomeModalProps) {
  const navigate = useNavigate(), { partner } = useAuth();
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const isGirlfriend = partner?.role === 'girlfriend';

  useEffect(() => {
    const alreadySeen = localStorage.getItem('seema_welcome_intro_seen') === 'true';
    if (!isGirlfriend || alreadySeen) { setInternalIsOpen(false); return; }
    localStorage.setItem('seema_welcome_intro_seen', 'true');
    setInternalIsOpen(externalIsOpen !== undefined ? externalIsOpen : true);
  }, [externalIsOpen, isGirlfriend]);

  const handleDismiss = () => { localStorage.setItem('seema_welcome_intro_seen', 'true'); setInternalIsOpen(false); if (externalOnClose) externalOnClose(); };
  const handleStartUno = () => { localStorage.setItem('seema_welcome_intro_seen', 'true'); setInternalIsOpen(false); if (externalOnPlayUno) externalOnPlayUno(); else navigate('/games/uno'); };

  if (!isGirlfriend || !internalIsOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem', background: 'rgba(15, 6, 14, 0.82)', backdropFilter: 'blur(16px)' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '520px', background: 'var(--surface-card)', borderRadius: '32px', border: '2px solid var(--border-subtle)', padding: '2.25rem 1.75rem 2rem', boxShadow: '0 25px 70px rgba(0, 0, 0, 0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <button onClick={handleDismiss} style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'var(--surface-muted, rgba(255,255,255,0.08))', border: '1px solid var(--border-subtle)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink-muted)' }}><X size={18} /></button>

        <div style={{ position: 'relative', width: '180px', height: '110px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--strawberry-600) 100%)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--strawberry-600) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(232, 86, 125, 0.5)' }}>
              <Heart size={26} color="#FFF" fill="#FFF" />
            </div>
          </div>
        </div>

        <div style={{ width: '100%', background: 'var(--strawberry-500-15)', border: '2px dashed var(--strawberry-500)', borderRadius: '20px', padding: '1.35rem 1.25rem', marginBottom: '1.75rem' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--strawberry-500)', lineHeight: 1.45, textTransform: 'uppercase', margin: 0 }}>
            HIIIIIII BABYYYYY WELCOME HERE MERO SANU I LOVE YOU SOOOOOOOOOOO MUCH BABY LETS PLAY UNO FIRST
          </p>
        </div>

        <button onClick={handleStartUno} style={{ width: '100%', padding: '0.95rem 1.5rem', borderRadius: '99px', background: 'linear-gradient(135deg, var(--coral-primary) 0%, var(--magenta-deep) 100%)', color: '#FFF', border: 'none', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', boxShadow: '0 10px 25px rgba(255, 94, 142, 0.38)' }}>
          <Gamepad2 size={22} color="#FFF" />
          <span>LET&apos;S PLAY UNO NOW</span>
          <ArrowRight size={20} color="#FFF" />
        </button>
      </div>
    </div>
  );
}

