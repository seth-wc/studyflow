import type { RecurrenceFreq } from "../types";

/** Given a "YYYY-MM-DD" due date, return the next occurrence's due date for
 * the given frequency. Weekly just adds 7 days from the completed date —
 * good enough for "every week" tasks like recurring readings. */
export function nextDueDate(dueDate: string, freq: RecurrenceFreq): string {
  const [y, m, d] = dueDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const days = freq === "daily" ? 1 : freq === "weekly" ? 7 : 0;
  date.setDate(date.getDate() + days);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
