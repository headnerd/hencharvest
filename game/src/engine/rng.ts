/**
 * Deterministic RNG.
 *
 * Every run replays identically from its seed. This is not a nicety: the 15% letterhead
 * and the "unwinnable ticket on a specific scene" rules make a run unreproducible without
 * it, and a playtest that can't be reproduced is just vibes. See BRANCHING.md.
 *
 * mulberry32 — small, fast, good enough distribution for a 15% roll.
 */
export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** Float in [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** True with probability p. The 15% letterhead rolls through here. */
  chance(p: number): boolean {
    return this.next() < p;
  }

  /** Current internal state, so save/load can restore the stream mid-run. */
  snapshot(): number {
    return this.state;
  }

  static restore(seed: number, snapshot: number): Rng {
    const rng = new Rng(seed);
    rng.state = snapshot >>> 0;
    return rng;
  }
}

/** A seed a human can read out loud and type back in. */
export function makeSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}

/** Compact, greppable form for sharing a run as text. */
export function formatSeed(seed: number): string {
  return seed.toString(36).toUpperCase().padStart(7, "0");
}

export function parseSeed(text: string): number | null {
  const parsed = parseInt(text.trim(), 36);
  if (Number.isNaN(parsed)) return null;
  return parsed >>> 0;
}
