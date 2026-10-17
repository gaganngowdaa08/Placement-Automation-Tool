import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../api/client";

const emptyAcademic = { degree: "", branch: "", usn: "", semester: "", cgpa: "", tenth: "", twelfth: "", backlogs: "", passingYear: "", skills: "", projects: "", certifications: "" };
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const AcademicPage = () => {
  const [academic, setAcademic] = useState(emptyAcademic);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiRequest("/students/me/academic");
        const legacy = (() => { try { return JSON.parse(localStorage.getItem("academic") || "{}"); } catch { return {}; } })();
        const hasLegacyValues = Object.values(legacy || {}).some((value) => value !== null && value !== undefined && String(value).trim() !== "");
        const merged = { ...emptyAcademic, ...legacy };
        for (const [key, value] of Object.entries(data || {})) {
          if (value !== null && value !== undefined && String(value).trim() !== "") merged[key] = value;
        }
        const legacyHasMissingFields = Object.keys(legacy || {}).some((key) =>
          legacy[key] !== null && legacy[key] !== undefined && String(legacy[key]).trim() !== ""
          && (data[key] === null || data[key] === undefined || String(data[key]).trim() === ""));
        let result = { ...emptyAcademic, ...data };
        if (hasLegacyValues && legacyHasMissingFields) {
          // Earlier builds stored academic details only in localStorage. Move missing values to the account database once.
          result = await apiRequest("/students/me/academic", { method: "PUT", body: JSON.stringify(merged) });
          localStorage.removeItem("academic");
          if (active) setMessage("Recovered your earlier browser-saved academic details and moved them into your account database.");
        }
        if (active) setAcademic({ ...emptyAcademic, ...result });
      } catch (requestError) { if (active) setError(requestError.message || "Could not load your saved academic details."); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);
  const handleChange = (event) => setAcademic((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleSave = async (event) => {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const saved = await apiRequest("/students/me/academic", { method: "PUT", body: JSON.stringify(academic) });
      setAcademic({ ...emptyAcademic, ...saved });
      setMessage("Academic details saved to your account database.");
    } catch (requestError) { setError(requestError.message || "Academic details could not be saved."); }
    finally { setSaving(false); }
  };
  const field = (label, name, placeholder = label, type = "text") => <label key={name} className="field-label">{label}<input name={name} type={type} value={academic[name] || ""} onChange={handleChange} className={inputClass} placeholder={placeholder} /></label>;

  return <DashboardLayout>
    <div className="page-heading"><span className="section-eyebrow">STUDENT RECORD</span><h1 className="page-title">Academic details</h1><p className="page-description">Save your education and eligibility information for future placement applications.</p></div>
    {message && <p role="status" className="status-success">✓ {message}</p>}{error && <p role="alert" className="status-error">{error}</p>}
    <form onSubmit={handleSave} className="form-panel max-w-5xl">
      {loading ? <p className="text-slate-500">Loading your saved academic details…</p> : <>
        <div className="mb-6 border-b border-slate-100 pb-5"><h2 className="text-xl font-bold text-slate-900">Education & eligibility</h2><p className="mt-1 text-sm text-slate-500">These details are loaded from and saved to the backend database.</p></div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <label className="field-label">Degree<select name="degree" value={academic.degree || ""} onChange={handleChange} className={inputClass}><option value="">Select degree</option><option>B.E / B.Tech</option><option>M.E / M.Tech</option><option>B.Sc</option><option>M.Sc</option><option>BCA</option><option>MCA</option><option>Other</option></select></label>
          <label className="field-label">Branch<select name="branch" value={academic.branch || ""} onChange={handleChange} className={inputClass}><option value="">Select branch</option><option>Computer Science Engineering (CSE)</option><option>Information Science Engineering (ISE)</option><option>Artificial Intelligence & Machine Learning</option><option>Artificial Intelligence & Data Science</option><option>Electronics & Communication Engineering</option><option>Electrical & Electronics Engineering</option><option>Mechanical Engineering</option><option>Civil Engineering</option><option>Chemical Engineering</option><option>Biotechnology</option><option>Aeronautical Engineering</option><option>Automobile Engineering</option><option>Other</option></select></label>
          {field("University seat number / USN", "usn", "Enter USN")}
          <label className="field-label">Current / final semester<select name="semester" value={academic.semester || ""} onChange={handleChange} className={inputClass}><option value="">Select semester</option>{Array.from({ length: 8 }, (_, i) => <option key={i + 1} value={String(i + 1)}>{i + 1}</option>)}</select></label>
          {field("CGPA", "cgpa", "e.g. 7.50", "number")}
          {field("10th percentage", "tenth", "e.g. 74", "number")}
          {field("12th / diploma percentage", "twelfth", "e.g. 84", "number")}
          {field("Backlogs", "backlogs", "0", "number")}
          {field("Passing year", "passingYear", "e.g. 2026", "number")}
          {field("Certifications", "certifications", "Separate multiple certifications with commas")}
          <label className="field-label md:col-span-2">Technical skills<textarea rows="3" name="skills" value={academic.skills || ""} onChange={handleChange} className={inputClass} placeholder="Java, Spring Boot, SQL, React…" /></label>
          <label className="field-label md:col-span-2">Projects<textarea rows="3" name="projects" value={academic.projects || ""} onChange={handleChange} className={inputClass} placeholder="Project names and a short description" /></label>
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-3"><button disabled={saving} type="submit" className="primary-button">{saving ? "Saving to database…" : "Save academic details"}</button><button type="button" onClick={() => window.print()} className="secondary-button">Print academic summary</button><span className="text-sm text-slate-500">A success message appears only after the server confirms the save.</span></div>
      </>}
    </form>
  </DashboardLayout>;
};
export default AcademicPage;
