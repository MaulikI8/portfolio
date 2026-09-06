import { TicTacToeBoard } from './TicTacToeBoard';
import { BattleshipBoard } from './BattleshipBoard';
import { DotsBoxesBoard } from './DotsBoxesBoard';
import { UnoBoard } from './UnoBoard';
import { LudoBoard } from './LudoBoard';
import { TriviaDuelBoard } from './TriviaDuelBoard';
import { DrawGuessBoard } from './DrawGuessBoard';
import { PongBoard } from './PongBoard';
import { TwoTruthsBoard } from './TwoTruthsBoard';
import { MemoryBoard } from './MemoryBoard';
import { Connect4Board } from './Connect4Board';
import { SnakesLaddersBoard } from './SnakesLaddersBoard';
import { RpsBoard } from './RpsBoard';
import { TwentyQBoard } from './TwentyQBoard';
import { WouldYouRatherBoard } from './WouldYouRatherBoard';
import { EmojiGuessBoard } from './EmojiGuessBoard';
import { ThisOrThatBoard } from './ThisOrThatBoard';
import { HangmanBoard } from './HangmanBoard';
import { CoinFlipBoard } from './CoinFlipBoard';

export const GAME_REGISTRY: Record<string, React.ComponentType<any>> = {
  'tictactoe': TicTacToeBoard,
  'battleship': BattleshipBoard,
  'dots-and-boxes': DotsBoxesBoard,
  'uno': UnoBoard,
  'ludo': LudoBoard,
  'trivia-duel': TriviaDuelBoard,
  'draw-and-guess': DrawGuessBoard,
  'table-tennis': PongBoard,
  'two-truths': TwoTruthsBoard,
  'memory': MemoryBoard,
  'connect-4': Connect4Board,
  'snakes-and-ladders': SnakesLaddersBoard,
  'rock-paper-scissors': RpsBoard,
  'twenty-questions': TwentyQBoard,
  'would-you-rather': WouldYouRatherBoard,
  'emoji-guess': EmojiGuessBoard,
  'this-or-that': ThisOrThatBoard,
  'hangman': HangmanBoard,
  'coin-flip': CoinFlipBoard,
};
