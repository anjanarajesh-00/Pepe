import { create } from 'zustand';

export type GameMode = 'solo' | 'coop_host' | 'coop_guest';
export type ActivePlayer = 'p1' | 'p2';

export interface PlayerState {
  x: number;
  y: number;
  velX: number;
  velY: number;
  onGround: boolean;
  alive: boolean;
  atExit: boolean;
}

export interface GameState {
  // Mode
  mode: GameMode;
  setMode: (mode: GameMode) => void;

  // Level
  currentLevel: number;
  setCurrentLevel: (level: number) => void;
  unlockedLevels: number;
  unlockLevel: (level: number) => void;

  // Solo: which character the user is controlling
  activePlayer: ActivePlayer;
  toggleActivePlayer: () => void;

  // Players
  p1: PlayerState;
  p2: PlayerState;
  setP1: (state: Partial<PlayerState>) => void;
  setP2: (state: Partial<PlayerState>) => void;

  // Co-op
  roomCode: string | null;
  setRoomCode: (code: string | null) => void;
  coopReady: boolean;
  setCoopReady: (ready: boolean) => void;

  // Game status
  levelComplete: boolean;
  setLevelComplete: (v: boolean) => void;
  gameOver: boolean;
  setGameOver: (v: boolean) => void;

  // Reset
  resetLevel: () => void;
}

const defaultPlayer: PlayerState = {
  x: 0, y: 0,
  velX: 0, velY: 0,
  onGround: false,
  alive: true,
  atExit: false,
};

export const useGameStore = create<GameState>((set) => ({
  mode: 'solo',
  setMode: (mode) => set({ mode }),

  currentLevel: 1,
  setCurrentLevel: (level) => set({ currentLevel: level }),
  unlockedLevels: 1,
  unlockLevel: (level) =>
    set((s) => ({ unlockedLevels: Math.max(s.unlockedLevels, level) })),

  activePlayer: 'p1',
  toggleActivePlayer: () =>
    set((s) => ({ activePlayer: s.activePlayer === 'p1' ? 'p2' : 'p1' })),

  p1: { ...defaultPlayer },
  p2: { ...defaultPlayer },
  setP1: (state) => set((s) => ({ p1: { ...s.p1, ...state } })),
  setP2: (state) => set((s) => ({ p2: { ...s.p2, ...state } })),

  roomCode: null,
  setRoomCode: (code) => set({ roomCode: code }),
  coopReady: false,
  setCoopReady: (ready) => set({ coopReady: ready }),

  levelComplete: false,
  setLevelComplete: (v) => set({ levelComplete: v }),
  gameOver: false,
  setGameOver: (v) => set({ gameOver: v }),

  resetLevel: () =>
    set({
      p1: { ...defaultPlayer },
      p2: { ...defaultPlayer },
      levelComplete: false,
      gameOver: false,
    }),
}));
