import { describe, expect, it } from "vitest";
import { BEATS } from "../content";
import { newRun } from "./persist";
import { Rng } from "./rng";
import {
  advocacyEligible,
  applyDeltas,
  applyRecovery,
  canMisfile,
  isRunOver,
  resolveStrikes,
  rollLetterhead,
  tickDay,
} from "./rules";
import type { Choice, RunState } from "./types";

/**
 * The canonical run, played through the real content and the real engine.
 *
 * This is the test that matters most. It walks the actual beat list making the choices
 * BRANCHING.md specifies, and asserts the meters land where the ledger says. If a content
 * edit changes a delta, this breaks — and it should.
 *
 * It replays App.tsx's loop beat for beat, including all four recoveries. If this harness
 * and the component ever disagree, this file is the one lying.
 */

/** Must match decisionRng in App.tsx. */
function decisionRng(state: RunState): Rng {
  return new Rng((state.seed + state.day * 1000 + state.sceneIndex) >>> 0);
}

function playThrough(pick: (week: number, choices: Choice[]) => Choice, seed = 1234): RunState {
  let state = newRun(seed);
  const events: string[] = [];
  for (let i = 0; i < BEATS.length; i++) {
    const beat = BEATS[i];
    const atEnd = i === BEATS.length - 1;

    // The transition into this beat: App.advance() ticks the day and pays advocacy.
    if (i > 0) {
      const from = BEATS[i - 1];
      if (beat.isDayStart) {
        const before = state.strikes;
        state = resolveStrikes(tickDay({ ...state, day: state.day + 1, sceneIndex: i }), state.day + 1);
        if (state.strikes > before) events.push(`STRIKE${state.strikes}:week${from.week.week}`);
      }
      if (from.quietDay && from.day.id !== beat.day.id) {
        if (advocacyEligible(state, true)) {
          state = applyRecovery(state, "ADVOCACY");
          events.push(`ADVOCACY:day${state.day}`);
        } else {
          events.push(`NO_ADVOCACY:day${state.day}:morale${state.meters.morale}`);
        }
      }
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
    const unwinnable = beat.scene.unwinnable === true;
    next = { ...next, unwinnableLastScene: unwinnable };
    if (unwinnable && choice.correct) {
      events.push(`GRIEVANCE:day${state.day}`);
      if (rollLetterhead(next, decisionRng(next), !state.unwinnableLastScene)) {
        next = applyRecovery(next, "LETTERHEAD");
        events.push("LETTERHEAD");
      }
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
  it("a perfect player is demoted twice anyway, and is promoted by the goblins, not by filing badly", () => {
    const s = playThrough(perfect) as SimRun;
    // Filed correctly for six weeks. Still took two strikes on the way.
    expect(s.events).toContain("STRIKE1:week2");
    expect(s.events).toContain("STRIKE2:week5");
    expect(s.events).toContain("OVER:HERO_DEFEATED");
    // The good-player path: the quiet day, high morale, and still demoted. Never the catch-all.
    expect(s.events.some((e) => e.startsWith("ADVOCACY"))).toBe(true);
    expect(s.events.some((e) => e.startsWith("PROMOTION"))).toBe(false);
  });

  it("the misfiler is promoted by the catch-all and never by advocacy", () => {
    const s = playThrough(lateMisfiler) as SimRun;
    expect(s.events.some((e) => e.startsWith("PROMOTION"))).toBe(true);
    expect(s.strikes).toBeGreaterThan(0);
    // Spending morale on the catch-all is what closes the advocacy door. By arithmetic.
    expect(s.events.some((e) => e.startsWith("ADVOCACY"))).toBe(false);
  });

  it("the letterhead pays about 15% of the time, and only to a demoted manager", () => {
    // A manager who files correctly for weeks 1-4 takes their strikes, files one safety
    // complaint in week 5 (morale down, so no advocacy and no catch-all promotion), then
    // files the unwinnable grievance correctly in week 6. That is the only window the
    // letterhead has, and it has to be a real one.
    const path = (w: number, choices: Choice[]) =>
      w === 5
        ? (choices.find((c) => c.id.endsWith("safety")) ?? choices.find((c) => c.correct) ?? choices[0]!)
        : (choices.find((c) => c.correct) ?? choices[0]!);

    let fired = 0;
    for (let seed = 1; seed <= 120; seed++) {
      const events = (playThrough(path, seed) as SimRun).events;
      // Every one of these runs is demoted by week 6, so the ticket is genuinely eligible.
      expect(events.some((e) => e.startsWith("GRIEVANCE"))).toBe(true);
      if (events.includes("LETTERHEAD")) fired++;
    }
    // 120 runs at 15% should land near 18. Wide enough not to flake, tight enough that a
    // broken roll — always or never — fails.
    expect(fired).toBeGreaterThan(8);
    expect(fired).toBeLessThan(28);
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
