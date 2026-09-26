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
    sceneIndex: 0,
    meters: { patience: 7, career: 6, morale: 6 },
    title: "REGIONAL_MANAGER",
    strikes: 0,
    demoted: false,
    probation: 0,
    recoveryGate: 0,
    heroStreak: 0,
    unwinnableLastScene: false,
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
  it("takes a strike when career hits 0 and resets career to 4", () => {
    const s = resolveStrikes(run({ meters: { patience: 5, career: 0, morale: 6 } }));
    expect(s.strikes).toBe(1);
    expect(s.meters.career).toBe(4);
    expect(s.title).toBe("REGIONAL_MANAGER_DEPUTY");
  });

  it("is silent while career is above 0", () => {
    const s = resolveStrikes(run({ meters: { patience: 5, career: 1, morale: 6 } }));
    expect(s.strikes).toBe(0);
  });

  it("sends the third strike to the Mines", () => {
    const s = resolveStrikes(run({ strikes: 2, meters: { patience: 1, career: 0, morale: 2 } }));
    expect(s.strikes).toBe(3);
    expect(s.title).toBe("MINES");
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
  it("matches the BRANCHING.md ledger: 6 -> 8 -> 10 -> 10 -> 10 -> 4 -> 3 -> 5 -> 2", () => {
    const curve: number[] = [];
    let s = run();
    curve.push(s.meters.career); // 6

    // Weeks 1-3: three clean Tuesdays, filed correctly, trap signed as-is.
    s = { ...s, meters: applyDeltas(s.meters, { patience: 1, career: 1 }) };
    curve.push(s.meters.career);
    s = { ...s, meters: applyDeltas(s.meters, { patience: 1, career: 1 }) };
    curve.push(s.meters.career);
    s = { ...s, meters: applyDeltas(s.meters, { patience: 1, career: 1 }) };
    curve.push(s.meters.career);
    s = { ...s, meters: applyDeltas(s.meters, { patience: 1, career: 1 }) }; // 10, capped
    curve.push(s.meters.career);
    s = { ...s, meters: applyDeltas(s.meters, { career: 1 }) }; // still 10
    curve.push(s.meters.career);

    // Week 4: strike, despite doing nothing wrong.
    s = resolveStrikes({ ...s, meters: { ...s.meters, career: 0 } });
    curve.push(s.meters.career); // 4

    // Week 5: catch-all. Costs everything, gains nothing.
    s = { ...s, meters: applyDeltas(s.meters, { patience: -1, career: -1, morale: -1 }) };
    curve.push(s.meters.career); // 3

    // Week 6: catch-all again. Promotion fires.
    s = applyRecovery(s, "MISFILE");
    curve.push(s.meters.career); // 5

    // Probation.
    s = tickDay(tickDay(tickDay(s)));
    curve.push(s.meters.career); // 2

    expect(curve).toEqual([6, 7, 8, 9, 10, 10, 4, 3, 5, 2]);
  });

  it("tells the story: three perfect weeks, then demoted, then promoted for filing badly", () => {
    // If this stops being true the design has stopped working. See BRANCHING.md.
    const perfect = applyDeltas({ patience: 5, career: 8, morale: 6 }, { career: 1 });
    expect(perfect.career).toBe(9);
    expect(resolveStrikes({ ...run(), meters: { ...perfect, career: 0 } }).strikes).toBe(1);
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
  it("ends the run on three consecutive correct filings", () => {
    expect(isRunOver(run({ heroStreak: 2 }))).toBe(null);
    expect(isRunOver(run({ heroStreak: 3 }))).toBe("HERO_DEFEATED");
  });
});
