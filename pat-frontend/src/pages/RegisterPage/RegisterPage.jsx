import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../api/client";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ role: "student", fullName: "", phoneNumber: "", email: "", password: "", confirmPassword: "", organizationName: "", organizationDescription: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault(); setError("");
    if (form.password !== form.confirmPassword) { setError("The passwords do not match."); return; }
    if (form.password.length < 8) { setError("Use a password with at least 8 characters."); return; }
    if (form.role !== "student" && !form.organizationName.trim()) { setError("Enter the college or company name."); return; }
    setLoading(true);
    try {
      const payload = { fullName: form.fullName.trim(), phoneNumber: form.phoneNumber.trim(), email: form.email.trim(), password: form.password, role: form.role, organizationName: form.organizationName.trim(), organizationDescription: form.organizationDescription.trim() };
      const result = await apiRequest("/auth/register", { method: "POST", body: JSON.stringify(payload) });
      ["authToken", "authEmail", "authRole"].forEach((key) => localStorage.removeItem(key));
      navigate(`/login?registered=1&role=${encodeURIComponent(result.role || form.role)}`, { replace: true });
    } catch (requestError) { setError(requestError.message || "Unable to create an account. Please try again."); }
    finally { setLoading(false); }
  };
  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
  const roleLabel = form.role === "student" ? "Student" : form.role === "college" ? "College / institution" : "Company / employer";

  return (
    <main className="auth-shell grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <section className="auth-brand-panel hidden flex-col justify-between p-12 text-white lg:flex">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-white">PAT<span className="text-blue-200">.</span></Link>
        <div className="max-w-xl py-12"><span className="mb-5 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Get started</span><h1 className="text-5xl font-extrabold leading-tight tracking-tight">Build a more connected placement process.</h1><p className="mt-6 max-w-lg text-lg leading-8 text-blue-100">Choose the account that describes you. Your workspace will be tailored to your role.</p><div className="mt-8 space-y-3 text-sm text-blue-50"><p>✓ Students manage academics and applications</p><p>✓ Colleges maintain an institution profile</p><p>✓ Companies publish placement opportunities</p></div></div>
        <p className="text-sm text-blue-100/80">One platform · Three account types</p>
      </section>
      <section className="flex items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">
        <div className="my-auto w-full max-w-xl rounded-3xl border border-slate-100 bg-white p-7 shadow-xl shadow-slate-200/70 sm:p-9">
          <Link to="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">← Back to home</Link>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-950">Create your account</h2>
          <p className="mt-2 text-base text-slate-500">Start with your account type and contact details.</p>
          {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">{error}</div>}
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div><label htmlFor="role" className="mb-2 block text-sm font-semibold text-slate-700">Register as</label><select id="role" name="role" value={form.role} onChange={handleChange} className={inputClass}><option value="student">Student</option><option value="college">College / Institution</option><option value="company">Company / Employer</option></select></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-slate-700">Contact person / full name</label><input id="fullName" name="fullName" autoComplete="name" required maxLength={120} value={form.fullName} onChange={handleChange} placeholder="Your name" className={inputClass} /></div><div><label htmlFor="phoneNumber" className="mb-2 block text-sm font-semibold text-slate-700">Phone number</label><input id="phoneNumber" name="phoneNumber" type="tel" autoComplete="tel" required maxLength={30} value={form.phoneNumber} onChange={handleChange} placeholder="Contact number" className={inputClass} /></div></div>
            {form.role !== "student" && <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4"><h3 className="mb-4 text-sm font-bold text-slate-800">{roleLabel} details</h3><div className="space-y-4"><div><label htmlFor="organizationName" className="mb-2 block text-sm font-semibold text-slate-700">{form.role === "college" ? "College / institution name" : "Company name"}</label><input id="organizationName" name="organizationName" required maxLength={180} value={form.organizationName} onChange={handleChange} placeholder={form.role === "college" ? "Enter institution name" : "Enter company name"} className={inputClass} /></div><div><label htmlFor="organizationDescription" className="mb-2 block text-sm font-semibold text-slate-700">Description (optional)</label><textarea id="organizationDescription" name="organizationDescription" rows="3" maxLength={2000} value={form.organizationDescription} onChange={handleChange} placeholder="A short description" className={inputClass} /></div></div></div>}
            <div><label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={255} value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputClass} /></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label><input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={form.password} onChange={handleChange} placeholder="At least 8 characters" className={inputClass} /></div><div><label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</label><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" className={inputClass} /></div></div>
            <button disabled={loading} type="submit" className="w-full rounded-xl bg-blue-700 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creating account…" : `Create ${roleLabel.toLowerCase()} account`}</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">Already registered? <Link to="/login" className="font-bold text-blue-700 hover:underline">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
};
export default RegisterPage;
