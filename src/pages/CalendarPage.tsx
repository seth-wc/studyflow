import { useState } from "react";
import { useStore } from "../lib/store";

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dayHeading(d: Date, isToday: boolean, isTomorrow: boolean): string {
  if (isToday) return "Today";
  if (isTomorrow) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

const DAYS_AHEAD = 14;

export default function CalendarPage() {
  const { data } = useStore();
  const [notifStatus, setNotifStatus] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );

  const activeProjects = data.projects.filter((p) => !p.archived);
  const projectById = Object.fromEntries(data.projects.map((p) => [p.id, p]));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  function requestNotifications() {
    if (typeof Notification === "undefined") return;
    Notification.requestPermission().then(setNotifStatus);
  }

  return (
    <div className="page">
      <div className="section-header">
        <h1>Calendar</h1>
        {notifStatus === "default" && (
          <button className="btn" onClick={requestNotifications}>
            Enable reminders
          </button>
        )}
      </div>
      {notifStatus === "denied" && (
        <p className="page-placeholder">
          Notifications are blocked for this page — reminders will still show as an in-app banner while the app
          is open.
        </p>
      )}

      <div className="day-group">
        {days.map((day, i) => {
          const iso = toISODate(day);
          const isToday = i === 0;
          const isTomorrow = i === 1;

          const sessions = activeProjects
            .filter((p) => p.kind === "class")
            .flatMap((p) => p.classSchedule.map((s) => ({ session: s, project: p })))
            .filter(({ session }) => session.dayOfWeek === day.getDay())
            .sort((a, b) => a.session.startTime.localeCompare(b.session.startTime));

          const tasksDue = data.tasks.filter((t) => !t.done && t.dueDate === iso);

          if (sessions.length === 0 && tasksDue.length === 0) return null;

          return (
            <div key={iso} className="card">
              <div className={"day-heading" + (isToday ? " day-heading-today" : "")}>
                {dayHeading(day, isToday, isTomorrow)}
              </div>
              {sessions.map(({ session, project }) => (
                <div key={session.id} className="calendar-entry">
                  <span>
                    <span
                      className="project-color-dot"
                      style={{ background: project.color, display: "inline-block", marginRight: 6 }}
                    />
                    {project.name}
                    {session.location ? ` · ${session.location}` : ""}
                  </span>
                  <span className="calendar-entry-time">{formatTime12h(session.startTime)}</span>
                </div>
              ))}
              {tasksDue.map((task) => (
                <div key={task.id} className="calendar-entry">
                  <span>
                    {task.projectId && projectById[task.projectId] && (
                      <span
                        className="project-color-dot"
                        style={{ background: projectById[task.projectId].color, display: "inline-block", marginRight: 6 }}
                      />
                    )}
                    {task.title}
                  </span>
                  <span className="calendar-entry-time">Due</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {days.every((day) => {
        const iso = toISODate(day);
        const hasSessions = activeProjects
          .filter((p) => p.kind === "class")
          .some((p) => p.classSchedule.some((s) => s.dayOfWeek === day.getDay()));
        const hasTasks = data.tasks.some((t) => !t.done && t.dueDate === iso);
        return !hasSessions && !hasTasks;
      }) && (
        <p className="empty-state">
          Nothing on the calendar for the next two weeks — add class times on a project, or due dates on tasks.
        </p>
      )}
    </div>
  );
}
