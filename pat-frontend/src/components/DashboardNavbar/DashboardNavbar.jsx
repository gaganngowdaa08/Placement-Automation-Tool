import { useNavigate } from "react-router-dom";
const DashboardNavbar = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem("authEmail") || "Student";
  const handleLogout = () => { localStorage.removeItem("authToken"); localStorage.removeItem("authEmail"); localStorage.removeItem("authRole"); navigate("/login", { replace: true }); };
  return <header className="no-print flex min-h-[72px] flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-9"><div><p className="text-sm font-bold text-slate-900">Student Portal</p><p className="text-xs text-slate-500">Placement Automation Tool</p></div><div className="flex items-center gap-3"><span className="hidden max-w-xs truncate text-sm text-slate-500 sm:inline">{email}</span><button type="button" onClick={handleLogout} className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100">Log out</button></div></header>;
};
export default DashboardNavbar;
