import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gamesAPI } from '../api/client';
import { Navbar } from '../components/Navbar';
import {
  CrossIcon, DiscIcon, RockIcon, ShipIcon, BrainIcon,
  CoinIcon, LightningIcon, GridIcon, SparklesIcon, CandleIcon, GlobeIcon
} from '../components/Icons';
import './GameHub.css';

interface BuiltInGame {
  id: string;
  title: string;
  category: 'quick' | 'strategy' | 'silly';
  icon: React.ReactNode;
  description: string;
  players: string;
  estTime: string;
}

const BUILT_IN_GAMES: BuiltInGame[] = [
  {
    id: 'tictactoe',
    title: 'Tic-Tac-Toe',
    category: 'quick',
    icon: <CrossIcon size={32} color="#D6A85A" />,
    description: 'Classic 3x3 grid battle. Fast-paced, quiet strategy.',
    players: '2 Players',
    estTime: '1 min',
  },
  {
    id: 'connect4',
    title: 'Connect 4',
    category: 'strategy',
    icon: <DiscIcon size={32} color="#C97B84" fill="#C97B84" />,
    description: 'Drop discs into 6x7 grid. Connect four in a row to win!',
    players: '2 Players',
    estTime: '3 mins',
  },
  {
    id: 'rps',
    title: 'Rock Paper Scissors',
    category: 'silly',
    icon: <RockIcon size={32} color="#D6A85A" />,
    description: 'Best of 5 rounds with simultaneous reveals and instant rematch!',
    players: '2 Players',
    estTime: '1 min',
  },
  {
    id: 'battleship',
    title: 'Battleship',
    category: 'strategy',
    icon: <ShipIcon size={32} color="#F3E9DC" />,
    description: 'Place your fleet, take turns firing missiles, sink their ships!',
    players: '2 Players',
    estTime: '5 mins',
  },
  {
    id: 'memory_match',
    title: 'Memory Match',
    category: 'quick',
    icon: <BrainIcon size={32} color="#D6A85A" />,
    description: 'Flip cute memory cards. Find matching pairs to score points!',
    players: 'Co-op / Vs',
    estTime: '3 mins',
  },
  {
    id: 'coin_flip',
    title: 'Coin Flip',
    category: 'silly',
    icon: <CoinIcon size={32} color="#D6A85A" />,
    description: 'Who picks dinner tonight? Call heads or tails!',
    players: '2 Players',
    estTime: '30 secs',
  },
  {
    id: 'word_chain',
    title: 'Word Chain',
    category: 'quick',
    icon: <SparklesIcon size={32} color="#C97B84" />,
    description: 'Name a word starting with the last letter of the previous word.',
    players: '2 Players',
    estTime: '3 mins',
  },
  {
    id: 'reaction_race',
    title: 'Reaction Race',
    category: 'silly',
    icon: <LightningIcon size={32} color="#D6A85A" />,
    description: 'Tap as fast as you can when the cue appears! Best of 5.',
    players: '2 Players',
    estTime: '1 min',
  },
  {
    id: 'dots_boxes',
    title: 'Dots & Boxes',
    category: 'strategy',
    icon: <GridIcon size={32} color="#F3E9DC" />,
    description: 'Connect dots to form boxes. Claim the most boxes to win!',
    players: '2 Players',
    estTime: '4 mins',
  },
];

interface ExternalGame {
  id: string;
  title: string;
  thumb: string;
  url: string;
  category: string;
}

export function GameHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'custom' | 'external'>('all');
  const [externalGames, setExternalGames] = useState<ExternalGame[]>([]);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);
  const [creatingRoomFor, setCreatingRoomFor] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExternalGames() {
      setIsLoadingExternal(true);
      try {
        const res = await fetch('https://rss.gamemonetize.com/rssfeed.php?format=json&category=2player');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const mapped = data.slice(0, 12).map((item: any) => ({
              id: item.id || String(Math.random()),
              title: item.title,
              thumb: item.thumb,
              url: item.url,
              category: item.category || '2 Player',
            }));
            setExternalGames(mapped);
          }
        }
      } catch (err) {
        console.warn('Could not load external games feed:', err);
      } finally {
        setIsLoadingExternal(false);
      }
    }

    fetchExternalGames();
  }, []);

  const handleStartBuiltIn = async (gameType: string) => {
    setCreatingRoomFor(gameType);
    try {
      const res = await gamesAPI.createRoom(gameType);
      const roomId = res.data.id;
      navigate(`/room/${roomId}`);
    } catch (err) {
      console.error('Failed to create room:', err);
      alert('Could not start game session. Please try again.');
    } finally {
      setCreatingRoomFor(null);
    }
  };

  const handlePlayExternal = (game: ExternalGame) => {
    navigate(`/room/external`, { state: { game } });
  };

  return (
    <div className="gamehub-sanctuary">
      <div className="grain-overlay" />

      <header className="gamehub-header">
        <div className="gamehub-brand">
          <CandleIcon size={20} color="#D6A85A" />
          <span>Us.</span>
        </div>
        <h1 className="gamehub-title">Co-op Game Arcade</h1>
        <p className="gamehub-subtitle">
          Pure co-op & head-to-head games designed exclusively for two lovers
        </p>

        <div className="gamehub-tabs">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Games ({BUILT_IN_GAMES.length + externalGames.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'custom' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            Custom Co-op ({BUILT_IN_GAMES.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'external' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('external')}
          >
            HTML5 2-Player ({externalGames.length})
          </button>
        </div>
      </header>

      <main className="gamehub-content">
        {(activeTab === 'all' || activeTab === 'custom') && (
          <section className="games-section">
            <h2 className="section-heading">
              <SparklesIcon size={18} color="#D6A85A" /> Custom Real-Time Co-op Games
            </h2>
            <div className="games-grid">
              {BUILT_IN_GAMES.map((game) => (
                <div key={game.id} className="game-card">
                  <div className="game-card__icon">{game.icon}</div>
                  <div className="game-card__badge">{game.players} • {game.estTime}</div>
                  <h3 className="game-card__title">{game.title}</h3>
                  <p className="game-card__desc">{game.description}</p>
                  <button
                    className="play-together-btn"
                    disabled={creatingRoomFor === game.id}
                    onClick={() => handleStartBuiltIn(game.id)}
                  >
                    {creatingRoomFor === game.id ? 'Creating Room...' : 'Play Together →'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'external') && (
          <section className="games-section">
            <h2 className="section-heading">
              <GlobeIcon size={18} color="#D6A85A" /> HTML5 2-Player Web Arcade
            </h2>
            {isLoadingExternal ? (
              <div className="loading-spinner-box">Loading 2-player arcade catalog...</div>
            ) : (
              <div className="games-grid">
                {externalGames.map((game) => (
                  <div key={game.id} className="game-card external-card">
                    <div className="external-card__thumb">
                      <img src={game.thumb} alt={game.title} />
                    </div>
                    <div className="game-card__badge">Embed • Local 2P</div>
                    <h3 className="game-card__title">{game.title}</h3>
                    <button
                      className="play-external-btn"
                      onClick={() => handlePlayExternal(game)}
                    >
                      Launch Arcade Game →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Navbar />
    </div>
  );
}
