# Blitz Tac Toe

Tic-tac-toe on a chess clock. Each player has their own timer, and it only runs on their turn. Get three in a row before your time runs out.

**Live demo:** https://blitz-tac-toe.vercel.app

> **Status:** the local two-player game, the bot and all the timer motion are built. Online play and the leaderboard are planned but not built. [PLAN.md](PLAN.md) has the full checklist.

## How to play

1. Pick a mode and a time control, then press Start.
2. Wait for the 3‑2‑1‑GO countdown.
3. Tap a square to place your mark. Your clock stops and your opponent's starts.
4. If the board fills up with no winner, it's a draw: the board clears and play carries on with the clocks still running.
5. The game ends one of two ways:
   - **Win:** three in a row.
   - **Timeout:** a player's clock reaches zero and they lose.
6. Press **New Game** to start over.

## Features

- **Chess-style clocks.** 15, 30 or 60 seconds per player, with an optional +1 second per move.
- **Three ways to play.**
  - Local: two players on one device.
  - Vs Bot: Easy, Medium or Hard. Hard cannot be beaten.
  - Online: get matched with a random player. _(planned, not built)_
- **Scoreboard.** Wins and draws are counted and saved in the browser. Two-player games and bot games keep separate scores.
- **Online leaderboard.** Pick a nickname and climb a chess-style rating ladder. _(planned, not built)_
- **A timer that builds tension.**
  - A ring around each player drains smoothly.
  - Digits roll as they change.
  - At 10 seconds the ring turns amber and tenths of a second appear.
  - At 5 seconds the ring turns red, the clock beats like a heart and the screen edges glow.
  - A "+1" floats up and drops into the clock whenever a player earns bonus time.
- **A geometric arcade look.** Chunky outlined blocks, bright colors and a square timer, set in the Array typeface.
- **Built for phones first.** It also works with a keyboard and respects the "reduce motion" setting.

## Tech

- [Next.js](https://nextjs.org) (App Router) and React
- TypeScript
- Tailwind CSS
- [Motion](https://motion.dev) for springs and rolling digits
- Fonts: [Array](https://www.fontshare.com/fonts/array) by Indian Type Foundry (self-hosted) and Rubik
- Deployed on Vercel

## Run it locally

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000.

## Run the tests

```bash
npm test
```

The tests cover the game rules, the bot's move choices, the clock and how a match moves from countdown to result.

## How it's organized

| Path | What's in it |
| --- | --- |
| `app/` | Pages, layout and the Array font files |
| `components/` | Board, player clock, rolling digits, setup controls |
| `lib/game.ts` | Game rules and the bot, as plain functions |
| `lib/clock.ts` | Clock math and what the clock displays |
| `lib/match.ts` | The steps of a match: countdown, moves, win, draw, timeout |
| `lib/score.ts` | The saved scoreboard |
| `lib/sound.ts` | Sound effects, generated in the browser |

## A note on AI

This project was built with Claude Code. I directed the design and the game feel, and reviewed and tested the result.
