export interface PlatformDef {
  id: string;
  x: number;
  y: number;
  w: number;        // width in tiles
  moving: boolean;
  axis?: 'x' | 'y';
  range?: number;   // tiles to move in each direction
  speed?: number;
}

export interface TriggerDef {
  type: 'pressure_plate' | 'lever' | 'door';
  x: number;
  y: number;
  activates: string;   // platform or door id
  requires?: 'p1' | 'p2' | 'any' | 'both';
}

export interface LevelDef {
  id: number;
  theme: string;
  name: string;
  world: string;
  // 0=air, 1=solid, 2=spike, 3=hazard, 4=p1-only, 5=p2-only
  grid: number[][];
  p1_start: { x: number; y: number };
  p2_start: { x: number; y: number };
  exits: {
    p1: { x: number; y: number };
    p2: { x: number; y: number };
  };
  platforms: PlatformDef[];
  triggers: TriggerDef[];
  hint?: string;
}

// Grid is 12 cols x 10 rows (0,0 = top-left)
// 1=solid, 0=air, 2=spike, 3=water

export const LEVELS: LevelDef[] = [
  // ─── WORLD 1: TOKYO (Levels 1–10) ───────────────────────────────────────
  {
    id: 1,
    theme: 'tokyo',
    world: 'Tokyo',
    name: 'Shibuya Crossing',
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,1,0,0,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    p1_start: { x: 2, y: 7 },
    p2_start: { x: 4, y: 7 },
    exits: { p1: { x: 1, y: 1 }, p2: { x: 10, y: 1 } },
    platforms: [],
    triggers: [],
    hint: 'Guide both characters to their glowing exits.',
  },
  {
    id: 2,
    theme: 'tokyo',
    world: 'Tokyo',
    name: 'Neon District',
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,0,0,0,0,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,1,1,1,1,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    p1_start: { x: 1, y: 7 },
    p2_start: { x: 10, y: 7 },
    exits: { p1: { x: 1, y: 1 }, p2: { x: 10, y: 1 } },
    platforms: [
      { id: 'plat_1', x: 4, y: 5, w: 4, moving: false },
    ],
    triggers: [],
    hint: 'Use the platforms as stepping stones.',
  },
  {
    id: 3,
    theme: 'tokyo',
    world: 'Tokyo',
    name: 'The Bridge',
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,0,0,0,0,0,0,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,2,2,2,2,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    p1_start: { x: 1, y: 7 },
    p2_start: { x: 10, y: 7 },
    exits: { p1: { x: 2, y: 3 }, p2: { x: 9, y: 3 } },
    platforms: [
      { id: 'bridge', x: 4, y: 5, w: 4, moving: true, axis: 'y', range: 2, speed: 1 },
    ],
    triggers: [],
    hint: 'Avoid the spikes! Time your jumps with the moving platform.',
  },
  {
    id: 4,
    theme: 'tokyo',
    world: 'Tokyo',
    name: 'Pressure Point',
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,0,1,0,0,1],
      [1,0,0,0,0,1,1,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    p1_start: { x: 1, y: 7 },
    p2_start: { x: 10, y: 7 },
    exits: { p1: { x: 1, y: 1 }, p2: { x: 10, y: 1 } },
    platforms: [
      { id: 'gate', x: 5, y: 2, w: 2, moving: true, axis: 'y', range: 3, speed: 0 },
    ],
    triggers: [
      { type: 'pressure_plate', x: 3, y: 7, activates: 'gate', requires: 'p2' },
    ],
    hint: 'P2 must stand on the pressure plate to open the gate for P1.',
  },
  {
    id: 5,
    theme: 'tokyo',
    world: 'Tokyo',
    name: 'Split Paths',
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,1,0,0,0,1],
      [1,0,0,0,1,0,0,1,0,0,0,1],
      [1,0,0,0,4,0,0,5,0,0,0,1],
      [1,0,0,0,4,0,0,5,0,0,0,1],
      [1,1,0,1,1,0,0,1,1,0,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    p1_start: { x: 2, y: 7 },
    p2_start: { x: 9, y: 7 },
    exits: { p1: { x: 2, y: 1 }, p2: { x: 9, y: 1 } },
    platforms: [],
    triggers: [],
    hint: 'Tile type 4 only P1 can pass through. Type 5 only P2 can.',
  },
  // Levels 6–10 continue increasing complexity...
  {
    id: 6,
    theme: 'tokyo',
    world: 'Tokyo',
    name: 'Rooftop Chase',
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,0,1,0,0,1],
      [1,0,0,0,0,2,2,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,0,0,0,0,0,0,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    p1_start: { x: 1, y: 7 },
    p2_start: { x: 10, y: 7 },
    exits: { p1: { x: 1, y: 1 }, p2: { x: 10, y: 1 } },
    platforms: [
      { id: 'mov1', x: 3, y: 4, w: 2, moving: true, axis: 'x', range: 4, speed: 1.5 },
    ],
    triggers: [],
    hint: 'The moving platform shifts fast — coordinate your timing.',
  },
  {
    id: 7,
    theme: 'tokyo',
    world: 'Tokyo',
    name: 'Double Gate',
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,0,0,1,1,0,0,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    p1_start: { x: 2, y: 7 },
    p2_start: { x: 9, y: 7 },
    exits: { p1: { x: 1, y: 1 }, p2: { x: 10, y: 1 } },
    platforms: [
      { id: 'gate_left', x: 2, y: 2, w: 1, moving: true, axis: 'y', range: 3, speed: 0 },
      { id: 'gate_right', x: 9, y: 2, w: 1, moving: true, axis: 'y', range: 3, speed: 0 },
    ],
    triggers: [
      { type: 'pressure_plate', x: 5, y: 7, activates: 'gate_left', requires: 'p1' },
      { type: 'pressure_plate', x: 6, y: 7, activates: 'gate_right', requires: 'p2' },
    ],
    hint: 'Both players must step on their plates at the same time.',
  },
  {
    id: 8,
    theme: 'tokyo',
    world: 'Tokyo',
    name: 'Spike Valley',
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,0,0,0,0,0,0,0,0,1,1],
      [1,0,0,2,0,0,0,0,2,0,0,1],
      [1,0,0,2,0,0,0,0,2,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    p1_start: { x: 1, y: 7 },
    p2_start: { x: 10, y: 7 },
    exits: { p1: { x: 1, y: 1 }, p2: { x: 10, y: 1 } },
    platforms: [
      { id: 'bridge', x: 4, y: 5, w: 4, moving: true, axis: 'x', range: 2, speed: 1 },
    ],
    triggers: [],
    hint: 'Cross the spike valley using the sliding platform.',
  },
  {
    id: 9,
    theme: 'tokyo',
    world: 'Tokyo',
    name: 'Lever Logic',
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,0,0,1,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,1,1,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    p1_start: { x: 1, y: 7 },
    p2_start: { x: 10, y: 7 },
    exits: { p1: { x: 2, y: 1 }, p2: { x: 9, y: 1 } },
    platforms: [
      { id: 'lift', x: 5, y: 6, w: 2, moving: true, axis: 'y', range: 4, speed: 0 },
    ],
    triggers: [
      { type: 'lever', x: 3, y: 7, activates: 'lift', requires: 'any' },
    ],
    hint: 'Pull the lever to raise the lift. One player rides while the other holds it.',
  },
  {
    id: 10,
    theme: 'tokyo',
    world: 'Tokyo',
    name: 'Tokyo Tower',
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,0,0,0,0,0,0,1,0,1],
      [1,0,0,0,2,0,0,2,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,0,0,0,0,1,1,0,1],
      [1,0,0,0,0,2,2,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    p1_start: { x: 1, y: 7 },
    p2_start: { x: 10, y: 7 },
    exits: { p1: { x: 1, y: 1 }, p2: { x: 10, y: 1 } },
    platforms: [
      { id: 'p1', x: 4, y: 5, w: 1, moving: true, axis: 'x', range: 3, speed: 2 },
      { id: 'p2', x: 7, y: 3, w: 1, moving: true, axis: 'y', range: 2, speed: 1.5 },
    ],
    triggers: [
      { type: 'pressure_plate', x: 5, y: 7, activates: 'p2', requires: 'both' },
    ],
    hint: 'The final Tokyo challenge — both gates need both players working together.',
  },
];

export function getLevelById(id: number): LevelDef | undefined {
  return LEVELS.find((l) => l.id === id);
}
