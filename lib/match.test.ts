import { describe, expect, it } from "vitest";
import { timeLeft } from "./clock";
import { DEFAULT_SETTINGS, newMatch, reduce, type Match, type Settings } from "./match";

/** A match that started playing at t=0. */
function playing(settings: Partial<Settings> = {}): Match {
  let m = newMatch({ ...DEFAULT_SETTINGS, ...settings }, 0, "countdown");
  for (let i = 0; i < 3; i++) m = reduce(m, { type: "count", now: 0 });
  return m;
}

const moves = (m: Match, list: [cell: number, now: number][]) =>
  list.reduce((acc, [cell, now]) => reduce(acc, { type: "move", cell, now }), m);

describe("match", () => {
  it("counts down 3, 2, 1 and then starts X's clock", () => {
    let m = newMatch(DEFAULT_SETTINGS, 0, "countdown");
    m = reduce(m, { type: "count", now: 0 });
    expect([m.phase, m.count]).toEqual(["countdown", 2]);
    m = reduce(reduce(m, { type: "count", now: 0 }), { type: "count", now: 50 });
    expect(m.phase).toBe("playing");
    expect(m.clock).toMatchObject({ active: 0, startedAt: 50 });
  });

  it("only drains the clock of the player whose turn it is", () => {
    const m = moves(playing({ increment: false }), [[0, 4000]]);
    expect(m.clock.active).toBe(1);
    expect(timeLeft(m.clock, 0, 9000)).toBe(26_000);
    expect(timeLeft(m.clock, 1, 9000)).toBe(25_000);
  });

  it("adds one second to the mover when the increment is on", () => {
    const m = moves(playing({ increment: true }), [[0, 4000]]);
    expect(m.clock.left[0]).toBe(27_000);
    expect(m.bonus).toEqual([1, 0]);
  });

  it("ignores moves on taken cells and before the game starts", () => {
    const idle = newMatch(DEFAULT_SETTINGS);
    expect(reduce(idle, { type: "move", cell: 0, now: 0 })).toBe(idle);
    const m = moves(playing(), [[0, 100]]);
    expect(reduce(m, { type: "move", cell: 0, now: 200 })).toBe(m);
  });

  it("ends with a win and stops the clock", () => {
    const m = moves(playing({ increment: false }), [
      [0, 1000],
      [3, 2000],
      [1, 3000],
      [4, 4000],
      [2, 5000],
    ]);
    expect(m.phase).toBe("over");
    expect(m.result).toEqual({ kind: "win", winner: 0, line: [0, 1, 2] });
    expect(timeLeft(m.clock, 0, 99_000)).toBe(27_000);
  });

  it("wipes a full board with no winner and keeps playing", () => {
    const order = [0, 1, 2, 4, 3, 5, 7, 6, 8];
    const m = moves(playing({ increment: false }), order.map((cell, i) => [cell, (i + 1) * 100]));
    expect(m.phase).toBe("playing");
    expect(m.result).toBeNull();
    expect(m.clears).toBe(1);
    expect(m.board.every((c) => c === null)).toBe(true);
    // X filled the last cell, so O moves next and the clocks carry on.
    expect(m.clock).toMatchObject({ active: 1, startedAt: 900 });
    expect(m.clock.left[0]).toBe(29_500);
    const next = reduce(m, { type: "move", cell: 4, now: 1000 });
    expect(next.board[4]).toBe("O");
  });

  it("loses on time when the clock runs out", () => {
    const m = playing({ baseMs: 15_000 });
    expect(reduce(m, { type: "tick", now: 14_999 })).toBe(m);
    const out = reduce(m, { type: "tick", now: 15_000 });
    expect(out.result).toEqual({ kind: "timeout", winner: 1 });
  });

  it("treats a move made after time ran out as a loss on time", () => {
    const out = reduce(playing({ baseMs: 15_000 }), { type: "move", cell: 4, now: 15_001 });
    expect(out.result).toEqual({ kind: "timeout", winner: 1 });
    expect(out.board[4]).toBeNull();
  });

  it("starts a fresh game on start and on a settings change", () => {
    const m = moves(playing(), [[0, 100]]);
    const again = reduce(m, { type: "start" });
    expect(again.phase).toBe("countdown");
    expect(again.board.every((c) => c === null)).toBe(true);
    expect(again.id).toBe(m.id + 1);
    const changed = reduce(m, { type: "settings", patch: { baseMs: 60_000 } });
    expect(changed.phase).toBe("idle");
    expect(changed.clock.left).toEqual([60_000, 60_000]);
  });
});
