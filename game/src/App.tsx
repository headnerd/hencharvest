import { useCallback, useEffect, useState } from "react";
import type { Choice, RunState, Scene, Verdict } from "./engine/types";
import { week1 } from "./content/week1";
import { applyDeltas, applyRecovery, canMisfile, isRunOver, resolveStrikes } from "./engine/rules";
import { newRun, loadRun, saveRun, clearRun, exportRun } from "./engine/persist";
/**
 * The whole game loop. Reads a scene, shows it, takes a choice, applies the deltas,
 * prints the verdict, moves on.
 *
 * Design rule that constrains this file: the UI must never explain a recovery. No
 * toasts, no badges, no "promotion available". A title change is reported in the same
 * flat register as everything else. See DESIGN.md 7.3.
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

const SCENES: Scene[] = week1.days.flatMap((d) => d.scenes);
const HEADING = week1.days[0]?.heading ?? "";

export default function App() {
  const [run, setRun] = useState<RunState>(() => loadRun() ?? newRun());
  // Set once a choice is made, so the resolution and verdict show before choices return.
  const [pending, setPending] = useState<Choice | null>(null);

  useEffect(() => saveRun(run), [run]);

  const choose = useCallback((choice: Choice) => {
    setRun((prev) => {
      let next: RunState = { ...prev, meters: applyDeltas(prev.meters, choice.deltas ?? {}) };

      // The misfiling. Only fires when demoted — see canMisfile.
      if (choice.recovery === "MISFILE" && canMisfile(prev)) {
        next = applyRecovery(next, "MISFILE");
      }

      // Hero-defeated streak: only correct Chosen One filings count.
      if (choice.correct && SCENES[prev.sceneIndex]?.isChosenOne) {
        next = { ...next, heroStreak: next.heroStreak + 1 };
      }

      return resolveStrikes(next);
    });
    setPending(choice);
  }, []);

  const advance = useCallback(() => {
    setRun((prev) => ({ ...prev, sceneIndex: prev.sceneIndex + 1 }));
    setPending(null);
  }, []);

  const restart = useCallback(() => {
    clearRun();
    setRun(newRun());
    setPending(null);
  }, []);

  /** Share the run as text. No backend — a run is a seed and a log. */
  const share = useCallback(() => {
    const text = exportRun(run);
    void navigator.clipboard?.writeText(text);
  }, [run]);

  const over = isRunOver(run);
  const scene = SCENES[run.sceneIndex];


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

  if (!scene) {
    return (
      <>
        <Meters run={run} />
        <div className="ending">
          <p className="day-heading">WEEK 1 — CLOSED</p>
          <div className="body">
            <p>
              Tuesday's filings are closed. The queue is at four hundred and one. He will be back.
              This is documented. This is always documented.
            </p>
          </div>
          <button className="continue" onClick={restart}>
            Begin again
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Meters run={run} />

      {!pending && (
        <>
          <p className="day-heading">{HEADING}</p>
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
        Run {run.seed} · <button className="link" onClick={share}>Copy run</button>
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
