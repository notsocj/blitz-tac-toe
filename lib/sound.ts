// Small synthesized sounds, so the game ships no audio files.
let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
}

/** Call from a click handler. Browsers only allow sound after the user interacts. */
export function unlockAudio() {
  if (typeof AudioContext === "undefined") return;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
}

type Tone = { type?: OscillatorType; gain?: number; delay?: number };

function tone(freq: number, ms: number, { type = "sine", gain = 0.07, delay = 0 }: Tone = {}) {
  if (muted || !ctx) return;
  const start = ctx.currentTime + delay;
  const end = start + ms / 1000;
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  vol.gain.setValueAtTime(gain, start);
  vol.gain.exponentialRampToValueAtTime(0.0001, end);
  osc.connect(vol).connect(ctx.destination);
  osc.start(start);
  osc.stop(end);
}

export const sfx = {
  place: () => tone(520, 70, { type: "triangle" }),
  count: () => tone(392, 140),
  go: () => tone(784, 320),
  tick: () => tone(880, 45, { type: "square", gain: 0.03 }),
  urgent: () => tone(1175, 55, { type: "square", gain: 0.045 }),
  win: () => [523, 659, 784].forEach((f, i) => tone(f, 170, { delay: i * 0.11 })),
  draw: () => tone(330, 260, { type: "triangle" }),
  timeout: () => tone(140, 480, { type: "sawtooth", gain: 0.06 }),
};
