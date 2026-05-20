const { Server } = require('socket.io');
const http = require('http');

const PORT = process.env.PORT || 3001;

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// ── Room Manager ─────────────────────────────────────────────────────────────

/** rooms: Map<code, { p1SocketId, p2SocketId, levelId, readyCount }> */
const rooms = new Map();

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms.has(code) ? generateCode() : code; // ensure unique
}

// ── Socket Events ─────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[+] Connected: ${socket.id}`);

  // ── Create Room ──────────────────────────────────────────────────────
  socket.on('create_room', () => {
    const code = generateCode();
    rooms.set(code, {
      p1: socket.id,
      p2: null,
      levelId: null,
      readyCount: 0,
    });
    socket.join(code);
    socket.data.room = code;
    socket.data.role = 'p1';
    socket.emit('room_created', { code });
    console.log(`[Room] Created ${code} by ${socket.id}`);
  });

  // ── Join Room ────────────────────────────────────────────────────────
  socket.on('join_room', ({ code }) => {
    const room = rooms.get(code);
    if (!room) {
      socket.emit('room_error', { message: 'Room not found.' });
      return;
    }
    if (room.p2) {
      socket.emit('room_error', { message: 'Room is full.' });
      return;
    }

    room.p2 = socket.id;
    socket.join(code);
    socket.data.room = code;
    socket.data.role = 'p2';

    socket.emit('room_joined', { role: 'p2' });
    // Also confirm role to host
    io.to(room.p1).emit('room_joined', { role: 'p1' });

    console.log(`[Room] ${socket.id} joined ${code} as P2`);
  });

  // ── Player Ready ─────────────────────────────────────────────────────
  socket.on('player_ready', ({ levelId }) => {
    const code = socket.data.room;
    const room = rooms.get(code);
    if (!room) return;

    room.levelId = levelId;
    room.readyCount = (room.readyCount || 0) + 1;

    if (room.readyCount >= 2) {
      io.to(code).emit('both_ready', { levelId });
      room.readyCount = 0;
      console.log(`[Room] ${code} — both ready, starting level ${levelId}`);
    }
  });

  // ── Position Update ───────────────────────────────────────────────────
  socket.on('position_update', ({ role, x, y }) => {
    const code = socket.data.room;
    if (!code) return;
    // Broadcast to the OTHER player in the room
    socket.to(code).emit('opponent_update', { role, x, y });
  });

  // ── Leave Room ────────────────────────────────────────────────────────
  socket.on('leave_room', () => {
    handleLeave(socket);
  });

  socket.on('disconnect', () => {
    console.log(`[-] Disconnected: ${socket.id}`);
    handleLeave(socket);
  });
});

function handleLeave(socket) {
  const code = socket.data.room;
  if (!code) return;

  const room = rooms.get(code);
  if (!room) return;

  // Notify the other player
  socket.to(code).emit('opponent_disconnected');
  socket.leave(code);

  // Clean up room if both gone
  if (room.p1 === socket.id) room.p1 = null;
  if (room.p2 === socket.id) room.p2 = null;

  if (!room.p1 && !room.p2) {
    rooms.delete(code);
    console.log(`[Room] ${code} deleted`);
  }

  socket.data.room = null;
}

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`🎮 Pepelo co-op server running on port ${PORT}`);
});
