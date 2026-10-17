import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../api/client";

const emptyProfile = { collegeName: "", description: "" };

const CollegeDashboard = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState([]);
  const [reviewNote, setReviewNote] = useState("");
  const [outcomes, setOutcomes] = useState([]);

  useEffect(() => {
    Promise.all([apiRequest("/college/me/profile"), apiRequest("/college/me/profile/requests"), apiRequest("/college/me/profile/outcomes")])
      .then(([data, pending, savedOutcomes]) => { setForm({ ...emptyProfile, ...data }); setRequests(Array.isArray(pending) ? pending : []); setOutcomes(Array.isArray(savedOutcomes) ? savedOutcomes : []); })
      .catch((requestError) => setError(requestError.message || "Could not load college details."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const saved = await apiRequest("/college/me/profile", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setForm({ collegeName: saved.collegeName || "", description: saved.description || "" });
      setMessage("College profile saved to the database.");
    } catch (requestError) {
      setError(requestError.message || "Could not save college details.");
    } finally {
      setSaving(false);
    }
  };

  const reviewRequest = async (jobId, decision) => {
    setError(""); setMessage("");
    try {
      await apiRequest(`/college/me/profile/requests/${jobId}/decision`, { method: "POST", body: JSON.stringify({ decision, note: reviewNote }) });
      setRequests((current) => current.filter((job) => job.jobId !== jobId));
      setReviewNote("");
      setMessage(`Placement request ${decision.toLowerCase()}.`);
    } catch (requestError) { setError(requestError.message || "Could not update placement request."); }
  };

  const handleLogout = () => {
    ["authToken", "authEmail", "authRole"].forEach((key) => localStorage.removeItem(key));
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="no-print flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:px-10">
        <Link to="/" className="text-lg font-extrabold text-slate-900">
          PAT<span className="text-blue-700">.</span> College Workspace
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:inline">{localStorage.getItem("authEmail")}</span>
          <button onClick={handleLogout} className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100">
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="page-heading">
          <span className="section-eyebrow">COLLEGE ACCOUNT</span>
          <h1 className="page-title">Institution workspace</h1>
          <p className="page-description">Maintain the college profile associated with this login. Details are loaded from and stored in MySQL.</p>
        </div>

        {error && <p role="alert" className="status-error">{error}</p>}
        {message && <p role="status" className="status-success">✓ {message}</p>}

        <form onSubmit={handleSave} className="form-panel max-w-3xl">
          {loading ? (
            <p className="text-slate-500">Loading institution details…</p>
          ) : (
            <>
              <h2 className="mb-5 text-xl font-extrabold text-slate-900">Institution details</h2>
              <label className="field-label">
                College / institution name
                <input
                  value={form.collegeName || ""}
                  onChange={(event) => setForm((current) => ({ ...current, collegeName: event.target.value }))}
                  required
                  maxLength={180}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <label className="field-label mt-5">
                About your institution
                <textarea
                  rows="5"
                  value={form.description || ""}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  maxLength={2000}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Briefly describe your institution and placement cell."
                />
              </label>
              <div className="mt-6 flex flex-wrap gap-3">
                <button disabled={saving} className="primary-button" type="submit">
                  {saving ? "Saving…" : "Save institution profile"}
                </button>
                <button type="button" onClick={() => window.print()} className="secondary-button">
                  Print profile
                </button>
              </div>
            </>
          )}
        </form>

        <section className="form-panel mt-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><span className="section-eyebrow">COMPANY COORDINATION</span><h2 className="mt-2 text-2xl font-extrabold text-slate-900">Placement approval requests</h2><p className="mt-1 text-sm text-slate-500">Review company drive details before they become visible to students.</p></div><span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-800">{requests.length} pending</span></div>
          <label className="field-label mb-4">Review note (optional)<input className="w-full rounded-xl border border-slate-200 px-4 py-3" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Add a short reason or note for the company" /></label>
          {requests.length === 0 ? <div className="empty-state"><span className="text-3xl">✓</span><h3 className="mt-3 text-lg font-bold text-slate-900">You're all caught up</h3><p className="mt-1 text-sm text-slate-500">New company placement requests will appear here.</p></div> : <div className="grid gap-4 lg:grid-cols-2">{requests.map((job) => <article className="job-card" key={job.jobId}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-700">{job.employer?.companyName || "Company"} · {job.requestedCollegeName === "*" ? "Pool drive · all colleges" : (job.requestedCollegeName || "Your institution")}</p><h3 className="mt-1 text-lg font-extrabold text-slate-900">{job.jobTitle}</h3></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">Pending</span></div><p className="mt-3 text-sm leading-6 text-slate-600">{job.jobDescription || "No description provided."}</p><div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600"><p><strong>Package:</strong> {job.salaryPackage}</p><p><strong>Location:</strong> {job.jobLocation}</p><p><strong>Minimum CGPA:</strong> {job.minCgpa ?? "Not specified"}</p><p><strong>Drive date:</strong> {job.placementDriveDate || "—"}</p></div><div className="mt-5 flex flex-wrap gap-3"><button className="primary-button" onClick={() => reviewRequest(job.jobId, "APPROVED")}>Approve drive</button><button className="secondary-button" onClick={() => reviewRequest(job.jobId, "REJECTED")}>Reject request</button></div></article>)}</div>}
        </section>

        <section className="form-panel mt-6">
          <div className="mb-5"><span className="section-eyebrow">PLACEMENT OUTCOMES</span><h2 className="mt-2 text-2xl font-extrabold text-slate-900">Student selection tracker</h2><p className="mt-1 text-sm text-slate-500">Live application and interview outcomes recorded by company accounts.</p></div>
          {outcomes.length === 0 ? <div className="empty-state"><h3 className="text-lg font-bold text-slate-900">No outcomes recorded yet</h3><p className="mt-1 text-sm text-slate-500">Student applications and company decisions will appear here.</p></div> : <div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Student</th><th>Company</th><th>Role</th><th>Round</th><th>Outcome</th></tr></thead><tbody>{outcomes.map((item) => <tr key={item.applicationId}><td className="font-bold text-slate-900">{item.studentName}</td><td>{item.company}</td><td>{item.role}</td><td>{item.currentRound ? `Round ${item.currentRound}` : "Awaiting review"}</td><td>{String(item.status || "Applied").replaceAll("_", " ")}</td></tr>)}</tbody></table></div>}
        </section>

        <section className="form-panel mt-6 max-w-3xl">
          <h2 className="text-lg font-extrabold text-slate-900">Role permissions</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This login has the College role. Student-only pages and company job-posting endpoints are protected from this account.
          </p>
        </section>
      </main>
    </div>
  );
};

export default CollegeDashboard;
