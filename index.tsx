import React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../game/store/gameStore';
import { THEMES, WORLD_THEMES, getThemeForLevel } from '../constants/colors';
import { LEVELS } from '../game/levels/levels';

const WORLD_NAMES = ['Tokyo', 'Egypt', 'Amazon', 'Arctic', 'Space'];
const WORLD_EMOJIS = ['🗼', '🏺', '🌿', '🧊', '🚀'];

export default function HomeScreen() {
  const router = useRouter();
  const { unlockedLevels, setCurrentLevel, resetLevel } = useGameStore();

  const theme = 'tokyo';
  const colors = THEMES[theme];

  const handlePlayLevel = (id: number) => {
    setCurrentLevel(id);
    resetLevel();
    router.push('/solo');
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={[styles.logo, { color: colors.tileAccent }]}>PEPELO</Text>
        <Text style={[styles.tagline, { color: '#666' }]}>
          Coordinate. Cooperate. Escape.
        </Text>
      </View>

      {/* ── Mode Buttons ────────────────────────────────────────── */}
      <View style={styles.modes}>
        <Pressable
          style={[styles.modeBtn, { backgroundColor: colors.p1 }]}
          onPress={() => handlePlayLevel(1)}
        >
          <Text style={styles.modeBtnText}>Solo Play</Text>
          <Text style={styles.modeBtnSub}>Switch between characters</Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, { backgroundColor: colors.p2 }]}
          onPress={() => router.push('/coop')}
        >
          <Text style={styles.modeBtnText}>Co-op Online</Text>
          <Text style={styles.modeBtnSub}>Play with a friend</Text>
        </Pressable>
      </View>

      {/* ── Level Select ────────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.ui }]}>Levels</Text>
      <ScrollView contentContainerStyle={styles.levelGrid}>
        {WORLD_NAMES.map((world, wi) => (
          <View key={world} style={styles.worldBlock}>
            <Text style={[styles.worldTitle, { color: colors.tileAccent }]}>
              {WORLD_EMOJIS[wi]}  {world}
            </Text>
            <View style={styles.levelRow}>
              {Array.from({ length: 10 }, (_, i) => {
                const id = wi * 10 + i + 1;
                const unlocked = id <= unlockedLevels;
                const levelTheme = getThemeForLevel(id);
                const tc = THEMES[levelTheme];
                return (
                  <Pressable
                    key={id}
                    style={[
                      styles.levelDot,
                      {
                        backgroundColor: unlocked ? tc.p1 + 'dd' : '#222',
                        borderColor: unlocked ? tc.p1 : '#333',
                      },
                    ]}
                    onPress={() => unlocked && handlePlayLevel(id)}
                    disabled={!unlocked}
                  >
                    <Text
                      style={[
                        styles.levelDotText,
                        { color: unlocked ? '#000' : '#444' },
                      ]}
                    >
                      {id}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { alignItems: 'center', paddingTop: 24, paddingBottom: 8 },
  logo: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 8,
  },
  tagline: { fontSize: 13, marginTop: 4 },
  modes: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modeBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 4,
  },
  modeBtnText: { fontWeight: '800', fontSize: 16, color: '#000' },
  modeBtnSub: { fontSize: 11, color: '#000000aa' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    paddingHorizontal: 16,
    marginBottom: 8,
    opacity: 0.6,
  },
  levelGrid: { paddingHorizontal: 16, paddingBottom: 40, gap: 20 },
  worldBlock: { gap: 10 },
  worldTitle: { fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  levelDot: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelDotText: { fontSize: 13, fontWeight: '700' },
});
