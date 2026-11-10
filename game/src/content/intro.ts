/**
 * The cold open — the appointment memo, shown once, before the first beat.
 *
 * Data, not component prose, per game/README.md: the writing lives in content.
 * It is not a week or a beat; it is the screen before the run starts, and it only
 * appears on a genuine first visit (see `hasSeenIntro` in engine/persist.ts).
 *
 * Tone checks (CONTENT.md): no wink, no "welcome," no teaser of the misfiling
 * promotion (5d), and nothing the meters don't already say. It promises the saving
 * behavior honestly and the leniency of nothing.
 */
export const INTRO = {
  title: "HENCHARVEST",
  subtitle: "Middle Management At The Fortress",
  heading: "Re: Your appointment",
  memo: [
    "You are the Regional Manager for this fortress. The Dark Lord does not address hiring matters directly. This memo is the hiring matter.",
    "The Chosen One is a recurring incident. It is due on Tuesday. It is always due on Tuesday.",
    "You will not fight him. You will file him.",
    "Three quantities are kept on the record: the Dark Lord's Patience, Your Position, and Goblin Morale. When patience reaches zero, a demotion is recorded. Three demotions end the appointment.",
    "Your work is saved in this browser. There is no account. There has never been an account.",
  ],
  signoff: "— The Dark Lord, and beneath it: noted",
  beginLabel: "Begin",
};
