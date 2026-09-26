import type { Week } from "../engine/types";

/**
 * Week 1 — the first file.
 *
 * Straight from ../BRANCHING.md. End state: PAT 9, CAR 8, MOR 6, S 0.
 *
 * Note what this week is for: it is a clean week. Nobody thanks the player. This is the
 * best possible outcome and it is indistinguishable from week three.
 */
export const week1: Week = {
  week: 1,
  days: [
    {
      id: "w1-tue-morning",
      heading: "TUESDAY, 8:40",
      scenes: [
        {
          id: "w1-goblins",
          title: "STANDUP",
          body: [
            "Monday's pit trap count has been reconciled. The number is lower than last week's number. The number is never higher than last week's number. This is not a statement about morale.",
          ],
          noVerdict: true,
          choices: [
            {
              id: "w1-goblins-continue",
              label: "Continue",
              resolution: [
                "Goblin 1: Morning.",
                "Goblin 4: Morning.",
                "Goblin 1: There's a message from Legal on the door.",
                "Goblin 4: Is it the message about the message?",
                "Goblin 1: It's the message about the door, Goblin 4.",
                "Goblin 4: In my experience those are the same message.",
              ],
            },
          ],
        },
        {
          id: "w1-chosen-one",
          title: "THE CHOSEN ONE IS ON TIME",
          body: [
            "A sound from the courtyard. Not an attack. Worse: a person, arriving, on the date expected.",
            "The Chosen One has entered the premises. He was carrying a +3 longsword and a grievance. I have logged both. The sword is in Lost & Found. The grievance is with Legal.",
            "He says he is here for the thing at the bottom. The thing at the bottom is a filing cabinet. It was the thing at the bottom in March.",
          ],
          isChosenOne: true,
          choices: [
            {
              id: "w1-file-scheduling",
              label: "1. SCHEDULING CONFLICT",
              note: "He is here on a Tuesday. Tuesdays are a standing conflict.",
              correct: true,
              verdict: "ACCEPTED",
              deltas: { patience: -1, career: 1 },
              resolution: [
                "The notice went out. He received it. He is required to be notified of a conflict, and now he has been notified of a conflict, and the conflict is that he is here.",
                "He is upset about the notice. He is not upset about the notice. He is upset that the notice worked — that he was, briefly, at 10:14, indisputably a scheduling problem rather than a man with a sword.",
                "He is now, technically, still a scheduling problem. But he is a scheduling problem who is aware that we have paperwork, and this is a new and worse category of threat.",
              ],
            },
            {
              id: "w1-file-safety",
              label: "2. SAFETY COMPLIANCE",
              note: "He is near the pit trap. The trap is not a person and cannot consent to this proximity.",
              verdict: "ACCEPTED",
              deltas: { patience: 1, morale: -1 },
              resolution: [
                "Filed against the hazard assessment. The assessment is for the pit trap. The Chosen One is not a hazard, but he is adjacent to one, and the assessment has no field for adjacency.",
                "He has been made aware of the boundary. He has been aware of the boundary since March.",
              ],
            },
            {
              id: "w1-file-deprecation",
              label: "3. DEPRECATION NOTICE",
              note: "The +3 longsword is documented as outdated in three places.",
              verdict: "REJECTED",
              deltas: { career: -1 },
              resolution: [
                "The longsword is not outdated. The longsword is a +3 and has been a +3 for some time, and no notice has ever been issued, because a notice would require someone to state that the sword is a problem, and the sword has never done anything.",
              ],
            },
            {
              id: "w1-file-other",
              label: "4. OTHER / UNCATEGORIZED",
              note: "No box fits. File it anyway.",
              verdict: "REJECTED",
              deltas: { patience: -1, career: -1, morale: -1 },
              resolution: [
                "Filed under Other. The matter has been placed in a queue with the other matters that were filed under Other, of which there are many, and the queue has not moved in some time.",
                "The Chosen One is still in the building. He has been in the building for the duration of this filing and has not been included in any of it.",
              ],
            },
          ],
        },
      ],
    },
  ],
};
