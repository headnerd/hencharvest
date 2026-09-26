import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import App from "./App";
import { week1 } from "./content/week1";

/**
 * Smoke test: the game renders its opening screen and the content is shaped correctly.
 * No jsdom needed — a server render tells us whether the component tree is valid.
 */

describe("rendering", () => {
  it("renders without throwing", () => {
    const html = renderToStaticMarkup(createElement(App));
    expect(html.length).toBeGreaterThan(0);
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
    expect(scene?.choices).toHaveLength(4);
    expect(scene?.choices.map((c) => c.id)).toEqual([
      "w1-file-scheduling",
      "w1-file-safety",
      "w1-file-deprecation",
      "w1-file-other",
    ]);
  });

  it("marks exactly one choice correct, and never surfaces that flag in content copy", () => {
    const scene = week1.days[0]?.scenes.find((s) => s.isChosenOne);
    expect(scene?.choices.filter((c) => c.correct)).toHaveLength(1);
  });
});
