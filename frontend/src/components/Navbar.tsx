import { useNavigate, useLocation } from 'react-router-dom';
import { CandleIcon, GamepadIcon, MailIcon, ChatIcon } from './Icons';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${currentPath === '/' ? 'nav-item--active' : ''}`}
        onClick={() => navigate('/')}
      >
        <CandleIcon size={18} color={currentPath === '/' ? '#D6A85A' : '#BEB1B5'} />
        <span>Table</span>
      </button>

      <button
        className={`nav-item ${currentPath.startsWith('/games') ? 'nav-item--active' : ''}`}
        onClick={() => navigate('/games')}
      >
        <GamepadIcon size={18} color={currentPath.startsWith('/games') ? '#D6A85A' : '#BEB1B5'} />
        <span>Games</span>
      </button>

      <button
        className={`nav-item ${currentPath === '/notes' ? 'nav-item--active' : ''}`}
        onClick={() => navigate('/notes')}
      >
        <MailIcon size={18} color={currentPath === '/notes' ? '#D6A85A' : '#BEB1B5'} />
        <span>Notes</span>
      </button>

      <button
        className={`nav-item ${currentPath === '/chat' ? 'nav-item--active' : ''}`}
        onClick={() => navigate('/chat')}
      >
        <ChatIcon size={18} color={currentPath === '/chat' ? '#D6A85A' : '#BEB1B5'} />
        <span>Chat</span>
      </button>
    </nav>
  );
}
