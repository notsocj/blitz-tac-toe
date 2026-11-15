"use client";

import { useAnimationFrame, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useState } from "react";
import { DANGER_MS, displayTenths, formatClock, stageOf, timeLeft, type Clock } from "@/lib/clock";
import type { Player } from "@/lib/game";

const BEAT_MS = 500;
/** A quick swell at the start of each beat, then rest. `t` runs 0 to 1 across the beat. */
const swell = (t: number) => (t < 0.35 ? Math.sin((Math.PI * t) / 0.35) : 0);

/**
 * Everything one player's clock needs to draw itself. The ring and heartbeat
 * update every frame through motion values, so React only re-renders when the
 * digits on screen change.
 */
export function useClockView(clock: Clock, player: Player, baseMs: number, playing: boolean) {
  const reducedMotion = useReducedMotion();
  const fill = useMotionValue(1);
  // The spring makes the ring bump forward on +1s and refill smoothly on a new game.
  const progress = useSpring(fill, { stiffness: 320, damping: 36 });
  const pulse = useMotionValue(1);
  const [tenths, setTenths] = useState(() => displayTenths(clock.left[player]));

  useAnimationFrame(() => {
    const left = timeLeft(clock, player, performance.now());
    fill.set(Math.min(1, left / baseMs));
    setTenths(displayTenths(left));
    const beating =
      playing && clock.active === player && left > 0 && left <= DANGER_MS && !reducedMotion;
    pulse.set(beating ? 1 + 0.09 * swell(1 - (left % BEAT_MS) / BEAT_MS) : 1);
  });

  return { progress, pulse, tenths, text: formatClock(tenths), stage: stageOf(tenths) };
}

export type ClockView = ReturnType<typeof useClockView>;
