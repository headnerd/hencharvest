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

const KEY = "hencharvest.run.v2";

/**
 * A save is only usable if every field the engine reads is present and sane.
 *
 * This matters more than it looks. Run state gained `day` and `lastStrikeDay` during the
 * build, and a week-one save from before that loads with `day: undefined` — which makes
 * `day % 2 === 0` never true, so the patience drain silently stops and the player can
 * never be demoted. A silent softlock is much worse than losing a save, so we validate
 * rather than migrate. The runs are short and cheap to replay.
 */
function isUsable(parsed: unknown): parsed is RunState {
  if (!parsed || typeof parsed !== "object") return false;
  const s = parsed as Partial<RunState>;
  return (
    typeof s.seed === "number" &&
    typeof s.day === "number" &&
    typeof s.sceneIndex === "number" &&
    typeof s.strikes === "number" &&
    typeof s.lastStrikeDay === "number" &&
    typeof s.probation === "number" &&
    typeof s.recoveryGate === "number" &&
    typeof s.heroStreak === "number" &&
    typeof s.title === "string" &&
    typeof s.meters === "object" &&
    s.meters !== null &&
    typeof s.meters.patience === "number" &&
    typeof s.meters.career === "number" &&
    typeof s.meters.morale === "number"
  );
}

export function newRun(seed = makeSeed()): RunState {
  return {
    seed,
    week: 1,
    day: 0,
    sceneIndex: 0,
    meters: { patience: 7, career: 6, morale: 6 },
    title: "REGIONAL_MANAGER",
    strikes: 0,
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
    const parsed: unknown = JSON.parse(raw);
    return isUsable(parsed) ? parsed : null;
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
