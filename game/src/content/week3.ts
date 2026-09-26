import type { Week } from "../engine/types";

/**
 * Week 3 — nothing improves.
 *
 * The week the player should start to suspect something. Everything is filed correctly,
 * the trap is signed, the hero is rescheduled, and Patience does not recover. The
 * realisation is that the fortress is succeeding and the Dark Lord is not pleased, and
 * that no filing can fix it, because he never asked for the trap to work.
 */

const TRAP_DIALOGUE = [
  "The form requires a signature from a manager with authority over the hazard.",
  "You are a manager with authority over the hazard.",
  "I would like to draw your attention to the fact that these are the same.",
];

export const week3: Week = {
  week: 3,
  days: [
    {
      id: "w3-tue",
      heading: "TUESDAY — NOTHING IMPROVES",
      scenes: [
        {
          id: "w3-chosen-one",
          title: "THE CHOSEN ONE IS ON TIME",
          body: [
            "The Chosen One has entered the premises. He is on time. He is always on time, and the calendar has been arranged around him, and everyone knows it without discussing it.",
            "He says he is here for the thing at the bottom. The thing at the bottom is a filing cabinet. It was the thing at the bottom in March, and in the February before that.",
          ],
          isChosenOne: true,
          choices: [
            {
              id: "w3-file-scheduling",
              label: "1. SCHEDULING CONFLICT",
              note: "He is here on a Tuesday. Tuesdays are a standing conflict.",
              correct: true,
              verdict: "ACCEPTED",
              deltas: { patience: -1, career: 1 },
              resolution: [
                "The notice went out. It is the fourth identical notice and it has been drafted from the same template since October, and the template has a field for the date, and the date is the only part that changes.",
                "He takes it. He has never not taken it. There is no field on any form for what a man does with a notice he has already read.",
              ],
            },
            {
              id: "w3-file-safety",
              label: "2. SAFETY COMPLIANCE",
              note: "He is near the pit trap. The trap cannot consent to this proximity.",
              verdict: "ACCEPTED",
              deltas: { patience: 1, morale: -1 },
              resolution: [
                "Filed against the hazard assessment. The assessment is now the most-read document in the building and it has never once been used to change the assessment.",
              ],
            },
            {
              id: "w3-file-deprecation",
              label: "3. DEPRECATION NOTICE",
              note: "The grievance is documented as a known quantity in three places.",
              verdict: "REJECTED",
              deltas: { career: -1 },
              resolution: [
                "The grievance is not a weapon and cannot be deprecated, but the filing system does not distinguish between the two, and has never been asked to, and the distinction was not in scope.",
              ],
            },
            {
              id: "w3-file-other",
              label: "4. OTHER / UNCATEGORIZED",
              note: "No box fits. File it anyway.",
              verdict: "REJECTED",
              deltas: { patience: -1, career: -1, morale: -1 },
              recovery: "MISFILE",
              resolution: [
                "Filed under Other. The queue is at four hundred and one.",
                "The Chosen One is still in the building.",
              ],
            },
          ],
        },
        {
          id: "w3-trap",
          title: "16:40, THE PIT TRAP",
          body: [
            "The pit trap is functional. The file says non-compliant. Both of these are correct and they are about different things, and only one of them is anybody's responsibility.",
            ...TRAP_DIALOGUE,
          ],
          choices: [
            {
              id: "w3-trap-sign",
              label: "1. SIGN AS-IS",
              note: "The trap is documented. The trap remains. Nothing has changed.",
              correct: true,
              deltas: { patience: 1, career: 1 },
              resolution: [
                "Signed. The trap is documented, the trap remains, and the trap will remain, and the documentation remains valid for the duration, and no party has been harmed by any of this in a way that generates a form.",
              ],
            },
            {
              id: "w3-trap-clause",
              label: "2. SIGN AND ADD A SAFETY CLAUSE",
              note: "Four extra lines. Genuinely safer. The trap is now conditioned.",
              deltas: { patience: -2 },
              resolution: [
                "Four extra lines. The trap is conditioned, and conditioned means it misses one in five, and the one in five is a number you chose, and the form records it, and the form is now more accurate and less useful.",
              ],
            },
            {
              id: "w3-trap-safe",
              label: "3. SIGN IT SAFE",
              note: "The trap is now a safety feature. It will not kill.",
              deltas: { career: 2, patience: -3 },
              resolution: [
                "Signed safe. The trap is now a safety feature. It will not kill, and the paperwork is immaculate, and those two facts appear on the same page in the same typeface.",
                "The Dark Lord will not speak to you directly again. This is not a punishment. It is a reallocation of his attention, and you are no longer part of it.",
              ],
            },
            {
              id: "w3-trap-refer",
              label: "4. REFER IT UP",
              note: "Send the form to him. He will sign it correctly.",
              deltas: { patience: 1 },
              resolution: [
                "You send the form up. He signs it himself, in a hand that has not changed since the fortress was a proposal, and it is the most correct document the pit trap has ever had.",
                "It contains one line you will think about for a long time. It does not concern the pit trap.",
              ],
            },
          ],
        },
      ],
    },
  ],
};
