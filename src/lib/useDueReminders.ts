import { useEffect, useState } from "react";
import { useStore } from "./store";
import type { Task } from "../types";

const SEEN_KEY = "productivity-app-reminders-seen";

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<string>) {
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
}

/** Polls for tasks whose reminder time has passed and haven't been
 * dismissed yet. This only fires while the app is open in a tab — it is
 * not a background/push notification (that needs the service worker and
 * has real platform limits, especially on iOS). */
export function useDueReminders() {
  const { data } = useStore();
  const [seenVersion, setSeenVersion] = useState(0);
  const [dueTasks, setDueTasks] = useState<Task[]>([]);

  useEffect(() => {
    function check() {
      const seen = loadSeen();
      const now = Date.now();
      const due = data.tasks.filter(
        (t) => !t.done && t.reminderAt && new Date(t.reminderAt).getTime() <= now && !seen.has(t.id)
      );
      setDueTasks(due);
    }
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.tasks, seenVersion]);

  function dismiss(id: string) {
    const seen = loadSeen();
    seen.add(id);
    saveSeen(seen);
    setSeenVersion((v) => v + 1);
  }

  return { dueTasks, dismiss };
}
