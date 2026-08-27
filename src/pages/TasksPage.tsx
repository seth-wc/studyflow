import { useMemo, useState } from "react";
import { useStore } from "../lib/store";
import TaskForm, { TYPE_LABELS } from "../components/TaskForm";

function formatDue(dueDate: string | null): { label: string; overdue: boolean } | null {
  if (!dueDate) return null;
  const due = new Date(dueDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
  const overdue = diffDays < 0;
  let label: string;
  if (diffDays === 0) label = "Today";
  else if (diffDays === 1) label = "Tomorrow";
  else if (overdue) label = `${Math.abs(diffDays)}d overdue`;
  else if (diffDays <= 7) label = `In ${diffDays}d`;
  else label = due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return { label, overdue };
}

export default function TasksPage() {
  const { data, addTask, toggleTaskDone, deleteTask } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [filterProjectId, setFilterProjectId] = useState<string>("all");
  const [showDone, setShowDone] = useState(false);

  const activeProjects = data.projects.filter((p) => !p.archived);
  const projectById = useMemo(
    () => Object.fromEntries(data.projects.map((p) => [p.id, p])),
    [data.projects]
  );

  const tasks = data.tasks
    .filter((t) => showDone || !t.done)
    .filter((t) => filterProjectId === "all" || t.projectId === filterProjectId)
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

  return (
    <div className="page">
      <div className="section-header">
        <h1>Tasks</h1>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add
          </button>
        )}
      </div>

      {showForm && (
        <TaskForm
          projects={activeProjects}
          onSubmit={(values) => {
            addTask({
              title: values.title.trim(),
              type: values.type,
              projectId: values.projectId || null,
              dueDate: values.dueDate || null,
              reminderAt: values.dueDate && values.reminderTime ? `${values.dueDate}T${values.reminderTime}:00` : null,
              recurrence: values.dueDate && values.repeat !== "none" ? { freq: values.repeat } : null,
              notes: "",
            });
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="chip-row">
        <button
          className={"chip" + (filterProjectId === "all" ? " chip-active" : "")}
          onClick={() => setFilterProjectId("all")}
        >
          All
        </button>
        {activeProjects.map((p) => (
          <button
            key={p.id}
            className={"chip" + (filterProjectId === p.id ? " chip-active" : "")}
            onClick={() => setFilterProjectId(p.id)}
          >
            {p.name}
          </button>
        ))}
        <button
          className={"chip" + (showDone ? " chip-active" : "")}
          onClick={() => setShowDone((s) => !s)}
        >
          {showDone ? "Hide done" : "Show done"}
        </button>
      </div>

      {tasks.length === 0 && <p className="empty-state">Nothing here — add a task to get started.</p>}

      <div className="task-list">
        {tasks.map((task) => {
          const project = task.projectId ? projectById[task.projectId] : null;
          const due = formatDue(task.dueDate);
          return (
            <div key={task.id} className="card task-item">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTaskDone(task.id)}
              />
              <div
                className="project-badge"
                style={{ background: project?.color ?? "var(--text-muted)" }}
              >
                {(project?.name ?? task.title).charAt(0).toUpperCase()}
              </div>
              <div className="task-body">
                <div className={"task-title" + (task.done ? " done" : "")}>{task.title}</div>
                <div className="task-meta">
                  {project && <span>{project.name}</span>}
                  <span>{TYPE_LABELS[task.type]}</span>
                  {task.recurrence && task.recurrence.freq !== "none" && (
                    <span>↻ {task.recurrence.freq}</span>
                  )}
                </div>
              </div>
              {due && (
                <span
                  className={
                    "badge task-item-trailing" + (due.overdue && !task.done ? " badge-overdue" : "")
                  }
                >
                  {due.label}
                </span>
              )}
              <button
                type="button"
                className="icon-btn"
                title="Delete"
                onClick={() => deleteTask(task.id)}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
