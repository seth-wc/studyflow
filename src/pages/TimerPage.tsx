import { useEffect, useRef, useState } from "react";
import { useStore } from "../lib/store";

const PRESETS = [25, 45, 50];

type Status = "idle" | "running" | "paused" | "done";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export default function TimerPage() {
  const { data, addStudySession } = useStore();
  const activeProjects = data.projects.filter((p) => !p.archived);

  const [durationMinutes, setDurationMinutes] = useState(25);
  const [projectId, setProjectId] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60);
  const sessionStartRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "running") return;
    const interval = setInterval(() => {
      setRemainingSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Log the session and flip to "done" the moment the countdown hits zero.
  useEffect(() => {
    if (status === "running" && remainingSeconds === 0) {
      logSession(durationMinutes);
      setStatus("done");
    }
  }, [remainingSeconds, status, durationMinutes]);

  function logSession(minutes: number) {
    if (minutes <= 0) return;
    addStudySession({
      projectId: projectId || null,
      taskId: null,
      startedAt: sessionStartRef.current ?? new Date().toISOString(),
      durationMinutes: Math.round(minutes),
    });
  }

  function handlePresetChange(minutes: number) {
    setDurationMinutes(minutes);
    setRemainingSeconds(minutes * 60);
  }

  function handleStart() {
    sessionStartRef.current = new Date().toISOString();
    setRemainingSeconds(durationMinutes * 60);
    setStatus("running");
  }

  function handlePause() {
    setStatus("paused");
  }

  function handleResume() {
    setStatus("running");
  }

  function handleEndEarly() {
    const elapsedMinutes = durationMinutes - remainingSeconds / 60;
    logSession(elapsedMinutes);
    setStatus("idle");
    setRemainingSeconds(durationMinutes * 60);
  }

  function handleReset() {
    setStatus("idle");
    setRemainingSeconds(durationMinutes * 60);
  }

  const todaySessions = data.studySessions.filter(
    (s) => new Date(s.startedAt).getTime() >= startOfToday()
  );
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const recentSessions = [...data.studySessions]
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, 8);
  const projectById = Object.fromEntries(data.projects.map((p) => [p.id, p]));

  return (
    <div className="page">
      <h1>Timer</h1>

      <div className="card">
        <div
          className={
            "timer-display" +
            (status === "done" ? " timer-display-done" : status === "running" ? " timer-display-running" : "")
          }
        >
          {status === "done" ? "Done!" : formatTime(remainingSeconds)}
        </div>

        {status === "idle" && (
          <>
            <div className="chip-row" style={{ marginBottom: 12 }}>
              {PRESETS.map((m) => (
                <button
                  key={m}
                  className={"chip" + (durationMinutes === m ? " chip-active" : "")}
                  onClick={() => handlePresetChange(m)}
                >
                  {m} min
                </button>
              ))}
            </div>

            <div className="form-row" style={{ marginBottom: 12 }}>
              <label htmlFor="timer-project">Focus on (optional)</label>
              <select
                id="timer-project"
                className="input"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">No project</option>
                {activeProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="timer-controls">
          {status === "idle" && (
            <button className="btn btn-primary" onClick={handleStart}>
              Start
            </button>
          )}
          {status === "running" && (
            <>
              <button className="btn" onClick={handlePause}>
                Pause
              </button>
              <button className="btn" onClick={handleEndEarly}>
                End
              </button>
            </>
          )}
          {status === "paused" && (
            <>
              <button className="btn btn-primary" onClick={handleResume}>
                Resume
              </button>
              <button className="btn" onClick={handleEndEarly}>
                End
              </button>
            </>
          )}
          {status === "done" && (
            <button className="btn btn-primary" onClick={handleReset}>
              Start another
            </button>
          )}
        </div>
      </div>

      <div className="stat-row">
        <div className="card stat-tile">
          <span className="stat-dot" style={{ background: "var(--accent)" }} />
          <div className="stat-value">{todayMinutes}m</div>
          <div className="stat-label">Studied today</div>
        </div>
        <div className="card stat-tile">
          <span className="stat-dot" style={{ background: "var(--accent-2)" }} />
          <div className="stat-value">{todaySessions.length}</div>
          <div className="stat-label">Sessions today</div>
        </div>
      </div>

      {recentSessions.length > 0 && (
        <div className="card">
          <h2>Recent sessions</h2>
          {recentSessions.map((s) => {
            const project = s.projectId ? projectById[s.projectId] : null;
            return (
              <div key={s.id} className="session-item">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span
                    className="project-chip"
                    style={{ background: project?.color ?? "var(--text-muted)" }}
                  >
                    {(project?.name ?? "?").charAt(0).toUpperCase()}
                  </span>
                  {project?.name ?? "No project"}
                </span>
                <span>{s.durationMinutes}m</span>
                <span>
                  {new Date(s.startedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
