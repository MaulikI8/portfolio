export interface Partner {
  id: number;
  role: 'boyfriend' | 'girlfriend';
  name: string;
  avatar: string | null;
  avatar_url?: string | null;
  halo_color: string;
  is_online: boolean;
  last_seen: string;
}

export interface GameRoom {
  id: number;
  game_type: string;
  game_type_display: string;
  state: Record<string, any>;
  status: 'waiting' | 'active' | 'finished' | 'abandoned';
  created_by: Partner;
  turn: number | null;
  turn_partner: Partner | null;
  created_at: string;
  updated_at: string;
}

export interface GameResult {
  id: number;
  room: number;
  game_type: string;
  winner: Partner | null;
  loser: Partner | null;
  played_at: string;
  duration_s: number;
}

export interface GameMeta {
  code: string;
  name: string;
  category: string;
  hook: string;
  icon: string;
  difficulty: string;
  last_played: string | null;
}

export interface GameCategory {
  category: string;
  games: GameMeta[];
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
  last_played_on: string | null;
  streak_active: boolean;
}

export interface LoveNote {
  id: number;
  sender_role: string;
  sender_name: string;
  recipient_role: string;
  content: string;
  created_at: string;
  is_seen: boolean;
}

export type Note = LoveNote;

export interface Memory {
  id: number;
  title: string;
  date: string;
  photo: string | null;
  recurring: boolean;
  days_until: number;
}

export interface ChatMessage {
  id: number;
  sender_role: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface Notification {
  id: number;
  kind: string;
  title: string;
  body: string;
  payload: Record<string, any>;
  created_at: string;
  read: boolean;
}

// WebSocket message types
export interface WSPresenceMessage {
  type: 'presence';
  partner: string;
  role: string;
  status: 'online' | 'offline';
}

export interface WSTypingMessage {
  type: 'typing';
  partner: string;
  typing: boolean;
}

export interface WSThinkingOfYouMessage {
  type: 'thinking_of_you';
  from: string;
}

export interface WSStateUpdate {
  type: 'state_update';
  room_id: number;
  state: Record<string, any>;
  turn: string | null;
  status: string;
}

export interface WSGameOver {
  type: 'game_over';
  room_id: number;
  winner: string | null;
  winner_name: string | null;
  final_state: Record<string, any>;
}

export interface WSChatMessage {
  type: 'message';
  id: number;
  sender_role: string;
  content: string;
  created_at: string;
}
