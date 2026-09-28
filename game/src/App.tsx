import { useCallback, useEffect, useState } from "react";
import type { Choice, RunState, Verdict } from "./engine/types";
import { BEATS, TOTAL_SCENES } from "./content";
import {
  advocacyEligible,
  applyDeltas,
  applyRecovery,
  canMisfile,
  isRunOver,
  resolveStrikes,
  rollLetterhead,
  tickDay,
} from "./engine/rules";
import { Rng } from "./engine/rng";
import { newRun, loadRun, saveRun, clearRun, exportRun } from "./engine/persist";

/**
 * The whole game loop. Reads a beat, shows it, takes a choice, applies the deltas, prints
 * the verdict, moves on.
 *
 * Design rule that constrains this file: the UI must never explain a recovery. No toasts,
 * no badges, no "promotion available". A title change is reported in the same flat
 * register as everything else. See DESIGN.md 7.3, CONTENT.md 5d.
 */

/** Verdict text is fixed copy, not templated — see CONTENT.md 5c. */
const VERDICT_TEXT: Record<Verdict, string> = {
  ACCEPTED: "Filing accepted. The matter is closed. No follow-up required.",
  REJECTED: "Filing rejected. Correct category: Scheduling Conflict. This filing has been returned.",
  INSUFFICIENT:
    "Filing insufficient. The filing was correct. It was also not enough. Both of these facts are noted and neither has changed the other.",
};

const TITLE_LABEL: Record<RunState["title"], string> = {
  REGIONAL_MANAGER: "Regional Manager",
  REGIONAL_MANAGER_DEPUTY: "Regional Manager (Deputy)",
  REGIONAL_MANAGER_ACTING: "Regional Manager (Acting)",
  MINES: "Mines",
};

/**
 * The stream a single decision rolls against.
 *
 * Derived from the run seed and the position in the run rather than held as state, so a
 * seeded run replays identically — which is the whole reason `Rng` exists, and the whole
 * reason the letterhead is 15% and not "when the player seems to have earned it".
 */
function decisionRng(state: RunState): Rng {
  return new Rng((state.seed + state.day * 1000 + state.sceneIndex) >>> 0);
}

export default function App() {
  const [run, setRun] = useState<RunState>(() => loadRun() ?? newRun());
  // Set once a choice is made, so the resolution and verdict show before choices return.
  const [pending, setPending] = useState<Choice | null>(null);
  // The meters as they stood before the last change, so the readout can annotate the
  // delta. This is what makes "you're at four" legible: the player watched it go 8 -> 4.
  const [previous, setPrevious] = useState<RunState | null>(null);

  useEffect(() => saveRun(run), [run]);

  const choose = useCallback((choice: Choice) => {
    setRun((prev) => {
      setPrevious(prev);
      const beat = BEATS[prev.sceneIndex];
      let next: RunState = { ...prev, meters: applyDeltas(prev.meters, choice.deltas ?? {}) };

      // The misfiling. Only fires when demoted — see canMisfile.
      if (choice.recovery === "MISFILE" && canMisfile(prev)) {
        next = applyRecovery(next, "MISFILE");
      }

      // The letterhead. A correctly-filed unwinnable ticket, 15% of the time, promotes
      // you for surviving it — promoted for a defeat. See DESIGN.md 7.4.
      const unwinnable = beat?.scene.unwinnable === true;
      next = { ...next, unwinnableLastScene: unwinnable };
      // `!prev.unwinnableLastScene` is the 6.2 pacing guard: unwinnable tickets cannot
      // be back to back, so the second one cannot pay.
      if (unwinnable && choice.correct && rollLetterhead(next, decisionRng(next), !prev.unwinnableLastScene)) {
        next = applyRecovery(next, "LETTERHEAD");
      }

      // Hero-defeated streak: only correct Chosen One filings count.
      if (choice.correct && beat?.scene.isChosenOne) {
        next = { ...next, heroStreak: next.heroStreak + 1 };
      }

      return resolveStrikes(next, prev.day);
    });
    setPending(choice);
  }, []);

  const advance = useCallback(() => {
    setRun((prev) => {
      const nextIndex = prev.sceneIndex + 1;
      // Daily tick at the start of a day: patience drain, probation, gate, strikes.
      const isDayStart = BEATS[nextIndex]?.isDayStart;
      const ticked = isDayStart
        ? tickDay({ ...prev, day: prev.day + 1, sceneIndex: nextIndex })
        : { ...prev, sceneIndex: nextIndex };
      const rolled = isDayStart ? resolveStrikes(ticked, prev.day + 1) : ticked;

      // Goblin advocacy. Paid at the END of a quiet day, not on a ticket, and only if the
      // player is still demoted and in the goblins' good graces. Nothing announces it.
      const finishedQuietDay =
        BEATS[prev.sceneIndex]?.quietDay === true && BEATS[nextIndex]?.day.id !== BEATS[prev.sceneIndex]?.day.id;
      return finishedQuietDay && advocacyEligible(rolled, true)
        ? applyRecovery(rolled, "ADVOCACY")
        : rolled;
    });
    setPending(null);
  }, []);

  const restart = useCallback(() => {
    clearRun();
    setRun(newRun());
    setPending(null);
  }, []);

  /**
   * Sharing is a keypress, not a link.
   *
   * The footer used to carry a "Copy run" button on every screen. It was the only control
   * in the game that was not part of the fiction — a utility affordance sitting under a
   * document that is supposed to be a filing, on a game whose whole voice is that the
   * interface is the filing system. CONTENT.md 5d: if the player can point at a screen and
   * say "this is where the game told me", it was told too clearly.
   *
   * The key is a playtest affordance, not a feature. See game/README.md.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "c" || e.metaKey || e.ctrlKey || e.altKey) return;
      void navigator.clipboard?.writeText(exportRun(run));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  const atEnd = !BEATS[run.sceneIndex];
  const over = isRunOver(run, atEnd);
  const beat = BEATS[run.sceneIndex];

  if (over) {
    return (
      <>
        <Meters run={run} previous={previous} />
        <div className="ending">
          <p className="day-heading">
            {over === "MINES" ? "TRANSFERRED TO THE MINES" : "SCHEDULED INCURSION — DID NOT OCCUR"}
          </p>
          <div className="body">
            <p>
              {over === "MINES"
                ? "Following a review of regional performance across the period, you have been assigned to the Mines, effective today. Your access to the filing system will be retained. You will not require it."
                : "The scheduled incursion did not occur. The matter is closed. The calendar entry has been removed. No replacement has been scheduled, as the requirement has been met."}
            </p>
          </div>
          <div className="verdict">
            Follow-up required: No. There is no follow-up. The trap is compliant.
            <span className="reason">Filing closed.</span>
          </div>
          <button className="continue" onClick={restart}>
            Begin again
          </button>
        </div>
      </>
    );
  }

  if (!beat) {
    return (
      <>
        <Meters run={run} previous={previous} />
        <div className="ending">
          <p className="day-heading">FORM 7B — CLOSED</p>
          <div className="body">
            <p>
              The Chosen One is no longer in the building. He is a filed incident, status
              Closed, resolution Rescheduled, which is not the truth and is, per the manual,
              permitted.
            </p>
            <p>
              Re: The chosen one — status of the filing cabinet
            </p>
            <p>
              The filing cabinet has not been deprecated. The filing cabinet has been
              reported as the thing at the bottom on three separate occasions by three
              separate people. The filing cabinet is a filing cabinet.
            </p>
            <p>
              Deprecation notices were available. None were issued. This is not a
              coincidence and it is not an oversight. The requirement has been met.
            </p>
            <p>He will be back. This is documented. This is always documented.</p>
          </div>
          <div className="verdict">
            Follow-up required: No. There is no follow-up. The trap is compliant.
            <span className="reason">
              The trap was compliant before you arrived. The trap remained compliant. No
              party is responsible for the trap, the calendar, or the outcome, and no party is
              available to be responsible. Filing closed.
            </span>
          </div>
          <button className="continue" onClick={restart}>
            Begin again
          </button>
        </div>
      </>
    );
  }

  const scene = beat.scene;

  return (
    <>
      <Meters run={run} previous={previous} />

      {!pending && (
        <>
          <p className="day-heading">{beat.day.heading}</p>
          <h2 className="scene-title">{scene.title}</h2>
          <div className="body">
            {scene.body.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </>
      )}

      {pending && (
        <div className="resolution">
          {pending.resolution.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      {pending?.verdict && (
        <div className="verdict">
          {VERDICT_TEXT[pending.verdict]}
          {pending.verdict === "REJECTED" && (
            <span className="reason">
              You may refile. There is no deadline. There has never been a deadline.
            </span>
          )}
        </div>
      )}

      {pending ? (
        <button className="continue" onClick={advance}>
          Continue
        </button>
      ) : (
        <div className="choices">
          {scene.choices.map((choice) => (
            <button key={choice.id} className="choice" onClick={() => choose(choice)}>
              <span className="label">{choice.label}</span>
              {choice.note && <span className="note">{choice.note}</span>}
            </button>
          ))}
        </div>
      )}

      <p className="footer-note">
        Run {run.seed} · Week {beat.week.week} of 6 · Beat {run.sceneIndex + 1} of{" "}
        {TOTAL_SCENES}
      </p>
    </>
  );
}

/**
 * The three quantities, as a manager would read them off a form.
 *
 * Named, scaled out of ten, and annotated with the change since the last beat. This was a
 * playtest fix: the original flat readout ("PATIENCE 4  CAREER 4  MORALE 5") gave the
 * player no scale and no way to tell which number a line of dialogue referred to. A goblin
 * saying "you're at four" was ambiguous because *both* patience and career were 4.
 *
 * Deliberately not a game HUD: no icons, no colour, no arrows. Boxes on a form.
 */
const METER_ROWS: Array<{ key: keyof RunState["meters"]; label: string }> = [
  { key: "patience", label: "The Dark Lord's Patience" },
  { key: "career", label: "Your Position" },
  { key: "morale", label: "Goblin Morale" },
];

const SCALE = 10;

function Meters({ run, previous }: { run: RunState; previous: RunState | null }) {
  const strikesLabel =
    run.strikes === 0
      ? "No demotions on record"
      : `${run.strikes} of 3 demotions${run.strikes === 2 ? " — one remaining" : ""}`;

  return (
    <div className="meters">
      <div className="meters-head">
        <span className="title">{TITLE_LABEL[run.title]}</span>
        <span className={run.strikes >= 2 ? "strikes at-risk" : "strikes"}>{strikesLabel}</span>
      </div>

      {METER_ROWS.map(({ key, label }) => {
        const value = run.meters[key];
        const before = previous?.meters[key];
        const delta = before === undefined ? 0 : value - before;
        return (
          <div className="meter" key={key}>
            <span className="meter-label">{label}</span>
            <span className="meter-delta">
              {delta === 0 ? "" : delta > 0 ? `+${delta}` : `${delta}`}
            </span>
            <span className="meter-value">{value}</span>
            <span className="meter-scale" aria-hidden="true">
              {Array.from({ length: SCALE }, (_, i) => (
                <span key={i} className={i < value ? "meter-cell filled" : "meter-cell"} />
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
}
