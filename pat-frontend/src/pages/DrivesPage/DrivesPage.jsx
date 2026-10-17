import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../api/client";

function toDrive(job) {
  const requestedCollegeName = (job.requestedCollegeName || "").trim();
  const poolDrive = requestedCollegeName === "*" || requestedCollegeName.toUpperCase() === "ALL_COLLEGES";
  return {
    id: job.jobId,
    company: job.employer?.companyName || "Hiring company",
    role: job.jobTitle || "Open position",
    package: job.salaryPackage || "Not specified",
    location: job.jobLocation || "Not specified",
    cgpa: Number(job.minCgpa || 0),
    maxBacklogs: job.maxBacklogs == null ? null : Number(job.maxBacklogs),
    passingYear: job.passingYear == null ? null : Number(job.passingYear),
    deadline: job.applicationDeadline || "Not specified",
    branches: job.eligibleBranches || "See job requirements",
    requestedCollegeName,
    targetColleges: poolDrive ? [] : requestedCollegeName.split(",").map((name) => name.trim()).filter(Boolean),
    poolDrive,
    isDemo: false,
  };
}
const readAcademic = () => { try { return JSON.parse(localStorage.getItem("academic") || "{}"); } catch { return {}; } };

const DrivesPage = () => {
  const [search, setSearch] = useState("");
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [studentCGPA, setStudentCGPA] = useState(Number.parseFloat(readAcademic().cgpa));
  const [studentCollegeName, setStudentCollegeName] = useState(readAcademic().collegeName || "");
  const [studentBacklogs, setStudentBacklogs] = useState(Number.parseInt(readAcademic().backlogs, 10));
  const [studentPassingYear, setStudentPassingYear] = useState(Number.parseInt(readAcademic().passingYear, 10));
  const [studentBranch, setStudentBranch] = useState(readAcademic().branch || "");

  const load = async () => {
    const [jobs, apps, academic] = await Promise.all([
      apiRequest("/jobs"), apiRequest("/students/me/applications"), apiRequest("/students/me/academic")
    ]);
    if (Array.isArray(jobs) && jobs.length > 0) { setDrives(jobs.map(toDrive)); }
    else { setDrives([]); }
    setApplications(Array.isArray(apps) ? apps : []);
    const cgpa = Number.parseFloat(academic?.cgpa);
    setStudentCGPA(Number.isFinite(cgpa) ? cgpa : Number.NaN);
    setStudentCollegeName(String(academic?.collegeName || "").trim());
    const backlogs = Number.parseInt(academic?.backlogs, 10);
    const passingYear = Number.parseInt(academic?.passingYear, 10);
    setStudentBacklogs(Number.isFinite(backlogs) ? backlogs : Number.NaN);
    setStudentPassingYear(Number.isFinite(passingYear) ? passingYear : Number.NaN);
    setStudentBranch(String(academic?.branch || "").trim());
  };
  useEffect(() => { load().catch((e) => setError(e.message || "Unable to load placement drives.")).finally(() => setLoading(false)); }, []);

  const filteredDrives = useMemo(() => drives.filter((drive) => {
    return `${drive.company} ${drive.role} ${drive.location}`.toLowerCase().includes(search.toLowerCase());
  }), [drives, search]);

  const handleApply = async (drive) => {
    if (drive.isDemo) return;
    setError(""); setNotice("");
    try {
      await apiRequest("/students/me/applications", { method: "POST", body: JSON.stringify({ jobId: drive.id }) });
      await load(); setNotice(`Your application for ${drive.role} at ${drive.company} was saved to the database.`);
    } catch (e) { setError(e.message || "The application could not be saved."); }
  };
  const hasApplied = (drive) => applications.some((app) => Number(app.jobId) === Number(drive.id));
  const collegeEligible = (drive) => drive.poolDrive || (!!studentCollegeName && drive.targetColleges.some((name) => name.toLowerCase() === studentCollegeName.toLowerCase()));
  const academicEligible = (drive) => {
    if (drive.cgpa > 0 && (!Number.isFinite(studentCGPA) || studentCGPA < drive.cgpa)) return false;
    if (drive.maxBacklogs != null && (!Number.isFinite(studentBacklogs) || studentBacklogs > drive.maxBacklogs)) return false;
    if (drive.passingYear != null && (!Number.isFinite(studentPassingYear) || studentPassingYear !== drive.passingYear)) return false;
    if (drive.branches && drive.branches !== "See job requirements") {
      if (!studentBranch) return false;
      const branch = studentBranch.toLowerCase().replace(/engineering/g, "").replace(/[()]/g, "").trim();
      const required = drive.branches.toLowerCase().split(",").map((item) => item.replace(/engineering/g, "").replace(/[()]/g, "").trim()).filter(Boolean);
      if (required.length && !required.some((item) => branch.includes(item) || item.includes(branch))) return false;
    }
    return true;
  };

  return <DashboardLayout>
    <div className="page-heading flex flex-wrap items-start justify-between gap-3"><div><span className="section-eyebrow">FIND YOUR NEXT OPPORTUNITY</span><h1 className="page-title">Placement drives</h1><p className="page-description">Explore active company postings and apply with your saved resume.</p></div></div>
    {error && <p role="alert" className="status-error">{error}</p>}{notice && <p role="status" className="status-success">✓ {notice}</p>}
    {!loading && drives.length === 0 && <p className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">Only college-approved company drives appear here. If no drives are listed, check back after a company submits a request and a college reviews it.</p>}
    <input type="search" placeholder="Search by company, role, or location…" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search placement drives" className="mb-6 w-full max-w-xl rounded-xl border border-slate-200 bg-white p-3.5 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
    {loading && <p className="mb-4 text-sm text-slate-500">Loading job postings…</p>}
    {!loading && filteredDrives.length === 0 ? <div className="empty-state"><span className="text-4xl">🔎</span><h2 className="mt-3 text-lg font-bold text-slate-900">No drives found</h2><p className="mt-1 text-sm text-slate-500">Try a different search or update your academic eligibility.</p></div> : <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredDrives.map((drive) => {
      const applied = !drive.isDemo && hasApplied(drive);
      const allowedByCollege = collegeEligible(drive);
      const allowedByAcademics = academicEligible(drive);
      const canApply = allowedByCollege && allowedByAcademics;
      return <article key={drive.id} className="job-card"><div className="mb-4 flex items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg font-extrabold text-blue-700">{drive.company.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><h2 className="truncate text-lg font-bold text-slate-900">{drive.company}</h2><p className="text-sm text-slate-500">{drive.role}</p></div></div><div className="space-y-2.5 text-sm text-slate-600"><p><strong className="text-slate-800">Package:</strong> {drive.package}</p><p><strong className="text-slate-800">Location:</strong> {drive.location}</p><p><strong className="text-slate-800">Minimum CGPA:</strong> {drive.cgpa}</p><p><strong className="text-slate-800">Deadline:</strong> {drive.deadline}</p><p><strong className="text-slate-800">Eligible branches:</strong> {drive.branches}</p><p><strong className="text-slate-800">College scope:</strong> {drive.poolDrive ? "Pool drive — all colleges" : drive.targetColleges.join(", ") || "Targeted drive"}</p></div>{!drive.poolDrive && !allowedByCollege && <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">You can view this drive, but applications are restricted to students from: {drive.targetColleges.join(", ") || "the selected college(s)"}. Make sure your college name in My Profile matches the registered college name.</p>}{allowedByCollege && !allowedByAcademics && <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">This drive is open to your college, but your saved academic details do not meet one or more of its eligibility criteria.</p>}<button type="button" disabled={drive.isDemo || applied || !canApply} onClick={() => handleApply(drive)} className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-bold transition ${drive.isDemo || applied || !canApply ? "cursor-not-allowed bg-slate-200 text-slate-500" : "bg-blue-700 text-white hover:bg-blue-800"}`}>{drive.isDemo ? "Preview only" : applied ? "Application saved" : !allowedByCollege ? "Not eligible for this drive" : !allowedByAcademics ? "Academic criteria not met" : "Apply with saved resume"}</button></article>;
    })}</div>}
  </DashboardLayout>;
};
export default DrivesPage;
