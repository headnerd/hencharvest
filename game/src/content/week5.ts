import type { Week } from "../engine/types";

/**
 * Week 5 — the catch-all that gains nothing.
 *
 * The most important week in the build. The player is now demoted, the catch-all is on
 * screen and it *works* — and the whole joke is that they cannot tell, and neither can
 * we tell them. The first time they file it, nothing happens. The second time, it does.
 *
 * Nothing in this file may hint, confirm, or foreshadow. No UI, no prose, no goblin
 * reaction that says "now". The player finds out by watching their title change and
 * having to work backwards. See CONTENT.md 5c and 5d.
 */

export const week5: Week = {
  week: 5,
  days: [
    {
      id: "w5-tue",
      heading: "TUESDAY — THE QUEUE",
      scenes: [
        {
          id: "w5-chosen-one",
          title: "THE CHOSEN ONE IS ON TIME",
          body: [
            "The Chosen One has entered the premises. He is on time because Tuesdays happen, and Tuesdays happen because they have always happened, and nobody set this up on purpose.",
            "The filing cabinet is where it has always been. He does not go to it. He goes past it, and the going past it is recorded in no form, and it is the first thing that has happened here in eleven weeks that no form covers.",
          ],
          isChosenOne: true,
          choices: [
            {
              id: "w5-file-scheduling",
              label: "1. SCHEDULING CONFLICT",
              note: "He is here on a Tuesday. Tuesdays are a standing conflict.",
              correct: true,
              verdict: "ACCEPTED",
              deltas: { patience: -1, career: 1 },
              resolution: [
                "The notice went out. It is the sixth. He has started leaving them on the desk, and the desk has a tray, and the tray was for requisitions, and nobody has said anything about the tray.",
              ],
            },
            {
              id: "w5-file-safety",
              label: "2. SAFETY COMPLIANCE",
              note: "He is near the pit trap.",
              verdict: "ACCEPTED",
              deltas: { patience: 1, morale: -1 },
              resolution: [
                "Filed. Eleventh of its kind. The assessment has not been amended and the man has not been amended and the pit trap has not been amended, and the three of them are entirely consistent with each other.",
              ],
            },
            {
              id: "w5-file-deprecation",
              label: "3. DEPRECATION NOTICE",
              note: "The cabinet is deprecated. You checked.",
              verdict: "REJECTED",
              deltas: { career: -1 },
              resolution: [
                "You have checked. The cabinet is not deprecated. The cabinet is a filing cabinet, and it is also the thing at the bottom, and you have apparently established that these are the same cabinet, which is the first genuinely useful thing anyone in this building has found out in months.",
              ],
            },
            {
              id: "w5-file-other",
              label: "4. OTHER / UNCATEGORIZED",
              note: "No box fits. File it anyway.",
              verdict: "REJECTED",
              deltas: { patience: -1, career: -1, morale: -1 },
              recovery: "MISFILE",
              resolution: [
                "Filed under Other. The queue is at four hundred and two.",
                "Nothing else happens. That is the entire resolution. He is still in the building and the building has no category for what that means, so the building has declined to have an opinion.",
              ],
            },
          ],
        },
        {
          id: "w5-standup",
          title: "STANDUP, TUESDAY EVENING",
          noVerdict: true,
          body: [],
          choices: [
            {
              id: "w5-standup-continue",
              label: "Continue",
              resolution: [
                "Goblin 1: The queue's at four hundred and two.",
                "Goblin 4: Is it moving?",
                "Goblin 1: It's a queue.",
                "Goblin 4: It used to be a filing system. Nobody wrote that down. It's been a queue since before either of us.",
              ],
            },
          ],
        },
      ],
    },
  ],
};
