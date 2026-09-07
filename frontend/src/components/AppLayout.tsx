import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { BottomTabBar } from './BottomTabBar';
import { FloatingHeartsAndPetals } from './FloatingHeartsAndPetals';
import { ErrorBoundary } from './ErrorBoundary';
import { useAuth } from '../contexts/AuthContext';
import { useCall } from '../contexts/CallContext';
import { useSocketConnection, useNudgeSocket, useNotificationSocket, useLoveNoteSocket, getSocketInstance } from '../hooks/useSocket';
import { CallOverlay } from './CallOverlay';
import { Sparkles, Heart, Bell, Gamepad2, X, PhoneCall, PhoneOff } from 'lucide-react';

function playIncomingRingtone() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(440, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.15, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

export function AppLayout() {
  const location = useLocation(), navigate = useNavigate(), { partner } = useAuth();
  const isGameRoute = location.pathname.startsWith('/games/'), { partnerOnline } = useSocketConnection(partner?.role || null);
  const { activeCall, incomingCall, isAudioMuted, isVideoMuted, localVideoRef, remoteVideoRef, acceptCall, rejectCall, endCall, toggleMuteAudio, toggleMuteVideo } = useCall();
  const { onNudge } = useNudgeSocket(), { onNotification } = useNotificationSocket(), { onLoveNote } = useLoveNoteSocket();

  const [toast, setToast] = useState<{ icon: any; title: string; body: string; route?: string } | null>(null);
  const [gameInvite, setGameInvite] = useState<{ senderName: string; gameType: string; gameSlug: string; message: string } | null>(null);

  useEffect(() => {
    if (incomingCall) {
      playIncomingRingtone();
      if ('Notification' in window && Notification.permission === 'granted') new Notification(`Incoming ${incomingCall.callType.toUpperCase()} Call from ${incomingCall.fromName || 'Partner'}! 📞`, { body: 'Tap to answer live!', icon: '/seema/favicon.ico' });
    }
  }, [incomingCall]);

  useEffect(() => {
    const uNudge = onNudge(({ fromName, emoji, label }) => setToast({ icon: Sparkles, title: `${fromName} sent a moment!`, body: `${emoji} ${label}` }));
    const uNotif = onNotification(n => setToast({ icon: Bell, title: n.title || 'New Notification', body: n.body || '' }));
    const uNote = onLoveNote(n => setToast({ icon: Heart, title: `Love Note from ${n.sender_name || 'Partner'} 💕`, body: n.content || 'Thinking of you!', route: '/notes' }));
    const socket = getSocketInstance();
    const handleGameNudge = (d: any) => setToast({ icon: Sparkles, title: `🎮 ${d.senderName} is waiting in ${d.gameType || 'UNO'}!`, body: 'Tap to join match!', route: `/games/${(d.gameType || 'uno').toLowerCase()}` });
    const handleInvite = (d: any) => {
      const slug = (d.gameSlug || d.gameType || 'uno').toLowerCase();
      if (!location.pathname.startsWith(`/games/${slug}`)) setGameInvite({ senderName: d.senderName || 'Your Partner', gameType: d.gameType || 'UNO', gameSlug: slug, message: d.message || `${d.senderName} invited you!` });
    };
    socket.on('game_nudge_toast', handleGameNudge); socket.on('game_invite_modal', handleInvite);
    return () => { uNudge(); uNotif(); uNote(); socket.off('game_nudge_toast', handleGameNudge); socket.off('game_invite_modal', handleInvite); };
  }, [onNudge, onNotification, onLoveNote, location.pathname]);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 4500); return () => clearTimeout(t); } }, [toast]);

  return (
    <>
      <FloatingHeartsAndPetals />
      {activeCall && (activeCall.type !== 'screenshare' || location.pathname !== '/movie-night') && <CallOverlay activeCall={activeCall} isAudioMuted={isAudioMuted} isVideoMuted={isVideoMuted} localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} onToggleMuteAudio={toggleMuteAudio} onToggleMuteVideo={toggleMuteVideo} onEndCall={endCall} />}

      {gameInvite && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999, background: 'rgba(10, 8, 20, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '400px', background: 'linear-gradient(145deg, #1e1b2e 0%, #12101d 100%)', border: '2px solid rgba(255, 105, 180, 0.4)', borderRadius: '24px', padding: '28px 24px', textAlign: 'center', position: 'relative', color: '#FFF' }}>
            <button onClick={() => setGameInvite(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#AAA', cursor: 'pointer' }}><X size={18} /></button>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF4D6D 0%, #FF758F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Gamepad2 size={38} color="#FFF" /></div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#FFF', margin: '0 0 8px', fontWeight: 800 }}>🎮 Game Invite!</h2>
            <p style={{ fontSize: '1.05rem', color: '#F1F5F9', margin: '0 0 6px', fontWeight: 600 }}><span style={{ color: '#FF758F', fontWeight: 800 }}>{gameInvite.senderName}</span> invites you to play <span style={{ color: '#FFD166', fontWeight: 800 }}>{gameInvite.gameType}</span>!</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => { const slug = gameInvite.gameSlug; setGameInvite(null); navigate(`/games/${slug}`); }} style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #FF4D6D 0%, #D81B60 100%)', color: '#FFF', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Sparkles size={20} color="#FFF" /><span>Accept & Join {gameInvite.gameType} Now</span></button>
              <button onClick={() => setGameInvite(null)} style={{ width: '100%', padding: '10px 16px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.15)', background: 'transparent', color: '#CBD5E1', fontWeight: 600, cursor: 'pointer' }}>Decline / Play Later</button>
            </div>
          </div>
        </div>
      )}

      {incomingCall && incomingCall.callType !== 'screenshare' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999999, background: 'rgba(10, 8, 20, 0.88)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '380px', background: 'linear-gradient(145deg, #1e1028 0%, #12091c 100%)', border: '2.5px solid var(--strawberry-500)', borderRadius: '28px', padding: '28px 24px', textAlign: 'center', color: '#FFF' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF4D6D 0%, #FF758F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}><PhoneCall size={40} color="#FFF" /></div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#FFF', margin: '0 0 8px', fontWeight: 800 }}>📞 Incoming {incomingCall.callType.toUpperCase()} Call</h2>
            <p style={{ fontSize: '1.05rem', color: '#F1F5F9', margin: '0 0 20px', fontWeight: 700 }}><span style={{ color: '#FF758F', fontWeight: 800 }}>{incomingCall.fromName}</span> is calling live!</p>
            <div style={{ display: 'flex', gap: '14px' }}>
              <button onClick={() => rejectCall()} style={{ flex: 1, padding: '12px 16px', borderRadius: '99px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.1)', color: '#CBD5E1', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><PhoneOff size={16} /><span>Decline</span></button>
              <button onClick={() => { if (incomingCall.callType === 'screenshare') navigate('/movie-night'); acceptCall(); }} style={{ flex: 1.4, padding: '12px 18px', borderRadius: '99px', border: 'none', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFF', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Sparkles size={18} color="#FFF" /><span>Accept & Join</span></button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div onClick={() => { if (toast.route) navigate(toast.route); setToast(null); }} style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 99999, width: 'calc(100% - 32px)', maxWidth: '420px', background: 'var(--surface-card)', color: 'var(--ink)', border: '2px solid var(--strawberry-500)', borderRadius: '16px', padding: '12px 16px', boxShadow: '0 10px 30px rgba(232, 86, 125, 0.25)', display: 'flex', alignItems: 'center', gap: '12px', cursor: toast.route ? 'pointer' : 'default' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--strawberry-500-15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><toast.icon size={20} color="var(--strawberry-500)" /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)' }}>{toast.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{toast.body}</div>
          </div>
        </div>
      )}

      {!isGameRoute && <Header partnerOnline={partnerOnline} />}
      <main className={isGameRoute ? 'game-fullscreen-container' : 'app-content'}>
        <ErrorBoundary><Outlet /></ErrorBoundary>
      </main>
      {!isGameRoute && <BottomTabBar />}
    </>
  );
}


