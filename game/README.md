# Hencharvest

*Middle Management At The Fortress*

You are the regional manager under the Dark Lord. The chosen one keeps invading on Tuesdays
and you have to write it up as a scheduling conflict.

## Running it

```bash
cd game
npm install
npm run dev      # http://localhost:5173
npm test         # 24 tests, incl. the BRANCHING.md ledger assertion
npm run build    # -> dist/, static
```

## Deploying to Cloudflare Pages

The build is a static SPA, so Pages needs no config file:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `game` |

Connect the git repo, set those three values, deploy. No `wrangler` config, no Pages
Functions, no Node runtime — the whole thing is a client-side state machine with the
content compiled into the bundle.

## Where things live

Design documents are in the repo root and are the source of truth, not the code:

- `../DESIGN.md` — systems, tone rules, the promotion ladder (§7)
- `../CONTENT.md` — the writing, plus the two "never say this" reject lists
- `../PROTOTYPE.md` — a playable Tuesday, written out branch by branch
- `../BRANCHING.md` — the six-week canonical run, and the ledger

## Architecture

**Content is data, not components.** The game is ~90% text and the text already exists in
`CONTENT.md`, so every scene, choice, verdict, and memo lives in `src/content/*.ts` as typed
data. Adding a Tuesday means writing a data file — never touching a `.tsx`.

```
src/
  engine/
    types.ts     the schema. Everything in content is checked against this.
    rules.ts     strikes, promotions, probation, the guards
    rng.ts       seeded mulberry32, so every run replays identically
    persist.ts   localStorage. No server, no account, nothing leaves the browser.
  content/
    week1.ts     week one, straight out of BRANCHING.md
  App.tsx        the game loop and the UI
```

**Two rules the code is not allowed to break:**

1. **The UI never explains a recovery.** No toasts, no badges, no "promotion available."
   A title change is reported in the same flat register as everything else. `CONTENT.md` 5d
   lists the ways to get this wrong.
2. **`correct: true` is never rendered.** It exists for the test suite only. The player
   learns correct filing from the verdicts, over several runs, which is what makes
   *deliberately* misfiling an informed choice rather than a guess.

## The one assertion worth knowing about

`rules.test.ts` asserts the canonical Career curve from `BRANCHING.md`:

```
6 -> 7 -> 8 -> 9 -> 10 -> 10 -> 4 -> 3 -> 5 -> 2
```

Three perfect weeks, a demotion anyway, then a promotion for filing badly. If a content
edit breaks that curve, the test fails — because the curve *is* the argument.

