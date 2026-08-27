import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import ProjectForm, { type ProjectFormValues } from "../components/ProjectForm";

export default function ProjectsPage() {
  const { data, addProject, archiveProject } = useStore();
  const [showForm, setShowForm] = useState(false);

  const active = data.projects.filter((p) => !p.archived);
  const taskCount = (projectId: string) =>
    data.tasks.filter((t) => t.projectId === projectId && !t.done).length;

  function handleSubmit(values: ProjectFormValues) {
    addProject({
      name: values.name.trim(),
      kind: values.kind,
      code: values.code.trim() || undefined,
      term: values.term.trim() || undefined,
      color: values.color,
    });
    setShowForm(false);
  }

  return (
    <div className="page">
      <div className="section-header">
        <h1>Projects</h1>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add
          </button>
        )}
      </div>

      {showForm && <ProjectForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />}

      {active.length === 0 && !showForm && (
        <p className="empty-state">No projects yet — add a class or personal project to get started.</p>
      )}

      <div className="task-list">
        {active.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card project-card">
              <span className="project-color-dot" style={{ background: project.color }} />
              <div className="project-meta">
                <div className="project-name">{project.name}</div>
                <div className="project-sub">
                  {project.kind === "class" ? "Class" : "Personal"}
                  {project.code ? ` · ${project.code}` : ""}
                  {project.term ? ` · ${project.term}` : ""}
                </div>
              </div>
              <span className="badge">{taskCount(project.id)} open</span>
              <button
                type="button"
                className="icon-btn"
                title="Archive"
                onClick={(e) => {
                  e.preventDefault();
                  archiveProject(project.id);
                }}
              >
                ✕
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
