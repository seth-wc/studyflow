import { useEffect, useRef } from "react";
import { useDueReminders } from "../lib/useDueReminders";
import { useStore } from "../lib/store";

export default function ReminderBanner() {
  const { dueTasks, dismiss } = useDueReminders();
  const { data } = useStore();
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    for (const task of dueTasks) {
      if (notifiedRef.current.has(task.id)) continue;
      notifiedRef.current.add(task.id);
      new Notification("StudyFlow reminder", { body: task.title });
    }
  }, [dueTasks]);

  if (dueTasks.length === 0) return null;

  const projectById = Object.fromEntries(data.projects.map((p) => [p.id, p]));

  return (
    <div className="reminder-banner">
      {dueTasks.map((task) => (
        <div key={task.id} className="reminder-item">
          <span>
            🔔 {task.title}
            {task.projectId && projectById[task.projectId] ? ` · ${projectById[task.projectId].name}` : ""}
          </span>
          <button type="button" className="icon-btn" title="Dismiss" onClick={() => dismiss(task.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
