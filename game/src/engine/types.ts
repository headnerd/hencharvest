/**
 * Hencharvest — core types.
 *
 * The shape of the world. Everything in src/content is checked against this file, so a
 * typo like `moral` or `verdict: "REJECT"` is a compile error rather than a mystery in
 * week five.
 *
 * Design reference: ../DESIGN.md and ../BRANCHING.md
 */

/** The three numbers the player actually sees. Everything else is hidden by design. */
export interface Meters {
  /** Dark Lord's Patience, 0-10 */
  patience: number;
  /** Your Career Position, 0-10. Hits 0 => a demotion strike. */
  career: number;
  /** Goblin Morale, 0-10. Intel AND the currency you spend to misfile. */
  morale: number;
}

/** The player's title. Lost on a strike, regained by promotion. The wording is cosmetic. */
export type Title = "REGIONAL_MANAGER" | "REGIONAL_MANAGER_DEPUTY" | "REGIONAL_MANAGER_ACTING" | "MINES";

/** Demotion strikes. Third is terminal — the Mines, and no climbing out. */
export type Strikes = 0 | 1 | 2 | 3;

/** Run state. Persisted to localStorage; never sent anywhere. */
export interface RunState {
  /** Seed for the deterministic RNG. Every run replays identically from its seed. */
  seed: number;
  /** Which week of the run we are in, 1-indexed. */
  week: number;
  /** Day counter within the run. Advances once per day and is the strike-guard key. */
  day: number;
  /** Index into the week's scene list. */
  sceneIndex: number;
  meters: Meters;
  title: Title;
  strikes: Strikes;
  /** Remaining days of the -1/day probation drain after a recovery. */
  probation: number;
  /** Days until another recovery is permitted. See DESIGN.md 7.5. */
  recoveryGate: number;
  /** Consecutive correct Chosen One filings, for the hero-defeated ending. */
  heroStreak: number;
  /** Whether an unwinnable ticket appeared in the previous scene. Pacing guard, 6.2. */
  unwinnableLastScene: boolean;
  /**
   * The day index on which the most recent strike was taken. Guards against taking
   * several strikes on the same day while patience sits at 0 — without this, a single
   * -4 memo took two demotions at once and ended the run by week 3.
   */
  lastStrikeDay: number;
  /** All text shown so far, so a run can be exported as a log. */
  transcript: TranscriptEntry[];
}

export interface TranscriptEntry {
  day: number;
  kind: "scene" | "narration" | "verdict" | "memo" | "standup" | "system";
  text: string;
}

/** A filing category. Other/Uncategorized is the misfiling — see DESIGN.md 7.3. */
export type FilingCategory =
  | "SCHEDULING_CONFLICT"
  | "SAFETY_COMPLIANCE"
  | "BUDGET_OVERRUN"
  | "DEPRECATION_NOTICE"
  | "OTHER_UNCATEGORIZED";

/** The three verdicts. "Insufficient" is a loss the player incurs by being right. */
export type Verdict = "ACCEPTED" | "REJECTED" | "INSUFFICIENT";

/** A choice the player can make. Never more than four per scene. */
export interface Choice {
  id: string;
  /** The bolded option label. */
  label: string;
  /** The italic annotation under it. Optional. */
  note?: string;
  /** Narration shown after choosing. */
  resolution: string[];
  /** The verdict. Absent for scenes that are not filings (the dragon's review). */
  verdict?: Verdict;
  /** Meter deltas applied on resolution. */
  deltas?: Partial<Meters>;
  /** Whether this resolution triggers a recovery. Only the catch-all does. */
  recovery?: RecoveryKind;
  /**
   * Marks the choice as the correct filing for a solvable ticket. Used only by the test
   * suite and by the "do you know the rules yet" teaching gate. NEVER rendered.
   */
  correct?: boolean;
}

export type RecoveryKind = "MISFILE" | "LETTERHEAD" | "ADVOCACY";

/** A beat of play. Narration, then 2-4 choices. */
export interface Scene {
  id: string;
  /** e.g. "16:40, THE PIT TRAP" */
  title: string;
  /** Shown as a blockquote. These are the world's lines, not the narrator's. */
  body: string[];
  /** Set true for a scene with no filing verdict (the dragon's review). */
  noVerdict?: boolean;
  choices: Choice[];
  /** A ticket flagged unwinnable. Filed correctly and still not enough. */
  unwinnable?: boolean;
  /** Present on the Chosen One's arrival. Hero-defeated tracking only. */
  isChosenOne?: boolean;
}

/** A day. Scenes run in order, then the day ends. */
export interface Day {
  id: string;
  /** "TUESDAY, 8:40" */
  heading: string;
  scenes: Scene[];
  /** Closing standup, if any. */
  standup?: string[];
  /**
   * A day with nothing scheduled on it. Declared, not inferred: the memo days have no
   * Chosen One either, and a day on which the Dark Lord takes four patience off you is
   * not a quiet one. Only a day the author marked earns goblin advocacy. See DESIGN.md 7.4.
   */
  quiet?: boolean;
}

export interface Week {
  week: number;
  days: Day[];
}
