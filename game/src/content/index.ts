import type { Week } from "../engine/types";
import { week1 } from "./week1";
import { week2 } from "./week2";
import { week3 } from "./week3";
import { week4 } from "./week4";
import { week5 } from "./week5";
import { week6 } from "./week6";

/**
 * The whole run, in order.
 *
 * Flattened into a scene list because the engine advances scene by scene. Week and day
 * boundaries are handled by `isDayStart`, which is what triggers the daily tick
 * (probation drain, recovery gate, strike resolution).
 */
export const WEEKS: Week[] = [week1, week2, week3, week4, week5, week6];

export interface Beat {
  week: Week;
  day: Week["days"][number];
  scene: Week["days"][number]["scenes"][number];
  /** True on the first scene of a day, so the engine ticks once per day here. */
  isDayStart: boolean;
}

export const BEATS: Beat[] = WEEKS.flatMap((week) =>
  week.days.flatMap((day) =>
    day.scenes.map((scene, i) => ({
      week,
      day,
      scene,
      isDayStart: i === 0,
    })),
  ),
);

export const TOTAL_SCENES = BEATS.length;
