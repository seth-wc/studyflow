import { OTC_DIGEST, type OtcNewsItem, type OtcPick, type OtcAlbumPick } from "../../lib/offTheClock/digest";

function PickCard({ pick }: { pick: OtcPick }) {
  return (
    <div className="card otc-card">
      <div className="otc-card-type">{pick.meta}</div>
      <h3 className="otc-card-title">{pick.title}</h3>
      <p className="otc-card-body">{pick.body}</p>
      <a className="otc-card-link" href={pick.link} target="_blank" rel="noreferrer">
        {pick.linkLabel} ↗
      </a>
    </div>
  );
}

function AlbumCard({ album }: { album: OtcAlbumPick }) {
  return (
    <div className="card otc-card">
      <div className="otc-card-type">{album.genre}</div>
      <h3 className="otc-card-title">
        {album.artist} — <em>{album.title}</em>
      </h3>
      <p className="otc-card-body">{album.body}</p>
      <a className="otc-card-link" href={album.link} target="_blank" rel="noreferrer">
        View the review ↗
      </a>
    </div>
  );
}

function NewsCard({ item }: { item: OtcNewsItem }) {
  return (
    <div className="card otc-card">
      <div className="otc-card-type">{item.tag}</div>
      <h3 className="otc-card-title">
        <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="otc-headline-link">
          {item.headline}
        </a>
      </h3>
      <p className="otc-card-body">{item.body}</p>
      <a className="otc-card-link" href={item.sourceUrl} target="_blank" rel="noreferrer">
        Source: {item.sourceName} ↗
      </a>
    </div>
  );
}

export default function ThisWeekPage() {
  const d = OTC_DIGEST;
  return (
    <div className="page otc-shell">
      <div className="hero-card">
        <div className="hero-card-eyebrow">{d.dateRange}</div>
        <div className="hero-card-value">Off the Clock — {d.week}</div>
      </div>
      <p className="otc-intro">{d.standfirst}</p>

      <div className="section">
        <div className="section-header">
          <h2>Movies of the Week</h2>
          <span className="badge">{d.movies.length}</span>
        </div>
        <div className="task-list">
          {d.movies.map((m) => (
            <PickCard key={m.title} pick={m} />
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Albums of the Week</h2>
          <span className="badge">{d.albums.length}</span>
        </div>
        <div className="task-list">
          {d.albums.map((a) => (
            <AlbumCard key={a.title} album={a} />
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>TV Pick</h2>
        </div>
        <div className="task-list">
          <PickCard pick={d.tvPick} />
        </div>
      </div>

      {d.catchUp.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>Catch Up</h2>
            <span className="badge">{d.catchUp.length}</span>
          </div>
          <p className="otc-intro" style={{ marginTop: -8 }}>
            Still unrated and unskipped a week later — carried over from last week.
          </p>
          <div className="task-list">
            {d.catchUp.map((c) => (
              <PickCard key={c.title} pick={c} />
            ))}
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <h2>World News</h2>
          <span className="badge">{d.worldNews.length}</span>
        </div>
        <div className="task-list">
          {d.worldNews.map((n) => (
            <NewsCard key={n.headline} item={n} />
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Australia / Melbourne</h2>
          <span className="badge">{d.auNews.length}</span>
        </div>
        <div className="task-list">
          {d.auNews.map((n) => (
            <NewsCard key={n.headline} item={n} />
          ))}
        </div>
      </div>
    </div>
  );
}
