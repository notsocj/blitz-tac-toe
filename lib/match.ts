import { newClock, passTurn, startClock, stopClock, timeLeft, type Clock } from "./clock";
import { emptyBoard, emptyCells, MARKS, other, winningLine } from "./game";
import type { Board, Level, Player } from "./game";

export type Mode = "local" | "bot";
export type Settings = { mode: Mode; level: Level; baseMs: number; increment: boolean };
/** There is no draw result: a full board is wiped and play goes on until a win or a timeout. */
export type Result =
  | { kind: "win"; winner: Player; line: number[] }
  | { kind: "timeout"; winner: Player };

export type Match = {
  settings: Settings;
  /** Goes up by one every new game, so the screen can restart its animations. */
  id: number;
  phase: "idle" | "countdown" | "playing" | "over";
  /** Countdown number on screen: 3, 2, 1. */
  count: number;
  board: Board;
  clock: Clock;
  result: Result | null;
  /** How many times the board filled up with no winner and was wiped this game. */
  clears: number;
  /** How many +1s bonuses each player has earned this game. */
  bonus: [number, number];
};

export type Action =
  | { type: "settings"; patch: Partial<Settings> }
  | { type: "start" }
  | { type: "count"; now: number }
  | { type: "move"; cell: number; now: number }
  | { type: "tick"; now: number };

export const BONUS_MS = 1000;
export const DEFAULT_SETTINGS: Settings = {
  mode: "local",
  level: "medium",
  baseMs: 30_000,
  increment: true,
};

export function newMatch(settings: Settings, id = 0, phase: "idle" | "countdown" = "idle"): Match {
  return {
    settings,
    id,
    phase,
    count: 3,
    board: emptyBoard(),
    clock: newClock(settings.baseMs),
    result: null,
    clears: 0,
    bonus: [0, 0],
  };
}

const finish = (m: Match, now: number, result: Result): Match => ({
  ...m,
  phase: "over",
  clock: stopClock(m.clock, now),
  result,
});

export function reduce(m: Match, action: Action): Match {
  switch (action.type) {
    case "settings":
      return newMatch({ ...m.settings, ...action.patch }, m.id + 1);

    case "start":
      return newMatch(m.settings, m.id + 1, "countdown");

    case "count":
      if (m.phase !== "countdown") return m;
      if (m.count > 1) return { ...m, count: m.count - 1 };
      return { ...m, phase: "playing", clock: startClock(m.clock, action.now) };

    case "tick": {
      if (m.phase !== "playing") return m;
      const mover = m.clock.active;
      if (timeLeft(m.clock, mover, action.now) > 0) return m;
      return finish(m, action.now, { kind: "timeout", winner: other(mover) });
    }

    case "move": {
      if (m.phase !== "playing" || m.board[action.cell] !== null) return m;
      const mover = m.clock.active;
      // A move that arrives after the clock ran out loses on time.
      if (timeLeft(m.clock, mover, action.now) <= 0) {
        return finish(m, action.now, { kind: "timeout", winner: other(mover) });
      }
      const board = m.board.map((c, i) => (i === action.cell ? MARKS[mover] : c));
      const line = winningLine(board);
      if (line) return finish({ ...m, board }, action.now, { kind: "win", winner: mover, line });

      const bonus: [number, number] = [...m.bonus];
      if (m.settings.increment) bonus[mover] += 1;
      // A full board with no winner is wiped and play goes on. The clocks keep running.
      const full = emptyCells(board).length === 0;
      return {
        ...m,
        board: full ? emptyBoard() : board,
        clears: m.clears + (full ? 1 : 0),
        bonus,
        clock: passTurn(m.clock, action.now, m.settings.increment ? BONUS_MS : 0),
      };
    }
  }
}
