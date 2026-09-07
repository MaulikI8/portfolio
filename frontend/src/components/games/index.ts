import { UnoBoard } from './UnoBoard';
import { LudoBoard } from './LudoBoard';

export const GAME_REGISTRY: Record<string, React.ComponentType<any>> = {
  'uno': UnoBoard,
  'ludo': LudoBoard,
};
