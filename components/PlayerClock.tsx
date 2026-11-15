"use client";

import { AnimatePresence, motion } from "motion/react";
import { MARKS, type Player } from "@/lib/game";
import { MarkIcon } from "./Board";
import { RollingText } from "./RollingText";
import type { ClockView } from "./useClockView";

// A rounded square that starts at the top center and runs clockwise, so the
// timer drains back toward twelve o'clock.
const SQUARE =
  "M50 8 H74 a18 18 0 0 1 18 18 V74 a18 18 0 0 1 -18 18 H26 a18 18 0 0 1 -18 -18 V26 a18 18 0 0 1 18 -18 Z";

type Props = {
  player: Player;
  name: string;
  view: ClockView;
  /** This player's clock is running. */
  active: boolean;
  /** The other player's clock is running. */
  waiting: boolean;
  /** Changes every time this player earns +1s. Null before the first one. */
  bonusKey: string | null;
  wins: number;
  lostOnTime: boolean;
  side: "left" | "right";
};

export function PlayerClock(props: Props) {
  const { player, name, view, active, waiting, bonusKey, wins, lostOnTime, side } = props;
  const mark = MARKS[player];
  const ringColor =
    view.stage === "calm"
      ? `var(--${mark.toLowerCase()})`
      : view.stage === "warn"
        ? "var(--warn)"
        : "var(--danger)";
  const flip = side === "right";

  return (
    <motion.div
      className={`flex flex-col gap-2 ${flip ? "items-end" : "items-start"}`}
      animate={{ opacity: waiting ? 0.5 : 1, x: lostOnTime ? [0, -9, 9, -6, 6, -3, 0] : 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className={`flex items-center gap-3 ${flip ? "flex-row-reverse" : ""}`}>
        <motion.div
          className="relative size-22"
          animate={{ scale: active ? 1.06 : waiting ? 0.92 : 1 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        >
          <motion.div className="absolute inset-0" style={{ scale: view.pulse }}>
            <svg viewBox="0 0 100 100" className="size-full" fill="none" aria-hidden>
              <path d={SQUARE} fill="var(--ink)" fillOpacity="0.6" stroke="var(--ink)" strokeWidth="13" />
              <path d={SQUARE} stroke="white" strokeOpacity="0.14" strokeWidth="6" />
              {view.stage !== "out" && (
                <motion.path
                  d={SQUARE}
                  stroke={ringColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="transition-[stroke] duration-300"
                  style={{ pathLength: view.progress }}
                />
              )}
            </svg>
            {bonusKey && (
              <motion.span
                key={bonusKey}
                aria-hidden
                className="absolute inset-3.5 rounded-lg bg-gold"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            )}
            <div
              role="timer"
              aria-label={`${name} clock, ${view.text}`}
              className="absolute inset-0 grid place-items-center font-display text-2xl font-semibold"
            >
              {view.stage === "out" ? (
                <span className="text-xl font-bold text-danger">TIME!</span>
              ) : (
                <RollingText text={view.text} />
              )}
            </div>
          </motion.div>

          {/* The +1 pops in oversized, settles, then floats up and fades. */}
          <AnimatePresence>
            {bonusKey && (
              <motion.span
                key={bonusKey}
                aria-hidden
                className="outlined absolute -top-4 left-1/2 font-display text-3xl font-bold text-gold"
                style={{ x: "-50%" }}
                initial={{ opacity: 0, scale: 0.4, y: 8 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.5, 1, 1], y: [8, -8, -14, -36] }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.95, times: [0, 0.18, 0.42, 1], ease: "easeOut" }}
              >
                +1
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        <div className={`flex flex-col gap-1 leading-none ${flip ? "items-end" : ""}`}>
          <span className="outlined font-display text-4xl font-bold">
            <RollingText text={String(wins)} />
            <span className="sr-only">{wins}</span>
          </span>
          <span className="text-xs font-medium text-white/75">{wins === 1 ? "win" : "wins"}</span>
        </div>
      </div>

      <div className={`flex items-center gap-1.5 text-sm font-medium ${flip ? "flex-row-reverse" : ""}`}>
        <MarkIcon mark={mark} className="size-4.5" />
        {name}
      </div>
    </motion.div>
  );
}
