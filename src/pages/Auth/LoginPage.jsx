import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Boxes,
  Database,
  Eye,
  EyeOff,
  FileJson,
  GitBranch,
  Lock,
  Mail,
  Sparkles,
  Users,
} from "lucide-react";
import { getAccessToken, setTokens } from "../../lib/authStorage.js";
import { login } from "../../api/auth.js";
import { useSessionStore } from "../../store/useSessionStore.js";

const FEATURES = [
  { icon: Database, title: "ERD Whiteboard", desc: "Visual database design with drag & drop" },
  { icon: FileJson, title: "API Documentation", desc: "Swagger / Postman style API docs" },
  { icon: Users, title: "Real-time Collab", desc: "Work together with your team live" },
  { icon: GitBranch, title: "Activity Feed", desc: "Track every change across projects" },
];

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useSessionStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);

  if (getAccessToken()) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await login({ email, password });
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      setUser(data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error ?? t("auth.signIn.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh">
      {/* Left side — branding + features */}
      <div className="relative hidden w-[52%] overflow-hidden bg-zinc-950 lg:flex lg:flex-col lg:justify-between">
        {/* Animated gradient mesh */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-teal-500/[0.07] blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.05] blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/[0.04] blur-3xl" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjAuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-60" />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
          {/* Logo */}
          <div className="mb-12 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-xl shadow-teal-500/25">
              <Boxes className="h-6 w-6 text-white" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">DBForge</h1>
              <p className="text-xs font-medium text-zinc-500">Database Design Platform</p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="max-w-md text-4xl font-extrabold leading-[1.15] tracking-tight text-white xl:text-5xl">
            Design databases.{" "}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Document APIs.
            </span>{" "}
            Collaborate.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-400">
            The all-in-one workspace for teams building data-driven applications.
            ERD whiteboard, API docs, real-time collaboration.
          </p>

          {/* Feature grid */}
          <div className="mt-10 grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm transition-all duration-300 hover:border-teal-500/20 hover:bg-white/[0.04]"
              >
                <f.icon className="mb-2.5 h-5 w-5 text-teal-400 transition-transform duration-300 group-hover:scale-110" />
                <p className="text-sm font-semibold text-zinc-200">{f.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 border-t border-white/[0.06] px-12 py-6 xl:px-16">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 shrink-0 text-teal-400" />
            <p className="text-xs text-zinc-500">
              Trusted by development teams for database modeling and API documentation
            </p>
          </div>
        </div>
      </div>

      {/* Right side — login form */}
      <div className="relative flex flex-1 flex-col justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        {/* Subtle decorative elements */}
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-teal-100/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-cyan-100/20 blur-3xl" />

        {/* Mobile logo */}
        <div className="absolute left-6 top-6 flex items-center gap-2.5 lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-600/20">
            <Boxes className="h-4 w-4 text-white" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">DBForge</span>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[420px] px-6 py-12 sm:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {t("auth.signIn.title")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {t("auth.signIn.subtitle")}
            </p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            {/* Email field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                {t("auth.signIn.email")}
              </label>
              <div className={`flex items-center gap-2.5 rounded-2xl border bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm transition-all duration-200 ${focused === "email" ? "border-teal-400 ring-4 ring-teal-500/10 shadow-teal-600/5" : "border-slate-200/80 hover:border-slate-300"}`}>
                <Mail className={`h-4 w-4 shrink-0 transition-colors ${focused === "email" ? "text-teal-500" : "text-slate-400"}`} />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  placeholder="you@company.com"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  {t("auth.signIn.password")}
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs font-semibold text-teal-600 transition-colors hover:text-teal-500"
                >
                  {t("auth.signIn.forgot")}
                </Link>
              </div>
              <div className={`flex items-center gap-2.5 rounded-2xl border bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm transition-all duration-200 ${focused === "password" ? "border-teal-400 ring-4 ring-teal-500/10 shadow-teal-600/5" : "border-slate-200/80 hover:border-slate-300"}`}>
                <Lock className={`h-4 w-4 shrink-0 transition-colors ${focused === "password" ? "text-teal-500" : "text-slate-400"}`} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0 rounded-lg p-0.5 text-slate-400 transition-colors hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error ? (
              <div className="flex items-center gap-2.5 rounded-2xl bg-red-50/80 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200/60">
                <div className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                {error}
              </div>
            ) : null}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-teal-600 via-teal-600 to-cyan-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-teal-600/25 transition-all duration-200 hover:shadow-2xl hover:shadow-teal-600/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              )}
              {loading ? t("auth.signIn.submitting") : t("auth.signIn.submit")}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200/80" />
            <span className="text-xs font-medium text-slate-400">{t("auth.signIn.noAccount")}</span>
            <span className="h-px flex-1 bg-slate-200/80" />
          </div>

          {/* Register CTA */}
          <div className="mt-6 text-center">
            <Link
              to="/auth/register"
              className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/60 px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-md active:scale-[0.98]"
            >
              {t("auth.signIn.createOne")}
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
