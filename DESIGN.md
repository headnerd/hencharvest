# Hencharvest: Middle Management At The Fortress

**Design doc.** The design and the build are reconciled: where the engine corrected this
document, the correction is written here rather than left in the commit that made it. Where
this document is still ahead of the build, it says so. Read in the order `README.md` gives.

---

## 1. The Thesis

You are the regional manager under the Dark Lord. The chosen one keeps invading on
Tuesdays and you have to write it up as a scheduling conflict.

The joke is **not** "fantasy world plus corporate lingo." That is a bit and it wears out
fast. The joke is that the hero is being managed as a workload, and the only power you
have is documentation. You cannot win a fight. You can only close an incident.

The comedy comes from the *incompetence of the system you are stuck inside* — not from the
monsters. Every laugh should be traceable to a rule of the world being applied sincerely
and producing an absurd result.

**Success condition:** the player has at some point laughed at a *rule of the game*
rather than at a *line of text.*

---

## 2. Tone Rules (Non-Negotiable)

These are the load-bearing constraints. If we break one, the game turns into a parody
sketch instead of a deadpan voice, and the voice is the whole product.

1. **Never break character.** The narrator does not wink. The game does not acknowledge it
   is funny. The comedy comes from total sincerity, not from signalling to the player.
2. **The Dark Lord never raises his voice.** His displeasure is a calendar invite. His rage
   is a one-line memo with no adjectives.
3. **Violence in HR vocabulary.** "Requisitioned." "Offboarded." "Headcount reduced."
   The register never shifts to action-movie when something dies.
4. **The joke is always at the fantasy's expense, never the worker's.** This is the
   failure mode to watch. If it starts feeling like real workplace satire, it has become a
   LinkedIn post. Keep the demons in it. The office is a hell dimension and the direct
   report is apex predator — lean hard on that collision.
5. **Restraint.** Deadpan dies from density. If every line is a punchline, nothing lands.
   Boring beats are load-bearing. Every good joke in this doc is adjacent to something
   dull.
6. **Escalation is administrative, never emotional.** When things go badly, paperwork
   multiplies. Nobody screams.

---

## 3. Core Systems

The laughs are structural, not just written. Each system below is a machine that
generates comedy when you feed it the fantasy premise.

### 3.1 The Ticket System — the core loop

Every incursion is a ticket. The player picks a **Category**, and the category matters more
than any other decision in the game.

| Category | Use when | Misuse result |
| --- | --- | --- |
| Scheduling Conflict | Hero arrives at a booked time | Escalates — reschedule, hero gets angrier |
| Safety Compliance | Hero touches the pit trap | Escalates — citations, hero becomes a claimant |
| Budget Overrun | Damage exceeds the quarterly figure | Escalates — finance, unpaid |
| Deprecation Notice | Hero uses an "outdated" weapon/tech | Escalates — hero upgrades, counter goes up |
| Other / Uncategorized | The catch-all | Never escalates, never helps, always makes you look bad |

It is genuinely Jira, with the J's replaced by slaughter. The funniest state in the game is
a perfectly-filed ticket that resolves nothing.

### 3.2 Two meters instead of HP

- **Dark Lord's Patience** — the obvious one. Low patience means escalation.
- **Your Career Position** — the *real* one. You do not die. When it bottoms out you are
  **transferred to the Mines.** This is a worse ending than death and a funnier one, and it
  is the fail state we design toward.

> **CORRECTED DURING THE BUILD** — see `game/src/engine/rules.ts`. This section originally
> said *career* bottoms out and triggers a strike. That is wrong, and it broke the whole
> game: correct filings raise career every week, so career never reached 0, no strike ever
> fired, and the entire promotion arc was unreachable. The end-to-end test caught it.
>
> **Patience is the strike trigger. Career is not.** The correct filing raises career and
> costs patience, because the thesis is that doing the job right does not help — he never
> asked for the pit trap to work. So a correct career rises while your standing falls, and
> the demotion is *his* decision rather than a performance review. Three supporting rules:
> a strike resets **both** meters to 4; patience **drains 1 every other day** with no memo
> attached; and at most **one strike per day** is taken.

### 3.3 The Chosen One is a recurring ticket, not a boss

He has an open incident from six months ago. Status: In Progress. Assignee: you.

It has forty-seven comments. Forty-six are yours. One is the Dark Lord's, in which he
writes only: *noted.*

He will be back. You know he is coming back. Everyone knows he is coming back. Every
Tuesday is the same Tuesday.

### 3.4 The Goblin Standup is the information economy

The goblins are the only functional employees in the building and the only ones who will
tell you what the Dark Lord is actually thinking. **Their morale *is* your intel.**

- Keep them up → they warn you, they cover for you
- Ignore them → they start organizing, and standup turns hostile

This is the only system where the player is rewarded for basic decency, which is a joke in
itself given the job.

### 3.5 Performance reviews for the dragon

The dragon eats the paperwork. Every review cycle is therefore a **retrieval problem** —
you are retrieving your own evidence. This is a mechanic, not a gag: a real, playable
puzzle dressed as a mandatory meeting.

The dragon is doing his best. That is the joke. He is doing his best and it is not enough.

### 3.6 The pit trap is a paperwork problem, not a weapon

The real goal is to get the trap into compliance **without decommissioning it**.

"Fixing" the trap is losing. The trap is safe, permitted, and *still kills*. See the
Dark Lord's memo in `CONTENT.md` — it is the thesis statement of the entire game.

---

## 4. Run Structure

Deadpan needs long quiet stretches. Do not front-load jokes.

- **A week.** Five days. Tuesday is the incursion day.
- Each day: a small set of scenes, each ending in a filing decision.
- Tuesday is the escalation. Everything else is the slow accumulation of the paperwork that
  makes Tuesday survivable.
- Escalate weekly. The absurdity should compound across a run, not repeat within one.

---

## 5. Locked Decisions

Settled. These are now constraints, not questions. Anything that violates them is cut.

1. **Deaths are reported, filed, and referred to — never on screen.** The player does not
   witness a death. They receive the report, the form, and the referral number. The horror
   is entirely in the paperwork's calm.
2. **The hero is near-silent, with one recurring line.** He speaks once or twice per run.
   Always sincere. Always slightly wrong about the fortress. He is a workload, not a wit.
3. **Failure is a ladder, not a cliff.** Three demotions and you are in the Mines. See
   §6.1 — this is a system now, not an ending.
4. **Some tickets have no correct answer.** The game is about the ones you can only
   survive, not solve. See §6.2.
5. **Restraint.** Density kills the voice. Boring beats are load-bearing.
6. **Escalation is administrative, never emotional.** When things go badly, paperwork
   multiplies. Nobody screams.
7. **The misfiling promotion is deliberate.** The player must know a filing is wrong before
   they can choose it. See §7.

---

## 6. Systems Implied by the Decisions

### 6.1 The Demotion Ladder (from decision 3)

Career Position is no longer one meter — it is a **rung on a ladder**, and each rung
carries a different flavour of loss. Three demotions is the end. This is the most
important structural addition in this pass: a fail state you can fail *twice* is a
resource, not a punishment.

| Demotion | New title | What the player loses | What they keep |
| --- | --- | --- | --- |
| 1st | Regional Manager (Deputy) | Signing authority on the pit trap form | Access to goblin standup |
| 2nd | Regional Manager (Acting) | Escalation rights — cannot refer upward | The filing system entirely |
| 3rd | **Transferred to the Mines** | — | — |

**The joke:** each demotion *removes a verb*. You can no longer refer the form upward, so
you must resolve it yourself, badly. A demoted player is a worse manager with less power,
which is the most accurate description of demotion ever written.

**Note:** the rung titles here are the *downward* labels. §7 adds the recovery paths, and a
rung's title is not fixed — "Regional Manager (Deputy)" is what you are called after a
demotion and what you stop being called when you are promoted. The loss of authority is the
state, not the wording on the letterhead.

Crucially, demotion is **announced, not experienced.** No scene where you are told you are
being let go. A memo appears in the morning and your title has changed on it. The horror
is that it was always going to happen and there was nothing in your job that would have
prevented it.

> **Re:** Title change
> Effective immediately. Please update the letterhead. The letterhead is a courtesy.
>
> — *the memo is signed "The Dark Lord" and beneath it, "noted," which is not a
> correction, it is the whole thing*

### 6.2 Unwinnable Tickets (from decision 4)

A ticket with no correct answer must still *feel* like a choice. It works by making every
option locally reasonable and globally costly. The player should be able to justify their
pick to themselves and still lose.

**Structure:** the ticket resolves, the meter moves, and the world states plainly that the
outcome was the same regardless. No punishment beat, no "you failed" — just the quiet
recognition that the system had already decided.

> You filed it correctly. That was the correct filing. It was always going to be the
> correct filing, and it was always going to be insufficient, and these two facts were
> never going to be reconciled by anyone, least of all by you.

**Pacing rule:** unwinnable tickets cannot be back to back. They need a survivable filing
between them or the player stops engaging with the choices and starts clicking. A loss the
player caused should always be followed by one they could have prevented.

---

## 7. The Promotion Ladder (deliberate recovery)

Locked: the misfiling promotion is **deliberate**. The player chooses to file wrong, knowing
it is wrong. This is the most important decision in the design and it follows from the tone
rules — an accidental promotion would be a joke the game tells, and this game does not tell
jokes.

### 7.1 Core state

- **3 demotion strikes.** Each strike drops you one rung. The third is the Mines.
- **Career Position (0–10)** is the within-rung drain. Hitting 0 takes a strike and resets to 4.
- **Goblin Morale is now a career resource**, not only an intel counter. This is the
  retune that makes §7.3 possible.

### 7.2 Verdicts — the player must earn the right to misfile

The player can only deliberately misfile if they **know** the filing is wrong. The game
teaches them, and the teaching is the only permission granted. After every ticket:

| Verdict | Text |
| --- | --- |
| Accepted | The matter is closed. No follow-up required. |
| Rejected | Correct category: [x]. This filing has been returned. |
| Insufficient | The filing was correct. It was also not enough. Both facts are noted; neither changed the other. |

**The game never marks a misfiling opportunity.** It only reports whether the player was
right. The player assembles a mental model of correct filing across several runs, and *that
model* is the prerequisite for choosing badly.

This is deliberate design, not convenience: **expertise is what makes complicity possible.**
A first-time player cannot exploit this. A player who read the manual cannot exploit it. Only
a player who has been caught out a few times gets the option — and they will still not know
the punishment was the reward.

### 7.3 The catch-all misfiling (primary recovery)

The promotion filing is **OTHER / UNCATEGORIZED** — the category already defined in §3.1 as
*"never escalates, never helps, always makes you look bad."*

Turning the weakest option into the only promotion tool is the joke the whole ladder hangs on.
The game presents it as career suicide; the player discovers late that looking incompetent
was the only thing that worked. The character has learned that the only way up is to be bad
at the job, and no one in the fortress will ever say so, because it was never in a memo.

| | |
| --- | --- |
| Requires | **The player has a rung to climb** (title is Deputy or Acting), Morale ≥ 2, deliberate, post-verdict knowledge, not within 2 days of a recovery |
| Effect | Climb one rung, **−2 Morale** |
| Fiction | A rejection memo that reads as a warning, unsigned |

**Never marked in the UI.** No badge, no hint, no available-misfile indicator. The player
finds out by doing it and watching their title change.

**The demotion requirement is load-bearing, not incidental.** Without it a player at full
title has no rung to climb, so a successful misfile would "promote" them to the title they
already hold — which surfaced as a bug when `BRANCHING.md` was built, because the run opens
at Regional Manager with 0 strikes.

The fix is also the design: **the only way up is to be down first.** At full title, filing
catch-all costs Morale, Career, and Patience and achieves nothing — which is the correct
experience, because a new player has not yet earned the promotion and should have no reason
to try for it. It also dissolves the "catch-all looks like a trap for new players" worry
(`PROTOTYPE.md` THE READ): the option is on screen from week one and genuinely does nothing
until the player has been demoted. The learning curve is built into the state, not into UI.

> **CORRECTED — the condition is "a rung to climb", not "S ≥ 1".** The draft phrasing said
> *S ≥ 1*, and that is wrong once recoveries exist. A recovery does not clear your strikes,
> so a player promoted from Deputy back to Regional Manager still has S = 1 and no rung left
> to climb. Keying the promotion off the strike count therefore both (a) refused to promote
> an Acting manager back to Deputy — killing the only promotion a deep run has left — and
> (b) promised a promotion to a player already at the top. Strikes are a *count of demotions*;
> whether a rung exists above you is a *function of your title*, and the two are not the same
> question. The engine now derives it from the title, which cannot drift.

The same condition applies to **goblin advocacy** (§7.4), which was silently gated on the
same flag with nothing in this document saying so. Advocacy climbs a rung; if there is no
rung, there is nothing to climb, and the same reasoning applies.

**Trigger:** the promotion fires on the *first* catch-all filed while the player has a rung
to climb and Morale ≥ 2. It does not require a run of three. See `BRANCHING.md` weeks 4–6.

### 7.4 The four recoveries

| Source | Requirement | Effect |
| --- | --- | --- |
| **Catch-all misfiling** | **A rung to climb** (Deputy or Acting), Morale ≥ 2, deliberate, no recovery in prior 2 days | Climb one rung, −2 Morale |
| **The letterhead** | Filed correctly on an unwinnable ticket; 15%; no recovery in prior 2 days | Climb one rung, free |
| **Goblin advocacy** | Morale 9+ **and** a quiet week (a day with no incursion) **and a rung to climb** | Climb one rung |
| **Hero defeated** | 3 consecutive correct Chosen One filings across 3 Tuesdays | Run ends, top title |

**The letterhead** reuses §6.2 deliberately: you are promoted for surviving a ticket you could
not win, so the promotion is meaningless. Promoted for a defeat.

**Goblin advocacy** is the inversion of every other system — the reward for a good week
arrives when nothing happened, which is not directly engineerable. It pays §3.4 (the only
system rewarding decency) without making the goblins a career tool.

**Hero defeated** is rare and terminal, and fires once. It is the run's win state. It must
never be presented as a goal, or players start filing to kill the hero and the game becomes
a dungeon crawler with a paperwork skin. This is the single biggest tonal risk in the design
and it is managed by never surfacing it as progress.

### 7.5 The guards (three, non-negotiable)

1. **A recovery sets Career Position to 5, not 10, and triggers probation** — −1 Career
   Position per day for three days. Climbing up and immediately sliding is the shape of the
   thing. The cost of recovering is that recovering is not over.
2. **No two recoveries within 2 days.** The run should bounce, not grind upward.
3. **The Mines are terminal.** No climbing out. If the bottom has an exit, the ladder goes soft
   and the fail state stops meaning anything.

### 7.6 The cost shape — protect this

The catch-all costs Morale, and Morale is the only source of the goblin intel that keeps the
player alive. So **a player chasing promotions is structurally obliged to keep the goblins
happy.**

A player optimizing for career is forced, by arithmetic, into the one system that rewards
decency. This is the best loop in the design. If a future change makes Morale cheap or
intel free, this collapses and the whole ladder turns into a score-chase.

