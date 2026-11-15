import { describe, expect, it } from "vitest";
import { botMove, emptyBoard, emptyCells, winningLine, type Board } from "./game";

const b = (s: string): Board => [...s].map((c) => (c === "X" || c === "O" ? c : null));

describe("winningLine", () => {
  it("finds rows, columns and diagonals", () => {
    expect(winningLine(b("XXX" + "OO." + "..."))).toEqual([0, 1, 2]);
    expect(winningLine(b("OX." + "OX." + "O.X"))).toEqual([0, 3, 6]);
    expect(winningLine(b("XO." + "OX." + "..X"))).toEqual([0, 4, 8]);
    expect(winningLine(b("XOO" + "XO." + "O.X"))).toEqual([2, 4, 6]);
  });

  it("returns null with no winner, including a full board", () => {
    expect(winningLine(emptyBoard())).toBeNull();
    const full = b("XOX" + "XOO" + "OXX");
    expect(winningLine(full)).toBeNull();
    expect(emptyCells(full)).toEqual([]);
  });
});

describe("botMove", () => {
  it("medium takes a win before blocking", () => {
    // O can win at 5, X threatens at 2.
    expect(botMove(b("XX." + "OO." + "..."), "O", "medium")).toBe(5);
  });

  it("medium blocks when it cannot win", () => {
    expect(botMove(b("XX." + "O.." + "..."), "O", "medium")).toBe(2);
  });

  it("easy only picks empty cells", () => {
    const board = b("XOX" + "OX." + "O.X");
    for (let i = 0; i < 20; i++) expect([5, 7]).toContain(botMove(board, "O", "easy"));
  });

  it("hard opens on any cell of an empty board", () => {
    expect(botMove(emptyBoard(), "O", "hard", () => 0.5)).toBe(4);
  });

  it("hard never loses, whatever the opponent plays", () => {
    // Walk every possible X game against the hard bot playing O.
    const play = (board: Board) => {
      for (const x of emptyCells(board)) {
        const afterX = board.map((c, i) => (i === x ? "X" : c)) as Board;
        expect(winningLine(afterX), `X won via ${afterX.join("")}`).toBeNull();
        if (emptyCells(afterX).length === 0) continue;
        const o = botMove(afterX, "O", "hard", () => 0);
        const afterO = afterX.map((c, i) => (i === o ? "O" : c)) as Board;
        if (!winningLine(afterO)) play(afterO);
      }
    };
    play(emptyBoard());
  });
});
