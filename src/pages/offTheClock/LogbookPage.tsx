import { useStore } from "../../lib/store";
import { OTC_ALL_ITEMS, type OtcCatalogItem } from "../../lib/offTheClock/catalog";
import StarRating from "../../components/StarRating";

function formatVal(v: number): string {
  return v % 1 === 0 ? String(v) : v.toFixed(1);
}

function LogEntry({ item, rating, note }: { item: OtcCatalogItem; rating: number; note: string }) {
  return (
    <div className="card otc-card">
      <div className="otc-log-row">
        <div className="otc-log-body">
          <h3 className="otc-card-title">
            {item.title} <span className="otc-log-creator">— {item.creator}</span>
          </h3>
          <div className="otc-log-rating-row">
            <StarRating value={rating} onChange={() => {}} disabled size={14} />
            <span className="otc-log-rating-num">{formatVal(rating)}/5</span>
            {item.link && (
              <a className="otc-card-link" href={item.link} target="_blank" rel="noreferrer">
                View ↗
              </a>
            )}
          </div>
          {note && <p className="otc-log-note">“{note}”</p>}
        </div>
      </div>
    </div>
  );
}

export default function LogbookPage() {
  const { data } = useStore();
  const ratings = data.offTheClock.ratings;

  const logged = OTC_ALL_ITEMS.map((item) => ({ item, entry: ratings[item.id] })).filter(
    (x) => x.entry && x.entry.rating > 0 && !x.entry.skipped
  ) as { item: OtcCatalogItem; entry: { rating: number; skipped: boolean; note: string } }[];

  const movies = logged
    .filter((x) => x.item.type === "movie")
    .sort((a, b) => a.item.title.localeCompare(b.item.title));
  const tv = logged
    .filter((x) => x.item.type === "tv")
    .sort((a, b) => a.item.title.localeCompare(b.item.title));
  const albums = logged
    .filter((x) => x.item.type === "album")
    .sort((a, b) => a.item.creator.localeCompare(b.item.creator) || a.item.title.localeCompare(b.item.title));

  const totalLogged = logged.length;

  return (
    <div className="page otc-shell">
      <div className="hero-card">
        <div className="hero-card-eyebrow">Updated through {"Week 34, 2026"}</div>
        <div className="hero-card-value">The Logbook</div>
      </div>
      <p className="otc-intro">
        {totalLogged === 0
          ? "Nothing logged yet. Rate or skip picks on the Catalog page and they'll start showing up here."
          : `Every movie, album, and TV pick you've rated through Off the Clock, in one running record. ${totalLogged} logged so far.`}
      </p>

      <div className="section">
        <div className="section-header">
          <h2>Movies</h2>
          <span className="badge">{movies.length}</span>
        </div>
        {movies.length === 0 ? (
          <p className="empty-state">Nothing logged yet.</p>
        ) : (
          <div className="task-list">
            {movies.map(({ item, entry }) => (
              <LogEntry key={item.id} item={item} rating={entry.rating} note={entry.note} />
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Albums</h2>
          <span className="badge">{albums.length}</span>
        </div>
        {albums.length === 0 ? (
          <p className="empty-state">Nothing logged yet.</p>
        ) : (
          <div className="task-list">
            {albums.map(({ item, entry }) => (
              <LogEntry key={item.id} item={item} rating={entry.rating} note={entry.note} />
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2>TV</h2>
          <span className="badge">{tv.length}</span>
        </div>
        {tv.length === 0 ? (
          <p className="empty-state">Nothing logged yet.</p>
        ) : (
          <div className="task-list">
            {tv.map(({ item, entry }) => (
              <LogEntry key={item.id} item={item} rating={entry.rating} note={entry.note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
