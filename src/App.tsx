import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { StoreProvider } from "./lib/store";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import TimerPage from "./pages/TimerPage";
import CalendarPage from "./pages/CalendarPage";

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="timer" element={<TimerPage />} />
            <Route path="calendar" element={<CalendarPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}
