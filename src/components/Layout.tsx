import { NavLink, Outlet } from "react-router-dom";
import ReminderBanner from "./ReminderBanner";
import { useAuth } from "../lib/useAuth";

const STUDY_NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/tasks", label: "Tasks" },
  { to: "/projects", label: "Projects" },
  { to: "/timer", label: "Timer" },
  { to: "/calendar", label: "Calendar" },
];

const OTC_NAV_ITEMS = [
  { to: "/otc", label: "This Week", end: true },
  { to: "/otc/catalog", label: "Catalog & Ratings" },
  { to: "/otc/logbook", label: "Logbook" },
];

export default function Layout({ mode }: { mode: "study" | "otc" }) {
  const { signOut } = useAuth();
  const navItems = mode === "otc" ? OTC_NAV_ITEMS : STUDY_NAV_ITEMS;
  const brand = mode === "otc" ? "Off the Clock" : "StudyFlow";

  return (
    <div className={"app-shell" + (mode === "otc" ? " otc-shell" : "")}>
      <nav className="app-nav">
        <div className={"app-nav-brand" + (mode === "otc" ? " app-nav-brand-otc" : "")}>{brand}</div>
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
          <span className={"app-title" + (mode === "otc" ? " app-title-otc" : "")}>{brand}</span>
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
          <div className="mode-switch">
            <NavLink
              to="/"
              end
              className={({ isActive }) => "mode-switch-item" + (isActive ? " mode-switch-item-active" : "")}
            >
              Study
            </NavLink>
            <NavLink
              to="/otc"
              className={({ isActive }) => "mode-switch-item" + (isActive ? " mode-switch-item-active" : "")}
            >
              Off the Clock
            </NavLink>
          </div>
          {mode === "study" && <ReminderBanner />}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
