export type Player = 0 | 1;
export type Mark = "X" | "O";
export type Board = (Mark | null)[];
export type Level = "easy" | "medium" | "hard";

export const MARKS: readonly [Mark, Mark] = ["X", "O"];
export const other = (p: Player): Player => (p === 0 ? 1 : 0);
export const emptyBoard = (): Board => Array(9).fill(null);

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/** The three cells of the winning row, or null if nobody has won. */
export function winningLine(board: Board): number[] | null {
  return (
    LINES.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]) ?? null
  );
}

export const emptyCells = (board: Board): number[] =>
  board.flatMap((cell, i) => (cell ? [] : [i]));

const place = (board: Board, cell: number, mark: Mark): Board =>
  board.map((c, i) => (i === cell ? mark : c));

const otherMark = (m: Mark): Mark => (m === "X" ? "O" : "X");

/** Best result `mark` can force with `turn` to move: 1 win, 0 draw, -1 loss. */
function minimax(board: Board, mark: Mark, turn: Mark): number {
  const line = winningLine(board);
  if (line) return board[line[0]] === mark ? 1 : -1;
  const cells = emptyCells(board);
  if (cells.length === 0) return 0;
  const scores = cells.map((c) => minimax(place(board, c, turn), mark, otherMark(turn)));
  return turn === mark ? Math.max(...scores) : Math.min(...scores);
}

/** Picks the bot's cell. The board must have at least one empty cell. */
export function botMove(board: Board, mark: Mark, level: Level, random = Math.random): number {
  const cells = emptyCells(board);
  const pick = (from: number[]) => from[Math.floor(random() * from.length)];
  const wins = (m: Mark) => cells.filter((c) => winningLine(place(board, c, m)));

  // On an empty board every cell is equally good, so skip searching the whole game.
  if (level === "easy" || cells.length === 9) return pick(cells);
  if (level === "medium") {
    const win = wins(mark);
    if (win.length) return pick(win);
    const block = wins(otherMark(mark));
    return pick(block.length ? block : cells);
  }
  const scores = cells.map((c) => minimax(place(board, c, mark), mark, otherMark(mark)));
  const best = Math.max(...scores);
  return pick(cells.filter((_, i) => scores[i] === best));
}
