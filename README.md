# Hencharvest: Middle Management At The Fortress

A deadpan management game. You are the regional manager under the Dark Lord. The chosen one
keeps invading on Tuesdays and you have to write it up as a scheduling conflict.

## Documents

Read in this order — each one is the source of truth for the layer below it.

| File | What it is |
| --- | --- |
| `DESIGN.md` | Thesis, six tone rules, seven systems, locked decisions, promotion ladder (§7) |
| `CONTENT.md` | The writing in bulk, plus two "never say this" reject lists |
| `PROTOTYPE.md` | A playable Tuesday, written out branch by branch |
| `BRANCHING.md` | The six-week canonical run and its auditable ledger |
| `game/` | The build. See `game/README.md`. |

## The one-sentence version

You never win a fight. You close an incident. The comedy comes from the incompetence of the
system you are stuck inside, not from the monsters — and the strongest ending state is
"the paperwork is perfect and the pit trap still works."

## Status

All six weeks are built and playable. 38 tests pass, including an end-to-end simulation
that plays the real content through the real engine — so the design docs are a regression
suite, not just documentation.

### Before deploying: two beats must be play-verified

**Do not put a URL in front of anyone until weeks 2 and 4 have been played by a human.**
Not because they are broken — the end-to-end test proves all three simulated paths complete
the arc — but because the tests prove *functionality*, not *fun*, and these two beats are
the ones where that distinction actually matters.

1. **The week-2 memo.** It costs four patience, it cannot be filed against, and the player
   did nothing wrong. It should read as *the system is unfair*, which is the joke. If it
   reads as *the game is broken*, the patience drain needs rebalancing. This beat was tuned
   blind — it was adjusted until every simulated path finished the six weeks, which is a
   proxy for "works" and not for "lands."
2. **The week-4 strike.** Career at 10/10, demoted anyway, no scene explaining it. This is
   the thesis stated in meters. It is either the funniest thing in the game or a betrayal
   of trust, and only playing it will say which.

If either fails, fix the balance *before* shipping. Cloudflare's free tier makes redeploys
free, so there is no cost to waiting — and a public URL makes "did you check that?" a much
worse question.

### Playtest findings (in progress)

Read these before touching the balance. These came from playing, not from tests.

**1. The status readout was illegible, and it broke a line of dialogue.** *(fixed)*
The meters rendered as `PATIENCE 4  CAREER 4  MORALE 5` — bare words, no scale, no change
indicator. A goblin said "You're at four" and the player could not tell what the 4 referred
to, because **both patience and career were 4 at that moment.** The number had no magnitude
either, so 4 read as a digit rather than a level.

The readout is now a form: each quantity named, drawn as ten cells, with the change since
the last beat annotated on the line, and a demotion count in the header (previously the
player could be demoted twice without ever being told how close the Mines were). Dialogue
can now refer to "your position" unambiguously, and the player watches 8 → 4 happen.

**Standing lesson:** any line of dialogue that names a number must be checkable against the
readout. If a number is not legible on screen, the line is not writing. Add the number to
`METER_ROWS` and let the test assert the scale exists.

## Deploying

Cloudflare Pages, once the above is signed off. Static SPA, no config file:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `game` |

No `wrangler` config, no Pages Functions, no Node runtime. **No SPA 404-rewrite needed** —
there is no router in the codebase, so there are no client-side routes to fall through on.
More detail in `game/README.md`.

Saves live in `localStorage`, so every player's progress is their own. No accounts, no
sync, nothing shared.
