// Sound Effects using Web Audio API — no external files needed

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function isSoundEnabled(): boolean {
  try {
    return JSON.parse(localStorage.getItem("sound_enabled") ?? "true");
  } catch {
    return true;
  }
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  gainValue = 0.2,
  startDelay = 0,
): void {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);
  gain.gain.setValueAtTime(gainValue, ctx.currentTime + startDelay);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + startDelay + duration,
  );
  osc.start(ctx.currentTime + startDelay);
  osc.stop(ctx.currentTime + startDelay + duration);
}

export function playClick(): void {
  if (!isSoundEnabled()) return;
  playTone(800, 0.1, "square", 0.1);
}

export function playUnlock(): void {
  if (!isSoundEnabled()) return;
  playTone(440, 0.15, "sine", 0.2, 0);
  playTone(660, 0.15, "sine", 0.2, 0.15);
}

export function playLock(): void {
  if (!isSoundEnabled()) return;
  playTone(660, 0.15, "sine", 0.2, 0);
  playTone(440, 0.15, "sine", 0.2, 0.15);
}

export function playCreditReward(): void {
  if (!isSoundEnabled()) return;
  playTone(523, 0.1, "sine", 0.15, 0);
  playTone(659, 0.1, "sine", 0.15, 0.1);
  playTone(784, 0.2, "sine", 0.15, 0.2);
}

export function playCombo(): void {
  if (!isSoundEnabled()) return;
  playTone(400, 0.05, "sawtooth", 0.15, 0);
  playTone(600, 0.05, "sawtooth", 0.15, 0.05);
  playTone(800, 0.1, "sawtooth", 0.15, 0.1);
}
