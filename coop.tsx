import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import GameLoop, { InputState } from '../game/engine/GameLoop';
import LevelRenderer from '../components/LevelRenderer';
import DPad from '../components/ui/DPad';
import { useGameStore } from '../game/store/gameStore';
import { getLevelById } from '../game/levels/levels';
import { getThemeForLevel, THEMES } from '../constants/colors';
import {
  createRoom, joinRoom, onOpponentUpdate, onBothReady,
  onOpponentDisconnected, signalReady, startPositionSync,
  stopPositionSync, disconnectSocket, leaveRoom,
} from '../game/network/socket';

type LobbyState = 'menu' | 'hosting' | 'joining' | 'waiting' | 'playing' | 'disconnected';

export default function CoopScreen() {
  const router = useRouter();
  const {
    currentLevel, levelComplete, gameOver,
    setLevelComplete, setGameOver, resetLevel,
    setCurrentLevel, unlockLevel,
    roomCode, setRoomCode, coopReady, setCoopReady,
    p1, p2, setP1, setP2,
  } = useGameStore();

  const [lobbyState, setLobbyState] = useState<LobbyState>('menu');
  const [myRole, setMyRole] = useState<'p1' | 'p2'>('p1');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const level = getLevelById(currentLevel);
  const theme = getThemeForLevel(currentLevel);
  const colors = THEMES[theme];

  const myInputRef = useRef<InputState>({ left: false, right: false, jump: false });

  // ── Lobby Actions ─────────────────────────────────────────────────────────

  const handleHost = () => {
    setLobbyState('hosting');
    createRoom((code) => {
      setRoomCode(code);
      setLobbyState('waiting');

      onBothReady(() => {
        setLobbyState('playing');
        resetLevel();
        startPositionSync(myRole, () => ({ x: p1.x, y: p1.y }));
      });
    });
  };

  const handleJoin = () => {
    if (joinCode.length !== 4) {
      setError('Enter a 4-letter room code.');
      return;
    }
    setError('');
    setLobbyState('joining');

    joinRoom(
      joinCode.toUpperCase(),
      (role) => {
        setMyRole(role);
        setLobbyState('waiting');
        signalReady(currentLevel);

        onBothReady(() => {
          setLobbyState('playing');
          resetLevel();
          startPositionSync(role, () =>
            role === 'p1' ? { x: p1.x, y: p1.y } : { x: p2.x, y: p2.y }
          );
        });
      },
      (msg) => {
        setError(msg);
        setLobbyState('menu');
      }
    );
  };

  // Listen for opponent position updates
  useEffect(() => {
    onOpponentUpdate(({ role, x, y }) => {
      if (role === 'p1') setP1({ x, y });
      else setP2({ x, y });
    });

    onOpponentDisconnected(() => {
      stopPositionSync();
      setLobbyState('disconnected');
    });

    return () => {
      stopPositionSync();
      leaveRoom();
      disconnectSocket();
    };
  }, []);

  // When host is in waiting, signal ready too
  useEffect(() => {
    if (lobbyState === 'waiting' && myRole === 'p1') {
      signalReady(currentLevel);
    }
  }, [lobbyState]);

  const handleInput = useCallback((input: Partial<InputState>) => {
    Object.assign(myInputRef.current, input);
  }, []);

  const handleRetry = () => {
    resetLevel();
    setGameOver(false);
    signalReady(currentLevel);
  };

  const handleNextLevel = () => {
    const next = currentLevel + 1;
    unlockLevel(next);
    setCurrentLevel(next);
    resetLevel();
    setLevelComplete(false);
    signalReady(next);
  };

  // ── Lobby UI ──────────────────────────────────────────────────────────────

  if (lobbyState === 'menu') {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.ui }]}>← Back</Text>
        </Pressable>
        <View style={styles.center}>
          <Text style={[styles.title, { color: colors.ui }]}>Co-op Mode</Text>
          <Text style={[styles.sub, { color: '#888' }]}>Play with a friend in real time</Text>

          <Pressable
            style={[styles.btnPrimary, { backgroundColor: colors.p1 }]}
            onPress={handleHost}
          >
            <Text style={styles.btnText}>Host a Room</Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or join</Text>
            <View style={styles.dividerLine} />
          </View>

          <TextInput
            style={[styles.codeInput, { color: colors.ui, borderColor: colors.p2 }]}
            placeholder="Enter room code"
            placeholderTextColor="#555"
            value={joinCode}
            onChangeText={(t) => setJoinCode(t.toUpperCase())}
            maxLength={4}
            autoCapitalize="characters"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={[styles.btnPrimary, { backgroundColor: colors.p2 }]}
            onPress={handleJoin}
          >
            <Text style={styles.btnText}>Join Room</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (lobbyState === 'waiting' || lobbyState === 'hosting' || lobbyState === 'joining') {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.p1} size="large" />
          {roomCode ? (
            <>
              <Text style={[styles.title, { color: colors.ui }]}>Room Code</Text>
              <Text style={[styles.codeDisplay, { color: colors.tileAccent }]}>{roomCode}</Text>
              <Text style={[styles.sub, { color: '#888' }]}>Share this with your friend</Text>
            </>
          ) : (
            <Text style={[styles.sub, { color: '#888' }]}>Connecting...</Text>
          )}
          <Text style={[styles.sub, { color: '#555' }]}>
            {lobbyState === 'waiting' ? 'Waiting for second player...' : ''}
          </Text>
          <Pressable onPress={() => { leaveRoom(); setLobbyState('menu'); }}>
            <Text style={{ color: '#666', marginTop: 24 }}>Cancel</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (lobbyState === 'disconnected') {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
        <View style={styles.center}>
          <Text style={styles.overlayEmoji}>📡</Text>
          <Text style={[styles.title, { color: colors.ui }]}>Opponent Disconnected</Text>
          <Pressable
            style={[styles.btnPrimary, { backgroundColor: colors.p1 }]}
            onPress={() => setLobbyState('menu')}
          >
            <Text style={styles.btnText}>Back to Lobby</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────

  // In co-op: my input feeds only my character; opponent's position comes via socket
  const p1Input = myRole === 'p1' ? myInputRef.current : { left: false, right: false, jump: false };
  const p2Input = myRole === 'p2' ? myInputRef.current : { left: false, right: false, jump: false };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.hud}>
        <Text style={[styles.roleTag, { color: myRole === 'p1' ? colors.p1 : colors.p2 }]}>
          You are {myRole.toUpperCase()}
        </Text>
        <Text style={[styles.levelTitle, { color: colors.ui }]}>
          {level?.world} · {level?.name}
        </Text>
        <Text style={[styles.levelNum, { color: colors.tileAccent }]}>
          {currentLevel}/50
        </Text>
      </View>

      <View style={styles.canvas}>
        {level && (
          <GameLoop level={level} p1Input={p1Input} p2Input={p2Input}>
            {(renderState) => (
              <LevelRenderer level={level} renderState={renderState} theme={theme} />
            )}
          </GameLoop>
        )}
      </View>

      <View style={styles.controls}>
        <DPad
          onInputChange={handleInput}
          color={myRole === 'p1' ? colors.p1 : colors.p2}
        />
      </View>

      {levelComplete && (
        <View style={styles.overlay}>
          <Text style={styles.overlayEmoji}>🎉</Text>
          <Text style={styles.overlayTitle}>Level Complete!</Text>
          <Pressable style={[styles.btnPrimary, { backgroundColor: colors.p1 }]} onPress={handleNextLevel}>
            <Text style={styles.btnText}>Next Level →</Text>
          </Pressable>
        </View>
      )}

      {gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.overlayEmoji}>💀</Text>
          <Text style={styles.overlayTitle}>Try Again</Text>
          <Text style={styles.hintText}>{level?.hint}</Text>
          <Pressable style={[styles.btnPrimary, { backgroundColor: colors.p2 }]} onPress={handleRetry}>
            <Text style={styles.btnText}>Retry</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  backBtn: { padding: 16 },
  backText: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800' },
  sub: { fontSize: 14 },
  codeInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
    width: 200,
  },
  codeDisplay: { fontSize: 48, fontWeight: '900', letterSpacing: 12 },
  errorText: { color: '#ff4444', fontSize: 13 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '80%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#333' },
  dividerText: { color: '#555', fontSize: 12 },
  btnPrimary: {
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 30,
    width: 220,
    alignItems: 'center',
  },
  btnText: { color: '#000', fontWeight: '800', fontSize: 16 },
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  roleTag: { fontSize: 13, fontWeight: '800' },
  levelTitle: { fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'center' },
  levelNum: { fontSize: 13, fontWeight: '700' },
  canvas: { flex: 1 },
  controls: { paddingHorizontal: 20, paddingVertical: 16, alignItems: 'center' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  overlayEmoji: { fontSize: 56 },
  overlayTitle: { color: '#fff', fontSize: 28, fontWeight: '800' },
  hintText: { color: '#aaa', fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
});
