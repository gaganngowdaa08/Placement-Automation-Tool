import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../api/client";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

const ResumePage = () => {
  const [file, setFile] = useState(null);
  const formRef = useRef(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [openingResumeId, setOpeningResumeId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const previousBrowserFilename = localStorage.getItem("resume");

  const reload = () => apiRequest("/students/me/resume").then((items) => setResumes(Array.isArray(items) ? items : []));
  useEffect(() => {
    reload().catch((e) => setError(e.message || "Unable to load saved resumes.")).finally(() => setLoading(false));
  }, []);

  const handleViewResume = async (resume) => {
    setError("");
    setMessage("");
    // Open synchronously in the click handler to avoid browser popup blocking.
    const previewWindow = window.open("about:blank", "_blank");
    if (!previewWindow) {
      setError("Your browser blocked the resume tab. Allow pop-ups for this PAT site and try again.");
      return;
    }
    previewWindow.document.title = "Opening resume…";
    previewWindow.document.body.innerHTML = '<p style="font:16px sans-serif;padding:24px">Loading your resume…</p>';
    setOpeningResumeId(resume.resumeId);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/students/me/resume/${resume.resumeId}/file`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const raw = await response.text();
        let detail = raw;
        try {
          const parsed = raw ? JSON.parse(raw) : {};
          detail = parsed.message || parsed.detail || raw;
        } catch {
          // Preserve a plain-text backend response.
        }
        throw new Error(detail || `Resume request failed (${response.status}).`);
      }
      const blob = await response.blob();
      if (!blob.size) throw new Error("The saved PDF is empty.");
      const objectUrl = URL.createObjectURL(blob);
      previewWindow.location.href = objectUrl;
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10 * 60 * 1000);
    } catch (viewError) {
      previewWindow.close();
      setError(viewError.message || "Could not open your saved resume.");
    } finally {
      setOpeningResumeId(null);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!file) { setError("Choose a PDF resume first."); return; }
    if (!file.name.toLowerCase().endsWith(".pdf")) { setError("Only PDF files are supported."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Resume size must be 5 MB or less."); return; }
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const saved = await apiRequest("/students/me/resume", { method: "POST", body: formData });
      setMessage(`${saved.fileName || file.name} was uploaded and stored successfully.`);
      setFile(null);
      formRef.current?.reset();
      await reload();
    } catch (uploadError) {
      setError(uploadError.message || "The resume upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return <DashboardLayout>
    <div className="page-heading"><span className="section-eyebrow">APPLICATION DOCUMENTS</span><h1 className="page-title">Resume library</h1><p className="page-description">Upload a PDF. The file is stored by the backend and its record is saved in MySQL. You can preview any resume saved to your account.</p></div>
    {message && <p role="status" className="status-success">✓ {message}</p>}
    {error && <p role="alert" className="status-error">{error}</p>}
    {previousBrowserFilename && resumes.length === 0 && <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">An earlier version saved only the filename “{previousBrowserFilename}” in your browser. It did not upload the actual PDF. Select the file again below to store it on the server.</p>}
    <form ref={formRef} onSubmit={handleUpload} className="form-panel max-w-3xl">
      <div className="mb-5"><h2 className="text-xl font-bold text-slate-900">Upload a resume</h2><p className="mt-1 text-sm text-slate-500">PDF only · Maximum 5 MB. Uploading a new resume marks it as your default for applications.</p></div>
      <label className="upload-dropzone"><span className="text-3xl">⇧</span><span className="font-semibold text-slate-800">Choose your PDF resume</span><span className="text-sm text-slate-500">Select a file from your computer</span><input type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-3 max-w-full text-sm" /></label>
      {file && <p className="mt-3 text-sm text-slate-600">Selected: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
      <button type="submit" disabled={uploading || !file} className="primary-button mt-5">{uploading ? "Uploading…" : "Upload and save resume"}</button>
    </form>
    <section className="form-panel mt-6 max-w-3xl">
      <div className="mb-4"><h2 className="text-xl font-bold text-slate-900">Saved resumes</h2><p className="mt-1 text-sm text-slate-500">These records are loaded from your signed-in account. Use View PDF to open the actual saved document.</p></div>
      {loading ? <p className="text-sm text-slate-500">Loading resume history…</p> : resumes.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No resumes uploaded yet.</p> : <div className="divide-y divide-slate-100">{resumes.map((resume) => <div key={resume.resumeId} className="flex flex-wrap items-center justify-between gap-3 py-4"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg">📄</span><div><p className="font-semibold text-slate-800">{resume.fileName}</p><p className="text-sm text-slate-500">{resume.uploadedAt ? new Date(resume.uploadedAt).toLocaleString() : "Recently uploaded"}</p></div></div><div className="flex flex-wrap items-center gap-2">{resume.isDefault && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Default resume</span>}<button type="button" onClick={() => handleViewResume(resume)} disabled={openingResumeId === resume.resumeId} className="secondary-button" title="Open the PDF saved for this resume">{openingResumeId === resume.resumeId ? "Opening…" : "View PDF"}</button></div></div>)}</div>}
    </section>
  </DashboardLayout>;
};
export default ResumePage;
