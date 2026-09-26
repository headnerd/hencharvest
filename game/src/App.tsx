import { useCallback, useEffect, useState } from "react";
import type { Choice, RunState, Verdict } from "./engine/types";
import { BEATS, TOTAL_SCENES } from "./content";
import {
  applyDeltas,
  applyRecovery,
  canMisfile,
  isRunOver,
  resolveStrikes,
  tickDay,
} from "./engine/rules";
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

export default function App() {
  const [run, setRun] = useState<RunState>(() => loadRun() ?? newRun());
  // Set once a choice is made, so the resolution and verdict show before choices return.
  const [pending, setPending] = useState<Choice | null>(null);

  useEffect(() => saveRun(run), [run]);

  const choose = useCallback((choice: Choice) => {
    setRun((prev) => {
      const beat = BEATS[prev.sceneIndex];
      let next: RunState = { ...prev, meters: applyDeltas(prev.meters, choice.deltas ?? {}) };

      // The misfiling. Only fires when demoted — see canMisfile.
      if (choice.recovery === "MISFILE" && canMisfile(prev)) {
        next = applyRecovery(next, "MISFILE");
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
      return isDayStart ? resolveStrikes(ticked, prev.day + 1) : ticked;
    });
    setPending(null);
  }, []);

  const restart = useCallback(() => {
    clearRun();
    setRun(newRun());
    setPending(null);
  }, []);

  /** Share the run as text. No backend — a run is a seed and a log. */
  const share = useCallback(() => {
    void navigator.clipboard?.writeText(exportRun(run));
  }, [run]);

  const atEnd = !BEATS[run.sceneIndex];
  const over = isRunOver(run, atEnd);
  const beat = BEATS[run.sceneIndex];


  if (over) {
    return (
      <>
        <Meters run={run} />
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
        <Meters run={run} />
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
      <Meters run={run} />

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
        {TOTAL_SCENES} ·{" "}
        <button className="link" onClick={share}>
          Copy run
        </button>
      </p>
    </>
  );
}

function Meters({ run }: { run: RunState }) {
  return (
    <div className="meters">
      <span className="title">{TITLE_LABEL[run.title]}</span>
      <span>
        PATIENCE <strong>{run.meters.patience}</strong>
      </span>
      <span>
        CAREER <strong>{run.meters.career}</strong>
      </span>
      <span>
        MORALE <strong>{run.meters.morale}</strong>
      </span>
    </div>
  );
}
