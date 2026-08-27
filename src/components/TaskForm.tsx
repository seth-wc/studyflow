import { useState } from "react";
import type { Project, RecurrenceFreq, TaskType } from "../types";

export interface TaskFormValues {
  title: string;
  type: TaskType;
  projectId: string; // "" = none
  dueDate: string; // "" = none, else "YYYY-MM-DD"
  repeat: RecurrenceFreq;
  reminderTime: string; // "" = no reminder, else "HH:MM" on the due date
}

const TYPE_LABELS: Record<TaskType, string> = {
  assignment: "Assignment",
  reading: "Reading",
  exam: "Exam",
  "before-class": "Before class",
  other: "Other",
};

export default function TaskForm({
  projects,
  defaultProjectId,
  onSubmit,
  onCancel,
}: {
  projects: Project[];
  defaultProjectId?: string;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<TaskFormValues>({
    title: "",
    type: "assignment",
    projectId: defaultProjectId ?? "",
    dueDate: "",
    repeat: "none",
    reminderTime: "",
  });

  return (
    <form
      className="form-grid card"
      onSubmit={(e) => {
        e.preventDefault();
        if (!values.title.trim()) return;
        onSubmit(values);
      }}
    >
      <div className="form-row">
        <label htmlFor="task-title">Task</label>
        <input
          id="task-title"
          className="input"
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          placeholder="e.g. Read chapter 3"
          autoFocus
        />
      </div>

      <div className="form-row">
        <label htmlFor="task-project">Project</label>
        <select
          id="task-project"
          className="input"
          value={values.projectId}
          onChange={(e) => setValues((v) => ({ ...v, projectId: e.target.value }))}
        >
          <option value="">No project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="task-type">Type</label>
        <select
          id="task-type"
          className="input"
          value={values.type}
          onChange={(e) => setValues((v) => ({ ...v, type: e.target.value as TaskType }))}
        >
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="task-due">Due date (optional)</label>
        <input
          id="task-due"
          type="date"
          className="input"
          value={values.dueDate}
          onChange={(e) => setValues((v) => ({ ...v, dueDate: e.target.value }))}
        />
      </div>

      <div className="form-row">
        <label htmlFor="task-reminder">Remind me (optional)</label>
        <input
          id="task-reminder"
          type="time"
          className="input"
          value={values.reminderTime}
          onChange={(e) => setValues((v) => ({ ...v, reminderTime: e.target.value }))}
          disabled={!values.dueDate}
        />
        {!values.dueDate && (
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Set a due date to enable a reminder</span>
        )}
      </div>

      <div className="form-row">
        <label htmlFor="task-repeat">Repeats</label>
        <select
          id="task-repeat"
          className="input"
          value={values.repeat}
          onChange={(e) => setValues((v) => ({ ...v, repeat: e.target.value as RecurrenceFreq }))}
          disabled={!values.dueDate}
        >
          <option value="none">Doesn't repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        {!values.dueDate && (
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Set a due date to enable repeating</span>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Add task
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export { TYPE_LABELS };
