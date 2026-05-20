# Pepelo Clone — React Native Game

## Project Structure

```
pepelo-clone/
├── app/                        # Expo Router screens
│   ├── index.tsx               # Home / Main Menu
│   ├── solo.tsx                # Solo play screen
│   ├── coop.tsx                # Co-op lobby + play screen
│   └── _layout.tsx             # Root layout
│
├── game/
│   ├── engine/
│   │   ├── GameLoop.tsx        # Main game engine wrapper
│   │   ├── Physics.ts          # Gravity, collision detection
│   │   └── Systems.ts          # ECS systems (movement, puzzle, sync)
│   │
│   ├── entities/
│   │   ├── Character.tsx       # Player character component + logic
│   │   ├── Platform.tsx        # Static & moving platforms
│   │   ├── Tile.tsx            # Floor/wall tiles
│   │   └── Trigger.tsx         # Pressure plates, levers, doors
│   │
│   ├── levels/
│   │   ├── LevelLoader.ts      # Parses level JSON into entities
│   │   ├── levels.ts           # All 50 level definitions
│   │   └── themes.ts           # Visual theme configs per world
│   │
│   ├── store/
│   │   └── gameStore.ts        # Zustand global state
│   │
│   └── network/
│       ├── socket.ts           # Socket.io client
│       └── CoopSync.ts         # Co-op state sync logic
│
├── components/
│   ├── ui/
│   │   ├── DPad.tsx            # On-screen D-pad control
│   │   ├── HUD.tsx             # In-game HUD (level, timer, mode)
│   │   ├── CharacterToggle.tsx # Solo mode character switch button
│   │   └── RoomCode.tsx        # Co-op room code display/input
│   │
│   └── screens/
│       ├── MainMenu.tsx
│       ├── LevelSelect.tsx
│       └── GameOver.tsx
│
├── assets/
│   ├── fonts/
│   ├── sounds/
│   └── sprites/
│
├── server/
│   ├── index.js                # Socket.io Node.js server
│   └── RoomManager.js          # Room creation, player matching
│
├── constants/
│   ├── layout.ts               # TILE_SIZE, GRID_COLS, etc.
│   └── colors.ts               # Theme color palettes
│
└── package.json
```

## Quick Start

```bash
# Install dependencies
npm install

# Start Expo (mobile app)
npm start

# Start co-op server (separate terminal)
npm run server
```

## Game Modes

- **Solo**: One device, tap the toggle button to switch between P1 and P2
- **Co-op Online**: Host creates a room code, guest joins — each controls one character in real time

## Level Format

Each level is a JSON object:
```json
{
  "id": 1,
  "theme": "tokyo",
  "name": "Shibuya Crossing",
  "grid": [[1,1,1,...],[0,0,0,...],...],
  "p1_start": {"x": 1, "y": 7},
  "p2_start": {"x": 3, "y": 7},
  "exits": {
    "p1": {"x": 8, "y": 0},
    "p2": {"x": 9, "y": 0}
  },
  "platforms": [
    {"id": "plat_1", "x": 4, "y": 4, "w": 2, "moving": true, "axis": "x", "range": 3, "speed": 1}
  ],
  "triggers": [
    {"type": "pressure_plate", "x": 2, "y": 6, "activates": "plat_1", "requires": "p2"}
  ]
}
```

## Tile Legend (grid values)
- `0` = empty air
- `1` = solid floor/wall
- `2` = spike (deadly)
- `3` = water (deadly for fire character)
- `4` = P1-only passable
- `5` = P2-only passable
