"use client";

import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useEffect, useReducer, useState } from "react";
import { timeLeft } from "@/lib/clock";
import { botMove, emptyCells, MARKS, type Player } from "@/lib/game";
import { DEFAULT_SETTINGS, newMatch, reduce, type Match } from "@/lib/match";
import { recordResult, useScore } from "@/lib/score";
import { setMuted, sfx, unlockAudio } from "@/lib/sound";
import { Board } from "./Board";
import { PlayerClock } from "./PlayerClock";
import { RollingText } from "./RollingText";
import { Setup } from "./Setup";
import { useClockView } from "./useClockView";

const COUNT_STEP_MS = 650;
const now = () => performance.now();

function playerNames(m: Match): [string, string] {
  return m.settings.mode === "bot" ? ["You", "Bot"] : ["Player X", "Player O"];
}

function statusText(m: Match): string {
  const bot = m.settings.mode === "bot";
  const names = bot ? ["You", "Bot"] : ["X", "O"];
  const wins = (p: Player) => (bot && p === 0 ? "You win" : `${names[p]} wins`);
  if (m.phase === "idle") return "Press Start";
  if (m.phase === "countdown") return "Get ready";
  if (m.phase === "playing") {
    // Right after a draw wipes the board, say so until the next move.
    if (m.clears > 0 && m.board.every((cell) => cell === null)) return "Draw! Board cleared";
    if (!bot) return `${names[m.clock.active]} to move`;
    return m.clock.active === 0 ? "Your move" : "Bot is thinking";
  }
  const result = m.result!;
  if (result.kind === "win") return wins(result.winner);
  return `Time's up! ${wins(result.winner)}`;
}

export default function Game() {
  const [m, dispatch] = useReducer(reduce, DEFAULT_SETTINGS, newMatch);
  const [soundOn, setSoundOn] = useState(true);
  const { settings, phase, clock, result, board } = m;
  const { mode, level } = settings;
  const playing = phase === "playing";
  const score = useScore(mode);
  const names = playerNames(m);

  const xView = useClockView(clock, 0, settings.baseMs, playing);
  const oView = useClockView(clock, 1, settings.baseMs, playing);
  const activeView = clock.active === 0 ? xView : oView;
  const danger = playing && activeView.stage === "danger";
  // A number that changes each time the low-time tick should sound:
  // once a second under 10s, twice a second under 5s.
  const beat = !playing
    ? 0
    : danger
      ? Math.ceil(activeView.tenths / 5)
      : activeView.stage === "warn"
        ? Math.ceil(activeView.tenths / 10) * 2
        : 0;

  // Countdown: 3, 2, 1, then the clock starts.
  useEffect(() => {
    if (phase !== "countdown") return;
    const timer = setTimeout(() => dispatch({ type: "count", now: now() }), COUNT_STEP_MS);
    return () => clearTimeout(timer);
  }, [phase, m.count]);

  // End the game the moment the running clock hits zero.
  useEffect(() => {
    if (phase !== "playing") return;
    const left = timeLeft(clock, clock.active, now());
    const timer = setTimeout(() => dispatch({ type: "tick", now: now() }), left + 10);
    return () => clearTimeout(timer);
  }, [phase, clock]);

  // The bot plays O. Its thinking time comes off its own clock.
  useEffect(() => {
    if (phase !== "playing" || mode !== "bot" || clock.active !== 1) return;
    const think = 300 + Math.random() * 600;
    const timer = setTimeout(
      () => dispatch({ type: "move", cell: botMove(board, "O", level), now: now() }),
      think,
    );
    return () => clearTimeout(timer);
  }, [phase, mode, level, clock.active, board]);

  // Save the result and play its sound.
  useEffect(() => {
    if (!result) return;
    recordResult(mode, result.winner === 0 ? "x" : "o");
    if (result.kind === "win") sfx.win();
    else {
      sfx.timeout();
      navigator.vibrate?.(200);
    }
  }, [result, mode]);

  // Count each draw when it wipes the board.
  useEffect(() => {
    if (m.clears === 0) return;
    recordResult(mode, "draws");
    sfx.draw();
  }, [m.clears, mode]);

  useEffect(() => {
    if (phase === "countdown") sfx.count();
    else if (phase === "playing") sfx.go();
  }, [phase, m.count]);

  const moves = 9 - emptyCells(board).length;
  useEffect(() => {
    if (moves > 0) sfx.place();
  }, [moves]);

  useEffect(() => {
    if (beat === 0) return;
    if (danger) {
      sfx.urgent();
      navigator.vibrate?.(20);
    } else sfx.tick();
  }, [beat, danger]);

  const start = () => {
    unlockAudio();
    dispatch({ type: "start" });
  };

  const toggleSound = () => {
    setMuted(soundOn);
    setSoundOn(!soundOn);
  };

  const winner = result?.winner ?? null;
  const clockProps = (player: Player) => ({
    player,
    name: names[player],
    view: player === 0 ? xView : oView,
    active: playing && clock.active === player,
    waiting: playing && clock.active !== player,
    bonusKey: m.bonus[player] > 0 ? `${m.id}-${m.bonus[player]}` : null,
    wins: player === 0 ? score.x : score.o,
    lostOnTime: result?.kind === "timeout" && result.winner !== player,
  });

  return (
    <MotionConfig reducedMotion="user">
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 py-5">
        <header className="flex items-center justify-between gap-3">
          <h1 className="outlined font-wide text-[1.65rem] leading-none font-bold">Blitz Tac Toe</h1>
          <button
            type="button"
            aria-pressed={soundOn}
            onClick={toggleSound}
            className="shrink-0 cursor-pointer rounded-lg border-3 border-ink bg-ink/45 px-3 py-1 text-sm font-medium active:scale-97"
          >
            Sound {soundOn ? "on" : "off"}
          </button>
        </header>

        <section aria-label="Scoreboard" className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <PlayerClock {...clockProps(0)} side="left" />
          <div className="flex flex-col items-center gap-1 leading-none">
            <span className="outlined font-display text-3xl font-bold">
              <RollingText text={String(score.draws)} />
              <span className="sr-only">{score.draws}</span>
            </span>
            <span className="text-xs font-medium text-white/75">
              {score.draws === 1 ? "draw" : "draws"}
            </span>
          </div>
          <PlayerClock {...clockProps(1)} side="right" />
        </section>

        <p
          role="status"
          className="outlined text-center font-display text-2xl font-bold transition-colors"
          style={{ color: winner === null ? undefined : `var(--${MARKS[winner].toLowerCase()})` }}
        >
          {statusText(m)}
        </p>

        <div className="relative mx-auto" style={{ width: "min(100%, max(16rem, 46dvh))" }}>
          <Board
            cells={board}
            line={result?.kind === "win" ? result.line : null}
            nextMark={MARKS[clock.active]}
            canPlay={playing && (mode === "local" || clock.active === 0)}
            onPlay={(cell) => dispatch({ type: "move", cell, now: now() })}
          />
          <AnimatePresence>
            {phase === "idle" && (
              <motion.button
                key="start"
                type="button"
                onClick={start}
                className="absolute inset-0 m-auto h-fit w-fit cursor-pointer rounded-2xl border-3 border-ink bg-gold px-9 py-4 font-wide text-3xl leading-none font-bold text-ink shadow-[0_6px_0_var(--ink)]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              >
                Start
              </motion.button>
            )}
            {phase === "countdown" && (
              <motion.div
                key="count"
                aria-hidden
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4"
                exit={{ opacity: 0 }}
              >
                {/* Starting lights: one more block goes red with each count. */}
                <div className="flex gap-2">
                  {[3, 2, 1].map((n) => (
                    <span
                      key={n}
                      className={`size-6 rounded-md border-3 border-ink ${m.count <= n ? "bg-danger" : "bg-ink/60"}`}
                    />
                  ))}
                </div>
                <motion.span
                  key={m.count}
                  className="outlined font-wide text-8xl leading-none font-bold"
                  initial={{ opacity: 0, scale: 1.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", bounce: 0.25, duration: 0.35 }}
                >
                  {m.count}
                </motion.span>
              </motion.div>
            )}
            {playing && (
              <motion.span
                key={`go-${m.id}`}
                aria-hidden
                className="outlined pointer-events-none absolute inset-0 grid place-items-center font-wide text-8xl font-bold text-o"
                initial={{ opacity: 1, scale: 0.7 }}
                animate={{ opacity: [1, 1, 0], scale: [0.7, 1.1, 1.5] }}
                transition={{ duration: 0.7, times: [0, 0.4, 1], ease: "easeOut" }}
              >
                GO
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={start}
          className="mb-1.5 cursor-pointer rounded-xl border-3 border-ink bg-gold py-2.5 font-display text-xl font-bold text-ink shadow-[0_5px_0_var(--ink)] transition-[translate,box-shadow] duration-75 active:translate-y-[5px] active:shadow-none"
        >
          New Game
        </button>

        <Setup settings={settings} onChange={(patch) => dispatch({ type: "settings", patch })} />
      </main>

      {/* Red glow at the screen edges while the running clock is under five seconds. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 transition-opacity duration-300"
        style={{ opacity: danger ? 1 : 0, boxShadow: "inset 0 0 110px 12px rgb(255 51 82 / 0.6)" }}
      />
    </MotionConfig>
  );
}
