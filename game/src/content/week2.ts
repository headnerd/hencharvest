import type { Week } from "../engine/types";

/**
 * Weeks 2-6 — the canonical run from ../BRANCHING.md.
 *
 * The shape of the whole arc, in one place:
 *   week 2  the memo opens. PAT 9 -> 4. Unfillable, undefendable.
 *   week 3  correct filing, correct trap, nothing improves.
 *   week 4  STRIKE 1. Everything was correct. CAR 10 -> 4.
 *   week 5  catch-all. Costs everything, gains nothing.
 *   week 6  catch-all again. The promotion fires, and the UI says nothing.
 *
 * Two things must not change here:
 *   - week 2's memo cannot be filed against. That is the point of it.
 *   - week 6's promotion must be silent. No toast, no flash, no notification.
 *     CONTENT.md 5d lists every way to get that wrong.
 */

/** The memo. Same copy as DESIGN.md 1 and CONTENT.md 1. */
const PIT_TRAP_MEMO = [
  "Re: Pit trap (again)",
  "I want to be unambiguous. I do not care whether the pit trap is used. I care that it is documented. The last inspection was an embarrassment for all of us.",
  "Please do not make me file a follow-up.",
];

export const week2: Week = {
  week: 2,
  days: [
    {
      id: "w2-tue",
      heading: "TUESDAY — THE SECOND CLEAN WEEK",
      scenes: [
        {
          id: "w2-chosen-one",
          title: "THE CHOSEN ONE IS ON TIME",
          body: [
            "The Chosen One has entered the premises. He is not early. He is never early. He is a standing Tuesday.",
            "He is not carrying a grievance this week. He is carrying a shield, which is logged, and the fact that the shield is unremarkable, which is also logged.",
          ],
          isChosenOne: true,
          choices: [
            {
              id: "w2-file-scheduling",
              label: "1. SCHEDULING CONFLICT",
              note: "He is here on a Tuesday. Tuesdays are a standing conflict.",
              correct: true,
              verdict: "ACCEPTED",
              deltas: { patience: -1, career: 1 },
              resolution: [
                "The notice went out. He received it. He is required to be notified of a conflict, and the conflict is that he is here, and he has been notified, and the notice is four lines long and all four of them are true.",
                "He has put the shield down. He has put the shield back up. This is not a conflict of interest and there is no field for it.",
              ],
            },
            {
              id: "w2-file-safety",
              label: "2. SAFETY COMPLIANCE",
              note: "He is near the pit trap. The trap cannot consent to this proximity.",
              verdict: "ACCEPTED",
              deltas: { patience: 1, morale: -1 },
              resolution: [
                "Filed against the hazard assessment. The assessment has no field for adjacency, which is becoming a structural problem with the assessment rather than with him.",
              ],
            },
            {
              id: "w2-file-deprecation",
              label: "3. DEPRECATION NOTICE",
              note: "The shield is documented as outdated in one place, which is a new low.",
              verdict: "REJECTED",
              deltas: { career: -1 },
              resolution: [
                "The shield is not outdated. The shield is a shield. Nobody has issued a deprecation notice for a shield, and the request to do so has been logged as a request, and the request is where requests go.",
              ],
            },
            {
              id: "w2-file-other",
              label: "4. OTHER / UNCATEGORIZED",
              note: "No box fits. File it anyway.",
              verdict: "REJECTED",
              deltas: { patience: -1, career: -1, morale: -1 },
              recovery: "MISFILE",
              resolution: [
                "Filed under Other. The queue is at four hundred. The queue has not moved in some time and the queue is, at this point, the largest organised body in the fortress.",
                "The Chosen One is still in the building. He is now, on the record, the second-longest-standing item in it.",
              ],
            },
          ],
        },
      ],
    },

    {
      id: "w2-wednesday",
      heading: "WEDNESDAY — THE DAY THE MEMO IS OPENED",
      scenes: [
        {
          id: "w2-memo",
          title: "FROM: THE DARK LORD",
          noVerdict: true,
          body: [
            "The memo is on your desk. It has been on your desk since the courier delivered it, which was this morning, which was during the standup, which you attended.",
            "It is not a filing. It cannot be filed against. It is a memo.",
          ],
          choices: [
            {
              id: "w2-memo-read",
              label: "Read it",
              deltas: { patience: -4 },
              resolution: PIT_TRAP_MEMO,
            },
            {
              id: "w2-memo-defer",
              label: "Leave it for later",
              deltas: { patience: -2 },
              resolution: [
                "You leave it for later. Later arrives, as it does, and the memo is on your desk and has been on your desk for the entire intervening period, and it has not developed a disposition in that time.",
                "The patience cost is lower. It is not zero. Nothing about this is free, and the memo is not going to expire, because it is not a ticket, and that is the problem with memos.",
              ],
            },
          ],
        },
        {
          id: "w2-memo-consequence",
          title: "STANDUP, THURSDAY",
          noVerdict: true,
          body: [],
          choices: [
            {
              id: "w2-memo-after",
              label: "Continue",
              resolution: [
                "Goblin 4: You're at four.",
                "You: I know what I'm at.",
                "Goblin 4: You keep saying that like it's a defence.",
                "Goblin 1: It's not a defence, it's a habit. You did it at ten as well.",
                "Goblin 4: You did. Nothing happened at ten. That's the part I keep drawing attention to.",
                "Goblin 1: I'm drawing attention to it because you filed a form about it. At four. Not at ten.",
              ],
            },
          ],
        },
      ],
    },
  ],
};
