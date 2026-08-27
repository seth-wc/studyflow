import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { TYPE_LABELS } from "../components/TaskForm";

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dueLabel(dueDate: string | null): { label: string; overdue: boolean } | null {
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
  else label = due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return { label, overdue };
}

export default function DashboardPage() {
  const { data } = useStore();
  const projectById = Object.fromEntries(data.projects.map((p) => [p.id, p]));

  const openTasks = data.tasks.filter((t) => !t.done);
  const overdue = openTasks.filter((t) => t.dueDate && t.dueDate < new Date().toISOString().slice(0, 10));
  const dueToday = openTasks.filter((t) => t.dueDate === new Date().toISOString().slice(0, 10));

  const upcoming = [...openTasks]
    .filter((t) => t.dueDate)
    .sort((a, b) => (a.dueDate as string).localeCompare(b.dueDate as string))
    .slice(0, 6);

  const todayMinutes = data.studySessions
    .filter((s) => new Date(s.startedAt).getTime() >= startOfToday())
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="page">
      <h1>{greeting}</h1>

      <div className="stat-row">
        <div className="card stat-tile">
          <div className="stat-value">{dueToday.length}</div>
          <div className="stat-label">Due today</div>
        </div>
        <div className="card stat-tile">
          <div className="stat-value">{overdue.length}</div>
          <div className="stat-label">Overdue</div>
        </div>
        <div className="card stat-tile">
          <div className="stat-value">{todayMinutes}m</div>
          <div className="stat-label">Studied today</div>
        </div>
      </div>

      <div className="section-header">
        <h2 style={{ marginTop: 8 }}>Coming up</h2>
        <Link to="/tasks" className="badge" style={{ textDecoration: "none" }}>
          View all
        </Link>
      </div>

      {upcoming.length === 0 && (
        <p className="empty-state">Nothing due yet — add a task to see it here.</p>
      )}

      <div className="task-list">
        {upcoming.map((task) => {
          const project = task.projectId ? projectById[task.projectId] : null;
          const due = dueLabel(task.dueDate);
          return (
            <div key={task.id} className="card task-item">
              <div className="task-body">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                  {project && (
                    <span>
                      <span
                        className="project-color-dot"
                        style={{ background: project.color, display: "inline-block", marginRight: 4 }}
                      />
                      {project.name}
                    </span>
                  )}
                  <span>{TYPE_LABELS[task.type]}</span>
                  {due && <span className={due.overdue ? "task-meta-overdue" : ""}>{due.label}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
