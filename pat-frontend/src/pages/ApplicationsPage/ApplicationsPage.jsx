import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../api/client";

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(() => apiRequest("/students/me/applications").then((items) => setApplications(Array.isArray(items) ? items : [])), []);
  useEffect(() => { load().catch((e) => setError(e.message || "Could not load applications from the database.")).finally(() => setLoading(false)); }, [load]);

  return <DashboardLayout>
    <div className="page-heading"><span className="section-eyebrow">YOUR PLACEMENT JOURNEY</span><h1 className="page-title">My applications</h1><p className="page-description">Applications recorded for your student account, loaded directly from the backend.</p></div>
    {error && <p role="alert" className="status-error">{error}</p>}
    <section className="form-panel">
      {loading ? <p className="text-slate-500">Loading applications…</p> : applications.length === 0 ? <div className="empty-state"><span className="text-4xl">📄</span><h2 className="mt-3 text-lg font-bold text-slate-900">No saved applications yet</h2><p className="mt-1 text-sm text-slate-500">Upload a PDF resume, then apply to a live placement drive published by a company account. Older demo applications saved only in this browser are not real database records and cannot be imported as applications.</p></div> : <div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Company</th><th>Role</th><th>Applied on</th><th>Interview round</th><th>Status / outcome</th></tr></thead><tbody>{applications.map((app) => <tr key={app.applicationId}><td className="font-semibold text-slate-900">{app.company}</td><td>{app.role}</td><td>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "—"}</td><td>{app.currentRound ? `Round ${app.currentRound}` : "Awaiting review"}{app.roundNote ? <p className="mt-1 max-w-xs text-xs text-slate-500">{app.roundNote}</p> : null}</td><td><span className={`rounded-full px-3 py-1 text-xs font-bold ${String(app.status).includes("REJECTED") ? "bg-red-50 text-red-700" : String(app.status).includes("SELECTED") ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>{String(app.status || "Applied").replaceAll("_", " ")}</span></td></tr>)}</tbody></table></div>}
    </section>
  </DashboardLayout>;
};
export default ApplicationsPage;
