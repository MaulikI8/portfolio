import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Mail,
  Gamepad2,
  ArrowRight,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface GirlfriendWelcomeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onPlayUno?: () => void;
}

export function GirlfriendWelcomeModal({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onPlayUno: externalOnPlayUno,
}: GirlfriendWelcomeModalProps) {
  const navigate = useNavigate();
  const { partner } = useAuth();
  
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const [letterUnfolded, setLetterUnfolded] = useState<boolean>(false);

  // Determine if current logged-in user is Girlfriend (Seema)
  const isGirlfriend = partner?.role === 'girlfriend';

  useEffect(() => {
    const alreadySeen = localStorage.getItem('seema_welcome_intro_seen') === 'true';
    if (!isGirlfriend || alreadySeen) {
      setInternalIsOpen(false);
      return;
    }

    if (externalIsOpen !== undefined) {
      setInternalIsOpen(externalIsOpen);
    } else {
      setInternalIsOpen(true);
    }
  }, [externalIsOpen, isGirlfriend]);

  useEffect(() => {
    if (internalIsOpen) {
      // Sequence opening animations
      const timer = setTimeout(() => setLetterUnfolded(true), 800);
      return () => clearTimeout(timer);
    } else {
      setLetterUnfolded(false);
    }
  }, [internalIsOpen]);

  const handleDismiss = () => {
    localStorage.setItem('seema_welcome_intro_seen', 'true');
    setInternalIsOpen(false);
    if (externalOnClose) externalOnClose();
  };

  const handleStartUno = () => {
    localStorage.setItem('seema_welcome_intro_seen', 'true');
    setInternalIsOpen(false);
    if (externalOnPlayUno) {
      externalOnPlayUno();
    } else {
      navigate('/games/uno');
    }
  };

  if (!isGirlfriend || !internalIsOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        background: 'rgba(15, 6, 14, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        animation: 'fadeIn 0.4s ease-out',
      }}
    >
      {/* Background Floating Hearts Particle Atmosphere */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(i * 7.5 + 3) % 94}%`,
              top: `${(i * 9 + 5) % 90}%`,
              opacity: 0.25 + (i % 5) * 0.15,
              transform: `scale(${0.8 + (i % 3) * 0.4})`,
              animation: `floatHeart ${4 + (i % 4)}s infinite ease-in-out alternate`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            <Heart size={28} color="var(--coral-primary)" fill="var(--coral-primary)" />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popUp {
          0% { transform: scale(0.85) translateY(30px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes floatHeart {
          0% { transform: translateY(0px) rotate(-6deg); }
          100% { transform: translateY(-24px) rotate(8deg); }
        }
        @keyframes letterSlideUp {
          0% { transform: translateY(60px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 25px rgba(255, 94, 142, 0.4), 0 0 50px rgba(255, 174, 99, 0.2); }
          50% { box-shadow: 0 0 45px rgba(255, 94, 142, 0.7), 0 0 80px rgba(255, 174, 99, 0.4); }
          100% { box-shadow: 0 0 25px rgba(255, 94, 142, 0.4), 0 0 50px rgba(255, 174, 99, 0.2); }
        }
        @keyframes flapOpen {
          0% { transform: rotateX(0deg); }
          100% { transform: rotateX(180deg); }
        }
        @keyframes shimmerBtn {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Main Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          background: 'var(--surface-card)',
          borderRadius: '32px',
          border: '2px solid var(--border-subtle)',
          padding: '2.25rem 1.75rem 2rem 1.75rem',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.6)',
          animation: 'popUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Close Icon */}
        <button
          onClick={handleDismiss}
          aria-label="Close intro"
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            background: 'var(--surface-muted, rgba(255,255,255,0.08))',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--ink-muted)',
            zIndex: 10,
            transition: 'all 0.2s ease',
          }}
        >
          <X size={18} />
        </button>

        {/* Love Letter Envelope Graphic */}
        <div
          style={{
            position: 'relative',
            width: '180px',
            height: '130px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Envelope Body */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--strawberry-600) 100%)',
              borderRadius: '18px',
              boxShadow: '0 12px 30px rgba(232, 86, 125, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'visible',
            }}
          >
            {/* Sealed / Unfolding Letter Container */}
            <div
              style={{
                position: 'absolute',
                top: '-15px',
                width: '88%',
                height: '110px',
                background: 'var(--surface-card)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: letterUnfolded ? 'translateY(-30px) scale(1.05)' : 'translateY(10px) scale(0.95)',
                zIndex: 2,
              }}
            >
              <Mail size={28} color="var(--strawberry-500)" />
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                <Heart size={14} color="var(--strawberry-500)" fill="var(--strawberry-500)" />
                <Heart size={14} color="var(--pistachio-accent, #8FAE7E)" fill="var(--pistachio-accent, #8FAE7E)" />
                <Heart size={14} color="var(--strawberry-600)" fill="var(--strawberry-600)" />
              </div>
            </div>

            {/* Glowing Heart Seal */}
            <div
              style={{
                position: 'absolute',
                zIndex: 4,
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--strawberry-500) 0%, var(--strawberry-600) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(232, 86, 125, 0.5)',
                animation: 'pulseGlow 2.5s infinite alternate',
              }}
            >
              <Heart size={26} color="#FFFFFF" fill="#FFFFFF" />
            </div>
          </div>
        </div>

        {/* Main Romantic Intro Greeting Text */}
        <div
          style={{
            animation: letterUnfolded ? 'letterSlideUp 0.6s ease-out forwards' : 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.85rem',
            marginBottom: '1.75rem',
            width: '100%',
          }}
        >
          {/* Exact Text Block Requested with Dark Mode Contrast */}
          <div
            style={{
              width: '100%',
              background: 'var(--strawberry-500-15)',
              border: '2px dashed var(--strawberry-500)',
              borderRadius: '20px',
              padding: '1.35rem 1.25rem',
            }}
          >
            <p
              className="us-display"
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--strawberry-500)',
                lineHeight: 1.45,
                letterSpacing: '0.01em',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              HIIIIIII BABYYYYY WELCOME HERE MERO SANU I LOVE YOU SOOOOOOOOOOO MUCH BABY LETS PLAY UNO FIRST
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <button
            onClick={handleStartUno}
            style={{
              width: '100%',
              padding: '0.95rem 1.5rem',
              borderRadius: '99px',
              background: 'linear-gradient(135deg, var(--coral-primary) 0%, var(--magenta-deep) 100%)',
              backgroundSize: '200% 200%',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: '1.05rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              boxShadow: '0 10px 25px rgba(255, 94, 142, 0.38)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease',
              animation: 'shimmerBtn 4s ease infinite',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 14px 30px rgba(255, 94, 142, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 94, 142, 0.38)';
            }}
          >
            <Gamepad2 size={22} color="#FFFFFF" />
            <span>LET&apos;S PLAY UNO NOW</span>
            <ArrowRight size={20} color="#FFFFFF" />
          </button>
        </div>
      </div>
    </div>
  );
}
