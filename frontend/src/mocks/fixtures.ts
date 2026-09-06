export interface PartnerFixture {
  role: 'boyfriend' | 'girlfriend';
  name: string;
  avatar_url?: string;
  online: boolean;
  last_seen: string;
  pin_is_set: boolean;
}

export interface StreakFixture {
  current?: number;
  current_length: number;
  longest?: number;
  longest_length: number;
  last_played_date: string;
}

export interface GameCatalogItem {
  id: string;
  slug: string;
  name: string;
  category: 'Board' | 'Cards' | 'Word & Trivia' | 'Draw & Guess' | 'Reflex' | 'Quick & Simple';
  icon_name: string;
  hook: string;
  last_played?: string;
}

export interface ChatMessageFixture {
  id: string;
  sender: 'boyfriend' | 'girlfriend';
  text: string;
  timestamp: string;
}

export interface NoteFixture {
  id: string;
  author: 'boyfriend' | 'girlfriend';
  text: string;
  timestamp: string;
  seen_at: string | null;
}

export interface MemoryFixture {
  id: string;
  title: string;
  date: string;
  days_remaining?: number;
  is_past: boolean;
}

export const MOCK_PARTNERS: Record<'boyfriend' | 'girlfriend', PartnerFixture> = {
  boyfriend: {
    role: 'boyfriend',
    name: 'Maulik',
    avatar_url: '',
    online: true,
    last_seen: 'Online now',
    pin_is_set: true,
  },
  girlfriend: {
    role: 'girlfriend',
    name: 'Seema',
    avatar_url: '',
    online: true,
    last_seen: 'Seen 10m ago',
    pin_is_set: true,
  },
};

export const MOCK_STREAK: StreakFixture = {
  current: 1,
  current_length: 1,
  longest_length: 1,
  last_played_date: '2026-09-06',
};

export const MOCK_CATALOG: GameCatalogItem[] = [
  { id: '1', slug: 'tictactoe', name: 'Tic Tac Toe', category: 'Board', icon_name: 'Grid', hook: 'Classic 3x3 alignment duel' },
  { id: '2', slug: 'battleship', name: 'Battleship', category: 'Board', icon_name: 'Anchor', hook: 'Sink your partner grid fleet' },
  { id: '3', slug: 'dots-and-boxes', name: 'Dots & Boxes', category: 'Board', icon_name: 'Square', hook: 'Connect dots and claim squares' },
  { id: '4', slug: 'uno', name: 'UNO Classic', category: 'Cards', icon_name: 'Layers', hook: 'Draw cards, wild colors and call UNO' },
  { id: '5', slug: 'ludo', name: 'Ludo Classic', category: 'Board', icon_name: 'Dices', hook: '4-token race to home base' },
  { id: '6', slug: 'trivia-duel', name: 'Trivia Duel', category: 'Word & Trivia', icon_name: 'HelpCircle', hook: 'Test who knows each other better' },
  { id: '7', slug: 'draw-and-guess', name: 'Draw & Guess', category: 'Draw & Guess', icon_name: 'Palette', hook: 'Real-time drawing canvas' },
  { id: '8', slug: 'table-tennis', name: 'Table Tennis', category: 'Reflex', icon_name: 'Activity', hook: 'Fast-paced paddle action' },
  { id: '9', slug: 'two-truths', name: 'Two Truths & Lie', category: 'Word & Trivia', icon_name: 'ShieldCheck', hook: 'Spot the lie among statements' },
  { id: '10', slug: 'memory', name: 'Memory Match', category: 'Cards', icon_name: 'Image', hook: 'Match cards and test recall' },
  { id: '11', slug: 'connect-4', name: 'Connect 4', category: 'Board', icon_name: 'Circle', hook: 'Drop discs four in a row' },
  { id: '12', slug: 'snakes-and-ladders', name: 'Snakes & Ladders', category: 'Board', icon_name: 'TrendingUp', hook: 'Climb ladders, dodge obstacles' },
  { id: '13', slug: 'rock-paper-scissors', name: 'Rock Paper Scissors', category: 'Quick & Simple', icon_name: 'Scissors', hook: 'Best of 5 quick showdown' },
  { id: '14', slug: 'twenty-questions', name: '20 Questions', category: 'Word & Trivia', icon_name: 'MessageSquare', hook: 'Guess what I am thinking' },
  { id: '15', slug: 'would-you-rather', name: 'Would You Rather', category: 'Quick & Simple', icon_name: 'Split', hook: 'Pick between two choices' },
  { id: '16', slug: 'emoji-guess', name: 'Phrase Guess', category: 'Quick & Simple', icon_name: 'Sparkles', hook: 'Decode secret phrase hints' },
  { id: '17', slug: 'this-or-that', name: 'This or That', category: 'Quick & Simple', icon_name: 'Zap', hook: '10 rapid-fire forced choices' },
  { id: '18', slug: 'hangman', name: 'Hangman', category: 'Word & Trivia', icon_name: 'Type', hook: 'Guess the secret letter word' },
  { id: '19', slug: 'coin-flip', name: 'Coin Flip / Dice', category: 'Quick & Simple', icon_name: 'RotateCw', hook: 'Instant 50/50 decision maker' },
];

export const MOCK_ACTIVE_ROOM = {
  id: 'room-101',
  game_type: 'uno',
  status: 'active',
  turn: 'girlfriend',
  updated_at: 'Just now',
};

export const MOCK_CHAT_HISTORY: ChatMessageFixture[] = [
  { id: 'm1', sender: 'girlfriend', text: 'Hey babe! Are we playing Uno tonight?', timestamp: '12:30 PM' },
  { id: 'm2', sender: 'boyfriend', text: 'Definitely! Let me grab a quick drink and setup the board.', timestamp: '12:32 PM' },
  { id: 'm3', sender: 'girlfriend', text: 'Can’t wait! Ready whenever you are.', timestamp: '12:33 PM' },
];

export const MOCK_NOTES: NoteFixture[] = [
  { id: 'n1', author: 'girlfriend', text: 'Remember our dinner date at 7 PM tomorrow!', timestamp: '2 hours ago', seen_at: null },
  { id: 'n2', author: 'boyfriend', text: 'Thanks for making my morning coffee babe', timestamp: 'Yesterday', seen_at: '2026-09-05T09:00:00Z' },
];

export const MOCK_MEMORIES: MemoryFixture[] = [
  { id: 'mem1', title: 'Our Anniversary Dinner', date: '2026-10-15', days_remaining: 39, is_past: false },
  { id: 'mem2', title: 'First Beach Trip', date: '2026-06-20', is_past: true },
  { id: 'mem3', title: 'Stargazing Night', date: '2026-04-09', is_past: true },
];

export const MOCK_RESULTS = {
  total_count: 48,
  scoreboard: [
    { game_type: 'uno', game_name: 'UNO Classic', phrasing: 'Seema leads Uno 7–4' },
    { game_type: 'tictactoe', game_name: 'Tic Tac Toe', phrasing: 'Tied at 12–12' },
    { game_type: 'connect-4', game_name: 'Connect 4', phrasing: 'Maulik dominates Connect 4 9–2' },
  ],
};
