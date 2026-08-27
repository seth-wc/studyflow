import { useState } from "react";
import type { Project, ProjectKind } from "../types";
import { PROJECT_COLORS } from "../lib/colors";

export interface ProjectFormValues {
  name: string;
  kind: ProjectKind;
  code: string;
  term: string;
  color: string;
}

const defaultValues: ProjectFormValues = {
  name: "",
  kind: "class",
  code: "",
  term: "",
  color: PROJECT_COLORS[0],
};

export default function ProjectForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Project;
  onSubmit: (values: ProjectFormValues) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<ProjectFormValues>(
    initial
      ? {
          name: initial.name,
          kind: initial.kind,
          code: initial.code ?? "",
          term: initial.term ?? "",
          color: initial.color,
        }
      : defaultValues
  );

  return (
    <form
      className="form-grid card"
      onSubmit={(e) => {
        e.preventDefault();
        if (!values.name.trim()) return;
        onSubmit(values);
      }}
    >
      <div className="form-row">
        <label htmlFor="project-name">Name</label>
        <input
          id="project-name"
          className="input"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          placeholder="e.g. Class 1, Guitar practice"
          autoFocus
        />
      </div>

      <div className="form-row">
        <label htmlFor="project-kind">Type</label>
        <select
          id="project-kind"
          className="input"
          value={values.kind}
          onChange={(e) => setValues((v) => ({ ...v, kind: e.target.value as ProjectKind }))}
        >
          <option value="class">Class</option>
          <option value="personal">Personal project</option>
        </select>
      </div>

      {values.kind === "class" && (
        <div className="form-row">
          <label htmlFor="project-code">Course code (optional)</label>
          <input
            id="project-code"
            className="input"
            value={values.code}
            onChange={(e) => setValues((v) => ({ ...v, code: e.target.value }))}
            placeholder="e.g. COMP101"
          />
        </div>
      )}

      <div className="form-row">
        <label htmlFor="project-term">Term (optional)</label>
        <input
          id="project-term"
          className="input"
          value={values.term}
          onChange={(e) => setValues((v) => ({ ...v, term: e.target.value }))}
          placeholder="e.g. 2026 Semester 2"
        />
      </div>

      <div className="form-row">
        <label>Color</label>
        <div className="color-picker">
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={"color-swatch" + (values.color === c ? " color-swatch-selected" : "")}
              style={{ background: c }}
              aria-label={`Color ${c}`}
              onClick={() => setValues((v) => ({ ...v, color: c }))}
            />
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Save
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
