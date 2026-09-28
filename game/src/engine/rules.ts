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
 * Does the player have a rung above them to climb?
 *
 * This is the gate on every recovery, and it is derived from the title rather than stored.
 * The run used to carry a `demoted` boolean set alongside the title, and it drifted: a
 * recovery climbed Acting to Deputy and set the flag false anyway, so the catch-all went
 * dead on the only path a deep run has left. Strikes cannot stand in for this either — a
 * recovery does not clear strikes, so a player promoted back to Regional Manager still has
 * strikes = 1 with no rung above them. See DESIGN.md 7.3.
 */
export function hasRungToClimb(state: RunState): boolean {
  return state.title === "REGIONAL_MANAGER_DEPUTY" || state.title === "REGIONAL_MANAGER_ACTING";
}

/**
 * Take a demotion strike if patience has bottomed out.
 *
 * PATIENCE is the strike trigger, not career. This is the fix for a real bug the
 * end-to-end test caught: correct filings were *raising* career every week, so career
 * never hit 0, the strike never fired, and the whole promotion arc was unreachable.
 *
 * The deeper reason patience is the right trigger: the game's thesis is that doing the
 * job right does not help. The Dark Lord never asked for the pit trap to work. So a
 * correct filing must not restore his patience — see the deltas in src/content/*.ts.
 * Career is a measure of how well you are doing; it gates promotions, it does not
 * demote you. He decides that.
 *
 * Third strike is terminal. The Mines have no exit — that is the design, not a missing
 * feature. See DESIGN.md 7.5.
 */
export function resolveStrikes(state: RunState, day = 0): RunState {
  if (state.meters.patience > 0 || state.strikes >= 3) return state;
  // One strike per day. A big hit can floor patience across two scenes; without this the
  // player took two demotions for one memo and the run ended by week 3.
  if (state.lastStrikeDay === day) return state;

  const nextStrikes = (state.strikes + 1) as Strikes;
  const title = STRIKE_TITLES[nextStrikes as Exclude<Strikes, 0>];

  return {
    ...state,
    strikes: nextStrikes,
    title,
    lastStrikeDay: day,
    // Both meters reset on a demotion. Career to 4 because a demotion is a rung down,
    // not a run over. Patience to 4 because he moves on — without this, patience sits at
    // 0 and takes a second strike every single day, which ends the run by week 3.
    meters: { ...state.meters, career: 4, patience: 4 },
  };
}

/**
 * Conditions for the catch-all misfiling promotion (DESIGN.md 7.3).
 *
 * The rung requirement is load-bearing. At full title there is no rung to climb, so the
 * misfiling would "promote" you to the title you already hold — which is a bug we hit
 * while building BRANCHING.md. It also means a brand-new player has no reason to try the
 * catch-all, which is correct: it does nothing for them yet.
 */
export function canMisfile(state: RunState): boolean {
  return (
    hasRungToClimb(state) &&
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
    meters: { ...state.meters, career: 5, morale },
    probation: 3,
    recoveryGate: 2,
  };
}

/**
 * Called once per day before scenes resolve.
 *
 * Patience drains by 1 every other day. Nobody sends that. It is simply what a fortress
 * with an unresolved pit trap does to a manager, and it is why the run ends even when
 * every filing is correct.
 *
 * The drain is deliberately gentle: the run is six weeks and there is a memo in week 2.
 * A harsher drain floors patience before the player has filed the catch-all even once,
 * and the promotion arc becomes unreachable. The memo, not the drain, is the big hit.
 */
export function tickDay(state: RunState): RunState {
  const next = { ...state };
  next.recoveryGate = Math.max(0, next.recoveryGate - 1);
  if (next.day % 2 === 0) {
    next.meters = {
      ...next.meters,
      patience: clamp(next.meters.patience - 1),
    };
  }
  if (next.probation > 0) {
    next.probation -= 1;
    next.meters = { ...next.meters, career: clamp(next.meters.career - 1) };
  }
  return resolveStrikes(next, next.day);
}

/** The letterhead. 15% on a correctly-filed unwinnable ticket. */
export function rollLetterhead(state: RunState, rng: Rng, eligible: boolean): boolean {
  return eligible && state.recoveryGate === 0 && rng.chance(0.15);
}

/** Goblin advocacy: high morale, a day with nothing on it, and a rung to climb. */
export function advocacyEligible(state: RunState, quietDay: boolean): boolean {
  // Same rung gate as the catch-all. Advocacy costs no morale, so without this a player
  // at full title banks a "promotion" that goes nowhere — and still eats the probation
  // it triggers. See DESIGN.md 7.4.
  return quietDay && state.meters.morale >= 9 && state.recoveryGate === 0 && hasRungToClimb(state);
}

/**
 * Did the run just end?
 *
 * The Mines are terminal and end the run the moment the third strike lands.
 *
 * Hero-defeated only fires at the *end* of the run, not mid-arc. A player who files the
 * Chosen One correctly three weeks running used to end the game in week 3 and never see
 * the strike, the catch-all, or the promotion — the good-player path truncated the whole
 * six-week arc. Now they play to the end, and the hero ending is the last thing that can
 * happen to them. See BRANCHING.md "The two wins are mutually exclusive."
 */
export function isRunOver(state: RunState, atEndOfRun = false): "MINES" | "HERO_DEFEATED" | null {
  if (state.strikes >= 3) return "MINES";
  if (atEndOfRun && state.heroStreak >= 3) return "HERO_DEFEATED";
  return null;
}
