# Build plan

The spec for Blitz Tac Toe. Check items off as they ship.

## What must work to pass

These come from the job's test instructions. Everything else is extra.

1. Two players take turns placing marks on a 3×3 board.
2. The game shows who won, or that it's a draw.
3. A **New Game** button starts over.

Local two-player is the default screen, so a reviewer sees these three things without choosing anything.

A draw does not end the game here (see the rules below), but the game still says "Draw! Board cleared" and counts it on the scoreboard, which covers point 2.

## Game rules

- X moves first.
- Pressing Start or New Game plays a 3‑2‑1‑GO countdown, then X's clock starts.
- A player's clock only runs on their turn.
- Placing a mark stops your clock and starts your opponent's.
- With the increment on, you gain 1 second after each move you make.
- **Draw:** when the board is full with no winner, the game shows "Draw! Board cleared", adds one to the draw count, wipes the board and play continues. The clocks keep running, and the player who did not fill the last square moves first.
- Results:
  - **Win:** three in a row.
  - **Timeout:** your clock hits zero and you lose.

### Time controls

| Time per player | Increment |
| --- | --- |
| 15s | +1s or none |
| 30s (default) | +1s (default) or none |
| 60s | +1s or none |

## Modes

1. **Local.** Two players share one device.
2. **Vs Bot.**
   - Easy: random squares.
   - Medium: takes a win or blocks one when it can, otherwise random.
   - Hard: plays perfectly (minimax).
   - The bot waits 0.3–0.9s before moving, and that time comes off its clock.
3. **Online (stretch).** Random matchmaking. If no one joins within about 15 seconds, offer a bot match that is labeled as a bot.

## Ranking

- **Local scoreboard:** X wins, O wins and draws, saved in `localStorage`. Two-player and bot games keep separate scores.
- **Online leaderboard (stretch):** guest nickname, Elo rating, top 20.

## Look

A clean geometric arcade style.

- **Blocks:** every tile, button and control has a thick dark outline. Buttons sit on a hard shadow and press down when tapped.
- **Colors:** a blue-to-violet background with a faint grid. X is cyan, O is lime, primary buttons and the "+1" are yellow.
- **Timer shape:** a rounded square that drains clockwise back to the top.
- **Fonts:** Array (bold, semibold and bold wide) for the title, numbers, status and buttons. Rubik for small labels.

## Timer motion

The timer should feel like an Apple timer: smooth, springy and never jumpy.

- **Draining ring.** A rounded-square SVG ring around each player's clock shrinks every frame, not once per second.
- **Rolling digits.** Each digit slides up when it changes. Digits are fixed-width so the number doesn't jiggle.
- **Spring focus.** The active player's card springs slightly larger and the waiting card dims.

### Tension stages

| Time left | What changes |
| --- | --- |
| Above 10s | Calm, neutral colors |
| 10s and under | Ring turns amber, tenths appear (9.4), soft tick sound |
| 5s and under | Ring turns red, heartbeat pulse twice a second, red glow at the screen edges, faster tick, vibration on Android |
| 0s | Clock shakes and "TIME!" appears |

### The +1 second pop

When a player earns the increment, it should look like a score popping up in a basketball broadcast.

1. A green "+1" appears just above that player's clock.
2. It pops in slightly oversized, then settles with a spring.
3. It floats up about 24px and fades out over roughly 0.8 seconds.
4. At the same moment the clock digits roll up to the new value and the clock face flashes green once.
5. The ring bumps forward with a small spring to show the added time.

If a second pop arrives while one is still showing, the old one fades out quickly as the new one pops in.

### Motion safety

- With "reduce motion" on: no pulse, no shake and no floating "+1". Colors still change and the "+1" just fades in and out. Checked in code only, not on a device with the setting on.
- Sound has a mute toggle.

## Tech decisions

- **Next.js + TypeScript + Tailwind.**
- **Motion library** for springs, rolling digits and the "+1" pop.
- **Game rules in `lib/game.ts`** as plain functions, with tests for winner, draw and bot moves.
- **Match steps in `lib/match.ts`**: countdown, moves, win, draw and timeout, with tests.
- **Clock in `lib/clock.ts`.** It stores when the turn started and calculates time left from that. It does not count down with `setInterval`, which drifts and pauses in background tabs.
- **Online uses Supabase (stretch).** The server checks every move and its timestamps decide the clocks, so pausing a tab can't cheat.

## Build order

### 1. Core (this alone passes)
- [x] Next.js project set up
- [x] Board and local two-player turns
- [x] Win and draw detection, with tests
- [x] Clocks and timeout loss
- [x] New Game button
- [x] Scoreboard saved in the browser
- [x] Phone layout
- [x] Deployed to Vercel

### 2. Feel
- [x] Draining ring
- [x] Rolling digits
- [x] Tension stages
- [x] +1 second pop
- [x] 3‑2‑1‑GO countdown
- [x] Sounds and mute toggle
- [x] Reduce-motion handling

### 3. Bot
- [x] Easy, Medium and Hard, with tests
- [x] Bot thinking time

### 4. Online (stretch)
- [ ] Guest nickname
- [ ] Matchmaking queue with bot fallback
- [ ] Live moves with server-checked clocks
- [ ] Elo rating and leaderboard

### 5. Submit
- [ ] Test on a real phone
- [ ] Keyboard check
- [x] Add the live link to the README
- [ ] Submit at the application form

## Open questions

- Does the demo video in the test instructions show a required layout? Watch it before starting step 1.
- Is online play in the first submission, or added after steps 1–3 are live? The plan assumes after.
