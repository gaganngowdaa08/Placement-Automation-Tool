import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../api/client";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

const emptyJob = {
  jobTitle: "",
  jobDescription: "",
  salaryPackage: "",
  jobLocation: "",
  minCgpa: "",
  eligibleBranches: "",
  maxBacklogs: "0",
  passingYear: "",
  applicationDeadline: "",
  placementDriveDate: "",
  applicationScope: "TARGETED",
  targetCollegeName: "",
};
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ companyName: "", description: "" });
  const [job, setJob] = useState(emptyJob);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [candidateRounds, setCandidateRounds] = useState({});
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [resumeOpeningId, setResumeOpeningId] = useState(null);

  const loadWorkspace = useCallback(async () => {
    const [savedProfile, savedJobs] = await Promise.all([
      apiRequest("/company/me/profile"),
      apiRequest("/company/jobs"),
    ]);
    setProfile({ companyName: savedProfile.companyName || "", description: savedProfile.description || "" });
    setJobs(Array.isArray(savedJobs) ? savedJobs : []);
  }, []);

  useEffect(() => {
    loadWorkspace()
      .catch((requestError) => setError(requestError.message || "Could not load company workspace."))
      .finally(() => setLoading(false));
  }, [loadWorkspace]);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const saved = await apiRequest("/company/me/profile", {
        method: "PUT",
        body: JSON.stringify(profile),
      });
      setProfile({ companyName: saved.companyName || "", description: saved.description || "" });
      setMessage("Company profile saved to the database.");
    } catch (requestError) {
      setError(requestError.message || "Could not save company details.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateJob = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const applicationScope = job.applicationScope === "POOL" ? "POOL" : "TARGETED";
      const payload = {
        ...job,
        applicationScope,
        targetCollegeName: applicationScope === "POOL" ? "*" : job.targetCollegeName.trim(),
        minCgpa: job.minCgpa === "" ? null : Number(job.minCgpa),
        maxBacklogs: job.maxBacklogs === "" ? null : Number(job.maxBacklogs),
        passingYear: job.passingYear === "" ? null : Number(job.passingYear),
      };
      await apiRequest("/company/jobs", { method: "POST", body: JSON.stringify(payload) });
      setJob(emptyJob);
      setMessage(applicationScope === "POOL"
        ? "Pool-drive request saved. After college approval, eligible students from all colleges can apply."
        : "Targeted placement request saved. After college approval, only students from the listed colleges can apply.");
      await loadWorkspace();
    } catch (requestError) {
      setError(requestError.message || "Could not publish this job.");
    } finally {
      setSaving(false);
    }
  };

  const loadCandidates = async (jobId) => {
    setSelectedJobId(jobId); setCandidateLoading(true); setError("");
    try { const result = await apiRequest(`/company/jobs/${jobId}/applications`); setCandidates(Array.isArray(result) ? result : []); }
    catch (requestError) { setError(requestError.message || "Could not load applicants."); setCandidates([]); }
    finally { setCandidateLoading(false); }
  };

  const openCandidateResume = async (candidate) => {
    setError("");
    setMessage("");

    if (!candidate.resumeAvailable) {
      setError("No saved PDF resume is attached to this application. Ask the student to upload a resume and apply again.");
      return;
    }

    // Open the tab synchronously inside the click handler so the browser's popup blocker allows it.
    const previewWindow = window.open("about:blank", "_blank");
    if (!previewWindow) {
      setError("Your browser blocked the resume tab. Allow pop-ups for this local PAT site and try again.");
      return;
    }

    previewWindow.document.title = "Opening candidate resume…";
    previewWindow.document.body.innerHTML = '<p style="font:16px sans-serif;padding:24px">Loading candidate resume…</p>';
    setResumeOpeningId(candidate.applicationId);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/company/applications/${candidate.applicationId}/resume`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (!response.ok) {
        const raw = await response.text();
        let detail = raw;
        try {
          const parsed = raw ? JSON.parse(raw) : {};
          detail = parsed.message || parsed.detail || raw;
        } catch {
          // Keep the server's plain-text message when it isn't JSON.
        }
        throw new Error(detail || `Resume request failed (${response.status}).`);
      }

      const fileBlob = await response.blob();
      if (fileBlob.size === 0) throw new Error("The saved resume file is empty.");
      const objectUrl = URL.createObjectURL(fileBlob);
      previewWindow.location.href = objectUrl;
      // Keep the object URL alive long enough for the browser's PDF viewer to load it.
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10 * 60 * 1000);
    } catch (requestError) {
      previewWindow.close();
      setError(requestError.message || "Could not open this candidate's resume.");
    } finally {
      setResumeOpeningId(null);
    }
  };

  const updateCandidate = async (applicationId, round, decision) => {
    setError(""); setMessage("");
    try {
      await apiRequest(`/company/applications/${applicationId}/decision`, { method: "PUT", body: JSON.stringify({ round: Number(round), decision, note: "Updated by company recruiter" }) });
      setMessage("Candidate interview status saved. The student can now see the update in My Applications.");
      if (selectedJobId) await loadCandidates(selectedJobId);
    } catch (requestError) { setError(requestError.message || "Could not update candidate status."); }
  };

  const handleLogout = () => {
    ["authToken", "authEmail", "authRole"].forEach((key) => localStorage.removeItem(key));
    navigate("/login", { replace: true });
  };

  const updateJob = (field, value) => setJob((current) => ({ ...current, [field]: value }));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="no-print flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:px-10">
        <Link to="/" className="text-lg font-extrabold text-slate-900">
          PAT<span className="text-blue-700">.</span> Company Workspace
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:inline">{localStorage.getItem("authEmail")}</span>
          <button onClick={handleLogout} className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100">Log out</button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="page-heading">
          <span className="section-eyebrow">COMPANY ACCOUNT</span>
          <h1 className="page-title">Hiring workspace</h1>
          <p className="page-description">Manage your company profile and publish database-backed placement opportunities for student accounts.</p>
        </div>
        {error && <p role="alert" className="status-error">{error}</p>}
        {message && <p role="status" className="status-success">✓ {message}</p>}

        {loading ? <p className="text-slate-500">Loading company workspace…</p> : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[.8fr_1.2fr]">
            <form onSubmit={handleSaveProfile} className="form-panel h-fit">
              <h2 className="mb-5 text-xl font-extrabold text-slate-900">Company profile</h2>
              <label className="field-label">
                Company name
                <input className={inputClass} required maxLength={180} value={profile.companyName} onChange={(event) => setProfile((current) => ({ ...current, companyName: event.target.value }))} />
              </label>
              <label className="field-label mt-5">
                Company description
                <textarea className={inputClass} rows="5" maxLength={2000} value={profile.description || ""} onChange={(event) => setProfile((current) => ({ ...current, description: event.target.value }))} placeholder="Describe your organisation" />
              </label>
              <div className="mt-5 flex flex-wrap gap-3">
                <button disabled={saving} className="primary-button" type="submit">Save company profile</button>
                <button type="button" onClick={() => window.print()} className="secondary-button">Print profile</button>
              </div>
            </form>

            <form onSubmit={handleCreateJob} className="form-panel">
              <h2 className="text-xl font-extrabold text-slate-900">Publish a placement drive</h2>
              <p className="mb-5 mt-1 text-sm leading-6 text-slate-500">Placement requests are saved in MySQL and become visible to students only after the target college approves them.</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="field-label md:col-span-2">
                  Who can apply?
                  <select
                    className={inputClass}
                    value={job.applicationScope}
                    onChange={(event) => updateJob("applicationScope", event.target.value)}
                  >
                    <option value="TARGETED">Target specific college(s)</option>
                    <option value="POOL">Pool drive — all colleges</option>
                  </select>
                  <span className="mt-1 block text-xs text-slate-500">
                    All approved drives are viewable, but only eligible students can apply.
                  </span>
                </label>
                {job.applicationScope === "TARGETED" ? (
                  <label className="field-label md:col-span-2">
                    Target college(s)
                    <input
                      className={inputClass}
                      required
                      maxLength={180}
                      value={job.targetCollegeName}
                      onChange={(event) => updateJob("targetCollegeName", event.target.value)}
                      placeholder="e.g. K S Institute of Technology, RNSIT"
                    />
                    <span className="mt-1 block text-xs text-slate-500">
                      Enter registered college names separated by commas. Names should match the college name saved in student profiles.
                    </span>
                  </label>
                ) : (
                  <div className="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                    Pool drive selected. After a college approves this request, students from any registered college can apply if they meet the academic criteria.
                  </div>
                )}
                <label className="field-label md:col-span-2">Job title<input className={inputClass} required maxLength={255} value={job.jobTitle} onChange={(event) => updateJob("jobTitle", event.target.value)} placeholder="e.g. Associate Software Engineer" /></label>
                <label className="field-label">Salary / package<input className={inputClass} required value={job.salaryPackage} onChange={(event) => updateJob("salaryPackage", event.target.value)} placeholder="e.g. 6 LPA" /></label>
                <label className="field-label">Job location<input className={inputClass} required value={job.jobLocation} onChange={(event) => updateJob("jobLocation", event.target.value)} placeholder="City / Hybrid / Remote" /></label>
                <label className="field-label">Minimum CGPA<input className={inputClass} type="number" step="0.01" min="0" max="10" value={job.minCgpa} onChange={(event) => updateJob("minCgpa", event.target.value)} placeholder="e.g. 7" /></label>
                <label className="field-label">Maximum backlogs<input className={inputClass} type="number" min="0" value={job.maxBacklogs} onChange={(event) => updateJob("maxBacklogs", event.target.value)} /></label>
                <label className="field-label">Eligible branches<input className={inputClass} value={job.eligibleBranches} onChange={(event) => updateJob("eligibleBranches", event.target.value)} placeholder="CSE, ISE, AIML…" /></label>
                <label className="field-label">Passing year (optional)<input className={inputClass} type="number" min="2000" max="2100" value={job.passingYear} onChange={(event) => updateJob("passingYear", event.target.value)} placeholder="2026" /></label>
                <label className="field-label">Application deadline<input className={inputClass} type="date" required value={job.applicationDeadline} onChange={(event) => updateJob("applicationDeadline", event.target.value)} /></label>
                <label className="field-label">Placement drive date<input className={inputClass} type="date" required value={job.placementDriveDate} onChange={(event) => updateJob("placementDriveDate", event.target.value)} /></label>
                <label className="field-label md:col-span-2">Job description<textarea className={inputClass} rows="4" value={job.jobDescription} onChange={(event) => updateJob("jobDescription", event.target.value)} placeholder="Responsibilities, skills, selection process…" /></label>
              </div>
              <button type="submit" disabled={saving} className="primary-button mt-6">{saving ? "Saving…" : "Publish job"}</button>
            </form>
          </div>
        )}

        <section className="form-panel mt-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div><h2 className="text-xl font-extrabold text-slate-900">Your job postings</h2><p className="mt-1 text-sm text-slate-500">{jobs.length} posting{jobs.length === 1 ? "" : "s"} saved to the database.</p></div>
          </div>
          {jobs.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No live postings yet. Use the form above to publish your first job.</p>
          ) : (
            <div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Role</th><th>Package</th><th>Location</th><th>Deadline</th><th>Audience</th><th>Approval</th><th>Applicants</th></tr></thead><tbody>
              {jobs.map((savedJob) => <tr key={savedJob.jobId}><td className="font-bold text-slate-900">{savedJob.jobTitle}</td><td>{savedJob.salaryPackage}</td><td>{savedJob.jobLocation}</td><td>{savedJob.applicationDeadline}</td><td>{savedJob.requestedCollegeName === "*" ? "Pool drive" : (savedJob.requestedCollegeName || "Targeted")}</td><td><span className={`rounded-full px-3 py-1 text-xs font-bold ${savedJob.collegeApprovalStatus === "APPROVED" ? "bg-emerald-50 text-emerald-700" : savedJob.collegeApprovalStatus === "REJECTED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>{savedJob.collegeApprovalStatus || "PENDING"}</span></td><td><button type="button" onClick={() => loadCandidates(savedJob.jobId)} className="secondary-button">Review candidates</button></td></tr>)}
            </tbody></table></div>
          )}
        </section>

        {selectedJobId !== null && <section className="form-panel mt-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><span className="section-eyebrow">RECRUITMENT PIPELINE</span><h2 className="mt-2 text-2xl font-extrabold text-slate-900">Candidate review</h2><p className="mt-1 text-sm text-slate-500">Select an interview round and record the outcome. Students see saved updates in My Applications.</p></div><button className="secondary-button" onClick={() => { setSelectedJobId(null); setCandidates([]); }}>Close</button></div>
          {candidateLoading ? (
            <p className="text-slate-500">Loading candidates…</p>
          ) : candidates.length === 0 ? (
            <div className="empty-state">
              <h3 className="text-lg font-bold text-slate-900">No applications for this role yet</h3>
              <p className="mt-1 text-sm text-slate-500">Applications will appear here after eligible students apply to an approved drive.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {candidates.map((candidate) => {
                const selectedRound = Number(candidateRounds[candidate.applicationId] ?? candidate.currentRound ?? 1);
                const isFinalRound = selectedRound === 5;

                return (
                  <article key={candidate.applicationId} className="job-card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900">{candidate.studentName}</h3>
                        <p className="mt-1 text-sm text-slate-600">{candidate.email || "Email not provided"} · {candidate.phone || "Phone not provided"}</p>
                        <p className="mt-1 text-sm text-slate-500">{candidate.branch || "Branch not provided"} · CGPA {candidate.cgpa || "—"} · Backlogs {candidate.backlogs ?? "—"}</p>
                        <p className="mt-1 text-xs text-slate-500">{candidate.collegeName || "College not provided"} · 10th: {candidate.tenthPercentage || "—"}% · 12th: {candidate.twelfthPercentage || "—"}%</p>
                        {candidate.skills && <p className="mt-2 text-sm text-slate-600"><strong>Skills:</strong> {candidate.skills}</p>}
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{String(candidate.status || "Applied").replaceAll("_", " ")}</span>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => openCandidateResume(candidate)}
                        disabled={!candidate.resumeAvailable || resumeOpeningId === candidate.applicationId}
                        title={candidate.resumeAvailable ? "Open this applicant's submitted PDF resume in a new tab" : "This application has no saved PDF resume"}
                      >
                        {resumeOpeningId === candidate.applicationId
                          ? "Opening resume…"
                          : candidate.resumeAvailable
                            ? `View resume${candidate.resumeFileName ? ` · ${candidate.resumeFileName}` : " (PDF)"}`
                            : "Resume unavailable"}
                      </button>
                      {!candidate.resumeAvailable && (
                        <p className="mt-2 text-xs text-slate-500">
                          No PDF was attached to this application. The student needs to upload a resume and apply again.
                        </p>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.2fr]">
                      <label className="field-label">
                        Interview round
                        <select
                          id={`round-${candidate.applicationId}`}
                          value={String(selectedRound)}
                          onChange={(event) => setCandidateRounds((current) => ({ ...current, [candidate.applicationId]: Number(event.target.value) }))}
                          className={inputClass}
                        >
                          <option value="1">Round 1</option>
                          <option value="2">Round 2</option>
                          <option value="3">Round 3</option>
                          <option value="4">Round 4</option>
                          <option value="5">Final round</option>
                        </select>
                      </label>
                      <label className="field-label">
                        Decision
                        <select id={`decision-${candidate.applicationId}`} defaultValue="IN_PROGRESS" className={inputClass}>
                          <option value="IN_PROGRESS">In progress</option>
                          <option value="SELECTED">{isFinalRound ? "Selected (final selection)" : "Selected for next round"}</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {isFinalRound ? "Final-round selection marks the application as selected." : "Selecting the candidate advances them to the next round."}
                    </p>
                    <button className="primary-button mt-4" onClick={() => {
                      const round = document.getElementById(`round-${candidate.applicationId}`).value;
                      const decision = document.getElementById(`decision-${candidate.applicationId}`).value;
                      updateCandidate(candidate.applicationId, round, decision);
                    }}>Save interview outcome</button>
                  </article>
                );
              })}
            </div>
          )}
        </section>}
      </main>
    </div>
  );
};

export default CompanyDashboard;
