import { NavLink } from "react-router-dom";

const links = [
  ["/dashboard", "▦", "Dashboard"], ["/profile", "♙", "Profile"], ["/drives", "▤", "Placement drives"],
  ["/applications", "▧", "My applications"], ["/resume", "⇧", "Resume library"],
];
const Sidebar = () => <div className="flex h-full flex-col px-4 py-5 md:px-5 md:py-7">
  <div className="mb-7 flex items-center gap-3 px-2"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-black">PAT</div><div><h2 className="text-lg font-extrabold tracking-tight">Placement Portal</h2><p className="text-xs text-slate-400">Student workspace</p></div></div>
  <nav className="flex flex-row gap-1 overflow-x-auto pb-1 md:flex-col md:gap-1.5">{links.map(([to, icon, title]) => <NavLink key={to} to={to} className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><span className="w-5 text-center text-base">{icon}</span><span>{title}</span></NavLink>)}</nav>
  <div className="mt-auto hidden rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-slate-400 md:block"><p className="font-bold text-slate-200">Keep your profile ready</p><p className="mt-1">Save academics and upload a PDF resume before applying to live drives.</p></div>
</div>;
export default Sidebar;
