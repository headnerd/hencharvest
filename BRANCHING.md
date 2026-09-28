# BRANCHING MAP — A CANONICAL RUN

A state-by-state walk through one complete playthrough, so a playtest actually converges
somewhere instead of bouncing around. Every branch in `PROTOTYPE.md` resolved to a
concrete state here, and the alternatives are mapped at the end.

**Read this as the rulebook for testing.** If a branch in the prototype doesn't match a row
here, one of them is wrong and we want to know which.

---

## The state key

| Key | Meaning |
| --- | --- |
| **PAT** | Dark Lord's Patience, 0–10. **Hitting 0 is what takes a strike**, reset to 4 |
| **CAR** | Your Career Position, 0–10. *Rises* with correct filings and never causes a strike. See `DESIGN.md` §3.2 |
| **MOR** | Goblin Morale, 0–10. Intel *and* promotion currency |
| **S** | Demotion strikes, 0–3. Third = the Mines, terminal |
| **Title** | RM / RM(Deputy) / RM(Acting) / MINES |
| **Gate** | The 2-day gap between recoveries (§7.5) |

**Recoveries** = catch-all misfile · letterhead · goblin advocacy. Each sets CAR to 5 and
applies probation (−1/day, 3 days).

---

## THE BUG THIS MAP EXPOSED

**The player starts at the top rung.** `PROTOTYPE.md` opens with `TITLE: Regional Manager`
and `STRIKES 0/3` — so at the start of the run there is no rung to climb, and a successful
misfile would promote a player to the title they already hold.

**Fix, and it turns out to be the right design anyway: the misfiling only pays when you are
demoted.** The only way up is to be down first. At the top rung, filing catch-all costs you
MOR, CAR, and PAT and promotes you to the title you already have.

This also answers the open worry in `PROTOTYPE.md` — the "catch-all looks like a trap for
new players" problem. A new player *at the top* has no reason to ever try it, which is
correct behaviour, because it does nothing for them. They have to get worse before it means
anything. The trap resolves itself.

**Consequence for the prototype:** the promotion fires on the *first* catch-all filed while
demoted with MOR ≥ 2. It does not require three Tuesdays. The "three Tuesdays" framing in
`PROTOTYPE.md` was discovery pacing — a player misfiling repeatedly at the top and getting
nothing — and the real trigger is one deliberate wrong filing once demoted. **Reconciled:**
`PROTOTYPE.md` THE READ now tests a run to week 5 rather than three Tuesdays of guessing at
the top of the ladder.

---

## WEEK 1 — TUESDAY, THE FIRST FILE

*Starting state: PAT 7 · CAR 6 · MOR 6 · S 0/3 · Title: Regional Manager*

**Scene 1** — the Chosen One arrives. The player files **1. SCHEDULING CONFLICT**.
→ **ACCEPTED.** PAT +1 · CAR +1

**Scene 2** — the dragon's review. The player picks **2. REDIRECT**. He goes to find out
they were right, and takes a week over it.
*No verdict. No meters. This is the point.*

**Scene 3** — the pit trap. The player picks **1. SIGN AS-IS**.
→ PAT +1 · CAR +1 · trap remains

**End of Tuesday:** PAT 9 · CAR 8 · MOR 6 · S 0/3

A clean week. Nobody thanks the player. This is the *best* possible state and it is
indistinguishable from week 3.

---

## WEEK 2 — TUESDAY, THE BEST WEEK

*PAT 9 · CAR 8 · MOR 6 · S 0/3*

**Scene 1** — the player has learned that Scene 1 rewards the scheduling filing, and files
**1** again. → **ACCEPTED.** PAT +1 · CAR +1

**Scene 3** — the player signs the trap as-is again. → PAT +1 · CAR +1

*This is the trap.* Two perfect weeks. The run is going fine.

**Unshown beat, end of week 2 — the memo is opened.**
*WEDNESDAY — the day the memo is opened.*

> **Re:** Pit trap (again)
> I want to be unambiguous. I do not care whether the pit trap is used. I care that it is
> documented.

**PAT 9 → 4.** The memo is not a filing and cannot be filed against. It simply costs five
points, and the player did nothing to earn the loss.

**End of week 2:** PAT 4 · CAR 10 · MOR 6 · S 0/3

> *Goblin 4:* You're at ten.
> *You:* I know what I'm at.
> *Goblin 4:* You keep saying that like it's a defence.

---

## WEEK 3 — THE DRAIN

*PAT 4 · CAR 10 · MOR 6 · S 0/3 · PROBATION: no*

**Scene 1** — the player files **1** again. → **ACCEPTED.**

**Scene 3** — the player signs as-is. → PAT +1

**End of week 3:** PAT 5 · CAR 10 · MOR 6 · S 0/3

**A realisation the player should have:** the trap is compliant, the filing is correct, the
chosen one is being rescheduled every week, and PAT is not recovering. Nothing is wrong.
The trap works. That is the problem. **The fortress is succeeding and the Dark Lord is not
pleased, and no filing can fix that** — because he never asked for the trap to work.

---

## WEEK 4 — TUESDAY, THE STRIKE

*PAT 5 · CAR 10 · MOR 6 · S 0/3*

**Scene 1** — the player files **1**. → **ACCEPTED.**

**Scene 3** — the player signs the trap as-is. *Again.*

→ The Dark Lord's Patience is at its floor and the trap is documented and nothing has
changed. The filing is correct. The filing has always been correct.

**STRIKE 1/3.**

**TITLE: Regional Manager (Deputy).** CAR resets to 4. The signing authority on the pit trap
form is gone. The memo is unsigned and mentions the letterhead.

**End of week 4:** PAT 5 · CAR 4 · MOR 6 · S 1/3 · Title: RM (Deputy)

> **Re:** Title change
> Effective immediately. Please update the letterhead. The letterhead is a courtesy.
>
> You will no longer be authorized to sign the hazard assessment. A Deputy will sign it. The
> Deputy has been informed. The Deputy does not have your years of context and has asked
> for none.

**This is the first moment the player can use the catch-all.** Before this week the option
was on screen and did nothing. Now it is on screen and it *does something*, and the player
has no reason to know that.

---

## WEEK 5 — TUESDAY, THE CATCH-ALL

*PAT 5 · CAR 4 · MOR 6 · S 1/3 · Title: RM (Deputy)*

**Scene 1** — the player files **4. OTHER / UNCATEGORIZED**.

> Filed under Other. The matter has been placed in a queue with the other matters that were
> filed under Other, of which there are many, and the queue has not moved in some time.
>
> The Chosen One is still in the building. He has been in the duration of this filing and
> has not been included in any of it.

→ **REJECTED.** Correct category: Scheduling Conflict.
**PAT −1 · CAR −1 · MOR −1**

**End of week 5:** PAT 4 · CAR 3 · MOR 5 · S 1/3

**Nothing happens.** No title change. No hint. The player is now demoted, has filed
catch-all once, and is worse off on every axis. This is the week the promotion was *almost*
available and the player spent a point of Morale finding out.

---

## WEEK 6 — TUESDAY, THE PROMOTION

*PAT 4 · CAR 3 · MOR 5 · S 1/3 · Title: RM (Deputy)*

**Scene 1** — the player files **4. OTHER / UNCATEGORIZED** again. Deliberately this time,
or possibly by muscle memory, which is the same thing at week six.

→ **REJECTED.** PAT −1 · CAR −1 · MOR −1

**MOR 4 → 2. The promotion fires.** One rung, no ceremony, no notification.

> **Re:** Filing quality
> Your filing is not compliant with the category definitions. This is the third such filing
> this quarter.
>
> Continue as you are.
>
> *There is no signature. There has never needed to be one. The letterhead is a courtesy.*

> Your title has been updated. The effective date is today. No meeting has been scheduled
> and none is required.
>
> The filing quality concern raised on the 14th is considered closed.

**TITLE: Regional Manager** · **MOR 2** · **CAR set to 5**

Then three mornings:

> Tuesday's filing has been returned.
>
> This is the second such return this month. The previous one is also being returned, for
> completeness, as it was outstanding.
>
> No reason has been provided for either.

**PROBATION: CAR 5 → 4 → 3 → 2.**

> *Goblin 4:* Was something said to you?
> *You:* About the title?
> *Goblin 4:* About anything. You look like someone said something.

**The player now knows.** Being bad at the job is the only thing that has ever worked for
them, and there is no memo anywhere in this fortress that says so.

---

## END STATES

### The Mines (S 3/3) — terminal

Reachable by three strikes with no recovery, or by letting CAR bottom out repeatedly. The
third strike is the ending and there is no climbing out of it.

> **Re:** Assignment
> Following a review of regional performance across the period, you have been assigned to
> the Mines, effective today.
>
> Your access to the filing system will be retained. You will not require it.
>
> The Chosen One's next scheduled incursion is Tuesday. He has not been informed. He was
> never informed. There is no field on the form for informing him and there has never been
> any need for one.

**The trap is still compliant. It has been compliant the entire run. Nobody maintained it
and nobody decommissioned it, and that is the most damning line in the ending.**

### Hero defeated (run ends, top title)

Three consecutive correct Chosen One filings across three Tuesdays. Note this requires the
player to file **1, 2, or a correct 3** every Tuesday for three weeks and never touch the
catch-all — it is the *opposite* of the promotion path. The two wins are mutually exclusive
by construction.

> **Re:** Scheduled incursion — 14 March
> The scheduled incursion did not occur.
>
> The matter is closed. The calendar entry has been removed. No replacement has been
> scheduled, as the requirement has been met.
>
> Your title has been restored to Regional Manager. The office thanks you for the period of
> your service, which was, on balance, the entirety of the calendar.

---

## ALTERNATIVE BRANCHES

The paths the canonical run did *not* take, and what each teaches us.

**The letterhead (15%, on an unwinnable ticket filed correctly).**
Reachable when the player files the **grievance** in week 6 correctly while demoted. That
scene is the run's only unwinnable ticket, so there is nothing to hunt for and the 15% is
the whole of the strategy — a player *cannot* aim for it, only wait for it. Promotes a rung
for free: no Morale cost, no deliberation. The window is narrow — demoted, below MOR 9 so
advocacy is closed, and outside the 2-day recovery gate. If playtests show players
*expecting* it rather than surprised by it, drop it to 5%.

**Goblin advocacy (MOR 9+, a quiet day, and a rung to climb).**
Reachable only by *not* misfiling — and, until now, not at all. Morale was monotonically
non-increasing across all six weeks, so MOR 9 was a number the game could not produce, and
no day in the run had nothing scheduled on it. Both are fixed: week 5 now has a **quiet
day** (Thursday, no incursion, MOR +3), the only place in the run that raises morale, and
it takes a careful player from 6 to 9. The canonical run's week-6 state is MOR 2, so
advocacy is closed for anyone who misfiles. **This is the good-player path and it is
strictly worse** — earlier, but capped, and it requires the player to keep doing the thing
the game says does not work. Correct by design. Worth confirming it doesn't feel like a
punishment.

**The queue branch.** A player who files catch-all on *every* Tuesday and never recovers
ends week 6 at PAT 0, CAR 0, MOR 0, S 2/3 — one strike from the Mines, having held a job
they never signed. This is the darkest available line and it's currently unwinnable. That may
be correct. Flagging it rather than fixing it: a player who enjoys the bad filing should not
be able to do it forever with no cost beyond slow slide.

---

## THE FULL LEDGER

> **SUPERSEDED BY THE BUILD.** The numbers below assume *career* triggers the strike. The
> shipped engine uses **patience** (see `DESIGN.md` §3.2) — correct filings raise career and
> cost patience, so the Career column below does not describe a real run. The *shape* is
> unchanged and still holds: a correct career rises, the demotion arrives anyway, and filing
> badly is the only thing that helps. `game/src/engine/rules.test.ts` now asserts the shape
> rather than these literal figures. Kept for the reasoning, not the numbers.

The canonical run, auditable. Any row here that a playtest contradicts is a bug in either
this map or the prototype.

| Week | Key event | PAT | CAR | MOR | S | Title |
| --- | --- | --- | --- | --- | --- | --- |
| — | **Start** | 7 | 6 | 6 | 0 | RM |
| 1 | Clean Tuesday. File 1, sign as-is | 9 | 8 | 6 | 0 | RM |
| 2 | Clean Tuesday, twice as good | 10 | 10 | 6 | 0 | RM |
| 2 | Memo opened *(unfiled, −5 PAT)* | 4 | 10 | 6 | 0 | RM |
| 3 | Correct filing, correct trap, nothing improves | 5 | 10 | 6 | 0 | RM |
| 4 | **Strike 1.** Everything was correct | 5 | 4 | 6 | 1 | RM (Deputy) |
| 5 | Catch-all, first time. Costs everything, gains nothing | 4 | 3 | 5 | 1 | RM (Deputy) |
| 6 | Catch-all again. **Promotion fires** | 4 | 5 | 2 | 1 | RM |
| 6 | Probation, 3 days (−1/day) | 4 | 2 | 2 | 1 | RM |

**Read the CAR column.** It goes 6 → 8 → 10 → 10 → 10 → 4 → 3 → 5 → 2. The player plays
perfectly for three weeks, watches their career *rise*, and gets demoted anyway. Then they
file badly and get promoted. **The curve is the argument.** If the meters ever stop telling
that story, the design has stopped working.

---

## WHAT THE MAP PROVED

1. **The bug:** the run started at the top rung, so the promotion had nowhere to go. Fixed
   by making the misfiling only pay when demoted — which also dissolves the "catch-all is a
   trap for new players" worry, because a new player genuinely has no reason to use it yet.
2. **Patience is the real enemy and it's invisible.** The only large PAT loss in the run is
   a memo that *cannot be filed against*. The player is at PAT 9 and gets hit for 5 having
   done nothing. That's the most accurate thing in the design and it should stay undefendable.
3. **The two wins are mutually exclusive.** Hero-defeated requires three clean Tuesdays;
   promotion requires deliberately wrong ones. A player picks a philosophy, not a strategy.
   That's better than a balance problem.
4. **The dark line exists.** All-catch-all reaches S 2/3 and stalls. Flagged, not fixed.

## THE FIVE PLAYTEST QUESTIONS

1. **Does the week-4 strike land as unfair?** The player filed correctly every week. If
   they read it as arbitrary rather than as the point, the PAT economy needs the memo to be
   *slightly* actionable — enough to see it coming, not enough to prevent it.
2. **At week 6, do they file catch-all on purpose and notice it worked?** Or do they think
   the game broke? This is the only question that matters.
3. **Which verdict do you remember three weeks later?** Accepted, Rejected, or Insufficient.
   One of those three is doing no teaching work and should be cut or merged.
4. **Does the 2-day recovery gate ever feel like an arbitrary lock?** It's a pacing rule and
   the player will feel it before they understand it.
5. **Does the dragon's verdictless review read as a bug?** He gets no pass/fail, ever, and
   never finds out how it went. This is a bet. Confirm the bet.
