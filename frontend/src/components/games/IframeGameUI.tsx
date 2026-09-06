import { GamepadIcon } from '../Icons';
import './Games.css';

interface Props {
  gameUrl: string;
  title: string;
}

export function IframeGameUI({ gameUrl, title }: Props) {
  return (
    <div className="iframe-game-container">
      <div className="iframe-header">
        <h3>
          <GamepadIcon size={24} color="var(--candlelight-amber)" /> {title}
        </h3>
        <p>Local 2-Player / Split Controls Arcade Game</p>
      </div>
      <div className="iframe-wrapper">
        <iframe
          src={gameUrl}
          title={title}
          allowFullScreen
          className="embedded-game-frame"
        />
      </div>
    </div>
  );
}
