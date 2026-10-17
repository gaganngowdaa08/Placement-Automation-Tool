import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "../pages/LandingPage/LandingPage";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import Dashboard from "../pages/Dashboard/Dashboard";
import DrivesPage from "../pages/DrivesPage/DrivesPage";
import ApplicationsPage from "../pages/ApplicationsPage/ApplicationsPage";
import ResumePage from "../pages/ResumePage/ResumePage";
import AcademicPage from "../pages/AcademicPage/AcademicPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import CompanyDashboard from "../pages/CompanyDashboard/CompanyDashboard";
import CollegeDashboard from "../pages/CollegeDashboard/CollegeDashboard";

function ProtectedRoute({ children, role }) {
  if (!localStorage.getItem("authToken")) return <Navigate to="/login" replace />;
  const activeRole = (localStorage.getItem("authRole") || "student").toLowerCase();
  if (role && activeRole !== role) {
    const destination = activeRole === "company" ? "/company" : activeRole === "college" ? "/college" : activeRole === "student" ? "/dashboard" : "/login";
    return <Navigate to={destination} replace />;
  }
  return children;
}

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute role="student"><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="student"><ProfilePage /></ProtectedRoute>} />
      <Route path="/drives" element={<ProtectedRoute role="student"><DrivesPage /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute role="student"><ApplicationsPage /></ProtectedRoute>} />
      <Route path="/resume" element={<ProtectedRoute role="student"><ResumePage /></ProtectedRoute>} />
      <Route path="/academic" element={<ProtectedRoute role="student"><AcademicPage /></ProtectedRoute>} />
      <Route path="/company" element={<ProtectedRoute role="company"><CompanyDashboard /></ProtectedRoute>} />
      <Route path="/college" element={<ProtectedRoute role="college"><CollegeDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
