import { useMemo, useState, type FormEvent } from "react";
import { useStore } from "../lib/store";
import { useAuth } from "../lib/useAuth";
import { useForumPosts } from "../lib/useForumPosts";

type SortMode = "date" | "location" | "username";

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return (
    d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) +
    " at " +
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
  );
}

export default function ForumPage() {
  const { data, setUsername } = useStore();
  const { user } = useAuth();
  const { posts, loading, error, addPost, deletePost } = useForumPosts();

  const username = data.profile.username;
  const [nameDraft, setNameDraft] = useState(username);
  const [location, setLocation] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("date");

  function handleSaveName(e: FormEvent) {
    e.preventDefault();
    setUsername(nameDraft.trim());
  }

  async function handlePost(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!username.trim()) {
      setPostError("Set a display name above before posting.");
      return;
    }
    if (!driveLink.trim() || !location.trim()) return;
    setPosting(true);
    setPostError(null);
    try {
      await addPost({
        authorUid: user.uid,
        authorName: username.trim(),
        location: location.trim(),
        driveLink: driveLink.trim(),
      });
      setLocation("");
      setDriveLink("");
    } catch (err) {
      console.error("Failed to post", err);
      setPostError("Couldn't post — check your connection and try again.");
    } finally {
      setPosting(false);
    }
  }

  const sortedPosts = useMemo(() => {
    const copy = [...posts];
    if (sortMode === "date") {
      copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (sortMode === "location") {
      copy.sort(
        (a, b) => a.location.localeCompare(b.location) || b.createdAt.localeCompare(a.createdAt)
      );
    } else {
      copy.sort(
        (a, b) => a.authorName.localeCompare(b.authorName) || b.createdAt.localeCompare(a.createdAt)
      );
    }
    return copy;
  }, [posts, sortMode]);

  return (
    <div className="page">
      <div className="hero-card">
        <div className="hero-card-eyebrow">Shared with everyone signed in to StudyFlow</div>
        <div className="hero-card-value">Photo Forum</div>
      </div>
      <p className="otc-intro">
        Share a photo by posting a link to it — upload it wherever's easiest (Google Drive, Imgur,
        etc.), set sharing to "Anyone with the link," and paste the link below. Everyone signed in
        can see what's posted here; your ratings and other data stay private as always.
      </p>

      <form className="form-grid card" onSubmit={handleSaveName} style={{ marginBottom: 16 }}>
        <div className="form-row">
          <label htmlFor="forum-username">Your display name</label>
          <input
            id="forum-username"
            type="text"
            className="input"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="What should other people see?"
            maxLength={60}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn" disabled={nameDraft.trim() === username}>
            Save name
          </button>
        </div>
      </form>

      <form className="form-grid card" onSubmit={handlePost} style={{ marginBottom: 16 }}>
        <div className="form-row">
          <label htmlFor="forum-drive-link">Photo link</label>
          <input
            id="forum-drive-link"
            type="url"
            className="input"
            value={driveLink}
            onChange={(e) => setDriveLink(e.target.value)}
            placeholder="https://drive.google.com/..."
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="forum-location">Location</label>
          <input
            id="forum-location"
            type="text"
            className="input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where was this taken?"
            maxLength={120}
            required
          />
        </div>
        {postError && (
          <p style={{ color: "var(--danger)", fontSize: 13, margin: 0 }}>{postError}</p>
        )}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={posting}>
            {posting ? "Posting…" : "Post"}
          </button>
        </div>
      </form>

      <div className="section">
        <div className="section-header">
          <h2>Posts</h2>
          <span className="badge">{posts.length}</span>
        </div>

        <div className="form-row" style={{ maxWidth: 240, marginBottom: 12 }}>
          <label htmlFor="forum-sort">Sort by</label>
          <select
            id="forum-sort"
            className="input"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
          >
            <option value="date">Date posted (newest first)</option>
            <option value="location">Location (A–Z)</option>
            <option value="username">Username (A–Z)</option>
          </select>
        </div>

        {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}

        {loading ? (
          <p className="empty-state">Loading posts…</p>
        ) : sortedPosts.length === 0 ? (
          <p className="empty-state">No photos posted yet — be the first!</p>
        ) : (
          <div className="task-list">
            {sortedPosts.map((post) => (
              <div key={post.id} className="card otc-card">
                <div className="otc-card-top">
                  <div>
                    <div className="otc-card-type">
                      {post.location} — {formatTimestamp(post.createdAt)}
                    </div>
                    <h3 className="otc-card-title">{post.authorName}</h3>
                  </div>
                  <a className="otc-card-link" href={post.driveLink} target="_blank" rel="noreferrer">
                    View photo ↗
                  </a>
                </div>
                {user && post.authorUid === user.uid && (
                  <button
                    type="button"
                    className="icon-btn"
                    title="Delete"
                    onClick={() => deletePost(post.id)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
