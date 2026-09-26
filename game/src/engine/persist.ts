import type { RunState } from "./types";
import { makeSeed } from "./rng";

/**
 * Run persistence.
 *
 * localStorage only — no server, no account, nothing leaves the browser. This is a
 * single-player game about a filing system, not a product with users. Runs are per-browser
 * and are lost if site data is cleared, which is an acceptable trade for a six-week run
 * that is cheap to replay.
 */

const KEY = "hencharvest.run.v1";

export function newRun(seed = makeSeed()): RunState {
  return {
    seed,
    week: 1,
    day: 0,
    sceneIndex: 0,
    meters: { patience: 7, career: 6, morale: 6 },
    title: "REGIONAL_MANAGER",
    strikes: 0,
    demoted: false,
    probation: 0,
    recoveryGate: 0,
    heroStreak: 0,
    unwinnableLastScene: false,
    lastStrikeDay: -1,
    transcript: [],
  };
}

export function saveRun(state: RunState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // A full or disabled localStorage should not take the game down with it.
  }
}

export function loadRun(): RunState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RunState;
    if (typeof parsed?.seed !== "number" || !parsed.meters) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearRun(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/** Share a run as text. No backend — the seed plus the log is the whole run. */
export function exportRun(state: RunState): string {
  const log = state.transcript.map((e) => `[d${e.day}] ${e.kind.toUpperCase()}: ${e.text}`).join("\n");
  return `HENC HARVEST — run ${state.seed}\n${log}`;
}
