import { useMemo, useSyncExternalStore } from "react";
import type { Mode } from "./match";

export type Score = { x: number; o: number; draws: number };

// Each mode keeps its own tally, so bot games don't mix with two-player games.
const key = (mode: Mode) => `blitz-tac-toe:score:${mode}`;
const cache = new Map<string, string>();
const listeners = new Set<() => void>();

function read(mode: Mode): string {
  const k = key(mode);
  if (!cache.has(k)) {
    let stored = "";
    try {
      stored = localStorage.getItem(k) ?? "";
    } catch {
      // Storage can be blocked (private mode). The score then lasts until reload.
    }
    cache.set(k, stored);
  }
  return cache.get(k)!;
}

const count = (v: unknown) => (Number.isInteger(v) && (v as number) >= 0 ? (v as number) : 0);

/** Saved data can be anything, so every field is checked. */
export function parseScore(raw: string): Score {
  let data: Partial<Record<keyof Score, unknown>> = {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") data = parsed;
  } catch {
    // Empty or broken data counts as a fresh score.
  }
  return { x: count(data.x), o: count(data.o), draws: count(data.draws) };
}

export function recordResult(mode: Mode, field: keyof Score) {
  const score = parseScore(read(mode));
  score[field] += 1;
  const raw = JSON.stringify(score);
  cache.set(key(mode), raw);
  try {
    localStorage.setItem(key(mode), raw);
  } catch {
    // Same as above: keep the in-memory score.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => void listeners.delete(notify);
}

export function useScore(mode: Mode): Score {
  const raw = useSyncExternalStore(subscribe, () => read(mode), () => "");
  return useMemo(() => parseScore(raw), [raw]);
}
