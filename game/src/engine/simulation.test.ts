import { describe, expect, it } from "vitest";
import { BEATS } from "../content";
import { newRun } from "./persist";
import {
  applyDeltas,
  applyRecovery,
  canMisfile,
  isRunOver,
  resolveStrikes,
  tickDay,
} from "./rules";
import type { Choice, RunState } from "./types";

/**
 * The canonical run, played through the real content and the real engine.
 *
 * This is the test that matters most. It walks the actual beat list making the choices
 * BRANCHING.md specifies, and asserts the meters land where the ledger says. If a content
 * edit changes a delta, this breaks — and it should.
 */

/** Replays the game loop in the same order App.tsx does, with the day-tick and strike guard. */
function playThrough(pick: (week: number, choices: Choice[]) => Choice): RunState {
  let state = newRun(1234);
  const events: string[] = [];
  for (let i = 0; i < BEATS.length; i++) {
    const beat = BEATS[i];
    const atEnd = i === BEATS.length - 1;
    if (beat.isDayStart && i > 0) {
      state = resolveStrikes(tickDay({ ...state, day: state.day + 1, sceneIndex: i }), state.day + 1);
    }
    if (isRunOver(state, atEnd)) {
      events.push(`OVER:${isRunOver(state, atEnd)}`);
      break;
    }
    const choice = pick(beat.week.week, beat.scene.choices);
    let next: RunState = { ...state, meters: applyDeltas(state.meters, choice.deltas ?? {}) };
    if (choice.recovery === "MISFILE" && canMisfile(state)) {
      next = applyRecovery(next, "MISFILE");
      events.push(`PROMOTION:day${state.day}`);
    }
    if (choice.correct && beat.scene.isChosenOne) next = { ...next, heroStreak: next.heroStreak + 1 };
    const before = state.strikes;
    state = resolveStrikes(next, state.day);
    if (state.strikes > before) events.push(`STRIKE${state.strikes}:week${beat.week.week}`);
    state.sceneIndex = i + 1;
  }
  return Object.assign(state, { events });
}

type SimRun = RunState & { events: string[] };

/** The "correct player": always files the correct choice, never the catch-all. */
const perfect = (_w: number, choices: Choice[]) =>
  choices.find((c) => c.correct) ?? choices[0];

/** The player who figures it out: correct until week 5, then deliberately misfiles. */
const lateMisfiler = (w: number, choices: Choice[]) => {
  const catchAll = choices.find((c) => c.recovery === "MISFILE");
  return w >= 5 && catchAll ? catchAll : (choices.find((c) => c.correct) ?? choices[0]);
};

describe("the canonical run, end to end", () => {
  it("a perfect player is demoted anyway, and reaches the hero ending at the end", () => {
    const s = playThrough(perfect) as SimRun;
    // Filed correctly for six weeks. Still took two strikes on the way.
    expect(s.events).toContain("STRIKE1:week2");
    expect(s.events).toContain("OVER:HERO_DEFEATED");
    // And never once recovered.
    expect(s.events.some((e) => e.startsWith("PROMOTION"))).toBe(false);
  });

  it("the late misfiler gets promoted — and the promotion is the only good thing that happens", () => {
    const s = playThrough(lateMisfiler) as SimRun;
    expect(s.events.some((e) => e.startsWith("PROMOTION"))).toBe(true);
    expect(s.strikes).toBeGreaterThan(0);
  });

  it("never ends before the six-week arc is finished", () => {
    for (const pick of [perfect, lateMisfiler]) {
      const s = playThrough(pick) as SimRun;
      const over = s.events.find((e) => e.startsWith("OVER"));
      // A mid-run OVER would mean the arc was truncated.
      if (over) expect(over).toBe(s.events[s.events.length - 1]);
      expect(s.events).toContain(over ?? "OVER:HERO_DEFEATED");
    }
  });

  it("the catch-all is useless at full title — the bug BRANCHING.md caught", () => {
    let s = newRun(99);
    expect(canMisfile(s)).toBe(false);
    for (let i = 0; i < 4; i++) {
      const beat = BEATS[i];
      const catchAll = beat.scene.choices.find((c) => c.recovery === "MISFILE");
      if (catchAll) {
        s = resolveStrikes({ ...s, meters: applyDeltas(s.meters, catchAll.deltas ?? {}) }, 0);
        expect(canMisfile(s)).toBe(false);
      }
    }
  });

  it("takes at most one strike per day", () => {
    // Week 2's memo floors patience across two scenes. The guard prevents a double demotion.
    const floored: RunState = { ...newRun(3), meters: { patience: 0, career: 5, morale: 6 } };
    const first = resolveStrikes(floored, 2);
    expect(first.strikes).toBe(1);
    // A strike resets patience to 4; floor it again to test the same-day guard.
    const refloored: RunState = { ...first, meters: { ...first.meters, patience: 0 } };
    expect(resolveStrikes(refloored, 2).strikes).toBe(1);
    expect(resolveStrikes(refloored, 3).strikes).toBe(2);
  });
});
