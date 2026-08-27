import { NavLink, Outlet } from "react-router-dom";
import ReminderBanner from "./ReminderBanner";
import { useAuth } from "../lib/useAuth";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/tasks", label: "Tasks" },
  { to: "/projects", label: "Projects" },
  { to: "/timer", label: "Timer" },
  { to: "/calendar", label: "Calendar" },
];

export default function Layout() {
  const { signOut } = useAuth();
  return (
    <div className="app-shell">
      <nav className="app-nav">
        <div className="app-nav-brand">StudyFlow</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => "nav-item" + (isActive ? " nav-item-active" : "")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="app-main">
        <header className="app-header">
          <span className="app-title">StudyFlow</span>
          <button
            type="button"
            className="btn"
            style={{ marginLeft: "auto", fontSize: 13, padding: "4px 10px" }}
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </header>
        <main className="app-content">
          <ReminderBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
