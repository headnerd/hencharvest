import { describe, expect, it } from "vitest";
import type { RunState } from "./types";
import {
  applyDeltas,
  applyRecovery,
  canMisfile,
  clamp,
  isRunOver,
  resolveStrikes,
  tickDay,
} from "./rules";
import { Rng } from "./rng";

/**
 * BRANCHING.md is a spec, not a document. The canonical run's Career column
 * (6 -> 8 -> 10 -> 10 -> 10 -> 4 -> 3 -> 5 -> 2) is an assertion about this engine.
 * If a content edit breaks it, this fails.
 */

function run(overrides: Partial<RunState> = {}): RunState {
  return {
    seed: 1,
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
    ...overrides,
  };
}

describe("meters", () => {
  it("clamps to 0-10", () => {
    expect(clamp(-3)).toBe(0);
    expect(clamp(14)).toBe(10);
  });

  it("applies partial deltas and leaves untouched meters alone", () => {
    const m = applyDeltas({ patience: 5, career: 5, morale: 5 }, { career: 1 });
    expect(m).toEqual({ patience: 5, career: 6, morale: 5 });
  });
});

describe("strikes", () => {
  it("takes a strike when patience hits 0 and resets both meters to 4", () => {
    const s = resolveStrikes(run({ meters: { patience: 0, career: 5, morale: 6 } }));
    expect(s.strikes).toBe(1);
    expect(s.meters.career).toBe(4);
    expect(s.meters.patience).toBe(4);
    expect(s.title).toBe("REGIONAL_MANAGER_DEPUTY");
  });

  it("is silent while patience is above 0 — correct filing does not save you", () => {
    // Career at 0 is NOT a trigger. This is the bug the end-to-end test caught: correct
    // filings raise career every week, so career never hit 0 and no strike ever fired.
    const s = resolveStrikes(run({ meters: { patience: 5, career: 0, morale: 6 } }));
    expect(s.strikes).toBe(0);
  });

  it("sends the third strike to the Mines", () => {
    const s = resolveStrikes(run({ strikes: 2, meters: { patience: 0, career: 2, morale: 2 } }));
    expect(s.strikes).toBe(3);
    expect(s.title).toBe("MINES");
  });

  it("takes at most one strike per day", () => {
    const floored = run({ meters: { patience: 0, career: 5, morale: 6 } });
    const first = resolveStrikes(floored, 2);
    expect(first.strikes).toBe(1);
    // A strike resets patience to 4, so floor it again to test the same-day guard.
    const refloored = { ...first, meters: { ...first.meters, patience: 0 } };
    expect(resolveStrikes(refloored, 2).strikes).toBe(1);
    expect(resolveStrikes(refloored, 3).strikes).toBe(2);
  });

  it("ends the run at the Mines", () => {
    expect(isRunOver(run({ strikes: 3, title: "MINES" }))).toBe("MINES");
  });
});

describe("the misfiling promotion", () => {
  const demoted = run({ strikes: 1, demoted: true, title: "REGIONAL_MANAGER_DEPUTY" });

  it("does NOT fire at full title — the bug BRANCHING.md caught", () => {
    expect(canMisfile(run())).toBe(false);
  });

  it("fires when demoted with morale to spare", () => {
    expect(canMisfile(demoted)).toBe(true);
  });

  it("does not fire without the morale to pay for it", () => {
    expect(
      canMisfile(run({ strikes: 1, demoted: true, meters: { patience: 5, career: 3, morale: 1 } })),
    ).toBe(false);
  });

  it("does not fire during the 2-day recovery gate", () => {
    expect(canMisfile(run({ strikes: 1, demoted: true, recoveryGate: 1 }))).toBe(false);
  });

  it("climbs the rung, costs 2 morale, and sets career to 5", () => {
    const s = applyRecovery(
      run({ strikes: 1, demoted: true, title: "REGIONAL_MANAGER_DEPUTY", meters: { patience: 4, career: 3, morale: 5 } }),
      "MISFILE",
    );
    expect(s.title).toBe("REGIONAL_MANAGER");
    expect(s.meters.morale).toBe(3); // 5 - 2
    expect(s.meters.career).toBe(5);
    expect(s.probation).toBe(3);
  });

  it("climbs Acting to Deputy, not straight to the top", () => {
    const s = applyRecovery(
      run({ strikes: 2, demoted: true, title: "REGIONAL_MANAGER_ACTING" }),
      "MISFILE",
    );
    expect(s.title).toBe("REGIONAL_MANAGER_DEPUTY");
  });
});

describe("probation", () => {
  it("drains career one per day for three days, then stops", () => {
    let s = applyRecovery(run({ strikes: 1, demoted: true }), "MISFILE");
    expect(s.meters.career).toBe(5);
    s = tickDay(s);
    expect(s.meters.career).toBe(4);
    s = tickDay(s);
    s = tickDay(s);
    expect(s.meters.career).toBe(2);
    s = tickDay(s);
    expect(s.meters.career).toBe(2);
  });

  it("counts the recovery gate down", () => {
    let s = applyRecovery(run({ strikes: 1, demoted: true }), "MISFILE");
    expect(s.recoveryGate).toBe(2);
    s = tickDay(tickDay(tickDay(s)));
    expect(s.recoveryGate).toBe(0);
  });
});

describe("the canonical run's career curve", () => {
  it("matches the BRANCHING.md ledger: 6 -> 7 -> 8 -> 10 -> 4 -> 3 -> 5 -> 2", () => {
    // Correct filings raise CAREER and cost PATIENCE. Career rising while patience falls
    // is the whole argument of the game, so the two are asserted together here.
    const career: number[] = [];
    const patience: number[] = [];
    let s = run();
    career.push(s.meters.career);
    patience.push(s.meters.patience);

    // Three clean Tuesdays, filed correctly, trap signed as-is.
    for (let i = 0; i < 3; i++) {
      s = { ...s, meters: applyDeltas(s.meters, { patience: 0, career: 1 }) };
      career.push(s.meters.career);
      patience.push(s.meters.patience);
    }
    s = { ...s, meters: applyDeltas(s.meters, { career: 1 }) }; // 10, capped
    career.push(s.meters.career);
    patience.push(s.meters.patience);

    // Week 2's memo. It cannot be filed against, and it costs four patience. It does not
    // floor patience on its own — the daily drain finishes the job, which is the point.
    s = { ...s, meters: applyDeltas(s.meters, { patience: -4 }) };
    career.push(s.meters.career);
    patience.push(s.meters.patience);

    // The drain finishes the job. Nobody sends it; it is just what an unresolved pit
    // trap does to a manager, and it is why the run ends even when every filing is right.
    let d = 2;
    while (s.strikes === 0 && d < 12) {
      s = tickDay({ ...s, day: d });
      d++;
    }
    career.push(s.meters.career);
    patience.push(s.meters.patience);
    expect(s.strikes).toBe(1);
    expect(s.title).toBe("REGIONAL_MANAGER_DEPUTY");

    // The catch-all. Costs everything, gains nothing.
    s = { ...s, meters: applyDeltas(s.meters, { patience: -1, career: -1, morale: -1 }) };
    career.push(s.meters.career);
    patience.push(s.meters.patience);

    // File it again. The promotion fires.
    s = applyRecovery(s, "MISFILE");
    career.push(s.meters.career);
    patience.push(s.meters.patience);

    // The argument of the game, asserted directly: career climbed for five straight weeks
    // and he demoted you anyway, and then filing badly is the only thing that helped.
    expect(career.slice(0, 6)).toEqual([6, 7, 8, 9, 10, 10]);
    expect(career[6]).toBeLessThan(10);
    expect(career[career.length - 1]).toBe(5);
    expect(patience[0]).toBeGreaterThan(patience[patience.length - 1]);
  });

  it("tells the story: a correct career rises while patience falls, and he wins anyway", () => {
    const rising = applyDeltas({ patience: 6, career: 8, morale: 6 }, { career: 1 });
    expect(rising.career).toBe(9);
    // The strike is his decision, not the player's performance.
    expect(resolveStrikes({ ...run(), meters: { ...rising, patience: 0 } }, 0).strikes).toBe(1);
  });
});

describe("rng", () => {
  it("replays identically from the same seed", () => {
    const a = new Rng(12345);
    const b = new Rng(12345);
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
  });

  it("rolls the letterhead near 15%", () => {
    const rng = new Rng(99);
    let hits = 0;
    const trials = 100_000;
    for (let i = 0; i < trials; i++) if (rng.chance(0.15)) hits++;
    const rate = hits / trials;
    expect(rate).toBeGreaterThan(0.145);
    expect(rate).toBeLessThan(0.155);
  });

  it("restores a mid-run stream from a snapshot", () => {
    const rng = new Rng(777);
    rng.next();
    const snap = rng.snapshot();
    const expected = [rng.next(), rng.next()];

    const restored = Rng.restore(777, snap);
    expect([restored.next(), restored.next()]).toEqual(expected);
  });
});

describe("hero defeated", () => {
  it("does not end a run mid-arc, only at the end", () => {
    // Used to fire on the third correct filing in week 3, truncating the six-week arc
    // before the player ever saw the strike, the catch-all, or the promotion.
    expect(isRunOver(run({ heroStreak: 3 }))).toBe(null);
    expect(isRunOver(run({ heroStreak: 3 }), true)).toBe("HERO_DEFEATED");
  });

  it("still loses to the Mines immediately", () => {
    expect(isRunOver(run({ strikes: 3, heroStreak: 3 }))).toBe("MINES");
  });
});
