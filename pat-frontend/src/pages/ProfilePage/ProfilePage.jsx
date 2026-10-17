import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../api/client";

const emptyProfile = { name: "", email: "", phone: "", linkedin: "", address: "", github: "" };
const emptyAcademic = { degree: "", collegeName: "", branch: "", usn: "", semester: "", cgpa: "", tenth: "", twelfth: "", backlogs: "", passingYear: "", skills: "", projects: "", certifications: "" };
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export default function ProfilePage() {
  const [profile, setProfile] = useState(emptyProfile);
  const [academic, setAcademic] = useState(emptyAcademic);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([apiRequest("/students/me/profile"), apiRequest("/students/me/academic")])
      .then(([p, a]) => { setProfile({ ...emptyProfile, ...p }); setAcademic({ ...emptyAcademic, ...a }); })
      .catch((e) => setError(e.message || "Could not load your profile."))
      .finally(() => setLoading(false));
  }, []);

  const saveAll = async (event) => {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const [savedProfile, savedAcademic] = await Promise.all([
        apiRequest("/students/me/profile", { method: "PUT", body: JSON.stringify({ name: profile.name, phone: profile.phone, linkedin: profile.linkedin, address: profile.address, github: profile.github }) }),
        apiRequest("/students/me/academic", { method: "PUT", body: JSON.stringify(academic) }),
      ]);
      setProfile({ ...emptyProfile, ...savedProfile }); setAcademic({ ...emptyAcademic, ...savedAcademic });
      setMessage("Your personal and academic profile has been saved to the database.");
    } catch (e) { setError(e.message || "Your profile could not be saved. Please review the fields and try again."); }
    finally { setSaving(false); }
  };
  const changeProfile = (e) => setProfile((old) => ({ ...old, [e.target.name]: e.target.value }));
  const changeAcademic = (e) => setAcademic((old) => ({ ...old, [e.target.name]: e.target.value }));
  const field = (label, name, placeholder = label, type = "text") => <label key={name} className="field-label">{label}<input name={name} type={type} value={academic[name] || ""} onChange={changeAcademic} className={inputClass} placeholder={placeholder} /></label>;

  return <DashboardLayout>
    <div className="page-heading"><span className="section-eyebrow">YOUR STUDENT RECORD</span><h1 className="page-title">My profile</h1><p className="page-description">Keep your contact details, education, eligibility, skills, and professional links together. All changes are saved to your account database.</p></div>
    {message && <p role="status" className="status-success">✓ {message}</p>}{error && <p role="alert" className="status-error">{error}</p>}
    {loading ? <div className="form-panel">Loading your saved profile…</div> : <form onSubmit={saveAll} className="space-y-6">
      <section className="form-panel"><div className="mb-6 border-b border-slate-100 pb-5"><h2 className="text-xl font-extrabold text-slate-900">Personal information</h2><p className="mt-1 text-sm text-slate-500">Contact information and professional profiles.</p></div><div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <label className="field-label">Full name<input name="name" value={profile.name || ""} onChange={changeProfile} required maxLength={120} className={inputClass} placeholder="Full name" /></label>
        <label className="field-label">Registered email<input name="email" value={profile.email || ""} readOnly className={`${inputClass} bg-slate-50 text-slate-500`} /><span className="field-hint">Your login email is read-only.</span></label>
        <label className="field-label">Phone number<input name="phone" type="tel" value={profile.phone || ""} onChange={changeProfile} maxLength={30} className={inputClass} placeholder="Phone number" /></label>
        <label className="field-label">LinkedIn profile<input name="linkedin" type="url" value={profile.linkedin || ""} onChange={changeProfile} className={inputClass} placeholder="https://linkedin.com/in/…" /></label>
        <label className="field-label">GitHub profile<input name="github" type="url" value={profile.github || ""} onChange={changeProfile} className={inputClass} placeholder="https://github.com/…" /></label>
        <label className="field-label md:col-span-2">Address<input name="address" value={profile.address || ""} onChange={changeProfile} className={inputClass} placeholder="City, state" /></label>
      </div></section>
      <section className="form-panel"><div className="mb-6 border-b border-slate-100 pb-5"><h2 className="text-xl font-extrabold text-slate-900">Education & placement eligibility</h2><p className="mt-1 text-sm text-slate-500">Companies use these details to assess eligibility for placement drives.</p></div><div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <label className="field-label">Degree<select name="degree" value={academic.degree || ""} onChange={changeAcademic} className={inputClass}><option value="">Select degree</option>{["B.E / B.Tech","M.E / M.Tech","B.Sc","M.Sc","BCA","MCA","Other"].map((v)=><option key={v}>{v}</option>)}</select></label>
        <label className="field-label">College / institution name<input name="collegeName" value={academic.collegeName || ""} onChange={changeAcademic} className={inputClass} placeholder="Your college or institution" /></label>
        <label className="field-label">Branch<select name="branch" value={academic.branch || ""} onChange={changeAcademic} className={inputClass}><option value="">Select branch</option>{["Computer Science Engineering (CSE)","Information Science Engineering (ISE)","Artificial Intelligence & Machine Learning","Artificial Intelligence & Data Science","Electronics & Communication Engineering","Electrical & Electronics Engineering","Mechanical Engineering","Civil Engineering","Other"].map((v)=><option key={v}>{v}</option>)}</select></label>
        {field("University seat number / USN", "usn", "Enter USN")}
        <label className="field-label">Semester<select name="semester" value={academic.semester || ""} onChange={changeAcademic} className={inputClass}><option value="">Select semester</option>{Array.from({length:8},(_,i)=><option key={i+1} value={String(i+1)}>{i+1}</option>)}</select></label>
        {field("CGPA (out of 10)","cgpa","e.g. 7.50","number")}{field("10th percentage","tenth","e.g. 74","number")}{field("12th / diploma percentage","twelfth","e.g. 84","number")}{field("Active backlogs","backlogs","0","number")}{field("Passing year","passingYear","e.g. 2026","number")}{field("Certifications","certifications","Separate with commas")}
        <label className="field-label md:col-span-2">Technical skills<textarea name="skills" rows="3" value={academic.skills || ""} onChange={changeAcademic} className={inputClass} placeholder="Java, Spring Boot, SQL…" /></label>
        <label className="field-label md:col-span-2">Projects<textarea name="projects" rows="3" value={academic.projects || ""} onChange={changeAcademic} className={inputClass} placeholder="Project title and short description" /></label>
      </div></section>
      <div className="no-print flex flex-wrap items-center gap-3"><button disabled={saving} type="submit" className="primary-button">{saving ? "Saving to database…" : "Save complete profile"}</button><button type="button" onClick={() => window.print()} className="secondary-button">Print profile</button><span className="text-sm text-slate-500">Success is shown only after the API confirms both saves.</span></div>
    </form>}
  </DashboardLayout>;
}
