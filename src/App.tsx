import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AuthGate from "./components/AuthGate";
import { StoreProvider } from "./lib/store";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import TimerPage from "./pages/TimerPage";
import CalendarPage from "./pages/CalendarPage";
import ThisWeekPage from "./pages/offTheClock/ThisWeekPage";
import CatalogPage from "./pages/offTheClock/CatalogPage";
import LogbookPage from "./pages/offTheClock/LogbookPage";

export default function App() {
  return (
    <HashRouter>
      <AuthGate>
        {(user) => (
          <StoreProvider uid={user.uid}>
            <Routes>
              <Route element={<Layout mode="study" />}>
                <Route index element={<DashboardPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/:projectId" element={<ProjectDetailPage />} />
                <Route path="timer" element={<TimerPage />} />
                <Route path="calendar" element={<CalendarPage />} />
              </Route>
              <Route path="otc" element={<Layout mode="otc" />}>
                <Route index element={<ThisWeekPage />} />
                <Route path="catalog" element={<CatalogPage />} />
                <Route path="logbook" element={<LogbookPage />} />
              </Route>
            </Routes>
          </StoreProvider>
        )}
      </AuthGate>
    </HashRouter>
  );
}
