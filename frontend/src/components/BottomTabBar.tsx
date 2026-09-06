import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Gamepad2, MessageCircle, Tv } from 'lucide-react';
import { useChatSocket } from '../hooks/useSocket';
import { useAuth } from '../contexts/AuthContext';

const TABS = [
  { path: '/', label: 'Home', Icon: Home },
  { path: '/games', label: 'Play', Icon: Gamepad2 },
  { path: '/chat', label: 'Chat', Icon: MessageCircle },
  { path: '/movie-night', label: 'Movie Night', Icon: Tv },
];

export function BottomTabBar() {
  const location = useLocation();
  const { partner } = useAuth();
  const { onMessage } = useChatSocket();
  const [hasUnread, setHasUnread] = useState(false);

  const myRole = partner?.role || 'boyfriend';

  useEffect(() => {
    if (location.pathname.startsWith('/chat')) {
      setHasUnread(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const unsub = onMessage((msg) => {
      if (!location.pathname.startsWith('/chat') && msg.sender !== myRole) {
        setHasUnread(true);
      }
    });
    return unsub;
  }, [onMessage, location.pathname, myRole]);

  return (
    <nav className="bottom-tab-bar" aria-label="Bottom Navigation">
      <div className="bottom-tab-inner">
        {TABS.map((tab) => {
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path);

          const IconComponent = tab.Icon;
          const isChatTab = tab.path === '/chat';

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`tab-item ${isActive ? 'active' : ''}`}
              style={{ position: 'relative' }}
            >
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <IconComponent size={20} color={isActive ? 'var(--coral-primary)' : 'var(--ink-light)'} />
                {isChatTab && hasUnread && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-4px',
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      background: 'var(--strawberry-500)',
                      boxShadow: '0 0 10px var(--strawberry-500)',
                    }}
                  />
                )}
              </div>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
