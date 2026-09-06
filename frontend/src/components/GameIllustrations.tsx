// 3D Chess Visual Artwork Card
export function ChessArtwork({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="chessGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#391724" />
          <stop offset="0.5" stopColor="#21101B" />
          <stop offset="1" stopColor="#0D090F" />
        </linearGradient>
        <linearGradient id="goldCrown" x1="40" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF5EF" />
          <stop offset="0.5" stopColor="#F0BAC6" />
          <stop offset="1" stopColor="#C66F86" />
        </linearGradient>
        <filter id="glow3d" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#C66F86" floodOpacity="0.4" />
        </filter>
      </defs>
      <rect width="120" height="120" rx="24" fill="url(#chessGrad)" stroke="rgba(198,111,134,0.3)" strokeWidth="1.5" />
      {/* 3D Board Grid lines in isometric perspective */}
      <path d="M20 75L60 95L100 75L60 55Z" fill="rgba(198,111,134,0.15)" stroke="rgba(240,186,198,0.25)" />
      <path d="M40 65L60 75L80 65L60 55Z" fill="rgba(198,111,134,0.3)" />
      {/* 3D Chess Queen / King Crown */}
      <g filter="url(#glow3d)">
        <path d="M60 22L67 36L82 30L75 48L85 62H35L45 48L38 30L53 36L60 22Z" fill="url(#goldCrown)" />
        <circle cx="60" cy="18" r="4" fill="#FFF5EF" />
        <circle cx="38" cy="26" r="3" fill="#F0BAC6" />
        <circle cx="82" cy="26" r="3" fill="#F0BAC6" />
        <rect x="42" y="64" width="36" height="6" rx="3" fill="#FFF5EF" opacity="0.9" />
      </g>
    </svg>
  );
}

// 3D Connect 4 Visual Artwork Card
export function Connect4Artwork({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="c4Grad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2A1424" />
          <stop offset="1" stopColor="#140A12" />
        </linearGradient>
        <radialGradient id="discRose" cx="50%" cy="50%" r="50%">
          <stop stopColor="#F0BAC6" />
          <stop offset="0.7" stopColor="#C66F86" />
          <stop offset="1" stopColor="#86465C" />
        </radialGradient>
        <radialGradient id="discGold" cx="50%" cy="50%" r="50%">
          <stop stopColor="#FFF5EF" />
          <stop offset="0.7" stopColor="#E8A94C" />
          <stop offset="1" stopColor="#9E681E" />
        </radialGradient>
      </defs>
      <rect width="120" height="120" rx="24" fill="url(#c4Grad)" stroke="rgba(198,111,134,0.3)" strokeWidth="1.5" />
      {/* Physical Connect 4 Stand */}
      <rect x="25" y="30" width="70" height="65" rx="12" fill="#21101B" stroke="rgba(240,186,198,0.2)" strokeWidth="1.5" />
      {/* Falling Disc Slots */}
      <circle cx="42" cy="48" r="8" fill="url(#discRose)" />
      <circle cx="60" cy="48" r="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
      <circle cx="78" cy="48" r="8" fill="url(#discGold)" />
      
      <circle cx="42" cy="70" r="8" fill="url(#discGold)" />
      <circle cx="60" cy="70" r="8" fill="url(#discRose)" />
      <circle cx="78" cy="70" r="8" fill="url(#discRose)" />
    </svg>
  );
}

// 3D Tic-Tac-Toe Visual Artwork Card
export function TicTacToeArtwork({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="tttGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#351726" />
          <stop offset="1" stopColor="#140A12" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="24" fill="url(#tttGrad)" stroke="rgba(198,111,134,0.3)" strokeWidth="1.5" />
      {/* Glowing 3x3 Grid Lines */}
      <path d="M48 28V92M72 28V92M28 48H92M28 72H92" stroke="rgba(240,186,198,0.25)" strokeWidth="3" strokeLinecap="round" />
      {/* Stylized Rose X Token */}
      <path d="M33 33L43 43M43 33L33 43" stroke="#C66F86" strokeWidth="4" strokeLinecap="round" />
      {/* Stylized Gold O Token */}
      <circle cx="82" cy="38" r="6" stroke="#FFF5EF" strokeWidth="3.5" fill="none" />
      {/* Center Winning Line */}
      <circle cx="60" cy="60" r="6" fill="#C66F86" />
      <path d="M33 87L43 77M43 87L33 77" stroke="#FFF5EF" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

// 3D Checkers Visual Artwork Card
export function CheckersArtwork({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="chkGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#391724" />
          <stop offset="1" stopColor="#140A12" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="24" fill="url(#chkGrad)" stroke="rgba(198,111,134,0.3)" strokeWidth="1.5" />
      {/* Isometric Board Slab */}
      <path d="M25 65L60 85L95 65L60 45Z" fill="#21101B" stroke="#C66F86" strokeWidth="1.5" />
      {/* Stacked Checkers Crown Pieces */}
      <ellipse cx="60" cy="52" rx="16" ry="8" fill="#F0BAC6" stroke="#FFF5EF" strokeWidth="1.5" />
      <ellipse cx="60" cy="46" rx="16" ry="8" fill="#C66F86" stroke="#FFF5EF" strokeWidth="1.5" />
      <polygon points="60,38 64,43 70,43 65,47 67,53 60,49 53,53 55,47 50,43 56,43" fill="#FFF5EF" />
    </svg>
  );
}

// Tactical Battleship Radar Artwork Card
export function BattleshipArtwork({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="bsGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1C182E" />
          <stop offset="1" stopColor="#0D090F" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="24" fill="url(#bsGrad)" stroke="rgba(198,111,134,0.3)" strokeWidth="1.5" />
      {/* Radar Rings */}
      <circle cx="60" cy="60" r="36" stroke="rgba(240,186,198,0.2)" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="22" stroke="rgba(198,111,134,0.3)" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="8" fill="#C66F86" />
      {/* Radar Sweep Line */}
      <path d="M60 60L85 35" stroke="#F0BAC6" strokeWidth="2" strokeLinecap="round" />
      {/* Ship Hull Silhouette */}
      <path d="M35 78L60 88L85 78L80 72H40L35 78Z" fill="#FFF5EF" opacity="0.85" />
    </svg>
  );
}

// Memory Match Visual Artwork Card
export function MemoryArtwork({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="memGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#351726" />
          <stop offset="1" stopColor="#140A12" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="24" fill="url(#memGrad)" stroke="rgba(198,111,134,0.3)" strokeWidth="1.5" />
      {/* Card 1 */}
      <rect x="30" y="30" width="38" height="55" rx="8" fill="#F8EAE4" transform="rotate(-8 49 57)" stroke="#C66F86" strokeWidth="1.5" />
      <path d="M42 50C42 46 49 46 49 50C49 54 42 58 42 58C42 58 35 54 35 50C35 46 42 46 42 50Z" fill="#C66F86" transform="rotate(-8 49 57)" />
      {/* Card 2 Overlap */}
      <rect x="52" y="35" width="38" height="55" rx="8" fill="#21101B" transform="rotate(10 71 62)" stroke="#F0BAC6" strokeWidth="1.5" />
      <path d="M64 55C64 51 71 51 71 55C71 59 64 63 64 63C64 63 57 59 57 55C57 51 64 51 64 55Z" fill="#F0BAC6" transform="rotate(10 71 62)" />
    </svg>
  );
}

// Dots & Boxes Artwork Card
export function DotsBoxesArtwork({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="dbGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2A1424" />
          <stop offset="1" stopColor="#0D090F" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="24" fill="url(#dbGrad)" stroke="rgba(198,111,134,0.3)" strokeWidth="1.5" />
      {/* Grid Dots */}
      <circle cx="35" cy="35" r="4" fill="#FFF5EF" />
      <circle cx="60" cy="35" r="4" fill="#FFF5EF" />
      <circle cx="85" cy="35" r="4" fill="#FFF5EF" />
      <circle cx="35" cy="60" r="4" fill="#FFF5EF" />
      <circle cx="60" cy="60" r="4" fill="#FFF5EF" />
      <circle cx="85" cy="60" r="4" fill="#FFF5EF" />
      <circle cx="35" cy="85" r="4" fill="#FFF5EF" />
      <circle cx="60" cy="85" r="4" fill="#FFF5EF" />
      <circle cx="85" cy="85" r="4" fill="#FFF5EF" />
      {/* Completed Glowing Box */}
      <rect x="35" y="35" width="25" height="25" fill="rgba(198,111,134,0.3)" stroke="#C66F86" strokeWidth="2" />
      <path d="M60 35H85M35 60V85" stroke="#F0BAC6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// OBUS Bomb Defusal Artwork Card
export function ObusArtwork({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="obusGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#391724" />
          <stop offset="0.6" stopColor="#21101B" />
          <stop offset="1" stopColor="#0D090F" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="24" fill="url(#obusGrad)" stroke="rgba(198,111,134,0.4)" strokeWidth="1.5" />
      {/* Bomb Casing Outline */}
      <rect x="25" y="35" width="70" height="50" rx="8" fill="#140A12" stroke="#C66F86" strokeWidth="1.5" />
      {/* Digital Timer Badge */}
      <rect x="32" y="42" width="34" height="16" rx="4" fill="#000000" stroke="#C66F86" strokeWidth="1" />
      <text x="49" y="54" fill="#C66F86" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">03:00</text>
      {/* Colored Wires */}
      <path d="M72 45C78 45 84 50 84 55" stroke="#C66F86" strokeWidth="2" strokeLinecap="round" />
      <path d="M72 52C78 52 84 57 84 62" stroke="#F0BAC6" strokeWidth="2" strokeLinecap="round" />
      <path d="M72 59C78 59 84 64 84 69" stroke="#E8A94C" strokeWidth="2" strokeLinecap="round" />
      {/* Keypad Buttons */}
      <rect x="32" y="64" width="10" height="10" rx="2" fill="#21101B" stroke="#F0BAC6" strokeWidth="1" />
      <rect x="46" y="64" width="10" height="10" rx="2" fill="#21101B" stroke="#F0BAC6" strokeWidth="1" />
      <rect x="60" y="64" width="10" height="10" rx="2" fill="#21101B" stroke="#F0BAC6" strokeWidth="1" />
    </svg>
  );
}

// UNO Classic Card Fan Artwork
export function UnoArtwork({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="unoGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#351726" />
          <stop offset="1" stopColor="#0D090F" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="24" fill="url(#unoGrad)" stroke="rgba(198,111,134,0.4)" strokeWidth="1.5" />
      {/* Red Card */}
      <rect x="25" y="32" width="38" height="58" rx="8" fill="#DF4C5C" transform="rotate(-15 44 61)" stroke="#FFF5EF" strokeWidth="1.5" />
      <text x="44" y="66" fill="#FFF5EF" fontSize="16" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" transform="rotate(-15 44 61)">7</text>
      {/* Blue Card */}
      <rect x="56" y="32" width="38" height="58" rx="8" fill="#3A86FF" transform="rotate(12 75 61)" stroke="#FFF5EF" strokeWidth="1.5" />
      <text x="75" y="66" fill="#FFF5EF" fontSize="16" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" transform="rotate(12 75 61)">+2</text>
    </svg>
  );
}

// Ludo Track Board Artwork
export function LudoArtwork({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="ludoGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2A1424" />
          <stop offset="1" stopColor="#0D090F" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="24" fill="url(#ludoGrad)" stroke="rgba(198,111,134,0.4)" strokeWidth="1.5" />
      {/* Ludo Track Cross */}
      <rect x="30" y="30" width="60" height="60" rx="10" fill="#140A12" stroke="#C66F86" strokeWidth="1.5" />
      {/* Rose & Gold Base Squares */}
      <rect x="34" y="34" width="22" height="22" rx="4" fill="#C66F86" />
      <rect x="64" y="64" width="22" height="22" rx="4" fill="#E8A94C" />
      {/* Pawns */}
      <circle cx="45" cy="45" r="5" fill="#FFF5EF" stroke="#C66F86" strokeWidth="1.5" />
      <circle cx="75" cy="75" r="5" fill="#FFF5EF" stroke="#E8A94C" strokeWidth="1.5" />
      {/* Center 3D Dice */}
      <rect x="52" y="52" width="16" height="16" rx="4" fill="#FFF5EF" stroke="#391724" strokeWidth="1" />
      <circle cx="60" cy="60" r="2" fill="#391724" />
    </svg>
  );
}



// Navigation & Luxury Branding Icons
export function SanctuaryHeartIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor" />
    </svg>
  );
}

export function SanctuaryPlayIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.9" />
      <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

export function SanctuaryLetterIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="2" y="4" width="20" height="16" rx="4" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 6L12 13L21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SanctuaryChatIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.5288 20 9.1368 19.6644 7.91024 19.0664L3 20.5L4.72124 16.4838C3.64259 15.0834 3 13.3644 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.3" strokeLinejoin="round" />
    </svg>
  );
}
