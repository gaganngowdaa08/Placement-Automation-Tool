import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../api/client";
import { homeForRole } from "../../utils/authNavigation";

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const result = await apiRequest("/auth/login", { method: "POST", body: JSON.stringify(form) });
      localStorage.setItem("authToken", result.token);
      localStorage.setItem("authEmail", result.email);
      localStorage.setItem("authRole", result.role);
      navigate(homeForRole(result.role), { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to sign in. Check your details and try again.");
    } finally { setLoading(false); }
  };
  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  return (
    <main className="auth-shell grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <section className="auth-brand-panel hidden flex-col justify-between p-12 text-white lg:flex">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-white">PAT<span className="text-blue-200">.</span></Link>
        <div className="max-w-xl py-12">
          <span className="mb-5 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Placement Automation Tool</span>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">Every placement journey, in one place.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100">A shared workspace for students, colleges, and hiring companies to coordinate placement opportunities.</p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
            {["Student profiles", "College workspace", "Company hiring"].map((item) => <div key={item} className="rounded-xl border border-white/15 bg-white/10 p-3 font-medium">{item}</div>)}
          </div>
        </div>
        <p className="text-sm text-blue-100/80">One platform · Three account types</p>
      </section>
      <section className="flex items-center justify-center bg-slate-50 px-5 py-12 sm:px-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-xl shadow-slate-200/70 sm:p-10">
          <Link to="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">← Back to home</Link>
          <div className="mt-7">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Welcome back</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Sign in to PAT</h2>
            <p className="mt-2 text-base leading-6 text-slate-500">Use the email and password you registered with.</p>
          </div>
          {registered && <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm leading-6 text-emerald-800">Your account has been created. Sign in with the email and password you just registered.</div>}
          {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">{error}</div>}
          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <div><label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputClass} /></div>
            <div><label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={handleChange} placeholder="Your password" className={inputClass} /></div>
            <button disabled={loading} type="submit" className="w-full rounded-xl bg-blue-700 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Signing in…" : "Sign in securely"}</button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-600">New to PAT? <Link to="/register" className="font-bold text-blue-700 hover:underline">Create an account</Link></p>
        </div>
      </section>
    </main>
  );
};
export default LoginPage;
