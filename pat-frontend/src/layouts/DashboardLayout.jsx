import Sidebar from "../components/Sidebar/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar/DashboardNavbar";

const DashboardLayout = ({ children }) => <div className="dashboard-shell min-h-screen bg-slate-50 md:flex">
  <aside className="no-print w-full shrink-0 bg-slate-950 text-white md:sticky md:top-0 md:h-screen md:w-64"><Sidebar /></aside>
  <div className="min-w-0 flex-1"><DashboardNavbar /><main className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 lg:px-9 lg:py-9">{children}</main></div>
</div>;
export default DashboardLayout;
