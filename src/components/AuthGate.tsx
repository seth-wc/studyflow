import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../lib/useAuth";

export default function AuthGate({ children }: { children: (user: NonNullable<ReturnType<typeof useAuth>["user"]>) => ReactNode }) {
  const { user, authLoading, signUp, signIn } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Leave a clean, empty form behind after signing out, rather than showing
  // the previous session's email/password still sitting in the fields.
  useEffect(() => {
    if (!user) {
      setEmail("");
      setPassword("");
      setError(null);
      setMode("signin");
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="app-shell">
        <div className="page" style={{ paddingTop: 40 }}>
          <p className="page-placeholder">Loading…</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <>{children(user)}</>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fn = mode === "signup" ? signUp : signIn;
    const result = await fn(email.trim(), password);
    setSubmitting(false);
    if (result) setError(result);
  }

  return (
    <div className="app-shell">
      <div className="page" style={{ paddingTop: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <span className="app-title" style={{ fontSize: 24 }}>
            StudyFlow
          </span>
        </div>
        <p className="page-placeholder" style={{ textAlign: "center" }}>
          {mode === "signup" ? "Create an account to sync across your devices." : "Sign in to sync your data."}
        </p>

        <form className="form-grid card" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-row">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && <p style={{ color: "var(--danger)", fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          className="btn btn-block"
          style={{ marginTop: 8 }}
          onClick={() => {
            setMode((m) => (m === "signin" ? "signup" : "signin"));
            setError(null);
          }}
        >
          {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
