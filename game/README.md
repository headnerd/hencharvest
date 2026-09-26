# Hencharvest

*Middle Management At The Fortress*

## Running it

```bash
cd game
npm install
npm run dev      # http://localhost:5173
npm test         # 36 tests
npm run build    # -> dist/, static
```

## Deploying to Cloudflare Pages

Static SPA, no config file needed:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `game` |

## Architecture

Content is data, not components. Every scene, choice, verdict, and memo is typed data in
`src/content/week*.ts`. Adding a week means writing a data file, never touching a `.tsx`.

```
src/
  engine/
    types.ts     the schema; all content is checked against it
    rules.ts     strikes, promotions, probation, guards
    rng.ts       seeded mulberry32 — every run replays identically
    persist.ts   localStorage, no backend
  content/
    week1..6.ts  the canonical run from BRANCHING.md
    index.ts     flattens to a beat list
  App.tsx        the game loop and the UI
```

## The rule that matters

**Patience is the strike trigger. Career is not.** Correct filings *raise* career and *cost*
patience — the thesis being that doing the job right does not help. This was originally
written the other way round and the end-to-end test caught that the promotion arc was
completely unreachable. See `DESIGN.md` §3.2.

## Tests

36 tests, three files:

- `engine/rules.test.ts` — the rules in isolation
- `engine/simulation.test.ts` — **the whole six weeks played through the real content**, which
  is the one that matters. It asserts a perfect player is demoted anyway, that the late
  misfiler gets promoted, and that neither path truncates the arc.
- `App.test.tsx` — render smoke test plus content invariants (never more than four choices,
  never more than one correct, the catch-all is always last, the UI never shows `correct`).

## Two rules the code cannot break

1. **The UI never explains a recovery.** No toasts, badges, or "promotion available."
2. **`correct: true` is never rendered.** Test-only. The player learns correct filing from
   verdicts over several runs, which is what makes *deliberately* misfiling informed.
