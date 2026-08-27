import type { ClassSession } from "../types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function newSession(): ClassSession {
  return { id: crypto.randomUUID(), dayOfWeek: 1, startTime: "09:00", endTime: "10:00", location: "" };
}

export default function ClassScheduleEditor({
  sessions,
  onChange,
}: {
  sessions: ClassSession[];
  onChange: (sessions: ClassSession[]) => void;
}) {
  function updateSession(id: string, patch: Partial<ClassSession>) {
    onChange(sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function removeSession(id: string) {
    onChange(sessions.filter((s) => s.id !== id));
  }

  return (
    <div className="form-grid">
      {sessions.length === 0 && (
        <p className="empty-state" style={{ padding: "8px 0" }}>
          No weekly class times set.
        </p>
      )}
      {sessions.map((session) => (
        <div key={session.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <select
              className="input"
              value={session.dayOfWeek}
              onChange={(e) => updateSession(session.id, { dayOfWeek: Number(e.target.value) })}
            >
              {DAY_LABELS.map((label, i) => (
                <option key={i} value={i}>
                  {label}
                </option>
              ))}
            </select>
            <button type="button" className="icon-btn" title="Remove" onClick={() => removeSession(session.id)}>
              ✕
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="time"
              className="input"
              value={session.startTime}
              onChange={(e) => updateSession(session.id, { startTime: e.target.value })}
            />
            <input
              type="time"
              className="input"
              value={session.endTime}
              onChange={(e) => updateSession(session.id, { endTime: e.target.value })}
            />
          </div>
          <input
            className="input"
            placeholder="Location (optional)"
            value={session.location ?? ""}
            onChange={(e) => updateSession(session.id, { location: e.target.value })}
          />
        </div>
      ))}
      <button type="button" className="btn" onClick={() => onChange([...sessions, newSession()])}>
        + Add class time
      </button>
    </div>
  );
}
