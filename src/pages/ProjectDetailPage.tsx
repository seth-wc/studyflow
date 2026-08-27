import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../lib/store";
import ProjectForm, { type ProjectFormValues } from "../components/ProjectForm";
import TaskForm, { TYPE_LABELS } from "../components/TaskForm";
import NoteForm, { type NoteFormValues } from "../components/NoteForm";
import ClassScheduleEditor from "../components/ClassScheduleEditor";

const DAY_LABELS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

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
  else label = due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return { label, overdue };
}

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const {
    data,
    updateProject,
    archiveProject,
    addTask,
    toggleTaskDone,
    deleteTask,
    addNote,
    updateNote,
    deleteNote,
  } = useStore();

  const [editingProject, setEditingProject] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const project = data.projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="page">
        <p className="empty-state">This project doesn't exist (maybe it was archived).</p>
        <Link to="/projects" className="btn btn-block" style={{ textAlign: "center", textDecoration: "none" }}>
          Back to Projects
        </Link>
      </div>
    );
  }

  const activeProjects = data.projects.filter((p) => !p.archived);
  const tasks = data.tasks
    .filter((t) => t.projectId === project.id)
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  const notes = data.notes
    .filter((n) => n.projectId === project.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  function handleProjectSave(values: ProjectFormValues) {
    updateProject(project!.id, {
      name: values.name.trim(),
      kind: values.kind,
      code: values.code.trim() || undefined,
      term: values.term.trim() || undefined,
      color: values.color,
    });
    setEditingProject(false);
  }

  function handleNoteSave(values: NoteFormValues) {
    if (editingNoteId) {
      updateNote(editingNoteId, { title: values.title.trim(), body: values.body });
      setEditingNoteId(null);
    } else {
      addNote({ projectId: project!.id, taskId: null, title: values.title.trim(), body: values.body });
    }
    setShowNoteForm(false);
  }

  return (
    <div className="page">
      <Link to="/projects" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
        ← Projects
      </Link>

      {!editingProject && (
        <div
          className="hero-card"
          style={{ background: `linear-gradient(135deg, ${project.color}, var(--accent-2))` }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="project-badge-lg">{project.name.charAt(0).toUpperCase()}</div>
            <div>
              <div className="hero-card-eyebrow">
                {project.kind === "class" ? "Class" : "Personal project"}
                {project.code ? ` · ${project.code}` : ""}
                {project.term ? ` · ${project.term}` : ""}
              </div>
              <div className="hero-card-value">{project.name}</div>
            </div>
          </div>
          <div className="hero-pills" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="hero-pill hero-pill-btn"
              onClick={() => setEditingProject(true)}
            >
              Edit
            </button>
            <button
              type="button"
              className="hero-pill hero-pill-btn"
              onClick={() => {
                archiveProject(project.id);
                navigate("/projects");
              }}
            >
              Archive project
            </button>
          </div>
        </div>
      )}
      {editingProject && (
        <ProjectForm initial={project} onSubmit={handleProjectSave} onCancel={() => setEditingProject(false)} />
      )}

      {project.kind === "class" && (
        <>
          <div className="section-header">
            <h2>Class schedule</h2>
            {!editingSchedule && (
              <button className="btn" onClick={() => setEditingSchedule(true)}>
                Edit
              </button>
            )}
          </div>
          {editingSchedule ? (
            <>
              <ClassScheduleEditor
                sessions={project.classSchedule}
                onChange={(classSchedule) => updateProject(project.id, { classSchedule })}
              />
              <button className="btn btn-primary" onClick={() => setEditingSchedule(false)}>
                Done
              </button>
            </>
          ) : project.classSchedule.length === 0 ? (
            <p className="empty-state">No weekly class times set yet.</p>
          ) : (
            <div className="task-list">
              {[...project.classSchedule]
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
                .map((session) => (
                  <div key={session.id} className="card">
                    <div className="task-title">{DAY_LABELS_FULL[session.dayOfWeek]}</div>
                    <div className="task-meta">
                      <span>
                        {formatTime12h(session.startTime)} – {formatTime12h(session.endTime)}
                      </span>
                      {session.location && <span>{session.location}</span>}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}

      <div className="section-header">
        <h2>Tasks</h2>
        {!showTaskForm && (
          <button className="btn btn-primary" onClick={() => setShowTaskForm(true)}>
            + Add
          </button>
        )}
      </div>
      {showTaskForm && (
        <TaskForm
          projects={activeProjects}
          defaultProjectId={project.id}
          onSubmit={(values) => {
            addTask({
              title: values.title.trim(),
              type: values.type,
              projectId: values.projectId || project.id,
              dueDate: values.dueDate || null,
              reminderAt: values.dueDate && values.reminderTime ? `${values.dueDate}T${values.reminderTime}:00` : null,
              recurrence: values.dueDate && values.repeat !== "none" ? { freq: values.repeat } : null,
              notes: "",
            });
            setShowTaskForm(false);
          }}
          onCancel={() => setShowTaskForm(false)}
        />
      )}
      {tasks.length === 0 && !showTaskForm && (
        <p className="empty-state">No tasks yet for this project.</p>
      )}
      <div className="task-list">
        {tasks.map((task) => {
          const due = formatDue(task.dueDate);
          return (
            <div key={task.id} className="card task-item">
              <input type="checkbox" checked={task.done} onChange={() => toggleTaskDone(task.id)} />
              <div className="task-body">
                <div className={"task-title" + (task.done ? " done" : "")}>{task.title}</div>
                <div className="task-meta">
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
              <button type="button" className="icon-btn" title="Delete" onClick={() => deleteTask(task.id)}>
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <div className="section-header">
        <h2>Notes</h2>
        {!showNoteForm && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingNoteId(null);
              setShowNoteForm(true);
            }}
          >
            + Add
          </button>
        )}
      </div>
      {showNoteForm && (
        <NoteForm
          initial={editingNoteId ? notes.find((n) => n.id === editingNoteId) : undefined}
          onSubmit={handleNoteSave}
          onCancel={() => {
            setShowNoteForm(false);
            setEditingNoteId(null);
          }}
        />
      )}
      {notes.length === 0 && !showNoteForm && <p className="empty-state">No notes yet for this project.</p>}
      <div className="task-list">
        {notes.map((note) => (
          <div key={note.id} className="card">
            <div className="section-header">
              <div className="project-name">{note.title || "Untitled note"}</div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  className="icon-btn"
                  title="Edit"
                  onClick={() => {
                    setEditingNoteId(note.id);
                    setShowNoteForm(true);
                  }}
                >
                  ✎
                </button>
                <button type="button" className="icon-btn" title="Delete" onClick={() => deleteNote(note.id)}>
                  ✕
                </button>
              </div>
            </div>
            {note.body && <p style={{ margin: "8px 0 0", whiteSpace: "pre-wrap" }}>{note.body}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
