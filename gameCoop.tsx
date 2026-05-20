import React, { useEffect, useRef, useCallback } from 'react';
import { View } from 'react-native';
import { useGameStore } from '../store/gameStore';
import {
  applyGravity,
  resolveCollision,
  tileToPixel,
  overlaps,
} from './Physics';
import { TILE_SIZE, PHYSICS } from '../../constants/layout';
import { LevelDef, PlatformDef, TriggerDef } from '../levels/levels';

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
}

interface PlatformRuntime extends PlatformDef {
  currentX: number;
  currentY: number;
  direction: number; // 1 or -1
}

interface Props {
  level: LevelDef;
  p1Input: InputState;
  p2Input: InputState;
  children: (state: GameRenderState) => React.ReactNode;
}

export interface GameRenderState {
  p1: { x: number; y: number; velX: number; alive: boolean; atExit: boolean };
  p2: { x: number; y: number; velX: number; alive: boolean; atExit: boolean };
  platforms: PlatformRuntime[];
  activeTriggers: Set<string>;
}

const CHAR_W = TILE_SIZE * 0.7;
const CHAR_H = TILE_SIZE * 0.9;

export default function GameLoop({ level, p1Input, p2Input, children }: Props) {
  const setP1 = useGameStore((s) => s.setP1);
  const setP2 = useGameStore((s) => s.setP2);
  const setLevelComplete = useGameStore((s) => s.setLevelComplete);
  const setGameOver = useGameStore((s) => s.setGameOver);

  const p1StartPx = tileToPixel(level.p1_start.x, level.p1_start.y);
  const p2StartPx = tileToPixel(level.p2_start.x, level.p2_start.y);
  const p1ExitPx = tileToPixel(level.exits.p1.x, level.exits.p1.y);
  const p2ExitPx = tileToPixel(level.exits.p2.x, level.exits.p2.y);

  const stateRef = useRef<GameRenderState>({
    p1: { x: p1StartPx.x, y: p1StartPx.y, velX: 0, alive: true, atExit: false },
    p2: { x: p2StartPx.x, y: p2StartPx.y, velX: 0, alive: true, atExit: false },
    platforms: level.platforms.map((p) => ({
      ...p,
      currentX: p.x * TILE_SIZE,
      currentY: p.y * TILE_SIZE,
      direction: 1,
    })),
    activeTriggers: new Set(),
  });

  const velRef = useRef({
    p1: { velX: 0, velY: 0, onGround: false },
    p2: { velX: 0, velY: 0, onGround: false },
  });

  const rafRef = useRef<number>(0);
  const lastTime = useRef<number>(0);
  const renderCallback = useRef<((state: GameRenderState) => void) | null>(null);

  const tick = useCallback((timestamp: number) => {
    const dt = Math.min((timestamp - lastTime.current) / 16.67, 3); // cap at 3x speed
    lastTime.current = timestamp;

    const s = stateRef.current;
    const v = velRef.current;

    if (!s.p1.alive || !s.p2.alive) {
      setGameOver(true);
      return;
    }
    if (s.p1.atExit && s.p2.atExit) {
      setLevelComplete(true);
      return;
    }

    // ── Update platforms ──────────────────────────────────────────────
    const activeTriggers = new Set<string>();

    // Check triggers (pressure plates / levers)
    for (const trigger of level.triggers) {
      const tx = trigger.x * TILE_SIZE;
      const ty = trigger.y * TILE_SIZE;
      const triggerRect = { x: tx, y: ty, w: TILE_SIZE, h: TILE_SIZE };

      const p1Rect = { x: s.p1.x, y: s.p1.y, w: CHAR_W, h: CHAR_H };
      const p2Rect = { x: s.p2.x, y: s.p2.y, w: CHAR_W, h: CHAR_H };

      const p1On = overlaps(p1Rect, triggerRect);
      const p2On = overlaps(p2Rect, triggerRect);

      let activated = false;
      if (trigger.requires === 'p1') activated = p1On;
      else if (trigger.requires === 'p2') activated = p2On;
      else if (trigger.requires === 'both') activated = p1On && p2On;
      else activated = p1On || p2On; // 'any'

      if (activated) activeTriggers.add(trigger.activates);
    }
    stateRef.current.activeTriggers = activeTriggers;

    // Move platforms
    for (const plat of s.platforms) {
      if (!plat.moving) continue;

      // If controlled by trigger, only move when active
      const isTriggerControlled = level.triggers.some(
        (t) => t.activates === plat.id
      );
      if (isTriggerControlled && !activeTriggers.has(plat.id)) continue;

      const speed = (plat.speed ?? 1) * dt;
      const range = (plat.range ?? 2) * TILE_SIZE;
      const origin = plat.axis === 'x' ? plat.x * TILE_SIZE : plat.y * TILE_SIZE;

      if (plat.axis === 'x') {
        plat.currentX += speed * plat.direction;
        if (plat.currentX > origin + range || plat.currentX < origin - range) {
          plat.direction *= -1;
        }
      } else {
        plat.currentY += speed * plat.direction;
        if (plat.currentY > origin + range || plat.currentY < origin - range) {
          plat.direction *= -1;
        }
      }
    }

    // ── Update P1 ─────────────────────────────────────────────────────
    if (!s.p1.atExit) {
      let body = {
        x: s.p1.x, y: s.p1.y,
        w: CHAR_W, h: CHAR_H,
        velX: v.p1.velX, velY: v.p1.velY,
        onGround: v.p1.onGround,
      };

      body = applyGravity(body, dt);

      if (p1Input.left) body.velX = -PHYSICS.MOVE_SPEED;
      else if (p1Input.right) body.velX = PHYSICS.MOVE_SPEED;
      else body.velX *= 0.7; // friction

      if (p1Input.jump && body.onGround) {
        body.velY = PHYSICS.JUMP_FORCE;
        body.onGround = false;
      }

      const { body: resolved, hitHazard } = resolveCollision(body, level.grid, 'p1');
      v.p1 = { velX: resolved.velX, velY: resolved.velY, onGround: resolved.onGround };
      s.p1.x = resolved.x;
      s.p1.y = resolved.y;
      s.p1.velX = resolved.velX;

      if (hitHazard) s.p1.alive = false;

      // Check exit
      const exitRect = { x: p1ExitPx.x, y: p1ExitPx.y, w: TILE_SIZE, h: TILE_SIZE };
      const p1Rect = { x: s.p1.x, y: s.p1.y, w: CHAR_W, h: CHAR_H };
      if (overlaps(p1Rect, exitRect)) s.p1.atExit = true;
    }

    // ── Update P2 ─────────────────────────────────────────────────────
    if (!s.p2.atExit) {
      let body = {
        x: s.p2.x, y: s.p2.y,
        w: CHAR_W, h: CHAR_H,
        velX: v.p2.velX, velY: v.p2.velY,
        onGround: v.p2.onGround,
      };

      body = applyGravity(body, dt);

      if (p2Input.left) body.velX = -PHYSICS.MOVE_SPEED;
      else if (p2Input.right) body.velX = PHYSICS.MOVE_SPEED;
      else body.velX *= 0.7;

      if (p2Input.jump && body.onGround) {
        body.velY = PHYSICS.JUMP_FORCE;
        body.onGround = false;
      }

      const { body: resolved, hitHazard } = resolveCollision(body, level.grid, 'p2');
      v.p2 = { velX: resolved.velX, velY: resolved.velY, onGround: resolved.onGround };
      s.p2.x = resolved.x;
      s.p2.y = resolved.y;
      s.p2.velX = resolved.velX;

      if (hitHazard) s.p2.alive = false;

      const exitRect = { x: p2ExitPx.x, y: p2ExitPx.y, w: TILE_SIZE, h: TILE_SIZE };
      const p2Rect = { x: s.p2.x, y: s.p2.y, w: CHAR_W, h: CHAR_H };
      if (overlaps(p2Rect, exitRect)) s.p2.atExit = true;
    }

    // Push to Zustand for co-op sync (at reduced rate)
    setP1({ x: s.p1.x, y: s.p1.y, alive: s.p1.alive, atExit: s.p1.atExit });
    setP2({ x: s.p2.x, y: s.p2.y, alive: s.p2.alive, atExit: s.p2.atExit });

    renderCallback.current?.({ ...s, platforms: [...s.platforms] });

    rafRef.current = requestAnimationFrame(tick);
  }, [level, p1Input, p2Input]);

  useEffect(() => {
    lastTime.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  // Render via render prop
  const [renderState, setRenderState] = React.useState<GameRenderState>({
    ...stateRef.current,
  });

  useEffect(() => {
    renderCallback.current = setRenderState;
  }, []);

  return <>{children(renderState)}</>;
}
