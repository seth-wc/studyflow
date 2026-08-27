import { useState } from "react";
import { useStore } from "../../lib/store";
import { OTC_WEEKS, OTC_ALL_ITEMS, type OtcCatalogItem } from "../../lib/offTheClock/catalog";
import StarRating from "../../components/StarRating";
import type { OffTheClockRatingEntry } from "../../types";

const TYPE_GROUP_LABELS: Record<OtcCatalogItem["type"], string> = {
  movie: "Movies",
  album: "Albums",
  tv: "TV",
};

const RATING_WORD: Record<number, string> = {
  1: "Not for me",
  2: "Meh",
  3: "Good",
  4: "Really liked it",
  5: "Loved it",
};

function formatVal(v: number): string {
  return v % 1 === 0 ? String(v) : v.toFixed(1);
}

function ratingWord(v: number): string {
  return RATING_WORD[Math.ceil(v)] ?? "";
}

function CatalogCard({ item }: { item: OtcCatalogItem }) {
  const { data, updateOtcRating } = useStore();
  const entry: OffTheClockRatingEntry = data.offTheClock.ratings[item.id] ?? {
    rating: 0,
    skipped: false,
    note: "",
  };
  const [note, setNote] = useState(entry.note);

  const rated = entry.rating > 0;

  return (
    <div className="card otc-card">
      <div className="otc-card-top">
        <div>
          <div className="otc-card-type">
            {item.genre} — {item.creator} — {item.year}
          </div>
          <h3 className="otc-card-title">{item.title}</h3>
          {item.link && (
            <a className="otc-card-link" href={item.link} target="_blank" rel="noreferrer">
              View the review ↗
            </a>
          )}
        </div>
        <span
          className={
            "otc-chip" + (entry.skipped ? " otc-chip-skipped" : rated ? " otc-chip-rated" : "")
          }
        >
          {entry.skipped ? "Skipped" : rated ? `${formatVal(entry.rating)}/5 — ${ratingWord(entry.rating)}` : "Not yet rated"}
        </span>
      </div>

      <div className="otc-rate-row">
        <StarRating
          value={entry.rating}
          disabled={entry.skipped}
          onChange={(v) => updateOtcRating(item.id, { rating: v, skipped: false })}
        />
        <button
          type="button"
          className="otc-text-btn"
          onClick={() => updateOtcRating(item.id, { rating: 0, skipped: false })}
        >
          Clear
        </button>
        <button
          type="button"
          className={"otc-text-btn" + (entry.skipped ? " otc-text-btn-active" : "")}
          onClick={() =>
            updateOtcRating(item.id, entry.skipped ? { skipped: false } : { rating: 0, skipped: true })
          }
        >
          {entry.skipped ? "Skipped ↺" : "Skip"}
        </button>
        <input
          type="text"
          className="otc-note"
          placeholder="Add a quick note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => {
            if (note !== entry.note) updateOtcRating(item.id, { note });
          }}
        />
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const { data } = useStore();

  const total = OTC_ALL_ITEMS.length;
  const reviewed = OTC_ALL_ITEMS.filter((it) => {
    const entry = data.offTheClock.ratings[it.id];
    return entry && (entry.rating > 0 || entry.skipped);
  }).length;
  const progressPct = total ? Math.round((reviewed / total) * 100) : 0;

  return (
    <div className="page otc-shell">
      <div className="hero-card">
        <div className="hero-card-eyebrow">Catalog &amp; ratings</div>
        <div className="hero-card-value">{reviewed} / {total} reviewed</div>
        <div className="hero-progress-track">
          <div className="hero-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
      <p className="otc-intro">
        Rate what you've watched or listened to, or skip anything you're not going to get to.
        Changes save automatically and sync across your devices, same as everything else here.
      </p>

      {OTC_WEEKS.map((week) => {
        const byType: Record<string, OtcCatalogItem[]> = {};
        for (const item of week.items) {
          (byType[item.type] ??= []).push(item);
        }
        return (
          <div key={week.week} className="otc-week-block">
            <div className="otc-week-head">
              <h2 className="otc-week-label">{week.label}</h2>
              <span className="otc-week-dates">{week.dates}</span>
            </div>
            {(["movie", "album", "tv"] as const).map((type) => {
              const items = byType[type];
              if (!items || items.length === 0) return null;
              return (
                <div key={type} className="section">
                  <div className="section-header">
                    <h2>{TYPE_GROUP_LABELS[type]}</h2>
                    <span className="badge">{items.length}</span>
                  </div>
                  <div className="task-list">
                    {items.map((item) => (
                      <CatalogCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
