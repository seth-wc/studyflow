import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import type { AppData, Project, Task, Note, StudySession, ID, OffTheClockRatingEntry } from "../types";
import { emptyAppData } from "../types";
import { PROJECT_COLORS } from "./colors";
import { nextDueDate } from "./recurrence";
import { db } from "./firebase";
import { OTC_SEED_RATINGS } from "./offTheClock/seedRatings";

// One-time bootstrap: the first time a user's data has no Off the Clock
// ratings yet, seed it from the ratings.json snapshot that already existed
// before this feature was added, so existing history shows up immediately
// instead of starting blank.
function withOtcSeed(data: AppData): AppData {
  if (Object.keys(data.offTheClock.ratings).length > 0) return data;
  return { ...data, offTheClock: { ratings: OTC_SEED_RATINGS } };
}

// This is the single place the rest of the app reads/writes data through.
// It syncs to Firestore, one document per signed-in user at users/{uid}.
// Every component that uses useStore() is unaware of the transport —
// it just sees `data` and a handful of mutator functions.

/** First-run placeholder data: 4 blank classes, ready to rename once real
 * course details are known. Only used the first time a user's document
 * doesn't exist yet (i.e. right after they sign up). */
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

function newId(): ID {
  return crypto.randomUUID();
}

// Firestore's setDoc() throws synchronously if any field in the document is
// `undefined` (e.g. an optional form field like "course code" left blank
// becomes `code: undefined`). Every value in this app's data is plain JSON
// (strings, numbers, booleans, null, arrays, objects — dates are stored as
// ISO strings), so round-tripping through JSON reliably drops those
// `undefined` keys before the document is written.
function sanitizeForFirestore<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
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
  updateOtcRating: (id: string, patch: Partial<OffTheClockRatingEntry>) => void;
  setUsername: (username: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const [data, setDataState] = useState<AppData | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    setDataState(null);
    setSyncError(null);
    const ref = doc(db, "users", uid);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setSyncError(null);
        if (snap.exists()) {
          const merged = { ...emptyAppData, ...(snap.data() as Partial<AppData>) };
          // Applied locally only, deliberately not written back here: a
          // parallel setDoc based on this snapshot could race a setData()
          // call from a user edit that happens moments later (e.g. rating
          // something right after opening the page) and silently overwrite
          // it with this older, seed-only version. The seed persists for
          // real the moment any mutator runs, same as everything else.
          setDataState(withOtcSeed(merged));
        } else {
          // Brand new account — create their document with placeholder data.
          const seeded = seedData();
          setDoc(ref, sanitizeForFirestore(seeded)).catch((err) => {
            console.error("Failed to create initial data", err);
          });
          setDataState(seeded);
        }
      },
      (err) => {
        console.error("Firestore sync error", err);
        setSyncError("Couldn't sync your data — check your connection.");
      }
    );
    return () => unsubscribe();
  }, [uid]);

  // Every mutator below goes through this: apply the change locally, then
  // push the whole (small) document back to Firestore. The onSnapshot
  // listener above will receive our own write back, which is a harmless
  // no-op re-render since the content matches what we already have.
  function setData(updater: (d: AppData) => AppData) {
    setDataState((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      try {
        setDoc(doc(db, "users", uid), sanitizeForFirestore(next)).catch((err) => {
          console.error("Failed to save data", err);
          setSyncError("Couldn't save your last change — check your connection.");
        });
      } catch (err) {
        // setDoc() validates its argument synchronously and throws rather
        // than rejecting for some errors — catch that too so a bad write
        // never crashes the whole app.
        console.error("Failed to save data", err);
        setSyncError("Couldn't save your last change — check your connection.");
      }
      return next;
    });
  }

  if (!data) {
    return (
      <div className="app-shell">
        <div className="page" style={{ paddingTop: 40 }}>
          <p className="page-placeholder">{syncError ?? "Loading your data…"}</p>
        </div>
      </div>
    );
  }

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
    updateOtcRating: (id, patch) => {
      setData((d) => {
        const existing = d.offTheClock.ratings[id] ?? { rating: 0, skipped: false, note: "" };
        return {
          ...d,
          offTheClock: {
            ratings: { ...d.offTheClock.ratings, [id]: { ...existing, ...patch } },
          },
        };
      });
    },
    setUsername: (username) => {
      setData((d) => ({ ...d, profile: { ...d.profile, username } }));
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
