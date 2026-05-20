import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const TILE_SIZE = Math.floor(SCREEN_WIDTH / 12);
export const GRID_COLS = 12;
export const GRID_ROWS = Math.floor((SCREEN_HEIGHT * 0.75) / TILE_SIZE);

export const PHYSICS = {
  GRAVITY: 0.5,
  JUMP_FORCE: -10,
  MOVE_SPEED: 3,
  MAX_FALL_SPEED: 12,
};

export const GAME = {
  TICK_RATE: 60,         // fps target
  SYNC_RATE: 20,         // co-op position sync per second
  LEVELS_FREE: 10,       // levels free before paywall
  TOTAL_LEVELS: 50,
};

export const SCREEN = {
  WIDTH: SCREEN_WIDTH,
  HEIGHT: SCREEN_HEIGHT,
};
