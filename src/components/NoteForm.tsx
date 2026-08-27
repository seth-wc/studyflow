import { useState } from "react";
import type { Note } from "../types";

export interface NoteFormValues {
  title: string;
  body: string;
}

export default function NoteForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Note;
  onSubmit: (values: NoteFormValues) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<NoteFormValues>({
    title: initial?.title ?? "",
    body: initial?.body ?? "",
  });

  return (
    <form
      className="form-grid card"
      onSubmit={(e) => {
        e.preventDefault();
        if (!values.title.trim() && !values.body.trim()) return;
        onSubmit(values);
      }}
    >
      <div className="form-row">
        <label htmlFor="note-title">Title (optional)</label>
        <input
          id="note-title"
          className="input"
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          placeholder="e.g. Lecture 3 summary"
          autoFocus
        />
      </div>
      <div className="form-row">
        <label htmlFor="note-body">Note</label>
        <textarea
          id="note-body"
          className="input"
          rows={5}
          value={values.body}
          onChange={(e) => setValues((v) => ({ ...v, body: e.target.value }))}
          placeholder="Write anything..."
        />
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
