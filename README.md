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
└── package.json# Pepe