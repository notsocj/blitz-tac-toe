import { other, type Player } from "./game";

/**
 * A chess clock. `left` is each player's banked time in ms. While `startedAt`
 * is set, the active player's time is draining from that moment. Time left is
 * always calculated from timestamps, so it stays right in background tabs.
 */
export type Clock = {
  left: [number, number];
  active: Player;
  startedAt: number | null;
};

export const newClock = (baseMs: number): Clock => ({
  left: [baseMs, baseMs],
  active: 0,
  startedAt: null,
});

export function timeLeft(clock: Clock, player: Player, now: number): number {
  const running = player === clock.active && clock.startedAt !== null;
  return Math.max(0, clock.left[player] - (running ? now - clock.startedAt! : 0));
}

export const startClock = (clock: Clock, now: number): Clock => ({ ...clock, startedAt: now });

/** Freezes the clock, banking the time the active player has used. */
export function stopClock(clock: Clock, now: number): Clock {
  const left: [number, number] = [...clock.left];
  left[clock.active] = timeLeft(clock, clock.active, now);
  return { ...clock, left, startedAt: null };
}

/** The active player has moved: bank their time, add the bonus, start the opponent. */
export function passTurn(clock: Clock, now: number, bonusMs: number): Clock {
  const stopped = stopClock(clock, now);
  stopped.left[clock.active] += bonusMs;
  return { ...stopped, active: other(clock.active), startedAt: now };
}

export type Stage = "calm" | "warn" | "danger" | "out";
export const WARN_MS = 10_000;
export const DANGER_MS = 5_000;

/**
 * Rounds time left to what the display shows, in tenths of a second: whole
 * seconds above 10s, tenths below. Rounding up means the clock only reads zero
 * when time is really gone.
 */
export const displayTenths = (leftMs: number): number =>
  leftMs >= WARN_MS ? Math.ceil(leftMs / 1000) * 10 : Math.ceil(leftMs / 100);

/** "0:27" above ten seconds, "9.4" below. */
export function formatClock(tenths: number): string {
  if (tenths < 100) return `${Math.floor(tenths / 10)}.${tenths % 10}`;
  const secs = tenths / 10;
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
}

export function stageOf(tenths: number): Stage {
  if (tenths === 0) return "out";
  if (tenths <= DANGER_MS / 100) return "danger";
  if (tenths <= WARN_MS / 100) return "warn";
  return "calm";
}
