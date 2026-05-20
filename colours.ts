export const THEMES = {
  tokyo: {
    bg: '#0d0d1a',
    bgAccent: '#1a1a2e',
    tile: '#2d2d5e',
    tileAccent: '#ff2d55',
    p1: '#00f5ff',
    p2: '#ff2d55',
    exit: '#ffd60a',
    platform: '#4a4a8a',
    ui: '#ffffff',
  },
  egypt: {
    bg: '#1a0e00',
    bgAccent: '#2e1a00',
    tile: '#8b6914',
    tileAccent: '#ffd700',
    p1: '#ff6b35',
    p2: '#4ecdc4',
    exit: '#ffffff',
    platform: '#c49a3c',
    ui: '#ffd700',
  },
  amazon: {
    bg: '#001a00',
    bgAccent: '#003300',
    tile: '#1a4a1a',
    tileAccent: '#39ff14',
    p1: '#ff6b6b',
    p2: '#ffd93d',
    exit: '#ffffff',
    platform: '#2d6e2d',
    ui: '#39ff14',
  },
  arctic: {
    bg: '#e8f4f8',
    bgAccent: '#b8d4e8',
    tile: '#7ab8d4',
    tileAccent: '#ffffff',
    p1: '#ff4757',
    p2: '#2ed573',
    exit: '#ffd700',
    platform: '#a8d8ea',
    ui: '#1a1a2e',
  },
  space: {
    bg: '#000008',
    bgAccent: '#0a0020',
    tile: '#1a0030',
    tileAccent: '#9b59b6',
    p1: '#00ff88',
    p2: '#ff6b00',
    exit: '#ffffff',
    platform: '#2d0050',
    ui: '#ffffff',
  },
};

export type ThemeKey = keyof typeof THEMES;

export const WORLD_THEMES: ThemeKey[] = [
  'tokyo',   // levels 1–10
  'egypt',   // levels 11–20
  'amazon',  // levels 21–30
  'arctic',  // levels 31–40
  'space',   // levels 41–50
];

export function getThemeForLevel(levelId: number): ThemeKey {
  const index = Math.floor((levelId - 1) / 10);
  return WORLD_THEMES[Math.min(index, WORLD_THEMES.length - 1)];
}
