import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import App from "./App";
import { BEATS, WEEKS } from "./content";
import { week1 } from "./content/week1";

/**
 * Smoke test: the game renders its opening screen and the content is shaped correctly.
 * No jsdom needed — a server render tells us whether the component tree is valid.
 */

describe("rendering", () => {
  it("renders without throwing", () => {
    expect(renderToStaticMarkup(createElement(App)).length).toBeGreaterThan(0);
  });

  it("names all three quantities, so a line of dialogue can refer to one", () => {
    // Playtest fix: "you're at four" was ambiguous because both patience and career were 4,
    // and the labels were bare words with no scale. The readout now names each quantity.
    const html = renderToStaticMarkup(createElement(App));
    expect(html).toContain("The Dark Lord&#x27;s Patience");
    expect(html).toContain("Your Position");
    expect(html).toContain("Goblin Morale");
  });

  it("shows a ten-cell scale and a demotion count", () => {
    const html = renderToStaticMarkup(createElement(App));
    expect(html.match(/meter-cell/g) ?? []).toHaveLength(30); // 3 meters x 10 cells
    expect(html).toContain("No demotions on record");
  });

  it("offers exactly four filing choices on the Chosen One scene", () => {
    const scene = week1.days[0]?.scenes.find((s) => s.isChosenOne);
    expect(scene?.choices.map((c) => c.id)).toEqual([
      "w1-file-scheduling",
      "w1-file-safety",
      "w1-file-deprecation",
      "w1-file-other",
    ]);
  });
});

/** Content invariants across all six weeks. These keep the design honest. */
describe("content invariants", () => {
  it("has six weeks in order", () => {
    expect(WEEKS.map((w) => w.week)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("never offers more than four choices, and never none", () => {
    for (const beat of BEATS) {
      expect(beat.scene.choices.length).toBeGreaterThan(0);
      expect(beat.scene.choices.length).toBeLessThanOrEqual(4);
    }
  });

  it("never marks more than one choice correct", () => {
    for (const beat of BEATS) {
      expect(beat.scene.choices.filter((c) => c.correct).length).toBeLessThanOrEqual(1);
    }
  });

  it("only ever marks MISFILE as a recovery, and never on a correct choice", () => {
    for (const beat of BEATS) {
      for (const c of beat.scene.choices) {
        if (c.recovery) expect(c.recovery).toBe("MISFILE");
        if (c.recovery) expect(c.correct).toBeFalsy();
      }
    }
  });

  it("always puts the catch-all last, so it is always the fourth option", () => {
    for (const beat of BEATS) {
      const catchAll = beat.scene.choices.find((c) => c.recovery === "MISFILE");
      if (catchAll) {
        expect(beat.scene.choices[beat.scene.choices.length - 1]).toBe(catchAll);
      }
    }
  });

  it("gives every choice a resolution", () => {
    for (const beat of BEATS) {
      for (const c of beat.scene.choices) {
        expect(c.resolution.length).toBeGreaterThan(0);
      }
    }
  });

  it("has exactly one unwinnable ticket, and filing it correctly is still not enough", () => {
    // DESIGN.md 6.2 / locked decision 4. Before the grievance scene existed, `unwinnable`
    // appeared in the types and nowhere in the content, so INSUFFICIENT was never rendered.
    const unwinnable = BEATS.filter((b) => b.scene.unwinnable);
    expect(unwinnable).toHaveLength(1);
    expect(unwinnable[0]?.scene.choices.find((c) => c.correct)?.verdict).toBe("INSUFFICIENT");
  });

  it("has at least one quiet day, and a quiet day never has the Chosen One in it", () => {
    expect(BEATS.some((b) => b.quietDay)).toBe(true);
    for (const beat of BEATS) {
      if (beat.quietDay) expect(beat.scene.isChosenOne).toBeFalsy();
    }
  });

  it("only a quiet day raises goblin morale — advocacy is unreachable without one", () => {
    // The invariant that makes the MOR 9+ gate reachable at all. Morale used to be
    // monotonically non-increasing across all six weeks, so a number the game could never
    // produce was gating a promotion that could never fire.
    const raisers = BEATS.filter((b) => b.scene.choices.some((c) => (c.deltas?.morale ?? 0) > 0));
    expect(raisers.length).toBeGreaterThan(0);
    for (const beat of raisers) expect(beat.quietDay).toBe(true);
  });
});
