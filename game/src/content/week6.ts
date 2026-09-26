import type { Week } from "../engine/types";

/**
 * Week 6 — the promotion.
 *
 * The only week where something the player did wrong helps them. The memo reads as a
 * warning. The title changes underneath it. The UI says nothing, because the UI is not
 * allowed to know this is a good thing. See DESIGN.md 7.3.
 *
 * The three probation days follow. No memo explains them. The player is simply worse at
 * their job for a while and cannot stop it.
 */

export const week6: Week = {
  week: 6,
  days: [
    {
      id: "w6-tue",
      heading: "TUESDAY — THE THIRD SUCH FILING",
      scenes: [
        {
          id: "w6-chosen-one",
          title: "THE CHOSEN ONE IS ON TIME",
          body: [
            "The Chosen One has entered the premises. He is on time. He takes the notice without reading it and puts it in the tray, and the tray was for requisitions, and the tray is now the most reliable thing in the fortress.",
            "He goes past the cabinet. He does not stop. He has stopped four times in eleven weeks and each of those four times generated paperwork, and he has drawn a conclusion, and the conclusion is that stopping is expensive.",
          ],
          isChosenOne: true,
          choices: [
            {
              id: "w6-file-scheduling",
              label: "1. SCHEDULING CONFLICT",
              note: "He is here on a Tuesday. Tuesdays are a standing conflict.",
              correct: true,
              verdict: "ACCEPTED",
              deltas: { patience: -1, career: 1 },
              resolution: [
                "The notice went out. It is the seventh. He put it in the tray before it was finished printing, which is the most efficient thing he has ever done here and has not been recorded anywhere.",
              ],
            },
            {
              id: "w6-file-safety",
              label: "2. SAFETY COMPLIANCE",
              note: "He is near the pit trap.",
              verdict: "ACCEPTED",
              deltas: { patience: 1, morale: -1 },
              resolution: [
                "Filed. The pit trap is fourteen feet from where he stands and the assessment records eleven, and the three-foot discrepancy has been open since the assessment was written, and it is the only genuinely unresolved item in the file.",
              ],
            },
            {
              id: "w6-file-deprecation",
              label: "3. DEPRECATION NOTICE",
              note: "The tray is undocumented.",
              verdict: "REJECTED",
              deltas: { career: -1 },
              resolution: [
                "The tray is not a weapon and cannot be deprecated. The tray is a tray. It was requisitions until six weeks ago, at which point it became something else, and there is no form for that, and there has never needed to be one.",
              ],
            },
            {
              id: "w6-file-other",
              label: "4. OTHER / UNCATEGORIZED",
              note: "No box fits. File it anyway.",
              verdict: "REJECTED",
              deltas: { patience: -1, career: -1, morale: -1 },
              recovery: "MISFILE",
              resolution: [
                "Filed under Other. The queue is at four hundred and three.",
                "The Chosen One is still in the building. He is on time. He will be on time again on Tuesday, and the Tuesday after that, and the calendar entry is a standing one, and the calendar is the only document in this building that has never once needed correcting.",
              ],
            },
          ],
        },
        {
          id: "w6-memo",
          title: "FROM: THE DARK LORD",
          noVerdict: true,
          body: [
            "Re: Filing quality",
            "Your filing is not compliant with the category definitions. This is the third such filing this quarter.",
            "Continue as you are.",
          ],
          choices: [
            {
              id: "w6-memo-continue",
              label: "Continue",
              resolution: [
                "There is no signature at the bottom. There has never needed to be one. The letterhead is a courtesy.",
                "Your title has been updated. The effective date is today. No meeting has been scheduled and none is required.",
                "The filing quality concern raised on the 14th is considered closed.",
              ],
            },
          ],
        },
        {
          id: "w6-standup",
          title: "STANDUP, WEDNESDAY",
          noVerdict: true,
          body: [],
          choices: [
            {
              id: "w6-standup-continue",
              label: "Continue",
              resolution: [
                "Goblin 4: Was something said to you?",
                "You: About the title?",
                "Goblin 4: About anything. You look like someone said something.",
                "You: Nothing was said to me.",
                "Goblin 4: Right. That's twice now, and I've been here four years.",
              ],
            },
          ],
        },
      ],
    },
  ],
};
