import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';

const SERVER_URL = 'http://localhost:3001'; // Change to your deployed server URL

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ['websocket'],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

// ── Room Actions ────────────────────────────────────────────────────────────

export function createRoom(onCreated: (code: string) => void) {
  const s = connectSocket();
  s.emit('create_room');
  s.once('room_created', ({ code }: { code: string }) => {
    onCreated(code);
  });
}

export function joinRoom(
  code: string,
  onJoined: (role: 'p1' | 'p2') => void,
  onError: (msg: string) => void
) {
  const s = connectSocket();
  s.emit('join_room', { code });
  s.once('room_joined', ({ role }: { role: 'p1' | 'p2' }) => onJoined(role));
  s.once('room_error', ({ message }: { message: string }) => onError(message));
}

export function leaveRoom() {
  socket?.emit('leave_room');
}

// ── State Sync ───────────────────────────────────────────────────────────────

let syncInterval: ReturnType<typeof setInterval> | null = null;

export function startPositionSync(myRole: 'p1' | 'p2', getSyncState: () => { x: number; y: number }) {
  stopPositionSync();
  syncInterval = setInterval(() => {
    const state = getSyncState();
    socket?.emit('position_update', { role: myRole, ...state });
  }, 1000 / 20); // 20 ticks/sec
}

export function stopPositionSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

export function onOpponentUpdate(
  cb: (data: { role: 'p1' | 'p2'; x: number; y: number }) => void
) {
  const s = getSocket();
  s.off('opponent_update');
  s.on('opponent_update', cb);
}

export function onOpponentDisconnected(cb: () => void) {
  const s = getSocket();
  s.off('opponent_disconnected');
  s.on('opponent_disconnected', cb);
}

export function onBothReady(cb: () => void) {
  const s = getSocket();
  s.off('both_ready');
  s.on('both_ready', cb);
}

export function signalReady(levelId: number) {
  socket?.emit('player_ready', { levelId });
}
