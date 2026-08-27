import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AppData, Project, Task, Note, StudySession, ID } from "../types";
import { emptyAppData } from "../types";
import { PROJECT_COLORS } from "./colors";
import { nextDueDate } from "./recurrence";

// This is the single place the rest of the app reads/writes data through.
// Right now it persists to localStorage. When Firebase sync is added, only
// this file needs to change (load/save + real-time subscription) — every
// component that uses useStore() keeps working unchanged.

const STORAGE_KEY = "productivity-app-data-v2";

/** First-run placeholder data: 4 blank classes, ready to rename once real
 * course details are known. Only used when there's nothing saved yet. */
function seedData(): AppData {
  const placeholderClasses: Project[] = [1, 2, 3, 4].map((n) => ({
    id: crypto.randomUUID(),
    name: `Class ${n}`,
    kind: "class",
    color: PROJECT_COLORS[(n - 1) % PROJECT_COLORS.length],
    archived: false,
    classSchedule: [],
  }));
  return { ...emptyAppData, projects: placeholderClasses };
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData();
    const parsed = JSON.parse(raw);
    return { ...emptyAppData, ...parsed };
  } catch {
    return seedData();
  }
}

function save(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function newId(): ID {
  return crypto.randomUUID();
}

interface StoreContextValue {
  data: AppData;
  addProject: (project: Omit<Project, "id" | "archived" | "classSchedule"> & { classSchedule?: Project["classSchedule"] }) => Project;
  updateProject: (id: ID, patch: Partial<Project>) => void;
  archiveProject: (id: ID) => void;
  addTask: (task: Omit<Task, "id" | "done" | "createdAt">) => Task;
  updateTask: (id: ID, patch: Partial<Task>) => void;
  toggleTaskDone: (id: ID) => void;
  deleteTask: (id: ID) => void;
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => Note;
  updateNote: (id: ID, patch: Partial<Omit<Note, "id" | "createdAt">>) => void;
  deleteNote: (id: ID) => void;
  addStudySession: (session: Omit<StudySession, "id">) => StudySession;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load);

  useEffect(() => {
    save(data);
  }, [data]);

  const value: StoreContextValue = {
    data,
    addProject: (project) => {
      const newProject: Project = {
        ...project,
        id: newId(),
        archived: false,
        classSchedule: project.classSchedule ?? [],
      };
      setData((d) => ({ ...d, projects: [...d.projects, newProject] }));
      return newProject;
    },
    updateProject: (id, patch) => {
      setData((d) => ({
        ...d,
        projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }));
    },
    archiveProject: (id) => {
      setData((d) => ({
        ...d,
        projects: d.projects.map((p) => (p.id === id ? { ...p, archived: true } : p)),
      }));
    },
    addTask: (task) => {
      const newTask: Task = {
        ...task,
        id: newId(),
        done: false,
        createdAt: new Date().toISOString(),
      };
      setData((d) => ({ ...d, tasks: [...d.tasks, newTask] }));
      return newTask;
    },
    updateTask: (id, patch) => {
      setData((d) => ({
        ...d,
        tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      }));
    },
    toggleTaskDone: (id) => {
      setData((d) => {
        const task = d.tasks.find((t) => t.id === id);
        if (!task) return d;
        const nowDone = !task.done;
        let tasks = d.tasks.map((t) => (t.id === id ? { ...t, done: nowDone } : t));

        // Completing a recurring task spawns the next occurrence, rolling the
        // due date forward — so the list always has just one live instance
        // rather than pre-generating a pile of future ones.
        if (nowDone && task.recurrence && task.recurrence.freq !== "none" && task.dueDate) {
          const spawned: Task = {
            ...task,
            id: newId(),
            done: false,
            dueDate: nextDueDate(task.dueDate, task.recurrence.freq),
            createdAt: new Date().toISOString(),
          };
          tasks = [...tasks, spawned];
        }

        return { ...d, tasks };
      });
    },
    deleteTask: (id) => {
      setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }));
    },
    addNote: (note) => {
      const now = new Date().toISOString();
      const newNote: Note = { ...note, id: newId(), createdAt: now, updatedAt: now };
      setData((d) => ({ ...d, notes: [...d.notes, newNote] }));
      return newNote;
    },
    updateNote: (id, patch) => {
      setData((d) => ({
        ...d,
        notes: d.notes.map((n) =>
          n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n
        ),
      }));
    },
    deleteNote: (id) => {
      setData((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== id) }));
    },
    addStudySession: (session) => {
      const newSession: StudySession = { ...session, id: newId() };
      setData((d) => ({ ...d, studySessions: [...d.studySessions, newSession] }));
      return newSession;
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
