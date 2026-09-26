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

Week one is built and playable. `npm test` asserts the canonical Career curve from
`BRANCHING.md`, so the design docs are the regression suite, not just documentation.
