import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../api/client";

const Dashboard = () => {
  const [jobCount, setJobCount] = useState(null);
  const [applications, setApplications] = useState(null);
  const [resumeCount, setResumeCount] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([apiRequest("/jobs"), apiRequest("/students/me/applications"), apiRequest("/students/me/resume")])
      .then(([jobs, apps, resumes]) => { setJobCount(Array.isArray(jobs) ? jobs.length : 0); setApplications(Array.isArray(apps) ? apps : []); setResumeCount(Array.isArray(resumes) ? resumes.length : 0); })
      .catch((e) => setError(e.message || "Some dashboard information could not be loaded."));
  }, []);
  const interviewCount = applications === null ? null : applications.filter((app) => app.currentRound > 0 || !["Applied", "Shortlisted"].includes(app.status)).length;
  const card = (label, value, detail, style="text-blue-700") => <div className="metric-card"><p className="text-sm font-semibold text-slate-500">{label}</p><p className={`mt-3 text-3xl font-extrabold tracking-tight ${style}`}>{value === null ? "—" : value}</p><p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p></div>;
  return <DashboardLayout>
    <div className="page-heading"><span className="section-eyebrow">STUDENT WORKSPACE</span><h1 className="page-title">Your placement dashboard</h1><p className="page-description">A clear overview of live opportunities, submitted applications, and interview progress saved to your account.</p></div>
    {error && <p role="alert" className="status-error">{error} If your session has expired, sign in again.</p>}
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">{card("Live approved drives", jobCount, "College-approved opportunities currently accepting applications")}{card("Applications submitted", applications === null ? null : applications.length, "Applications recorded against your student account", "text-emerald-700")}{card("Interview tracking", interviewCount, "Applications with a recorded interview-stage update", "text-violet-700")}</div>
    <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_.8fr]">
      <section className="form-panel"><span className="section-eyebrow">PROFILE READINESS</span><h2 className="mt-2 text-xl font-extrabold text-slate-900">Build a complete student profile</h2><p className="mt-2 text-sm leading-6 text-slate-600">Save your personal information, college, branch, CGPA, backlogs, passing year, skills, and projects. Companies use these details to review eligibility.</p><div className="mt-5 flex flex-wrap gap-3"><a href="/profile" className="primary-button">Complete my profile</a><a href="/resume" className="secondary-button">Manage resumes</a></div></section>
      <section className="form-panel"><span className="section-eyebrow">APPLICATION DOCUMENTS</span><h2 className="mt-2 text-xl font-extrabold text-slate-900">Resume library</h2><p className="mt-2 text-sm text-slate-600">{resumeCount === null ? "Checking your resume…" : resumeCount > 0 ? `${resumeCount} resume file${resumeCount === 1 ? "" : "s"} saved to your account.` : "Upload a PDF resume before applying to a placement drive."}</p><a href="/drives" className="secondary-button mt-5">Explore placement drives</a></section>
    </div>
  </DashboardLayout>;
};
export default Dashboard;
