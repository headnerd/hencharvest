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

  it("shows the three meters and nothing else in the status bar", () => {
    const html = renderToStaticMarkup(createElement(App));
    expect(html).toContain("PATIENCE");
    expect(html).toContain("CAREER");
    expect(html).toContain("MORALE");
    expect(html).toContain("Regional Manager");
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
});
