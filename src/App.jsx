import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { AuthLayout } from "./components/layout/AuthLayout.jsx";
import { AppLayout } from "./components/layout/AppLayout.jsx";
import { ProjectLayout } from "./components/layout/ProjectLayout.jsx";

import LoginPage from "./pages/Auth/LoginPage.jsx";
import RegisterPage from "./pages/Auth/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage.jsx";
import DashboardPage from "./pages/Dashboard/DashboardPage.jsx";
import ProjectOverviewPage from "./pages/Project/ProjectOverviewPage.jsx";
import ProjectSettingsPage from "./pages/Project/ProjectSettingsPage.jsx";
import ProjectTeamPage from "./pages/Project/ProjectTeamPage.jsx";
import ErdRedirectPage from "./pages/Project/ErdRedirectPage.jsx";
import ErdPage from "./pages/ERD/ErdPage.jsx";
import ApiDocsPage from "./pages/API/ApiDocsPage.jsx";
import CommentsPage from "./pages/Comments/CommentsPage.jsx";
import ActivityPage from "./pages/Activity/ActivityPage.jsx";
import NotificationsPage from "./pages/Notifications/NotificationsPage.jsx";
import InviteAcceptPage from "./pages/Invite/InviteAcceptPage.jsx";
import AccountPage from "./pages/Account/AccountPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProjectReportPage from "./pages/Project/ProjectReportPage.jsx";
import AllProjectsReportPage from "./pages/Reports/AllProjectsReportPage.jsx";
import ProjectsPage from "./pages/Projects/ProjectsPage.jsx";

function OldProjectRedirect() {
  const { projectId } = useParams();
  const { pathname } = useLocation();
  const base = `/project/${projectId}`;
  const suffix = pathname.startsWith(base) ? pathname.slice(base.length) : "";
  return <Navigate to={`/projects/${projectId}${suffix}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/project/:projectId/*" element={<OldProjectRedirect />} />

      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/reports" element={<AllProjectsReportPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/invite" element={<InviteAcceptPage />} />
        <Route path="/projects/:projectId" element={<ProjectLayout />}>
          <Route index element={<ProjectOverviewPage />} />
          <Route path="settings" element={<ProjectSettingsPage />} />
          <Route path="team" element={<ProjectTeamPage />} />
          <Route path="whiteboard" element={<ErdPage />} />
          <Route path="erd" element={<ErdRedirectPage />} />
          <Route path="api" element={<ApiDocsPage />} />
          <Route path="comments" element={<CommentsPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="report" element={<ProjectReportPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
