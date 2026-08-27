import { NavLink, Outlet } from "react-router-dom";
import ReminderBanner from "./ReminderBanner";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/tasks", label: "Tasks" },
  { to: "/projects", label: "Projects" },
  { to: "/timer", label: "Timer" },
  { to: "/calendar", label: "Calendar" },
];

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">StudyFlow</span>
      </header>
      <main className="app-content">
        <ReminderBanner />
        <Outlet />
      </main>
      <nav className="app-nav">
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
    </div>
  );
}
