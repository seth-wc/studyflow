// Core data model for the app. Kept plain and serializable so it can be
// stored locally now and swapped to a Firestore-backed store later without
// changing the shape of the data anywhere else in the app.

export type ID = string;

export type ProjectKind = "class" | "personal";

/** A single recurring weekly meeting time for a class-type project. */
export interface ClassSession {
  id: ID;
  dayOfWeek: number; // 0 = Sunday ... 6 = Saturday
  startTime: string; // "HH:MM", 24h
  endTime: string; // "HH:MM", 24h
  location?: string;
}

export interface Project {
  id: ID;
  name: string;
  kind: ProjectKind; // "class" unlocks the schedule fields; "personal" is a plain project
  code?: string; // e.g. "COMP101", only relevant for classes
  color: string; // hex, used for tagging tasks/events by project
  term?: string; // e.g. "2026 Semester 2"
  classSchedule: ClassSession[]; // recurring weekly meeting times; empty for personal projects
  archived: boolean;
}

export type TaskType = "assignment" | "reading" | "exam" | "before-class" | "other";

export type RecurrenceFreq = "none" | "daily" | "weekly";

export interface Recurrence {
  freq: RecurrenceFreq;
  /** For weekly recurrence: which days it repeats on (0=Sun..6=Sat). */
  weekdays?: number[];
}

export interface Task {
  id: ID;
  projectId: ID | null; // null = not tied to a project
  title: string;
  type: TaskType;
  dueDate: string | null; // ISO date string
  reminderAt: string | null; // ISO datetime string; when to notify ahead of the due date/class
  recurrence: Recurrence | null;
  done: boolean;
  notes: string;
  createdAt: string; // ISO datetime
}

export interface Note {
  id: ID;
  projectId: ID | null;
  taskId: ID | null; // optionally tied to a specific task rather than the whole project
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: ID;
  projectId: ID | null;
  taskId: ID | null;
  startedAt: string; // ISO datetime
  durationMinutes: number;
}

/** A viewer's rating/skip/note for one Off the Clock catalog item (movie,
 * album, or TV pick), keyed by that item's catalog id. */
export interface OffTheClockRatingEntry {
  rating: number; // 0-5, in 0.5 steps; 0 = not yet rated
  skipped: boolean;
  note: string;
}

export interface OffTheClockData {
  ratings: Record<string, OffTheClockRatingEntry>;
}

export interface AppData {
  projects: Project[];
  tasks: Task[];
  notes: Note[];
  studySessions: StudySession[];
  offTheClock: OffTheClockData;
}

export const emptyAppData: AppData = {
  projects: [],
  tasks: [],
  notes: [],
  studySessions: [],
  offTheClock: { ratings: {} },
};
