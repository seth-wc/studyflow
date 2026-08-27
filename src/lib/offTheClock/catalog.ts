// Catalog data now lives in catalog.json (plain data, no TypeScript syntax)
// so the weekly automation script can overwrite it directly. This file just
// supplies the types and re-exports it as typed constants for the app.

import catalogData from "./catalog.json";

export interface OtcCatalogItem {
  id: string;
  type: "movie" | "album" | "tv";
  genre: string;
  creator: string;
  title: string;
  year: string;
  link: string | null;
}

export interface OtcWeek {
  week: string;
  label: string;
  dates: string;
  items: OtcCatalogItem[];
}

export const OTC_WEEKS: OtcWeek[] = catalogData.weeks as OtcWeek[];

/** All catalog items across every week, flattened, for quick id lookup
 * (the Logbook and status chips need this regardless of week grouping). */
export const OTC_ALL_ITEMS: OtcCatalogItem[] = OTC_WEEKS.flatMap((w) => w.items);
