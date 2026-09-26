import type { Meters, RecoveryKind, RunState, Title, Strikes } from "./types";
import { Rng } from "./rng";

/** Meter floor and ceiling. Career hitting 0 is the only meter with a consequence. */
export const METER_MIN = 0;
export const METER_MAX = 10;

export function clamp(value: number): number {
  return Math.max(METER_MIN, Math.min(METER_MAX, value));
}

export function applyDeltas(meters: Meters, deltas: Partial<Meters>): Meters {
  return {
    patience: clamp(meters.patience + (deltas.patience ?? 0)),
    career: clamp(meters.career + (deltas.career ?? 0)),
    morale: clamp(meters.morale + (deltas.morale ?? 0)),
  };
}

/** The title a strike drops you to. 1st => Deputy, 2nd => Acting, 3rd => the Mines. */
const STRIKE_TITLES: Record<Exclude<Strikes, 0>, Title> = {
  1: "REGIONAL_MANAGER_DEPUTY",
  2: "REGIONAL_MANAGER_ACTING",
  3: "MINES",
};

/**
 * Take a demotion strike if career has bottomed out.
 *
 * Third strike is terminal. The Mines have no exit — that is the design, not a missing
 * feature. See DESIGN.md 7.5.
 */
export function resolveStrikes(state: RunState): RunState {
  if (state.meters.career > 0 || state.strikes >= 3) return state;

  const nextStrikes = (state.strikes + 1) as Strikes;
  const title = STRIKE_TITLES[nextStrikes as Exclude<Strikes, 0>];

  return {
    ...state,
    strikes: nextStrikes,
    title,
    demoted: nextStrikes < 3,
    // Career resets to 4, not 0. A demotion is a rung down, not a run over.
    meters: { ...state.meters, career: 4 },
  };
}

/**
 * Conditions for the catch-all misfiling promotion (DESIGN.md 7.3).
 *
 * The demotion requirement is load-bearing. At full title there is no rung to climb, so
 * the misfiling would "promote" you to the title you already hold — which is a bug we hit
 * while building BRANCHING.md. It also means a brand-new player has no reason to try the
 * catch-all, which is correct: it does nothing for them yet.
 */
export function canMisfile(state: RunState): boolean {
  return (
    state.demoted &&
    state.strikes < 3 &&
    state.meters.morale >= 2 &&
    state.recoveryGate === 0
  );
}

/**
 * Apply a recovery: climb one rung, set career to 5 (not 10), and start probation.
 *
 * The guards (DESIGN.md 7.5):
 *   1. career => 5, then -1/day for three days
 *   2. no two recoveries within 2 days
 *   3. the Mines are terminal
 */
export function applyRecovery(state: RunState, kind: RecoveryKind): RunState {
  const climbed: Title =
    state.title === "REGIONAL_MANAGER_DEPUTY"
      ? "REGIONAL_MANAGER"
      : state.title === "REGIONAL_MANAGER_ACTING"
        ? "REGIONAL_MANAGER_DEPUTY"
        : state.title;

  // The misfiling is the only recovery that costs Morale, and it is the only one that
  // spends the player's intel to do it. That arithmetic is what forces them to keep the
  // goblins happy. Do not make Morale cheap. See DESIGN.md 7.6.
  const morale = kind === "MISFILE" ? clamp(state.meters.morale - 2) : state.meters.morale;

  return {
    ...state,
    title: climbed,
    demoted: false,
    meters: { ...state.meters, career: 5, morale },
    probation: 3,
    recoveryGate: 2,
  };
}

/** Called once per day before scenes resolve. */
export function tickDay(state: RunState): RunState {
  const next = { ...state };
  next.recoveryGate = Math.max(0, next.recoveryGate - 1);
  if (next.probation > 0) {
    next.probation -= 1;
    next.meters = { ...next.meters, career: clamp(next.meters.career - 1) };
  }
  return resolveStrikes(next);
}

/** The letterhead. 15% on a correctly-filed unwinnable ticket. */
export function rollLetterhead(state: RunState, rng: Rng, eligible: boolean): boolean {
  return eligible && state.recoveryGate === 0 && rng.chance(0.15);
}

/** Goblin advocacy: high morale AND a day with nothing on it. */
export function advocacyEligible(state: RunState, quietDay: boolean): boolean {
  return quietDay && state.meters.morale >= 9 && state.recoveryGate === 0 && state.demoted;
}

/** Did the run just end? The Mines, or the hero actually stopped coming. */
export function isRunOver(state: RunState): "MINES" | "HERO_DEFEATED" | null {
  if (state.strikes >= 3) return "MINES";
  if (state.heroStreak >= 3) return "HERO_DEFEATED";
  return null;
}
