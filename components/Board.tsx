"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Board as Cells, Mark } from "@/lib/game";

const COLOR: Record<Mark, string> = { X: "var(--x)", O: "var(--o)" };
const WIN_TILE: Record<Mark, string> = { X: "bg-x/35", O: "bg-o/35" };

/** An X or O: a colored stroke over a dark outline. With `draw`, the strokes draw themselves in. */
export function MarkIcon({ mark, draw, className }: { mark: Mark; draw?: boolean; className?: string }) {
  const layers = [
    { stroke: "var(--ink)", strokeWidth: 20 },
    { stroke: COLOR[mark], strokeWidth: 11 },
  ];
  const drawIn = (delay: number) =>
    draw && {
      initial: { pathLength: 0, opacity: 0 },
      animate: { pathLength: 1, opacity: 1 },
      transition: {
        pathLength: { duration: 0.22, delay, ease: "easeOut" as const },
        opacity: { duration: 0.01, delay },
      },
    };
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" strokeLinecap="round" aria-hidden>
      {layers.map((layer) =>
        mark === "X" ? (
          <g key={layer.stroke} {...layer}>
            <motion.path d="M26 26 L74 74" {...drawIn(0)} />
            <motion.path d="M74 26 L26 74" {...drawIn(0.12)} />
          </g>
        ) : (
          <motion.circle key={layer.stroke} cx="50" cy="50" r="27" {...layer} {...drawIn(0)} />
        ),
      )}
    </svg>
  );
}

/** A stroke through the three winning cells, drawn on a 300×300 grid. */
function WinLine({ line }: { line: number[] }) {
  const center = (cell: number) => [(cell % 3) * 100 + 50, Math.floor(cell / 3) * 100 + 50];
  const [x1, y1] = center(line[0]);
  const [x2, y2] = center(line[2]);
  const length = Math.hypot(x2 - x1, y2 - y1);
  const [ex, ey] = [((x2 - x1) / length) * 30, ((y2 - y1) / length) * 30];
  const layers = [
    { stroke: "var(--ink)", strokeWidth: 15 },
    { stroke: "white", strokeWidth: 7 },
  ];
  return (
    <svg viewBox="0 0 300 300" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
      {layers.map((layer) => (
        <motion.path
          key={layer.stroke}
          d={`M${x1 - ex} ${y1 - ey} L${x2 + ex} ${y2 + ey}`}
          strokeLinecap="round"
          {...layer}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 0.35, delay: 0.25, ease: "easeOut" },
            opacity: { duration: 0.01, delay: 0.25 },
          }}
        />
      ))}
    </svg>
  );
}

type Props = {
  cells: Cells;
  /** The winning cells, once someone has won. */
  line: number[] | null;
  /** The mark a tap would place, shown as a faint preview on hover. */
  nextMark: Mark;
  canPlay: boolean;
  onPlay: (cell: number) => void;
};

export function Board({ cells, line, nextMark, canPlay, onPlay }: Props) {
  return (
    <div className="relative aspect-square w-full">
      <div className="grid size-full grid-cols-3 grid-rows-3 gap-2" role="group" aria-label="Board">
        {cells.map((cell, i) => {
          const won = line?.includes(i) && cell;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}, ${cell ?? "empty"}`}
              disabled={!canPlay || cell !== null}
              onClick={() => onPlay(i)}
              className={`group grid place-items-center rounded-xl border-3 border-ink shadow-[inset_0_3px_0_rgb(255_255_255/0.1)] transition-colors duration-300 enabled:cursor-pointer enabled:hover:bg-ink/35 enabled:active:bg-ink/25 ${won ? WIN_TILE[won] : "bg-ink/50"}`}
            >
              {/* Marks shrink away when the board is wiped. */}
              <AnimatePresence initial={false}>
                {cell && (
                  <motion.span
                    key={cell}
                    className={`size-[72%] [grid-area:1/1] ${line && !won ? "opacity-35" : ""}`}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2, ease: "easeIn" }}
                  >
                    <MarkIcon mark={cell} draw className="size-full" />
                  </motion.span>
                )}
              </AnimatePresence>
              {!cell && (
                <MarkIcon
                  mark={nextMark}
                  className="size-[72%] opacity-0 [grid-area:1/1] group-enabled:group-hover:opacity-25 group-enabled:group-focus-visible:opacity-25"
                />
              )}
            </button>
          );
        })}
      </div>
      {line && <WinLine line={line} />}
    </div>
  );
}
