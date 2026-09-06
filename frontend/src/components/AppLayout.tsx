import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { BottomTabBar } from './BottomTabBar';
import { FloatingHeartsAndPetals } from './FloatingHeartsAndPetals';
import { ErrorBoundary } from './ErrorBoundary';
import { useAuth } from '../contexts/AuthContext';
import { useSocketConnection, useNudgeSocket, useNotificationSocket, useLoveNoteSocket, getSocketInstance } from '../hooks/useSocket';
import { Sparkles, Heart, Bell, Gamepad2, X, PhoneCall, PhoneOff } from 'lucide-react';

function playIncomingRingtone() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch {
    // Ignore audio context autoplay block
  }
}

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { partner } = useAuth();
  const isGameRoute = location.pathname.startsWith('/games/');

  // Maintain socket connection & online status identification
  const { partnerOnline } = useSocketConnection(partner?.role || null);

  const { onNudge } = useNudgeSocket();
  const { onNotification } = useNotificationSocket();
  const { onLoveNote } = useLoveNoteSocket();

  const [toast, setToast] = useState<{ icon: any; title: string; body: string; route?: string } | null>(null);
  const [gameInvite, setGameInvite] = useState<{ senderName: string; gameType: string; gameSlug: string; message: string } | null>(null);
  const [callInvite, setCallInvite] = useState<{ fromName: string; callType: string; offer: any } | null>(null);

  useEffect(() => {
    const unsubNudge = onNudge(({ fromName, emoji, label }) => {
      setToast({
        icon: Sparkles,
        title: `${fromName} sent a moment!`,
        body: `${emoji} ${label}`,
      });
    });

    const unsubNotif = onNotification((notif) => {
      setToast({
        icon: Bell,
        title: notif.title || 'New Notification',
        body: notif.body || '',
      });
    });

    const unsubNote = onLoveNote((note) => {
      setToast({
        icon: Heart,
        title: `Love Note from ${note.sender_name || 'Partner'} 💕`,
        body: note.content || 'Thinking of you!',
        route: '/notes',
      });
    });

    const socket = getSocketInstance();
    const handleGameNudge = (data: any) => {
      const gameType = data.gameType || 'UNO';
      const slug = gameType.toLowerCase();
      setToast({
        icon: Sparkles,
        title: `🎮 ${data.senderName} is waiting in ${gameType}!`,
        body: 'Tap here to join the match together!',
        route: `/games/${slug}`,
      });
    };

    const handleGameInviteModal = (data: any) => {
      const slug = (data.gameSlug || data.gameType || 'uno').toLowerCase();
      if (location.pathname.startsWith(`/games/${slug}`)) {
        return;
      }
      setGameInvite({
        senderName: data.senderName || 'Your Partner',
        gameType: data.gameType || 'UNO',
        gameSlug: slug,
        message: data.message || `${data.senderName} invited you to play!`,
      });
    };

    const handleIncomingCallModal = (data: any) => {
      console.log('[AppLayout] Global incoming call received:', data);
      playIncomingRingtone();

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Incoming ${data.callType || 'Call'} from ${data.fromName || 'Partner'}! 📞`, {
          body: 'Tap to answer and connect live!',
          icon: '/seema/favicon.ico',
        });
      } else if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      setCallInvite({
        fromName: data.fromName || (partner?.role === 'boyfriend' ? 'Seema' : 'Maulik'),
        callType: data.callType || 'video',
        offer: data.offer,
      });
    };

    const handleEndCallModal = () => setCallInvite(null);

    socket.on('game_nudge_toast', handleGameNudge);
    socket.on('game_invite_modal', handleGameInviteModal);
    socket.on('incoming_call', handleIncomingCallModal);
    socket.on('end_call', handleEndCallModal);
    socket.on('call_rejected', handleEndCallModal);

    return () => {
      unsubNudge();
      unsubNotif();
      unsubNote();
      socket.off('game_nudge_toast', handleGameNudge);
      socket.off('game_invite_modal', handleGameInviteModal);
      socket.off('incoming_call', handleIncomingCallModal);
      socket.off('end_call', handleEndCallModal);
      socket.off('call_rejected', handleEndCallModal);
    };
  }, [onNudge, onNotification, onLoveNote, partner]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <>
      <FloatingHeartsAndPetals />

      {/* BIG GAME INVITATION MODAL POPUP (Appears over any page) */}
      {gameInvite && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(10, 8, 20, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              background: 'linear-gradient(145deg, #1e1b2e 0%, #12101d 100%)',
              border: '2px solid rgba(255, 105, 180, 0.4)',
              borderRadius: '24px',
              padding: '28px 24px',
              boxShadow: '0 20px 50px rgba(255, 77, 109, 0.35), 0 0 30px rgba(255, 105, 180, 0.2)',
              textAlign: 'center',
              position: 'relative',
              color: '#FFFFFF',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setGameInvite(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#AAA',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            {/* Glowing Icon Badge */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF4D6D 0%, #FF758F 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 0 25px rgba(255, 77, 109, 0.6)',
              }}
            >
              <Gamepad2 size={38} color="#FFFFFF" />
            </div>

            {/* Header Title */}
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#FFF', margin: '0 0 8px', fontWeight: 800 }}>
              🎮 Game Invite!
            </h2>

            {/* Main Message */}
            <p style={{ fontSize: '1.05rem', color: '#F1F5F9', margin: '0 0 6px', fontWeight: 600 }}>
              <span style={{ color: '#FF758F', fontWeight: 800 }}>{gameInvite.senderName}</span> is inviting you to play{' '}
              <span style={{ color: '#FFD166', fontWeight: 800 }}>{gameInvite.gameType}</span>!
            </p>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '0 0 24px', fontStyle: 'italic' }}>
              Match starts automatically when you accept!
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => {
                  const targetSlug = gameInvite.gameSlug;
                  setGameInvite(null);
                  navigate(`/games/${targetSlug}`);
                }}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #FF4D6D 0%, #D81B60 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(255, 77, 109, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'transform 0.15s ease',
                }}
              >
                <Sparkles size={20} color="#FFF" />
                <span>Accept & Join {gameInvite.gameType} Now</span>
              </button>

              <button
                onClick={() => setGameInvite(null)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'transparent',
                  color: '#CBD5E1',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Decline / Play Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL INCOMING CALL NOTIFICATION MODAL POPUP */}
      {callInvite && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999999,
            background: 'rgba(10, 8, 20, 0.88)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              background: 'linear-gradient(145deg, #1e1028 0%, #12091c 100%)',
              border: '2.5px solid var(--strawberry-500)',
              borderRadius: '28px',
              padding: '28px 24px',
              boxShadow: '0 25px 60px rgba(232, 86, 125, 0.4)',
              textAlign: 'center',
              position: 'relative',
              color: '#FFFFFF',
            }}
          >
            {/* Glowing Ringing Icon */}
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF4D6D 0%, #FF758F 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                boxShadow: '0 0 35px rgba(255, 77, 109, 0.7)',
              }}
            >
              <PhoneCall size={40} color="#FFFFFF" className="animate-bounce" />
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#FFF', margin: '0 0 8px', fontWeight: 800 }}>
              📞 Incoming {callInvite.callType.toUpperCase()} Call
            </h2>

            <p style={{ fontSize: '1.05rem', color: '#F1F5F9', margin: '0 0 6px', fontWeight: 700 }}>
              <span style={{ color: '#FF758F', fontWeight: 800 }}>{callInvite.fromName}</span> is calling you live!
            </p>

            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '0 0 24px', fontStyle: 'italic' }}>
              Tap Accept to connect video & mic audio
            </p>

            <div style={{ display: 'flex', gap: '14px' }}>
              <button
                onClick={() => {
                  setCallInvite(null);
                  getSocketInstance().emit('reject_call', { role: partner?.role });
                }}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '99px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#CBD5E1',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <PhoneOff size={16} />
                <span>Decline</span>
              </button>

              <button
                onClick={() => {
                  const targetPage = callInvite.callType === 'screenshare' ? '/movie-night' : '/chat';
                  setCallInvite(null);
                  navigate(targetPage);
                }}
                style={{
                  flex: 1.4,
                  padding: '12px 18px',
                  borderRadius: '99px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={18} color="#FFF" />
                <span>Accept & Join</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Realtime Toast Banner */}
      {toast && (
        <div
          onClick={() => {
            if (toast.route) navigate(toast.route);
            setToast(null);
          }}
          className="animate-slide-down"
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            width: 'calc(100% - 32px)',
            maxWidth: '420px',
            background: 'var(--surface-card)',
            color: 'var(--ink)',
            border: '2px solid var(--strawberry-500)',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: '0 10px 30px rgba(232, 86, 125, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: toast.route ? 'pointer' : 'default',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--strawberry-500-15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <toast.icon size={20} color="var(--strawberry-500)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)' }}>{toast.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{toast.body}</div>
          </div>
        </div>
      )}

      {!isGameRoute && <Header partnerOnline={partnerOnline} />}
      <main className={isGameRoute ? 'game-fullscreen-container' : 'app-content'}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      {!isGameRoute && <BottomTabBar />}
    </>
  );
}
