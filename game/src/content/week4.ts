import type { Week } from "../engine/types";

/**
 * Week 4 — the strike.
 *
 * The player files correctly, signs the trap correctly, and is demoted anyway. Career
 * 10 -> 4. No scene explains it. The memo is unsigned and mentions the letterhead.
 * See CONTENT.md 5b.
 */

const TRAP_DIALOGUE = [
  "The form requires a signature from a manager with authority over the hazard.",
  "You are a manager with authority over the hazard.",
  "I would like to draw your attention to the fact that these are the same.",
];

export const week4: Week = {
  week: 4,
  days: [
    {
      id: "w4-tue",
      heading: "TUESDAY — EVERYTHING WAS CORRECT",
      scenes: [
        {
          id: "w4-chosen-one",
          title: "THE CHOSEN ONE IS ON TIME",
          body: [
            "The Chosen One has entered the premises. He is on time. He is carrying nothing in particular, which after this long reads as a considered choice on his part.",
            "He does not say he is here for the thing at the bottom. He looks at the courtyard for slightly too long, and then he takes the notice, because the notice is the only part of this with a procedure attached.",
          ],
          isChosenOne: true,
          choices: [
            {
              id: "w4-file-scheduling",
              label: "1. SCHEDULING CONFLICT",
              note: "He is here on a Tuesday. Tuesdays are a standing conflict.",
              correct: true,
              verdict: "ACCEPTED",
              deltas: { patience: -1, career: 1 },
              resolution: [
                "The notice went out. It is the fifth. He takes it without reading it, which you note in the file, because the file has a field for whether the party acknowledged receipt and this is the first time that field has been useful.",
              ],
            },
            {
              id: "w4-file-safety",
              label: "2. SAFETY COMPLIANCE",
              note: "He is near the pit trap. The trap cannot consent to this proximity.",
              verdict: "ACCEPTED",
              deltas: { patience: 1, morale: -1 },
              resolution: [
                "Filed against the hazard assessment. This is the ninth filing of its kind and the assessment now has more citations than recommendations, and has not been amended on the strength of any of them.",
              ],
            },
            {
              id: "w4-file-deprecation",
              label: "3. DEPRECATION NOTICE",
              note: "The fact that he carries nothing is, briefly, the most deprecable thing about him.",
              verdict: "REJECTED",
              deltas: { career: -1 },
              resolution: [
                "You have attempted to deprecate a man's equipment where the equipment is nothing. The rejection is automatic, and the automation is not subtle, and the reason it is automatic is that this filing has been rejected eleven times.",
              ],
            },
            {
              id: "w4-file-other",
              label: "4. OTHER / UNCATEGORIZED",
              note: "No box fits. File it anyway.",
              verdict: "REJECTED",
              deltas: { patience: -1, career: -1, morale: -1 },
              recovery: "MISFILE",
              resolution: [
                "Filed under Other. The queue is at four hundred and one.",
                "The Chosen One is still in the building. He has been in the building for the entire duration of this filing.",
              ],
            },
          ],
        },
        {
          id: "w4-trap",
          title: "16:40, THE PIT TRAP",
          body: [
            "The pit trap is functional. The file says non-compliant. The trap has not changed. The file has not changed. You have not changed anything in eleven weeks.",
            ...TRAP_DIALOGUE,
          ],
          choices: [
            {
              id: "w4-trap-sign",
              label: "1. SIGN AS-IS",
              note: "The trap is documented. The trap remains. Nothing has changed.",
              correct: true,
              deltas: { patience: 1, career: 1 },
              resolution: [
                "Signed. The trap remains. The trap has always remained. The trap will remain after this, in the same way it has remained through every other signature you have given it.",
                "This is the correct filing. It has been the correct filing every time.",
              ],
            },
            {
              id: "w4-trap-clause",
              label: "2. SIGN AND ADD A SAFETY CLAUSE",
              note: "Four extra lines. Genuinely safer.",
              deltas: { patience: -2 },
              resolution: [
                "Four extra lines. The trap is conditioned and misses one in five, and the form is more accurate, and the accuracy has not helped anything yet.",
              ],
            },
            {
              id: "w4-trap-safe",
              label: "3. SIGN IT SAFE",
              note: "A safety feature. It will not kill.",
              deltas: { career: 2, patience: -3 },
              resolution: [
                "Signed safe. It will not kill. The paperwork is immaculate and the trap is a safety feature, and both of these are true, and only one of them is the reason anyone will read about this.",
              ],
            },
            {
              id: "w4-trap-refer",
              label: "4. REFER IT UP",
              note: "Send the form to him.",
              deltas: { patience: 1 },
              resolution: [
                "He signs it. Correctly, and in the same hand, and it is the fourth time, and the form has been returned to you four times, and you have sent it up four times.",
                "Neither of you has mentioned that this is a pattern.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "w4-monday",
      heading: "MONDAY, LATER — THE MEMO",
      scenes: [
        {
          id: "w4-memo-read",
          title: "FROM: THE DARK LORD",
          noVerdict: true,
          body: [
            "The memo is on your desk in the morning. Your title is different on it than it was yesterday. There was no meeting. No meeting was required.",
            "Re: Title change",
            "Effective immediately. Please update the letterhead. The letterhead is a courtesy.",
            "You will no longer be authorized to sign the hazard assessment. A Deputy will sign it. The Deputy has been informed. The Deputy does not have your years of context and has asked for none.",
            "There is no signature at the bottom. There has never needed to be one.",
          ],
          choices: [
            {
              id: "w4-memo-continue",
              label: "Continue",
              resolution: [
                "You update the letterhead. The letterhead was not the problem and the letterhead was never going to be the problem, and updating it takes four minutes, and four minutes is what you have.",
                "The Deputy signs the hazard assessment at 16:40. The assessment was complete before the Deputy arrived. The Deputy has nonetheless improved one sentence, and the improvement has been accepted, because there is no field for refusing an improvement.",
              ],
            },
          ],
        },
      ],
    },
  ],
};
